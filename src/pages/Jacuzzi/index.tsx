import { ChainId, JSBI, TokenAmount } from '@partyswap-libs/sdk'
import { ethers } from 'ethers'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { JACUZZI_ADDRESS, YAY, YAY_DECIMALS_DIVISOR } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useJacuzziContract, useYayContract } from '../../hooks/useContract'
import { ButtonPrimary } from '../../components/Button'
import JacuzziStakingModal from '../../components/jacuzzi/JacuzziStakingModal'
import JacuzziLeaveModal from '../../components/jacuzzi/JacuzziLeaveModal'

const Wrapper = styled.div`
  display: flex;
  padding: 1rem;
  flex-direction: column;
  border-radius: 1rem;
  border: 1px solid gray;

  div {
    margin: 0.5rem 0;
  }
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
    return setRatio(balance.div(supply).toString())
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
    const stakedYAY = jacuzziBalance.mul(totalSupply).div(yayJacuzziBalance)
    setUserYAYBalance(+userBalance.toString() / YAY_DECIMALS_DIVISOR)
    setUserXYAYStake(+jacuzziBalance.toString() / YAY_DECIMALS_DIVISOR)
    setUserYAYStake(+stakedYAY.toString() / YAY_DECIMALS_DIVISOR)
  }, [jacuzzi, yay, account, chainId])

  const getContractBalances = useCallback(async () => {
    if (!jacuzzi || !yay) {
      setJacuzziXYAYStake(0)
      return setJacuzziYAYStake(0)
    }

    const totalSupply = await jacuzzi.totalSupply()
    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    setJacuzziXYAYStake(+totalSupply.toString() / YAY_DECIMALS_DIVISOR)
    setJacuzziYAYStake(+yayJacuzziBalance.toString() / YAY_DECIMALS_DIVISOR)
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
  }, [getRatio, getPenalty, getUserBalances, getContractBalances])

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval])

  return (
    <Wrapper>
      YAY Pool
      {!approvalSubmitted && (
        <>
          {approval === ApprovalState.NOT_APPROVED && <ButtonPrimary onClick={handleAprove}>Approve YAY</ButtonPrimary>}
        </>
      )}
      <div>
        <div>{userCanStake ? <ButtonPrimary onClick={handleStake}>Stake</ButtonPrimary> : ''}</div>
        <div>{userCanLeave ? <ButtonPrimary onClick={handleLeave}>Leave</ButtonPrimary> : ''}</div>
      </div>
      <div>xYAY to YAY: {ratio}</div>
      <div>
        Paper hands penalty: {earlyLeavePenalty}% right now ({earlyLeavePenaltyAfterUnlockDate}% after {unlockDate})
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
    </Wrapper>
  )
}
