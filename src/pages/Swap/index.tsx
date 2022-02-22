import { CurrencyAmount, JSBI, Token, Trade } from '@partyswap-libs/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import BannerImage from '../../assets/images/swap-banner.png'
import imageLeftDark from '../../assets/svg/swap-image-left-dark.svg'
import imageLeft from '../../assets/svg/swap-image-left.svg'
import imageRightDark from '../../assets/svg/swap-image-right-dark.svg'
import imageRight from '../../assets/svg/swap-image-right.svg'
import patternDarkMode from '../../assets/svg/swap-pattern-dark.svg'
import pattern from '../../assets/svg/swap-pattern.svg'
import { ApproveAggregatorToken } from '../../components/ApproveAggregatorToken'
// import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import Loader from '../../components/Loader'
import ProgressSteps from '../../components/ProgressSteps'
import { QuoteAggregatorTokens } from '../../components/QuoteAggregatorTokens'
// import { QuoteAggregatorTokens } from '../../components/QuoteAggregatorTokens'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useAggregatorSwapParams } from '../../hooks/useAggregatorSwapRouter'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENS from '../../hooks/useENS'
import useHandleSwapAggregator from '../../hooks/useHandleSwapAggregator'
import { useQuoteOnAgggregatorTokens } from '../../hooks/useQuoteAggregatorTokens'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
// import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  tryParseAmount,
  useAggregatorRouterAddress,
  // useAggregatorTokenAllowance,
  useCurrenciesAddresses,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
  useTokenIsAvailableInAggregator
  // useTokenIsAvailableInAggregator
} from '../../state/swap/hooks'
import { useExpertModeManager, useIsDarkMode, useUserSlippageTolerance } from '../../state/user/hooks'
import {
  // LinkStyledButton,
  TYPE
} from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import { fromWei } from 'web3-utils'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100vw;
  min-height: 100vh;
  padding-top: 6rem;
  padding-bottom: 6rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 2rem 1rem;
  `};

  .aggregator-actions {
    display: flex;
    align-items: end;

    & > * {
      flex: 1;
      button {
        width: unset;
      }
    }
  }
`

const BackgroundImage = styled.div`
  position: absolute;
  background-color: #f6f6ff;
  background-image: url(${pattern});
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  &.darkMode {
    background-color: #1a1a37;
    background-image: url(${patternDarkMode});
  }
`

const Banner = styled.a<{ show: boolean }>`
  display: ${({ show }) => (show ? 'none' : 'block')};
  max-width: 26.25rem;
  width: 100%;
  z-index: 1;
  margin-top: 2rem;

  img {
    border-radius: 1rem;
  }
`

const TextHeader = styled.div`
  h1 {
    color: ${({ theme }) => theme.text1};
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  p {
    margin-bottom: 0;
  }
`

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()

  // TODO: configure approval with buttons
  // TODO: swap after approval
  // AGGREGATOR
  const aggregatorRouterAddress = useAggregatorRouterAddress()

  const inputToken = useCurrenciesAddresses(currencies.INPUT)
  const outputToken = useCurrenciesAddresses(currencies.OUTPUT)
  const inputIsAvailableInAggregator = useTokenIsAvailableInAggregator(inputToken)
  const outputIsAvailableInAggregator = useTokenIsAvailableInAggregator(outputToken)

  const [useAggregator, setUseAggregator] = useState(false)
  // END AGGREGATOR

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENS(recipient)
  const toggledVersion = useToggledVersion()
  const tradesByVersion = useMemo(
    () => ({
      [Version.v1]: v1Trade,
      [Version.v2]: v2Trade
    }),
    [v1Trade, v2Trade]
  )
  const trade = useMemo(() => (showWrap ? undefined : tradesByVersion[toggledVersion]), [
    showWrap,
    tradesByVersion,
    toggledVersion
  ])
  const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

  const betterTradeLinkVersion: Version | undefined = undefined

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
          },
    [showWrap, parsedAmount, independentField, trade]
  )

  const [aggregatorInputApproval] = useApproveCallback(parsedAmounts?.[Field.INPUT], aggregatorRouterAddress)

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { toTokenAmount, error, protocols, fromToken, formattedInputAmmount, toToken } = useQuoteOnAgggregatorTokens({
    inputTokenAddress: inputToken,
    outputTokenAddress: outputToken,
    parsedAmounts,
    currencies
  })

  const { params: aggregatorParams, error: swapTxDataError } = useAggregatorSwapParams({
    inputAmount: parsedAmounts[Field.INPUT],
    outputAmount: tryParseAmount(toTokenAmount, currencies.OUTPUT),
    slippage: allowedSlippage / 100,
    account
  })

  const aggregatorSwapEstimatedGas = useMemo(() => {
    if (aggregatorParams?.params.length) {
      const { gas, gasPrice } = aggregatorParams.params[0]
      const gasunits = JSBI.BigInt(gas)
      const estimation = JSBI.multiply(gasunits, JSBI.BigInt(gasPrice))
      return {
        avaxFee: fromWei(estimation.toString(), 'ether'),
        gasUnits: gas
      }
    }

    return {
      avaxFee: '0',
      gasUnits: '0'
    }
  }, [aggregatorParams])

  const handleSwapWithAggregator = useHandleSwapAggregator(aggregatorParams)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol, Version.v2].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const isDarkMode = useIsDarkMode()

  return (
    <PageWrapper>
      {isDarkMode ? <BackgroundImage className="darkMode" /> : <BackgroundImage />}

      <img alt="" src={isDarkMode ? imageLeftDark : imageLeft} className="swap-image left" />
      <img alt="" src={isDarkMode ? imageRightDark : imageRight} className="swap-image right" />
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />

      <>
        <AppBody>
          <Wrapper id="swap-page">
            <ConfirmSwapModal
              isOpen={showConfirm}
              trade={trade}
              originalTrade={tradeToConfirm}
              onAcceptChanges={handleAcceptChanges}
              attemptingTxn={attemptingTxn}
              txHash={txHash}
              recipient={recipient}
              allowedSlippage={allowedSlippage}
              onConfirm={handleSwap}
              swapErrorMessage={swapErrorMessage}
              onDismiss={handleConfirmDismiss}
            />
            <AutoColumn gap={'md'}>
              <TextHeader>
                <h1>Exchange</h1>
                <p>Trade tokens in an instant</p>
              </TextHeader>
              <CurrencyInputPanel
                label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
                value={formattedAmounts[Field.INPUT]}
                showMaxButton={!atMaxAmountInput}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                id="swap-currency-input"
              />
              <AutoColumn justify="space-between">
                <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable>
                    <ArrowDown
                      size="16"
                      onClick={() => {
                        setApprovalSubmitted(false) // reset 2 step UI for approvals
                        onSwitchTokens()
                      }}
                      color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                    />
                  </ArrowWrapper>
                  {/* {recipient === null && !showWrap && isExpertMode ? (
                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      + Add a send (optional)
                    </LinkStyledButton>
                  ) : null} */}
                </AutoRow>
              </AutoColumn>
              <CurrencyInputPanel
                value={useAggregator ? toTokenAmount : formattedAmounts[Field.OUTPUT]}
                onUserInput={handleTypeOutput}
                label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
                showMaxButton={false}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                id="swap-currency-output"
              />

              {/* {recipient !== null && !showWrap ? (
                <>
                  <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable={false}>
                      <ArrowDown size="16" color={theme.text2} />
                    </ArrowWrapper>
                    <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                      - Remove send
                    </LinkStyledButton>
                  </AutoRow>
                  <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                </>
              ) : null} */}

              {showWrap || useAggregator ? null : (
                <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                  <AutoColumn gap="4px">
                    {Boolean(trade) && (
                      <RowBetween align="center">
                        <Text fontWeight={500} fontSize={14} color={theme.text2}>
                          Price
                        </Text>
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                      </RowBetween>
                    )}
                    {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                      <RowBetween align="center">
                        <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                          Slippage Tolerance
                        </ClickableText>
                        <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                          {allowedSlippage / 100}%
                        </ClickableText>
                      </RowBetween>
                    )}
                  </AutoColumn>
                </Card>
              )}
            </AutoColumn>

            {/* PARTY SWAP ACTIONS */}
            {!useAggregator && (
              <>
                <BottomGrouping>
                  {!account ? (
                    <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
                  ) : showWrap ? (
                    <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                      {wrapInputError ??
                        (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                    </ButtonPrimary>
                  ) : noRoute && userHasSpecifiedInputOutput ? (
                    <GreyCard style={{ textAlign: 'center' }}>
                      <TYPE.main mb="4px">Insufficient liquidity for this trade.</TYPE.main>
                    </GreyCard>
                  ) : showApproveFlow ? (
                    <RowBetween>
                      <ButtonConfirmed
                        onClick={approveCallback}
                        disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                        width="48%"
                        altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                        confirmed={approval === ApprovalState.APPROVED}
                      >
                        {approval === ApprovalState.PENDING ? (
                          <AutoRow gap="6px" justify="center">
                            Approving <Loader stroke="white" />
                          </AutoRow>
                        ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                          'Approved'
                        ) : (
                          'Approve ' + currencies[Field.INPUT]?.symbol
                        )}
                      </ButtonConfirmed>
                      <ButtonError
                        onClick={() => {
                          if (isExpertMode) {
                            handleSwap()
                          } else {
                            setSwapState({
                              tradeToConfirm: trade,
                              attemptingTxn: false,
                              swapErrorMessage: undefined,
                              showConfirm: true,
                              txHash: undefined
                            })
                          }
                        }}
                        width="48%"
                        id="swap-button"
                        disabled={
                          !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                        }
                        error={isValid && priceImpactSeverity > 2}
                      >
                        <Text fontSize={16} fontWeight={500}>
                          {priceImpactSeverity > 3 && !isExpertMode
                            ? `Price Impact High`
                            : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                        </Text>
                      </ButtonError>
                    </RowBetween>
                  ) : (
                    <ButtonError
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined
                          })
                        }
                      }}
                      id="swap-button"
                      disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                      error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                    >
                      <Text fontSize={20} fontWeight={500}>
                        {swapInputError
                          ? swapInputError
                          : priceImpactSeverity > 3 && !isExpertMode
                          ? `Price Impact Too High`
                          : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                      </Text>
                    </ButtonError>
                  )}
                  {showApproveFlow && (
                    <Column style={{ marginTop: '1rem' }}>
                      <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                    </Column>
                  )}
                  {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                  {betterTradeLinkVersion ? (
                    <BetterTradeLink version={betterTradeLinkVersion} />
                  ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
                    <DefaultVersionLink />
                  ) : null}
                </BottomGrouping>

                <AdvancedSwapDetailsDropdown trade={trade} />
              </>
            )}

            {/* PARTY SWAP ACTIONS */}

            {/* AGGREGATOR QUOTES */}
            {inputIsAvailableInAggregator && outputIsAvailableInAggregator && (
              <QuoteAggregatorTokens
                onSwitchTradeWithAggregator={setUseAggregator}
                useAggregator={useAggregator}
                error={error}
                protocol={protocols?.[0]}
                fromToken={fromToken}
                formattedInputAmmount={formattedInputAmmount}
                estimatedGas={aggregatorSwapEstimatedGas.gasUnits}
                toToken={toToken}
                toTokenAmount={toTokenAmount}
              />
            )}
            {/* AGGREGATOR QUOTES */}
            {/* AGGREGATOR APPROVE */}
            {useAggregator && (
              <div className="aggregator-actions">
                {/* AGGREGATOR APPROVE */}
                <ApproveAggregatorToken
                  currencies={currencies}
                  inputTokenAddress={inputToken}
                  inputAmmout={formattedAmounts[Field.INPUT]}
                  router={aggregatorRouterAddress}
                  onApproved={console.log}
                />
                {aggregatorInputApproval === ApprovalState.APPROVED && parsedAmounts?.[Field.INPUT]?.greaterThan(BigInt(0)) ? (
                  <ButtonError
                    onClick={handleSwapWithAggregator}
                    width="48%"
                    id="swap-button"
                    disabled={!!swapTxDataError}
                    error={!!swapTxDataError}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {!!swapTxDataError ? swapTxDataError.description : 'Swap'}
                    </Text>
                  </ButtonError>
                ) : (
                  <></>
                )}
                {/* AGGREGATOR ACTIONS */}
              </div>
            )}
          </Wrapper>
        </AppBody>
      </>

      <Banner href="#/party/3" show={Boolean(trade)}>
        <img src={BannerImage} alt="Stake GB and earn $PARTY" />
      </Banner>
    </PageWrapper>
  )
}
