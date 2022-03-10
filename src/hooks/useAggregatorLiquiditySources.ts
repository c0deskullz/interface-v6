import axios from 'axios'
import { useEffect, useState } from 'react'
import { ONEINCH_BASE_URL } from '../constants'

export interface LiquiditySource {
  id: string
  img: string
  img_color: string
  title: string
}

const getLiquiditySources = async (callback: (response: any) => void, errCallback: (response: any) => void) => {
  try {
    const { data } = await axios.get(`${ONEINCH_BASE_URL}43114/liquidity-sources`)
    callback(data.protocols)
  } catch (error) {
    errCallback(error?.response?.data)
  }
}

export function useAggregatorLiquiditySources() {
  const [liquiditySources, setLiquiditySources] = useState<LiquiditySource[]>([])

  useEffect(() => {
    getLiquiditySources(setLiquiditySources, () => setLiquiditySources([]))
  }, [])

  return liquiditySources
}
