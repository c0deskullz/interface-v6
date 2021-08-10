import React from 'react'
import styled from 'styled-components'
import PoolsGridItem from './Item'

const PoolsGridItems = styled.div``

export default function PoolsGrid() {
  return (
    <>
      <PoolsGridItems className="poolsGrid">
        <PoolsGridItem />
        <PoolsGridItem />
        <PoolsGridItem />
      </PoolsGridItems>
    </>
  )
}
