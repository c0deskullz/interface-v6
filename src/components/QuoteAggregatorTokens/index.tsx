import { BigNumber } from 'ethers'
import React, { useContext, useEffect, useState } from 'react'
import { ChevronRight } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useOracleContract } from '../../hooks/useContract'
import { useOneInchToken } from '../../state/application/hooks'
import { fromWei } from 'web3-utils'

const Wrapper = styled.div`
  span.hint {
    font-size: small;
  }

  margin: 0.1rem;

  div.protocolWrapper {
    cursor: pointer;
    margin: 0.2rem;
    padding: 0.2rem;
    font-size: small;
    border: 1px solid black;
    border-radius: 5px;

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
  formattedInputAmmount,
  toTokenAmount,
  estimatedGas,
  onSwitchTradeWithAggregator,
  useAggregator,
  protocols,
  fromToken,
  toToken
}: QuoteAggregatorTokensProps) {
  const [tokenARate, setTokenARate] = useState('0')
  const [tokenBRate, setTokenBRate] = useState('0')
  const [priceImpact, setPriceImpact] = useState('0')
  const [positivePriceImpact, setPositivePriceImpact] = useState(false)

  const offChainOracle = useOracleContract()

  useEffect(() => {
    if (fromToken && toToken && offChainOracle) {
      const callbackSetter = ({ fromTokenRate, toTokenRate }: { fromTokenRate: string; toTokenRate: string }) => {
        setTokenARate(fromTokenRate)
        setTokenBRate(toTokenRate)
      }
      const getTokenPrices = async (callback: any) => {
        const fromTokenRate = await offChainOracle?.getRateToEth(fromToken.address, true)
        const toTokenRate = await offChainOracle?.getRateToEth(toToken.address, true)

        callback({
          fromTokenRate,
          toTokenRate
        })
      }

      getTokenPrices(callbackSetter)
    }
  }, [fromToken, toToken, offChainOracle])

  useEffect(() => {
    if (fromToken && toToken) {
      const tokenANumerator = BigNumber.from(10).pow(fromToken.decimals)
      const tokenADenominator = BigNumber.from(10).pow(18)
      const tokenAPrice = +fromWei(
        BigNumber.from(tokenARate)
          .mul(tokenANumerator)
          .div(tokenADenominator)
          .toString(),
        'ether'
      )

      const tokenBNumerator = BigNumber.from(10).pow(toToken.decimals)
      const tokenBDenominator = BigNumber.from(10).pow(18)
      const tokenBPrice = +fromWei(
        BigNumber.from(tokenBRate)
          .mul(tokenBNumerator)
          .div(tokenBDenominator)
          .toString(),
        'ether'
      )

      const inputAvax = tokenAPrice * +formattedInputAmmount
      const outputAvax = tokenBPrice * +toTokenAmount
      const priceImpact = (inputAvax - outputAvax) / inputAvax
      setPriceImpact(Math.abs(priceImpact).toLocaleString())
      setPositivePriceImpact(priceImpact < 2)
    }
  }, [tokenARate, tokenBRate, fromToken, toToken, formattedInputAmmount, toTokenAmount])

  useEffect(() => {
    onSwitchTradeWithAggregator(true)

    return () => onSwitchTradeWithAggregator(false)
  }, [onSwitchTradeWithAggregator])

  return !error ? (
    <Wrapper>
      <div
        className={`protocolWrapper ${useAggregator ? 'enabled' : ''}`}
        onClick={() => onSwitchTradeWithAggregator(!useAggregator)}
      >
        <TradeRoute protocols={protocols} />
        <ul>
          <li className={`${positivePriceImpact ? 'green' : 'red'}`}> Price impact: {priceImpact}%</li>
          {/* <li> input token: {fromToken?.symbol}</li> */}
          <li> Input token amount: {formattedInputAmmount} </li>
          {/* <li> output token: {toToken?.symbol}</li> */}
          <li> Output token amount: {toTokenAmount}</li>
          <li> Estimated gas: {estimatedGas}</li>
        </ul>
      </div>
    </Wrapper>
  ) : (
    <></>
  )
}
