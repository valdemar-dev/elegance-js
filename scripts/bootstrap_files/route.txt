import { IncomingMessage, ServerResponse } from "http";

export async function GET(req: IncomingMessage, res: ServerResponse) {
    res.statusCode = 403;
    res.end("You're not allowed!! Shoo!");
}