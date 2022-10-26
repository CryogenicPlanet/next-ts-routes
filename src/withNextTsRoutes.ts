import { NextConfig } from 'next'

export const withNextTsRoutes = (
  nextConfig: NextConfig = {},
  fallbackFalse: { [name: string]: false }
): NextConfig => {
  return {
    ...nextConfig,
    webpack: (defaultConfig, options) => {
      if (
        process.env.HOST === undefined &&
        process.env.NEXT_PUBLIC_HOST === undefined
      ) {
        throw new Error(
          'You must set the HOST or NEXT_PUBLIC_HOST environment variable.'
        )
      }

      const config = nextConfig.webpack
        ? nextConfig.webpack(defaultConfig, options)
        : defaultConfig

      config.resolve.fallback = {
        assert: false,
        buffer: false,
        console: false,
        constants: false,
        crypto: false,
        domain: false,
        events: false,
        http: false,
        https: false,
        os: false,
        path: false,
        punycode: false,
        process: false,
        querystring: false,
        stream: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        url: false,
        util: false,
        vm: false,
        zlib: false,
        fs: false,
        tls: false,
        net: false,
        ...fallbackFalse
      }

      return config
    }
  }
}
