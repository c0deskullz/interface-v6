import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ButtonConfirmed } from '../Button'
import Loader from '../Loader'
import { AutoRow } from '../Row'
import { Field } from '../../state/swap/actions'
import { CAVAX, Currency } from '@partyswap-libs/sdk'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { tryParseAmount } from '../../state/swap/hooks'

const Wrapper = styled.div`
  span.hint {
    font-size: small;
  }
`

interface ApproveAggregatorTokenProps {
  allowance: number
  currencies: {
    INPUT?: Currency | undefined
    OUTPUT?: Currency | undefined
  }
  inputTokenAddress: string | undefined
  inputAmmout: string
  router: string
  onApproved: () => void
}

// async function signAndSendTransaction(transaction: any) {
//   const { rawTransaction } = await web3.eth.accounts.signTransaction(transaction, privateKey)

//   return await broadCastRawTransaction(rawTransaction)
// }

// const apiBaseUrl = 'https://api.1inch.io/v4.0/' + 43114

// function apiRequestUrl(methodName: string, queryParams: any) {
//   return apiBaseUrl + methodName + '?' + new URLSearchParams(queryParams).toString()
// }

export function ApproveAggregatorToken({
  allowance,
  currencies,
  inputAmmout,
  router,
  onApproved
}: ApproveAggregatorTokenProps) {
  // const { account } = useActiveWeb3React()
  const currencyInputAmount = tryParseAmount(inputAmmout, currencies.INPUT)
  const [approval, approveCallback] = useApproveCallback(currencyInputAmount, router)
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // async function buildTxForApproveTradeWithRouter(tokenAddress: string, amount: string) {
  //   const url = apiRequestUrl('/approve/transaction', amount ? { tokenAddress, amount } : { tokenAddress })

  //   const transaction = await fetch(url).then(res => res.json())

  //   console.log(account, ': attempted tx')
  //   console.log(transaction, ': tx details')
  //   // const gasLimit = await web3.eth.estimateGas({
  //   //   ...transaction,
  //   //   from: account
  //   // })

  //   return {
  //     ...transaction
  //     // gas: gasLimit
  //   }
  // }

  // const wait = async () => {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       console.log('just awaited some time :)')
  //       return resolve(true)
  //     }, 5000)
  //   })
  // }

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }

    if (approval === ApprovalState.APPROVED) {
      onApproved()
    }

    console.log(approval, ApprovalState.APPROVED)
  }, [approval, approvalSubmitted, onApproved])

  return allowance <= 0 && currencyInputAmount?.greaterThan(BigInt(0)) && currencyInputAmount?.currency !== CAVAX ? (
    <Wrapper>
      <span className="hint">You need to approve input token in 1inch router to be able to swap</span>
      <ButtonConfirmed
        onClick={approveCallback}
        disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
        width="48%"
        altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
        confirmed={approval === ApprovalState.APPROVED}
      >
        {approval === ApprovalState.PENDING ? (
          <AutoRow gap="6px" justify="center">
            Approving <Loader stroke="white" />
          </AutoRow>
        ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
          'Approved'
        ) : (
          'Approve ' + currencies[Field.INPUT]?.symbol
        )}
      </ButtonConfirmed>
    </Wrapper>
  ) : (
    <></>
  )
}
