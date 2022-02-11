import { Currency, CurrencyAmount } from '@partyswap-libs/sdk'
import { formatUnits } from 'ethers/lib/utils'
import React from 'react'
import styled from 'styled-components'
import { useQuoteOnAgggregator } from '../../state/swap/hooks'

const Wrapper = styled.div`
  span.hint {
    font-size: small;
  }

  margin: 0.1rem;

  div.protocolWrapper {
    margin: 0.1rem;
    font-size: small;
    border: 1px solid black:
    border-radius: 3px;
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
}

export function QuoteAggregatorTokens({
  currencies,
  inputTokenAddress,
  outputTokenAddress,
  parsedAmounts
}: QuoteAggregatorTokensProps) {
  const data = useQuoteOnAgggregator(inputTokenAddress || '', outputTokenAddress || '', parsedAmounts.INPUT)
  const protocols = data?.protocols[0][0]
  const fromToken = data?.fromToken
  const toToken = data?.toToken
  const toTokenAmount = formatUnits(data?.toTokenAmount || '0', currencies.OUTPUT?.decimals)
  const estimatedGas = data?.estimatedGas
  const formattedInputAmmount = parsedAmounts.INPUT?.toExact() ?? ''

  return currencies.INPUT && currencies.OUTPUT && parsedAmounts.INPUT && data ? (
    <Wrapper>
      <span>Best aggregator trade is at:</span>
      {protocols?.map(protocol => (
        <div className="protocolWrapper" key={protocol.name}>
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
