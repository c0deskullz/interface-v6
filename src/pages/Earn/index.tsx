import React, { useEffect, useCallback, useRef, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { StakingInfo, STAKING_REWARDS_INFO, useStakingInfo } from '../../state/stake/hooks'
import { TYPE, ExternalLink } from '../../theme'
import PoolCard from '../../components/earn/PoolCard'
import { RouteComponentProps } from 'react-router-dom'
import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import PoolsGrid from '../../components/PoolsGrid'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { ChainId, JSBI } from '@partyswap-libs/sdk'

import imageLeft from '../../assets/svg/pools-hero-left.svg'
import imageRight from '../../assets/svg/pools-hero-right.svg'

const Wrapper = styled.div`
  width: 100vw;
  margin-top: -2rem;
  @media (min-width: 720px) {
    margin-top: -100px;
  }
`

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
  margin: 2rem auto 0;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const fetchPoolAprs = async (
  chainId: ChainId | undefined,
  stakingInfos: StakingInfo[],
  callback: (arr: any[]) => any
) => {
  const results = await Promise.all(
    stakingInfos
      ?.sort(function(info_a, info_b) {
        // greater stake in avax comes first
        return info_a.totalStakedInWavax?.greaterThan(info_b.totalStakedInWavax ?? JSBI.BigInt(0)) ? -1 : 1
      })
      .sort(function(info_a, info_b) {
        if (info_a.stakedAmount.greaterThan(JSBI.BigInt(0))) {
          if (info_b.stakedAmount.greaterThan(JSBI.BigInt(0)))
            // both are being staked, so we keep the previous sorting
            return 0
          // the second is actually not at stake, so we should bring the first up
          else return -1
        } else {
          if (info_b.stakedAmount.greaterThan(JSBI.BigInt(0)))
            // first is not being staked, but second is, so we should bring the first down
            return 1
          // none are being staked, let's keep the  previous sorting
          else return 0
        }
      })
      .map(stakingInfo => {
        return fetch(`${process.env.REACT_APP_APR_API}${stakingInfo.stakingRewardAddress}/${chainId}`)
          .then(res => res.text())
          .then(res => ({ apr: res, ...stakingInfo }))
      })
  )

  const poolCards = results.map(stakingInfo => (
    <PoolCard apr={'0'} key={stakingInfo.stakingRewardAddress} stakingInfo={stakingInfo} version={'1'} />
  ))

  if (poolCards.length) {
    callback(poolCards)
  }
}

export default function Earn({
  match: {
    params: { version }
  }
}: RouteComponentProps<{ version: string }>) {
  const { chainId } = useActiveWeb3React()
  const stakingInfos = useStakingInfo(Number(version))
  const poolCards = useRef([])
  const setPoolCards = useCallback(results => {
    poolCards.current = results
  }, [])
  const [poolsLength, setPoolsLength] = useState<number>(0)

  useEffect(() => {
    console.log('calling')
    fetchPoolAprs(chainId, stakingInfos, setPoolCards)
  }, [stakingInfos, setPoolCards, chainId])

  useEffect(() => {
    if (poolCards?.current.length && poolCards.current.length !== poolsLength) {
      console.log('changing length')
      setPoolsLength(currValue => poolCards?.current?.length)
    }
  }, [poolCards.current, poolsLength])

  const DataRow = styled(RowBetween)`
    ${({ theme }) => theme.mediaWidth.upToSmall`
     flex-direction: column;
   `};
  `

  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)

  return (
    <Wrapper>
      <div className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <p className="smallText">Stake & Earn</p>
            <h1>We Offer the Best APY in the Market</h1>
            <button className="btn hero-btn">Learn More</button>
          </div>
        </div>
        <img src={imageLeft} alt="Doggo and Penguin chasing a Piñata" className="hero-img hero-img-left" />
        <img src={imageRight} alt="A piñata running from Doggo and Penguin" className="hero-img hero-img-right" />
      </div>

      <PoolsGrid />

      <PageWrapper gap="lg" justify="center">
        <TopSection gap="md">
          <DataCard>
            <CardBGImage />
            <CardNoise />
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Party liquidity mining</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white fontSize={14}>
                    Deposit your Party Liquidity Provider xYAY tokens to receive YAY, the Party protocol governance
                    token.
                  </TYPE.white>
                </RowBetween>{' '}
                <ExternalLink
                  style={{ color: 'white', textDecoration: 'underline' }}
                  href="https://pangolin.exchange/litepaper"
                  target="_blank"
                >
                  <TYPE.white fontSize={14}>Read more about YAY</TYPE.white>
                </ExternalLink>
              </AutoColumn>
            </CardSection>
            <CardBGImage />
            <CardNoise />
          </DataCard>
          {/* <DataCard>
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>IMPORTANT UPDATE</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  As a result of Party governance proposal 1, Party is changing staking contracts! After approximately
                  08:59 UTC on 4/19, all staking rewards will be distributed to the new staking contracts. Before the
                  switch, all rewards will still be distributed to the old contracts. To avoid interruptions to yield
                  farming rewards, you need to unstake your liquidity from the old contracts and restake in the new
                  contracts. You do not need to remove liquidity from your pools or alter your positions.
                </TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  To unstake, go to the old pools, click manage and withdraw your xYAY tokens. This will also claim any
                  earned YAY. To restake, navigate to the new pools, click manage, and then deposit.
                </TYPE.white>
              </RowBetween>{' '}
              <NavLink style={{ color: 'white', textDecoration: 'underline' }} to="/png/0" target="_blank">
                <TYPE.white fontSize={14}>Old YAY pools</TYPE.white>
              </NavLink>
              <NavLink style={{ color: 'white', textDecoration: 'underline' }} to="/png/1" target="_blank">
                <TYPE.white fontSize={14}>New YAY pools</TYPE.white>
              </NavLink>
            </AutoColumn>
          </CardSection>
        </DataCard> */}
        </TopSection>

        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <DataRow style={{ alignItems: 'baseline' }}>
            <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Participating pools</TYPE.mediumHeader>
            <TYPE.black fontWeight={400}>The Rewards Never End!</TYPE.black>
          </DataRow>

          <PoolSection>
            {stakingRewardsExist && poolCards?.current.length === 0 ? (
              <Loader style={{ margin: 'auto' }} />
            ) : !stakingRewardsExist ? (
              'No active rewards'
            ) : (
              poolCards.current
            )}
          </PoolSection>
        </AutoColumn>
      </PageWrapper>
    </Wrapper>
  )
}
