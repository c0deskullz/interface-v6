import React, { useEffect } from 'react'
import styled from 'styled-components'

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
  error: any
  protocol?: any
  fromToken: any
  toToken: any
  formattedInputAmmount: any
  toTokenAmount: any
  estimatedGas: any
  onSwitchTradeWithAggregator(state: boolean): void
  useAggregator: boolean
}

export function QuoteAggregatorTokens({
  error,
  protocol,
  fromToken,
  toToken,
  formattedInputAmmount,
  toTokenAmount,
  estimatedGas,
  onSwitchTradeWithAggregator,
  useAggregator
}: QuoteAggregatorTokensProps) {
  useEffect(() => {
    onSwitchTradeWithAggregator(true)

    return () => onSwitchTradeWithAggregator(false)
  }, [onSwitchTradeWithAggregator])

  return protocol && !error ? (
    <Wrapper>
      <span>Best aggregator trade is at:</span>
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
    </Wrapper>
  ) : (
    <></>
  )
}
