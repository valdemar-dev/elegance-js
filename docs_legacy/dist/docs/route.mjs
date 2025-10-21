// src/docs/docs/route.ts
async function GET(_, res) {
  res.writeHead(302, { Location: "/new-path" });
  res.end();
}
export {
  GET
};
