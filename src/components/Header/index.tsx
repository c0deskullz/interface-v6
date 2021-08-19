import { ChainId, TokenAmount } from '@partyswap-libs/sdk'
import React, { useState } from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'

import styled from 'styled-components'

import Logo from '../../assets/svg/icon.svg'
import LogoDark from '../../assets/svg/icon.svg'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances, useAggregateYayBalance } from '../../state/wallet/hooks'
import { CardNoise } from '../earn/styled'
import { CountUp } from 'use-count-up'
import { TYPE } from '../../theme'

import { RedCard } from '../Card'
import Settings from '../Settings'
import Menu from '../Menu'

import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import Modal from '../Modal'
import YayBalanceContent from './YayBalanceContent'
import usePrevious from '../../hooks/usePrevious'
// import { ANALYTICS_PAGE } from '../../constants'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  background-color: ${({ theme }) => theme.surface1};
  padding: 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToLarge`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  .drawer {
    display: none;
  }
  .spread {
    display: flex;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
    .drawer{
      display: flex;
    }
    .spread {
      display: none;
    }
  `};
`

const StyledBurger = styled.button`
  position: absolute;
  top: 5%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  &:focus {
    outline: none;
  }

  div {
    width: 2rem;
    height: 0.25rem;
    background: ${({ open }: { open: boolean }) => (open ? '#0D0C1D' : '#EFFFFA')};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    :first-child {
      transform: ${({ open }: { open: boolean }) => (open ? 'rotate(45deg)' : 'rotate(0)')};
    }

    :nth-child(2) {
      opacity: ${({ open }: { open: boolean }) => (open ? '0' : '1')};
      transform: ${({ open }: { open: boolean }) => (open ? 'translateX(20px)' : 'translateX(0)')};
    }

    :nth-child(3) {
      transform: ${({ open }: { open: boolean }) => (open ? 'rotate(-45deg)' : 'rotate(0)')};
    }
  }
`

const Burger = ({ open, setOpen, className }: { open: boolean; setOpen: any; className?: string }) => {
  return (
    <StyledBurger className={className} open={open} onClick={() => setOpen(!open)}>
      <div />
      <div />
      <div />
    </StyledBurger>
  )
}

const StyledMenu = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.primary1};
  transform: ${({ open }: { open: boolean }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
  height: 100vh;
  text-align: left;
  padding: 2rem;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 576px) {
    width: 100%;
  }

  a {
    font-size: 2rem;
    text-transform: uppercase;
    padding: 2rem 0;
    font-weight: bold;
    letter-spacing: 0.5rem;
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
    transition: color 0.3s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: ${({ theme }) => theme.primaryText1};
    }
  }
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
  :hover {
    background-color: ${({ theme, active }) => (!active ? theme.bg2 : theme.bg4)};
  }
`

const PNGAmount = styled(AccountElement)`
  color: white;
  padding: 8px 12px;
  /* height: 36px; */
  font-weight: 500;
  background-color: ${({ theme }) => theme.primary1};
  /* background: radial-gradient(174.47% 188.91% at 1.84% 0%, #f97316 0%, #e84142 100%), #edeef2; */
`

const PNGWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.9;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(RedCard)`
  border-radius: 12px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.primary1};
  color: #fff;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  img {
    height: 3rem;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`    
    img {
      height: 2rem;
    }
  `};
  :hover {
    cursor: pointer;
  }
`

// const PngIcon = styled.div`
//   transition: transform 0.3s ease;
//   :hover {
//     transform: rotate(-5deg);
//   }
// `

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.white};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.white)};
    text-decoration: none;
  }
`

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName
// })<{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme }) => theme.text2};
//   font-size: 1rem;
//   width: fit-content;
//   margin: 0 12px;
//   font-weight: 500;

//   &.${activeClassName} {
//     border-radius: 12px;
//     font-weight: 600;
//     color: ${({ theme }) => theme.text1};
//   }

//   :hover,
//   :focus {
//     text-decoration: none;
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
// `}
// `

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: 'Fuji',
  [ChainId.AVALANCHE]: 'Avalanche'
}

const Links = ({ className }: { className?: string }) => {
  const { t } = useTranslation()

  return (
    <div className={className}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink
        id={`pool-nav-link`}
        to={'/pool'}
        isActive={(match, { pathname }) =>
          Boolean(match) ||
          pathname.startsWith('/add') ||
          pathname.startsWith('/remove') ||
          pathname.startsWith('/create') ||
          pathname.startsWith('/find')
        }
      >
        Liquidity
      </StyledNavLink>
      <StyledNavLink id={`stake-nav-link`} to={'/yay/1'}>
        Piñatas
      </StyledNavLink>
      <StyledNavLink id={`jacuzzi-nav-link`} to={'/jacuzzi'}>
        Jacuzzis
      </StyledNavLink>
    </div>
  )
}

const DrawerMenu = ({ open }: { open: boolean }) => {
  return (
    <StyledMenu open={open}>
      <Links />
    </StyledMenu>
  )
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [isDark] = useDarkModeManager()

  const aggregateBalance: TokenAmount | undefined = useAggregateYayBalance()

  const [showPngBalanceModal, setShowPngBalanceModal] = useState(false)
  const [open, setOpen] = useState(false)

  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  return (
    <HeaderFrame>
      <DrawerMenu open={open} />
      <Modal isOpen={showPngBalanceModal} onDismiss={() => setShowPngBalanceModal(false)}>
        <YayBalanceContent setShowPngBalanceModal={setShowPngBalanceModal} />
      </Modal>
      <HeaderRow>
        <Title href=".">
          <img width={'100%'} src={isDark ? LogoDark : Logo} alt="logo" />
        </Title>
        <HeaderLinks>
          <Burger className="drawer" open={open} setOpen={setOpen} />
          <Links className="spread" />
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          {aggregateBalance && (
            <PNGWrapper onClick={() => setShowPngBalanceModal(true)}>
              <PNGAmount active={!!account} style={{ pointerEvents: 'auto' }}>
                {account && (
                  <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem'
                      }}
                    >
                      <CountUp
                        key={countUpValue}
                        isCounting
                        start={parseFloat(countUpValuePrevious)}
                        end={parseFloat(countUpValue)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                  </HideSmall>
                )}
                YAY
              </PNGAmount>
              <CardNoise />
            </PNGWrapper>
          )}
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} AVAX
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <Settings />
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
