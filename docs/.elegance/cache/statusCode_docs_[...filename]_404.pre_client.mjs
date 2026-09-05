// pages/docs/[...filename]/404.tsx
function extractPathname(rawUrl) {
  if (!rawUrl) return "/";
  let end = rawUrl.length;
  for (let i = 0; i < rawUrl.length; i++) {
    const ch = rawUrl.charCodeAt(i);
    if (ch === 63 || ch === 35) {
      end = i;
      break;
    }
  }
  const path = rawUrl.slice(0, end) || "/";
  if (path.indexOf("%") !== -1) {
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  }
  return path;
}
async function Page({ req }) {
  const pn = extractPathname(req.url);
  return __tags.main({ class: "docs-main" }, [__tags.article({ class: "doc-content" }, [__tags.div({ class: "doc-hero" }, [__tags.h1({ class: "doc-title" }, ["Not found"]), __tags.p({ class: "doc-lead" }, ["No documentation file found for", ` ${pn}`, "."])]), __tags.a({ __eid: 0, class: "doc-link", href: "/docs/start/setup", onClick: (_, e) => {
    e.preventDefault();
    navigate(e.currentTarget.href);
  } }, ["Back to Home"])])]);
}
export {
  Page as default
};
