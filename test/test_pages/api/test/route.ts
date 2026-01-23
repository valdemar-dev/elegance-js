import { IncomingMessage, ServerResponse } from "http";

export async function GET(req: IncomingMessage, res: ServerResponse) {
    res.end("HI THERE");
}