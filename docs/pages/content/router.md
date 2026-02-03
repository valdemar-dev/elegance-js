# Router
The router in Elegance refers to the routing system used by the included [Elegance Server](https://elegance.js.org/elegance-server).

It contains a few helper functions you can call within pages to get parts of the request, reroute the request, etc.

For obvious reasons these are only available in [dynamic pages](/pages#dynamic-pages), and only during the compilation of the page, unless you store the result in [state](/state)

## Helpers
### getQuery
Returns the part after the `?` of a request as `URLSearchParams`.

### getRequest
Returns the http `IncomingMessage` and `ServerResponse` objects.

### getCookieStore
Prase the cookies of the active `IncomingMessage`. Returns a few helpers like `get`, `has`, `set`, and `getAll`.

## Route Overrides
These let you override whatever the server wants to reply with, to some kind of status code.
If you need more specifics, use `getRequest` and mutate the response yourself.

Incredibly useful for things like [dynamic routes](/dynamic-routes) that may or may not contain the request the user wants.

### notFound
Forcibly routes the request as HTTP code `404`. Uses a [status code page](/pages#status-code-pages) if the server options allow it.
### notAuthorized
Forcibly routes the request as HTTP code `401`. Uses a [status code page](/pages#status-code-pages) if the server options allow it.
### forbidden
Forcibly routes the request as HTTP code `403`. Uses a [status code page](/pages#status-code-pages) if the server options allow it.