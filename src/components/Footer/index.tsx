/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import styled from 'styled-components'
import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import SupportImage from '../../assets/svg/footer-support.svg'
import IconTwitter from '../../assets/svg/ico-twitter.svg'
import IconDiscord from '../../assets/svg/ico-discord.svg'
import IconTelegram from '../../assets/svg/ico-telegram.svg'
import IconMedium from '../../assets/svg/ico-medium.svg'

const LogoFooter = styled(Logo)`
  height: 2rem;
  width: auto;
`

export default function Footer() {
  return (
    <>
      <div className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <LogoFooter />
            <p>The most reliable Avalanche swap yet</p>
            <img src={SupportImage} alt="" className="footer-section-support" />
          </div>
          <div className="footer-section footer-social">
            <h4>Follow Us!</h4>
            <div className="footer-social-container">
              <a href="https://twitter.com/partyswapdex" target="_blank" rel="noopener noreferrer">
                <img src={IconTwitter} className="socialIcon twitter" alt="" />
              </a>
              <a href="https://partyswap-ex.medium.com/" target="_blank" rel="noopener noreferrer">
                <img src={IconDiscord} className="socialIcon medium" alt="" />
              </a>
              <a href="https://t.me/partyswap" target="_blank" rel="noopener noreferrer">
                <img src={IconTelegram} className="socialIcon telegram" alt="" />
              </a>
              <a href="https://discord.com/invite/r9fTvqCfBw" target="_blank" rel="noopener noreferrer">
                <img src={IconMedium} className="socialIcon discord" alt="" />
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <ul>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">GitHub</a>
              </li>
              <li>
                <a href="#">Documentation</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-copyright">
          <p>© 2021 PartySwap · All Rights Reserved</p>
        </div>
      </div>
    </>
  )
}
