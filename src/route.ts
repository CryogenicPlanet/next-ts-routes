/* eslint-disable no-unused-vars */
import type { NextApiRequest, NextApiResponse } from 'next'

type Params = Partial<{
  [key: string]: string | string[]
}>

const logger = (logLevel: 'verbose' | 'none' | undefined) => {
  const log = (...args: any[]) => {
    if (logLevel === 'verbose') {
      console.log(...args)
    }
  }

  return log
}

type RouteFunc<T extends Params | undefined, R = never> = R extends never
  ? never
  : T extends undefined
  ? () => Promise<R>
  : (params: T) => Promise<R>

export const route = <
  gT extends Params | undefined = undefined,
  pT extends Params | undefined = undefined,
  dT extends Params | undefined = undefined,
  gR = never,
  pR = never,
  dR = never,
  cR = undefined
>(
  relativeUrl: string,
  route: {
    GET?: (
      { input }: { input: gT },
      {
        req,
        res,
        ctx
      }: {
        req: NextApiRequest
        res: NextApiResponse
        ctx: cR
      }
    ) => Promise<gR>
    POST?: (
      { input }: { input: pT },
      {
        req,
        res,
        ctx
      }: {
        req: NextApiRequest
        res: NextApiResponse
        ctx: cR
      }
    ) => Promise<pR>
    DELETE?: (
      { input }: { input: dT },
      { req, res, ctx }: { req: NextApiRequest; res: NextApiResponse; ctx: cR }
    ) => Promise<dR>
    ctx?: () => Promise<cR>
  },
  options?: { logLevel?: 'none' | 'verbose' }
) => {
  const log = logger(options?.logLevel)

  const HOST = process.env.HOST || process.env.NEXT_PUBLIC_HOST

  log('HOST', { HOST })

  // If window is available get the host from the window, otherwise use the env variable HOST, otherwise default to localhost:3000
  const getUrl = () => {
    const baseUrl = HOST || 'http://localhost:3000'

    const url = new URL(relativeUrl, baseUrl)
    return url
  }

  const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const handlerFunc = (await import('./handler')).handler

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   @ts-expect-error
    return handlerFunc(route, req, res)
  }

  const get = async (params: gT): Promise<gR> => {
    const url = getUrl()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (!value) return
        if (Array.isArray(value)) {
          url.searchParams.append(key, JSON.stringify(value))
        } else {
          url.searchParams.append(key, value)
        }
      })
    }

    log('Getting', url.toString())

    return fetch(url.toString()).then((res) => res.json())
  }

  const post = async (params: pT): Promise<pR> => {
    const url = getUrl()

    log('Posting', url.toString())

    return fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
  }

  const del = async (params: dT): Promise<dR> => {
    const url = getUrl()

    log('Deleting', url.toString())

    return fetch(url.toString(), {
      method: 'DELETE',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
  }

  return {
    handler,
    get: get as RouteFunc<gT, gR>,
    post: post as RouteFunc<pT, pR>,
    del: del as RouteFunc<dT, dR>
  }
}
