//@ts-nocheck
import React from 'react'
import { PARTY } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { Button } from '../../theme'

export const AddParty = () => {
  const { ethereum } = window
  const { chainId } = useActiveWeb3React()
  const handleAddParty = () => {
    if (ethereum) {
      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: PARTY[chainId || ChainId.AVALANCHE].address,
              symbol: 'PARTY',
              decimals: 18,
              image:
                'https://raw.githubusercontent.com/PartySwapDEX/token-assets/main/assets/0x15957be9802B50c6D66f58a99A2a3d73F5aaf615/logo.png'
            }
          }
        })
        .then(success => {
          if (!success) {
            throw new Error('Something went wrong.')
          }
        })
        .catch(console.error)
    }
  }

  return <Button onClick={handleAddParty}>Add to Metamask</Button>
}
