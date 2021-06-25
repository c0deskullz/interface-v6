import { ChainId, TokenAmount } from '@partyswap-libs/sdk'
import { ethers } from 'ethers'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { JACUZZI_ADDRESS, YAY } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useJacuzziContract, useYayContract } from '../../hooks/useContract'

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

const Button = styled.button``

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

  const parsedAmount = new TokenAmount(YAY[chainId ? chainId : ChainId.FUJI], ethers.constants.MaxUint256.toString())

  const [approval, handleAprove] = useApproveCallback(parsedAmount, JACUZZI_ADDRESS[chainId || ChainId.FUJI])

  const jacuzzi = useJacuzziContract()
  const yay = useYayContract()

  const userCanStake = useMemo(() => {
    const userApprovedYAYJacuzzi = approval && approval === ApprovalState.APPROVED
    const userHasYAYs = userYAYBalance > 0

    return userApprovedYAYJacuzzi && userHasYAYs
  }, [jacuzzi, yay, approval, userYAYBalance])

  const userCanLeave = useMemo(() => {
    const userApprovedYAYJacuzzi = approval && approval === ApprovalState.APPROVED
    const userHasxYAYs = userxYAYStake > 0

    return userApprovedYAYJacuzzi && userHasxYAYs
  }, [jacuzzi, yay, approval, userxYAYStake])

  const getRatio = async () => {
    if (!jacuzzi || !yay) {
      return setRatio(0)
    }

    const balance = await yay.balanceOf(jacuzzi.address)
    const supply = await jacuzzi.totalSupply()
    return setRatio(balance.div(supply).toString())
  }

  const getPenalty = async () => {
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
  }

  const getUserBalances = async () => {
    if (!jacuzzi || !yay) {
      setUserYAYStake(0)
      return setUserXYAYStake(0)
    }

    const userBalance = await yay.balanceOf(account)
    const jacuzziBalance = await jacuzzi.balanceOf(account)
    const totalSupply = await jacuzzi.totalSupply()
    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    const stakedYAY = jacuzziBalance.mul(totalSupply).div(yayJacuzziBalance)
    setUserYAYBalance(userBalance.toString())
    setUserXYAYStake(jacuzziBalance.toString())
    setUserYAYStake(stakedYAY.toString())
  }

  const getContractBalances = async () => {
    if (!jacuzzi || !yay) {
      setJacuzziXYAYStake(0)
      return setJacuzziYAYStake(0)
    }

    const totalSupply = await jacuzzi.totalSupply()
    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    setJacuzziXYAYStake(totalSupply.toString())
    setJacuzziYAYStake(yayJacuzziBalance.toString())
  }

  const handleStake = async () => {
    console.log('show modal')
  }
  const handleLeave = async () => {
    console.log('show modal')
  }

  useEffect(() => {
    getRatio()
    getPenalty()
    getUserBalances()
    getContractBalances()
  }, [jacuzzi, yay])

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval])

  return (
    <Wrapper>
      YAY Pool
      {!approvalSubmitted && (
        <>{approval === ApprovalState.NOT_APPROVED && <Button onClick={handleAprove}>Approve YAY</Button>}</>
      )}
      <div>
        <span>{userCanStake && <Button onClick={handleStake}>Stake</Button>}</span>
        <span>{userCanLeave && <Button onClick={handleLeave}>Leave</Button>}</span>
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
    </Wrapper>
  )
}
