import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WAVAX, Pair } from '@partyswap-libs/sdk'
import { useMemo } from 'react'
import {
  aaBLOCK,
  BAG,
  DAI,
  ETH,
  FRAX,
  LINK,
  PEFI,
  PNG,
  SPORE,
  USDT,
  WBTC,
  YAY,
  ZERO,
  SNOB,
  AVME,
  ELK,
  XAVA
} from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { PairState, usePair, usePairs } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'
import { tryParseAmount } from '../swap/hooks'

export const STAKING_V1: {
  tokens: [Token, Token]
  stakingRewardAddress: string
}[] = []

export const STAKING_V2: {
  tokens: [Token, Token]
  stakingRewardAddress: string
}[] = [
  {
    tokens: [WAVAX[ChainId.FUJI], YAY[ChainId.FUJI]],
    stakingRewardAddress: '0x5A901C9cBd40e4c362ED192bfeAf59E4ac6dd389'
  },
  {
    tokens: [
      WAVAX[ChainId.FUJI],
      new Token(ChainId.FUJI, '0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22', 18, 'FUJISTABLE', 'The Fuji stablecoin')
    ],
    stakingRewardAddress: '0x90457Ebd6503760620005649eB8e797a403221d0'
  }
  // {
  //   tokens: [WAVAX[ChainId.AVALANCHE], YAY[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0x6c272EE99E8e7FbCFA59c781E82E9d64a63b9004'
  // },
  // {
  //   tokens: [YAY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0x74F17bB07D4A096Bb24481378f27272F21012370'
  // }
]

export const STAKING_V2_AVALANCHE: {
  tokens: [Token, Token]
  stakingRewardAddress: string
}[] = [
  {
    tokens: [WAVAX[ChainId.AVALANCHE], YAY[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xCB625aDe11aa79809f4faFe19e117e601FAC72c7'
  },
  {
    tokens: [YAY[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x85196Ea6AF1310145374AE50CC3eaeaBeA79B1af'
  },
  {
    tokens: [YAY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x32174AA3191186283B57eE182982F87601639C0b'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xA2363ce89B48a51E5FaF6A75642a0b111340abD7'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xF55741FF63EAb8E29B46DddE3Ad30E329B578B43'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x96D858143c057e608cd42972670E6b05B68d0bc3'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], aaBLOCK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x0573F3177Ad734D5d16f0c78bdFFA2fD5D266059'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SPORE[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x51DC60DD02E6393c67F031C74021fA9bB1718262'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], BAG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xD9690b58b8e5F5aAeDe625aFfaa1F8f06A0144a5'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x421Ddca249fA5fDDCa84f5e25fCE8E45117081C7'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PEFI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x2016824D66fB791c0b09daf6a94eFAa7256BdB28'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], FRAX[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xE3e7725728aAa5239ed73d5b163AdbB4B13C025E'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ZERO[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x3b9b4502A9980be3C46BefcFa637ec9Ed0be2485'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SNOB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xa2aF347ddc105011AA07924166Fb90E3Bae172D2'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ELK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x40beFEad4fe1Da122D51857403DF940C800F71AF'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x74Ea968eD0b1a8135A42d8B55dbE578BeD10c985'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], AVME[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xBf42a3C4760d230C0FF5D661D9a444b7D6A200f7'
  }
]

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
  }[][]
} = {
  [ChainId.FUJI]: [STAKING_V1, STAKING_V2],
  [ChainId.AVALANCHE]: [STAKING_V1, STAKING_V2_AVALANCHE] //TODO add staking reward farms
}

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
}

const calculateTotalStakedAmountInAvaxFromYay = function(
  totalSupply: JSBI,
  avaxYayPairReserveOfYay: JSBI,
  avaxYayPairReserveOfOtherToken: JSBI,
  stakingTokenPairReserveOfYay: JSBI,
  totalStakedAmount: TokenAmount
): TokenAmount {
  if (JSBI.EQ(totalSupply, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[ChainId.FUJI], JSBI.BigInt(0))
  }
  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxYayRatio = JSBI.divide(JSBI.multiply(oneToken, avaxYayPairReserveOfOtherToken), avaxYayPairReserveOfYay)

  const valueOfYayInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfYay, avaxYayRatio), oneToken)

  return new TokenAmount(
    WAVAX[ChainId.FUJI],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, valueOfYayInAvax),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply
    )
  )
}

const calculteTotalStakedAmountInAvax = function(
  totalSupply: JSBI,
  reserveInWavax: JSBI,
  totalStakedAmount: TokenAmount
): TokenAmount {
  if (JSBI.GT(totalSupply, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[ChainId.FUJI],
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(totalStakedAmount.raw, reserveInWavax),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
        ),
        totalSupply
      )
    )
  } else {
    return new TokenAmount(WAVAX[ChainId.FUJI], JSBI.BigInt(0))
  }
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(version: number, pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId || ChainId.FUJI]?.[version]?.filter(stakingRewardInfo =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
          ) ?? []
        : [],
    [chainId, pairToFilterBy, version]
  )

  // console.log('info: ', info)

  const yay = YAY[chainId || ChainId.FUJI]

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  // console.log('reward addresses: ', rewardsAddresses)

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const tokens = useMemo(() => info.map(({ tokens }) => tokens), [info])
  // console.log('tokens: ', tokens)
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const pairs = usePairs(tokens)
  // console.log('pairs: ', pairs)
  const [avaxYayPairState, avaxYayPair] = usePair(WAVAX[chainId || ChainId.FUJI], yay)

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

  return useMemo(() => {
    if (!chainId || !yay) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]
      const [pairState, pair] = pairs[index]

      // console.log('pair', pair, 'avaxYayPair', avaxYayPair)
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
        pair &&
        avaxYayPair &&
        pairState !== PairState.LOADING &&
        avaxYayPairState !== PairState.LOADING
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxYayPairState === PairState.INVALID ||
          avaxYayPairState === PairState.NOT_EXISTS
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
        const totalRewardRate = new TokenAmount(yay, JSBI.BigInt(rewardRateState.result?.[0]))
        const isAvaxPool = tokens[0].equals(WAVAX[tokens[0].chainId])
        const totalStakedInWavax = isAvaxPool
          ? calculteTotalStakedAmountInAvax(totalSupply, pair.reserveOf(wavax).raw, totalStakedAmount)
          : calculateTotalStakedAmountInAvaxFromYay(
              totalSupply,
              avaxYayPair.reserveOf(yay).raw,
              avaxYayPair.reserveOf(WAVAX[tokens[1].chainId]).raw,
              pair.reserveOf(yay).raw,
              totalStakedAmount
            )

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount
        ): TokenAmount => {
          return new TokenAmount(
            yay,
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
          earnedAmount: new TokenAmount(yay, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          totalStakedInWavax: totalStakedInWavax,
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
    avaxYayPairState,
    pairs,
    yay,
    avaxYayPair
  ])
}

export function useTotalYayEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const yay = chainId ? YAY[chainId] : undefined
  const stakingInfo1 = useStakingInfo(0)
  const stakingInfo2 = useStakingInfo(1)

  let earned1 = useMemo(() => {
    if (!yay) return undefined
    return (
      stakingInfo1?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(yay, '0')
      ) ?? new TokenAmount(yay, '0')
    )
  }, [stakingInfo1, yay])

  let earned2 = useMemo(() => {
    if (!yay) return undefined
    return (
      stakingInfo2?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(yay, '0')
      ) ?? new TokenAmount(yay, '0')
    )
  }, [stakingInfo2, yay])

  let total = earned1 ? (earned2 ? earned1.add(earned2) : earned1) : earned2 ? earned2 : undefined
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
