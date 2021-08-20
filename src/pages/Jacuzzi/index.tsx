import { ChainId, JSBI, Token, TokenAmount } from '@partyswap-libs/sdk'
import { ethers } from 'ethers'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { JACUZZI_ADDRESS, toFixedTwo, YAY, YAY_DECIMALS_DIVISOR } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useJacuzziContract, useYayContract } from '../../hooks/useContract'
import { ButtonPrimary } from '../../components/Button'
import JacuzziStakingModal from '../../components/jacuzzi/JacuzziStakingModal'
import JacuzziLeaveModal from '../../components/jacuzzi/JacuzziLeaveModal'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { newTransactionsFirst } from '../../components/Web3Status'

import { ReactComponent as JacuzziImg } from '../../assets/svg/jacuzzi-hero.svg'
import { ReactComponent as YAYIcon } from '../../assets/svg/YAY-icon.svg'
import { ReactComponent as ArrowDown } from '../../assets/svg/arrow-down.svg'
import { ReactComponent as BadgeSVG } from '../../assets/svg/badge.svg'
import { ReactComponent as ExternalLinkSVG } from '../../assets/svg/external-link.svg'

import pattern from '../../assets/svg/swap-pattern.svg'
import patternDarkMode from '../../assets/svg/swap-pattern-dark.svg'
import { useIsDarkMode } from '../../state/user/hooks'

const Wrapper = styled.div`
  width: 100vw;
  background-color: ${({ theme }) => theme.surface3};
`

const BackgroundImage = styled.div`
  position: absolute;
  background-color: #f6f6ff;
  background-image: url(${pattern});
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  &.darkMode {
    background-color: #1a1a37;
    background-image: url(${patternDarkMode});
  }
`

const Item = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  [class*='-item-header'] h4 {
    color: ${({ theme }) => theme.text1};
  }
  .poolsGrid-item-header-features span {
    background-color: ${({ theme }) => theme.primaryText2};
    border: 2px solid ${({ theme }) => theme.primaryText2};
  }
  .poolsGrid-item-header-features span:nth-child(1) {
    color: ${({ theme }) => theme.primaryText2};
    border-color: ${({ theme }) => theme.primaryText2};
    background-color: transparent;
  }
  .poolsGrid-item-grid p:nth-child(1) {
    color: ${({ theme }) => theme.text6};
  }
  .grid-item-details {
    background-color: ${({ theme }) => theme.surface5};
  }
  .grid-item-details-btn {
    color: ${({ theme }) => theme.primaryText3};
  }
  .grid-item-details-btn svg {
    fill: ${({ theme }) => theme.primaryText3};
  }
  .grid-item-details .poolsGrid-item-table span {
    color: ${({ theme }) => theme.text1};
  }
  .grid-item-details .poolsGrid-item-table a {
    color: ${({ theme }) => theme.primaryText3};
  }
`

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  position: relative;
  & :nth-child(1) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  & :nth-child(2) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  ::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 100%;
    background-color: ${({ theme }) => theme.primaryText3};
    left: 0;
    right: 0;
    margin: auto;
    z-index: 2;
  }
`

const JacuzziImage = styled(JacuzziImg)`
  /* display: none; */
`

const ExtLink = styled(ExternalLinkSVG)`
  margin-left: 0.125em;
`

const IconYAY = styled(YAYIcon)`
  width: 100%;
`

const BadgeIcon = styled(BadgeSVG)`
  margin-right: 0.125em;
`

export default function Jacuzzi() {
  const { chainId, account } = useActiveWeb3React()
  const [approvalSubmitted, setApprovalSubmitted] = useState(false)
  const [ratio, setRatio] = useState(0)
  const [, setEarlyLeavePenalty] = useState(0)
  const [earlyLeavePenaltyAfterUnlockDate, setEarlyLeavePenaltyAfterUnlockDate] = useState(0)
  const [, setUnlockDate] = useState(new Date().toLocaleString())
  const [userYAYBalance, setUserYAYBalance] = useState(0)
  const [jacuzziYAYStake, setJacuzziYAYStake] = useState(0)
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false)

  const [displayTotalLiquidity, setDisplayTotalLiquidity] = useState('')
  const [displayTotalSupply, setDisplayTotalsupply] = useState('')
  const [displayUserTotalLiquidity, setDisplayUserTotalLiquidity] = useState('')
  const [displayUserTotalSupply, setDisplayUserTotalsupply] = useState('')

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const confirmed = useMemo(() => sortedRecentTransactions.filter((tx: any) => tx.receipt).map((tx: any) => tx.hash), [
    sortedRecentTransactions
  ])

  const parsedMaxAmount = new TokenAmount(
    YAY[chainId ? chainId : ChainId.FUJI],
    JSBI.BigInt(ethers.constants.MaxUint256)
  )
  const parsedCurrentBalance = new TokenAmount(
    YAY[chainId ? chainId : ChainId.FUJI],
    JSBI.BigInt(userYAYBalance * YAY_DECIMALS_DIVISOR)
  )

  const [, handleAprove] = useApproveCallback(parsedMaxAmount, JACUZZI_ADDRESS[chainId ? chainId : ChainId.FUJI])
  const [approval] = useApproveCallback(parsedCurrentBalance, JACUZZI_ADDRESS[chainId ? chainId : ChainId.FUJI])

  const jacuzzi = useJacuzziContract()
  const yay = useYayContract()

  const userCanStake = useMemo(() => {
    const userApprovedYAYJacuzzi = account && approval && approval === ApprovalState.APPROVED
    const userHasYAYs = userYAYBalance > 0

    return userApprovedYAYJacuzzi && userHasYAYs
  }, [approval, userYAYBalance, account])

  // const userCanLeave = useMemo(() => {
  //   const userApprovedYAYJacuzzi = account && approval && approval === ApprovalState.APPROVED
  //   const userHasxYAYs = userxYAYStake > 0

  //   return userApprovedYAYJacuzzi && userHasxYAYs
  // }, [approval, userxYAYStake, account])

  const getRatio = useCallback(async () => {
    if (!jacuzzi || !yay) {
      return setRatio(0)
    }

    const balance = await yay.balanceOf(jacuzzi.address)
    const supply = await jacuzzi.totalSupply()
    if (supply.toString() === '0') {
      return setRatio(0)
    }

    const _ratio = balance.toString() / supply.toString()

    return setRatio(+_ratio.toFixed(3))
  }, [yay, jacuzzi])

  const getPenalty = useCallback(async () => {
    if (!jacuzzi || !yay) {
      return setEarlyLeavePenalty(0)
    }

    const _unlockDate = await jacuzzi.unlockDate()
    setUnlockDate(new Date(_unlockDate * 1000).toLocaleString())

    const maxWithdrawalFee = await jacuzzi.MAX_EARLY_WITHDRAW_FEE()
    const currentWithdrawalFee = await jacuzzi.earlyWithdrawalFee()

    const percentageFee = (100 * currentWithdrawalFee.toNumber()) / maxWithdrawalFee.toNumber()

    if (_unlockDate < new Date().getTime()) {
      setEarlyLeavePenaltyAfterUnlockDate(percentageFee)
      return setEarlyLeavePenalty(0)
    }
    return setEarlyLeavePenalty(percentageFee)
  }, [jacuzzi, yay])

  const createYAYTokenInstance = useCallback(() => {
    return new Token(chainId || ChainId.AVALANCHE, YAY[chainId || ChainId.AVALANCHE].address, 18, 'YAY', 'YAY')
  }, [chainId])

  const createxYAYTokenInstance = useCallback(() => {
    return new Token(
      chainId || ChainId.AVALANCHE,
      JACUZZI_ADDRESS[chainId || ChainId.AVALANCHE] || '',
      18,
      'YAY',
      'YAY'
    )
  }, [chainId])

  const getUserBalances = useCallback(async () => {
    if (!jacuzzi || !yay || !account) {
      setDisplayUserTotalLiquidity('0')
      return setDisplayUserTotalsupply('0')
    }

    const userBalance = await yay.balanceOf(account)
    const jacuzziBalance = await jacuzzi.balanceOf(account)

    const userXyayToYAY = +jacuzziBalance?.toString() * ratio

    setUserYAYBalance(toFixedTwo(userBalance.toString()))

    setDisplayUserTotalLiquidity(
      new TokenAmount(createYAYTokenInstance(), JSBI.BigInt(userXyayToYAY)).toFixed(2, { groupSeparator: ',' })
    )
    setDisplayUserTotalsupply(
      new TokenAmount(createxYAYTokenInstance(), jacuzziBalance).toFixed(2, { groupSeparator: ',' })
    )
  }, [ratio, jacuzzi, yay, account, createYAYTokenInstance, createxYAYTokenInstance])

  const getContractBalances = useCallback(async () => {
    if (!jacuzzi || !yay) {
      setDisplayTotalsupply('0')
      return setJacuzziYAYStake(0)
    }

    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    setJacuzziYAYStake(toFixedTwo(yayJacuzziBalance.toString()))

    setDisplayTotalLiquidity(
      new TokenAmount(createYAYTokenInstance(), yayJacuzziBalance).toFixed(2, { groupSeparator: ',' })
    )
    setDisplayTotalsupply(
      new TokenAmount(createxYAYTokenInstance(), yayJacuzziBalance).toFixed(2, { groupSeparator: ',' })
    )
  }, [jacuzzi, yay, chainId, createYAYTokenInstance, createxYAYTokenInstance])

  const apr = useMemo(() => {
    const TOKENS_PER_DAY = 32900
    if (!jacuzziYAYStake) {
      return 0
    }

    const roi = TOKENS_PER_DAY / +jacuzziYAYStake?.toString()

    return (roi * 365).toFixed(2)
  }, [jacuzziYAYStake])

  const handleStake = async () => {
    setStakeModalOpen(true)
  }
  const handleLeave = async () => {
    setUnstakeModalOpen(true)
  }

  useEffect(() => {
    getRatio()
    getPenalty()
    getUserBalances()
    getContractBalances()
  }, [getRatio, getPenalty, getUserBalances, getContractBalances, confirmed])

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval])

  const isDarkMode = useIsDarkMode()

  return (
    <Wrapper>
      <JacuzziStakingModal isOpen={stakeModalOpen} onDismiss={() => setStakeModalOpen(false)} />
      <JacuzziLeaveModal isOpen={unstakeModalOpen} onDismiss={() => setUnstakeModalOpen(false)} />

      <div className="jacuzzi">
        {isDarkMode ? <BackgroundImage className="darkMode" /> : <BackgroundImage />}
        <div className="jacuzzi-container">
          <div className="jacuzzi-media">
            <JacuzziImage />
          </div>
          <Item className="poolsGrid-item">
            <div className="poolsGrid-item-content">
              <div className="poolsGrid-item-header">
                <IconYAY />
                <div>
                  <h4>xYAY Pool</h4>
                  <div className="poolsGrid-item-header-features">
                    <span>
                      <BadgeIcon /> Core
                    </span>
                    <span>160X</span>
                  </div>
                </div>
              </div>
              <div className="poolsGrid-item-table">
                <p>
                  APR: <span>{apr}%</span>
                </p>
                <p>
                  xYAY to YAY: <span>{ratio}</span>
                </p>
                <p>
                  Paper Hands Penalty: <span>{earlyLeavePenaltyAfterUnlockDate}%</span>
                </p>
              </div>
              <div className="poolsGrid-item-grid">
                <div>
                  <p>xYAY Staked</p>
                  <p>{displayUserTotalSupply}</p>
                </div>
                <div>
                  <p>YAY Equivalent</p>
                  <p>{displayUserTotalLiquidity}</p>
                </div>
              </div>
              {!approvalSubmitted && (
                <>
                  {approval === ApprovalState.NOT_APPROVED && (
                    <ButtonPrimary onClick={handleAprove}>Approve YAY</ButtonPrimary>
                  )}
                </>
              )}
              {userCanStake ? (
                <ButtonGroup>
                  <ButtonPrimary onClick={handleStake}>Add</ButtonPrimary>
                  <ButtonPrimary onClick={handleLeave}>Remove</ButtonPrimary>
                </ButtonGroup>
              ) : (
                ''
              )}
            </div>
            <div className="grid-item-details">
              <details>
                <summary>
                  <span className="grid-item-details-btn">
                    Details
                    <ArrowDown />
                  </span>
                </summary>
                <div className="poolsGrid-item-table">
                  <p>
                    Total Liquidity: <span> {displayTotalLiquidity} YAY</span>
                  </p>
                  <p>
                    Total xYAY Supply: <span>{displayTotalSupply}</span>
                  </p>
                  <a href="https://cchain.explorer.avax.network/address/0x68583A0a7e763400B8B0904095133F76922657ae/transactions">
                    See Token Info <ExtLink />
                  </a>
                  <a href="https://partyswap.gitbook.io/partyswap/jacuzzis">
                    How it works <ExtLink />
                  </a>
                </div>
              </details>
            </div>
          </Item>
        </div>
      </div>
    </Wrapper>
  )
}
