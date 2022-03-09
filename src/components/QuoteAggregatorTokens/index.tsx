import { BigNumber } from 'ethers'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ChevronRight, Maximize } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useOracleContract } from '../../hooks/useContract'
import { useOneInchToken } from '../../state/application/hooks'
import { fromWei } from 'web3-utils'
import Modal from '../Modal'
import { CloseIcon, TYPE } from '../../theme'
import { LiquiditySource, useAggregatorLiquiditySources } from '../../hooks/useAggregatorLiquiditySources'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import { ErrorText, SectionBreak } from '../swap/styleds'

const Wrapper = styled.div``

const AggregatorBox = styled.div`
  border-radius: 20px;
  padding: 0.75rem;
  margin: 12px 0;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};

  .aggregator-links-details:hover {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.primary1};
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

  const formattedTitle = useMemo(() => {
    if (dexSource?.title.includes('AVALANCHE_')) {
      const splitted = dexSource.title
        .replace('AVALANCHE_', '')
        .replaceAll('_', ' ')
        .split('')

      splitted.forEach((letter, index) => {
        if (index !== 0) {
          splitted[index] = letter.toLocaleLowerCase()
        }
      })
      return splitted.join('')
    }

    return dexSource?.title
  }, [dexSource])

  if (!token || !toToken) return <></>

  return (
    <div className="aggregator-route">
      <div className="aggregator-route-name">
        <span>{formattedTitle}</span> {part}%
      </div>
      <div className="aggregator-route-icons">
        <span>
          <img src={token.logoURI} alt="" />
          {token.symbol}
        </span>
        <ChevronRight color={theme.text2} />
        <span>
          <img src={toToken.logoURI} alt="" />
          {toToken.symbol}
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
          <SectionBreak />
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
  // const [positivePriceImpact, setPositivePriceImpact] = useState(false)
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
      // setPositivePriceImpact(priceImpact < 2)
    }
  }, [tokenARate, tokenBRate, fromToken, toToken, formattedInputAmmount, toTokenAmount])

  useEffect(() => {
    onSwitchTradeWithAggregator(true)

    return () => onSwitchTradeWithAggregator(false)
  }, [onSwitchTradeWithAggregator])

  const [showRouteModal, setShowRouteModal] = useState(false)

  const theme = useContext(ThemeContext)

  return !error ? (
    <Wrapper>
      {useAggregator ? (
        <>
          <AggregatorBox className="aggregator">
            <AutoColumn style={{ padding: '0 20px', lineHeight: '1' }}>
              <RowBetween>
                <RowFixed>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    Price Impact
                  </TYPE.black>
                  <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
                </RowFixed>

                <ErrorText fontWeight={500} fontSize={14}>
                  {`${priceImpact}%`}
                </ErrorText>
              </RowBetween>

              <RowBetween>
                <RowFixed>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    Estimated fee
                  </TYPE.black>
                  <QuestionHelper text="Estimated gas fee cost to execute this transaction." />
                </RowFixed>
                <TYPE.black fontSize={14} color={theme.text1}>
                  {+avaxFee.toFixed(4)} AVAX
                </TYPE.black>
              </RowBetween>

              <RowBetween>
                <RowFixed>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    Route
                  </TYPE.black>
                  <QuestionHelper text="Route to offer you the best pricing." />
                </RowFixed>

                <TYPE.black
                  fontSize={14}
                  color={theme.text1}
                  onClick={() => setShowRouteModal(true)}
                  className="aggregator-links-details"
                  style={{}}
                >
                  Details
                  <Maximize color={theme.text2} size="16px" style={{ marginLeft: '4px' }} />
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </AggregatorBox>

          {/* <ButtonSecondary
            onClick={() => onSwitchTradeWithAggzregator(!useAggregator)}
            padding="18px"
            marginBottom="16px"
          >
            Use PartySwap Instead
          </ButtonSecondary> */}

          <Modal isOpen={showRouteModal} onDismiss={() => setShowRouteModal(false)} maxHeight={90}>
            <div className="aggregator-modal">
              <div className="aggregator-modal-header">
                <h4>Routing:</h4>
                <CloseIcon onClick={() => setShowRouteModal(false)} />
              </div>
              <div className="aggregator-modal-content">
                <img src={fromToken?.logoURI} alt={fromToken?.symbol} className="aggregator-modal-fromToken" />
                <SectionBreak />
                <TradeRoute protocols={protocols} liquiditySources={liquiditySources} />
                <img src={toToken?.logoURI} alt={toToken?.symbol} className="aggregator-modal-toToken" />
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <></>
      )}
    </Wrapper>
  ) : (
    <></>
  )
}
