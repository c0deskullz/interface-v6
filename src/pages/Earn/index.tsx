import { ChainId, JSBI } from '@partyswap-libs/sdk'
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import imageLeftDark from '../../assets/svg/pools-hero-left-dark.svg'
import imageLeft from '../../assets/svg/pools-hero-left.svg'
import imageRightDark from '../../assets/svg/pools-hero-right-dark.svg'
import imageRight from '../../assets/svg/pools-hero-right.svg'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import Loader from '../../components/Loader'
import { VersionTabs } from '../../components/NavigationTabs'
import PoolsGrid from '../../components/PoolsGrid'
import PoolsGridItem from '../../components/PoolsGrid/Item'
import { useActiveWeb3React } from '../../hooks'
import { StakingInfo, STAKING_REWARDS_INFO, useStakingInfo } from '../../state/stake/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { unwrappedToken } from '../../utils/wrappedCurrency'

const Wrapper = styled.div`
  width: 100vw;
  margin-top: -2rem;
  background-color: ${({ theme }) => theme.surface3};
  overflow: hidden;
`

const LoaderWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  svg {
    width: 2rem;
    height: 2rem;
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
      .sort(function(info_a, info_b) {
        // greater stake in avax comes first
        return +(info_b.multiplier?.toString() || '0') - +(info_a.multiplier?.toString() || '0')
      })
      .map(stakingInfo => {
        return fetch(
          `${process.env.REACT_APP_APR_API}${stakingInfo.stakingRewardAddress}/${chainId || ChainId.AVALANCHE}`
        )
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
  position: relative;

  .version-tabs {
    position: absolute;
    width: 100%;
    top: auto;
    bottom: 5%;
    z-index: 15;
  }
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
    if (stakingInfos.length && poolsLength !== stakingInfos.length) {
      const updatePoolCards = (results: ReactNode[]) => {
        setPoolCards(results)
        setPoolsLength(results.length)
      }
      fetchPoolAprs(chainId, stakingInfos, updatePoolCards, {
        onClickClaim: stakingInfo => {
          setCurrentStakingPool(stakingInfo)
          setShowClaimRewardModal(true)
        }
      })
    }
  }, [stakingInfos, setPoolCards, chainId, poolsLength])

  const stakingRewardsExist = Boolean(
    typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId || ChainId.AVALANCHE]?.length ?? 0) > 0
  )

  const isDarkMode = useIsDarkMode()

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
            <h1>Choose your piñata and start earning!</h1>
            <a className="btn hero-btn" href="https://partyswap.gitbook.io/partyswap/pinatas" target="blank">
              Learn More
            </a>
          </div>
        </div>
        <div className="version-tabs">
          <VersionTabs active={'v2'} pathname="/party/1" />
        </div>
        <img
          src={isDarkMode ? imageLeftDark : imageLeft}
          alt="Doggo and Penguin chasing a Piñata"
          className="hero-img hero-img-left"
        />
        <img
          src={isDarkMode ? imageRightDark : imageRight}
          alt="A piñata running from Doggo and Penguin"
          className="hero-img hero-img-right"
        />
      </Hero>

      {stakingRewardsExist && poolCards?.current.length === 0 ? (
        <LoaderWrapper>
          <Loader style={{ margin: 'auto' }} />
        </LoaderWrapper>
      ) : !stakingRewardsExist ? (
        'No active rewards'
      ) : (
        <PoolsGrid pools={poolCards.current} />
      )}
    </Wrapper>
  )
}
