import React, { useEffect, useState, useCallback } from 'react'
import Modal from '../../Modal'
import { AutoColumn } from '../../Column'
import styled from 'styled-components'
import { RowBetween } from '../../Row'
import { TYPE, CloseIcon } from '../../../theme'
import { ButtonPrimary } from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import { useJacuzziContract, useYayContract } from '../../../hooks/useContract'
import { toFixedTwo, YAY_DECIMALS_DIVISOR } from '../../../constants'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { ethers } from 'ethers'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function JacuzziStakingModal({ isOpen, onDismiss }: StakingModalProps) {
  const { chainId, account } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState(0)
  const [balance, setBalance] = useState(0)
  const yay = useYayContract()
  const jacuzzi = useJacuzziContract()
  const addTransaction = useTransactionAdder()

  const handleSetMax = () => {
    setTypedValue(balance)
  }

  const handleStake = async () => {
    if (jacuzzi && typedValue) {
      const _typedValue = ethers.BigNumber.from((typedValue * YAY_DECIMALS_DIVISOR).toString())
      const txReceipt = await jacuzzi.enter(_typedValue)

      addTransaction(txReceipt, { summary: `Stake ${typedValue} YAY to Jacuzzi` })
      onDismiss()
    }
  }

  const getUserBalance = useCallback(async () => {
    if (!chainId || !account || !yay) {
      return
    }

    const userBalance = await yay.balanceOf(account)
    setBalance(toFixedTwo(userBalance.toString()))
  }, [chainId, account, yay])

  useEffect(() => {
    getUserBalance()
  }, [getUserBalance])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.mediumHeader>Stake</TYPE.mediumHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <RowBetween>Your balance: {balance} YAY</RowBetween>
        <RowBetween>
          <label htmlFor="value_to_stake">Amount:</label>
          <div>
            <button onClick={handleSetMax}>max</button>
            <input
              type="number"
              name="value_to_stake"
              value={typedValue}
              onChange={e => setTypedValue(+e.target.value)}
            />
          </div>
        </RowBetween>
        <ButtonPrimary onClick={handleStake}>Stake</ButtonPrimary>
      </ContentWrapper>
    </Modal>
  )
}
