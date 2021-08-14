import React, { useEffect, useCallback, useRef, useState } from 'react'
// import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { StakingInfo, STAKING_REWARDS_INFO, useStakingInfo } from '../../state/stake/hooks'
// import PoolCard from '../../components/earn/PoolCard'
import { RouteComponentProps } from 'react-router-dom'
import PoolsGrid from '../../components/PoolsGrid'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import PoolsGridItem from '../../components/PoolsGrid/Item'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { ChainId, JSBI } from '@partyswap-libs/sdk'

import imageLeft from '../../assets/svg/pools-hero-left.svg'
import imageRight from '../../assets/svg/pools-hero-right.svg'
import { unwrappedToken } from '../../utils/wrappedCurrency'

const Wrapper = styled.div`
  width: 100vw;
  margin-top: -2rem;
  background-color: ${({ theme }) => theme.surface3};
  @media (min-width: 720px) {
    margin-top: -100px;
  }
`

const fetchPoolAprs = async (
  chainId: ChainId | undefined,
  stakingInfos: StakingInfo[],
  callback: (arr: any[]) => any,
  props: {
    onClickClaim: (stakingInfo: StakingInfo) => void
  }
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

  if (results.length) {
    callback(
      results.map(stakingInfo => {
        const { tokens, apr } = stakingInfo

        const token0 = tokens[0]
        const token1 = tokens[1]

        const currency0 = unwrappedToken(token0)
        const currency1 = unwrappedToken(token1)
        return (
          <PoolsGridItem
            apr={apr}
            stakingInfo={stakingInfo}
            version={'1'}
            key={`${currency0.symbol}-${currency1.symbol}`}
            onClickClaim={props.onClickClaim}
          />
        )
      })
    )
  }
}

const Hero = styled.div`
  background: ${({ theme }) => theme.gradient1};
`

export default function Earn({
  match: {
    params: { version }
  }
}: RouteComponentProps<{ version: string }>) {
  const { chainId } = useActiveWeb3React()
  const stakingInfos = useStakingInfo(Number(version))
  const poolCards = useRef<
    {
      stakingInfo: StakingInfo
      version: string
      apr: string
    }[]
  >([])
  const setPoolCards = useCallback(results => {
    poolCards.current = results
  }, [])
  const [poolsLength, setPoolsLength] = useState<number>(0)

  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const [currentStakingPool, setCurrentStakingPool] = useState<StakingInfo | undefined>()

  useEffect(() => {
    fetchPoolAprs(chainId, stakingInfos, setPoolCards, {
      onClickClaim: stakingInfo => {
        setCurrentStakingPool(stakingInfo)
        setShowClaimRewardModal(true)
      }
    })
  }, [stakingInfos, setPoolCards, chainId])

  useEffect(() => {
    if (poolCards?.current.length && poolCards.current.length !== poolsLength) {
      setPoolsLength(currValue => poolCards?.current?.length)
    }
  }, [poolsLength])

  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)

  return (
    <Wrapper>
      {currentStakingPool && (
        <ClaimRewardModal
          isOpen={showClaimRewardModal}
          onDismiss={() => {
            setCurrentStakingPool(undefined)
            setShowClaimRewardModal(false)
          }}
          stakingInfo={currentStakingPool}
        />
      )}
      <Hero className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <p className="smallText">Stake & Earn</p>
            <h1>We Offer the Best APY in the Market</h1>
            <button className="btn hero-btn">Learn More</button>
          </div>
        </div>
        <img src={imageLeft} alt="Doggo and Penguin chasing a Piñata" className="hero-img hero-img-left" />
        <img src={imageRight} alt="A piñata running from Doggo and Penguin" className="hero-img hero-img-right" />
      </Hero>

      {stakingRewardsExist && poolCards?.current.length === 0 ? (
        <Loader style={{ margin: 'auto' }} />
      ) : !stakingRewardsExist ? (
        'No active rewards'
      ) : (
        <PoolsGrid pools={poolCards.current} />
      )}

      {/* <PageWrapper gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <PoolSection>
            
          </PoolSection>
        </AutoColumn>
      </PageWrapper> */}
    </Wrapper>
  )
}
