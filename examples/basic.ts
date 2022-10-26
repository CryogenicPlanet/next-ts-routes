// api/basic.ts
import type { Equal, Expect } from "@type-challenges/utils";

import { route } from "../dist";

const { handler, get, post } = route("/api/basic", {
  GET: async ({ input }: { input: { name: string } }) => {
    return `Hello ${input.name}`;
  },
});

export const getClip = get;
export const postClip = post;

export const val = getClip({ name: "world" });

export default handler;

// Tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
type cases = [
  Expect<Equal<typeof val, Promise<string>>>,
  Expect<Equal<typeof postClip, never>>
];
