# Dynamic Routes
Dynamic routes are parts of a pathname that are surrounded with either square brackets or asterisks, eg. `/recipes/[recipeName]/page.ts`

If a user were to make a request to /recipes/cake, the aforementioned page.ts would be served, and it would get a `params` object in it's constructor, containing 
`{ recipeName: "cake", }`

## Types of Dynamic Routes
You can have two kinds of dynamic routes, once is a *strict match* and the other is a *loose match*.
Strict matches, like the one showed above, match **one level deep**, whilst loose matches match **any depth**.

Loose match routes are denoted by wrapping a path in \*asterisks\*.

The loose match route `/recipes/*any*` would match the pathnames: `/recipes/cake/chocolate`, `/recipes/cake/chocolate/magic`, and so on; whilst the *strict match* one would stop at depth 1.

## Optional Routes
If you want your route to match also the *parent pathname*, eg. `/recipes` should also hit where `/recipes/cake` does,
then you may prefix the route name with a `:`.

So, the route `/recipes/:[recipeName]` would match `/recipes/cake/` but also `/recipes`

## Specifics
Note that dynamic routes (for obvious reasons) are only available when using the included [Elegance Server](http://elegance.js.org/elegance-server).

The [query](https://en.wikipedia.org/wiki/Query_string) part of the request is *not* parsed into the pathname that is passed into the page, but rather is available via the [getQuery](https://elegance.js.org/router) function from the router.