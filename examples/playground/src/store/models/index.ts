import { count } from './count'

import type { Models } from '@rematch/core'

export interface RootModel extends Models<RootModel> {
  count: typeof count
}

export const models: RootModel = { count }
