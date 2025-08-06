import http from "node:http";

export async function GET(_: http.IncomingMessage, res: http.ServerResponse) {
    res.writeHead(302, { Location: '/new-path' });
    res.end();
}