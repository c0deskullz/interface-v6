import React, { useContext, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import Card from '../../components/Card'
import { ButtonError } from '../../components/Button'
import { useIsTransactionPending } from '../../state/transactions/hooks'
import {
  // useAirdropIsClaimingAllowed,
  useClaimCallback
  // useUserHasAvailableClaim,
  // useUserUnclaimedAmount
} from '../../state/airdrop/hooks'
import { useActiveWeb3React } from '../../hooks'
import Confetti from '../../components/Confetti'
// import { useTokenBalance } from '../../state/wallet/hooks'
// import { UNI, SUSHI } from '../../constants'
// import {
//   ChainId
//   // JSBI
// } from '@partyswap-libs/sdk'

const PageWrapper = styled(AutoColumn)``

const TopSection = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

export default function Airdrop() {
  const {
    account
    // chainId
  } = useActiveWeb3React()

  const theme = useContext(ThemeContext)

  // used for UI loading states
  const [attempting, setAttempting] = useState<boolean>(false)

  const canClaim = true

  // use the hash to monitor this txn

  function onClaim() {
    console.log('CLAIM')
  }

  return (
    <PageWrapper gap="lg" justify="center">
      {}
      {/* COMO SE VERIA SI EL USUARIO NO ESTÄ EN NINGUNA WHITELIST */}
      {/* COMO SE VERIA SI EL USUARIO ESTA EN AMBAS WHITELISTS */}
      {/* COMO SE VERIA SI EL USUARIO ESTA EN AMBAS WHITELISTS */}
      {/* LOADING STATUS AL HACER CLAIM */}
      {/* SUCCESS ? */}
    </PageWrapper>
  )
}
