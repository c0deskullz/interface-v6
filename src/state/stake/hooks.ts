import { ChainId, CurrencyAmount, JSBI, Pair, Token, TokenAmount, WAVAX } from '@partyswap-libs/sdk'
import { useMemo, useCallback } from 'react'
import {
  // aaBLOCK,
  AVME,
  BAG,
  DAI,
  ELK,
  ETH,
  GB,
  // FRAX,
  LINK,
  PARTY,
  PEFI,
  PNG,
  QI,
  RENDOGE,
  SHERPA,
  // ZERO,
  SNOB,
  USDC,
  // SPORE,
  USDT,
  WBTC,
  // ELK,
  XAVA,
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
    stakingRewardAddress: '0xe900817d3c830e37f6929f606a4119777942491d',
    pair: '0x4d5425e83b15004ce4f9f934ae802fca4b220ea9'
  },
  {
    tokens: [
      WAVAX[ChainId.FUJI],
      new Token(ChainId.FUJI, '0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22', 18, 'FUJISTABLE', 'The Fuji stablecoin')
    ],
    stakingRewardAddress: '0xff4ce166facef944a499c451854de0030b387893',
    pair: '0xb81853e2D8cE364416B6F07866ea3647de3AF7dA'
  },
  {
    tokens: [
      PARTY[ChainId.FUJI],
      new Token(ChainId.FUJI, '0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22', 18, 'FUJISTABLE', 'The Fuji stablecoin')
    ],
    stakingRewardAddress: '0x5cc45bad397e5cbc224c9122d9e8f13fa7106187',
    pair: '0xe0ac4d8d3afc17430a82c2eb4e935971e95211c9'
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

// ALWAYS PUT DELISTED STAKINGS AFTER NEW ONES
export const STAKING_V2_AVALANCHE: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
  delisted?: boolean
}[] = [
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PARTY[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x1081e6063Dbe43e7150ec7D28a705beC98dFE070',
    pair: '0xcD5043292d99D63f42f0447d77E5cA048506Bad6'
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x839b20d7f8b5d2b6ec07cf126a4bb51b9b67de60',
    pair: '0x384240aC78C1f361FD8093798758084beE81e6fb'
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x04FA5D713F256A785E39385Ae071cB05adba97F8',
    pair: '0x384240aC78C1f361FD8093798758084beE81e6fb',
    delisted: true
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xb4be4ac1a0a3bd381da8e9adf3176413a590e282',
    pair: '0x8504BAC082fCC25b4593952b067cF5358Bb1bd44'
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x5A4f44127ec4bd4164B09Db623A9d65523D53434',
    pair: '0x8504BAC082fCC25b4593952b067cF5358Bb1bd44',
    delisted: true
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x1d948BA1D22cD8091a56D45Cd01c92B3d5327452',
    pair: '0xF83575ddC6744c07Ca49a33f89E9581B9b20653E'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], DAI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xc8dfff529d1ff649422905db9df05c8c3ddc04a7',
    pair: '0x872b1d0be81d1f1959930fb47905ef5bc60c86b3'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x9201908b21115fEE17dB08ceA775c5D05851a6CA',
    pair: '0xA9E3904Bd06A9E4ec01Df8606d335804aa557B9E'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x897c3e7A9bAECf1D096Ab480e50149E952fbB7F0',
    pair: '0x86Bd530563685Eb34380D38802f255Af29D15aE7'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], LINK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xE5CacbB457A3d96051C581615184da5660286798',
    pair: '0x0868DFDfcc40925ab58E8f08D4742D53201414c7'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], RENDOGE[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xb466124bd5ED4851f96A3Ca18f099FfeF7be2612',
    pair: '0xEd326435E5e83Dc2263813F09Fb95E8d71d70030'
  },
  // {
  //   tokens: [WAVAX[ChainId.AVALANCHE], aaBLOCK[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0xf9ac26A28b5dA299E8Ff51F2f8eaB9CBa911668b',
  //   pair: '0x04fF7cb0c1bd7f350Ec2495989c654218992AE40'
  // },
  // {
  //   tokens: [WAVAX[ChainId.AVALANCHE], SPORE[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0x1fA07d1481e264F4FFE857C918CE27e841Ba427b',
  //   pair: '0x293fCF9131e1491971c5bC234018fA6440238cA0'
  // },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], BAG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x8AdC76373B7c8fD9154528beD63E6ff30411cEb4',
    pair: '0xa051Ff8C7eE4CF5D065048f3154D48639476242b'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xE5F2bDe8F9E23Bff7D9af7F4f6D98E1efC08A365',
    pair: '0x2f809eeEF351B4DBC7244FBFEcc8bfd120433D66'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PEFI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x6665a74B3BBe312d01d8Ffa9D2a078798a216c87',
    pair: '0x8151C05Ae3c733284855f841a27E756c10610cCe'
  },
  // {
  //   tokens: [WAVAX[ChainId.AVALANCHE], FRAX[ChainId.AVALANCHE]],
  //   stakingRewardAddress: '0x83B90d01E40ACC8F19d3FE6374AcC99c56db19C7',
  //   pair: '0xF95901c0131197864db5834836Eb91C5D66A2189'
  // },
  //  {
  //    tokens: [WAVAX[ChainId.AVALANCHE], ZERO[ChainId.AVALANCHE]],
  //    stakingRewardAddress: '0x3b9b4502A9980be3C46BefcFa637ec9Ed0be2485',
  //    pair: ''
  //  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SNOB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x1a70d0AcC5EBA0c8515911301a8B0EE5F5070c66',
    pair: '0x3e9fd00bc0D0324c841975e4dd5a74c5b9E71cCA'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ELK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x398382a060319261cf5819afb18243615c090845',
    pair: '0x073412ae82a18b7a52c13cc7e742b46f8cce85c5'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xB7517d0f70A6c884239345B0AC8AaFD436227Aa8',
    pair: '0x062968fB8432e3B93895829447041627CF238c2C'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], AVME[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x12711334DB498BA2768161335016e2724A15e4E8',
    pair: '0x258429d6D51008A3af0Af565062aF01556408f7a'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SHERPA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xaa0e5e6B3dAbbc0C34BB2480791fE2409b630F0F',
    pair: '0x0C6e9548b1820e12a5C4B9966d6420b3a83Fb020'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], YAK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x751c2f4a4B32D79B54FdF44c25e85B0aa5232bd0',
    pair: '0xA54e34949f5B66d0A756CcB1E82e4f96bfdE8241'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], QI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x30Ac2b14320112a4922D5D3B926dcdcb19c502a8',
    pair: '0xA09bAb7c83b8D3246484E7b822DD3f7002e5D5F1'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], GB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x4a2ba12a8c13575d5dea30944f8d9bd78ef2e190',
    pair: '0x77eb05e7f557fe8003047fb3be690dc429c511ba'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], USDC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x23dfe0622a4fae8da02a6b517952bcebba0e9b3b',
    pair: '0x6408c1b04d283d85c940045787845a078ba19afc'
  }
]

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string
    pair: string
    delisted?: boolean
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
  totalStakedAmount: TokenAmount,
  chainId?: ChainId
): TokenAmount {
  if (JSBI.EQ(totalSupply, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[chainId || ChainId.FUJI], JSBI.BigInt(0))
  }
  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxPartyRatio = JSBI.divide(
    JSBI.multiply(oneToken, avaxPartyPairReserveOfOtherToken),
    avaxPartyPairReserveOfParty
  )

  const valueOfPartyInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfParty, avaxPartyRatio), oneToken)

  return new TokenAmount(
    WAVAX[chainId || ChainId.FUJI],
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
  totalStakedAmount: TokenAmount,
  chainId?: ChainId
): TokenAmount {
  if (JSBI.GT(totalSupply, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[chainId || ChainId.FUJI],
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(totalStakedAmount.raw, reserveInWavax),
          JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
        ),
        totalSupply
      )
    )
  } else {
    return new TokenAmount(WAVAX[chainId || ChainId.FUJI], JSBI.BigInt(0))
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

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId || ChainId.AVALANCHE]?.[version]?.filter(stakingRewardInfo =>
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

  const party = PARTY[chainId || ChainId.AVALANCHE]

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])
  const pairAddresses = useMemo(() => info.map(({ pair }) => [pair] as MethodArg[]), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  const tokens = useMemo(() => info.map(({ tokens }) => tokens), [info])
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
  const [avaxPartyPairState, avaxPartyPair] = usePair(WAVAX[chainId || ChainId.AVALANCHE], party)

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
          ? calculteTotalStakedAmountInAvax(totalSupply, pair.reserveOf(wavax).raw, totalStakedAmount, chainId)
          : calculateTotalStakedAmountInAvaxFromParty(
              totalSupply,
              avaxPartyPair.reserveOf(party).raw,
              avaxPartyPair.reserveOf(WAVAX[tokens[1].chainId]).raw,
              pair.reserveOf(party).raw,
              totalStakedAmount,
              chainId
            )
        const multiplier = info[index].delisted
          ? JSBI.BigInt(0)
          : JSBI.divide(JSBI.BigInt(weight.result?.[0]), JSBI.BigInt(100))
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
