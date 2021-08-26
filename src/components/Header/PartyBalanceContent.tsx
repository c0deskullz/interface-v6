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
import { StyledInternalLink, TYPE } from '../../theme'
import { computePngCirculation } from '../../utils/computePngCirculation'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Break, CardSection, DataCard } from '../earn/styled'
import { usePair } from '../../data/Reserves'

import TokenVideo from '../../assets/video/party-icon-3d.mp4'
import TokenVideoDark from '../../assets/video/party-icon-3d-dark.mp4'
import { useIsDarkMode } from '../../state/user/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.surface3};
  background: ${({ theme }) => theme.surface3};
  padding: 0.5rem;
`

const PartyTokenVideo = styled.video`
  width: 5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

const Divider = styled(Break)`
  background-color: ${({ theme }) => theme.text1};
  opacity: 0.2;
  display: none;
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

  const isDarkMode = useIsDarkMode()

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardSection gap="md">
          <RowBetween>
            <TYPE.mediumHeader fontFamily="Poppins" fontWeight="700">
              Your PARTY Breakdown
            </TYPE.mediumHeader>
            <StyledClose onClick={() => setShowPngBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Divider />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                {/* <PngTokenAnimated
                  width="48px"
                  src="https://raw.githubusercontent.com/PartySwapDEX/token-assets/main/assets/0x15957be9802B50c6D66f58a99A2a3d73F5aaf615/logo.png"
                />{' '} */}
                {isDarkMode ? (
                  <div>
                    <PartyTokenVideo autoPlay loop muted playsInline className="dark-mode">
                      <source src={TokenVideoDark} type="video/mp4" />
                    </PartyTokenVideo>
                  </div>
                ) : (
                  <PartyTokenVideo autoPlay loop muted playsInline>
                    <source src={TokenVideo} type="video/mp4" />
                  </PartyTokenVideo>
                )}
                <TYPE.body fontSize={48} fontWeight={600}>
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.body>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.body>Balance:</TYPE.body>
                  <TYPE.body fontWeight="700">{partyBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.body>
                </RowBetween>
                <RowBetween>
                  <TYPE.body>Unclaimed:</TYPE.body>
                  <TYPE.body fontWeight="700">
                    {partyToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {partyToClaim && partyToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowPngBalanceModal(false)} to="/party/1">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.body>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <Divider />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.body>PARTY price:</TYPE.body>
              <TYPE.body fontWeight="700">{partyPrice?.toFixed(5) ?? '-'} AVAX</TYPE.body>
            </RowBetween>
            <RowBetween>
              <TYPE.body>PARTY in circulation:</TYPE.body>
              <TYPE.body fontWeight="700">{circulation?.toFixed(0, { groupSeparator: ',' })}</TYPE.body>
            </RowBetween>
            <RowBetween>
              <TYPE.body>Total Supply</TYPE.body>
              <TYPE.body fontWeight="700">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.body>
            </RowBetween>
          </AutoColumn>
        </CardSection>
      </ModalUpper>
    </ContentWrapper>
  )
}
