/**
 * Examples for rematch commmon
 */
import React from 'react'
import { connect } from 'react-redux'

import { RootState, Dispatch } from '@/store'

const mapState = (state: RootState) => {
  return {
    count: state.count,
  }
}

const mapDispatch = ({ count }: Dispatch) => {
  return {
    increment: () => count.increment(1),
    incrementAsync: () => count.incrementAsync(1),
  }
}

type CountProps = Partial<ReturnType<typeof mapState> & ReturnType<typeof mapDispatch>>

const Count = (props: CountProps) => (
  <div className="p-2 shadow-lg rounded-md flex flex-col justify-center bg-base-300">
    <div className="stats shadow bg-transparent">
      <div className="stat">
        <div className="stat-title">The count</div>
        <div className="stat-value">{props.count}</div>
      </div>
    </div>
    <div>
      <button className="btn btn-ghost" onClick={props.increment}>
        increment
      </button>
      <button className="btn btn-ghost" onClick={props.incrementAsync}>
        increment.Async
      </button>
    </div>
  </div>
)

export default connect(mapState, mapDispatch)(Count)
