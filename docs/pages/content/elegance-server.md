# Elegance Server
The elegance server is an included simple **HTTP Server** that handles [api requests](/api-endpoints), [middleware](/middleware), [dynamic pages](/pages#dynamic-pages) and more.

If you created your project using `create-elegance-app`, and you did not specify the `--manual` option, you are automatically using the Elegance Server.

## Utilities
The Elegance Server exposes a few utilities for you, that can be used in [dynamic pages](/pages#dynamic-pages).

For things to do with routing, check out the [router](/router).

### getQuery
Returns the part after the `?` of a request as `URLSearchParams`.

### getRequest
Returns the http `IncomingMessage` and `ServerResponse` objects.

### getCookieStore
Prase the cookies of the active `IncomingMessage`. Returns a few helpers like `get`, `has`, `set`, and `getAll`.

## Server Options
These are only important to you if you're in **manual mode**.