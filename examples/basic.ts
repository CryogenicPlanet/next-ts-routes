// api/basic.ts
import { route } from "../index";

import type { Equal, Expect } from '@type-challenges/utils'


const { handler, get, post } = route("api/basic", {
  GET: async ({ input }: { input: { name: string } }) => {

    return `Hello ${input.name}`;
  },
});

export const getClip = get;
export const postClip = post;

export const val = getClip({ name: "world" });

export default handler;


// Tests
type cases = [
  Expect<Equal<typeof val, Promise<string>>>,
  Expect<Equal<typeof postClip, never>>,
]