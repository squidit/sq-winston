const { get } = require('lodash')

function mapRequest (request, key, meta = { url: {}, authentication: {} }) {
  return ({
    traceId: meta.traceId || request.headers[key],
    method: meta.method || request.method,
    url: {
      href: meta.url.href || request.url.href,
      path: meta.url.path || request.url.path,
      query: meta.url.query || (Object.keys(request.url.query).length > 0 ? request.url.query : null),
      params: meta.url.params || (Object.keys(request.params).length > 0 ? request.params : null)
    },
    payload: meta.payload || request.payload,
    authentication: {
      strategy: meta.authentication.strategy || get(request.auth, 'strategy', null),
      email: meta.authentication.email || get(request.auth, 'credentials.email', null),
      squidId: meta.authentication.squidId || get(request.auth, 'credentials.squidId', null),
      sub: meta.authentication.sub || get(request.auth, 'credentials.sub', null),
      credentials: meta.authentication.credentials || get(request.auth, 'credentials', null)
    }
  })
}

function stringifyFields (meta) {
  if (meta.url) {
    if (meta.url.query) meta.url.query = JSON.stringify(meta.url.query)
    if (meta.url.params) meta.url.params = JSON.stringify(meta.url.params)
    if (meta.payload) meta.payload = JSON.stringify(meta.payload)
  }
  if (meta.authentication) meta.authentication.credentials = JSON.stringify(meta.authentication.credentials)
  return meta
}

module.exports = {
  mapRequest,
  stringifyFields
}
