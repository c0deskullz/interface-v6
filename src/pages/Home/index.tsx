import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, JSBI, Token, TokenAmount, WAVAX } from '@partyswap-libs/sdk'
import { utils } from 'ethers'
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { infoClient } from '../../apollo/client'
import { GET_BUNDLE_DATA, GET_FACTORY_DATA, GET_TOKEN_DATA } from '../../apollo/queries'
import FarmsIcon from '../../assets/svg/grid-item-header-farms-staking.svg'
import StatsIcon from '../../assets/svg/grid-item-header-stats.svg'
import BannerBackground from '../../assets/svg/home-banner-background.svg'
import BannerPipoDark from '../../assets/svg/home-banner-pipo-dark.svg'
import BannerPipo from '../../assets/svg/home-banner-pipo.svg'
import BannerPiñata1 from '../../assets/svg/home-banner-piñata-1.svg'
import BannerPiñata2 from '../../assets/svg/home-banner-piñata-2.svg'
import BannerPiñata3 from '../../assets/svg/home-banner-piñata-3.svg'
import BannerPiñataDark1 from '../../assets/svg/home-banner-piñata-dark-1.svg'
import BannerPiñataDark2 from '../../assets/svg/home-banner-piñata-dark-2.svg'
import BannerPiñataDark3 from '../../assets/svg/home-banner-piñata-dark-3.svg'
import BonnieDark from '../../assets/svg/home-hero-bonnie-dark.svg'
import Bonnie from '../../assets/svg/home-hero-bonnie.svg'
import TrentDark from '../../assets/svg/home-hero-trent-dark.svg'
import Trent from '../../assets/svg/home-hero-trent.svg'
import { ButtonTertiary } from '../../components/Button'
import { WithLockedValue } from '../../components/WithLockedValue'
import { ANALYTICS_PAGE, JACUZZI_ADDRESS, PARTY, USDT } from '../../constants'
import { usePair } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { usePartyContract } from '../../hooks/useContract'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useTotalPartyEarned } from '../../state/stake/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'

const Wrapper = styled.div`
  width: 100vw;
  background-color: ${({ theme }) => theme.surface3};
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
  @media (max-width: 768px) {
    .grid-item-farms {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`

const ButtonWrapper = styled.a`
  &,
  &:hover {
    display: block;
    width: fit-content;
    text-decoration: none;
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

const toTokenAmount = (token: Token, value: number | string) =>
  new TokenAmount(token, utils.parseUnits(String(value).substring(0, token.decimals + 1), token.decimals).toString())

const useAnalyticsData = () => {
  const [
    { id, pairCount, totalVolumeETH, totalVolumeUSD, totalLiquidityETH, totalLiquidityUSD },
    setAnalyticsData
  ] = useState<{
    id: string
    pairCount: number
    totalVolumeUSD: number
    totalVolumeETH: string
    totalLiquidityUSD: string
    totalLiquidityETH: string
  }>({
    id: '',
    pairCount: 0,
    totalVolumeETH: '0',
    totalVolumeUSD: 0,
    totalLiquidityETH: '0',
    totalLiquidityUSD: '0'
  })

  useEffect(() => {
    queryAnalyticsData(setAnalyticsData)
  }, [])

  return { id, pairCount, totalVolumeETH, totalVolumeUSD, totalLiquidityETH, totalLiquidityUSD }
}

const queryBundleData = async (callback: (params: any) => void) => {
  const { data } = await infoClient.query({
    query: GET_BUNDLE_DATA
  })

  callback(data?.bundles[0])
  return data?.bundles[0]
}

const useBundleData = () => {
  const [{ ethPrice }, setBundleData] = useState<{ ethPrice: string }>({ ethPrice: '0' })

  useEffect(() => {
    queryBundleData(setBundleData)
  }, [])

  return { ethPrice }
}

const queryTokenData = async (token: Token, callback: (params: any) => void) => {
  const { data } = await infoClient.query({
    query: GET_TOKEN_DATA,
    variables: {
      address: token.address.toLowerCase()
    }
  })
  callback(data.token || { derivedETH: '1' })
  return data
}

const useTokenData = (token: Token) => {
  const [{ derivedETH }, setTokenData] = useState<{ derivedETH: string }>({ derivedETH: '' })

  useEffect(() => {
    queryTokenData(token, setTokenData)
  }, [token])

  return { derivedETH }
}

const useJacuzziInfo = () => {
  const { chainId } = useActiveWeb3React()
  const partyContract = usePartyContract()
  const { ethPrice } = useBundleData()
  const { derivedETH } = useTokenData(PARTY[chainId ? chainId : ChainId.AVALANCHE])
  const [jacuzziBalance, setJacuzziBalance] = useState<BigNumber>()
  const [{ totalPartyInJacuzzi, totalPartyInJacuzziWAVAX, totalPartyInJacuzziUSD }, setJacuzziInfo] = useState<{
    totalPartyInJacuzzi: TokenAmount
    totalPartyInJacuzziWAVAX: TokenAmount
    totalPartyInJacuzziUSD: TokenAmount
  }>({
    totalPartyInJacuzzi: new TokenAmount(PARTY[chainId ? chainId : ChainId.AVALANCHE], '0'),
    totalPartyInJacuzziWAVAX: new TokenAmount(WAVAX[chainId ? chainId : ChainId.AVALANCHE], '0'),
    totalPartyInJacuzziUSD: new TokenAmount(USDT[chainId ? chainId : ChainId.AVALANCHE], '0')
  })

  const getJacuzziBalance = useCallback(
    async (callback: (params: any) => void) => {
      const jacuzziBalance = await partyContract?.balanceOf(JACUZZI_ADDRESS[43114])
      callback(jacuzziBalance)
      return jacuzziBalance
    },
    [partyContract]
  )

  useEffect(() => {
    partyContract && getJacuzziBalance(setJacuzziBalance)
  }, [partyContract, getJacuzziBalance])

  useEffect(() => {
    if (ethPrice && derivedETH && jacuzziBalance) {
      const derivedETHBN = utils.parseUnits(derivedETH.substring(0, 6), 6)
      const ethPriceBN = utils.parseUnits(ethPrice.substring(0, 6), 6)
      const totalPartyInJacuzzi = new TokenAmount(
        PARTY[chainId ? chainId : ChainId.AVALANCHE],
        jacuzziBalance.toString()
      )
      const totalPartyInJacuzziWAVAX = new TokenAmount(
        WAVAX[chainId ? chainId : ChainId.AVALANCHE],
        jacuzziBalance
          .mul(derivedETHBN)
          .div(BigNumber.from('10').pow('6'))
          .toString()
      )
      const totalPartyInJacuzziUSD = new TokenAmount(
        USDT[chainId ? chainId : ChainId.AVALANCHE],
        jacuzziBalance
          .mul(derivedETHBN)
          .mul(ethPriceBN)
          .div(BigNumber.from('10').pow('24'))
          .toString()
      )

      setJacuzziInfo({
        totalPartyInJacuzzi,
        totalPartyInJacuzziWAVAX,
        totalPartyInJacuzziUSD
      })
    }
  }, [ethPrice, derivedETH, jacuzziBalance, chainId])

  return { totalPartyInJacuzzi, totalPartyInJacuzziWAVAX, totalPartyInJacuzziUSD }
}

const useTotalValueLocked = () => {
  const { chainId } = useActiveWeb3React()
  const { totalLiquidityUSD } = useAnalyticsData()
  const { totalPartyInJacuzziUSD } = useJacuzziInfo()
  const [{ totalValueLockedUSD }, setTotalValueLocked] = useState<{
    totalValueLockedUSD: TokenAmount
  }>({
    totalValueLockedUSD: new TokenAmount(USDT[chainId ? chainId : ChainId.AVALANCHE], '0')
  })

  useEffect(() => {
    if (!totalPartyInJacuzziUSD || !totalLiquidityUSD || !chainId) return

    const totalValueLockedStaking = toTokenAmount(USDT[chainId || ChainId.AVALANCHE], totalLiquidityUSD)
    const totalValueLockedUSD = totalValueLockedStaking.add(totalPartyInJacuzziUSD)

    setTotalValueLocked({ totalValueLockedUSD })
  }, [chainId, totalLiquidityUSD, totalPartyInJacuzziUSD])

  return { totalValueLockedUSD }
}

const usePartyTotalSupply = () => {
  const { chainId } = useActiveWeb3React()
  const partyContract = usePartyContract()

  const getTotalSupply = useCallback(
    async (callback: (params: any) => void) => {
      const totalSupply = await partyContract?.totalSupply()
      const tokenAmmount = new TokenAmount(PARTY[chainId ? chainId : ChainId.AVALANCHE], totalSupply)
      callback(tokenAmmount)
    },
    [partyContract, chainId]
  )

  const [totalSupply, setTotalSupply] = useState<TokenAmount>()

  useEffect(() => {
    getTotalSupply(setTotalSupply)
  }, [getTotalSupply])

  return totalSupply
}

export default function Home() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  const isDarkMode = useIsDarkMode()
  const party = chainId ? PARTY[chainId] : undefined

  const wavax = WAVAX[chainId ? chainId : ChainId.AVALANCHE]

  const totalSupply = usePartyTotalSupply()
  const partyBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, party)
  const partyToClaim: TokenAmount | undefined = useTotalPartyEarned()
  const oneToken = JSBI.BigInt(1000000000000000000)
  const [, avaxPartyTokenPair] = usePair(wavax, party)
  let partyPrice: Number | undefined
  if (avaxPartyTokenPair && party) {
    const reserve =
      avaxPartyTokenPair.reserveOf(party).raw.toString() === '0'
        ? JSBI.BigInt(1)
        : avaxPartyTokenPair.reserveOf(party).raw
    const avaxPartyRatio = JSBI.divide(JSBI.multiply(oneToken, avaxPartyTokenPair.reserveOf(wavax).raw), reserve)
    partyPrice = JSBI.toNumber(avaxPartyRatio) / 1000000000000000000
  }
  const avaxInWallet = +(partyBalance?.toFixed(1) || 0) * (partyPrice ? +partyPrice : 0)
  const avaxToClaim = +(partyToClaim?.toFixed(1) || 0) * (partyPrice ? +partyPrice : 0)
  const {
    // totalVolumeETH, totalVolumeUSD,
    totalLiquidityETH,
    totalLiquidityUSD
  } = useAnalyticsData()
  const { totalPartyInJacuzzi, totalPartyInJacuzziUSD } = useJacuzziInfo()
  const { totalValueLockedUSD } = useTotalValueLocked()

  const totalLiquidityUSDFormatted = toTokenAmount(USDT[chainId ? chainId : ChainId.AVALANCHE], totalLiquidityUSD)
  const totalLiquidityAVAXFormatted = toTokenAmount(WAVAX[chainId ? chainId : ChainId.AVALANCHE], totalLiquidityETH)

  return (
    <Wrapper>
      <Hero className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <p className="smallText">Welcome to the Party</p>
            <h1>The most reliable Avalanche swap yet</h1>
            {account ? (
              <Link to="/party/1">
                <button className="btn">Let's hit some piñatas</button>
              </Link>
            ) : (
              <button className="btn hero-btn" onClick={toggleWalletModal}>
                Unlock Wallet
              </button>
            )}
          </div>
        </div>

        <img src={isDarkMode ? BonnieDark : Bonnie} alt="Bonnie" className="hero-img hero-img-bonnie" />
        <img src={isDarkMode ? TrentDark : Trent} alt="Trent" className="hero-img hero-img-trent" />
      </Hero>

      <div className="grid">
        <div className="grid-container">
          <GridItem className="grid-item">
            <div className="grid-item-header">
              <img src={FarmsIcon} alt="Farms & Staking icon" />
              <div>
                <h4>Farms & Staking</h4>
                <p>Gains since the party started.</p>
              </div>
            </div>
            <div className="grid-item-farms">
              <div>
                <p>PARTY to Claim</p>
                <WithLockedValue>
                  <p> {partyToClaim?.toFixed(4, { groupSeparator: ',' })} </p>
                  <small>~{avaxToClaim.toFixed(3)} AVAX</small>{' '}
                </WithLockedValue>
              </div>
              <div>
                <p>PARTY in Wallet</p>
                <WithLockedValue>
                  <p>{partyBalance?.toFixed(4, { groupSeparator: ',' })}</p>
                  <small>~{avaxInWallet.toFixed(3)} AVAX</small>
                </WithLockedValue>
              </div>
            </div>
            <p style={{ marginTop: 'auto' }}>
              {account ? (
                <Link to="/party/1">
                  <button className="btn">Claim All</button>
                </Link>
              ) : (
                <button className="btn" onClick={toggleWalletModal}>
                  Unlock Wallet
                </button>
              )}
            </p>
          </GridItem>
          <GridItem className="grid-item">
            <div className="grid-item-header">
              <img src={StatsIcon} alt="Stats and analytics icon" />
              <div>
                <h4>Party Stats</h4>
                <p>Party Analytics in a nutshell.</p>
              </div>
            </div>
            <div className="grid-item-stats">
              <p>
                Total PARTY Supply <span>{totalSupply?.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
              {/* <p>
                Total Volume in AVAX (24h) <span>{(+totalVolumeETH).toFixed(2)}</span>
              </p>
              <p>
                Total Volume in USD (24h) <span>{(+totalVolumeUSD).toFixed(2)}</span>
              </p> */}
              <p>
                Total Liquidity (AVAX Value){' '}
                <span>{totalLiquidityAVAXFormatted.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
              <p>
                Total Liquidity (USD Value)<span>{totalLiquidityUSDFormatted.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
              <p>
                Total PARTY in Jacuzzi <span>{totalPartyInJacuzzi.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
              <p>
                Total PARTY in Jacuzzi (USD Value){' '}
                <span>{totalPartyInJacuzziUSD.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
              <p>
                Total Value Locked (USD Value) <span>{totalValueLockedUSD.toFixed(2, { groupSeparator: ',' })}</span>
              </p>
            </div>
            <p>
              <ButtonWrapper href={ANALYTICS_PAGE} target="_blank" rel="noopener noreferrer">
                <ButtonTertiary>Check Analytics</ButtonTertiary>
              </ButtonWrapper>
            </p>
          </GridItem>
          <GridItem className="grid-item grid-banner">
            <div className="grid-banner-content">
              <p className="smallText">Stake and earn</p>
              <h2>
                Start earning $PARTY <br /> in our piñatas section!
              </h2>
              <a href="#party/1" className="btn">
                Stake Now!
              </a>
            </div>
            <img src={BannerBackground} alt="Banner background" className="grid-banner-background" />
            <img src={isDarkMode ? BannerPipoDark : BannerPipo} alt="Banner Pipo" className="grid-banner-pipo" />
            <img src={isDarkMode ? BannerPiñataDark1 : BannerPiñata1} alt="Banner Piñata" className="grid-banner-1" />
            <img src={isDarkMode ? BannerPiñataDark2 : BannerPiñata2} alt="Banner Piñata" className="grid-banner-2" />
            <img src={isDarkMode ? BannerPiñataDark3 : BannerPiñata3} alt="Banner Piñata" className="grid-banner-3" />
          </GridItem>
        </div>
      </div>
    </Wrapper>
  )
}
