import { NextApiRequest, NextApiResponse } from 'next'

import { RouteError } from './error'
import { route } from './route'

type Route = Parameters<typeof route>[1]
type CR<T extends Route> = T['ctx'] extends undefined
  ? never
  : ReturnType<NonNullable<T['ctx']>>

export const handler = async <T extends Route>(
  route: T,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = (route.ctx ? await route.ctx() : undefined) as CR<T>

  if (req.method === 'GET') {
    if (!route.GET) {
      res.status(405).end()
      return
    }
    try {
      const result = await route.GET({ input: req.query }, { req, res, ctx })
      res.status(200).json(result)
    } catch (err) {
      if (err instanceof RouteError) {
        res.status(err.status).json({ message: err.message })
      }
      throw err
    }
  } else if (req.method === 'POST') {
    if (!route.POST) {
      res.status(405).end()
      return
    }
    try {
      const result = await route.POST({ input: req.body }, { req, res, ctx })
      res.status(200).json(result)
    } catch (err) {
      if (err instanceof RouteError) {
        res.status(err.status).json({ message: err.message })
      }
      throw err
    }
  } else if (req.method === 'DELETE') {
    if (!route.DELETE) {
      res.status(405).end()
      return
    }
    try {
      const result = await route.DELETE({ input: req.body }, { req, res, ctx })
      res.status(200).json(result)
    } catch (err) {
      if (err instanceof RouteError) {
        res.status(err.status).json({ message: err.message })
      }
      throw err
    }
  } else {
    res.status(405).json({ error: 'Method not found' })
  }
}
