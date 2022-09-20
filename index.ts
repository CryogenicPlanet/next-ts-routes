import type { NextApiRequest, NextApiResponse } from "next";

type Params = Partial<{
  [key: string]: string | string[];
}>;

type GetFunc<gT extends Params | undefined, gR = never> = gR extends never ? never : gT extends undefined ? () => Promise<gR> : (params: gT) => Promise<gR>;
type PostFunc<pT extends Params | undefined, pR = never> = pR extends never ? never : pT extends undefined ? () => Promise<pR> : (params: pT) => Promise<pR>;

export const route = <
  gT extends Params | undefined = undefined,
  pT extends Params | undefined = undefined,
  gR = never,
  pR = never,
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
    ctx?: () => Promise<cR>;
  }
) => {
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
    } else {
      res.status(405).json({ error: "Method not found" });
    }
  };

  const get = async (params: gT): Promise<gR> => {
    const fetchUrl = new URL(url);
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

  return {
    handler,
    get: get as GetFunc<gT, gR>,
    post: post as PostFunc<pT, pR>,
  };
};
