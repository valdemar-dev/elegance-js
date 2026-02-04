# Middleware
Middleware are functions that get executed before [api endpoints](/api-endpoints) and [page](/pages) requests.

They can be created by making a `middleware.ts` file in any folder in the `pages` directory of your project.

Middleware are like [layouts](/layouts), in the way that they **flow downward**. A middleware registered to `/middleware.ts` will be called for *every* request.

Middleware are given the `IncomingMessage` and `ServerResponse` objects, as well as the function `next`, which a middleware **should** call to run the next middleware.

If you end a request in the middleware the next middleware will not be run, and the request will stop.