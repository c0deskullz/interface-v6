import { ChainId, JSBI, Percent, Token, WAVAX } from '@partyswap-libs/sdk';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected } from '../connectors';

export const GAS_PRICE = 225;

export const ROUTER_ADDRESS = {
  [ChainId.AVALANCHE]: '0xff164Ede3E7C375E8764E9e3a22D3E35F780EEBC',
  [ChainId.FUJI]: '0x3705aBF712ccD4fc56Ee76f0BD3009FD4013ad75'
};

export const LANDING_PAGE = 'https://partyswap.io/';
export const ANALYTICS_PAGE = 'https://info.partyswap.io/';
// TODO: update url to prod url
export const TOKEN_MIGRATION_PAGE = 'https://migrator.partyswap.io/';
export const V1_PAGE = 'https://old.partyswap.io/#';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const GOVERNANCE_ADDRESS = '0xb0Ff2b1047d9E8d294c2eD798faE3fA817F43Ee1';

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
};

export const PARTY: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0xCEAA8d36a189b3d8b867AD534D91A3Bdbd31686b', 18, 'PARTY', 'PARTY V2'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x25afD99fcB474D7C336A2971F26966da652a92bc',
    18,
    'PARTY',
    'PARTY V2'
  )
};

export const PARTY_V1: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0x69A61f38Df59CBB51962E69C54D39184E21C27Ec', 18, 'PARTY', 'PARTY'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x69A61f38Df59CBB51962E69C54D39184E21C27Ec', 18, 'PARTY', 'PARTY')
};

export const PNG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0x20C62EEde571409f7101076F8dA0221867AA46dc', 18, 'PNG', 'Pangolin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x60781C2586D68229fde47564546784ab3fACA982', 18, 'PNG', 'Pangolin')
};

export const ETH: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 18, 'WETH.e', 'Ether')
};

export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDC.e', 'USD Coin'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    6,
    'USDC.e',
    'USD Coin'
  )
};

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(
    ChainId.FUJI,
    '0x2058ec2791dD28b6f67DB836ddf87534F4Bbdf22',
    18,
    'FUJISTABLE',
    'The Fuji stablecoin'
  ),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    6,
    'USDT.e',
    'Tether USD'
  )
};

export const BUSD: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'BUSD', 'Binance-Peg BUSD Token'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x9610b01AAa57Ec026001F7Ec5CFace51BfEA0bA6',
    18,
    'BUSD',
    'Binance-Peg BUSD Token'
  )
};

export const WBTC: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 8, 'WBTC', 'Wrapped Bitcoin'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x50b7545627a5162F82A992c33b87aDc75187B218',
    8,
    'WBTC.e',
    'Wrapped Bitcoin'
  )
};

export const LINK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'LINK', 'ChainLink Token'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x5947BB275c521040051D82396192181b413227A3',
    18,
    'LINK.e',
    'ChainLink Token'
  )
};

export const DAI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0x01a38eCc037DCf490045f6E4D74296F212331B99', 18, 'DAI', 'Dai Stablecoin'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    18,
    'DAI.e',
    'Dai Stablecoin'
  )
};

export const SNOB: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0xf319e2f610462f846d6e93f51cdc862eeff2a554', 18, 'SNOB', 'Snowball'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xc38f41a296a4493ff429f1238e030924a1542e50',
    18,
    'SNOB',
    'Snowball'
  )
};

export const aaBLOCK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 8, 'aaBLOCK', 'Blocknet'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50',
    8,
    'aaBLOCK',
    'Blocknet'
  )
};

export const SPORE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 9, 'SPORE', 'Spore.Finance'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x6e7f5C0b9f4432716bDd0a77a3601291b9D9e985',
    9,
    'SPORE',
    'Spore.Finance'
  )
};

export const BAG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'BAG', 'Baguette'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xa1144a6A1304bd9cbb16c800F7a867508726566E', 18, 'BAG', 'Baguette')
};

export const PEFI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'PEFI', 'PenguinToken'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xe896cdeaac9615145c0ca09c8cd5c25bced6384c',
    18,
    'PEFI',
    'PenguinToken'
  )
};

export const FRAX: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'FRAX', 'Frax'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xBB69c92FBb4F1aFf528875056650c862F94D3CC1', 18, 'FRAX', 'Frax')
};

export const ZERO: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'ZERO', 'Zero.Exchange Token'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x9Bdd302e506C3F6c23c085C37789cce6d3C1a233',
    18,
    'ZERO',
    'Zero.Exchange Token'
  )
};
export const ELK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'ELK', 'Elk'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C', 18, 'ELK', 'Elk')
};

export const XAVA: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'XAVA', 'Avalaunch'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4',
    18,
    'XAVA',
    'Avalaunch'
  )
};

export const AVME: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'AVME', 'AVME'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x1ecd47ff4d9598f89721a2866bfeb99505a413ed', 18, 'AVME', 'AVME')
};

export const RENDOGE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 8, 'renDOGE', 'renDOGE'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xcE829A89d4A55a63418bcC43F00145adef0eDB8E',
    8,
    'renDOGE',
    'renDOGE'
  )
};

export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xf39f9671906d8630812f9d9863bBEf5D523c84Ab', 18, 'UNI', 'Uniswap')
};

export const SUSHI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'SUSHI', 'SushiToken'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc',
    18,
    'SUSHI',
    'SushiToken'
  )
};

export const AAVE: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'AAVE', 'Aave Token'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9',
    18,
    'AAVE',
    'Aave Token'
  )
};

export const SHERPA: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'SHERPA', 'Sherpa'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0xa5E59761eBD4436fa4d20E1A27cBa29FB2471Fc6',
    18,
    'SHERPA',
    'Sherpa'
  )
};

export const YAK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'YAK', 'Yak Token'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7',
    18,
    'YAK',
    'Yak Token'
  )
};

export const QI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'QI', 'BENQI'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5', 18, 'QI', 'BENQI')
};

export const YFI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'YFI', 'yearn.finance'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x99519AcB025a0e0d44c3875A4BbF03af65933627',
    18,
    'YFI',
    'yearn.finance'
  )
};

export const VSO: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'VSO', 'VersoToken'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x846D50248BAf8b7ceAA9d9B53BFd12d7D7FBB25a',
    18,
    'VSO',
    'VersoToken'
  )
};

export const GB: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'GB', 'GoodBridging'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x90842eb834cFD2A1DB0b1512B254a18E4D396215',
    18,
    'GB',
    'GoodBridging'
  )
};

export const MIM: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'MIM', 'Magic Internet Money'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x130966628846BFd36ff31a822705796e8cb8C18D',
    18,
    'MIM',
    'Magic Internet Money'
  )
};

export const SHIBX: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'SHIBX', 'Magic Internet Money'),
  [ChainId.AVALANCHE]: new Token(
    ChainId.AVALANCHE,
    '0x440abbf18c54b2782a4917b80a1746d3a2c2cce1',
    18,
    'SHIBX',
    'SHIBAVAX'
  )
};

export const HUSKY: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'HUSKY', 'Magic Internet Money'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x65378b697853568dA9ff8EaB60C13E1Ee9f4a654', 18, 'HUSKY', 'HUSKY')
};

export const APEX: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'APE-X', 'Magic Internet Money'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xd039C9079ca7F2a87D632A9C0d7cEa0137bAcFB5', 18, 'APE-X', 'APE-X')
};

export const STAKING_V1: {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  pair: string;
}[] = [];

export const STAKING_V2_FUJI: {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  pair: string;
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
  ];

export const STAKING_BOOSTED_FUJI: {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  pair: string;
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
  ];

// ALWAYS PUT DELISTED STAKINGS AFTER NEW ONES
export const STAKING_V2: {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  pair: string;
  delisted?: boolean;
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
  ];

export const STAKING_BOOSTED: {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  pair: string;
  delisted?: boolean;
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
  ];

export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    stakingRewardAddress: string;
    pair: string;
    delisted?: boolean;
  }[][]
} = {
  [ChainId.FUJI]: [STAKING_V1, STAKING_V2_FUJI, STAKING_BOOSTED_FUJI],
  [ChainId.AVALANCHE]: [STAKING_V1, STAKING_V2, STAKING_BOOSTED] //TODO add staking reward farms
};

export const LIQUIDITY_POOL_MANAGER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: '0xa0a29Bd6e48C36512894bdDAA08ae6034e1d7211',
  [ChainId.AVALANCHE]: '0xC40E43f7Ba697658A2B3a9f6b659ec23Aab4Bd33'
};

export const BOOSTED_LIQUIDITY_POOL_MANAGER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: '0x5F0aA3B292618F14c01cdf6b2fF3904149733Be9',
  [ChainId.AVALANCHE]: '0x76b411c884838CbCb3A58d02E7b386EA037b6161'
};

export const JACUZZI_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: '0x5905835E7F5bA05AFa896A42d9d44185Affc4514',
  [ChainId.AVALANCHE]: '0xA07d1932775f22DaeDA671812c16F859b4257363'
};

export const AIRDROP_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.FUJI]: ZERO_ADDRESS,
  [ChainId.AVALANCHE]: '0x0C58C2041da4CfCcF5818Bbe3b66DBC23B3902d9'
};

const WAVAX_ONLY: ChainTokenList = {
  [ChainId.FUJI]: [WAVAX[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE]]
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.FUJI]: [...WAVAX_ONLY[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
};

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[]; } } = {
  [ChainId.FUJI]: {},
  [ChainId.AVALANCHE]: {}
};

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.FUJI]: [...WAVAX_ONLY[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.FUJI]: [...WAVAX_ONLY[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
};

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.AVALANCHE]: STAKING_BOOSTED.map((boostedStakingInfo) => boostedStakingInfo.tokens),
  [ChainId.FUJI]: []
};

export interface WalletInfo {
  connector?: AbstractConnector;
  name: string;
  iconName: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo; } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  }
};

export const NetworkContextName = 'NETWORK';

export const AVALANCHE_CHAIN_PARAMS: { [chainId in ChainId]?: any } = {
  [ChainId.FUJI]: {
    chainId: '0xa869', // A 0x-prefixed hexadecimal chainId
    chainName: 'Avalanche Fuji C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax-test.network/']
  },
  [ChainId.AVALANCHE]: {
    chainId: '0xa86a', // A 0x-prefixed hexadecimal chainId
    chainName: 'Avalanche Mainnet C-Chain',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network/']
  }
};

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50;
// 60 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 60;

export const BIG_INT_ZERO = JSBI.BigInt(0);

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));
export const BIPS_BASE = JSBI.BigInt(10000);
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE); // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)); // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000));
export const PARTY_DECIMALS_DIVISOR = 1000000000000000000;

export const toFixedTwo = (value: any): number => +(value / PARTY_DECIMALS_DIVISOR).toFixed(2);
export const toFixed = (value: any, digits: number = 4) =>
  +(value / PARTY_DECIMALS_DIVISOR).toFixed(digits) - 1 / 10 ** (digits - 1);
