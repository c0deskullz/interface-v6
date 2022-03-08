import { BigNumber } from 'ethers'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useOracleContract } from '../../hooks/useContract'
import { useOneInchToken } from '../../state/application/hooks'
import { fromWei } from 'web3-utils'
import Modal from '../Modal'
import { CloseIcon } from '../../theme'
import { ButtonWhite, ButtonSecondary } from '../Button'
import { LiquiditySource, useAggregatorLiquiditySources } from '../../hooks/useAggregatorLiquiditySources'

const Wrapper = styled.div``

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
  avaxFee: any
}

const RouteDescription = ({
  name,
  part,
  fromTokenAddress,
  toTokenAddress,
  liquiditySources
}: {
  name: string
  part: number
  fromTokenAddress: string
  toTokenAddress: string
  liquiditySources: LiquiditySource[]
}) => {
  const theme = useContext(ThemeContext)
  const token = useOneInchToken(fromTokenAddress)
  const toToken = useOneInchToken(toTokenAddress)
  const dexSource = useMemo(() => {
    return liquiditySources.find(liquiditySource => liquiditySource.id === name)
  }, [liquiditySources, name])

  if (!token || !toToken) return <></>

  return (
    <div className="aggregator-route">
      <div className="aggregator-route-name">
        <span>{dexSource?.title}</span> {part}%
      </div>
      <div className="aggregator-route-icons">
        <span>
          <img src={token.logoURI} alt="" />
          {token.symbol}
        </span>
        <ChevronRight color={theme.text2} />
        <span>
          <img src={toToken.logoURI} alt="" />
          {token.symbol}
        </span>
      </div>
    </div>
  )
}

//return div views with whatever it returns maybe :l
const TradeRoute = (props: { protocols: any[]; liquiditySources: LiquiditySource[] }) => {
  const protocolsRoutes = props.protocols.map((protocol, index) => {
    const routes = protocol.map((dexRoutes: any[], dexRoutesindex: number) => {
      const innerDexRoutes = dexRoutes.map((innerDexRoute: any, innerDexRouteIndex) => {
        return (
          <RouteDescription key={innerDexRouteIndex} liquiditySources={props.liquiditySources} {...innerDexRoute} />
        )
      })
      return (
        <div key={dexRoutesindex} className="aggregator-routes">
          {innerDexRoutes}
        </div>
      )
    })

    return (
      <div key={index} className="aggregator-container">
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
  avaxFee,
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
  const liquiditySources = useAggregatorLiquiditySources()

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

  const [showRouteModal, setShowRouteModal] = useState(false)

  return !error ? (
    <Wrapper>
      <div className={`aggregator ${useAggregator ? 'enabled' : ''}`}>
        <ButtonSecondary onClick={() => onSwitchTradeWithAggregator(!useAggregator)} padding="18px" marginBottom="16px">
          {useAggregator ? 'Use PartySwap Instead' : 'Use Aggregator Instead'}
        </ButtonSecondary>

        <ButtonWhite onClick={() => setShowRouteModal(true)} className="">
          See details
        </ButtonWhite>
        <div className="aggregator-swap-details">
          <div className={`${positivePriceImpact ? 'green' : 'red'}`}> Price Impact: {priceImpact}%</div>
          {/* <li> input token: {fromToken?.symbol}</li> */}
          {/* <li> Input token amount: {formattedInputAmmount} </li> */}
          {/* <li> output token: {toToken?.symbol}</li> */}
          {/* <li> Output token amount: {toTokenAmount}</li> */}
          <div> Estimated fee: {+avaxFee.toFixed(4)} AVAX</div>
        </div>
      </div>

      <Modal isOpen={showRouteModal} onDismiss={() => setShowRouteModal(false)} maxHeight={90}>
        <div className="aggregator-modal">
          <div className="aggregator-modal-header">
            <h4>Routing:</h4>
            <CloseIcon onClick={() => setShowRouteModal(false)} />
          </div>
          <div className="aggregator-modal-content">
            <img src={fromToken?.logoURI} alt={fromToken?.symbol} className="aggregator-modal-fromToken" />
            <div className="aggregator-modal-separator"></div>
            <TradeRoute protocols={protocols} liquiditySources={liquiditySources} />
            <div className="aggregator-modal-separator"></div>
            <img src={toToken?.logoURI} alt={toToken?.symbol} className="aggregator-modal-toToken" />
          </div>
        </div>
      </Modal>
    </Wrapper>
  ) : (
    <></>
  )
}
