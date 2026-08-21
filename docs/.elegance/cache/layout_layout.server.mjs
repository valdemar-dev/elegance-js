// pages/layout.ts
function Layout({ child }) {
  return child();
}
var metadata = () => [
  __tags.meta({ "http-equiv": "Content-Security-Policy", content: "upgrade-insecure-requests" })
];
export {
  Layout as default,
  metadata
};
