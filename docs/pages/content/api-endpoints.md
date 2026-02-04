# API Endpoints
If you're not familiar with API Endpoints you'll want to brush up [here](https://www.cloudflare.com/learning/security/api/what-is-api-endpoint/).

Please note, that API Endpoints are *not* available unless you're using the included [Elegance Server](/elegance-server).

In elegance, the convention for creating endpoints is `route.ts` files go inside the folder `api`, which is in your `pages` folder.

The pathname for the endpoint is it's path relative to the `pages` directory. A route like `pages/api/user/route.ts` will be available at: `localhost:3000/api/user`

## Methods
You can export any async function with these names `POST`, `GET`, `OPTIONS`, `PUT`, `DELETE`, and if a request has the HTTP Method matching that functions name, it will be called after [middleware](/middleware) has finished executing.