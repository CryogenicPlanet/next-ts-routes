// api/clip.ts
import { route } from "../index";

const { handler, get, post } = route("api/clip", {
    ctx: async () => {
    
    // @ts-ignore
    const Redis = (await import("@upstash/redis")).Redis;

    const redis = new Redis();

    return { redis };
  },
  GET: async ({}, { ctx }) => {
    return ctx.redis.get("clip") as Promise<string | undefined>;
  },
  POST: async ({ input }: { input: { text: string } }, { ctx }) => {
    return ctx.redis.set("clip", input.text);
  },
});

export const getClip = get;
export const postClip = post;

export default handler;