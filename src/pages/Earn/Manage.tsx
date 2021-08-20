import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { JSBI, TokenAmount, CAVAX, Token, WAVAX } from '@partyswap-libs/sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { ButtonPrimary, ButtonEmpty } from '../../components/Button'
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
import { BIG_INT_ZERO, YAY } from '../../constants'

import pattern from '../../assets/svg/swap-pattern.svg'
import patternDarkMode from '../../assets/svg/swap-pattern-dark.svg'
import { useIsDarkMode } from '../../state/user/hooks'

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
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
     flex-direction: column;
     gap: 12px;
   `};
`

export default function Manage({
  match: {
    params: { currencyIdA, currencyIdB, version }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; version: string }>) {
  const { account, chainId } = useActiveWeb3React()

  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdB)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfo = useStakingInfo(Number(version), stakingTokenPair)?.[0]

  const avaxPool = currencyA === CAVAX || currencyB === CAVAX

  let valueOfTotalStakedAmountInWavax: TokenAmount | undefined
  // let valueOfTotalStakedAmountInUSDC: CurrencyAmount | undefined
  let backgroundColor: string
  let token: Token | undefined
  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo?.stakedAmount?.token)
  const [, avaxYayTokenPair] = usePair(CAVAX, YAY[chainId ? chainId : 43114])
  // let usdToken: Token | undefined
  if (avaxPool) {
    token = currencyA === CAVAX ? tokenB : tokenA
    const wavax = currencyA === CAVAX ? tokenA : tokenB

    // let returnOverMonth: Percent = new Percent('0')
    if (totalSupplyOfStakingToken && stakingTokenPair && wavax) {
      // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
      valueOfTotalStakedAmountInWavax = new TokenAmount(
        wavax,
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(stakingInfo.totalStakedAmount.raw, stakingTokenPair.reserveOf(wavax).raw),
            JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          totalSupplyOfStakingToken.raw
        )
      )
    }

    // get the USD value of staked wavax
    // usdToken = wavax
  } else {
    var yay
    if (tokenA && tokenA.equals(YAY[tokenA.chainId])) {
      token = tokenB
      yay = tokenA
    } else {
      token = tokenA
      yay = tokenB
    }

    if (totalSupplyOfStakingToken && stakingTokenPair && avaxYayTokenPair && tokenB && yay) {
      const oneToken = JSBI.BigInt(1000000000000000000)
      const avaxYayRatio = JSBI.divide(
        JSBI.multiply(oneToken, avaxYayTokenPair.reserveOf(WAVAX[tokenB.chainId]).raw),
        avaxYayTokenPair.reserveOf(yay).raw
      )

      const valueOfYayInAvax = JSBI.divide(JSBI.multiply(stakingTokenPair.reserveOf(yay).raw, avaxYayRatio), oneToken)

      valueOfTotalStakedAmountInWavax = new TokenAmount(
        WAVAX[tokenB.chainId],
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(stakingInfo.totalStakedAmount.raw, valueOfYayInAvax),
            JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          totalSupplyOfStakingToken.raw
        )
      )
    }
    // usdToken = yay
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
      <PageContent gap="lg" justify="center">
        <RowBetween style={{ gap: '24px' }}>
          <TYPE.mediumHeader style={{ margin: 0 }}>
            {currencyA?.symbol}-{currencyB?.symbol} Liquidity Mining
          </TYPE.mediumHeader>
          <DoubleCurrencyLogo currency0={currencyA ?? undefined} currency1={currencyB ?? undefined} size={24} />
        </RowBetween>

        <DataRow style={{ gap: '24px' }}>
          <PoolData>
            <AutoColumn gap="sm">
              <TYPE.body style={{ margin: 0 }}>Total Staked</TYPE.body>
              <TYPE.body fontSize={24} fontWeight={500}>
                {`${valueOfTotalStakedAmountInWavax?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}
                {/* {valueOfTotalStakedAmountInUSDC
							? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
							: `${valueOfTotalStakedAmountInWavax?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`} */}
              </TYPE.body>
            </AutoColumn>
          </PoolData>
          <PoolData>
            <AutoColumn gap="sm">
              <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
              <TYPE.body fontSize={24} fontWeight={500}>
                {stakingInfo?.totalRewardRate
                  ?.multiply((60 * 60 * 24 * 7).toString())
                  ?.toFixed(0, { groupSeparator: ',' }) ?? '-'}
                {' YAY / week'}
              </TYPE.body>
            </AutoColumn>
          </PoolData>
        </DataRow>

        {showAddLiquidityButton && (
          <VoteCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Step 1. Get Party Liquidity tokens (xYAY)</TYPE.white>
                </RowBetween>
                <RowBetween style={{ marginBottom: '1rem' }}>
                  <TYPE.white fontSize={14}>
                    {`xYAY tokens are required. Once you've added liquidity to the ${currencyA?.symbol}-${currencyB?.symbol} pool you can stake your liquidity tokens on this page.`}
                  </TYPE.white>
                </RowBetween>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width={'fit-content'}
                  as={Link}
                  to={`/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`}
                >
                  {`Add ${currencyA?.symbol}-${currencyB?.symbol} liquidity`}
                </ButtonPrimary>
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </VoteCard>
        )}

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

        <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
          <BottomSection gap="lg" justify="center">
            <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
              <CardSection>
                <CardBGImage desaturate />
                <CardNoise />
                <AutoColumn gap="md">
                  <RowBetween>
                    <TYPE.white fontWeight={600}>Your liquidity deposits</TYPE.white>
                  </RowBetween>
                  <RowBetween style={{ alignItems: 'baseline' }}>
                    <TYPE.white fontSize={36} fontWeight={600}>
                      {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                    </TYPE.white>
                    <TYPE.white>
                      xYAY {currencyA?.symbol}-{currencyB?.symbol}
                    </TYPE.white>
                  </RowBetween>
                </AutoColumn>
              </CardSection>
            </StyledDataCard>
            <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="sm">
                <RowBetween>
                  <div>
                    <TYPE.black>Your unclaimed YAY</TYPE.black>
                  </div>
                  {stakingInfo?.earnedAmount && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmount?.raw) && (
                    <ButtonEmpty
                      padding="8px"
                      borderRadius="8px"
                      width="fit-content"
                      onClick={() => setShowClaimRewardModal(true)}
                    >
                      Claim
                    </ButtonEmpty>
                  )}
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
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
                  <TYPE.black fontSize={16} fontWeight={500}>
                    <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                      ⚡
                    </span>
                    {stakingInfo?.rewardRate
                      ?.multiply((60 * 60 * 24 * 7).toString())
                      ?.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
                    {' YAY / week'}
                  </TYPE.black>
                </RowBetween>
              </AutoColumn>
            </StyledBottomCard>
          </BottomSection>
          <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              ⭐️
            </span>
            When you withdraw, the contract will automagically claim YAY on your behalf!
          </TYPE.main>

          {!showAddLiquidityButton && (
            <DataRow style={{ marginBottom: '1rem' }}>
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit xYAY Tokens'}
              </ButtonPrimary>

              {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
                <>
                  <ButtonPrimary
                    padding="8px"
                    borderRadius="8px"
                    width="160px"
                    onClick={() => setShowUnstakingModal(true)}
                  >
                    Withdraw
                  </ButtonPrimary>
                </>
              )}
            </DataRow>
          )}
          {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
            <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} xYAY tokens available</TYPE.main>
          )}
        </PositionInfo>
      </PageContent>
    </PageWrapper>
  )
}
