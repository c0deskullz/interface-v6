import React, { useEffect, useState, useCallback } from 'react'
import Modal from '../../Modal'
import { AutoColumn } from '../../Column'
import styled from 'styled-components'
import { RowBetween } from '../../Row'
import { TYPE, CloseIcon } from '../../../theme'
import { ButtonPrimary } from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import { useJacuzziContract } from '../../../hooks/useContract'
import { YAY_DECIMALS_DIVISOR } from '../../../constants'
import { useTransactionAdder } from '../../../state/transactions/hooks'

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
  const jacuzzi = useJacuzziContract()
  const addTransaction = useTransactionAdder()

  const handleSetMax = () => {
    setTypedValue(balance)
  }

  const handleUnstake = async () => {
    if (jacuzzi && typedValue) {
      const txReceipt = await jacuzzi.leave(typedValue * YAY_DECIMALS_DIVISOR)
      addTransaction(txReceipt, { summary: `Unstake ${typedValue} xYAYs as YAY to Wallet` })
      onDismiss()
    }
  }

  const getUserBalance = useCallback(async () => {
    if (!chainId || !account || !jacuzzi) {
      return
    }

    const userBalance = await jacuzzi.balanceOf(account)
    setBalance(+userBalance.toString() / YAY_DECIMALS_DIVISOR)
  }, [chainId, account, jacuzzi])

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
