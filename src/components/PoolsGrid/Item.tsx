import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ReactComponent as ArrowDown } from '../../assets/svg/arrow-down.svg'
import { ReactComponent as BadgeSVG } from '../../assets/svg/badge.svg'
import { ReactComponent as ExternalLinkSVG } from '../../assets/svg/external-link.svg'
import { StakingInfo } from '../../state/stake/hooks'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ChainId, Fraction, JSBI } from '@partyswap-libs/sdk'
import PinataLogo from '../PinataLogo'
import { StyledInternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { useActiveWeb3React } from '../../hooks'

const Item = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  [class*='-item-header'] h4 {
    color: ${({ theme }) => theme.text1};
  }
  .poolsGrid-item-header-features span {
    background-color: ${({ theme }) => theme.primaryText2};
    border: 2px solid ${({ theme }) => theme.primaryText2};
  }
  .poolsGrid-item-header-features span:nth-child(1) {
    color: ${({ theme }) => theme.primaryText2};
    border-color: ${({ theme }) => theme.primaryText2};
    background-color: transparent;
  }
  .poolsGrid-item-grid p:nth-child(1) {
    color: ${({ theme }) => theme.text6};
  }
  .grid-item-details {
    background-color: ${({ theme }) => theme.surface5};
  }
  .grid-item-details-btn {
    color: ${({ theme }) => theme.primaryText3};
  }
  .grid-item-details-btn svg {
    fill: ${({ theme }) => theme.primaryText3};
  }
  .grid-item-details .poolsGrid-item-table span {
    color: ${({ theme }) => theme.text1};
  }
  .grid-item-details .poolsGrid-item-table a {
    color: ${({ theme }) => theme.primaryText3};
  }
`

const ExtLink = styled(ExternalLinkSVG)`
  margin-left: 0.125em;
`

const BadgeIcon = styled(BadgeSVG)`
  margin-right: 0.125em;
`
export default function PoolsGridItem({
  stakingInfo,
  version,
  apr,
  onClickClaim
}: {
  stakingInfo: StakingInfo
  version: string
  apr: string
  onClickClaim: (stakingInfo: StakingInfo) => void
}) {
  const { chainId } = useActiveWeb3React()
  const {
    tokens,
    stakedAmount,
    totalRewardRate,
    totalStakedInWavax,
    earnedAmount,
    multiplier,
    stakingRewardAddress
  } = stakingInfo
  const avascanUrl = useMemo(() => {
    if (chainId === ChainId.FUJI) {
      return 'https://cchain.explorer.avax-test.network/address/' + stakingRewardAddress
    }

    return 'https://cchain.explorer.avax.network/address/' + stakingRewardAddress
  }, [stakingRewardAddress, chainId])
  const token0 = tokens[0]
  const token1 = tokens[1]

  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  let weeklyRewardAmount = totalRewardRate.multiply(JSBI.BigInt(60 * 60 * 24 * 7))
  let weeklyRewardPerAvax = weeklyRewardAmount.divide(totalStakedInWavax)
  if (JSBI.EQ(weeklyRewardPerAvax.denominator, 0)) {
    weeklyRewardPerAvax = new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
  }

  const isStaking = Boolean(stakedAmount.greaterThan('0'))
  return (
    <Item className="poolsGrid-item">
      <div className="poolsGrid-item-content">
        <div className="poolsGrid-item-header">
          <PinataLogo pinataSymbol={`${currency0.symbol}-${currency1.symbol}`} />
          <div>
            <h4>{`${currency0.symbol}/${currency1.symbol}`}</h4>
            <div className="poolsGrid-item-header-features">
              <span>
                <BadgeIcon /> Core
              </span>
              <span>{multiplier?.toString()}X</span>
            </div>
          </div>
        </div>
        <div className="poolsGrid-item-table">
          <p>
            APR: <span>{apr}%</span>
          </p>
          <p>
            Earn: <span>YAY</span>
          </p>
        </div>
        <div className="poolsGrid-item-grid">
          <div>
            <p>YAY earned</p>
            <p>{earnedAmount.toFixed(0, { groupSeparator: ',' })}</p>
          </div>
          <div>
            <button className="btn" onClick={() => onClickClaim(stakingInfo)}>
              Claim
            </button>
          </div>
        </div>
        <StyledInternalLink to={`/yay/${currencyId(currency0)}/${currencyId(currency1)}/${version}`}>
          <button className="btn btn-secondary">{isStaking ? 'Manage' : 'Deposit'}</button>
        </StyledInternalLink>
      </div>
      <div className="grid-item-details">
        <details>
          <summary>
            <span className="grid-item-details-btn">
              Details
              <ArrowDown />
            </span>
          </summary>
          <div className="poolsGrid-item-table">
            <p>
              Get LP tokens: <span>{`${currency0.symbol}-${currency1.symbol}`} LP</span>
            </p>
            <p>
              Total Staked In Wavax:{' '}
              <span>{`${totalStakedInWavax.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}</span>
            </p>
            <a href={avascanUrl} target="_blank" rel="noopener noreferrer">
              View Contract <ExtLink />
            </a>
          </div>
        </details>
      </div>
    </Item>
  )
}
