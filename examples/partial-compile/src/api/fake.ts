import { get } from './utils'

export type Response = number

export const fake = {
  async list(skip?: number, limit?: number): Promise<Response[]> {
    return get('/fake', { skip, limit })
  },
}
