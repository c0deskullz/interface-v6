import { ChainId, TokenAmount, WAVAX, JSBI } from '@partyswap-libs/sdk'
import React, { useMemo } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import tokenLogo from '../../assets/images/token-logo.png'
import { YAY } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { useTotalYayEarned } from '../../state/stake/hooks'
import { useAggregateYayBalance, useTokenBalance } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE, PngTokenAnimated } from '../../theme'
import { computePngCirculation } from '../../utils/computePngCirculation'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Break, CardBGImage, CardNoise, CardSection, DataCard } from '../earn/styled'
import { usePair } from '../../data/Reserves'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #f97316 0%, #e84142 100%);
  padding: 0.5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

/**
 * Content for balance stats modal
 */
export default function YayBalanceContent({ setShowPngBalanceModal }: { setShowPngBalanceModal: any }) {
  const { account, chainId } = useActiveWeb3React()
  const yay = chainId ? YAY[chainId] : undefined

  const total = useAggregateYayBalance()
  const yayBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, yay)
  const yayToClaim: TokenAmount | undefined = useTotalYayEarned()

  const totalSupply: TokenAmount | undefined = useTotalSupply(yay)

  // Determine YAY price in AVAX
  const wavax = WAVAX[chainId ? chainId : ChainId.FUJI]
  const [, avaxYayTokenPair] = usePair(wavax, yay)
  const oneToken = JSBI.BigInt(1000000000000000000)
  let yayPrice: Number | undefined
  if (avaxYayTokenPair && yay) {
    const reserve =
      avaxYayTokenPair.reserveOf(yay).raw.toString() === '0' ? JSBI.BigInt(1) : avaxYayTokenPair.reserveOf(yay).raw
    const avaxYayRatio = JSBI.divide(JSBI.multiply(oneToken, avaxYayTokenPair.reserveOf(wavax).raw), reserve)
    yayPrice = JSBI.toNumber(avaxYayRatio) / 1000000000000000000
  }

  const blockTimestamp = useCurrentBlockTimestamp()
  const circulation: TokenAmount | undefined = useMemo(
    () =>
      blockTimestamp && yay && chainId === ChainId.FUJI ? computePngCirculation(yay, blockTimestamp) : totalSupply,
    [blockTimestamp, chainId, totalSupply, yay]
  )

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardBGImage />
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">Your YAY Breakdown</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowPngBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <PngTokenAnimated width="48px" src={tokenLogo} />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white color="white">Balance:</TYPE.white>
                  <TYPE.white color="white">{yayBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Unclaimed:</TYPE.white>
                  <TYPE.white color="white">
                    {yayToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {yayToClaim && yayToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowPngBalanceModal(false)} to="/yay/1">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <Break />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white color="white">YAY price:</TYPE.white>
              <TYPE.white color="white">{yayPrice?.toFixed(5) ?? '-'} AVAX</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">YAY in circulation:</TYPE.white>
              <TYPE.white color="white">{circulation?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">Total Supply</TYPE.white>
              <TYPE.white color="white">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
          </AutoColumn>
        </CardSection>
      </ModalUpper>
    </ContentWrapper>
  )
}
