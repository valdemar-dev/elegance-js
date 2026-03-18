import { IncomingMessage, ServerResponse } from "http";

async function middleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
    if (Math.random() > 0.3) {
        res.statusCode = 401;
        res.end("Sorry, you're not getting into this page, cause you're not logged in!");
        
        next();

        return;
    }

    next();
}

export {
    middleware,
}