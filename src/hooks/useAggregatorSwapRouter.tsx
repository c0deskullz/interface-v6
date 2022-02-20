import { CAVAX, CurrencyAmount, Token } from '@partyswap-libs/sdk'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { serialize } from '../utils/serialize'
import { ONEINCH_BASE_URL } from '../constants'
import _ from 'lodash'

export type AggregatorTrade = {
  inputAmount?: CurrencyAmount
  outputAmount?: CurrencyAmount
  account: string | null | undefined
  slippage: any
}

const getSwapParams = async (
  { inputAmount, outputAmount, account, slippage }: AggregatorTrade,
  callback: (swapParams: any) => void
) => {
  if (inputAmount && outputAmount) {
    const getFromTokenAddress = () => {
      if (inputAmount.currency === CAVAX) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      if (inputAmount.currency instanceof Token) {
        return inputAmount.currency.address
      }
      return ''
    }
    const getToTokenAddress = () => {
      if (outputAmount.currency === CAVAX) return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
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
            fromAddress: account,
            slippage
          },
          ''
        )}`
      )
      callback(data.tx)
    } catch (error) {
      console.log(error)
    }
  }
}

export function useAggregatorSwapParams({ inputAmount, outputAmount, slippage, account }: AggregatorTrade) {
  const [params, setParams] = useState<{
    method: string
    params: any[]
  }>({
    method: 'eth_sendTransaction',
    params: []
  })

  const handleSetParams = useCallback(
    (_params: any) => {
      if (!_.isEqual(params, { method: 'eth_sendTransaction', params: [_params] })) {
        setParams({ method: 'eth_sendTransaction', params: [_params] })
      }
    },
    [params]
  )

  useEffect(() => {
    if (inputAmount && slippage && account) {
      getSwapParams({ inputAmount, outputAmount, account, slippage }, handleSetParams)
    }
  }, [account, inputAmount, outputAmount, slippage, handleSetParams])

  return params
}
