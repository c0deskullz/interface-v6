import React from 'react'
import styled from 'styled-components'
import bonnie from '../../assets/svg/home-hero-bonnie.svg'
import trent from '../../assets/svg/home-hero-trent.svg'
import bannerBackground from '../../assets/svg/home-banner-background.svg'
import bannerPipo from '../../assets/svg/home-banner-pipo.svg'
import BannerPiñata1 from '../../assets/svg/home-banner-piñata-1.svg'
import BannerPiñata2 from '../../assets/svg/home-banner-piñata-2.svg'
import BannerPiñata3 from '../../assets/svg/home-banner-piñata-3.svg'

const Wrapper = styled.div`
  width: 100vw;
  margin-top: -2rem;
  @media (min-width: 720px) {
    margin-top: -100px;
  }
`

export default function Home() {
  return (
    <Wrapper>
      <div className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <p className="smallText">Welcome to the Party</p>
            <h1>The most reliable Avalanche swap yet</h1>
            <a href="#" className="btn hero-btn">
              Unlock Wallet
            </a>
            {/* <a href="#" className="btn btn-secondary">
            Unlock Wallet
          </a> */}
          </div>
        </div>
        <img src={bonnie} alt="Bonnie" className="hero-img hero-img-bonnie" />
        <img src={trent} alt="Trent" className="hero-img hero-img-trent" />
      </div>

      <div className="grid">
        <div className="grid-container">
          <div className="grid-item"></div>
          <div className="grid-item"></div>
          <div className="grid-item grid-banner">
            <div className="grid-banner-content">
              <p className="smallText">Stake and earn</p>
              <h2 className="h1">
                Earn up to 300% <br /> APR in piñatas
              </h2>
              <a href="#pool" className="btn">
                Stake Now!
              </a>
            </div>
            <img src={bannerBackground} alt="Banner background" className="grid-banner-background" />
            <img src={bannerPipo} alt="Banner Pipo" className="grid-banner-pipo" />
            <img src={BannerPiñata1} alt="Banner Piñata" className="grid-banner-1" />
            <img src={BannerPiñata2} alt="Banner Piñata" className="grid-banner-2" />
            <img src={BannerPiñata3} alt="Banner Piñata" className="grid-banner-3" />
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
