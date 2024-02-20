/**
 * Examples for rematch commmon
 */
import { connect } from 'react-redux'

import type { Dispatch, RootState } from '@/store'

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

type CountProps = Partial<ReturnType<typeof mapDispatch> & ReturnType<typeof mapState>>

const Count = (props: CountProps) => (
  <div className="bg-base-300 flex flex-col justify-center rounded-md p-2 shadow-lg">
    <div className="stats bg-transparent shadow">
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
