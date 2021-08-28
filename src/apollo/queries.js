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
  query factoryData($first: Int!){
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