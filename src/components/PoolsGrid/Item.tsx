import React from 'react'
import styled from 'styled-components'
import { ReactComponent as PoolIcon } from '../../assets/svg/AVAX-YAY.svg'
import { ReactComponent as ArrowDown } from '../../assets/svg/arrow-down.svg'
import { ReactComponent as BadgeSVG } from '../../assets/svg/badge.svg'
import { ReactComponent as ExternalLinkSVG } from '../../assets/svg/external-link.svg'

const ExtLink = styled(ExternalLinkSVG)`
  margin-left: 0.125em;
`

const BadgeIcon = styled(BadgeSVG)`
  margin-right: 0.125em;
`
export default function PoolsGridItem() {
  return (
    <>
      <div className="poolsGrid-item">
        <div className="poolsGrid-item-content">
          <div className="poolsGrid-item-header">
            <PoolIcon />
            <div>
              <h4>YAY/AVAX</h4>
              <div className="poolsGrid-item-header-features">
                <span>
                  <BadgeIcon /> Core
                </span>
                <span>40X</span>
              </div>
            </div>
          </div>
          <div className="poolsGrid-item-table">
            <p>
              APR: <span>500.00%</span>
            </p>
            <p>
              Earn: <span>YAY</span>
            </p>
          </div>
          <div className="poolsGrid-item-grid">
            <div>
              <p>YAY earned</p>
              <p>0.000</p>
            </div>
            <div>
              <button className="btn">Claim</button>
            </div>
          </div>
          <button className="btn btn-secondary">Unlock Wallet</button>
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
                Get LP tokens: <span>YAY-AVAX LP</span>
              </p>
              <p>
                Withdrawal Fee: <span>2.56%</span>
              </p>
              <p>
                Total Liquidity: <span>$643,936</span>
              </p>
              <a href="https://avascan.info/">
                View Contract <ExtLink />
              </a>
            </div>
          </details>
        </div>
      </div>
    </>
  )
}
