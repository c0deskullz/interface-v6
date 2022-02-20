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

export function ApproveAggregatorToken({ currencies, inputAmmout, router, onApproved }: ApproveAggregatorTokenProps) {
  // const { account } = useActiveWeb3React()
  const currencyInputAmount = tryParseAmount(inputAmmout, currencies.INPUT)
  const [approval, approveCallback] = useApproveCallback(currencyInputAmount, router)
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }

    if (approval === ApprovalState.APPROVED) {
      onApproved()
    }

  }, [approval, approvalSubmitted, onApproved])

  return approval !== ApprovalState.APPROVED &&
    currencyInputAmount?.greaterThan(BigInt(0)) &&
    currencyInputAmount?.currency !== CAVAX ? (
    <Wrapper>
      <span className="hint">You need to approve input token in 1inch router to be able to swap</span>
      <ButtonConfirmed
        onClick={approveCallback}
        disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
        width="48%"
        altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
      >
        {approval === ApprovalState.PENDING ? (
          <AutoRow gap="6px" justify="center">
            Approving <Loader stroke="white" />
          </AutoRow>
        ) : approvalSubmitted ? (
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
