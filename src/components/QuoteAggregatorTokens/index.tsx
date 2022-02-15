import { Currency, CurrencyAmount } from '@partyswap-libs/sdk'
import { formatUnits } from 'ethers/lib/utils'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useQuoteOnAgggregator } from '../../state/swap/hooks'

const Wrapper = styled.div`
  span.hint {
    font-size: small;
  }

  margin: 0.1rem;

  div.protocolWrapper {
    cursor: pointer;
    margin: 0.1rem;
    font-size: small;
    border: 1px solid black;
    border-radius: 3px;

    &.enabled {
      border: 1px solid blue;
    }
  }
`

interface QuoteAggregatorTokensProps {
  currencies: {
    INPUT?: Currency | undefined
    OUTPUT?: Currency | undefined
  }
  inputTokenAddress: string | undefined
  outputTokenAddress: string | undefined
  parsedAmounts: {
    INPUT: CurrencyAmount | undefined
    OUTPUT: CurrencyAmount | undefined
  }
  onSwitchTradeWithAggregator: (state: boolean) => void
  useAggregator: boolean
}

export function QuoteAggregatorTokens({
  currencies,
  inputTokenAddress,
  outputTokenAddress,
  parsedAmounts,
  onSwitchTradeWithAggregator,
  useAggregator
}: QuoteAggregatorTokensProps) {
  const { data, error } = useQuoteOnAgggregator(inputTokenAddress || '', outputTokenAddress || '', parsedAmounts.INPUT)
  const protocols = data?.protocols[0][0]
  const fromToken = data?.fromToken
  const toToken = data?.toToken
  const toTokenAmount = formatUnits(data?.toTokenAmount || '0', currencies.OUTPUT?.decimals)
  const estimatedGas = data?.estimatedGas
  const formattedInputAmmount = parsedAmounts.INPUT?.toExact() ?? ''

  useEffect(() => {
    onSwitchTradeWithAggregator(true)

    return () => onSwitchTradeWithAggregator(false)
  }, [onSwitchTradeWithAggregator])

  return currencies.INPUT && currencies.OUTPUT && parsedAmounts.INPUT && data ? (
    <Wrapper>
      <span>Best aggregator trade is at:</span>
      {!error &&
        protocols?.map(protocol => (
          <div
            className={`protocolWrapper ${useAggregator ? 'enabled' : ''}`}
            key={protocol.name}
            onClick={() => onSwitchTradeWithAggregator(!useAggregator)}
          >
            <p>{protocol.name}</p>
            <ul>
              <li> input token: {fromToken?.symbol}</li>
              <li> input token amount: {formattedInputAmmount} </li>
              <li> output token: {toToken?.symbol}</li>
              <li> output token amount: {toTokenAmount}</li>
              <li> estimated gas: {estimatedGas}</li>
            </ul>
          </div>
        ))}
    </Wrapper>
  ) : (
    <></>
  )
}
