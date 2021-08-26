import { JSBI, Pair, Percent } from '@partyswap-libs/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPrimary, ButtonEmpty } from '../Button'

import { useColor } from '../../hooks/useColor'

import Card, { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'

export const FixedHeightRow = styled(RowBetween)`
  /* height: 24px; */
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: 1px solid ${({ theme }) => theme.bg6};
  position: relative;
  overflow: hidden;
  padding: 0;
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
  .poolsGrid-item-grid p:nth-child(1) {
    color: ${({ theme }) => theme.text6};
  }
  .poolsGrid-item-table span {
    display: flex;
    align-items: center;
    line-height: 1;
  }
  @media (max-width: 550px) {
    [class*='-item-header'] {
      grid-template-columns: 2.5rem auto;
      gap: 0.5rem;
    }
    [class*='-item-header'] h4 {
      font-size: 1rem;
    }
    [class*='-item-header'] img {
      width: 20px;
      height: 20px;
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

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <GreyCard border={border}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={500} fontSize={16}>
                  Your position
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Text fontWeight={500} fontSize={20}>
                  {currency0.symbol}/{currency1.symbol}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={500} fontSize={20}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px">
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  Your pool share:
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  {currency0.symbol}:
                </Text>
                {token0Deposited ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                      {token0Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  {currency1.symbol}:
                </Text>
                {token1Deposited ? (
                  <RowFixed>
                    <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                      {token1Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      ) : (
        <LightCard>
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            <span role="img" aria-label="wizard-icon">
              🎉
            </span>{' '}
            By adding liquidity you&apos;ll earn 0.3% of all trades on this pair proportional to your share of the pool.
            Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </TYPE.subHeader>
        </LightCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(true)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor} className="poolsGrid-item">
      <div className="poolsGrid-item-content">
        <AutoColumn gap="1.5rem">
          <FixedHeightRow>
            <div className="poolsGrid-item-header">
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={false} size={32} />
              <h4>{!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}</h4>
            </div>

            <RowFixed gap="8px">
              <ButtonEmpty
                padding="6px 8px"
                borderRadius="12px"
                width="fit-content"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? (
                  <>
                    <small>Collapse</small>
                    <ChevronUp size="20" style={{ marginLeft: '0.5rem' }} />
                  </>
                ) : (
                  <>
                    <small>Expand</small>
                    <ChevronDown size="20" style={{ marginLeft: '0.5rem' }} />
                  </>
                )}
              </ButtonEmpty>
            </RowFixed>
          </FixedHeightRow>

          {showMore && (
            <AutoColumn gap="1.5rem">
              <div className="poolsGrid-item-table">
                <p>
                  Pooled {currency1.symbol}:
                  <span>
                    {token0Deposited ? (
                      <>
                        {token0Deposited?.toSignificant(6)}
                        <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                      </>
                    ) : (
                      '-'
                    )}
                  </span>
                </p>
                <p>
                  Pooled {currency0.symbol}:
                  <span>
                    {token1Deposited ? (
                      <>
                        {token1Deposited?.toSignificant(6)}
                        <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                      </>
                    ) : (
                      '-'
                    )}
                  </span>
                </p>
              </div>
              <div className="poolsGrid-item-grid">
                <div>
                  <p>Your pool tokens</p>
                  <p>{userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}</p>
                </div>
                <div>
                  <p>Your pool share</p>
                  <p>{poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}</p>
                </div>
              </div>

              <RowBetween>
                <ButtonPrimary
                  padding="0.75rem"
                  as={Link}
                  to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                  width="48%"
                >
                  Add
                </ButtonPrimary>
                <ButtonPrimary
                  padding="0.75rem"
                  as={Link}
                  width="48%"
                  to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                >
                  Remove
                </ButtonPrimary>
              </RowBetween>
            </AutoColumn>
          )}
        </AutoColumn>
      </div>
    </StyledPositionCard>
  )
}
