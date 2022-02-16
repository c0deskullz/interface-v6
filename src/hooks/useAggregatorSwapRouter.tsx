import { CAVAX, ChainId, Token, Trade, WAVAX } from '@partyswap-libs/sdk'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { serialize } from '../utils/serialize'
import { useActiveWeb3React } from '.'
import { ONEINCH_BASE_URL } from '../constants'
import { useAggregatorRouterAddress } from '../state/swap/hooks'
import { useAggregatorRouter } from './useContract'

const getSwapParams = async (
  inputParams: { trade?: Trade; deadline: any; account: string | null | undefined; slippage: any },
  callback: (swapParams: any) => void
) => {
  if (inputParams.trade) {
    const { inputAmount, outputAmount } = inputParams.trade
    const getFromTokenAddress = () => {
      if (inputAmount.currency === CAVAX) return WAVAX[ChainId.AVALANCHE].address
      if (inputAmount.currency instanceof Token) {
        return inputAmount.currency.address
      }
      return ''
    }
    const getToTokenAddress = () => {
      if (outputAmount.currency === CAVAX) return WAVAX[ChainId.AVALANCHE].address
      if (outputAmount.currency instanceof Token) {
        return outputAmount.currency.address
      }
      return ''
    }
    const amount = inputAmount.raw.toString()

    try {
      const { data } = await axios.get(
        `${ONEINCH_BASE_URL}43114/swap?${serialize(
          {
            fromTokenAddress: getFromTokenAddress(),
            toTokenAddress: getToTokenAddress(),
            amount,
            fromAddress: inputParams.account,
            slippage: inputParams.slippage
          },
          ''
        )}`
      )
      callback(data)
    } catch (error) {
      console.log(error)
    }
  }
}

export function useAggregatorSwapParams({
  trade,
  deadline,
  slippage
}: {
  trade?: Trade
  deadline: any
  slippage: any
}) {
  const { account } = useActiveWeb3React()
  const [params, setParams] = useState()

  useEffect(() => {
    if (trade && deadline && account) {
      getSwapParams({ trade, deadline, account, slippage }, setParams)
    } else {
      console.log(trade, 'no trade')
      console.log(deadline, 'no deadline')
      console.log(slippage, 'no slippage')
    }
  }, [trade, deadline, account, slippage])

  return params
}

export function useAggregatorSwapRouter({
  trade,
  deadline,
  slippage
}: {
  trade?: Trade
  deadline: any
  slippage: any
}) {
  const routerAddress = useAggregatorRouterAddress()
  const router = useAggregatorRouter(routerAddress)

  const parameters = useAggregatorSwapParams({ trade, deadline, slippage })

  return { contract: router, parameters }
}
