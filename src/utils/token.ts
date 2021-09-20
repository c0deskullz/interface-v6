import { BigintIsh, ChainId, Token, TokenAmount } from '@partyswap-libs/sdk'
import {} from 'react'
import { JACUZZI_ADDRESS } from '../constants'

export const createJacuzziTokenInstance = (chainId: ChainId.AVALANCHE | ChainId.FUJI | undefined) => {
  return new Token(
    chainId || ChainId.AVALANCHE,
    JACUZZI_ADDRESS[chainId || ChainId.AVALANCHE] || '',
    18,
    'PARTY',
    'PARTY'
  )
}

export const getJacuzziAmmount = (chainId: number | undefined, balance: BigintIsh) =>
  new TokenAmount(createJacuzziTokenInstance(chainId), balance).toFixed(10, {})
