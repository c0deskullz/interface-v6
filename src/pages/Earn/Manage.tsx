import React, { useCallback, useState, useMemo, useContext } from 'react'
import { AutoColumn } from '../../components/Column'
import styled, { ThemeContext } from 'styled-components'
import { Link } from 'react-router-dom'

import { JSBI, TokenAmount, CAVAX, Token, WAVAX, ChainId } from '@partyswap-libs/sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { DataCard } from '../../components/earn/styled'
import { ButtonPrimary } from '../../components/Button'
import StakingModal from '../../components/earn/StakingModal'
import { useStakingInfo } from '../../state/stake/hooks'
import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'

import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { currencyId } from '../../utils/currencyId'
import { useTotalSupply } from '../../data/TotalSupply'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
// import useUSDCPrice from '../../utils/useUSDCPrice'
import { BIG_INT_ZERO, PARTY, USDT } from '../../constants'

import pattern from '../../assets/svg/swap-pattern.svg'
import patternDarkMode from '../../assets/svg/swap-pattern-dark.svg'
import { useIsDarkMode } from '../../state/user/hooks'
import { AlertTriangle } from 'react-feather'

const PageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 6rem 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 2rem 1rem;
  `};
`

const PageContent = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.surface4};
  border: 1px solid ${({ theme }) => theme.bg6};
  position: relative;
  .poolsGrid-item-content {
    padding: 2rem;
  }
  [class*='-item-header'] {
    align-items: center;
    gap: 1rem;
  }
  [class*='-item-header'] h4 {
    color: ${({ theme }) => theme.text1};
    margin-bottom: 0;
  }
  .poolsGrid-item-grid {
    border: 1px solid;
  }
  .poolsGrid-item-grid p:nth-child(1) {
    color: ${({ theme }) => theme.text6};
  }
  .poolsGrid-item-table span {
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .grid-item-accent {
    background-color: ${({ theme }) => theme.surface5};
    border: 1px solid ${({ theme }) => theme.bg7};
    border-radius: 1.25rem;
    padding: 1rem;
  }
  @media (max-width: 550px) {
    [class*='-item-header'] h4 {
      font-size: 1.25rem;
    }
    [class*='-item-header'] img {
      width: 2rem;
      height: 2rem;
    }
    .poolsGrid-item-content {
      padding: 1.5rem;
    }
    .poolsGrid-item-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
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

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  width: 100%;
  position: relative;
  gap: 1rem;
  .accent {
    color: ${({ theme }) => theme.text6};
    font-weight: 900;
    font-size: 0.935rem;
    text-transform: uppercase;
  }
  @media (min-width: 768px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background-color: ${({ theme }) => theme.surface5};
  background: ${({ theme }) => theme.surface5};
  border: 2px solid ${({ theme }) => theme.bg7};
  border-radius: 1.25rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  align-items: baseline;
  p {
    margin-bottom: 0;
  }
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background-color: ${({ theme }) => theme.surface5};
  background: ${({ theme }) => theme.surface5};
  border: 2px solid ${({ theme }) => theme.bg7};
  border-radius: 1.25rem;
  padding: 1rem;
`
const StyledWarning = styled.div`
  display: grid;
  gap: 1rem;
  @media (min-width: 768px) {
    gap: 1.5rem;
    grid-template-columns: 24px auto;
  }
`

const Warning = () => {
  const theme = useContext(ThemeContext)

  return (
    <StyledWarning className="grid-item-accent">
      <AlertTriangle size={24} style={{ marginRight: '8px', minWidth: 24 }} color={theme.primaryText2} />
      <TYPE.body color={theme.text7}>
        This pair is currently not generating rewards. Therefore, we recommend removing liquidity and add it to another
        pair that is distributing $PARTY!
      </TYPE.body>
    </StyledWarning>
  )
}

const BusdDisclaimer = () => {
  const theme = useContext(ThemeContext)

  return (
    <StyledWarning className="grid-item-accent">
      <AlertTriangle size={24} style={{ marginRight: '8px', minWidth: 24 }} color={theme.primaryText2} />
      <TYPE.body color={theme.text7}>
        This pool is using a{' '}
        <a
          style={{
            color: theme.primaryText2
          }}
          href="https://anyswap.exchange/#/bridge?bridgetoken=0x9610b01aaa57ec026001f7ec5cface51bfea0ba6"
          target="_blank"
          rel="noopener noreferrer"
        >
          BUSD token address that you can obtain at AnySwap
        </a>
        .
      </TYPE.body>
    </StyledWarning>
  )
}

export default function Manage({
  match: {
    params: { currencyIdA, currencyIdB, version, delisted }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; version: string; delisted: string }>) {
  const { account, chainId } = useActiveWeb3React()

  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const showBusdDisclaimer = useMemo<boolean>(() => {
    if (
      tokenA &&
      tokenB &&
      (tokenA.address === '0x9610b01AAa57Ec026001F7Ec5CFace51BfEA0bA6' ||
        tokenB.address === '0x9610b01AAa57Ec026001F7Ec5CFace51BfEA0bA6')
    ) {
      return true
    }

    return false
  }, [tokenA, tokenB])

  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfos = useStakingInfo(Number(version), stakingTokenPair)
  const stakingInfo = delisted === 'true' ? stakingInfos?.[1] : stakingInfos?.[0]

  const rewardRate = useMemo(() => {
    if (stakingInfo) {
      if (stakingInfo.multiplier?.toString() === '0') {
        return '0'
      }

      return (
        stakingInfo?.totalRewardRate?.multiply((60 * 60 * 24 * 7).toString())?.toFixed(0, { groupSeparator: ',' }) ??
        '-'
      )
    }

    return '-'
  }, [stakingInfo])

  const avaxPool = currencyA === CAVAX || currencyB === CAVAX
  const partyPool =
    tokenA &&
    tokenB &&
    (tokenA?.equals(PARTY[tokenA?.chainId || ChainId.AVALANCHE]) ||
      tokenB?.equals(PARTY[tokenB?.chainId || ChainId.AVALANCHE]))
  const stablePool =
    tokenA &&
    tokenB &&
    (tokenA?.equals(USDT[tokenA?.chainId || ChainId.AVALANCHE]) ||
      tokenB?.equals(USDT[tokenB?.chainId || ChainId.AVALANCHE]))

  let valueOfTotalStakedAmountInWavax: TokenAmount | undefined
  // let valueOfTotalStakedAmountInUSDC: CurrencyAmount | undefined
  let backgroundColor: string
  let token: Token | undefined
  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo?.stakedAmount?.token)
  const [, avaxPartyTokenPair] = usePair(CAVAX, PARTY[chainId ? chainId : 43114])
  const [, avaxStableTokenPair] = usePair(CAVAX, USDT[chainId ? chainId : 43114])
  // let usdToken: Token | undefined
  if (avaxPool) {
    token = currencyA === CAVAX ? tokenB : tokenA
    const wavax = currencyA === CAVAX ? tokenA : tokenB

    // let returnOverMonth: Percent = new Percent('0')
    if (totalSupplyOfStakingToken && stakingTokenPair && wavax) {
      // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
      valueOfTotalStakedAmountInWavax = totalSupplyOfStakingToken?.greaterThan('0')
        ? new TokenAmount(
            wavax,
            JSBI.divide(
              JSBI.multiply(
                JSBI.multiply(
                  stakingInfo?.totalStakedAmount.raw || JSBI.BigInt(0),
                  stakingTokenPair.reserveOf(wavax).raw
                ),
                JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
              ),
              totalSupplyOfStakingToken.raw
            )
          )
        : new TokenAmount(wavax, JSBI.BigInt(0))
    }

    // get the USD value of staked wavax
    // usdToken = wavax
  } else if (partyPool) {
    var party
    if (tokenA && tokenA.equals(PARTY[tokenA.chainId])) {
      token = tokenB
      party = tokenA
    } else {
      token = tokenA
      party = tokenB
    }

    if (totalSupplyOfStakingToken && stakingTokenPair && avaxPartyTokenPair && tokenB && party) {
      const oneToken = JSBI.BigInt(1000000000000000000)
      const avaxPartyRatio =
        avaxPartyTokenPair.reserveOf(party).raw.toString() === '0'
          ? JSBI.BigInt(0)
          : JSBI.divide(
              JSBI.multiply(oneToken, avaxPartyTokenPair.reserveOf(WAVAX[tokenB.chainId]).raw),
              avaxPartyTokenPair.reserveOf(party).raw
            )

      const valueOfPartyInAvax = JSBI.divide(
        JSBI.multiply(stakingTokenPair.reserveOf(party).raw, avaxPartyRatio),
        oneToken
      )

      valueOfTotalStakedAmountInWavax = new TokenAmount(
        WAVAX[tokenB.chainId],
        totalSupplyOfStakingToken.raw.toString() === '0'
          ? JSBI.BigInt(0)
          : JSBI.divide(
              JSBI.multiply(
                JSBI.multiply(stakingInfo?.totalStakedAmount.raw || JSBI.BigInt(0), valueOfPartyInAvax),
                JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
              ),
              totalSupplyOfStakingToken.raw
            )
      )
    }
    // usdToken = party
  } else if (stablePool) {
    var stable
    if (tokenA && tokenA.equals(USDT[tokenA.chainId])) {
      token = tokenB
      stable = tokenA
    } else {
      token = tokenA
      stable = tokenB
    }
    if (totalSupplyOfStakingToken && stakingTokenPair && avaxStableTokenPair && tokenB && stable) {
      const oneToken = JSBI.BigInt(1000000000000000000)
      const avaxStableRatio =
        avaxStableTokenPair.reserveOf(stable).raw.toString() === '0'
          ? JSBI.BigInt(0)
          : JSBI.divide(
              JSBI.multiply(oneToken, avaxStableTokenPair.reserveOf(WAVAX[tokenB.chainId]).raw),
              avaxStableTokenPair.reserveOf(stable).raw
            )

      const valueOfStableInAvax = JSBI.divide(
        JSBI.multiply(stakingTokenPair.reserveOf(stable).raw, avaxStableRatio),
        oneToken
      )

      valueOfTotalStakedAmountInWavax = new TokenAmount(
        WAVAX[tokenB.chainId],
        totalSupplyOfStakingToken.raw.toString() === '0'
          ? JSBI.BigInt(0)
          : JSBI.divide(
              JSBI.multiply(
                JSBI.multiply(stakingInfo?.totalStakedAmount.raw || JSBI.BigInt(0), valueOfStableInAvax),
                JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
              ),
              totalSupplyOfStakingToken.raw
            )
      )
    }
  }

  // get the color of the token
  backgroundColor = useColor(token)

  // const USDPrice = useUSDCPrice(usdToken)
  // valueOfTotalStakedAmountInUSDC =
  // 		valueOfTotalStakedAmountInWavax && USDPrice?.quote(valueOfTotalStakedAmountInWavax)

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  // get WAVAX value of staked LP tokens

  // let valueOfTotalStakedAmountInWAVAX: TokenAmount | undefined
  // if (totalSupplyOfStakingToken && stakingTokenPair && stakingInfo && WAVAX) {
  // 	// take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
  // 	valueOfTotalStakedAmountInWAVAX = new TokenAmount(
  // 		WAVAX,
  // 		JSBI.divide(
  // 			JSBI.multiply(
  // 				JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(WAVAX).raw),
  // 				JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the WAVAX they entitle owner to
  // 			),
  // 			totalSupplyOfStakingToken.raw
  // 		)
  // 	)
  // }

  const countUpAmount = stakingInfo?.earnedAmount?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    console.log(account)
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  const isDarkMode = useIsDarkMode()

  return (
    <PageWrapper>
      {isDarkMode ? <BackgroundImage className="darkMode" /> : <BackgroundImage />}

      <PageContent gap="lg" className="poolsGrid-item">
        <div className="poolsGrid-item-content">
          {stakingInfo?.multiplier?.toString() === '0' && <Warning />}
          {showBusdDisclaimer && <BusdDisclaimer />}
          <div className="poolsGrid-item-header">
            <div>
              <DoubleCurrencyLogo currency0={currencyA ?? undefined} currency1={currencyB ?? undefined} size={48} />
            </div>
            <h4>
              {currencyA?.symbol}-{currencyB?.symbol} <br /> Liquidity Mining
            </h4>
          </div>

          <div className="poolsGrid-item-table">
            <p>
              Total Staked:
              <span>{`${valueOfTotalStakedAmountInWavax?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}</span>
            </p>
            <p>
              Pool Rate:
              <span>
                {rewardRate}
                {' PARTY / week'}
              </span>
            </p>
          </div>

          {showAddLiquidityButton && (
            <div className="grid-item-accent">
              <p>Step 1. Get Party Liquidity tokens (xPARTY)</p>
              <p>{`xPARTY tokens are required. Once you've added liquidity to the ${currencyA?.symbol}-${currencyB?.symbol} pool you can stake your liquidity tokens on this page.`}</p>
              <ButtonPrimary
                padding="0.75rem"
                width={'fit-content'}
                as={Link}
                to={`/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`}
              >
                {`Add ${currencyA?.symbol}-${currencyB?.symbol} liquidity`}
              </ButtonPrimary>
            </div>
          )}

          <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
            <BottomSection gap="lg" justify="center">
              <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
                <AutoColumn gap="md">
                  <TYPE.black className="accent">Your liquidity deposits</TYPE.black>
                  <TYPE.largeHeader fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.largeHeader>
                  <p>
                    xPARTY {currencyA?.symbol}-{currencyB?.symbol}
                  </p>
                </AutoColumn>
              </StyledDataCard>
              <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
                <AutoColumn gap="md">
                  <TYPE.black className="accent">Your unclaimed PARTY</TYPE.black>
                  <TYPE.largeHeader fontSize={36} fontWeight={600}>
                    <CountUp
                      key={countUpAmount}
                      isCounting
                      decimalPlaces={4}
                      start={parseFloat(countUpAmountPrevious)}
                      end={parseFloat(countUpAmount)}
                      thousandsSeparator={','}
                      duration={1}
                    />
                  </TYPE.largeHeader>
                  <TYPE.black fontWeight={500}>
                    <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                      🎉
                    </span>
                    {stakingInfo?.rewardRate
                      ?.multiply((60 * 60 * 24 * 7).toString())
                      ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
                    {' PARTY / week'}
                  </TYPE.black>
                  {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                    <ButtonPrimary padding="0.75rem" width="10rem" onClick={() => setShowClaimRewardModal(true)}>
                      Claim
                    </ButtonPrimary>
                  )}
                </AutoColumn>
              </StyledBottomCard>
            </BottomSection>

            <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
              {/* <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
                🎉
              </span> */}
              When you withdraw, the contract will automagically claim PARTY on your behalf!
            </TYPE.main>

            {!showAddLiquidityButton && (
              <RowBetween>
                <>
                  {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? (
                    <ButtonPrimary width="48%" onClick={handleDepositClick}>
                      Deposit
                    </ButtonPrimary>
                  ) : (
                    <ButtonPrimary width="100%" onClick={handleDepositClick}>
                      Deposit xPARTY Tokens
                    </ButtonPrimary>
                  )}
                </>

                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
                  <>
                    <ButtonPrimary width="48%" onClick={() => setShowUnstakingModal(true)}>
                      Withdraw
                    </ButtonPrimary>
                  </>
                )}
              </RowBetween>
            )}
            {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
              <TYPE.subHeader>{userLiquidityUnstaked.toSignificant(6)} xPARTY tokens available</TYPE.subHeader>
            )}
          </PositionInfo>
        </div>

        {stakingInfo && (
          <>
            <StakingModal
              isOpen={showStakingModal}
              onDismiss={() => setShowStakingModal(false)}
              stakingInfo={stakingInfo}
              userLiquidityUnstaked={userLiquidityUnstaked}
            />
            <UnstakingModal
              isOpen={showUnstakingModal}
              onDismiss={() => setShowUnstakingModal(false)}
              stakingInfo={stakingInfo}
            />
            <ClaimRewardModal
              isOpen={showClaimRewardModal}
              onDismiss={() => setShowClaimRewardModal(false)}
              stakingInfo={stakingInfo}
            />
          </>
        )}
      </PageContent>
    </PageWrapper>
  )
}
