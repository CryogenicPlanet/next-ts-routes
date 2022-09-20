import type { NextApiRequest, NextApiResponse } from "next";

type Params = Partial<{
  [key: string]: string | string[];
}>;

type RouteFunc<T extends Params | undefined, R = never> = R extends never
  ? never
  : T extends undefined
  ? () => Promise<R>
  : (params: T) => Promise<R>;

export const route = <
  gT extends Params | undefined = undefined,
  pT extends Params | undefined = undefined,
  dT extends Params | undefined = undefined,
  gR = never,
  pR = never,
  dR = never,
  cR = undefined
>(
  url: string,
  route: {
    GET?: (
      { input }: { input: gT },
      {
        req,
        res,
        ctx,
      }: {
        req: NextApiRequest;
        res: NextApiResponse;
        ctx: cR;
      }
    ) => Promise<gR>;
    POST?: (
      { input }: { input: pT },
      {
        req,
        res,
        ctx,
      }: {
        req: NextApiRequest;
        res: NextApiResponse;
        ctx: cR;
      }
    ) => Promise<pR>;
    DELETE?: (
      { input }: { input: dT },
      { req, res, ctx }: { req: NextApiRequest; res: NextApiResponse; ctx: cR }
    ) => Promise<dR>;
    ctx?: () => Promise<cR>;
  }
) => {
  const HOST = process.env.HOST || process.env.NEXT_PUBLIC_HOST;

  const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = (route.ctx ? await route.ctx() : undefined) as cR;

    if (req.method === "GET") {
      if (!route.GET) {
        res.status(405).end();
        return;
      }
      const result = await route.GET(
        // @ts-expect-error - Typescript is being a bit stupid here, where it is saying I can't assign something to "undefined"
        { input: req.query },
        { req, res, ctx }
      );
      res.status(200).json(result);
      return;
    } else if (req.method === "POST") {
      if (!route.POST) {
        res.status(405).end();
        return;
      }
      const result = await route.POST({ input: req.body }, { req, res, ctx });
      res.status(200).json(result);
      return;
    } else if (req.method === "DELETE") {
      if (!route.DELETE) {
        res.status(405).end();
        return;
      }
      const result = await route.DELETE({ input: req.body }, { req, res, ctx });
      res.status(200).json(result);
      return;
    } else {
      res.status(405).json({ error: "Method not found" });
    }
  };

  const get = async (params: gT): Promise<gR> => {
    // If window is available get the host from the window, otherwise use the env variable HOST, otherwise default to localhost:3000
    const fetchUrl = new URL(url, typeof window !== "undefined" ? window.location.hostname : HOST ?? "http://localhost:3000");
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (!value) return;
        if (Array.isArray(value)) {
          fetchUrl.searchParams.append(key, JSON.stringify(value));
        } else {
          fetchUrl.searchParams.append(key, value);
        }
      });
    }

    return fetch(fetchUrl.toString()).then((res) => res.json());
  };

  const post = async (params: pT): Promise<pR> => {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  const del = async (params: dT): Promise<dR> => {
    return fetch(url, {
      method: "DELETE",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  return {
    handler,
    get: get as RouteFunc<gT, gR>,
    post: post as RouteFunc<pT, pR>,
    del: del as RouteFunc<dT, dR>,
  };
};
