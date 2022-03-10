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

export type OneInchHTTPError = {
  statusCode: number
  error: string
  description: string
  meta: any[]
  requestId: string
}

const getSwapParams = async (
  { inputAmount, outputAmount, account, slippage }: AggregatorTrade,
  callback: (swapParams: any) => void,
  errorCallback: (error: OneInchHTTPError) => void
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
      callback(data)
    } catch (error) {
      errorCallback(error?.response?.data as OneInchHTTPError)
    }
  }
}

export function useAggregatorSwapParams({ inputAmount, outputAmount, slippage, account }: AggregatorTrade) {
  const [params, setParams] = useState<
    | {
        method: string
        params: any[]
        quote: any
      }
    | undefined
  >({
    method: 'eth_sendTransaction',
    params: [],
    quote: {}
  })

  const [error, setError] = useState<
    | {
        statusCode: number
        error: string
        description: string
        meta: any[]
        requestId: string
      }
    | undefined
  >(undefined)

  const handleSetParams = useCallback(
    (_params: any) => {
      if (!_.isEqual(params, { method: 'eth_sendTransaction', params: [_params.tx], quote: _params })) {
        setError(undefined)
        setParams({ method: 'eth_sendTransaction', params: [_params.tx], quote: _params })
      }
    },
    [params]
  )

  const handleSetError = useCallback(
    (_error: OneInchHTTPError) => {
      if (!_.isEqual(error, _error)) {
        setError(_error)
      }
    },
    [error]
  )

  useEffect(() => {
    if (inputAmount && slippage && account) {
      getSwapParams({ inputAmount, outputAmount, account, slippage }, handleSetParams, handleSetError)
    }
  }, [account, inputAmount, outputAmount, slippage, handleSetParams, handleSetError])

  return { params, error }
}
