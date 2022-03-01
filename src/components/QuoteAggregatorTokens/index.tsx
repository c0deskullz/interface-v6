import React, { useContext, useEffect } from 'react'
import { ChevronRight } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useOneInchToken } from '../../state/application/hooks'

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
  fromToken: any
  toToken: any
  formattedInputAmmount: any
  toTokenAmount: any
  estimatedGas: any
  onSwitchTradeWithAggregator(state: boolean): void
  useAggregator: boolean
  protocols: any[]
}

const RouteDescription = ({
  name,
  part,
  fromTokenAddress,
  toTokenAddress
}: {
  name: string
  part: number
  fromTokenAddress: string
  toTokenAddress: string
}) => {
  const theme = useContext(ThemeContext)
  const token = useOneInchToken(fromTokenAddress)
  const toToken = useOneInchToken(toTokenAddress)
  if (!token || !toToken) return <></>
  return (
    <div className="dex-route">
      <div className="protocol-name">at: {name}</div>
      <div className="protocol-trade-percentage">part: {part}%</div>
      <span className="input-token-logo">
        <img src={token.logoURI} alt="" className="token-logo" />{' '}
      </span>
      <ChevronRight color={theme.text2} />
      <span className="output-token-logo">
        <img src={toToken.logoURI} alt="" className="token-logo" />{' '}
      </span>
    </div>
  )
}

//return div views with whatever it returns maybe :l
const TradeRoute = (props: { protocols: any[] }) => {
  const protocolsRoutes = props.protocols.map((protocol, index) => {
    const routes = protocol.map((dexRoutes: any[], dexRoutesindex: number) => {
      const innerDexRoutes = dexRoutes.map((innerDexRoute: any, innerDexRouteIndex) => {
        return <RouteDescription key={innerDexRouteIndex} {...innerDexRoute} />
      })
      return (
        <div key={dexRoutesindex} className="protocol-routes">
          {innerDexRoutes}
        </div>
      )
    })

    return (
      <div key={index} className="protocol-container">
        {routes}
      </div>
    )
  })

  return protocolsRoutes.length ? <>{protocolsRoutes}</> : <></>
}

export function QuoteAggregatorTokens({
  error,
  fromToken,
  toToken,
  formattedInputAmmount,
  toTokenAmount,
  estimatedGas,
  onSwitchTradeWithAggregator,
  useAggregator,
  protocols
}: QuoteAggregatorTokensProps) {
  useEffect(() => {
    onSwitchTradeWithAggregator(true)

    return () => onSwitchTradeWithAggregator(false)
  }, [onSwitchTradeWithAggregator])

  return !error ? (
    <Wrapper>
      <span>Best aggregator trade is at:</span>
      <div
        className={`protocolWrapper ${useAggregator ? 'enabled' : ''}`}
        onClick={() => onSwitchTradeWithAggregator(!useAggregator)}
      >
        <TradeRoute protocols={protocols} />
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
