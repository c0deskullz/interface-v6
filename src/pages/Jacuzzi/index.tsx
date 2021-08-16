import { ChainId, JSBI, TokenAmount } from '@partyswap-libs/sdk'
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
  margin-top: -2rem;
  background-color: ${({ theme }) => theme.surface3};
  @media (min-width: 720px) {
    margin-top: -100px;
  }
`

const BackgroundImage = styled.div`
  position: absolute;
  background-color: #f6f6ff;
  background-image: url(${pattern});
  height: 100%;
  width: 100%;
  top: 0;
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

const JacuzziCard = styled.div`
  display: flex;
  padding: 1rem;
  flex-direction: column;
  border-radius: 1rem;
  border: 1px solid gray;

  display: none;

  div {
    margin: 0.5rem 0;
  }
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
  const [earlyLeavePenalty, setEarlyLeavePenalty] = useState(0)
  const [earlyLeavePenaltyAfterUnlockDate, setEarlyLeavePenaltyAfterUnlockDate] = useState(0)
  const [unlockDate, setUnlockDate] = useState(new Date().toLocaleString())
  const [userxYAYStake, setUserXYAYStake] = useState(0)
  const [userYAYStake, setUserYAYStake] = useState(0)
  const [userYAYBalance, setUserYAYBalance] = useState(0)
  const [jacuzziXYAYStake, setJacuzziXYAYStake] = useState(0)
  const [jacuzziYAYStake, setJacuzziYAYStake] = useState(0)
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false)

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

  const userCanLeave = useMemo(() => {
    const userApprovedYAYJacuzzi = account && approval && approval === ApprovalState.APPROVED
    const userHasxYAYs = userxYAYStake > 0

    return userApprovedYAYJacuzzi && userHasxYAYs
  }, [approval, userxYAYStake, account])

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

  const getUserBalances = useCallback(async () => {
    if (!jacuzzi || !yay || !account) {
      setUserYAYStake(0)
      return setUserXYAYStake(0)
    }

    const userBalance = await yay.balanceOf(account)
    const jacuzziBalance = await jacuzzi.balanceOf(account)
    const totalSupply = await jacuzzi.totalSupply()
    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    let stakedYAY
    if (yayJacuzziBalance.toString() === '0') {
      stakedYAY = JSBI.BigInt(0)
    } else {
      stakedYAY = jacuzziBalance.mul(yayJacuzziBalance).div(totalSupply)
    }
    setUserYAYBalance(toFixedTwo(userBalance.toString()))
    setUserXYAYStake(toFixedTwo(jacuzziBalance.toString()))
    setUserYAYStake(toFixedTwo(stakedYAY.toString()))
  }, [jacuzzi, yay, account, chainId])

  const getContractBalances = useCallback(async () => {
    if (!jacuzzi || !yay) {
      setJacuzziXYAYStake(0)
      return setJacuzziYAYStake(0)
    }

    const totalSupply = await jacuzzi.totalSupply()
    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    setJacuzziXYAYStake(toFixedTwo(totalSupply.toString()))
    setJacuzziYAYStake(toFixedTwo(yayJacuzziBalance.toString()))
  }, [jacuzzi, yay, chainId])

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
                  APR: <span>500.00%</span>
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
                  <p>xYAY staked</p>
                  <p>{userxYAYStake}</p>
                </div>
                <div>
                  <p>YAY staked</p>
                  <p>{userYAYStake}</p>
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
                    Total Liquidity: <span>$643,936</span>
                  </p>
                  <a href="https://avascan.info/">
                    See Token Info <ExtLink />
                  </a>
                  <a href="https://avascan.info/">
                    View Project Site <ExtLink />
                  </a>
                  <a href="https://avascan.info/">
                    View Contract <ExtLink />
                  </a>
                </div>
              </details>
            </div>
          </Item>
        </div>
      </div>
      <JacuzziCard>
        YAY Pool
        {!approvalSubmitted && (
          <>
            {approval === ApprovalState.NOT_APPROVED && (
              <ButtonPrimary onClick={handleAprove}>Approve YAY</ButtonPrimary>
            )}
          </>
        )}
        <div>
          <div>{userCanStake ? <ButtonPrimary onClick={handleStake}>Stake</ButtonPrimary> : ''}</div>
          <div>{userCanLeave ? <ButtonPrimary onClick={handleLeave}>Leave</ButtonPrimary> : ''}</div>
        </div>
        <div>xYAY to YAY: {ratio}</div>
        <div>
          Paper hands penalty: {earlyLeavePenaltyAfterUnlockDate}% right now ({earlyLeavePenalty}% after {unlockDate})
        </div>
        <div>
          Your Stake:
          <div>xYAY: {userxYAYStake}</div>
          <div>YAY: {userYAYStake}</div>
        </div>
        <div>
          Total Stake:
          <div>xYAY: {jacuzziXYAYStake}</div>
          <div>YAY: {jacuzziYAYStake}</div>
        </div>
        <JacuzziStakingModal isOpen={stakeModalOpen} onDismiss={() => setStakeModalOpen(false)} />
        <JacuzziLeaveModal isOpen={unstakeModalOpen} onDismiss={() => setUnstakeModalOpen(false)} />
      </JacuzziCard>
    </Wrapper>
  )
}
