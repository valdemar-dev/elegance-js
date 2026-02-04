# Router
The router in Elegance refers to the routing system used by the included [Elegance Server](https://elegance.js.org/elegance-server).

It contains a few helper functions you can call within pages to get parts of the request, reroute the request, etc.

For obvious reasons these are only available in [dynamic pages](/pages#dynamic-pages), and only during the compilation of the page, unless you store the result in [state](/state).

## Utilities
### redirect
Takes in a pathname and re-routes the request to that with default statusCode 302.

## respondWith
A utility that lets you respond with a few preset HTTP status codes, useful for things like [dynamic routes](/dynamic-routes) that may or may not contain the request the user wants.

These use [status code pages](/pages#status-code-pages) if the [Elegance Server](/elegance-server) allows for them.

- notFound
- notAuthorized
- forbidden
- internalError