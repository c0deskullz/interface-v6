import { Interface } from '@ethersproject/abi'
import { abi as LIQUIDITY_POOL_MANAGER_ABI } from '@partyswap-libs/party-governance/build/contracts/LiquidityPoolManager.json'

const LIQUIDITY_POOL_MANAGER_INTERFACE = new Interface(LIQUIDITY_POOL_MANAGER_ABI)

export { LIQUIDITY_POOL_MANAGER_INTERFACE }
