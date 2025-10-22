# Middleware
Middleware refers to code that runs *between* a request being received  
by the server, and the server responding to that request.    

It's useful for things like controlling who has access to what parts of your project.    

Elegance has full support for Express-style middleware.

## Using Middleware
First, create a **middleware.ts** file in any directory / subdirectory of **pages**.  
From that file, any export will be treated as a middleware function, like so:
`export async function Middleware(req, res, next) {}`  

This is very similar to *route handlers* for API Routes, with two key differences.    

1. API Routes define the *http method* they will be called for, whereas Middleware  
is called for *every* method in the route that it is registered to.    

2. The middleware is exposed to the **next()** function, which it should call to forward  
the request to the next middleware.    

## Useful Things
You can register multiple middleware in a **middleware.ts** file,  
they will be called in the order that this import gives them in.  
`const middlewares = await import(middlewareFile);`  

The **TypeScript types** of *req* and *res* are:
`req: http.IncomingMessage, res: http.ServerResponse`
as declared in the **node:http** library.