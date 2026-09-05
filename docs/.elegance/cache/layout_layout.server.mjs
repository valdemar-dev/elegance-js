// pages/layout.ts
function Layout({ child }) {
  return child();
}
var metadata = () => [
  __tags.meta({ "http-equiv": "Content-Security-Policy", content: "upgrade-insecure-requests" }),
  __tags.link({ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" })
];
export {
  Layout as default,
  metadata
};
