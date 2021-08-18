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
  YayAvax,
  YayDai,
  YayUsdt
} from '../../assets/images/pinatas'

interface PinataLogoProps {
  pinataSymbol: string
}

export default function PinataLogo({ pinataSymbol }: PinataLogoProps) {
  const pinataLogo = useMemo(() => {
    switch (pinataSymbol) {
      case 'AVAX-YAY':
        return YayAvax
      case 'AVAX-aaBLOCK':
        return AvaxAaBlock
      case 'AVAX-AVME':
        return AvaxAvme
      case 'AVAX-BAG':
        return AvaxBag
      case 'AVAX-DOGE':
        return AvaxDoge
      case 'AVAX-ETH':
        return AvaxEth
      case 'AVAX-ELK':
        return AvaxElk
      case 'AVAX-FRAX':
        return AvaxFraxi
      case 'AVAX-LINK':
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
      case 'AVAX-XAVA':
        return AvaxXava
      case 'AVAX-ZERO':
        return AvaxZero
      case 'AVAX-SHERPA':
        return AvaxSherpa
      case 'AVAX-YAK':
        return AvaxYak
      case 'YAY-DAI':
        return YayDai
      default:
        return YayUsdt
    }
  }, [pinataSymbol])
  return <img src={pinataLogo} alt="a  pinata logo" />
}
