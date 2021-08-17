import React, { useEffect, useState, useCallback } from 'react'
import Modal from '../../Modal'
import { AutoColumn } from '../../Column'
import styled from 'styled-components'
import { RowBetween } from '../../Row'
import { TYPE, CloseIcon } from '../../../theme'
import { ButtonPrimary } from '../../../components/Button'
import { useActiveWeb3React } from '../../../hooks'
import { useJacuzziContract, useYayContract } from '../../../hooks/useContract'
import { JACUZZI_ADDRESS, toFixedTwo, YAY } from '../../../constants'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { ChainId, JSBI } from '@partyswap-libs/sdk'
import { tryParseAmount } from '../../../state/swap/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const InfoWrapper = styled.div`
  & p {
    margin-bottom: 1rem;
  }
  & p:last-child {
    margin-bottom: 0;
  }
`

const UnstakeAmount = styled(RowBetween)`
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 1.5rem;
  background-color: ${({ theme }) => theme.surface5};
  border-radius: 1.25rem;
  padding: 1rem 1rem;
  button {
    font-size: 1rem;
    padding: 0.75rem 1rem;
    background-color: ${({ theme }) => theme.primaryText3};
    border: 2px solid ${({ theme }) => theme.primaryText3};
    border-radius: 1.5rem;
    color: #fff;
    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.primary1};
      border-color: ${({ theme }) => theme.primary1};
    }
  }
  > * {
    height: 100%;
  }
`

const StakeInput = styled.input`
  color: ${({ theme }) => theme.text1};
  background-color: transparent;
  border: none;
  padding: 0.5rem;
  font-size: 15px;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function JacuzziLeaveModal({ isOpen, onDismiss }: StakingModalProps) {
  const { chainId, account } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState<string>('0')
  const [balance, setBalance] = useState(0)
  const [yayBalance, setYayBalance] = useState(0)
  const jacuzzi = useJacuzziContract()
  const yay = useYayContract()
  const addTransaction = useTransactionAdder()

  const parsedAmmount = tryParseAmount(typedValue, YAY[chainId || ChainId.FUJI])

  const handleSetMax = () => {
    setTypedValue(balance.toString())
  }

  const handleUnstake = async () => {
    if (jacuzzi && parsedAmmount) {
      const txReceipt = await jacuzzi.leave(`0x${parsedAmmount?.raw.toString(16)}`)
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
    if (isOpen) {
      getUserBalance()
    }
  }, [getUserBalance, isOpen])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <RowBetween>
          <TYPE.largeHeader>Unstake</TYPE.largeHeader>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <InfoWrapper>
          <p>Your balance: {balance} xYAYs</p>
          <p>Worth: {yayBalance} YAYs</p>
        </InfoWrapper>
        <UnstakeAmount>
          <button onClick={handleSetMax}>MAX</button>
          <StakeInput
            type="number"
            name="value_to_unstake"
            value={typedValue}
            onChange={e => setTypedValue(e.target.value)}
          />
        </UnstakeAmount>
        <ButtonPrimary onClick={handleUnstake}>Unstake</ButtonPrimary>
      </ContentWrapper>
    </Modal>
  )
}
