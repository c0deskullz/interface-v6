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
  PARTY,
  // ZERO,
  SNOB,
  AVME,
  ELK,
  XAVA,
  SHERPA,
  YAK
} from '../../constants'
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

export const STAKING_V1: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
}[] = []

export const STAKING_V2: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
}[] = [
  {
    tokens: [WAVAX[ChainId.FUJI], PARTY[ChainId.FUJI]],
    stakingRewardAddress: '0x9BCa2B10aE15C414Fe1FD9066c1D4c2C9B6CC68e',
    pair: '0x4D2eF43d714308313F15660f91Ab4E4690a12D06'
  },
  {
    tokens: [
      WAVAX[ChainId.FUJI],
      new Token(ChainId.FUJI, '0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22', 18, 'FUJISTABLE', 'The Fuji stablecoin')
    ],
    stakingRewardAddress: '0x4De06B6F04276d733D6e57B0a16D0eceaa67CbeA',
    pair: '0xb81853e2D8cE364416B6F07866ea3647de3AF7dA'
  },
  {
    tokens: [
      PARTY[ChainId.FUJI],
      new Token(ChainId.FUJI, '0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22', 18, 'FUJISTABLE', 'The Fuji stablecoin')
    ],
    stakingRewardAddress: '0x827906e86e2898F8A71F5D76ca69579CfB55a4Eb',
    pair: '0xa7708CdbEF47656d145528cC90A191Dfdb568444'
  }
  // {
  //   tokens: [WAVAX[ChainId.AVALANCHE], PARTY[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0x6c272EE99E8e7FbCFA59c781E82E9d64a63b9004'
  // },
  // {
  //   tokens: [PARTY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0x74F17bB07D4A096Bb24481378f27272F21012370'
  // }
]

export const STAKING_V2_AVALANCHE: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
}[] = [
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PARTY[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xfC59bbd5f585E183FfA5cCA4B1a34Af681Afb034',
    pair: '0xC8d03a17509Aa21f1AA1f7E04ce0A99e5dB3516E'
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x4D1B8c4146783Eed90d056e68605D13E0b9674ee',
    pair: '0x7e28A8612baA734CC2745de81baAf43C76aaF127'
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x2701641b39142bfCcf6aCfaC8a31eFe5c34F2D50',
    pair: '0xf81d80C6FC672a728a4B7949D9338a6906636f23'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xE9070510EE2B3B8bA98225E17C3c51E1d4D0aF36',
    pair: '0x5712e1E7100741006249131233bD7b96CD4ac735'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x3A7A60DFb11DEE4Dc166fF49877107C7703016cE',
    pair: '0xF5e6909d10bd8601470c3b582F9dBb3199C63411'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x17228AFA1F998d3666A754E39A2A06ef0359b5e2',
    pair: '0xc52Bb891e10201B304C27Ab391B501a5d556174B'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], aaBLOCK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xF595aA03C82c17cB95dEBdE2e06e290b860cc3e8',
    pair: '0x8CA9f094E7eB322475caC9853d21598B31Ff186a'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SPORE[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xF0Fc692eb67E84bbbF2EaBdd28da662333ea16e0',
    pair: '0xB919Af56d83B769af265Ef9662932c019892af97'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], BAG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x56a801dc2e185C7A3E6f1a2f14eD79cA81eF8998',
    pair: '0xb4A181DC34A38b450C1DbcDF6643D4d9Eb99c79d'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xE65c7A99DC4c73faF90C67c4ec8ef2a6C74FFCBE',
    pair: '0x55C4487538D14e4A2C5bf6540a112FCbc0951Ded'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PEFI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x7d3E93bB90a83Deaa6343dBc37822060B453f8F4',
    pair: '0x60451cB01AcF41175AB97Df46bbE8054BD1c1b7F'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], FRAX[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xBE08e949A42927E53Baa003F33642F6f7dDF927E',
    pair: '0xa4dC371AA429657df67A26E1926F6c59229b92a0'
  },
  //  {
  //    tokens: [WAVAX[ChainId.AVALANCHE], ZERO[ChainId.AVALANCHE]],
  //    stakingRewardAddress: '0x3b9b4502A9980be3C46BefcFa637ec9Ed0be2485',
  //    pair: ''
  //  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SNOB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x905B97DE228840a31D32cb5E02158DD7FA488806',
    pair: '0xaaA255A7e4b0A6C2Fe1519697e9029d2Dfc909c3'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ELK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x2ABd108E2B636754497405F52aE4A1F5dFd50D32',
    pair: '0x25eEd2139986E176F63D750A4A1ccB9B8097Fc7E'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xE4EF45EDb2cd401150De8709c8eE53Fa06A7A19e',
    pair: '0x2bC629f7C52982dEe9972b4A068A87e34AefD499'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], AVME[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xc3258CA969eC69CCCE3589D191C7E58EF824fdb6',
    pair: '0x9cb667908aC886e1266516356d37E6cB2d17876f'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SHERPA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x4f5926E110FFDfDF830E2984015f31476f3fD199',
    pair: '0x2ca256Ca2A16bcB63bEF6E8F8e0c97213E0dD014'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], YAK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x4A8186F5753830B3f3B43D09746516814240ee5C',
    pair: '0xc2667ccd2E71c25761818E754F7638e91110Ac2b'
  }
]

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    pair: string
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
  multiplier?: JSBI
}

const calculateTotalStakedAmountInAvaxFromParty = function(
  totalSupply: JSBI,
  avaxPartyPairReserveOfParty: JSBI,
  avaxPartyPairReserveOfOtherToken: JSBI,
  stakingTokenPairReserveOfParty: JSBI,
  totalStakedAmount: TokenAmount
): TokenAmount {
  if (JSBI.EQ(totalSupply, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[ChainId.FUJI], JSBI.BigInt(0))
  }
  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxPartyRatio = JSBI.divide(
    JSBI.multiply(oneToken, avaxPartyPairReserveOfOtherToken),
    avaxPartyPairReserveOfParty
  )

  const valueOfPartyInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfParty, avaxPartyRatio), oneToken)

  return new TokenAmount(
    WAVAX[ChainId.FUJI],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, valueOfPartyInAvax),
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

  const party = PARTY[chainId || ChainId.FUJI]

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const pairAddresses = useMemo(() => info.map(({ pair }) => [pair] as MethodArg[]), [info])

  // console.log('reward addresses: ', rewardsAddresses)

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const tokens = useMemo(() => info.map(({ tokens }) => tokens), [info])
  // console.log('tokens: ', tokens)
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const liquidityPoolManager = useLiquidityPoolManagerContract()
  const weights = useSingleContractMultipleData(
    liquidityPoolManager,
    'weights',
    pairAddresses as OptionalMethodInputs[]
  )
  const pairs = usePairs(tokens)
  const [avaxPartyPairState, avaxPartyPair] = usePair(WAVAX[chainId || ChainId.FUJI], party)

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
        pairState !== PairState.LOADING &&
        avaxPartyPairState !== PairState.LOADING
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
          avaxPartyPairState === PairState.NOT_EXISTS
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
        const totalStakedInWavax = isAvaxPool
          ? calculteTotalStakedAmountInAvax(totalSupply, pair.reserveOf(wavax).raw, totalStakedAmount)
          : calculateTotalStakedAmountInAvaxFromParty(
              totalSupply,
              avaxPartyPair.reserveOf(party).raw,
              avaxPartyPair.reserveOf(WAVAX[tokens[1].chainId]).raw,
              pair.reserveOf(party).raw,
              totalStakedAmount
            )
        const multiplier = JSBI.divide(JSBI.BigInt(weight.result?.[0]), JSBI.BigInt(100))
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
    avaxPartyPair,
    weights
  ])
}

export function useTotalPartyEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const party = chainId ? PARTY[chainId] : undefined
  const stakingInfo1 = useStakingInfo(0)
  const stakingInfo2 = useStakingInfo(1)

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
