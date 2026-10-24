import {
  Navbar
} from "/chunks/chunk-GUHGSQYQ.js";
import {
  Link_default
} from "/chunks/chunk-ADESIFDG.js";

// pages/page.ts
function highlightMod() {
  return import(new URL("./components/highlight-server.ts", import.meta.url).href);
}
var HOW_CODE = [
  {
    lang: "text",
    code: `pages/
\u251C\u2500\u2500 page.ts            \u2192  /
\u251C\u2500\u2500 layout.ts          \u2192  wraps all routes below
\u251C\u2500\u2500 about/
\u2502   \u2514\u2500\u2500 page.ts        \u2192  /about
\u251C\u2500\u2500 blog/
\u2502   \u251C\u2500\u2500 page.ts        \u2192  /blog
\u2502   \u251C\u2500\u2500 layout.ts      \u2192  wraps /blog/* only
\u2502   \u2514\u2500\u2500 [slug]/
\u2502       \u2514\u2500\u2500 page.ts    \u2192  /blog/:slug
\u2514\u2500\u2500 api/users/
    \u2514\u2500\u2500 page.ts        \u2192  /api/users  (HTTP handlers)`
  },
  {
    lang: "typescript",
    code: `// pages/card/page.ts  \u2014 tag-function style
const UserCard = component<{ name: string; avatarUrl: string }>({
  atoms: { expanded: false },
  init: async (self, { expanded }) => {
    expanded.value = await getExpandPref(self.props.name);
  },
  view: (self, { expanded }) => {
    const { name, avatarUrl } = self.props;
    return article({ class: \`card \${expanded.value ? "open" : ""}\` },
      img({ src: avatarUrl, alt: name }),
      h2({}, name),
      expanded.value ? section({}, "Full profile...") : null,
      button({ onclick: () => expanded.value = !expanded.value },
        expanded.value ? "Collapse \u2191" : "Expand \u2193")
    );
  }
});

// pages/card/page.tsx  \u2014 JSX style, identical output
const UserCard = component<{ name: string; avatarUrl: string }>({
  atoms: { expanded: false },
  init: async (self, { expanded }) => {
    expanded.value = await getExpandPref(self.props.name);
  },
  view: (self, { expanded }) => {
    const { name, avatarUrl } = self.props;
    return (
      <article class={\`card \${expanded.value ? "open" : ""}\`}>
        <img src={avatarUrl} alt={name} />
        <h2>{name}</h2>
        {expanded.value && <section>Full profile...</section>}
        <button onclick={() => expanded.value = !expanded.value}>
          {expanded.value ? "Collapse \u2191" : "Expand \u2193"}
        </button>
      </article>
    );
  }
});`
  },
  {
    lang: "typescript",
    code: `// const globalAtom = state("Hello, Sailor!");
const Search = component({
  atoms: {
    query: "",
    results: [] as Result[],
    loading: false,
    timer: null as ReturnType<typeof setTimeout> | null
  },

  view: (_, { query, results, loading, timer }) => {
    const handleInput = (e: InputEvent) => {
      query.value = (e.target as HTMLInputElement).value;
      loading.value = true;
      clearTimeout(timer.value!);
      timer.value = setTimeout(async () => {
        results.value = await search(query.value);
        loading.value = false;
      }, 280);
    };

    return div({ class: "search" },
      input({ oninput: handleInput, value: query.value, placeholder: "Search\u2026" }),
      loading.value
        ? div({ class: "spinner" })
        : ul({}, ...results.value.map(r => li({}, r.title)))
    );
  }
});`
  }
];
var EXAMPLES_CODE = [
  {
    lang: "typescript",
    code: `// pages/blog/page.ts
// The directory name is the route. No config, no registration.

const PostList = component({
  atoms: {
    posts: [] as Post[],
    loading: true,
  },

  // init runs on the server, ideal for data that should be
  // present before the first byte of HTML is sent
  init: async (_, { posts, loading }) => {
    posts.value = await db.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    loading.value = false;
  },

  view: (_, { posts, loading }) =>
    loading.value
      ? div({ class: "skeleton" })
      : ul({ class: "post-list" },
          ...posts.value.map(post =>
            li({},
              Link({ href: \`/blog/\${post.slug}\` }, post.title),
              time({ datetime: post.date }, formatDate(post.date))
            )
          )
        )
});

export default function BlogIndex() {
  return PostList();
}`
  },
  {
    lang: "tsx",
    code: `// pages/blog/page.tsx
// Prefer JSX? Drop a .tsx file in the same spot. Same atoms, same routing.

const PostList = component({
  atoms: {
    posts: [] as Post[],
    loading: true,
  },

  init: async (_, { posts, loading }) => {
    posts.value = await db.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    loading.value = false;
  },

  view: (_, { posts, loading }) => (
    loading.value
      ? <div class="skeleton" />
      : <ul class="post-list">
          {posts.value.map(post => (
            <li>
              <a href={\`/blog/\${post.slug}\`}>{post.title}</a>
              <time datetime={post.date}>{formatDate(post.date)}</time>
            </li>
          ))}
        </ul>
  )
});

export default function BlogIndex() {
  return <PostList />;
}

// .ts and .tsx files can import each other freely.
// The preprocessor handles both; no tsconfig changes needed.`
  },
  {
    lang: "typescript",
    code: `// pages/api/posts/page.ts
// Named exports for HTTP methods turn any page file into a handler.
// Works alongside a default export.

import type { IncomingMessage, ServerResponse } from "node:http";
import { db } from "~/lib/db";

export async function GET(req: IncomingMessage, res: ServerResponse) {
  const posts = await db.posts.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(posts));
}

export async function POST(req: IncomingMessage, res: ServerResponse) {
  let body = "";
  for await (const chunk of req) body += chunk;

  const post = await db.posts.create({ data: JSON.parse(body) });
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(post));
}

// GET, POST, PUT, DELETE, PATCH are all supported`
  },
  {
    lang: "typescript",
    code: `// pages/dashboard/page.ts
// Pages are static by default. Pre-rendered once at build time.
// One export is all it takes to switch to SSR per-request.

export const isDynamic = true;

// Layouts can export isDynamic independently.
// Granularity is per file, not per project.

const Dashboard = component({
  atoms: { data: null as DashboardData | null },

  // With isDynamic = true, init runs on every request
  init: async (self, { data }) => {
    data.value = (await fetchDashboardData(self.props.req as Request));
  },

  view: (_, { data }) =>
    data.value
      ? div({ class: "dashboard" }, renderDashboard(data.value))
      : div({ class: "skeleton" })
});

export default function DashboardPage() {
  return Dashboard();
}`
  }
];
var BEST_CODE = [
  {
    title: "File-system routing",
    from: "Next.js",
    desc: "A page.ts is served at the path of the folder it sits in. Moving or renaming files changes the routes, and [slug] folders are folder names too.",
    color: "var(--amber)",
    snippets: [
      {
        label: "tree",
        path: "pages/",
        lang: "text",
        code: `pages/
\u251C\u2500\u2500 page.ts               \u2192  /
\u251C\u2500\u2500 about/page.ts         \u2192  /about
\u251C\u2500\u2500 blog/
\u2502   \u251C\u2500\u2500 page.ts           \u2192  /blog
\u2502   \u2514\u2500\u2500 [slug]/page.ts    \u2192  /blog/:slug
\u2514\u2500\u2500 api/users/page.ts     \u2192  /api/users

The build scans pages/ and generates the route
table from the tree above. Renaming a folder
renames the route; deleting a file removes it.
[slug] folders match any single segment \u2014
feature 07 covers them.`
      },
      {
        label: "page.ts",
        path: "pages/blog/page.ts",
        lang: "typescript",
        code: `// A page exports a default function that returns
// elements. The framework calls it during SSR and
// serializes the result to HTML.

export default function BlogIndex() {
  return section({ class: "blog" },
    h1({}, "The Blog"),
    ul({},
      ...posts.map(p =>
        li({},
          Link({ href: \`/blog/\${p.slug}\` }, p.title)
        )
      )
    )
  );
}`
      }
    ]
  },
  {
    title: "Fine-grained atoms",
    from: "Solid.js",
    desc: "An atom is a value with a .value. When it changes, the components whose view() read it re-render, and everything else keeps its DOM.",
    color: "var(--lilac)",
    snippets: [
      {
        label: "component",
        path: "pages/counter/page.ts",
        lang: "typescript",
        code: `const Cart = component({
  atoms: {
    items: [] as Item[],
    coupon: null as string | null,
  },

  view: (self, { items, coupon }) =>
    // Reading an atom inside view() subscribes this
    // component to it. Writing items.value re-renders
    // this component; the rest of the page keeps its
    // DOM.
    div({ class: "cart" },
      span({ class: "count" }, \`\${items.value.length} items\`),
      coupon.value
        ? span({ class: "save" }, \`-\${coupon.value}%\`)
        : null,
      button({
        onclick: () => items.value = [...items.value, NEW_ITEM]
      }, "Add to cart")
    )
});`
      },
      {
        label: "compare",
        path: "the same thing elsewhere",
        lang: "typescript",
        code: `// React: useState per component. Sharing state
// between components means lifting it into a
// parent or context, and an update re-renders the
// owning subtree and reconciles the old vdom.

// Solid: signals are fine-grained, with an
// accessor API and compiler directives.

// Elegance: an atom is a value with a .value. The
// subscription is created by view() reading it,
// so the component code contains nothing else.`
      }
    ]
  },
  {
    title: "Server code anywhere",
    from: "React RSC",
    desc: "init() runs on the server and can import your database directly. If server-only code could ever reach the browser bundle, the build fails and names the import.",
    color: "var(--green)",
    snippets: [
      {
        label: "page.ts",
        path: "pages/posts/page.ts",
        lang: "typescript",
        code: `import { db } from "~/lib/db";  // a regular npm package

const Posts = component({
  atoms: { posts: [] as Post[] },

  // init() runs during SSR, before the HTML is sent.
  init: async (_, { posts }) => {
    posts.value = await db.posts.findAll();
  },

  view: (_, { posts }) =>
    ul({ class: "post-list" },
      ...posts.value.map(p => li({}, p.title))
    )
});

// view() is compiled into the browser bundle; init()
// is not. If db could be reached from client code,
// the build fails and names the import.`
      },
      {
        label: "directive",
        path: "pages/lib/db.ts",
        lang: "typescript",
        code: `//!no-bundle-file
import { Pool } from "pg";

export const db = new Pool({ connectionString: process.env.DATABASE_URL });

// The directive above marks this file server-only.
// If any client-reachable code imports it, the
// build fails with the import path.

// Related directives:
//   //!no-bundle        server-only declaration
//   //!allow-bundling   exempt a specific import
//   //!force-bundling   keep a side-effect import`
      }
    ]
  },
  {
    title: "Static by default",
    from: "Astro",
    desc: "Pages are rendered to HTML files at build time and served as-is. A page that needs the request exports isDynamic = true and is rendered per request; neighboring pages are unaffected.",
    color: "var(--blue)",
    snippets: [
      {
        label: "page.ts",
        path: "pages/pricing/page.ts",
        lang: "typescript",
        code: `// Rendered once at build time to
// dist/pricing/index.html. At runtime the server
// returns the file.

export default function Pricing() {
  return section({},
    h1({}, "Pricing"),
    Plan({ name: "Free", price: 0 }),
    Plan({ name: "Pro", price: 20 }),
  );
}

// This page needs the request (session, headers,
// query)? One export renders it per request:

export const isDynamic = true;`
      },
      {
        label: "output",
        path: ".elegance/dist/",
        lang: "text",
        code: `dist/
\u251C\u2500\u2500 index.html          \u2190 rendered at build
\u251C\u2500\u2500 pricing/index.html  \u2190 rendered at build
\u251C\u2500\u2500 dashboard/          \u2190 isDynamic: rendered per request
\u2514\u2500\u2500 blog/
    \u2514\u2500\u2500 hello-world/index.html

Static pages are files, so any web server or CDN
serves them. On this site, the static homepage
measured 0.72ms average latency and 68,877 req/s.

isDynamic is per file, so a project can serve a
static marketing site and a live dashboard from
the same pages/ tree.`
      }
    ]
  },
  {
    title: "Nested layouts",
    from: "Next.js",
    desc: "A layout.ts in any folder wraps every route beneath it, rendered outermost first. A layout marked isDynamic renders its whole subtree per request while sibling routes stay static.",
    color: "var(--orange)",
    snippets: [
      {
        label: "layout.ts",
        path: "pages/admin/layout.ts",
        lang: "typescript",
        code: `// pages/admin/layout.ts
// Wraps every route under /admin. child() renders
// the next layout down, or the page.
export const isDynamic = true;  // whole subtree renders per request

export default function AdminLayout({ child }) {
  return div({ class: "admin" },
    AdminSidebar({}),
    Main({},
      SessionBanner({}),   // reads request cookies
      child()
    )
  );
}

// pages/admin/users/page.ts renders inside this
// layout. isDynamic on a layout applies to its
// whole subtree, so the page itself stays
// unchanged.`
      },
      {
        label: "stack",
        path: "how they compose",
        lang: "text",
        code: `pages/
\u251C\u2500\u2500 layout.ts            \u2460 wraps everything
\u2514\u2500\u2500 admin/
    \u251C\u2500\u2500 layout.ts        \u2461 dynamic, guards /admin/*
    \u2514\u2500\u2500 users/
        \u2514\u2500\u2500 page.ts      \u2462 the page

Render order: \u2460 \u2192 \u2461 \u2192 \u2462, outer to inner.

Next.js stacks layouts the same way. Here every
layout declares isDynamic separately, so marking
\u2461 dynamic puts /admin/* on SSR while routes
outside pages/admin/ remain static files.`
      }
    ]
  },
  {
    title: "API routes",
    from: "Next.js",
    desc: "A named export \u2014 GET, POST, PUT, DELETE, PATCH \u2014 makes a page file answer requests. The arguments are Node's IncomingMessage and ServerResponse.",
    color: "var(--pink)",
    snippets: [
      {
        label: "page.ts",
        path: "pages/api/subscribe/page.ts",
        lang: "typescript",
        code: `import { db } from "~/lib/db";

// GET /api/subscribe?id=42
export async function GET(req, res) {
  const id = new URL(req.url, "http://x").searchParams.get("id");
  const sub = await db.subs.findById(Number(id));
  if (!sub) { res.writeHead(404); return res.end("{}"); }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(sub));
}

// POST /api/subscribe
export async function POST(req, res) {
  let body = "";
  for await (const chunk of req) body += chunk;
  const sub = await db.subs.create(JSON.parse(body));
  res.writeHead(201);
  res.end(JSON.stringify(sub));
}

// req is Node's IncomingMessage and res is
// ServerResponse \u2014 the same objects an
// http.createServer handler receives.`
      },
      {
        label: "usage",
        path: "the wire",
        lang: "text",
        code: ` curl -X POST localhost:3000/api/subscribe \\
      -d '{"email":"hi@example.com"}'
 \u2192  201 Created  {"id":42,"email":"hi@example.com"}

The file pages/api/subscribe/page.ts is the
endpoint /api/subscribe, routed by the same
filesystem rule as every other page, so the API
and the UI live in one tree.

GET, POST, PUT, DELETE and PATCH are the
supported method exports.`
      }
    ]
  },
  {
    title: "Typed dynamic routes",
    from: "SvelteKit",
    desc: "A [slug] folder matches any single segment and passes it to the page as a typed prop. getEnumeratedRoutes renders one static HTML file per known value at build time.",
    color: "var(--amber)",
    snippets: [
      {
        label: "page.ts",
        path: "pages/blog/[slug]/page.ts",
        lang: "typescript",
        code: `// The folder [slug] matches one path segment, and
// its value arrives as a prop:

export default async function Post({ slug }: { slug: string }) {
  const post = await db.posts.findBySlug(slug);

  return article({ class: "post" },
    h1({}, post.title),
    rawHTML(post.body)
  );
}

// GET /blog/hello-world calls this with
// slug === "hello-world". [...rest] folders work
// the same way and capture the remaining segments.`
      },
      {
        label: "enumerated",
        path: "pages/blog/[slug]/page.ts",
        lang: "typescript",
        code: `// If the set of valid slugs is known at build
// time, this export renders one HTML file per
// value:

export async function getEnumeratedRoutes(): Promise<string[]> {
  const posts = await db.posts.findAll();
  return posts.map(p => p.slug);
}

// build output:
//   dist/blog/hello-world/index.html
//   dist/blog/second-post/index.html

// Requests then hit those files. Pages that don't
// export getEnumeratedRoutes render per request.`
      }
    ]
  },
  {
    title: "Middleware",
    from: "Express",
    desc: "A middleware.ts in a folder runs before every route beneath it, receiving (req, res, next). Responding instead of calling next() stops the page from rendering.",
    color: "var(--lilac)",
    snippets: [
      {
        label: "middleware.ts",
        path: "pages/admin/middleware.ts",
        lang: "typescript",
        code: `import { verifySession } from "~/lib/auth";

// Runs before each /admin/* route renders.
export default async function auth(req, res, next) {
  const session = await verifySession(req.headers.cookie);

  if (!session) {
    // Returning without next() ends the request:
    // the page component never runs.
    res.writeHead(302, { Location: "/login" });
    res.end();
    return;
  }

  res.setHeader("x-user-id", session.userId);
  await next();
}`
      },
      {
        label: "flow",
        path: "GET /admin/settings",
        lang: "text",
        code: `GET /admin/settings
  \u2502
  \u251C\u2500 middleware (pages/admin/) runs first
  \u2502    verifySession(cookie)
  \u2502      \u251C\u2500 invalid \u2192 302 /login; the page
  \u2502      \u2502            component never runs
  \u2502      \u2514\u2500 valid   \u2192 setHeader, await next()
  \u2502                     \u2502
  \u251C\u2500 page: pages/admin/settings/page.ts renders
  \u2502
  \u2514\u2500 response

Middleware is discovered per directory, like
pages, and multiple middleware files compose
from the outermost directory inward.`
      }
    ]
  },
  {
    title: "Image optimization",
    from: "Next.js",
    desc: "<Image> compiles into a <picture> element with sized WebP and JPEG variants generated at build time. The variants are static files; there is no image server at runtime.",
    color: "var(--green)",
    snippets: [
      {
        label: "Image",
        path: "pages/gallery/page.tsx",
        lang: "tsx",
        code: `import { Image } from "elegance-js";

export default function Gallery() {
  return (
    <Image
      src="/photos/aurora.jpg"
      width={1200}
      height={800}
      sizes="(max-width: 900px) 100vw, 640px"
      priority                 // preload link for LCP images
      alt="Northern lights over a lake"
    />
  );
}

// src, width, height, sizes and alt are the inputs.
// The build generates the variant files, the srcset
// attributes and the preload link from them.`
      },
      {
        label: "vs <img>",
        path: "with a plain <img>",
        lang: "tsx",
        code: `// A raw <img> ships one file:

const img = (
  <img
    src="/photos/aurora.jpg"   // the full 2.4MB for every viewport
    width={1200}
    height={800}
  />
);

// The browser gets no smaller variant for a 320px
// phone, no WebP, and no preload hint, so the
// largest image arrives last and layout shifts
// until it does. Producing variants, srcset and
// preload by hand is the work <Image> does at
// build time.`
      },
      {
        label: "output",
        path: "generated at build time",
        lang: "html",
        code: `<!-- dist output for the <Image> above -->
<picture>
  <source
    type="image/webp"
    sizes="(max-width: 900px) 100vw, 640px"
    srcset="/images/aurora_320.webp 320w,
            /images/aurora_640.webp 640w,
            /images/aurora_1280.webp 1280w">
  <img
    src="/images/aurora_640.jpg"
    srcset="/images/aurora_320.jpg 320w,
            /images/aurora_640.jpg 640w,
            /images/aurora_1280.jpg 1280w"
    sizes="(max-width: 900px) 100vw, 640px"
    width="1200" height="800"
    fetchpriority="high" loading="eager">
</picture>

<!-- The pipeline compresses each variant during
     the build. They are served as static files
     from /images/ \u2014 the running server never
     touches an image. -->`
      }
    ]
  },
  {
    title: "JSX or tag functions",
    from: "React",
    desc: "Components can be written with JSX in .tsx files or with element calls in .ts files. Both compile to the same nodes, and files in either syntax can import each other.",
    color: "var(--blue)",
    snippets: [
      {
        label: "page.tsx",
        path: "pages/card/page.tsx",
        lang: "tsx",
        code: `const Card = component<{ title: string; done: boolean }>({
  atoms: { open: false },

  view: (self, { open }) => (
    <article class="card">
      <h2>{self.props.title}</h2>
      {open.value && <p>Details\u2026</p>}
      <button onclick={() => open.value = !open.value}>
        {open.value ? "Close \u2191" : "Open \u2193"}
      </button>
    </article>
  )
});

// Atoms hold the state instead of useState, and
// reading open.value inside view() subscribes the
// component to it (feature 02).`
      },
      {
        label: "page.ts",
        path: "pages/card/page.ts",
        lang: "typescript",
        code: `// The same component with element calls:

const Card = component<{ title: string; done: boolean }>({
  atoms: { open: false },

  view: (self, { open }) =>
    article({ class: "card" },
      h2({}, self.props.title),
      open.value && p({}, "Details\u2026"),
      button(
        { onclick: () => open.value = !open.value },
        open.value ? "Close \u2191" : "Open \u2193"
      )
    )
});

// Both files compile to the same nodes with the
// same prop and atom types. A .tsx page can
// import a component from a .ts file and the
// other way around.`
      }
    ]
  }
];
var STRIP_TS_CODE = `const Card = component<{ name: string }>({
  atoms: { open: false },
  view: (self, { open }) =>
    article({ class: "card" },
      h2({}, self.props.name),
      open.value && p({}, "Details\u2026"),
      button({
        onclick: () =>
          open.value = !open.value
      }, open.value ? "Close \u2191" : "Open \u2193")
    )
});`;
var STRIP_TSX_CODE = `const Card = component<{ name: string }>({
  atoms: { open: false },
  view: (self, { open }) => (
    <article class="card">
      <h2>{self.props.name}</h2>
      {open.value && <p>Details\u2026</p>}
      <button
        onclick={() =>
          open.value = !open.value}
      >
        {open.value ? "Close \u2191" : "Open \u2193"}
      </button>
    </article>
  )
});`;
var isDynamic = false;
onPageLoad(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("sr-in");
      } else {
        e.target.classList.remove("sr-in");
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -56px 0px" });
  function observe() {
    document.querySelectorAll(
      ".section-head, .feats-grid, .how-tabs, .callouts, .cta-inner, .footer-inner, .hero-stats, .jsx-inner, .speed-compare, .speed-footnote"
    ).forEach((el) => io.observe(el));
  }
  function initHeroParallax() {
    const hero = document.querySelector(".hero");
    const grid = document.querySelector(".hero-grid");
    const glow = document.querySelector(".hero-glow");
    if (!hero || !grid || !glow) return;
    let scrollY = 0, mx = 0, my = 0, ticking = false;
    const update = () => {
      grid.style.transform = `translateY(${scrollY * 0.22}px) translate(${mx}px, ${my}px)`;
      glow.style.transform = `translateY(${scrollY * 0.1}px) translate(${mx * 0.4}px, ${my * 0.4}px)`;
      ticking = false;
    };
    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
      schedule();
    }, { passive: true });
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 30;
      my = ((e.clientY - r.top) / r.height - 0.5) * 18;
      schedule();
    });
    hero.addEventListener("mouseleave", () => {
      mx = 0;
      my = 0;
      schedule();
    });
  }
  function animateCounters() {
    const stats = document.querySelectorAll(".stat-n");
    stats.forEach((el) => {
      const raw = el.textContent?.trim() || "";
      const cleaned = raw.replace(/,/g, "");
      const match = cleaned.match(/-?\d+(\.\d+)?/);
      if (!match) return;
      const num = parseFloat(match[0]);
      if (isNaN(num) || num === 0) return;
      const prefix = cleaned.slice(0, match.index);
      const suffix = cleaned.slice((match.index || 0) + match[0].length);
      const hasDecimals = match[0].includes(".");
      const duration = 900;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const current = ease * num;
        const formatted = hasDecimals ? current.toFixed(match[0].split(".")[1].length) : Math.round(current).toLocaleString("en-US");
        el.textContent = `${prefix}${formatted}${suffix}`;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = raw;
        }
      }
      requestAnimationFrame(step);
    });
  }
  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) {
    const statsIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(animateCounters, 700);
          statsIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statsIo.observe(heroStats);
  }
  function initMagneticBtns() {
    document.querySelectorAll(".btn--amber").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px) translateY(-2px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }
  function initGridBorderGlow() {
    const grid = document.querySelector(".feats-grid");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".feat"));
    grid.addEventListener("mousemove", (e) => {
      const gr = grid.getBoundingClientRect();
      grid.style.setProperty("--gx", `${e.clientX - gr.left}px`);
      grid.style.setProperty("--gy", `${e.clientY - gr.top}px`);
      cards.forEach((card) => {
        const cr = card.getBoundingClientRect();
        card.style.setProperty("--cx", `${e.clientX - cr.left}px`);
        card.style.setProperty("--cy", `${e.clientY - cr.top}px`);
      });
    }, { passive: true });
    grid.addEventListener("mouseleave", () => {
      grid.style.setProperty("--gx", "-9999px");
      grid.style.setProperty("--gy", "-9999px");
      cards.forEach((card) => {
        card.style.setProperty("--cx", "-9999px");
        card.style.setProperty("--cy", "-9999px");
      });
    });
  }
  function initWindowGlows() {
    document.querySelectorAll(".window").forEach((win) => {
      const glow = win.querySelector(".window-glow");
      if (!glow) return;
      win.addEventListener("mousemove", (e) => {
        const r = win.getBoundingClientRect();
        glow.style.setProperty("--wx", `${e.clientX - r.left}px`);
        glow.style.setProperty("--wy", `${e.clientY - r.top}px`);
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      observe();
      initHeroParallax();
      initMagneticBtns();
      initGridBorderGlow();
      initWindowGlows();
    });
  } else {
    observe();
    initHeroParallax();
    initMagneticBtns();
    initGridBorderGlow();
    initWindowGlows();
  }
});
var Hero = component({ __id: "dZPMS1u",
  atoms: {
    word: "",
    phase: 0,
    idx: 0,
    erasing: false
  },
  onMount: async (_, { word, phase, idx, erasing }) => {
    const WORDS = ["readable.", "auditable.", "fast.", "flexible."];
    const tick = () => {
      const target = WORDS[phase.value];
      const i = idx.value;
      if (!erasing.value) {
        idx.value = i + 1;
        word.value = target.slice(0, i + 1);
        if (i + 1 === target.length) {
          erasing.value = true;
          setTimeout(tick, 2600);
          return;
        }
      } else {
        idx.value = i - 1;
        word.value = target.slice(0, i - 1);
        if (i - 1 === 0) {
          erasing.value = false;
          phase.value = (phase.value + 1) % WORDS.length;
        }
      }
      setTimeout(tick, erasing.value ? 38 : 85);
    };
    setTimeout(tick, 800);
  },
  view: ({ atoms: { word } }) => __tags.section(
    { class: "hero" },
    __tags.div(
      { class: "hero-canvas", "aria-hidden": "true" },
      __tags.div({ class: "hero-grid" }),
      __tags.div({ class: "hero-glow" })
    ),
    __tags.div(
      { style: "margin-top: 2rem;", class: "hero-content" },
      __tags.h1(
        { class: "hero-title" },
        __tags.span({ class: "hero-dim" }, "Framework"),
        __tags.br({}),
        __tags.span({ class: "hero-dim" }, "built to"),
        __tags.br({}),
        __tags.em({ class: "hero-serif" }, "disappear.")
      ),
      __tags.div(
        { class: "hero-typerow" },
        __tags.span({ class: "typerow-pre" }, "Development stays "),
        __tags.span({ class: "typerow-word" }, word.value),
        __tags.span({ class: "typerow-cursor" }, "\u258C")
      ),
      __tags.p(
        { class: "hero-pitch" },
        "Create sites that are the target of envy.",
        __tags.br({}),
        "Fast, reactive, feature-rich and most importantly, safe.",
        __tags.br({}),
        "All with a runtime smaller than a ",
        __tags.b("JPEG.")
      ),
      __tags.div(
        { class: "hero-actions" },
        Link_default({ href: "#how", class: "btn btn--amber" }, "How it works \u2192"),
        Link_default(
          { href: "/#examples", class: "btn btn--ghost" },
          __tags.svg(
            { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "aria-hidden": "true" },
            __tags.polyline({ points: "16 18 22 12 16 6" }),
            __tags.polyline({ points: "8 6 2 12 8 18" })
          ),
          "Examples"
        )
      ),
      __tags.div(
        { class: "hero-stats" },
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "25.8x"),
          __tags.span({ class: "stat-n stat-l" }, "faster than Next.JS")
        ),
        __tags.div({ class: "stat-sep" }),
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "5"),
          __tags.span({ class: "stat-n stat-l" }, "KB runtime")
        ),
        __tags.div({ class: "stat-sep" }),
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "0"),
          __tags.span({ class: "stat-n stat-l" }, "browser deps")
        ),
        __tags.div({ class: "stat-sep" }),
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "MIT"),
          __tags.span({ class: "stat-n stat-l" }, "license")
        )
      ),
      __tags.p({ class: "hero-fine" }, "raw API route \xB7 identical payloads \xB7 oha, 50 connections*")
    )
  )
});
var Feat = component({ __id: "GzhtpDv",
  view: ({ self }) => {
    const { num, title: title2, body, detail, color } = self.props;
    return __tags.div(
      { class: "feat", style: `--fc: ${color}` },
      __tags.div(
        { class: "feat-head" },
        __tags.span({ class: "feat-n" }, num),
        __tags.div({ class: "feat-rule" })
      ),
      __tags.h3({ class: "feat-title" }, title2),
      __tags.p({ class: "feat-body" }, body),
      __tags.span({ class: "feat-detail" }, detail)
    );
  }
});
var HowItWorks = component({ __id: "2rY4KOi",
  atoms: { slide: 0, bodyVisible: false, headVisible: false },
  onMount: (_, { bodyVisible, headVisible }) => {
    const section2 = document.querySelector(".how-section");
    if (!section2) return;
    const obs = new IntersectionObserver(([entry]) => {
      bodyVisible.value = entry.isIntersecting;
      headVisible.value = entry.isIntersecting;
    }, { threshold: 0.1, rootMargin: "0px 0px -56px 0px" });
    obs.observe(section2);
  },
  onNavigate: (_, { bodyVisible, headVisible }) => {
    bodyVisible.value = false;
    headVisible.value = false;
  },
  view: ({ self, atoms: { slide, bodyVisible, headVisible } }) => {
    const concepts = [
      {
        n: "01",
        label: "Routes",
        body: "Drop a directory into pages/ with a page.ts inside. That's a route! No config, no imports, no registration step. The filesystem is the router.",
        aside: "Layouts stack from layout.ts files walking up the directory tree, outermost-first. Each one can independently opt into server rendering. You never touch a router config."
      },
      {
        n: "02",
        label: "Components",
        body: "Write components with tag functions or JSX. Elegance compiles both the same way.",
        aside: "Props flow through the component<Props> generic. Atoms infer their type from the initial value, no config required."
      },
      {
        n: "03",
        label: "State",
        body: "Atoms live inside a component, or the page. When the value changes, only the components that read it re-render, nothing more.",
        aside: "DOM events use a single delegated listener per event type, so the listener count stays flat no matter how many components are mounted."
      }
    ];
    const current = concepts[slide.value];
    return __tags.section(
      { class: "how-section", id: "how" },
      __tags.div(
        { class: "how-inner" },
        __tags.header(
          { class: `section-head${headVisible.value ? " sr-in" : ""}` },
          __tags.h2(
            { class: "section-title" },
            "Three ideas.",
            __tags.br({}),
            __tags.em({ class: "serif-accent" }, "One framework.")
          ),
          __tags.p({ class: "section-sub" }, "The entire mental model. Here's all of it.")
        ),
        __tags.div(
          { class: `how-tabs${headVisible.value ? " sr-in" : ""}` },
          ...concepts.map(
            (c, i) => __tags.button(
              {
                class: `how-tab${slide.value === i ? " how-tab--on" : ""}`,
                onclick: () => slide.value = i
              },
              __tags.span({ class: "tab-n" }, c.n),
              __tags.span({ class: "tab-label" }, c.label)
            )
          )
        ),
        __tags.div(
          { class: `how-body${bodyVisible.value ? " sr-in" : ""}` },
          __tags.div(
            { class: "how-text" },
            __tags.p({ class: "how-lead" }, current.body),
            __tags.p({ class: "how-aside" }, current.aside)
          ),
          __tags.div(
            { class: "how-code" },
            __tags.div(
              { class: "window" },
              __tags.div({ class: "window-glow" }),
              __tags.div(
                { class: "window-bar" },
                __tags.div(
                  { class: "dots" },
                  __tags.div({ class: "dot dot--r" }),
                  __tags.div({ class: "dot dot--y" }),
                  __tags.div({ class: "dot dot--g" })
                ),
                __tags.span({ class: "window-label" }, `concept ${current.n} | ${current.label}`)
              ),
              __tags.pre(
                { class: "window-pre" },
                __tags.code({ class: "window-code", key: `how-code-${slide.value}` }, rawHTML(self.props.codeHtml[slide.value] ?? ""))
              )
            )
          )
        )
      )
    );
  }
});
var Examples = component({ __id: "Krs5Sly",
  atoms: { tab: 0, windowVisible: false, headVisible: false },
  onMount: (_, { windowVisible, headVisible }) => {
    const ioOpts = { threshold: 0.1, rootMargin: "0px 0px -56px 0px" };
    const win = document.querySelector(".examples-section .window--wide");
    if (win) {
      const obsWin = new IntersectionObserver(([entry]) => {
        windowVisible.value = entry.isIntersecting;
      }, ioOpts);
      obsWin.observe(win);
    }
    const head = document.querySelector(".examples-section .section-head");
    if (head) {
      const obsHead = new IntersectionObserver(([entry]) => {
        headVisible.value = entry.isIntersecting;
      }, ioOpts);
      obsHead.observe(head);
    }
  },
  onNavigate: (_, { windowVisible, headVisible }) => {
    windowVisible.value = false;
    headVisible.value = false;
  },
  view: ({ self, atoms: { tab, windowVisible, headVisible } }) => {
    const files = [
      {
        label: "Routing",
        path: "pages/blog/page.ts"
      },
      {
        label: "JSX / TSX",
        path: "pages/blog/page.tsx"
      },
      {
        label: "API Routes",
        path: "pages/api/posts/page.ts"
      },
      {
        label: "isDynamic",
        path: "pages/dashboard/page.ts"
      }
    ];
    const active = files[tab.value];
    return __tags.section(
      { class: "examples-section", id: "examples" },
      __tags.header(
        { class: `section-head${headVisible.value ? " sr-in" : ""}` },
        __tags.h2(
          { class: "section-title" },
          "Small surface.",
          __tags.br({}),
          __tags.em({ class: "serif-accent" }, "Real projects.")
        ),
        __tags.p({ class: "section-sub" }, "Every concept above expressed as actual files you'd ship.")
      ),
      __tags.div(
        { class: `window window--wide${windowVisible.value ? " sr-in" : ""}` },
        __tags.div({ class: "window-glow" }),
        __tags.div(
          { class: "window-bar" },
          __tags.div(
            { class: "dots" },
            __tags.div({ class: "dot dot--r" }),
            __tags.div({ class: "dot dot--y" }),
            __tags.div({ class: "dot dot--g" })
          ),
          __tags.div(
            { class: "tab-row" },
            ...files.map(
              (f, i) => __tags.button({
                class: `file-tab${tab.value === i ? " file-tab--on" : ""}`,
                onclick: () => tab.value = i
              }, f.label)
            )
          ),
          __tags.span({ class: "window-path" }, active.path)
        ),
        __tags.pre(
          { class: "window-pre" },
          __tags.code({ class: "window-code", key: `ex-code-${tab.value}` }, rawHTML(self.props.codeHtml[tab.value] ?? ""))
        )
      ),
      __tags.div(
        { class: "callouts" },
        __tags.div(
          { class: "callout" },
          __tags.span({ class: "callout-n" }, "01"),
          __tags.div(
            {},
            __tags.strong({ class: "callout-title" }, "Transparent preprocessing"),
            __tags.p({ class: "callout-body" }, "OXC rewrites tag calls and assigns atom IDs in one fast pass. Nothing changes about how you write TypeScript, the transformation is an implementation detail, not a mental model you carry around.")
          )
        ),
        __tags.div(
          { class: "callout" },
          __tags.span({ class: "callout-n" }, "02"),
          __tags.div(
            {},
            __tags.strong({ class: "callout-title" }, "Atom hydration, zero wiring"),
            __tags.p({ class: "callout-body" }, "Atom values are serialized to JSON during SSR and restored on the client automatically. No manual hydration calls, no mismatch warnings, no extra round-trip for state you already fetched.")
          )
        ),
        __tags.div(
          { class: "callout" },
          __tags.span({ class: "callout-n" }, "03"),
          __tags.div(
            {},
            __tags.strong({ class: "callout-title" }, "init server-side, onMount client-side"),
            __tags.p({ class: "callout-body" }, "init is awaited during SSR, the right place for data fetching. onMount fires after the DOM is live. onUnmount fires on teardown. The full lifecycle fits on an index card.")
          )
        )
      )
    );
  }
});
var BestOf = component({ __id: "bBcXqmo",
  atoms: { tab: 0, sub: 0, headVisible: false, bodyVisible: false },
  onMount: (_, { headVisible, bodyVisible }) => {
    const ioOpts = { threshold: 0.1, rootMargin: "0px 0px -56px 0px" };
    const head = document.querySelector(".best-section .section-head");
    if (head) {
      const obsHead = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          headVisible.value = true;
          obsHead.disconnect();
        }
      }, ioOpts);
      obsHead.observe(head);
    }
    const body = document.querySelector(".best-section .best-body");
    if (body) {
      const obsBody = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          bodyVisible.value = true;
          obsBody.disconnect();
        }
      }, ioOpts);
      obsBody.observe(body);
    }
  },
  view: ({ self, atoms: { tab, sub, headVisible, bodyVisible } }) => {
    const active = BEST_CODE[tab.value];
    const snip = active.snippets[sub.value] ?? active.snippets[0];
    return __tags.section(
      { class: "best-section", id: "best" },
      __tags.header(
        { class: `section-head${headVisible.value ? " sr-in" : ""}` },
        __tags.h2(
          { class: "section-title" },
          "The best of",
          __tags.br({}),
          __tags.em({ class: "serif-accent" }, "every framework.")
        ),
        __tags.p(
          { class: "section-sub" },
          "Routing, state, server code, rendering, images \u2014 the ideas behind React, Solid, Astro and SvelteKit, as they work in Elegance."
        )
      ),
      __tags.div(
        { class: `best-body${bodyVisible.value ? " sr-in" : ""}` },
        __tags.div(
          { class: "best-win" },
          __tags.div(
            { class: "window best-window", style: `--fc: ${active.color}` },
            __tags.div({ class: "window-glow" }),
            __tags.div(
              { class: "window-bar" },
              __tags.div(
                { class: "dots" },
                __tags.div({ class: "dot dot--r" }),
                __tags.div({ class: "dot dot--y" }),
                __tags.div({ class: "dot dot--g" })
              ),
              __tags.span({ class: "window-label" }, active.title),
              ...active.snippets.length > 1 ? [
                __tags.div(
                  { class: "tab-row best-tabs" },
                  ...active.snippets.map(
                    (s, i) => __tags.button({
                      class: `file-tab${sub.value === i ? " file-tab--on" : ""}`,
                      onclick: () => sub.value = i
                    }, s.label)
                  )
                )
              ] : [],
              __tags.span({ class: "window-path" }, snip.path)
            ),
            __tags.pre(
              { class: "window-pre" },
              __tags.code({ class: "window-code best-code-anim", key: `best-code-${tab.value}-${sub.value}` }, rawHTML(self.props.codeHtml[tab.value]?.[sub.value] ?? ""))
            )
          )
        ),
        __tags.div(
          { class: "best-list" },
          ...BEST_CODE.map(
            (f, i) => __tags.button(
              {
                class: `best-item${tab.value === i ? " best-item--on" : ""}`,
                style: `--fc: ${f.color}`,
                onclick: () => {
                  tab.value = i;
                  sub.value = 0;
                }
              },
              __tags.span({ class: "best-item-n" }, String(i + 1).padStart(2, "0")),
              __tags.div(
                { class: "best-item-main" },
                __tags.div(
                  { class: "best-item-head" },
                  __tags.span({ class: "best-item-title" }, f.title),
                  __tags.span({ class: "best-item-from" }, f.from)
                ),
                __tags.p({ class: "best-item-desc" }, f.desc)
              )
            )
          )
        )
      )
    );
  }
});
async function Page() {
  const { highlightCode } = await highlightMod();
  const [howCodeHtml, exCodeHtml, tsHtml, tsxHtml, bestCodeHtml] = await Promise.all([
    Promise.all(HOW_CODE.map((c) => highlightCode(c.code, c.lang))),
    Promise.all(EXAMPLES_CODE.map((c) => highlightCode(c.code, c.lang))),
    highlightCode(STRIP_TS_CODE, "typescript"),
    highlightCode(STRIP_TSX_CODE, "tsx"),
    Promise.all(BEST_CODE.map((e) => Promise.all(e.snippets.map((s) => highlightCode(s.code, s.lang)))))
  ]);
  return __tags.div(
    { class: "root" },
    Navbar(),
    Hero(),
    BestOf({ codeHtml: bestCodeHtml }),
    __tags.section(
      { class: "feats-section" },
      __tags.header(
        { class: "section-head" },
        __tags.h2(
          { class: "section-title" },
          "What it actually ",
          __tags.em({ class: "serif-accent" }, "does.")
        ),
        __tags.p(
          {
            class: "section-sub"
          },
          "A small footprint and no dependencies doesn't mean a small feature set. ",
          "With Elegance, the opposite is true. Here are just a fraction."
        )
      ),
      __tags.div(
        { class: "feats-grid" },
        Feat({
          num: "01",
          title: "FS Routing",
          body: "Your page folder IS your router. A directory with a page.ts inside is a route, full stop. Just export a default function that resolves into some element calls.",
          detail: "/[slug] \xB7 /[...rest] \xB7 layouts \xB7 API routes",
          color: "var(--amber)"
        }),
        Feat({
          num: "02",
          title: "Atoms",
          body: "State lives in atoms. Read one inside view() and just that component re-renders when the atom changes. Just a value with a .value.",
          detail: "Fine-grained \xB7 no vdom \xB7 auto-batched",
          color: "var(--lilac)"
        }),
        Feat({
          num: "03",
          title: "Write Server Code Anywhere",
          body: "Our state-of-the-art compiler let's you write server-side code worry-free in the same file as your client-facing code. Import Chart in the same place you make your DB calls, with no worries.",
          detail: "SSR by default \xB7 !no-bundle \xB7 dead code elimination",
          color: "var(--green)"
        }),
        Feat({
          num: "04",
          title: "Static or live, per page",
          body: "Build output is static HTML by default. Fast, cacheable and free to host anywhere. One export flips a page to build per-request. Mix them freely across the same project; your blog can be static while your dashboard is live.",
          detail: "export const isDynamic = true",
          color: "var(--blue)"
        }),
        Feat({
          num: "05",
          title: "Atom hydration",
          body: "Whatever state your server computed gets serialized into the page and restored on the client automatically. No need to re-fetch data you already have.",
          detail: "SSR state \u2192 client \xB7 zero wiring",
          color: "var(--orange)"
        }),
        Feat({
          num: "06",
          title: "Nested layouts",
          body: "Drop a layout.ts into any directory and it wraps every route beneath it. Layouts, just like pages, can be dynamic or static; you can even mix and match. They render outer to inner.",
          detail: "Nested \xB7 independent \xB7 per-layout isDynamic",
          color: "var(--pink)"
        }),
        Feat({
          num: "07",
          title: "API routes",
          body: "Export GET, POST, PUT, DELETE, or PATCH from any route.ts and that route handles the request as a plain HTTP handler.",
          detail: "GET \xB7 POST \xB7 PUT \xB7 DELETE \xB7 PATCH",
          color: "var(--amber)"
        }),
        Feat({
          num: "08",
          title: "Slug routes",
          body: "Name a directory [id] and the segment becomes a typed parameter. [...rest] catches everything that follows. Slug values are available as props inside the page constructor in that route.",
          detail: "/posts/[slug] \xB7 /files/[...path]",
          color: "var(--lilac)"
        }),
        Feat({
          num: "09",
          title: "Middleware",
          body: "Run code before any route resolves. Auth checks, redirects, request rewriting, header injection. Middleware composes cleanly and can short-circuit the response without touching the page at all.",
          detail: "Auth \xB7 redirects \xB7 headers \xB7 rewriting",
          color: "var(--green)"
        })
      )
    ),
    HowItWorks({ codeHtml: howCodeHtml }),
    __tags.section(
      { class: "jsx-strip" },
      __tags.div(
        { class: "jsx-inner" },
        __tags.div(
          { class: "jsx-text" },
          __tags.h2(
            { class: "jsx-title" },
            "Prefer JSX syntax?",
            __tags.br({}),
            __tags.em({ class: "jsx-accent" }, "Use TSX.")
          ),
          __tags.p(
            { class: "jsx-body" },
            "Elegance supports both ",
            __tags.code({ class: "jsx-inline" }, ".ts"),
            " and ",
            __tags.code({ class: "jsx-inline" }, ".tsx"),
            " as first-class page formats. Tag functions JSX syntax get the same atoms, same routing and identical output.",
            __tags.br({}),
            __tags.br({}),
            "Either way, you get full TypeScript inference end-to-end: props, atoms, and return types are all checked at compile time."
          ),
          __tags.div(
            { class: "jsx-pills" },
            __tags.span({ class: "jsx-pill jsx-pill--ts" }, ".ts"),
            __tags.span({ class: "jsx-pill jsx-pill--tsx" }, ".tsx"),
            __tags.span({ class: "jsx-pill-eq" }, "identical output \xB7 fully typed")
          )
        ),
        __tags.div(
          { class: "jsx-windows" },
          __tags.div(
            { class: "jsx-win jsx-win--left" },
            __tags.div(
              { class: "jsx-win-bar" },
              __tags.div(
                { class: "dots" },
                __tags.div({ class: "dot dot--r" }),
                __tags.div({ class: "dot dot--y" }),
                __tags.div({ class: "dot dot--g" })
              ),
              __tags.span({ class: "jsx-win-label" }, "page"),
              __tags.span({ class: "jsx-win-ext" }, ".ts")
            ),
            __tags.pre(
              { class: "jsx-pre" },
              __tags.code({ class: "window-code" }, rawHTML(tsHtml))
            )
          ),
          __tags.div(
            { class: "jsx-win-vs" },
            __tags.span({}, "or")
          ),
          __tags.div(
            { class: "jsx-win jsx-win--right" },
            __tags.div(
              { class: "jsx-win-bar" },
              __tags.div(
                { class: "dots" },
                __tags.div({ class: "dot dot--r" }),
                __tags.div({ class: "dot dot--y" }),
                __tags.div({ class: "dot dot--g" })
              ),
              __tags.span({ class: "jsx-win-label" }, "page"),
              __tags.span({ class: "jsx-win-ext jsx-win-ext--tsx" }, ".tsx")
            ),
            __tags.pre(
              { class: "jsx-pre" },
              __tags.code({ class: "window-code" }, rawHTML(tsxHtml))
            )
          )
        )
      )
    ),
    __tags.section(
      { class: "speed-section" },
      __tags.div(
        { class: "speed-inner" },
        __tags.header(
          { class: "section-head" },
          __tags.h2(
            { class: "section-title" },
            "Built for",
            __tags.br({}),
            __tags.em({ class: "serif-accent" }, "absurd speed.")
          ),
          __tags.p({ class: "section-sub" }, "Stress-tested against Next.JS on a page with 200,000 mounted components.")
        ),
        __tags.div(
          { class: "speed-compare" },
          __tags.div(
            { class: "speed-col speed-col--elegance" },
            __tags.div(
              { class: "speed-brand" },
              __tags.div({ class: "speed-brand-dot" }),
              __tags.span({ class: "speed-brand-name" }, "Elegance")
            ),
            __tags.div(
              { class: "speed-metrics" },
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n" }, "68,877"),
                __tags.span({ class: "speed-u" }, "req/s"),
                __tags.span({ class: "speed-l" }, "requests per second")
              ),
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n" }, "0.72"),
                __tags.span({ class: "speed-u" }, "ms"),
                __tags.span({ class: "speed-l" }, "average latency")
              ),
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n" }, "1.49"),
                __tags.span({ class: "speed-u" }, "ms"),
                __tags.span({ class: "speed-l" }, "p99 latency")
              ),
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n" }, "198"),
                __tags.span({ class: "speed-u" }, "B"),
                __tags.span({ class: "speed-l" }, "transferred \xB7 Brotli")
              )
            )
          ),
          __tags.div(
            { class: "speed-col speed-col--next" },
            __tags.div(
              { class: "speed-brand" },
              __tags.div({ class: "speed-brand-dot speed-brand-dot--dim" }),
              __tags.span({ class: "speed-brand-name speed-brand-name--dim" }, "Next.JS")
            ),
            __tags.div(
              { class: "speed-metrics" },
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n speed-n--dim" }, "15"),
                __tags.span({ class: "speed-u speed-u--dim" }, "req/s"),
                __tags.span({ class: "speed-l" }, "requests per second")
              ),
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n speed-n--dim" }, "3.45"),
                __tags.span({ class: "speed-u speed-u--dim" }, "s"),
                __tags.span({ class: "speed-l" }, "average latency")
              ),
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n speed-n--dim" }, "3.85"),
                __tags.span({ class: "speed-u speed-u--dim" }, "s"),
                __tags.span({ class: "speed-l" }, "p99 latency")
              ),
              __tags.div(
                { class: "speed-metric" },
                __tags.span({ class: "speed-n speed-n--dim" }, "1.07"),
                __tags.span({ class: "speed-u speed-u--dim" }, "MB"),
                __tags.span({ class: "speed-l" }, "transferred \xB7 GZip")
              )
            )
          ),
          __tags.div({ class: "speed-vs-badge" }, "vs")
        ),
        __tags.div(
          { class: "speed-footnote" },
          __tags.div(
            { class: "speed-fn-text" },
            __tags.span({ class: "speed-ratio" }, "4,592x"),
            __tags.span({ class: "speed-fn-label" }, " more requests/sec  \xB7  200K ", __tags.code({}, "<p>"), " elements")
          ),
          Link_default(
            { href: "/speed", class: "speed-full-link" },
            "Full methodology & raw results",
            __tags.span({ class: "speed-arrow" }, " \u2192")
          )
        )
      )
    ),
    Examples({ codeHtml: exCodeHtml }),
    __tags.section(
      { class: "cta-section" },
      __tags.div(
        { class: "cta-inner" },
        __tags.h2(
          { class: "cta-title" },
          "Two commands,",
          __tags.br({}),
          __tags.em({ class: "cta-accent" }, "et Voil\xE0.")
        ),
        __tags.p({ class: "cta-sub" }, "Write a page.ts. Export a default function. Elegance handles the rest."),
        __tags.div(
          { class: "cta-terminal" },
          __tags.pre(
            { class: "cta-pre" },
            __tags.code(
              {},
              __tags.span({ class: "dim" }, "$ "),
              __tags.span({ class: "hi" }, "npx create-elegance-app\n"),
              __tags.span({ class: "dim" }, "$ "),
              __tags.span({ class: "hi" }, "npx elegance"),
              "          ",
              __tags.span({ class: "dim" }, "# dev server, hot-reload\n")
            )
          )
        ),
        __tags.div(
          { class: "cta-links" },
          Link_default({ href: "/docs/start/setup", class: "btn btn--amber" }, "Read the docs"),
          Link_default({
            href: "https://github.com/valdemar-dev/elegance-js",
            class: "btn btn--ghost",
            rel: "noopener noreferrer",
            target: "_blank"
          }, "Star on GitHub")
        ),
        __tags.p({ class: "cta-fine" }, "no black box required!")
      )
    ),
    __tags.footer(
      { class: "site-footer" },
      __tags.div(
        { class: "footer-inner" },
        __tags.div(
          { class: "footer-brand-col" },
          __tags.div(
            { class: "footer-brand" },
            __tags.svg(
              { width: 26, height: 26, viewBox: "0 0 24 24", "aria-hidden": "true" },
              __tags.polygon({ points: "12,1 23,12 12,23 1,12", fill: "none", stroke: "var(--amber)", "stroke-width": "1.5" }),
              __tags.circle({ cx: 12, cy: 12, r: 2.5, fill: "var(--amber)" })
            ),
            __tags.span({ class: "footer-wordmark" }, "ELEGANCE")
          ),
          __tags.p({ class: "footer-blurb" }, "The parts that matter, and none that don't.")
        ),
        __tags.div(
          { class: "footer-cols" },
          __tags.div(
            { class: "footer-col" },
            __tags.h5({ class: "col-head" }, "Framework"),
            Link_default({ href: "/docs/start/setup", class: "col-link" }, "Documentation")
          ),
          __tags.div(
            { class: "footer-col" },
            __tags.h5({ class: "col-head" }, "Community"),
            Link_default({ href: "https://github.com/valdemar-dev/elegance-js", class: "col-link" }, "GitHub")
          )
        )
      ),
      __tags.div(
        { class: "footer-bottom" },
        __tags.span({}, "\xA9 2026 Elegance. Built with Elegance."),
        __tags.span({ class: "footer-v" }, "v3.2")
      )
    )
  );
}
var metadata = () => [
  __tags.title({}, "Elegance. The Web Framework of the Future"),
  __tags.meta({ charset: "UTF-8" }),
  __tags.meta({ name: "viewport", content: "width=device-width, initial-scale=1.0" }),
  __tags.meta({ name: "description", content: "Elegance is a full-stack TypeScript framework with file-based routing, reactive atoms, and static-by-default rendering. Zero runtime dependencies." }),
  __tags.meta({ name: "theme-color", content: "#080808" }),
  __tags.link({
    rel: "stylesheet",
    href: "/home.css"
  })
];
export {
  Page as default,
  isDynamic,
  metadata
};
