# Pages
Pages are units of an Elegance website. They're folder-based, meaning they pathname in the browser that will show the page, will depend on the folder name of the page.

A page in `your_project/pages/my-first-page/page.ts`, will be available in `localhost:3000/my-first-page`.

## Making a Page
To make a page, just create a `page.ts` file in your `pages` directory.

This file has two required exports. One being `page`, and the other being `metadata`.
Both of these values must be [functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions).

`page` should return some kind of [element](/elements), which will become the content of the page; and `metadata` should return an *array* of elements, things like `title`, `link`, etc, which become the *metadata* of the page.

## Parameters
The `page` constructor function gets as it's parameters whatever [layout props](/layouts#layout-props) it's parent layouts gave it, and the [dynamic route params](/dynamic-routes), if the page exists within a dynamic route. 
## Dynamic Pages
By default, pages are compiled at *build*, meaning, once you start the project, the compiler goes through each one of your pages, and turns it into HTML. 

This is great for most-cases, but not all.
If you wish to use things like the [router](/router), or respond with dynamic content on each request, it may be desirable to turn the page into a *dynamic page*.

To do this, simply export `const isDynamic = true;` from the `page.ts` file, and your page will be compiled per-request, instead of at build time.
## Status Code Pages
Normally, if some kind of issue occurs when a user then requesting a resource like, it not existing, the server would simply respond with the appropriate [HTTP Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), alongside some text like `"Not found."` and call it a day.

It might however be preferable to return *fully interactive* normal Elegance Pages for some codes, like `404`.

This results in a better, more uninterrupted user-experience, and even let's you properly explain *why* an error occured.

This is why the [Elegance Server](/elegance-server) supports *status code pages*.

To create a status code page, take any folder, like `/blog`, and create a `[code].ts` file, like `404.ts` or `403.ts`.
These pages are *inherited* meaning `/404.ts` would apply for **all** 404 status codes in the project. However, specificity is preferred, meaning *more nested* status code pages take precedence over ones higher up.

For status code pages to be served, `allowStatusCodePages` must be set to true within the srever options, as well as `allowDynamic` being set to true.