import { IncomingMessage, ServerResponse } from "http";

async function middleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
} 

export {
    middleware,
}