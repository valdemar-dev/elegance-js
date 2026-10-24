import { IncomingMessage, ServerResponse } from "node:http";

/**
 * This is an API Route. It's available to curl at: `http://localhost:3000/api/hello`.
 * You can export any standard HTTP method, like GET, POST, DELETE, etc. and Elegance will create the appropriate endpoints.
 * 
 * `req` and `res` are automatically passed in, and are the standard types from node:http.
 */
export async function GET({ res }: { res: ServerResponse }) {
    res.statusCode = 200;
    res.end("Hello, World!");

    return;
}