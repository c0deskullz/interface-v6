import React from 'react'
import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link as HistoryLink, NavLink, useLocation } from 'react-router-dom'
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

interface Tab {
  name: string
  activeCondition: boolean
  path?: string
  isExternalLink?: boolean
}

export function CommonTabs({ tabs, width = '20rem' }: { tabs: Tab[]; width?: string }) {
  const { pathname } = useLocation()

  return (
    <Tabs width={width}>
      {tabs.map(({ name, activeCondition, path, isExternalLink }, index) =>
        isExternalLink ? (
          <StyledExternalLink id={`${name}-nav-link`} key={`${name}-${index}`} isActive={activeCondition} href={path}>
            {name}
          </StyledExternalLink>
        ) : (
          <StyledNavLink
            id={`${name}-nav-link`}
            to={path ?? pathname}
            key={`${name}-${index}`}
            isActive={() => activeCondition}
          >
            {name}
          </StyledNavLink>
        )
      )}
    </Tabs>
  )
}

export function EarnVersionTabs({ active }: { active: 'v1' | 'v2' | 'boosted' }) {
  const tabs: Tab[] = [
    {
      name: 'Boosted',
      activeCondition: active === 'boosted',
      path: '/party/3'
    },
    {
      name: 'V2',
      activeCondition: active === 'v2',
      path: '/party/2'
    },
    {
      name: 'V1',
      activeCondition: active === 'v1',
      isExternalLink: true,
      path: V1_PAGE + '/party/1'
    }
  ]

  return <CommonTabs tabs={tabs} />
}

export function VersionTabs({ active, pathname }: { active: 'v1' | 'v2'; pathname: string }) {
  const tabs: Tab[] = [
    {
      name: 'V2',
      activeCondition: active === 'v2'
    },
    {
      name: 'V1',
      activeCondition: active === 'v1',
      isExternalLink: true,
      path: V1_PAGE + pathname
    }
  ]

  return <CommonTabs tabs={tabs} />
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
        <HistoryLink to="">
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
