import React from 'react'
import styled from 'styled-components'
import bonnie from '../../assets/svg/home-hero-bonnie.svg'
import trent from '../../assets/svg/home-hero-trent.svg'

const Wrapper = styled.div`
  width: 100%;
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

      <div className="infoGrid">
        <div className="infoGrid-container">
          <div className="infoGrid-item"></div>
          <div className="infoGrid-item"></div>
          <div className="infoGrid-item"></div>
        </div>
      </div>
    </Wrapper>
  )
}
