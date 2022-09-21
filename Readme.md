# Typed Routes

A way to have fully typed routes in next, without all the complexity of tRPC.

This is more for super minimal use cases, where you don't need the full functionality of tRPC.


## Installation

```bash

npm install next-ts-routes

yarn install next-ts-routes

pnpm install next-ts-routes
```

## Usage

This is an example of how to use `next-ts-routes`

### Add the next wrapper

```js
// next.config.js
const withNextTsRoutes = require('next-ts-routes/withNextTsRoutes')

module.exports = withNextTsRoutes({})
```
<details>
<summary>next.config.mjs</summary>

```js
// next.config.mjs
import { env } from "./src/env/server.mjs";
import { withNextTsRoutes } from 'next-ts-routes/withNextTsRoutes';

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return withNextTsRoutes(config);
}

export default defineNextConfig({
});

```
</details>

<br>

<details>
<summary>Ignoring other server side only modules</summary>


For the time being this is a hacky way to achieve this, will ideally fine a better way in the future.

```js
// next.config.js
const withNextTsRoutes = require('next-ts-routes/withNextTsRoutes')

module.exports = withNextTsRoutes({}, {
  fs: false
})
```
</details>

---

### Basic Usage

You can see an example with typescript intellisense here - https://stackblitz.com/edit/typescript-qbv1tp?file=index.ts

```tsx
// api/clip.ts
import { route } from "next-ts-routes";

const { handler, get, post } = route("api/clip", {
  ctx: async () => {
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
```

> **Note:** As this file is directly imported in the browser, you cannot use any nodejs specific imports, like `fs` or `path` globally. 
You should dynamically import them and then use them.


Now you can import the `getClip` and `postClip` functions and use them in your app.


```tsx
// pages/index.tsx
import { getClip, postClip } from '../api/clip';

export default function Home() {
  const [clip, setClip] = useState<string | undefined>(undefined);

  useEffect(() => {
    getClip().then(setClip);
  }, []);

  return (
    <div>
      <h1>Clip</h1>
      <p>{clip}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const text = e.currentTarget.elements[0].value;
          await postClip({ text });
          setClip(text);
        }}
      >
        <input type="text" />
        <button type="submit">Set</button>
      </form>
    </div>
  );
}
```

This can totally be used with `swr` or `react-query` as well for nice hooks, will write some docs for this later