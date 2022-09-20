// /api/files.ts
import type { Expect, Equal } from "@type-challenges/utils";
import { route } from "../index";

const { handler, get, post } = route("api/files", {
  ctx: async () => {
    const fs = await import("fs");

    return { fs };
  },
  GET: async ({}, { ctx }) => {
    return ctx.fs.promises.readFile("README.md", "utf-8");
  },
  POST: async ({ input }: { input: { text: string } }, { ctx }) => {
    return ctx.fs.promises.writeFile("README.md", input.text);
  },
});

export const getClip = get;
export const postClip = post;

const val = getClip();

export default handler;

// Tests
type cases = [
  Expect<Equal<typeof val, Promise<string>>>,
  Expect<Equal<Parameters<typeof postClip>, [{ text: string }]>>
];
