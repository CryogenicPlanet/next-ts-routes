// /api/files.ts
import type { Equal, Expect } from '@type-challenges/utils'

import { route } from '../src'

const { handler, get, post } = route('api/files', {
  ctx: async () => {
    const fs = await import('fs')

    return { fs }
  },
  GET: async (_, { ctx }) => {
    return ctx.fs.promises.readFile('README.md', 'utf-8')
  },
  POST: async ({ input }: { input: { text: string } }, { ctx }) => {
    return ctx.fs.promises.writeFile('README.md', input.text)
  }
})

export const getClip = get
export const postClip = post

const val = getClip()

export default handler

// Tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
type cases = [
  Expect<Equal<typeof val, Promise<string>>>,
  Expect<Equal<Parameters<typeof postClip>, [{ text: string }]>>
]
