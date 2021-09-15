import React, { ReactNode } from 'react'
import styled from 'styled-components'
const PoolsGridItems = styled.div``

const Warning = styled.div`
  background-color: ${({ theme }) => theme.surface4};
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 3px 20px rgb(0 0 0 / 15%);

  span {
    color: ${({ theme }) => theme.yellow2};
    font-size: 2rem;
  }
  strong {
    font-weight: 700;
  }
  & > * {
    margin-bottom: 0;
  }
  @media (min-width: 550px) {
    padding: 2rem;
  }
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2rem 1fr;
    grid-column: span 2;
    gap: 1rem;
  }
  @media (min-width: 992px) {
    grid-column: span 3;

    & > * {
      max-width: 40.625rem;
    }
    p {
      font-size: 1.25rem;
    }
  }
`

export default function PoolsGrid({ pools }: { pools: ReactNode[] }) {
  return (
    <PoolsGridItems className="poolsGrid">
      <Warning>
        <span role="img" aria-label="warning-icon">
          ⚠️
        </span>
        <p>
          <strong>Note: </strong>
          the current APR calculation is incorrect; please don't take into account while adding liquidity into any of
          these pairs.
        </p>
      </Warning>
      {pools}
    </PoolsGridItems>
  )
}
