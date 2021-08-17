import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import bonnie from '../../assets/svg/home-hero-bonnie.svg'
import trent from '../../assets/svg/home-hero-trent.svg'
import iconFarms from '../../assets/svg/grid-item-header-farms-staking.svg'
import iconStats from '../../assets/svg/grid-item-header-stats.svg'
import bannerBackground from '../../assets/svg/home-banner-background.svg'
import bannerPipo from '../../assets/svg/home-banner-pipo.svg'
import BannerPiñata1 from '../../assets/svg/home-banner-piñata-1.svg'
import BannerPiñata2 from '../../assets/svg/home-banner-piñata-2.svg'
import BannerPiñata3 from '../../assets/svg/home-banner-piñata-3.svg'
import { useIsDarkMode } from '../../state/user/hooks'
import { ChainId, JSBI, TokenAmount, WAVAX } from '@partyswap-libs/sdk'
import { useTotalYayEarned } from '../../state/stake/hooks'
import { usePair } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { ANALYTICS_PAGE, YAY } from '../../constants'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Link } from 'react-router-dom'
import { infoClient } from '../../apollo/client'
import { GET_FACTORY_DATA } from '../../apollo/queries'
import { useYayContract } from '../../hooks/useContract'

const Wrapper = styled.div`
  width: 100vw;
  margin-top: -2rem;
  background-color: ${({ theme }) => theme.surface3};

  @media (min-width: 720px) {
    margin-top: -100px;
  }
`

const Hero = styled.div`
  background: ${({ theme }) => theme.gradient1};
`

const GridItem = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  .grid-item-header h4,
  .grid-item-header p {
    color: ${({ theme }) => theme.text1};
  }
  .grid-item-header p {
    opacity: 0.8;
  }
  .grid-item-stats span,
  .grid-item-farms p:nth-child(1) {
    color: ${({ theme }) => theme.text6};
  }
  &.grid-banner {
    background-color: ${({ theme }) => theme.surface4};
    background: ${({ theme }) => theme.gradient2};
  }
`

const queryAnalyticsData = async (callback: (params: any) => void) => {
  const { data } = await infoClient.query({
    query: GET_FACTORY_DATA,
    variables: {
      first: 1
    }
  })

  callback(data?.partyswapFactories[0])
  return data?.partyswapFactories[0]
}

const useAnalyticsData = () => {
  const [{ id, pairCount, totalVolumeETH, totalVolumeUSD }, setAnalyticsData] = useState<{
    id: string
    pairCount: number
    totalVolumeUSD: number
    totalVolumeETH: string
  }>({
    id: '',
    pairCount: 0,
    totalVolumeETH: '0',
    totalVolumeUSD: 0
  })

  useEffect(() => {
    queryAnalyticsData(setAnalyticsData)
  }, [])

  return { id, pairCount, totalVolumeETH, totalVolumeUSD }
}

const useYayTotalSupply = () => {
  const yayContract = useYayContract()

  const getTotalSupply = async (callback: (params: any) => void) => {
    const totalSupply = await yayContract?.totalSupply()
    const tokenAmmount = new TokenAmount(YAY[ChainId.AVALANCHE], totalSupply)
    callback(tokenAmmount)
  }

  const [totalSupply, setTotalSupply] = useState<TokenAmount>()

  useEffect(() => {
    getTotalSupply(setTotalSupply)
  }, [yayContract])

  return totalSupply
}

export default function Home() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  const isDarkMode = useIsDarkMode()
  const yay = chainId ? YAY[chainId] : undefined

  const wavax = WAVAX[chainId ? chainId : ChainId.FUJI]

  const totalSupply = useYayTotalSupply()
  const yayBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, yay)
  const yayToClaim: TokenAmount | undefined = useTotalYayEarned()
  const oneToken = JSBI.BigInt(1000000000000000000)
  const [, avaxYayTokenPair] = usePair(wavax, yay)
  let yayPrice: Number | undefined
  if (avaxYayTokenPair && yay) {
    const reserve =
      avaxYayTokenPair.reserveOf(yay).raw.toString() === '0' ? JSBI.BigInt(1) : avaxYayTokenPair.reserveOf(yay).raw
    const avaxYayRatio = JSBI.divide(JSBI.multiply(oneToken, avaxYayTokenPair.reserveOf(wavax).raw), reserve)
    yayPrice = JSBI.toNumber(avaxYayRatio) / 1000000000000000000
  }
  const avaxInWallet = +(yayBalance?.toFixed(1) || 0) * (yayPrice ? +yayPrice : 0)
  const avaxToClaim = +(yayToClaim?.toFixed(1) || 0) * (yayPrice ? +yayPrice : 0)
  const { totalVolumeETH, totalVolumeUSD } = useAnalyticsData()

  return (
    <Wrapper>
      <Hero className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <p className="smallText">Welcome to the Party</p>
            <h1>The most reliable Avalanchche swap yet</h1>
            {account ? (
              <Link to="/yay/1">
                <button className="btn">Let's Hit Some Piñatas</button>
              </Link>
            ) : (
              <button className="btn hero-btn" onClick={toggleWalletModal}>
                Unlock Wallet
              </button>
            )}
          </div>
        </div>

        <img src={isDarkMode ? bonnie : bonnie} alt="Bonnie" className="hero-img hero-img-bonnie" />

        <img src={trent} alt="Trent" className="hero-img hero-img-trent" />
      </Hero>

      <div className="grid">
        <div className="grid-container">
          <GridItem className="grid-item">
            <div className="grid-item-header">
              <img src={iconFarms} alt="Farms & Staking icon" />
              <div>
                <h4>Farms & Staking</h4>
                <p>Gains since the party started.</p>
              </div>
            </div>
            <div className="grid-item-farms">
              <div>
                <p>YAY to Claim</p>
                <p> {yayToClaim?.toFixed(4, { groupSeparator: ',' })} </p>
                <small>~{avaxToClaim.toFixed(3)} AVAX</small>
              </div>
              <div>
                <p>YAY in Wallet</p>
                <p>{yayBalance?.toFixed(4, { groupSeparator: ',' })}</p>
                <small>~{avaxInWallet.toFixed(3)} AVAX</small>
              </div>
            </div>
            <p>
              <Link to="/yay/1">
                <button className="btn">Claim All</button>
              </Link>
            </p>
          </GridItem>
          <GridItem className="grid-item">
            <div className="grid-item-header">
              <img src={iconStats} alt="Stats and analytics icon" />
              <div>
                <h4>Party Stats</h4>
                <p>Party Analytics in a nutshell.</p>
              </div>
            </div>
            <div className="grid-item-stats">
              <p>
                Total YAY Supply <span>$YAY {totalSupply?.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
              <p>
                Total Volume in AVAX <span>{totalVolumeETH}</span>
              </p>
              <p>
                Total Volume in USD <span>{totalVolumeUSD}</span>
              </p>
            </div>
            <p>
              <a href={ANALYTICS_PAGE} target="_blank" rel="noopener noreferrer" className="btn">
                Check Analytics
              </a>
            </p>
          </GridItem>
          <GridItem className="grid-item grid-banner">
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
          </GridItem>
        </div>
      </div>
    </Wrapper>
  )
}
