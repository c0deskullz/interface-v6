import gql from 'graphql-tag'

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`

export const GET_FACTORY_DATA = gql`
  query factoryData($first: Int!) {
    partyswapFactories(first: 500) {
      id
      pairCount
      totalVolumeUSD
      totalVolumeETH
      totalLiquidityETH
      totalLiquidityUSD
    }
  }
`

export const GET_BUNDLE_DATA = gql`
  query bundleData {
    bundles(first: 1) {
      ethPrice
    }
  }
`

export const GET_TOKEN_DATA = gql`
  query token($address: String) {
    token(id: $address) {
      derivedETH
    }
  }
`
