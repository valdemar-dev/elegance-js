import { IncomingMessage, ServerResponse } from "http";

export async function GET(req: IncomingMessage, res: ServerResponse) {
    console.log("HELLO THERE");
    res.end("HI THERE");
}