import React from 'react'
import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link as HistoryLink, NavLink } from 'react-router-dom'
import styled, { css, DefaultTheme } from 'styled-components'
import { V1_PAGE } from '../../constants'
import QuestionHelper from '../QuestionHelper'
import { RowBetween } from '../Row'

const Tabs = styled.div<{ width?: string }>`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  width: ${({ width }) => width || '20rem'};
  justify-content: space-evenly;
  align-items: center;
  background-color: ${({ theme }) => theme.surface3};
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 5rem;
  margin: 0 auto 2rem;
`

const NoBorderTabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: space-evenly;
  align-items: center;
  background-color: transparent;
  margin: 0 auto 2rem;
`

const activeClassName = 'ACTIVE'

const anchorTagCss = ({ theme }: { theme: DefaultTheme }) => css`
  ${theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 5rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${theme.text6};
  font-size: 1.125rem;
  font-weight: 600;
  flex: 1;

  &.${activeClassName} {
    color: #fff;
    background-color: ${theme.primary1};
    :hover,
    :focus {
      color: #fff;
      background-color: ${theme.primary1};
    }
  }

  :hover,
  :focus {
    color: ${theme.text6};
    text-decoration: none;
  }
`

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${anchorTagCss}
`

const StyledExternalLink = styled.a.attrs<{ isActive: boolean }>(({ isActive }) => ({
  className: isActive && activeClassName
}))<{ isActive: boolean }>`
  ${anchorTagCss}
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function VersionTabs({ active, pathname }: { active: 'v1' | 'v2' | 'boosted'; pathname: string }) {
  return (
    <Tabs width="20rem">
      <StyledNavLink id={`boosted-nav-link`} to={'/party/3'} isActive={() => active === 'boosted'}>
        {'Boosted'}
      </StyledNavLink>
      <StyledNavLink id={`v2-nav-link`} to={'/party/2'} isActive={() => active === 'v2'}>
        {'V2'}
      </StyledNavLink>
      <StyledExternalLink id={`v1-nav-link`} href={V1_PAGE + pathname} isActive={active === 'v1'}>
        {'V1'}
      </StyledExternalLink>
    </Tabs>
  )
}

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()
  return (
    <Tabs>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        {t('Swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        {t('Liquidity')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <NoBorderTabs>
      <RowBetween style={{ padding: '1rem' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>Import Pool</ActiveText>
        <QuestionHelper text={"Use this tool to find pairs that don't automatically appear in the interface."} />
      </RowBetween>
    </NoBorderTabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  return (
    <NoBorderTabs>
      <RowBetween style={{ padding: '1rem' }}>
        <HistoryLink to="/pool">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>{creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}</ActiveText>
        <QuestionHelper
          text={
            adding
              ? 'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.'
              : 'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.'
          }
        />
      </RowBetween>
    </NoBorderTabs>
  )
}
