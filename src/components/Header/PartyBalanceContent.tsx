import { ChainId, TokenAmount, WAVAX, JSBI } from '@partyswap-libs/sdk'
import { X } from 'react-feather'
import React from 'react'
import styled from 'styled-components'
import { PARTY } from '../../constants'
import { usePartyCirculation, useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { useTotalPartyEarned } from '../../state/stake/hooks'
import { useAggregatePartyBalance, useTokenBalance } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE, PngTokenAnimated } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { CardSection, DataCard } from '../earn/styled'
import { usePair } from '../../data/Reserves'
import { AddParty } from '../AddParty'

import pattern from '../../assets/svg/swap-pattern.svg'
import patternDarkMode from '../../assets/svg/swap-pattern-dark.svg'
import { useIsDarkMode } from '../../state/user/hooks'
import { getTokenLogoURL } from '../CurrencyLogo'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.surface3};
  background: ${({ theme }) => theme.surface3};
  padding: 0.5rem;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg7};
`

const BackgroundImage = styled.div`
  position: absolute;
  background-color: #fff;
  background-image: url(${pattern});
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  border-radius: 20px;
  &.darkMode {
    background-color: #1a1a37;
    background-image: url(${patternDarkMode});
  }
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
  const wavax = WAVAX[chainId ? chainId : ChainId.AVALANCHE]
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

  const circulation: TokenAmount | undefined = usePartyCirculation()

  const isDarkMode = useIsDarkMode()

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        {isDarkMode ? <BackgroundImage className="darkMode" /> : <BackgroundImage />}
        <CardSection gap="md">
          <RowBetween>
            <TYPE.mediumHeader fontFamily="Poppins" fontWeight="700">
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
                🎉
              </span>
              PARTY Breakdown
            </TYPE.mediumHeader>
            <StyledClose onClick={() => setShowPngBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <PngTokenAnimated
                  width="64px"
                  src={getTokenLogoURL('0x25afD99fcB474D7C336A2971F26966da652a92bc', true)}
                />{' '}
                {/* {isDarkMode ? (
                  <div>
                    <PartyTokenVideo autoPlay loop muted playsInline className="dark-mode">
                      <source src={TokenVideoDark} type="video/mp4" />
                    </PartyTokenVideo>
                  </div>
                ) : (
                  <PartyTokenVideo autoPlay loop muted playsInline>
                    <source src={TokenVideo} type="video/mp4" />
                  </PartyTokenVideo>
                )} */}
                <TYPE.body fontSize={32} fontWeight={600}>
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
                      <StyledInternalLink onClick={() => setShowPngBalanceModal(false)} to="/party/3">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.body>
                </RowBetween>
              </AutoColumn>
            </CardSection>
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
            <RowBetween>
              <AddParty />
            </RowBetween>
          </AutoColumn>
        </CardSection>
      </ModalUpper>
    </ContentWrapper>
  )
}
