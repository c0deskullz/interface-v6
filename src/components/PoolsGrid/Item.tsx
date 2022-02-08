import { Fraction, JSBI } from '@partyswap-libs/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ReactComponent as ArrowDown } from '../../assets/svg/arrow-down.svg'
import { ReactComponent as BadgeSVG } from '../../assets/svg/badge.svg'
import { ReactComponent as ExternalLinkSVG } from '../../assets/svg/external-link.svg'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { StakingInfo } from '../../state/stake/hooks'
import { StyledInternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { useSnowtraceUrl } from '../../utils/useSnowtraceUrl'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import PinataLogo from '../PinataLogo'
import { WithLockedValue } from '../WithLockedValue'

const Item = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  [class*='-item-header'] h4 {
    color: ${({ theme }) => theme.text1};
    word-break: break-all;
    span {
      display: inline-block;
    }
  }
  &.poolsGrid-item.disabled {
    background-color: ${({ theme }) => theme.disabledSurface};
    opacity: 0.77;

    .grid-item-details {
      background-color: ${({ theme }) => theme.disabledSurface};
    }

    .poolsGrid-item-header-features > span {
      background-color: #555555;
    }

    .poolsGrid-item-header-features span:nth-child(1) {
      color: #555555;
      border-color: rgba(85, 85, 85, 0.5);
      background-color: transparent;
    }

    .grid-item-details .grid-item-details-btn {
      color: #555555;
      svg {
        fill: #555555;
      }
    }

    .poolsGrid-item-grid > div > p {
      color: #555555;
    }
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
  .poolsGrid-item-content a:hover {
    text-decoration: none;
  }
  .poolsGrid-item-grid {
    grid-template-columns: 1fr;
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
  const { account } = useActiveWeb3React()
  const {
    tokens,
    stakedAmount,
    totalRewardRate,
    totalStakedInWavax,
    earnedAmount,
    multiplier,
    stakingRewardAddress,
    delisted
  } = stakingInfo
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
  const toggleWalletModal = useWalletModalToggle()

  const pinataCalculatedSymbol = useMemo(() => {
    if (currency0.symbol && currency0.symbol === 'AVAX' && currency1.symbol && currency1.symbol === 'PARTY') {
      return `PARTY/AVAX`
    }

    return (
      <>
        <span>{currency0.symbol}</span>/<span>{currency1.symbol}</span>
      </>
    )
  }, [currency0, currency1])

  const token0Url = useSnowtraceUrl(token0.address)
  const token1Url = useSnowtraceUrl(token1.address)
  const pinataUrl = useSnowtraceUrl(stakingRewardAddress)

  return (
    <Item className={`poolsGrid-item ${multiplier?.toString() === '0' && !delisted && 'disabled'}`}>
      <div className="poolsGrid-item-content">
        <div className="poolsGrid-item-header">
          <PinataLogo
            pinataSymbol={`${currency0.symbol}-${currency1.symbol}`}
            delisted={multiplier?.toString() === '0'}
          />
          <div>
            <h4>{pinataCalculatedSymbol}</h4>
            <div className="poolsGrid-item-header-features">
              {multiplier?.toString() === '0' ? (
                <span> {delisted ? 'Delisted Pool' : 'Soon Available'} </span>
              ) : (
                <span>
                  {' '}
                  <BadgeIcon /> Core{' '}
                </span>
              )}
              {+(multiplier?.toString() || '0') >= 30 && <span>Boosted</span>}
            </div>
          </div>
        </div>
        <div className="poolsGrid-item-table">
          <p>APR: {multiplier?.toString() === '0' ? <span>0%</span> : <span>{apr}%</span>}</p>
          <p>
            Earn: <span>PARTY</span>
          </p>
        </div>
        <div className="poolsGrid-item-grid">
          <div>
            <p>PARTY earned</p>
            <WithLockedValue>
              <p>{earnedAmount.toFixed(0, { groupSeparator: ',' })}</p>
            </WithLockedValue>
          </div>
          {/* <div>
            <button
              className="btn"
              onClick={() => onClickClaim(stakingInfo)}
              disabled={!account || !earnedAmount.greaterThan('0')}
            >
              Claim
            </button>
          </div> */}
        </div>
        {account ? (
          <StyledInternalLink
            to={`/party/${currencyId(currency0)}/${currencyId(currency1)}/${version}/${
              version === '1' ? false : multiplier?.toString() === '0'
            }`}
          >
            {isStaking ? (
              <button className="btn">Manage</button>
            ) : (
              multiplier?.toString() !== '0' && <button className="btn btn-secondary">Deposit</button>
            )}
          </StyledInternalLink>
        ) : (
          <button className="btn hero-btn" onClick={toggleWalletModal}>
            Unlock Wallet
          </button>
        )}
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
              Total Staked In WAVAX:{' '}
              <span>{`${totalStakedInWavax.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}</span>
            </p>
            <a href={token0Url} target="_blank" rel="noopener noreferrer">
              View {token0.symbol} Contract <ExtLink />
            </a>
            <a href={token1Url} target="_blank" rel="noopener noreferrer">
              View {token1.symbol} Contract <ExtLink />
            </a>
            <a href={pinataUrl} target="_blank" rel="noopener noreferrer">
              View Piñata Contract <ExtLink />
            </a>
          </div>
        </details>
      </div>
    </Item>
  )
}
