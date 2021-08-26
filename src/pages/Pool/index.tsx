import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from '@partyswap-libs/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE, HideSmall, ExternalLink } from '../../theme'
import { Text } from 'rebass'
import { GreyCard } from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { ChainId } from '@partyswap-libs/sdk'
import { ANALYTICS_PAGE } from '../../constants'

import pattern from '../../assets/svg/swap-pattern.svg'
import patternDarkMode from '../../assets/svg/swap-pattern-dark.svg'
import { useIsDarkMode } from '../../state/user/hooks'
import { ReactComponent as ExternalLinkSVG } from '../../assets/svg/external-link.svg'

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  padding: 6rem 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 2rem 1rem;
  `};
`

const PageContent = styled.div`
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
`

const BackgroundImage = styled.div`
  position: absolute;
  background-color: #f6f6ff;
  background-image: url(${pattern});
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  &.darkMode {
    background-color: #1a1a37;
    background-image: url(${patternDarkMode});
  }
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.surface5};
  border: 1px solid ${({ theme }) => theme.bg7};
  padding: 2.5rem;

  border-radius: 12px;
  background-color: ${({ theme }) => theme.surface4};
  border: 1px solid ${({ theme }) => theme.bg6};
`

const ViewStakedLiquidity = styled(ExternalLink)`
  width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1.25rem;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-weight: 500;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  margin-left: auto;
  svg {
    color: ${({ theme }) => theme.primaryText3};
  }

  :hover {
    text-decoration-color: ${({ theme }) => theme.primaryText3};
  }
`

const ExtLink = styled(ExternalLinkSVG)`
  margin-left: 0.125em;
`

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account, chainId } = useActiveWeb3React()

  const AccountAnalytics = account ? ANALYTICS_PAGE + '#/account/' + account : ANALYTICS_PAGE + '#/accounts'

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map(tokens => ({
        liquidityToken: toV2LiquidityToken(tokens, chainId ? chainId : ChainId.FUJI),
        tokens
      })),
    [trackedTokenPairs, chainId]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const hasV1Liquidity = undefined

  const isDarkMode = useIsDarkMode()

  return (
    <>
      <PageWrapper>
        {isDarkMode ? <BackgroundImage className="darkMode" /> : <BackgroundImage />}

        <PageContent>
          <SwapPoolTabs active={'pool'} />

          <AutoColumn gap="lg" justify="center">
            <AutoColumn gap="lg" style={{ width: '100%' }}>
              <TitleRow padding={'0'} style={{ marginTop: '2rem' }}>
                <HideSmall>
                  {/* <TYPE.mediumHeader fontFamily="Poppins" style={{ justifySelf: 'flex-start' }}>
                    Your liquidity
                    <ExtLink />
                  </TYPE.mediumHeader> */}

                  <ViewStakedLiquidity target="_blank" href={AccountAnalytics}>
                    Your Liquidity
                    <ExtLink />
                  </ViewStakedLiquidity>
                </HideSmall>
                <ButtonRow>
                  <ResponsiveButtonSecondary as={Link} padding="6px 8px" to="/create/AVAX">
                    Create a pair
                  </ResponsiveButtonSecondary>
                  <ResponsiveButtonPrimary id="join-pool-button" as={Link} padding="6px 8px" to="/add/AVAX">
                    <Text fontWeight={500} fontSize={16}>
                      Add Liquidity
                    </Text>
                  </ResponsiveButtonPrimary>
                </ButtonRow>
              </TitleRow>

              {!account ? (
                <GreyCard padding="40px" border={`2px solid ${theme.bg6}`}>
                  <TYPE.mediumHeader color={theme.text1} textAlign="center">
                    Connect to a wallet to view your liquidity.
                  </TYPE.mediumHeader>
                </GreyCard>
              ) : v2IsLoading ? (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    <Dots>Loading</Dots>
                  </TYPE.body>
                </EmptyProposals>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                <>
                  {allV2PairsWithLiquidity.map(v2Pair => (
                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  ))}
                </>
              ) : (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    No liquidity found.
                  </TYPE.body>
                </EmptyProposals>
              )}

              <AutoColumn justify={'center'} gap="md">
                <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                  {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
                  <StyledInternalLink id="import-pool-link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                    {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
                  </StyledInternalLink>
                </Text>
              </AutoColumn>
            </AutoColumn>
          </AutoColumn>
        </PageContent>
      </PageWrapper>
    </>
  )
}
