import { Currency, CurrencyAmount } from '@partyswap-libs/sdk'
import { formatUnits } from 'ethers/lib/utils'
import { useQuoteOnAgggregator } from '../state/swap/hooks'

export function useQuoteOnAgggregatorTokens({
  inputTokenAddress,
  outputTokenAddress,
  parsedAmounts,
  currencies
}: {
  inputTokenAddress?: string
  outputTokenAddress?: string
  parsedAmounts: {
    INPUT: CurrencyAmount | undefined
    OUTPUT: CurrencyAmount | undefined
  }
  currencies: {
    INPUT?: Currency | undefined
    OUTPUT?: Currency | undefined
  }
}) {
  const { data, error } = useQuoteOnAgggregator(inputTokenAddress || '', outputTokenAddress || '', parsedAmounts.INPUT)
  const protocols = data?.protocols[0][0]
  const fromToken = data?.fromToken
  const toToken = data?.toToken
  const toTokenAmount = formatUnits(data?.toTokenAmount || '0', currencies.OUTPUT?.decimals)
  const estimatedGas = data?.estimatedGas
  const formattedInputAmmount = parsedAmounts.INPUT?.toExact() ?? ''

  return {
    data,
    protocols,
    error,
    fromToken,
    toToken,
    toTokenAmount,
    estimatedGas,
    formattedInputAmmount
  }
}
