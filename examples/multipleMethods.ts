// api/methods.ts
import type { Equal, Expect } from "@type-challenges/utils";

import { route } from "../src";

const { handler, get, post, del } = route("api/methods", {
  GET: async ({ input }: { input: { name: string } }) => {
    return `Hello ${input.name}`;
  },
  POST: async ({ input }: { input: { postName: string } }) => {
    return `${input.postName}, Hello from POST`;
  },
  DELETE: async ({ input }: { input: { delName: string } }) => {
    return `${input.delName}, Hello from DELETE`;
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
  Expect<Equal<Parameters<typeof postClip>, [{ postName: string }]>>,
  Expect<Equal<Parameters<typeof del>, [{ delName: string }]>>
];
