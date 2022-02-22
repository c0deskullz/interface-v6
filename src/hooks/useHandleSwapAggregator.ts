//@ts-nocheck
import { JSBI } from '@partyswap-libs/sdk'
import { useCallback, useMemo } from 'react'
import { useTransactionAdder } from '../state/transactions/hooks'

// TODO: tx data can be undefined
// TODO: handle errors
export default function useHandleSwapAggregator(txData?: { method: string; params: any[] }) {
  const { ethereum } = window
  const addTransaction = useTransactionAdder()
  const rewrittenTxData = useMemo(
    () => ({
      method: txData?.method,
      params: [
        {
          ...txData?.params[0],
          gas: `0x${JSBI.BigInt(txData?.params[0]?.gas || 0).toString(16)}`,
          value: `0x${JSBI.BigInt(txData?.params[0]?.value || 0).toString(16)}`,
          gasPrice: `0x${JSBI.BigInt(txData?.params[0]?.gasPrice || 0).toString(16)}`
        }
      ]
    }),
    [txData]
  )

  const handleSwapWithAggregator = useCallback(() => {
    if (ethereum) {
      ethereum
        .request(rewrittenTxData)
        .then(response => {
          if (!response) {
            throw new Error('Something went wrong.')
          }
          addTransaction(
            { hash: response },
            {
              summary: `Swap With Aggregator`
            }
          )
        })
        .catch(console.error)
    }
  }, [ethereum, rewrittenTxData, addTransaction])

  return handleSwapWithAggregator
}
