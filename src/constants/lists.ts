// the Party Default token list lives here
export const FUJI_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/PartySwapDEX/party-swap-interface/fuji/src/constants/fujilist.json'
export const DEFAULT_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/pangolindex/tokenlists/main/aeb.tokenlist.json'
export const TOP_15_TOKEN_List = 'https://raw.githubusercontent.com/pangolindex/tokenlists/main/top15.tokenlist.json'
export const DEFI_TOKEN_LIST = 'https://raw.githubusercontent.com/pangolindex/tokenlists/main/defi.tokenlist.json'
export const STABLECOIN_TOKEN_LIST =
  'https://raw.githubusercontent.com/pangolindex/tokenlists/main/stablecoin.tokenlist.json'

export const DEFAULT_LIST_OF_LISTS: string[] = [
  TOP_15_TOKEN_List,
  DEFAULT_TOKEN_LIST_URL,
  DEFI_TOKEN_LIST,
  STABLECOIN_TOKEN_LIST,
  FUJI_TOKEN_LIST_URL
]
