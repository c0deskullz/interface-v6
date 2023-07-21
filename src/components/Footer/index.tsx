/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import styled from 'styled-components'


import { ReactComponent as IconTwitter } from '../../assets/svg/ico-twitter.svg'

import { ReactComponent as IconTelegram } from '../../assets/svg/ico-telegram.svg'
import { ReactComponent as IconCoinMarketCap } from '../../assets/svg/ico-coinmarketcap.svg'


const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.surface2};
  a svg {
    color: ${({ theme }) => theme.surface2};
  }
`



export default function Footer() {


  return (
    <>
      <Wrapper className="footer">
        <div className="footer-container">


          <div className="footer-section footer-social">
            <h4>Follow Us!</h4>
            <div className="footer-social-container">
              <a href="https://twitter.com/SquidChainERC20" target="_blank" rel="noopener noreferrer">
                <IconTwitter className="socialIcon twitter" />
              </a>

              <a href="https://t.me/squidchain_ERC20" target="_blank" rel="noopener noreferrer">
                <IconTelegram className="socialIcon telegram" />
              </a>
              <a href="http://squidchain.xyz" target="_blank" rel="noopener noreferrer">
                <IconCoinMarketCap className="socialIcon CoinMarketCap" />
              </a>
            </div>
          </div>


        </div>
        <div className="footer-copyright">
          <p>© 2023 squidchain · All Rights Reserved</p>
        </div>
      </Wrapper>
    </>
  )
}
