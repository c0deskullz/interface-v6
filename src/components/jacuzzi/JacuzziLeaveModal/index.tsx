import React, { useEffect, useState, useCallback } from 'react'
import Modal from '../../Modal'
import { AutoColumn } from '../../Column'
import styled from 'styled-components'
import { RowBetween } from '../../Row'
import { TYPE, CloseIcon } from '../../../theme'
import { ButtonPrimary } from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import { useJacuzziContract, useYayContract } from '../../../hooks/useContract'
import { JACUZZI_ADDRESS, toFixedTwo, YAY_DECIMALS_DIVISOR } from '../../../constants'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { ethers } from 'ethers'
import { ChainId, JSBI } from '@partyswap-libs/sdk'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function JacuzziLeaveModal({ isOpen, onDismiss }: StakingModalProps) {
  const { chainId, account } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState(0)
  const [balance, setBalance] = useState(0)
  const [yayBalance, setYayBalance] = useState(0)
  const jacuzzi = useJacuzziContract()
  const yay = useYayContract()
  const addTransaction = useTransactionAdder()

  const handleSetMax = () => {
    setTypedValue(balance)
  }

  const handleUnstake = async () => {
    if (jacuzzi && typedValue) {
      const _typedValue = ethers.BigNumber.from((typedValue * YAY_DECIMALS_DIVISOR).toString())
      const txReceipt = await jacuzzi.leave(_typedValue)
      addTransaction(txReceipt, { summary: `Unstake ${typedValue} xYAYs as YAY to Wallet` })
      onDismiss()
    }
  }

  const getUserBalance = useCallback(async () => {
    if (!chainId || !account || !jacuzzi || !yay) {
      return
    }

    const userBalance = await jacuzzi.balanceOf(account)
    const totalSupply = await jacuzzi.totalSupply()
    const yayJacuzziBalance = await yay.balanceOf(JACUZZI_ADDRESS[chainId || ChainId.FUJI])
    let stakedYAY
    if (yayJacuzziBalance.toString() === '0') {
      stakedYAY = JSBI.BigInt(0)
    } else {
      stakedYAY = userBalance.mul(yayJacuzziBalance).div(totalSupply)
    }

    setYayBalance(toFixedTwo(stakedYAY.toString()))
    setBalance(toFixedTwo(userBalance.toString()))
  }, [chainId, account, jacuzzi, yay])

  useEffect(() => {
    getUserBalance()
  }, [getUserBalance])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.mediumHeader>Unstake</TYPE.mediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <RowBetween>Your balance: {balance} xYAYs</RowBetween>
        <RowBetween>Worth: {yayBalance} YAYs</RowBetween>
        <RowBetween>
          <label htmlFor="value_to_unstake">Amount:</label>
          <div>
            <button onClick={handleSetMax}>max</button>
            <input
              type="number"
              name="value_to_unstake"
              value={typedValue}
              onChange={e => setTypedValue(+e.target.value)}
            />
          </div>
        </RowBetween>
        <ButtonPrimary onClick={handleUnstake}>Unstake</ButtonPrimary>
      </ContentWrapper>
    </Modal>
  )
}
