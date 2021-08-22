import { ChainId, TokenAmount, WAVAX, JSBI } from '@partyswap-libs/sdk'
import React, { useMemo } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import { PARTY } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { useTotalPartyEarned } from '../../state/stake/hooks'
import { useAggregatePartyBalance, useTokenBalance } from '../../state/wallet/hooks'
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
export default function PartyBalanceContent({ setShowPngBalanceModal }: { setShowPngBalanceModal: any }) {
  const { account, chainId } = useActiveWeb3React()
  const party = chainId ? PARTY[chainId] : undefined

  const total = useAggregatePartyBalance()
  const partyBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, party)
  const partyToClaim: TokenAmount | undefined = useTotalPartyEarned()

  const totalSupply: TokenAmount | undefined = useTotalSupply(party)

  // Determine PARTY price in AVAX
  const wavax = WAVAX[chainId ? chainId : ChainId.FUJI]
  const [, avaxPartyTokenPair] = usePair(wavax, party)
  const oneToken = JSBI.BigInt(1000000000000000000)
  let partyPrice: Number | undefined
  if (avaxPartyTokenPair && party) {
    const reserve =
      avaxPartyTokenPair.reserveOf(party).raw.toString() === '0'
        ? JSBI.BigInt(1)
        : avaxPartyTokenPair.reserveOf(party).raw
    const avaxPartyRatio = JSBI.divide(JSBI.multiply(oneToken, avaxPartyTokenPair.reserveOf(wavax).raw), reserve)
    partyPrice = JSBI.toNumber(avaxPartyRatio) / 1000000000000000000
  }

  const blockTimestamp = useCurrentBlockTimestamp()
  const circulation: TokenAmount | undefined = useMemo(
    () =>
      blockTimestamp && party && chainId === ChainId.FUJI ? computePngCirculation(party, blockTimestamp) : totalSupply,
    [blockTimestamp, chainId, totalSupply, party]
  )

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardBGImage />
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">Your PARTY Breakdown</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowPngBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <PngTokenAnimated
                  width="48px"
                  src="https://raw.githubusercontent.com/PartySwapDEX/token-assets/main/assets/0x15957be9802B50c6D66f58a99A2a3d73F5aaf615/logo.png"
                />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white color="white">Balance:</TYPE.white>
                  <TYPE.white color="white">{partyBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Unclaimed:</TYPE.white>
                  <TYPE.white color="white">
                    {partyToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {partyToClaim && partyToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowPngBalanceModal(false)} to="/party/1">
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
              <TYPE.white color="white">PARTY price:</TYPE.white>
              <TYPE.white color="white">{partyPrice?.toFixed(5) ?? '-'} AVAX</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">PARTY in circulation:</TYPE.white>
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
