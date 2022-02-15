import { parseUnits } from '@ethersproject/units'
import {
  CAVAX,
  ChainId,
  Currency,
  CurrencyAmount,
  FACTORY_ADDRESS,
  JSBI,
  Token,
  TokenAmount,
  Trade,
  WAVAX
} from '@partyswap-libs/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ONEINCH_BASE_URL, PARTY_V1, ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useTradeExactIn, useTradeExactOut } from '../../hooks/Trades'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import { isAddress } from '../../utils'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { AppDispatch, AppState } from '../index'
import { WrappedTokenInfo } from '../lists/hooks'
import { useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'
import axios from 'axios'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>(state => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === CAVAX ? 'AVAX' : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  FACTORY_ADDRESS[ChainId.AVALANCHE], // v2 factory
  ROUTER_ADDRESS[ChainId.AVALANCHE] // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  inputError?: string
  v1Trade: Trade | undefined
} {
  const { account, chainId } = useActiveWeb3React()

  const toggledVersion = useToggledVersion()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientAddress = isAddress(recipient)
  const to: string | null = (recipientAddress ? recipientAddress : account) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency | WrappedTokenInfo } = useMemo(() => {
    return {
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined
    }
  }, [inputCurrency, outputCurrency])

  // get link to trade on v1, if a better rate exists
  const v1Trade = undefined

  let inputError: string | undefined

  if (
    outputCurrency instanceof WrappedTokenInfo &&
    outputCurrency.address === PARTY_V1[chainId || ChainId.AVALANCHE].address
  ) {
    inputError = inputError ?? `Try swapping to PARTY V2`
  }

  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  const slippageAdjustedAmountsV1 =
    v1Trade && allowedSlippage && computeSlippageAdjustedAmounts(v1Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    toggledVersion === Version.v1
      ? slippageAdjustedAmountsV1
        ? slippageAdjustedAmountsV1[Field.INPUT]
        : null
      : slippageAdjustedAmounts
      ? slippageAdjustedAmounts[Field.INPUT]
      : null
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    v1Trade
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'AVAX') return 'AVAX'
    if (valid === false) return 'AVAX'
  }
  return 'AVAX' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}

export function useCurrenciesAddresses(currency: Currency | undefined): string | undefined {
  const { chainId } = useActiveWeb3React()
  if (currency) {
    //@ts-ignore
    return currency.symbol === 'AVAX' ? WAVAX[chainId || ChainId.AVALANCHE].address : currency.address
  }

  return undefined
}

async function lookupTokenIn1Inch(address: string, callback: (result: boolean) => void) {
  const chainId = 43114

  try {
    const {
      data: { tokens }
    } = await axios.get(`${ONEINCH_BASE_URL}${chainId}/tokens`)
    return callback(!!(tokens[address]?.address || tokens[address.toLowerCase()]?.address))
  } catch (error) {
    console.error(error, ': API NOT HEALTHY')
  }
}

async function get1InchSpender(callback: (result: string) => void) {
  const chainId = 43114

  try {
    const {
      data: { address }
    } = await axios.get(`${ONEINCH_BASE_URL}${chainId}/approve/spender`)
    console.log(address, ': ROUTER')
    return callback(address)
  } catch (error) {
    console.error(error, ': API NOT HEALTHY')
  }
}

export function useTokenIsAvailableInAggregator(address: string | undefined) {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    if (address) {
      lookupTokenIn1Inch(address, setAvailable)
    }
  }, [address])

  return available
}

async function checkAllowance(tokenAddress: string, walletAddress: string, callback: (result: any) => void) {
  const chainId = 43114

  try {
    const result = await axios.get(
      `${ONEINCH_BASE_URL}${chainId}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress}`
    )

    callback(result.data.allowance)
  } catch (error) {
    console.log(error)
  }
}

export function useAggregatorTokenAllowance(address: string | undefined, available: boolean) {
  const { account } = useActiveWeb3React()
  const [allowance, setAllowance] = useState(0)
  if (address && available && account) {
    checkAllowance(address, account, setAllowance)
  }

  return {
    allowance,
    async checkAllowanceCallback() {
      if (address && account && available) {
        checkAllowance(address, account, setAllowance)
      }
    }
  }
}

export function useAggregatorRouterAddress() {
  const [address, setAddress] = useState('')

  useEffect(() => {
    get1InchSpender(setAddress)
  }, [])

  return address
}

async function quoteOnAggregator(
  inputTokenAddress: string,
  outputTokenAddress: string,
  amount: string,
  callback: (result: any) => void,
  onError: (error: any) => void
) {
  const chainId = 43114

  try {
    const result = await axios.get(
      `${ONEINCH_BASE_URL}${chainId}/quote?fromTokenAddress=${inputTokenAddress}&toTokenAddress=${outputTokenAddress}&amount=${amount}`
    )

    callback(result.data)
  } catch (error) {
    onError(error)
    console.log(error)
  }
}

export function useQuoteOnAgggregator(
  inputTokenAddress: string,
  outputTokenAddress: string,
  amount: CurrencyAmount | undefined
): {
  data:
    | {
        estimatedGas: number
        fromToken: { symbol: string; name: string; decimals: number; address: string; logoURI: string }
        fromTokenAmount: string
        protocols: { fromTokenAddress: string; name: string; part: number; toTokenAddress: string }[][][]
        toToken: { symbol: string; name: string; decimals: number; address: string; logoURI: string }
        toTokenAmount: string
      }
    | undefined
  error: any
} {
  const [data, setData] = useState()
  const [error, setError] = useState()

  const handleError = (error: any) => {
    setData(undefined)
    setError(error)
  }

  useEffect(() => {
    if (data) {
      setError(undefined)
    }
  }, [data])

  useEffect(() => {
    if (inputTokenAddress && outputTokenAddress && amount) {
      quoteOnAggregator(inputTokenAddress, outputTokenAddress, amount.raw.toString(), setData, handleError)
    }
  }, [inputTokenAddress, outputTokenAddress, amount])

  return { data, error }
}
