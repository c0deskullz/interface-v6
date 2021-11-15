import { ChainId, CurrencyAmount, JSBI, Pair, Token, TokenAmount, WAVAX } from '@partyswap-libs/sdk'
import { useCallback, useMemo } from 'react'
import {
  APEX,
  // aaBLOCK,
  AVME,
  BAG,
  BUSD,
  // DAI,
  ELK,
  ETH,
  GB,
  HUSKY,
  MIM,
  // FRAX,
  // LINK,
  PARTY,
  PEFI,
  PNG,
  QI,
  // RENDOGE,
  SHERPA,
  SHIBX,
  // ZERO,
  SNOB,
  USDC,
  // SPORE,
  USDT,
  WBTC,
  // ELK,
  XAVA
  // YAK
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

export const STAKING_V2_FUJI: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
}[] = [
  {
    tokens: [WAVAX[ChainId.FUJI], PARTY[ChainId.FUJI]],
    stakingRewardAddress: '0xf61421f8e63532ad4586df8da81849016c75e6bc',
    pair: '0x4d5425e83b15004ce4f9f934ae802fca4b220ea9'
  },
  {
    tokens: [WAVAX[ChainId.FUJI], USDT[ChainId.FUJI]],
    stakingRewardAddress: '0x4f39fa1d907efc01af14d0fd053ba0d1faa7ccd1',
    pair: '0xb81853e2D8cE364416B6F07866ea3647de3AF7dA'
  },
  {
    tokens: [PARTY[ChainId.FUJI], USDT[ChainId.FUJI]],
    stakingRewardAddress: '0x3db8e0cacc89dea8b209e0d3d166c92e02691746',
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

export const STAKING_BOOSTED_FUJI: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
}[] = [
  {
    tokens: [USDT[ChainId.FUJI], WAVAX[ChainId.FUJI]],
    stakingRewardAddress: '0x00efe7500f88d4815d873e2fe302ee9a3cad4e40',
    pair: '0xb81853e2D8cE364416B6F07866ea3647de3AF7dA'
  },
  {
    tokens: [PARTY[ChainId.FUJI], WAVAX[ChainId.FUJI]],
    stakingRewardAddress: '0x8d1f03fd74a1dd4b4e8ec5d2895c943a3fce379c',
    pair: '0x40ca3289acf6fa8500479a1be7731e40d64c6fa4'
  },
  {
    tokens: [PARTY[ChainId.FUJI], USDT[ChainId.FUJI]],
    stakingRewardAddress: '0x249f3965f3857c2b7d5a1cb20005c68911c706d7',
    pair: '0x70ed4710208be3d262db27f14c6682b531350e2a'
  }
]

// ALWAYS PUT DELISTED STAKINGS AFTER NEW ONES
export const STAKING_V2: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
  delisted?: boolean
}[] = [
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PARTY[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x5266799b9cf333463579960d3716eb413bcc2ff5',
    pair: '0x379842a6cd96a70ebce66004275ce0c68069df62'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xbfca11d1fd56f03c7ec615a825761cfefd38f772',
    pair: '0x86Bd530563685Eb34380D38802f255Af29D15aE7'
  },
  {
    tokens: [PARTY[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x7a55baf51dd3f366ea7598d6342272f9a53c0e31',
    pair: '0x985e3f704a28fbaea6fe66403db94a4c1c4fc457'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x8d72213c550429d7ee7bed92a6eb4cb33e6dc403',
    pair: '0xF83575ddC6744c07Ca49a33f89E9581B9b20653E'
  },
  {
    tokens: [USDT[ChainId.AVALANCHE], USDC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x8cdbc3c632ac5f4f2c5a1548c86b73182891675e',
    pair: '0xe1669d006c3fa02636a30809a77eff65075ea92f'
  },
  {
    tokens: [USDT[ChainId.AVALANCHE], BUSD[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xd4fb7ac50f6a600ac3094c2dc56473db58957180',
    pair: '0x067ca3c3baf95804e5073c102fa7e2279e0e71d8'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x9c0d4b2f228b1fea9309ebeb2c356fdcd3acbcb5',
    pair: '0xA9E3904Bd06A9E4ec01Df8606d335804aa557B9E'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], GB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x7e008e90eaa1ed0db4110418192ec609254fc29c',
    pair: '0x77eb05e7f557fe8003047fb3be690dc429c511ba'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], QI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x56f121807db5eff52061b07015646d6f30079f93',
    pair: '0xA09bAb7c83b8D3246484E7b822DD3f7002e5D5F1'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PEFI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x590c4076059aa1c5139ddd421626108590b0547a',
    pair: '0x8151C05Ae3c733284855f841a27E756c10610cCe'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SNOB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xd21fbc7c645a4d445d2ee8d40d5ce0aded2aa389',
    pair: '0x3e9fd00bc0D0324c841975e4dd5a74c5b9E71cCA'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SHERPA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x37503d8f8672e6161a1f23f2f3569f36d6e667ff',
    pair: '0x0C6e9548b1820e12a5C4B9966d6420b3a83Fb020'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x4dcaaecc91d98e4285811f01419ea0434ca2154d',
    pair: '0x2f809eeEF351B4DBC7244FBFEcc8bfd120433D66'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], BAG[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xb42d72727cdc2e3973d161357c46fc71b769d300',
    pair: '0xa051Ff8C7eE4CF5D065048f3154D48639476242b'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], AVME[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x9752571d26a1e1b557797311b4ff1b94a5ce99e4',
    pair: '0x258429d6D51008A3af0Af565062aF01556408f7a'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ELK[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xbe413ae7643c9a834c81b20f870ec48bcdcf90cd',
    pair: '0x073412ae82a18b7a52c13cc7e742b46f8cce85c5'
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x62d2668adc522fbd31323ac2dfc42ed94363022f',
    pair: '0x062968fB8432e3B93895829447041627CF238c2C'
  }
]

const STAKING_BOOSTED: {
  tokens: [Token, Token]
  stakingRewardAddress: string
  pair: string
  delisted?: boolean
}[] = [
  {
    tokens: [PARTY[ChainId.AVALANCHE], WAVAX[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x880f47837a7763E906E6D5D71e85b4CFcBF3348B',
    pair: '0x379842a6cd96a70ebce66004275ce0c68069df62',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], WBTC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x6e3050dc1847A472D2f330A40340d97Ce9ca976E',
    pair: '0xA9E3904Bd06A9E4ec01Df8606d335804aa557B9E',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x3cdba85d594CFB4574949A3c75619fcDbB6e6FbC',
    pair: '0xF83575ddC6744c07Ca49a33f89E9581B9b20653E',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], USDC[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x2E634268F58d229CE4d2F893C998A17BDB40B39D',
    pair: '0x6408c1b04d283d85c940045787845a078ba19afc',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], ETH[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xac1d76710Cb006cb08ee6248Bd14cc189371981E',
    pair: '0x86Bd530563685Eb34380D38802f255Af29D15aE7',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], QI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xa06De82e32C48D91a3606d8DD896d531bAB3bE25',
    pair: '0xA09bAb7c83b8D3246484E7b822DD3f7002e5D5F1',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], GB[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x9df7E7A6D0ef134F04557Cb314D51f906d919c54',
    pair: '0x77eb05e7f557fe8003047fb3be690dc429c511ba',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], MIM[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xab06E26FC863da9C0a0ffEFF0D3d58c3205B3C4f',
    pair: '0xC643255EC872e681b66F19b4aB8ec3Bb5EF3216b',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], SHIBX[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x91329Bc0dbe87bd4a554473ad9C7E88504f36c26',
    pair: '0x3f7e7ca0046c0E8b4F83114D06DF56861F3e3cD4',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], HUSKY[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xAc832ac66Cf9a8f08eF77267b8bE4A15C4ebC531',
    pair: '0xc61F75A229CABAF364FCF80fc71B93f8CB65d2f0',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], PEFI[ChainId.AVALANCHE]],
    stakingRewardAddress: '0x5CCe9E8d88824442B9071cD2E73BbDa6D8ABC6Ef',
    pair: '0x8151C05Ae3c733284855f841a27E756c10610cCe',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], AVME[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xA9E2d7e74F47C2446e8E9fF1051e6baB56DD6f63',
    pair: '0x258429d6D51008A3af0Af565062aF01556408f7a',
    delisted: false
  },
  {
    tokens: [WAVAX[ChainId.AVALANCHE], APEX[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xC3AE47Bc96Be544F951D34b8bAB300B47867CB34',
    pair: '0x93281bEa86E54bcBcf691840e5ce08D8222A81f7',
    delisted: false
  },
  {
    tokens: [USDT[ChainId.AVALANCHE], BUSD[ChainId.AVALANCHE]],
    stakingRewardAddress: '0xF5AF5F695EfA6cfADF095a662E541248cE6b4FFE',
    pair: '0x067ca3c3baf95804e5073c102fa7e2279e0e71d8',
    delisted: false
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
  [ChainId.FUJI]: [STAKING_V1, STAKING_V2_FUJI, STAKING_BOOSTED_FUJI],
  [ChainId.AVALANCHE]: [STAKING_V1, STAKING_V2, STAKING_BOOSTED] //TODO add staking reward farms
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
