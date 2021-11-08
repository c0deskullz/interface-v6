import { BigNumber } from '@ethersproject/bignumber';
import { ChainId, Token, TokenAmount } from '@partyswap-libs/sdk';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { PARTY } from '../constants';
import { useActiveWeb3React } from '../hooks';
import { useTokenContract } from '../hooks/useContract';
import { useSingleCallResult } from '../state/multicall/hooks';

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const totalSupply: BigNumber = useSingleCallResult(contract, 'totalSupply')?.result?.[0];

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined;
}

export function usePartyCirculation(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React();
  const [circulation, setCirculation] = useState('0');

  useEffect(() => {
    const { REACT_APP_API_URL: apiUrl } = process.env;
    const getCirculation = async (callback: (data: string) => void) => {
      const { data } = await axios.get(`${apiUrl}party/circulating?asUint256=true`);
      callback(data.toLocaleString('fullwide', { useGrouping: false }));
    };

    getCirculation(setCirculation);
  }, [chainId]);

  return new TokenAmount(PARTY[chainId || ChainId.AVALANCHE], circulation.toString() || '0');
}
