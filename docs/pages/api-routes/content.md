# API Routes
API Routes are **route.ts** files defined in the **api** subdirectory of the **pages** folder.

## How to Use API Routes
In your *pages* directory, create a subdirectory with the name *api*.  
Within this directory, create a file called **route.ts**.    

This file will be export *Route Handlers*.  
Similar to how pages work, API routes also use file system based routing.    

Meaning any request to:
`localhost:3000/api/my-route`  
Will be handled by:
`/pages/api/my-route/route.ts`  

To handle specific *HTTP Methods* for a route, export an **async function** with the matching name,  
from your *route.ts* file.  
For a GET handler, you'd export this:
`export async function GET(req, res) {}`
## Useful Things
The **TypeScript types** of *req* and *res* are:
`req: http.IncomingMessage, res: http.ServerResponse`
as declared in the **node:http** library.