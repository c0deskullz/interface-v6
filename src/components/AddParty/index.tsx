//@ts-nocheck
import React from 'react'
import { PARTY } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { Button } from '../../theme'
import { getTokenLogoURL } from '../CurrencyLogo'

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
              image: getTokenLogoURL('0x25afD99fcB474D7C336A2971F26966da652a92bc', true)
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
