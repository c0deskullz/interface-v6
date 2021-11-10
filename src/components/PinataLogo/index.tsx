import React, { useMemo } from 'react'
import {
  AvaxSherpa,
  AvaxYak,
  AvaxAaBlock,
  AvaxAvme,
  AvaxBag,
  AvaxDoge,
  AvaxElk,
  AvaxEth,
  AvaxFraxi,
  AvaxLink,
  AvaxPefi,
  AvaxPng,
  AvaxSno,
  AvaxSpore,
  AvaxWbtc,
  AvaxXava,
  AvaxZero,
  AvaxBenqi,
  PartyAvax,
  PartyDai,
  PartyUsdt,
  AvaxUsdt,
  AvaxGb,
  AvaxDai,
  AvaxUSDCe,
  UsdtBusd,
  UsdtUsdc
} from '../../assets/images/pinatas'

interface PinataLogoProps {
  pinataSymbol: string
}

export default function PinataLogo({ pinataSymbol }: PinataLogoProps) {
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
      default:
        console.log(pinataSymbol, ': SYMBOL')
        return PartyUsdt
    }
  }, [pinataSymbol])
  return <img src={pinataLogo} alt="a  pinata logo" />
}
