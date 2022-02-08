import { ChainId, CurrencyAmount, JSBI, Pair, Token, TokenAmount, WAVAX } from '@partyswap-libs/sdk'
import { useCallback, useMemo } from 'react'
import { PARTY, STAKING_REWARDS_INFO, USDT } from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { PairState, usePair, usePairs } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { useLiquidityPoolManagerContract } from '../../hooks/useContract'
import {
  MethodArg,
  NEVER_RELOAD,
  OptionalMethodInputs,
  useMultipleContractSingleData,
  useSingleContractMultipleData
} from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'
export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  //  total staked Avax in the pool
  totalStakedInWavax: TokenAmount
  // when the period ends
  periodFinish: Date | undefined
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount
  ) => TokenAmount
  multiplier?: JSBI
  delisted?: boolean
}

const calculateTotalStakedAmountInAvaxFromParty = function(
  totalSupply: JSBI,
  avaxPartyPairReserveOfParty: JSBI,
  avaxPartyPairReserveOfOtherToken: JSBI,
  stakingTokenPairReserveOfParty: JSBI,
  totalStakedAmount: TokenAmount,
  chainId?: ChainId
): TokenAmount {
  if (JSBI.EQ(totalSupply, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[chainId || ChainId.AVALANCHE], JSBI.BigInt(0))
  }
  const oneToken = JSBI.BigInt(1000000000000000000)

  const avaxPartyRatio =
    avaxPartyPairReserveOfParty !== JSBI.BigInt(0)
      ? JSBI.divide(JSBI.multiply(oneToken, avaxPartyPairReserveOfOtherToken), avaxPartyPairReserveOfParty)
      : JSBI.BigInt(0)

  const valueOfPartyInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfParty, avaxPartyRatio), oneToken)

  return new TokenAmount(
    WAVAX[chainId || ChainId.AVALANCHE],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, valueOfPartyInAvax),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply
    )
  )
}

const calculateTotalStakedAmountInAvaxFromStableToken = function(
  totalSupply: JSBI,
  avaxStablePairReserveOfStable: JSBI,
  avaxStablePairReserveOfOtherToken: JSBI,
  stakingTokenPairReserveOfStable: JSBI,
  totalStakedAmount: TokenAmount,
  chainId?: ChainId
): TokenAmount {
  if (JSBI.EQ(totalSupply, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[chainId || ChainId.AVALANCHE], JSBI.BigInt(0))
  }
  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxStableRatio =
    avaxStablePairReserveOfStable !== JSBI.BigInt(0)
      ? JSBI.divide(JSBI.multiply(oneToken, avaxStablePairReserveOfOtherToken), avaxStablePairReserveOfStable)
      : JSBI.BigInt(0)

  const valueOfStableInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfStable, avaxStableRatio), oneToken)

  return new TokenAmount(
    WAVAX[chainId || ChainId.AVALANCHE],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, valueOfStableInAvax),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply
    )
  )
}

const calculteTotalStakedAmountInAvax = function(
  totalSupply: JSBI,
  reserveInWavax: JSBI,
  totalStakedAmount: TokenAmount,
  chainId?: ChainId
): TokenAmount {
  if (JSBI.GT(totalSupply, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[chainId || ChainId.AVALANCHE],
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(totalStakedAmount.raw, reserveInWavax),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
        ),
        totalSupply
      )
    )
  } else {
    return new TokenAmount(WAVAX[chainId || ChainId.AVALANCHE], JSBI.BigInt(0))
  }
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(
  version: number,
  pairToFilterBy?: Pair | null,
  options: { once: boolean } = { once: false }
): StakingInfo[] {
  const { once } = options
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(() => {
    return chainId
      ? STAKING_REWARDS_INFO[chainId || ChainId.AVALANCHE]?.[version]?.filter(stakingRewardInfo =>
          pairToFilterBy === undefined
            ? true
            : pairToFilterBy === null
            ? false
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
              pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
        ) ?? []
      : []
  }, [chainId, pairToFilterBy, version])

  const party = PARTY[chainId || ChainId.AVALANCHE]
  const usdt = USDT[chainId || ChainId.AVALANCHE]

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const pairAddresses = useMemo(() => info.map(({ pair }) => [pair] as MethodArg[]), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  const tokens = useMemo(() => info.map(({ tokens }) => tokens), [info])
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const liquidityPoolManager = useLiquidityPoolManagerContract(version === 2)
  const weights = useSingleContractMultipleData(
    liquidityPoolManager,
    'weights',
    pairAddresses as OptionalMethodInputs[]
  )
  const pairs = usePairs(tokens)
  const [avaxPartyPairState, avaxPartyPair] = usePair(WAVAX[chainId || ChainId.AVALANCHE], party)
  const [avaxUsdtPairState, avaxUsdtPair] = usePair(WAVAX[chainId || ChainId.AVALANCHE], usdt)

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  const callback = useCallback(() => {
    if (!chainId || !party) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const weight = weights[index]
      const [pairState, pair] = pairs[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        weight &&
        !weight.loading &&
        pair &&
        avaxPartyPair &&
        avaxUsdtPair &&
        pairState !== PairState.LOADING &&
        avaxPartyPairState !== PairState.LOADING &&
        avaxUsdtPairState !== PairState.LOADING
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          weight.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxPartyPairState === PairState.INVALID ||
          avaxPartyPairState === PairState.NOT_EXISTS ||
          avaxUsdtPairState === PairState.INVALID ||
          avaxUsdtPairState === PairState.NOT_EXISTS
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const wavax = tokens[0].equals(WAVAX[tokens[0].chainId]) ? tokens[0] : tokens[1]
        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId)
        // check for account, if no account set to 0

        const totalSupply = JSBI.BigInt(totalSupplyState.result?.[0])

        const stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, totalSupply)
        const totalRewardRate = new TokenAmount(party, JSBI.BigInt(rewardRateState.result?.[0]))
        const isAvaxPool = tokens[0].equals(WAVAX[tokens[0].chainId])
        const isPartyPool = tokens[0].equals(PARTY[tokens[0].chainId]) || tokens[1].equals(PARTY[tokens[1].chainId])
        const isStableCoinPool = tokens[0].equals(USDT[tokens[0].chainId]) || tokens[1].equals(USDT[tokens[1].chainId])
        let totalStakedInWavax
        if (isAvaxPool) {
          totalStakedInWavax = calculteTotalStakedAmountInAvax(
            totalSupply,
            pair.reserveOf(wavax).raw,
            totalStakedAmount,
            chainId
          )
        } else if (isPartyPool) {
          totalStakedInWavax = calculateTotalStakedAmountInAvaxFromParty(
            totalSupply,
            avaxPartyPair.reserveOf(party).raw,
            avaxPartyPair.reserveOf(WAVAX[tokens[1].chainId]).raw,
            pair.reserveOf(party).raw,
            totalStakedAmount,
            chainId
          )
        } else if (isStableCoinPool) {
          totalStakedInWavax = calculateTotalStakedAmountInAvaxFromStableToken(
            totalSupply,
            avaxUsdtPair.reserveOf(usdt).raw,
            avaxUsdtPair.reserveOf(WAVAX[tokens[1].chainId]).raw,
            pair.reserveOf(usdt).raw,
            totalStakedAmount,
            chainId
          )
        } else {
          totalStakedInWavax = new TokenAmount(WAVAX[ChainId.AVALANCHE], JSBI.BigInt(0))
        }

        const getMultiplier = (delisted: boolean | undefined, weight: any) => {
          if (delisted) {
            return JSBI.BigInt(0)
          }

          return JSBI.divide(JSBI.BigInt(weight.result?.[0]), JSBI.BigInt(100))
        }

        const multiplier = getMultiplier(info[index].delisted, weight)
        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            party,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber()

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(party, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          totalStakedInWavax: totalStakedInWavax,
          multiplier,
          delisted: info[index].delisted,
          getHypotheticalRewardRate
        })
      }

      return memo
    }, [])
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    avaxPartyPairState,
    pairs,
    party,
    usdt,
    avaxPartyPair,
    weights,
    avaxUsdtPair,
    avaxUsdtPairState
  ])

  const constantValue = useMemo(callback, [chainId, info, rewardsAddresses, avaxPartyPairState, party])

  const changingValue = useMemo(callback, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    avaxPartyPairState,
    pairs,
    party,
    avaxPartyPair,
    weights
  ])

  return once ? constantValue : changingValue
}

export function useTotalPartyEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const party = chainId ? PARTY[chainId] : undefined
  const stakingInfo1 = useStakingInfo(0)
  const stakingInfo2 = useStakingInfo(1)
  const stakingInfoBoosted = useStakingInfo(2)

  let earned1 = useMemo(() => {
    if (!party) return undefined
    return (
      stakingInfo1?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(party, '0')
      ) ?? new TokenAmount(party, '0')
    )
  }, [stakingInfo1, party])

  let earned2 = useMemo(() => {
    if (!party) return undefined
    return (
      stakingInfo2?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(party, '0')
      ) ?? new TokenAmount(party, '0')
    )
  }, [stakingInfo2, party])

  let earnedBoosted = useMemo(() => {
    if (!party) return undefined
    return (
      stakingInfoBoosted?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(party, '0')
      ) ?? new TokenAmount(party, '0')
    )
  }, [stakingInfoBoosted, party])

  let total = earned1
    ? earned2
      ? earnedBoosted
        ? earned1.add(earned2.add(earnedBoosted))
        : earned1.add(earned2)
      : earned1
    : earned2
    ? earned2
    : undefined
  return total
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount'
  }

  return {
    parsedAmount,
    error
  }
}
