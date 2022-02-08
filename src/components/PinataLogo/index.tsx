import React, { useMemo } from 'react'
import styled from 'styled-components'
import {
  AvaxAaBlock,
  AvaxApex,
  AvaxAvme,
  AvaxBag,
  AvaxBenqi,
  AvaxDai,
  AvaxDoge,
  AvaxElk,
  AvaxEth,
  AvaxFraxi,
  AvaxGb,
  AvaxHusky,
  AvaxLink,
  AvaxMim,
  AvaxPefi,
  AvaxPng,
  AvaxSherpa,
  AvaxShibx,
  AvaxSing,
  AvaxSno,
  AvaxSpore,
  AvaxUSDCe,
  AvaxUsdt,
  AvaxWbtc,
  AvaxWolfi,
  AvaxXava,
  AvaxYak,
  AvaxZero,
  PartyAvax,
  PartyDai,
  PartyUsdt,
  UsdtBusd,
  UsdtUsdc
} from '../../assets/images/pinatas'

const ImageContainer = styled.div`
  position: relative;
  height: 62px;
  width: 64px;

  & .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    display: block;
    background: rgba(171, 171, 171, 0.77);
  }
`

interface PinataLogoProps {
  pinataSymbol: string
  delisted?: boolean
}

export default function PinataLogo({ pinataSymbol, delisted }: PinataLogoProps) {
  const pinataLogo = useMemo(() => {
    switch (pinataSymbol) {
      case 'AVAX-PARTY':
        return PartyAvax
      case 'PARTY-AVAX':
        return PartyAvax
      case 'AVAX-aaBLOCK':
        return AvaxAaBlock
      case 'AVAX-AVME':
        return AvaxAvme
      case 'AVAX-BAG':
        return AvaxBag
      case 'AVAX-renDOGE':
        return AvaxDoge
      case 'AVAX-ETH':
        return AvaxEth
      case 'AVAX-WETH.e':
        return AvaxEth
      case 'AVAX-ELK':
        return AvaxElk
      case 'AVAX-FRAX':
        return AvaxFraxi
      case 'AVAX-LINK':
        return AvaxLink
      case 'AVAX-LINK.e':
        return AvaxLink
      case 'AVAX-PEFI':
        return AvaxPefi
      case 'AVAX-PNG':
        return AvaxPng
      case 'AVAX-SNOB':
        return AvaxSno
      case 'AVAX-SPORE':
        return AvaxSpore
      case 'AVAX-WBTC':
        return AvaxWbtc
      case 'AVAX-WBTC.e':
        return AvaxWbtc
      case 'AVAX-XAVA':
        return AvaxXava
      case 'AVAX-ZERO':
        return AvaxZero
      case 'AVAX-SHERPA':
        return AvaxSherpa
      case 'AVAX-USDC.e':
        return AvaxUSDCe
      case 'AVAX-YAK':
        return AvaxYak
      case 'AVAX-USDT.e':
        return AvaxUsdt
      case 'AVAX-SING':
        return AvaxSing
      case 'AVAX-QI':
        return AvaxBenqi
      case 'PARTY-DAI':
        return PartyDai
      case 'PARTY-DAI.e':
        return PartyDai
      case 'AVAX-GB':
        return AvaxGb
      case 'AVAX-DAI.e':
        return AvaxDai
      case 'USDT.e-BUSD':
        return UsdtBusd
      case 'USDT.e-USDC.e':
        return UsdtUsdc
      case 'APE-X-AVAX':
      case 'AVAX-APE-X':
        return AvaxApex
      case 'HUSKY-AVAX':
      case 'AVAX-HUSKY':
        return AvaxHusky
      case 'MIM-AVAX':
      case 'AVAX-MIM':
        return AvaxMim
      case 'SHIBX-AVAX':
      case 'AVAX-SHIBX':
        return AvaxShibx
      case 'AVAX-WOLFI':
        return AvaxWolfi
      default:
        return PartyUsdt
    }
  }, [pinataSymbol])
  return (
    <ImageContainer>
      <img src={pinataLogo} alt="a  pinata logo" />
      {delisted && <div className="overlay"></div>}
    </ImageContainer>
  )
}
