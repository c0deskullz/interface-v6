import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE, StyledInternalLink } from '../../theme'
import { JSBI, Fraction } from '@partyswap-libs/sdk'
import { ButtonPrimary } from '../Button'
import { StakingInfo } from '../../state/stake/hooks'
// import { useColor } from '../../hooks/useColor'
import { currencyId } from '../../utils/currencyId'
import { Break } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import PinataLogo from '../PinataLogo'
// import useUSDCPrice from '../../utils/useUSDCPrice'
// import { PARTY } from '../../constants'

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
   display: none;
 `};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 1.25rem;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: auto;
  background: ${({ bgColor }) => bgColor};
  color: ${({ theme }) => theme.text1} !important;
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 4rem auto;
  grid-gap: 2rem;
  gap: 2rem;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
     grid-template-columns: 48px 1fr 96px;
   `};
  .topRightSection {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`

// const APR = styled.div`
//   display: flex;
//   justify-content: flex-end;
// `

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  z-index: 1;
`

export default function PoolCard({
  stakingInfo,
  version,
  apr
}: {
  stakingInfo: StakingInfo
  version: string
  apr: string
}) {
  const { tokens, stakedAmount, totalRewardRate, totalStakedInWavax, rewardRate, earnedAmount } = stakingInfo
  const token0 = tokens[0]
  const token1 = tokens[1]

  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  const isStaking = Boolean(stakedAmount.greaterThan('0'))

  // const avaxPool = currency0 === CAVAX || currency1 === CAVAX
  // let token: Token
  // if (avaxPool) {
  //   token = currency0 === CAVAX ? token1 : token0
  // } else {
  //   token = token0.equals(PARTY[token0.chainId]) ? token1 : token0
  // }
  // let valueOfTotalStakedAmountInUSDC: CurrencyAmount | undefined

  // let usdToken: Token
  // const USDPrice = useUSDCPrice(usdToken)
  // valueOfTotalStakedAmountInUSDC =
  // valueOfTotalStakedAmountInWavax && USDPrice?.quote(valueOfTotalStakedAmountInWavax)
  let weeklyRewardAmount = totalRewardRate.multiply(JSBI.BigInt(60 * 60 * 24 * 7))
  let weeklyRewardPerAvax = weeklyRewardAmount.divide(totalStakedInWavax)
  if (JSBI.EQ(weeklyRewardPerAvax.denominator, 0)) {
    weeklyRewardPerAvax = new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
  }

  return (
    <Wrapper showBackground={isStaking} bgColor="#FFF">
      <TopSection>
        <PinataLogo pinataSymbol={`${currency0.symbol}-${currency1.symbol}`} />
        <div className="topRightSection">
          <TYPE.main fontWeight={600} fontSize={24} style={{ marginLeft: '8px' }}>
            {currency0.symbol}-{currency1.symbol}
          </TYPE.main>
          <StyledInternalLink to={`/party/${currencyId(currency0)}/${currencyId(currency1)}/${version}`}>
            <ButtonPrimary padding="8px" borderRadius="8px">
              {isStaking ? 'Manage' : 'Deposit'}
            </ButtonPrimary>
          </StyledInternalLink>
        </div>
      </TopSection>

      <StatContainer>
        <RowBetween>
          <TYPE.main> Total deposited</TYPE.main>
          <TYPE.main>
            {`${totalStakedInWavax.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}
            {/* {valueOfTotalStakedAmountInUSDC
							? `$${valueOfTotalStakedAmountInUSDC.toFixed(0, { groupSeparator: ',' })}`
							: `${valueOfTotalStakedAmountInWavax?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`} */}
          </TYPE.main>
        </RowBetween>
        <RowBetween>
          <TYPE.main> Pool rate </TYPE.main>
          <TYPE.main>{`${weeklyRewardAmount.toFixed(0, { groupSeparator: ',' })} PARTY / week`}</TYPE.main>
        </RowBetween>
        <RowBetween>
          <TYPE.main> Current reward </TYPE.main>
          <TYPE.main>{`${weeklyRewardPerAvax.toFixed(4, { groupSeparator: ',' }) ??
            '-'} PARTY / Week per AVAX`}</TYPE.main>
        </RowBetween>
        <RowBetween>
          <TYPE.main> Earn up to (yearly) </TYPE.main>
          <TYPE.main>{`${apr}%`}</TYPE.main>
        </RowBetween>
        <RowBetween>
          <TYPE.main> Earned </TYPE.main>
          <TYPE.main>{earnedAmount.toFixed(0, { groupSeparator: ',' })}</TYPE.main>
        </RowBetween>
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>Your rate</span>
            </TYPE.black>

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                🎉
              </span>
              {`${rewardRate?.multiply(`${60 * 60 * 24 * 7}`)?.toSignificant(4, { groupSeparator: ',' })} PARTY / week`}
            </TYPE.black>
          </BottomSection>
        </>
      )}
    </Wrapper>
  )
}
