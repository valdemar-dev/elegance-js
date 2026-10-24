//!allow-bundling
import{default as x}from"/chunks/layout_layout.client.mjs";import{Navbar as E}from"/chunks/chunk-GUHGSQYQ.js";import{Link_default as d}from"/chunks/chunk-ADESIFDG.js";var _=[{title:"File-system routing",from:"Next.js",desc:"A page.ts is served at the path of the folder it sits in. Moving or renaming files changes the routes, and [slug] folders are folder names too.",color:"var(--amber)",snippets:[{label:"tree",path:"pages/",lang:"text",code:`pages/
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
feature 07 covers them.`},{label:"page.ts",path:"pages/blog/page.ts",lang:"typescript",code:`// A page exports a default function that returns
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
}`}]},{title:"Fine-grained atoms",from:"Solid.js",desc:"An atom is a value with a .value. When it changes, the components whose view() read it re-render, and everything else keeps its DOM.",color:"var(--lilac)",snippets:[{label:"component",path:"pages/counter/page.ts",lang:"typescript",code:`const Cart = component({
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
});`},{label:"compare",path:"the same thing elsewhere",lang:"typescript",code:`// React: useState per component. Sharing state
// between components means lifting it into a
// parent or context, and an update re-renders the
// owning subtree and reconciles the old vdom.

// Solid: signals are fine-grained, with an
// accessor API and compiler directives.

// Elegance: an atom is a value with a .value. The
// subscription is created by view() reading it,
// so the component code contains nothing else.`}]},{title:"Server code anywhere",from:"React RSC",desc:"init() runs on the server and can import your database directly. If server-only code could ever reach the browser bundle, the build fails and names the import.",color:"var(--green)",snippets:[{label:"page.ts",path:"pages/posts/page.ts",lang:"typescript",code:`import { db } from "~/lib/db";  // a regular npm package

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
// the build fails and names the import.`},{label:"directive",path:"pages/lib/db.ts",lang:"typescript",code:`//!no-bundle-file
import { Pool } from "pg";

export const db = new Pool({ connectionString: process.env.DATABASE_URL });

// The directive above marks this file server-only.
// If any client-reachable code imports it, the
// build fails with the import path.

// Related directives:
//   //!no-bundle        server-only declaration
//   //!allow-bundling   exempt a specific import
//   //!force-bundling   keep a side-effect import`}]},{title:"Static by default",from:"Astro",desc:"Pages are rendered to HTML files at build time and served as-is. A page that needs the request exports isDynamic = true and is rendered per request; neighboring pages are unaffected.",color:"var(--blue)",snippets:[{label:"page.ts",path:"pages/pricing/page.ts",lang:"typescript",code:`// Rendered once at build time to
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

export const isDynamic = true;`},{label:"output",path:".elegance/dist/",lang:"text",code:`dist/
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
the same pages/ tree.`}]},{title:"Nested layouts",from:"Next.js",desc:"A layout.ts in any folder wraps every route beneath it, rendered outermost first. A layout marked isDynamic renders its whole subtree per request while sibling routes stay static.",color:"var(--orange)",snippets:[{label:"layout.ts",path:"pages/admin/layout.ts",lang:"typescript",code:`// pages/admin/layout.ts
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
// unchanged.`},{label:"stack",path:"how they compose",lang:"text",code:`pages/
\u251C\u2500\u2500 layout.ts            \u2460 wraps everything
\u2514\u2500\u2500 admin/
    \u251C\u2500\u2500 layout.ts        \u2461 dynamic, guards /admin/*
    \u2514\u2500\u2500 users/
        \u2514\u2500\u2500 page.ts      \u2462 the page

Render order: \u2460 \u2192 \u2461 \u2192 \u2462, outer to inner.

Next.js stacks layouts the same way. Here every
layout declares isDynamic separately, so marking
\u2461 dynamic puts /admin/* on SSR while routes
outside pages/admin/ remain static files.`}]},{title:"API routes",from:"Next.js",desc:"A named export \u2014 GET, POST, PUT, DELETE, PATCH \u2014 makes a page file answer requests. The arguments are Node's IncomingMessage and ServerResponse.",color:"var(--pink)",snippets:[{label:"page.ts",path:"pages/api/subscribe/page.ts",lang:"typescript",code:`import { db } from "~/lib/db";

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
// http.createServer handler receives.`},{label:"usage",path:"the wire",lang:"text",code:` curl -X POST localhost:3000/api/subscribe \\
      -d '{"email":"hi@example.com"}'
 \u2192  201 Created  {"id":42,"email":"hi@example.com"}

The file pages/api/subscribe/page.ts is the
endpoint /api/subscribe, routed by the same
filesystem rule as every other page, so the API
and the UI live in one tree.

GET, POST, PUT, DELETE and PATCH are the
supported method exports.`}]},{title:"Typed dynamic routes",from:"SvelteKit",desc:"A [slug] folder matches any single segment and passes it to the page as a typed prop. getEnumeratedRoutes renders one static HTML file per known value at build time.",color:"var(--amber)",snippets:[{label:"page.ts",path:"pages/blog/[slug]/page.ts",lang:"typescript",code:`// The folder [slug] matches one path segment, and
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
// the same way and capture the remaining segments.`},{label:"enumerated",path:"pages/blog/[slug]/page.ts",lang:"typescript",code:`// If the set of valid slugs is known at build
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
// export getEnumeratedRoutes render per request.`}]},{title:"Middleware",from:"Express",desc:"A middleware.ts in a folder runs before every route beneath it, receiving (req, res, next). Responding instead of calling next() stops the page from rendering.",color:"var(--lilac)",snippets:[{label:"middleware.ts",path:"pages/admin/middleware.ts",lang:"typescript",code:`import { verifySession } from "~/lib/auth";

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
}`},{label:"flow",path:"GET /admin/settings",lang:"text",code:`GET /admin/settings
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
from the outermost directory inward.`}]},{title:"Image optimization",from:"Next.js",desc:"<Image> compiles into a <picture> element with sized WebP and JPEG variants generated at build time. The variants are static files; there is no image server at runtime.",color:"var(--green)",snippets:[{label:"Image",path:"pages/gallery/page.tsx",lang:"tsx",code:`import { Image } from "elegance-js";

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
// attributes and the preload link from them.`},{label:"vs <img>",path:"with a plain <img>",lang:"tsx",code:`// A raw <img> ships one file:

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
// build time.`},{label:"output",path:"generated at build time",lang:"html",code:`<!-- dist output for the <Image> above -->
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
     touches an image. -->`}]},{title:"JSX or tag functions",from:"React",desc:"Components can be written with JSX in .tsx files or with element calls in .ts files. Both compile to the same nodes, and files in either syntax can import each other.",color:"var(--blue)",snippets:[{label:"page.tsx",path:"pages/card/page.tsx",lang:"tsx",code:`const Card = component<{ title: string; done: boolean }>({
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
// component to it (feature 02).`},{label:"page.ts",path:"pages/card/page.ts",lang:"typescript",code:`// The same component with element calls:

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
// other way around.`}]}];onPageLoad(()=>{const r=new IntersectionObserver(s=>{s.forEach(u=>{u.isIntersecting?u.target.classList.add("sr-in"):u.target.classList.remove("sr-in")})},{threshold:.1,rootMargin:"0px 0px -56px 0px"});function c(){document.querySelectorAll(".section-head, .feats-grid, .how-tabs, .callouts, .cta-inner, .footer-inner, .hero-stats, .jsx-inner, .speed-compare, .speed-footnote").forEach(s=>r.observe(s))}function a(){const s=document.querySelector(".hero"),u=document.querySelector(".hero-grid"),l=document.querySelector(".hero-glow");if(!s||!u||!l)return;let y=0,F=0,i=0,h=!1;const f=()=>{u.style.transform=`translateY(${y*.22}px) translate(${F}px, ${i}px)`,l.style.transform=`translateY(${y*.1}px) translate(${F*.4}px, ${i*.4}px)`,h=!1},m=()=>{h||(h=!0,requestAnimationFrame(f))};window.addEventListener("scroll",()=>{y=window.scrollY,m()},{passive:!0}),s.addEventListener("mousemove",v=>{const g=s.getBoundingClientRect();F=((v.clientX-g.left)/g.width-.5)*30,i=((v.clientY-g.top)/g.height-.5)*18,m()}),s.addEventListener("mouseleave",()=>{F=0,i=0,m()})}function t(){document.querySelectorAll(".stat-n").forEach(u=>{const l=u.textContent?.trim()||"",y=l.replace(/,/g,""),F=y.match(/-?\d+(\.\d+)?/);if(!F)return;const i=parseFloat(F[0]);if(isNaN(i)||i===0)return;const h=y.slice(0,F.index),f=y.slice((F.index||0)+F[0].length),m=F[0].includes("."),v=900,g=performance.now();function b(C){const B=Math.min((C-g)/v,1),w=(1-Math.pow(1-B,3))*i,q=m?w.toFixed(F[0].split(".")[1].length):Math.round(w).toLocaleString("en-US");u.textContent=`${h}${q}${f}`,B<1?requestAnimationFrame(b):u.textContent=l}requestAnimationFrame(b)})}const e=document.querySelector(".hero-stats");if(e){const s=new IntersectionObserver(u=>{u.forEach(l=>{l.isIntersecting&&(setTimeout(t,700),s.unobserve(l.target))})},{threshold:.5});s.observe(e)}function n(){document.querySelectorAll(".btn--amber").forEach(s=>{s.addEventListener("mousemove",u=>{const l=s.getBoundingClientRect(),y=u.clientX-(l.left+l.width/2),F=u.clientY-(l.top+l.height/2);s.style.transform=`translate(${y*.18}px, ${F*.22}px) translateY(-2px)`}),s.addEventListener("mouseleave",()=>{s.style.transform=""})})}function p(){const s=document.querySelector(".feats-grid");if(!s)return;const u=Array.from(s.querySelectorAll(".feat"));s.addEventListener("mousemove",l=>{const y=s.getBoundingClientRect();s.style.setProperty("--gx",`${l.clientX-y.left}px`),s.style.setProperty("--gy",`${l.clientY-y.top}px`),u.forEach(F=>{const i=F.getBoundingClientRect();F.style.setProperty("--cx",`${l.clientX-i.left}px`),F.style.setProperty("--cy",`${l.clientY-i.top}px`)})},{passive:!0}),s.addEventListener("mouseleave",()=>{s.style.setProperty("--gx","-9999px"),s.style.setProperty("--gy","-9999px"),u.forEach(l=>{l.style.setProperty("--cx","-9999px"),l.style.setProperty("--cy","-9999px")})})}function o(){document.querySelectorAll(".window").forEach(s=>{const u=s.querySelector(".window-glow");u&&s.addEventListener("mousemove",l=>{const y=s.getBoundingClientRect();u.style.setProperty("--wx",`${l.clientX-y.left}px`),u.style.setProperty("--wy",`${l.clientY-y.top}px`)})})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{c(),a(),n(),p(),o()}):(c(),a(),n(),p(),o())});var S=component({__id:"dZPMS1u",atoms:{word:"",phase:0,idx:0,erasing:!1},onMount:async(r,{word:c,phase:a,idx:t,erasing:e})=>{const n=["readable.","auditable.","fast.","flexible."],p=()=>{const o=n[a.value],s=t.value;if(e.value)t.value=s-1,c.value=o.slice(0,s-1),s-1===0&&(e.value=!1,a.value=(a.value+1)%n.length);else if(t.value=s+1,c.value=o.slice(0,s+1),s+1===o.length){e.value=!0,setTimeout(p,2600);return}setTimeout(p,e.value?38:85)};setTimeout(p,800)},view:({atoms:{word:r}})=>__tags.section({class:"hero"},__tags.div({class:"hero-canvas","aria-hidden":"true"},__tags.div({class:"hero-grid"}),__tags.div({class:"hero-glow"})),__tags.div({style:"margin-top: 2rem;",class:"hero-content"},__tags.h1({class:"hero-title"},__tags.span({class:"hero-dim"},"Framework"),__tags.br({}),__tags.span({class:"hero-dim"},"built to"),__tags.br({}),__tags.em({class:"hero-serif"},"disappear.")),__tags.div({class:"hero-typerow"},__tags.span({class:"typerow-pre"},"Development stays "),__tags.span({class:"typerow-word"},r.value),__tags.span({class:"typerow-cursor"},"\u258C")),__tags.p({class:"hero-pitch"},"Create sites that are the target of envy.",__tags.br({}),"Fast, reactive, feature-rich and most importantly, safe.",__tags.br({}),"All with a runtime smaller than a ",__tags.b("JPEG.")),__tags.div({class:"hero-actions"},d({href:"#how",class:"btn btn--amber"},"How it works \u2192"),d({href:"/#examples",class:"btn btn--ghost"},__tags.svg({width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2.2","aria-hidden":"true"},__tags.polyline({points:"16 18 22 12 16 6"}),__tags.polyline({points:"8 6 2 12 8 18"})),"Examples")),__tags.div({class:"hero-stats"},__tags.div({class:"stat"},__tags.span({class:"stat-n"},"25.8x"),__tags.span({class:"stat-n stat-l"},"faster than Next.JS")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"5"),__tags.span({class:"stat-n stat-l"},"KB runtime")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"0"),__tags.span({class:"stat-n stat-l"},"browser deps")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"MIT"),__tags.span({class:"stat-n stat-l"},"license"))),__tags.p({class:"hero-fine"},"raw API route \xB7 identical payloads \xB7 oha, 50 connections*")))}),A=component({__id:"GzhtpDv",view:({self:r})=>{const{num:c,title:a,body:t,detail:e,color:n}=r.props;return __tags.div({class:"feat",style:`--fc: ${n}`},__tags.div({class:"feat-head"},__tags.span({class:"feat-n"},c),__tags.div({class:"feat-rule"})),__tags.h3({class:"feat-title"},a),__tags.p({class:"feat-body"},t),__tags.span({class:"feat-detail"},e))}}),T=component({__id:"2rY4KOi",atoms:{slide:0,bodyVisible:!1,headVisible:!1},onMount:(r,{bodyVisible:c,headVisible:a})=>{const t=document.querySelector(".how-section");if(!t)return;new IntersectionObserver(([n])=>{c.value=n.isIntersecting,a.value=n.isIntersecting},{threshold:.1,rootMargin:"0px 0px -56px 0px"}).observe(t)},onNavigate:(r,{bodyVisible:c,headVisible:a})=>{c.value=!1,a.value=!1},view:({self:r,atoms:{slide:c,bodyVisible:a,headVisible:t}})=>{const e=[{n:"01",label:"Routes",body:"Drop a directory into pages/ with a page.ts inside. That's a route! No config, no imports, no registration step. The filesystem is the router.",aside:"Layouts stack from layout.ts files walking up the directory tree, outermost-first. Each one can independently opt into server rendering. You never touch a router config."},{n:"02",label:"Components",body:"Write components with tag functions or JSX. Elegance compiles both the same way.",aside:"Props flow through the component<Props> generic. Atoms infer their type from the initial value, no config required."},{n:"03",label:"State",body:"Atoms live inside a component, or the page. When the value changes, only the components that read it re-render, nothing more.",aside:"DOM events use a single delegated listener per event type, so the listener count stays flat no matter how many components are mounted."}],n=e[c.value];return __tags.section({class:"how-section",id:"how"},__tags.div({class:"how-inner"},__tags.header({class:`section-head${t.value?" sr-in":""}`},__tags.h2({class:"section-title"},"Three ideas.",__tags.br({}),__tags.em({class:"serif-accent"},"One framework.")),__tags.p({class:"section-sub"},"The entire mental model. Here's all of it.")),__tags.div({class:`how-tabs${t.value?" sr-in":""}`},...e.map((p,o)=>__tags.button({class:`how-tab${c.value===o?" how-tab--on":""}`,onclick:()=>c.value=o},__tags.span({class:"tab-n"},p.n),__tags.span({class:"tab-label"},p.label)))),__tags.div({class:`how-body${a.value?" sr-in":""}`},__tags.div({class:"how-text"},__tags.p({class:"how-lead"},n.body),__tags.p({class:"how-aside"},n.aside)),__tags.div({class:"how-code"},__tags.div({class:"window"},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.span({class:"window-label"},`concept ${n.n} | ${n.label}`)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code",key:`how-code-${c.value}`},rawHTML(r.props.codeHtml[c.value]??""))))))))}}),P=component({__id:"Krs5Sly",atoms:{tab:0,windowVisible:!1,headVisible:!1},onMount:(r,{windowVisible:c,headVisible:a})=>{const t={threshold:.1,rootMargin:"0px 0px -56px 0px"},e=document.querySelector(".examples-section .window--wide");e&&new IntersectionObserver(([o])=>{c.value=o.isIntersecting},t).observe(e);const n=document.querySelector(".examples-section .section-head");n&&new IntersectionObserver(([o])=>{a.value=o.isIntersecting},t).observe(n)},onNavigate:(r,{windowVisible:c,headVisible:a})=>{c.value=!1,a.value=!1},view:({self:r,atoms:{tab:c,windowVisible:a,headVisible:t}})=>{const e=[{label:"Routing",path:"pages/blog/page.ts"},{label:"JSX / TSX",path:"pages/blog/page.tsx"},{label:"API Routes",path:"pages/api/posts/page.ts"},{label:"isDynamic",path:"pages/dashboard/page.ts"}],n=e[c.value];return __tags.section({class:"examples-section",id:"examples"},__tags.header({class:`section-head${t.value?" sr-in":""}`},__tags.h2({class:"section-title"},"Small surface.",__tags.br({}),__tags.em({class:"serif-accent"},"Real projects.")),__tags.p({class:"section-sub"},"Every concept above expressed as actual files you'd ship.")),__tags.div({class:`window window--wide${a.value?" sr-in":""}`},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.div({class:"tab-row"},...e.map((p,o)=>__tags.button({class:`file-tab${c.value===o?" file-tab--on":""}`,onclick:()=>c.value=o},p.label))),__tags.span({class:"window-path"},n.path)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code",key:`ex-code-${c.value}`},rawHTML(r.props.codeHtml[c.value]??"")))),__tags.div({class:"callouts"},__tags.div({class:"callout"},__tags.span({class:"callout-n"},"01"),__tags.div({},__tags.strong({class:"callout-title"},"Transparent preprocessing"),__tags.p({class:"callout-body"},"OXC rewrites tag calls and assigns atom IDs in one fast pass. Nothing changes about how you write TypeScript, the transformation is an implementation detail, not a mental model you carry around."))),__tags.div({class:"callout"},__tags.span({class:"callout-n"},"02"),__tags.div({},__tags.strong({class:"callout-title"},"Atom hydration, zero wiring"),__tags.p({class:"callout-body"},"Atom values are serialized to JSON during SSR and restored on the client automatically. No manual hydration calls, no mismatch warnings, no extra round-trip for state you already fetched."))),__tags.div({class:"callout"},__tags.span({class:"callout-n"},"03"),__tags.div({},__tags.strong({class:"callout-title"},"init server-side, onMount client-side"),__tags.p({class:"callout-body"},"init is awaited during SSR, the right place for data fetching. onMount fires after the DOM is live. onUnmount fires on teardown. The full lifecycle fits on an index card.")))))}}),k=component({__id:"bBcXqmo",atoms:{tab:0,sub:0,headVisible:!1,bodyVisible:!1},onMount:(r,{headVisible:c,bodyVisible:a})=>{const t={threshold:.1,rootMargin:"0px 0px -56px 0px"},e=document.querySelector(".best-section .section-head");if(e){const p=new IntersectionObserver(([o])=>{o.isIntersecting&&(c.value=!0,p.disconnect())},t);p.observe(e)}const n=document.querySelector(".best-section .best-body");if(n){const p=new IntersectionObserver(([o])=>{o.isIntersecting&&(a.value=!0,p.disconnect())},t);p.observe(n)}},view:({self:r,atoms:{tab:c,sub:a,headVisible:t,bodyVisible:e}})=>{const n=_[c.value],p=n.snippets[a.value]??n.snippets[0];return __tags.section({class:"best-section",id:"best"},__tags.header({class:`section-head${t.value?" sr-in":""}`},__tags.h2({class:"section-title"},"The best of",__tags.br({}),__tags.em({class:"serif-accent"},"every framework.")),__tags.p({class:"section-sub"},"Routing, state, server code, rendering, images \u2014 the ideas behind React, Solid, Astro and SvelteKit, as they work in Elegance.")),__tags.div({class:`best-body${e.value?" sr-in":""}`},__tags.div({class:"best-win"},__tags.div({class:"window best-window",style:`--fc: ${n.color}`},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.span({class:"window-label"},n.title),...n.snippets.length>1?[__tags.div({class:"tab-row best-tabs"},...n.snippets.map((o,s)=>__tags.button({class:`file-tab${a.value===s?" file-tab--on":""}`,onclick:()=>a.value=s},o.label)))]:[],__tags.span({class:"window-path"},p.path)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code best-code-anim",key:`best-code-${c.value}-${a.value}`},rawHTML(r.props.codeHtml[c.value]?.[a.value]??""))))),__tags.div({class:"best-list"},..._.map((o,s)=>__tags.button({class:`best-item${c.value===s?" best-item--on":""}`,style:`--fc: ${o.color}`,onclick:()=>{c.value=s,a.value=0}},__tags.span({class:"best-item-n"},String(s+1).padStart(2,"0")),__tags.div({class:"best-item-main"},__tags.div({class:"best-item-head"},__tags.span({class:"best-item-title"},o.title),__tags.span({class:"best-item-from"},o.from)),__tags.p({class:"best-item-desc"},o.desc)))))))}});export default function R(){const r=x(),c=[[E({}),S({}),k({codeHtml:[[`pages/
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
feature 07 covers them.`,`<span><span style="color:#8B8B8B94;">// A page exports a default function that returns</span>
<span style="color:#8B8B8B94;">// elements. The framework calls it during SSR and</span>
<span style="color:#8B8B8B94;">// serializes the result to HTML.</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">BlogIndex</span><span style="color:#FFF;">() {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">section</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;blog&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">h1</span><span style="color:#FFF;">({}, </span><span style="color:#99FFE4;">&quot;The Blog&quot;</span><span style="color:#FFF;">),</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">ul</span><span style="color:#FFF;">({},</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">...</span><span style="color:#FFF;">posts.</span><span style="color:#FFC799;">map</span><span style="color:#FFF;">(p </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">        </span><span style="color:#FFC799;">li</span><span style="color:#FFF;">({},</span>
<span style="color:#FFF;">          </span><span style="color:#FFC799;">Link</span><span style="color:#FFF;">({ href: </span><span style="color:#99FFE4;">\`/blog/\${</span><span style="color:#FFF;">p</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">slug</span><span style="color:#99FFE4;">}\`</span><span style="color:#FFF;"> }, p.title)</span>
<span style="color:#FFF;">        )</span>
<span style="color:#FFF;">      )</span>
<span style="color:#FFF;">    )</span>
<span style="color:#FFF;">  );</span>
<span style="color:#FFF;">}</span></span>`],[`<span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> Cart </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">  atoms: {</span>
<span style="color:#FFF;">    items: [] </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Item</span><span style="color:#FFF;">[],</span>
<span style="color:#FFF;">    coupon: null </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">|</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">null</span><span style="color:#FFF;">,</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (self, { items, coupon }) </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">    </span><span style="color:#8B8B8B94;">// Reading an atom inside view() subscribes this</span>
<span style="color:#FFF;">    </span><span style="color:#8B8B8B94;">// component to it. Writing items.value re-renders</span>
<span style="color:#FFF;">    </span><span style="color:#8B8B8B94;">// this component; the rest of the page keeps its</span>
<span style="color:#FFF;">    </span><span style="color:#8B8B8B94;">// DOM.</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;cart&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">span</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;count&quot;</span><span style="color:#FFF;"> }, </span><span style="color:#99FFE4;">\`\${</span><span style="color:#FFF;">items</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">value</span><span style="color:#99FFE4;">.length</span><span style="color:#99FFE4;">} items\`</span><span style="color:#FFF;">),</span>
<span style="color:#FFF;">      coupon.value</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">span</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;save&quot;</span><span style="color:#FFF;"> }, </span><span style="color:#99FFE4;">\`-\${</span><span style="color:#FFF;">coupon</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">value</span><span style="color:#99FFE4;">}%\`</span><span style="color:#FFF;">)</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> null,</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">button</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">        </span><span style="color:#FFC799;">onclick</span><span style="color:#FFF;">: () </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> items.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> [</span><span style="color:#A0A0A0;">...</span><span style="color:#FFF;">items.value, NEW_ITEM]</span>
<span style="color:#FFF;">      }, </span><span style="color:#99FFE4;">&quot;Add to cart&quot;</span><span style="color:#FFF;">)</span>
<span style="color:#FFF;">    )</span>
<span style="color:#FFF;">});</span></span>`,`<span><span style="color:#8B8B8B94;">// React: useState per component. Sharing state</span>
<span style="color:#8B8B8B94;">// between components means lifting it into a</span>
<span style="color:#8B8B8B94;">// parent or context, and an update re-renders the</span>
<span style="color:#8B8B8B94;">// owning subtree and reconciles the old vdom.</span>

<span style="color:#8B8B8B94;">// Solid: signals are fine-grained, with an</span>
<span style="color:#8B8B8B94;">// accessor API and compiler directives.</span>

<span style="color:#8B8B8B94;">// Elegance: an atom is a value with a .value. The</span>
<span style="color:#8B8B8B94;">// subscription is created by view() reading it,</span>
<span style="color:#8B8B8B94;">// so the component code contains nothing else.</span></span>`],[`<span><span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> { db } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;~/lib/db&quot;</span><span style="color:#FFF;">;  </span><span style="color:#8B8B8B94;">// a regular npm package</span>

<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> Posts </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">  atoms: { posts: [] </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Post</span><span style="color:#FFF;">[] },</span>

<span style="color:#FFF;">  </span><span style="color:#8B8B8B94;">// init() runs during SSR, before the HTML is sent.</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">init</span><span style="color:#FFF;">: </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> (_, { posts }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    posts.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.posts.</span><span style="color:#FFC799;">findAll</span><span style="color:#FFF;">();</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (_, { posts }) </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">ul</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;post-list&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">...</span><span style="color:#FFF;">posts.value.</span><span style="color:#FFC799;">map</span><span style="color:#FFF;">(p </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">li</span><span style="color:#FFF;">({}, p.title))</span>
<span style="color:#FFF;">    )</span>
<span style="color:#FFF;">});</span>

<span style="color:#8B8B8B94;">// view() is compiled into the browser bundle; init()</span>
<span style="color:#8B8B8B94;">// is not. If db could be reached from client code,</span>
<span style="color:#8B8B8B94;">// the build fails and names the import.</span></span>`,`<span><span style="color:#8B8B8B94;">//!no-bundle-file</span>
<span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> { Pool } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;pg&quot;</span><span style="color:#FFF;">;</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> db </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">new</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Pool</span><span style="color:#FFF;">({ connectionString: process.env.DATABASE_URL });</span>

<span style="color:#8B8B8B94;">// The directive above marks this file server-only.</span>
<span style="color:#8B8B8B94;">// If any client-reachable code imports it, the</span>
<span style="color:#8B8B8B94;">// build fails with the import path.</span>

<span style="color:#8B8B8B94;">// Related directives:</span>
<span style="color:#8B8B8B94;">//   //!no-bundle        server-only declaration</span>
<span style="color:#8B8B8B94;">//   //!allow-bundling   exempt a specific import</span>
<span style="color:#8B8B8B94;">//   //!force-bundling   keep a side-effect import</span></span>`],[`<span><span style="color:#8B8B8B94;">// Rendered once at build time to</span>
<span style="color:#8B8B8B94;">// dist/pricing/index.html. At runtime the server</span>
<span style="color:#8B8B8B94;">// returns the file.</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Pricing</span><span style="color:#FFF;">() {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">section</span><span style="color:#FFF;">({},</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">h1</span><span style="color:#FFF;">({}, </span><span style="color:#99FFE4;">&quot;Pricing&quot;</span><span style="color:#FFF;">),</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">Plan</span><span style="color:#FFF;">({ name: </span><span style="color:#99FFE4;">&quot;Free&quot;</span><span style="color:#FFF;">, price: </span><span style="color:#FFC799;">0</span><span style="color:#FFF;"> }),</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">Plan</span><span style="color:#FFF;">({ name: </span><span style="color:#99FFE4;">&quot;Pro&quot;</span><span style="color:#FFF;">, price: </span><span style="color:#FFC799;">20</span><span style="color:#FFF;"> }),</span>
<span style="color:#FFF;">  );</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// This page needs the request (session, headers,</span>
<span style="color:#8B8B8B94;">// query)? One export renders it per request:</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> isDynamic </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">true</span><span style="color:#FFF;">;</span></span>`,`dist/
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
the same pages/ tree.`],[`<span><span style="color:#8B8B8B94;">// pages/admin/layout.ts</span>
<span style="color:#8B8B8B94;">// Wraps every route under /admin. child() renders</span>
<span style="color:#8B8B8B94;">// the next layout down, or the page.</span>
<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> isDynamic </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">true</span><span style="color:#FFF;">;  </span><span style="color:#8B8B8B94;">// whole subtree renders per request</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">AdminLayout</span><span style="color:#FFF;">({ child }) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;admin&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">AdminSidebar</span><span style="color:#FFF;">({}),</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">Main</span><span style="color:#FFF;">({},</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">SessionBanner</span><span style="color:#FFF;">({}),   </span><span style="color:#8B8B8B94;">// reads request cookies</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">child</span><span style="color:#FFF;">()</span>
<span style="color:#FFF;">    )</span>
<span style="color:#FFF;">  );</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// pages/admin/users/page.ts renders inside this</span>
<span style="color:#8B8B8B94;">// layout. isDynamic on a layout applies to its</span>
<span style="color:#8B8B8B94;">// whole subtree, so the page itself stays</span>
<span style="color:#8B8B8B94;">// unchanged.</span></span>`,`pages/
\u251C\u2500\u2500 layout.ts            \u2460 wraps everything
\u2514\u2500\u2500 admin/
    \u251C\u2500\u2500 layout.ts        \u2461 dynamic, guards /admin/*
    \u2514\u2500\u2500 users/
        \u2514\u2500\u2500 page.ts      \u2462 the page

Render order: \u2460 \u2192 \u2461 \u2192 \u2462, outer to inner.

Next.js stacks layouts the same way. Here every
layout declares isDynamic separately, so marking
\u2461 dynamic puts /admin/* on SSR while routes
outside pages/admin/ remain static files.`],[`<span><span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> { db } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;~/lib/db&quot;</span><span style="color:#FFF;">;</span>

<span style="color:#8B8B8B94;">// GET /api/subscribe?id=42</span>
<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">GET</span><span style="color:#FFF;">(req, res) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> id </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">new</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">URL</span><span style="color:#FFF;">(req.url, </span><span style="color:#99FFE4;">&quot;http://x&quot;</span><span style="color:#FFF;">).searchParams.</span><span style="color:#FFC799;">get</span><span style="color:#FFF;">(</span><span style="color:#99FFE4;">&quot;id&quot;</span><span style="color:#FFF;">);</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> sub </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.subs.</span><span style="color:#FFC799;">findById</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">Number</span><span style="color:#FFF;">(id));</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">if</span><span style="color:#FFF;"> (</span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">sub) { res.</span><span style="color:#FFC799;">writeHead</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">404</span><span style="color:#FFF;">); </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> res.</span><span style="color:#FFC799;">end</span><span style="color:#FFF;">(</span><span style="color:#99FFE4;">&quot;{}&quot;</span><span style="color:#FFF;">); }</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">writeHead</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">200</span><span style="color:#FFF;">, { </span><span style="color:#99FFE4;">&quot;Content-Type&quot;</span><span style="color:#FFF;">: </span><span style="color:#99FFE4;">&quot;application/json&quot;</span><span style="color:#FFF;"> });</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">end</span><span style="color:#FFF;">(JSON.</span><span style="color:#FFC799;">stringify</span><span style="color:#FFF;">(sub));</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// POST /api/subscribe</span>
<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">POST</span><span style="color:#FFF;">(req, res) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">let</span><span style="color:#FFF;"> body </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;&quot;</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">for</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> (</span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> chunk </span><span style="color:#A0A0A0;">of</span><span style="color:#FFF;"> req) body </span><span style="color:#A0A0A0;">+=</span><span style="color:#FFF;"> chunk;</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> sub </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.subs.</span><span style="color:#FFC799;">create</span><span style="color:#FFF;">(JSON.</span><span style="color:#FFC799;">parse</span><span style="color:#FFF;">(body));</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">writeHead</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">201</span><span style="color:#FFF;">);</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">end</span><span style="color:#FFF;">(JSON.</span><span style="color:#FFC799;">stringify</span><span style="color:#FFF;">(sub));</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// req is Node's IncomingMessage and res is</span>
<span style="color:#8B8B8B94;">// ServerResponse \u2014 the same objects an</span>
<span style="color:#8B8B8B94;">// http.createServer handler receives.</span></span>`,` curl -X POST localhost:3000/api/subscribe \\
      -d '{&quot;email&quot;:&quot;hi@example.com&quot;}'
 \u2192  201 Created  {&quot;id&quot;:42,&quot;email&quot;:&quot;hi@example.com&quot;}

The file pages/api/subscribe/page.ts is the
endpoint /api/subscribe, routed by the same
filesystem rule as every other page, so the API
and the UI live in one tree.

GET, POST, PUT, DELETE and PATCH are the
supported method exports.`],[`<span><span style="color:#8B8B8B94;">// The folder [slug] matches one path segment, and</span>
<span style="color:#8B8B8B94;">// its value arrives as a prop:</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Post</span><span style="color:#FFF;">({ slug }</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> { slug</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;"> }) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> post </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.posts.</span><span style="color:#FFC799;">findBySlug</span><span style="color:#FFF;">(slug);</span>

<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">article</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;post&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">h1</span><span style="color:#FFF;">({}, post.title),</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">rawHTML</span><span style="color:#FFF;">(post.body)</span>
<span style="color:#FFF;">  );</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// GET /blog/hello-world calls this with</span>
<span style="color:#8B8B8B94;">// slug === &quot;hello-world&quot;. [...rest] folders work</span>
<span style="color:#8B8B8B94;">// the same way and capture the remaining segments.</span></span>`,`<span><span style="color:#8B8B8B94;">// If the set of valid slugs is known at build</span>
<span style="color:#8B8B8B94;">// time, this export renders one HTML file per</span>
<span style="color:#8B8B8B94;">// value:</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">getEnumeratedRoutes</span><span style="color:#FFF;">()</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Promise</span><span style="color:#FFF;">&lt;</span><span style="color:#FFC799;">string</span><span style="color:#FFF;">[]&gt; {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> posts </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.posts.</span><span style="color:#FFC799;">findAll</span><span style="color:#FFF;">();</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> posts.</span><span style="color:#FFC799;">map</span><span style="color:#FFF;">(p </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> p.slug);</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// build output:</span>
<span style="color:#8B8B8B94;">//   dist/blog/hello-world/index.html</span>
<span style="color:#8B8B8B94;">//   dist/blog/second-post/index.html</span>

<span style="color:#8B8B8B94;">// Requests then hit those files. Pages that don't</span>
<span style="color:#8B8B8B94;">// export getEnumeratedRoutes render per request.</span></span>`],[`<span><span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> { verifySession } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;~/lib/auth&quot;</span><span style="color:#FFF;">;</span>

<span style="color:#8B8B8B94;">// Runs before each /admin/* route renders.</span>
<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">auth</span><span style="color:#FFF;">(req, res, next) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> session </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">verifySession</span><span style="color:#FFF;">(req.headers.cookie);</span>

<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">if</span><span style="color:#FFF;"> (</span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">session) {</span>
<span style="color:#FFF;">    </span><span style="color:#8B8B8B94;">// Returning without next() ends the request:</span>
<span style="color:#FFF;">    </span><span style="color:#8B8B8B94;">// the page component never runs.</span>
<span style="color:#FFF;">    res.</span><span style="color:#FFC799;">writeHead</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">302</span><span style="color:#FFF;">, { Location: </span><span style="color:#99FFE4;">&quot;/login&quot;</span><span style="color:#FFF;"> });</span>
<span style="color:#FFF;">    res.</span><span style="color:#FFC799;">end</span><span style="color:#FFF;">();</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">  }</span>

<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">setHeader</span><span style="color:#FFF;">(</span><span style="color:#99FFE4;">&quot;x-user-id&quot;</span><span style="color:#FFF;">, session.userId);</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">next</span><span style="color:#FFF;">();</span>
<span style="color:#FFF;">}</span></span>`,`GET /admin/settings
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
from the outermost directory inward.`],[`<span><span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> { Image } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;elegance-js&quot;</span><span style="color:#FFF;">;</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Gallery</span><span style="color:#FFF;">() {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> (</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">Image</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">src=</span><span style="color:#99FFE4;">&quot;/photos/aurora.jpg&quot;</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">width={</span><span style="color:#FFC799;">1200</span><span style="color:#A0A0A0;">}</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">height={</span><span style="color:#FFC799;">800</span><span style="color:#A0A0A0;">}</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">sizes=</span><span style="color:#99FFE4;">&quot;(max-width: 900px) 100vw, 640px&quot;</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">priority</span><span style="color:#FFF;">                 </span><span style="color:#8B8B8B94;">// preload link for LCP images</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">alt=</span><span style="color:#99FFE4;">&quot;Northern lights over a lake&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">/&gt;</span>
<span style="color:#FFF;">  );</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// src, width, height, sizes and alt are the inputs.</span>
<span style="color:#8B8B8B94;">// The build generates the variant files, the srcset</span>
<span style="color:#8B8B8B94;">// attributes and the preload link from them.</span></span>`,`<span><span style="color:#8B8B8B94;">// A raw &lt;img&gt; ships one file:</span>

<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">img</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> (</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">img</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">src=</span><span style="color:#99FFE4;">&quot;/photos/aurora.jpg&quot;</span><span style="color:#FFF;">   </span><span style="color:#8B8B8B94;">// the full 2.4MB for every viewport</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">width={</span><span style="color:#FFC799;">1200</span><span style="color:#A0A0A0;">}</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">height={</span><span style="color:#FFC799;">800</span><span style="color:#A0A0A0;">}</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">/&gt;</span>
<span style="color:#FFF;">);</span>

<span style="color:#8B8B8B94;">// The browser gets no smaller variant for a 320px</span>
<span style="color:#8B8B8B94;">// phone, no WebP, and no preload hint, so the</span>
<span style="color:#8B8B8B94;">// largest image arrives last and layout shifts</span>
<span style="color:#8B8B8B94;">// until it does. Producing variants, srcset and</span>
<span style="color:#8B8B8B94;">// preload by hand is the work &lt;Image&gt; does at</span>
<span style="color:#8B8B8B94;">// build time.</span></span>`,`<span><span style="color:#8B8B8B94;">&lt;!-- dist output for the &lt;Image&gt; above --&gt;</span>
<span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">picture</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">source</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">type</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;image/webp&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">sizes</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;(max-width: 900px) 100vw, 640px&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">srcset</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;/images/aurora_320.webp 320w,</span>
<span style="color:#99FFE4;">            /images/aurora_640.webp 640w,</span>
<span style="color:#99FFE4;">            /images/aurora_1280.webp 1280w&quot;</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">img</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">src</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;/images/aurora_640.jpg&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">srcset</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;/images/aurora_320.jpg 320w,</span>
<span style="color:#99FFE4;">            /images/aurora_640.jpg 640w,</span>
<span style="color:#99FFE4;">            /images/aurora_1280.jpg 1280w&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">sizes</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;(max-width: 900px) 100vw, 640px&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">width</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;1200&quot;</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">height</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;800&quot;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">fetchpriority</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;high&quot;</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">loading</span><span style="color:#FFF;">=</span><span style="color:#99FFE4;">&quot;eager&quot;</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFC799;">picture</span><span style="color:#A0A0A0;">&gt;</span>

<span style="color:#8B8B8B94;">&lt;!-- The pipeline compresses each variant during</span>
<span style="color:#8B8B8B94;">     the build. They are served as static files</span>
<span style="color:#8B8B8B94;">     from /images/ \u2014 the running server never</span>
<span style="color:#8B8B8B94;">     touches an image. --&gt;</span></span>`],[`<span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> Card </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">&lt;{ title</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;">; done</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">boolean</span><span style="color:#FFF;"> }&gt;({</span>
<span style="color:#FFF;">  atoms: { open: </span><span style="color:#FFC799;">false</span><span style="color:#FFF;"> },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (self, { open }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> (</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">article</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">class=</span><span style="color:#99FFE4;">&quot;card&quot;</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">h2</span><span style="color:#A0A0A0;">&gt;{</span><span style="color:#FFF;">self.props.title</span><span style="color:#A0A0A0;">}&lt;/</span><span style="color:#FFC799;">h2</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">{</span><span style="color:#FFF;">open.value </span><span style="color:#A0A0A0;">&amp;&amp;</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">p</span><span style="color:#A0A0A0;">&gt;</span><span style="color:#FFF;">Details\u2026</span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFC799;">p</span><span style="color:#A0A0A0;">&gt;}</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">button</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">onclick={</span><span style="color:#FFF;">() </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> open.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">open.value</span><span style="color:#A0A0A0;">}&gt;</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">{</span><span style="color:#FFF;">open.value </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;Close \u2191&quot;</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;Open \u2193&quot;</span><span style="color:#A0A0A0;">}</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFC799;">button</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFC799;">article</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">  )</span>
<span style="color:#FFF;">});</span>

<span style="color:#8B8B8B94;">// Atoms hold the state instead of useState, and</span>
<span style="color:#8B8B8B94;">// reading open.value inside view() subscribes the</span>
<span style="color:#8B8B8B94;">// component to it (feature 02).</span></span>`,`<span><span style="color:#8B8B8B94;">// The same component with element calls:</span>

<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> Card </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">&lt;{ title</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;">; done</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">boolean</span><span style="color:#FFF;"> }&gt;({</span>
<span style="color:#FFF;">  atoms: { open: </span><span style="color:#FFC799;">false</span><span style="color:#FFF;"> },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (self, { open }) </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">    </span><span style="color:#FFC799;">article</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;card&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">h2</span><span style="color:#FFF;">({}, self.props.title),</span>
<span style="color:#FFF;">      open.value </span><span style="color:#A0A0A0;">&amp;&amp;</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">p</span><span style="color:#FFF;">({}, </span><span style="color:#99FFE4;">&quot;Details\u2026&quot;</span><span style="color:#FFF;">),</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">button</span><span style="color:#FFF;">(</span>
<span style="color:#FFF;">        { </span><span style="color:#FFC799;">onclick</span><span style="color:#FFF;">: () </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> open.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">open.value },</span>
<span style="color:#FFF;">        open.value </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;Close \u2191&quot;</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;Open \u2193&quot;</span>
<span style="color:#FFF;">      )</span>
<span style="color:#FFF;">    )</span>
<span style="color:#FFF;">});</span>

<span style="color:#8B8B8B94;">// Both files compile to the same nodes with the</span>
<span style="color:#8B8B8B94;">// same prop and atom types. A .tsx page can</span>
<span style="color:#8B8B8B94;">// import a component from a .ts file and the</span>
<span style="color:#8B8B8B94;">// other way around.</span></span>`]]})],[A({num:"01",title:"FS Routing",body:"Your page folder IS your router. A directory with a page.ts inside is a route, full stop. Just export a default function that resolves into some element calls.",detail:"/[slug] \xB7 /[...rest] \xB7 layouts \xB7 API routes",color:"var(--amber)"}),A({num:"02",title:"Atoms",body:"State lives in atoms. Read one inside view() and just that component re-renders when the atom changes. Just a value with a .value.",detail:"Fine-grained \xB7 no vdom \xB7 auto-batched",color:"var(--lilac)"}),A({num:"03",title:"Write Server Code Anywhere",body:"Our state-of-the-art compiler let's you write server-side code worry-free in the same file as your client-facing code. Import Chart in the same place you make your DB calls, with no worries.",detail:"SSR by default \xB7 !no-bundle \xB7 dead code elimination",color:"var(--green)"}),A({num:"04",title:"Static or live, per page",body:"Build output is static HTML by default. Fast, cacheable and free to host anywhere. One export flips a page to build per-request. Mix them freely across the same project; your blog can be static while your dashboard is live.",detail:"export const isDynamic = true",color:"var(--blue)"}),A({num:"05",title:"Atom hydration",body:"Whatever state your server computed gets serialized into the page and restored on the client automatically. No need to re-fetch data you already have.",detail:"SSR state \u2192 client \xB7 zero wiring",color:"var(--orange)"}),A({num:"06",title:"Nested layouts",body:"Drop a layout.ts into any directory and it wraps every route beneath it. Layouts, just like pages, can be dynamic or static; you can even mix and match. They render outer to inner.",detail:"Nested \xB7 independent \xB7 per-layout isDynamic",color:"var(--pink)"}),A({num:"07",title:"API routes",body:"Export GET, POST, PUT, DELETE, or PATCH from any route.ts and that route handles the request as a plain HTTP handler.",detail:"GET \xB7 POST \xB7 PUT \xB7 DELETE \xB7 PATCH",color:"var(--amber)"}),A({num:"08",title:"Slug routes",body:"Name a directory [id] and the segment becomes a typed parameter. [...rest] catches everything that follows. Slug values are available as props inside the page constructor in that route.",detail:"/posts/[slug] \xB7 /files/[...path]",color:"var(--lilac)"}),A({num:"09",title:"Middleware",body:"Run code before any route resolves. Auth checks, redirects, request rewriting, header injection. Middleware composes cleanly and can short-circuit the response without touching the page at all.",detail:"Auth \xB7 redirects \xB7 headers \xB7 rewriting",color:"var(--green)"})],[T({codeHtml:[`pages/
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
    \u2514\u2500\u2500 page.ts        \u2192  /api/users  (HTTP handlers)`,`<span><span style="color:#8B8B8B94;">// pages/card/page.ts  \u2014 tag-function style</span>
<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> UserCard </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">&lt;{ name</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;">; avatarUrl</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;"> }&gt;({</span>
<span style="color:#FFF;">  atoms: { expanded: </span><span style="color:#FFC799;">false</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">init</span><span style="color:#FFF;">: </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> (self, { expanded }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    expanded.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">getExpandPref</span><span style="color:#FFF;">(self.props.name);</span>
<span style="color:#FFF;">  },</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (self, { expanded }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> { name, avatarUrl } </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> self.props;</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">article</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">\`card \${</span><span style="color:#FFF;">expanded</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">value</span><span style="color:#99FFE4;"> </span><span style="color:#A0A0A0;">?</span><span style="color:#99FFE4;"> </span><span style="color:#99FFE4;">&quot;open&quot;</span><span style="color:#99FFE4;"> </span><span style="color:#A0A0A0;">:</span><span style="color:#99FFE4;"> </span><span style="color:#99FFE4;">&quot;&quot;}\`</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">img</span><span style="color:#FFF;">({ src: avatarUrl, alt: name }),</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">h2</span><span style="color:#FFF;">({}, name),</span>
<span style="color:#FFF;">      expanded.value </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">section</span><span style="color:#FFF;">({}, </span><span style="color:#99FFE4;">&quot;Full profile...&quot;</span><span style="color:#FFF;">) </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> null,</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">button</span><span style="color:#FFF;">({ </span><span style="color:#FFC799;">onclick</span><span style="color:#FFF;">: () </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> expanded.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">expanded.value },</span>
<span style="color:#FFF;">        expanded.value </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;Collapse \u2191&quot;</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;Expand \u2193&quot;</span><span style="color:#FFF;">)</span>
<span style="color:#FFF;">    );</span>
<span style="color:#FFF;">  }</span>
<span style="color:#FFF;">});</span>

<span style="color:#8B8B8B94;">// pages/card/page.tsx  \u2014 JSX style, identical output</span>
<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> UserCard </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">&lt;{ name</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;">; avatarUrl</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">string</span><span style="color:#FFF;"> }&gt;({</span>
<span style="color:#FFF;">  atoms: { expanded: </span><span style="color:#FFC799;">false</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">init</span><span style="color:#FFF;">: </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> (self, { expanded }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    expanded.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">getExpandPref</span><span style="color:#FFF;">(self.props.name);</span>
<span style="color:#FFF;">  },</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (self, { expanded }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> { name, avatarUrl } </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> self.props;</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> (</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFF;">article class</span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;">{</span><span style="color:#99FFE4;">\`card \${</span><span style="color:#FFF;">expanded</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">value</span><span style="color:#99FFE4;"> </span><span style="color:#A0A0A0;">?</span><span style="color:#99FFE4;"> </span><span style="color:#99FFE4;">&quot;open&quot;</span><span style="color:#99FFE4;"> </span><span style="color:#A0A0A0;">:</span><span style="color:#99FFE4;"> </span><span style="color:#99FFE4;">&quot;&quot;}\`</span><span style="color:#FFF;">}</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFF;">img src</span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;">{avatarUrl} alt</span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;">{name} </span><span style="color:#A0A0A0;">/&gt;</span>
<span style="color:#FFF;">        &lt;</span><span style="color:#FFC799;">h2</span><span style="color:#FFF;">&gt;{name}</span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFF;">h2</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">        {expanded.value &amp;&amp; &lt;section&gt;Full profile...&lt;/section&gt;}</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFF;">button onclick</span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;">{() =&gt; expanded.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">expanded.value}</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">          {expanded.value ? </span><span style="color:#99FFE4;">&quot;Collapse \u2191&quot;</span><span style="color:#FFF;"> : </span><span style="color:#99FFE4;">&quot;Expand \u2193&quot;</span><span style="color:#FFF;">}</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFF;">button</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFF;">article</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">    );</span>
<span style="color:#FFF;">  }</span>
<span style="color:#FFF;">});</span></span>`,`<span><span style="color:#8B8B8B94;">// const globalAtom = state(&quot;Hello, Sailor!&quot;);</span>
<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> Search </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">  atoms: {</span>
<span style="color:#FFF;">    query: </span><span style="color:#99FFE4;">&quot;&quot;</span><span style="color:#FFF;">,</span>
<span style="color:#FFF;">    results: [] </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Result</span><span style="color:#FFF;">[],</span>
<span style="color:#FFF;">    loading: </span><span style="color:#FFC799;">false</span><span style="color:#FFF;">,</span>
<span style="color:#FFF;">    timer: null </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">ReturnType</span><span style="color:#FFF;">&lt;</span><span style="color:#A0A0A0;">typeof</span><span style="color:#FFF;"> setTimeout&gt; </span><span style="color:#A0A0A0;">|</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">null</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (_, { query, results, loading, timer }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">handleInput</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> (e</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">InputEvent</span><span style="color:#FFF;">) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">      query.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> (e.target </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">HTMLInputElement</span><span style="color:#FFF;">).value;</span>
<span style="color:#FFF;">      loading.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">true</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">clearTimeout</span><span style="color:#FFF;">(timer.value</span><span style="color:#A0A0A0;">!</span><span style="color:#FFF;">);</span>
<span style="color:#FFF;">      timer.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">setTimeout</span><span style="color:#FFF;">(</span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> () </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">        results.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">search</span><span style="color:#FFF;">(query.value);</span>
<span style="color:#FFF;">        loading.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">false</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">      }, </span><span style="color:#FFC799;">280</span><span style="color:#FFF;">);</span>
<span style="color:#FFF;">    };</span>

<span style="color:#FFF;">    </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;search&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">      </span><span style="color:#FFC799;">input</span><span style="color:#FFF;">({ oninput: handleInput, value: query.value, placeholder: </span><span style="color:#99FFE4;">&quot;Search\u2026&quot;</span><span style="color:#FFF;"> }),</span>
<span style="color:#FFF;">      loading.value</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;spinner&quot;</span><span style="color:#FFF;"> })</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">ul</span><span style="color:#FFF;">({}, </span><span style="color:#A0A0A0;">...</span><span style="color:#FFF;">results.value.</span><span style="color:#FFC799;">map</span><span style="color:#FFF;">(r </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">li</span><span style="color:#FFF;">({}, r.title)))</span>
<span style="color:#FFF;">    );</span>
<span style="color:#FFF;">  }</span>
<span style="color:#FFF;">});</span></span>`]})],[d({href:"/speed",class:"speed-full-link"},"Full methodology & raw results",{__type:"element",tag:"span",options:{class:"speed-arrow"},children:[" \u2192"]})],[P({codeHtml:[`<span><span style="color:#8B8B8B94;">// pages/blog/page.ts</span>
<span style="color:#8B8B8B94;">// The directory name is the route. No config, no registration.</span>

<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> PostList </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">  atoms: {</span>
<span style="color:#FFF;">    posts: [] </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Post</span><span style="color:#FFF;">[],</span>
<span style="color:#FFF;">    loading: </span><span style="color:#FFC799;">true</span><span style="color:#FFF;">,</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#8B8B8B94;">// init runs on the server, ideal for data that should be</span>
<span style="color:#FFF;">  </span><span style="color:#8B8B8B94;">// present before the first byte of HTML is sent</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">init</span><span style="color:#FFF;">: </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> (_, { posts, loading }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    posts.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.</span><span style="color:#FFC799;">query</span><span style="color:#FFF;">(</span>
<span style="color:#FFF;">      </span><span style="color:#99FFE4;">&quot;SELECT * FROM posts ORDER BY created_at DESC&quot;</span>
<span style="color:#FFF;">    );</span>
<span style="color:#FFF;">    loading.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">false</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (_, { posts, loading }) </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">    loading.value</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;skeleton&quot;</span><span style="color:#FFF;"> })</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">ul</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;post-list&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">          </span><span style="color:#A0A0A0;">...</span><span style="color:#FFF;">posts.value.</span><span style="color:#FFC799;">map</span><span style="color:#FFF;">(post </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">            </span><span style="color:#FFC799;">li</span><span style="color:#FFF;">({},</span>
<span style="color:#FFF;">              </span><span style="color:#FFC799;">Link</span><span style="color:#FFF;">({ href: </span><span style="color:#99FFE4;">\`/blog/\${</span><span style="color:#FFF;">post</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">slug</span><span style="color:#99FFE4;">}\`</span><span style="color:#FFF;"> }, post.title),</span>
<span style="color:#FFF;">              </span><span style="color:#FFC799;">time</span><span style="color:#FFF;">({ datetime: post.date }, </span><span style="color:#FFC799;">formatDate</span><span style="color:#FFF;">(post.date))</span>
<span style="color:#FFF;">            )</span>
<span style="color:#FFF;">          )</span>
<span style="color:#FFF;">        )</span>
<span style="color:#FFF;">});</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">BlogIndex</span><span style="color:#FFF;">() {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">PostList</span><span style="color:#FFF;">();</span>
<span style="color:#FFF;">}</span></span>`,`<span><span style="color:#8B8B8B94;">// pages/blog/page.tsx</span>
<span style="color:#8B8B8B94;">// Prefer JSX? Drop a .tsx file in the same spot. Same atoms, same routing.</span>

<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> PostList </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">  atoms: {</span>
<span style="color:#FFF;">    posts: [] </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Post</span><span style="color:#FFF;">[],</span>
<span style="color:#FFF;">    loading: </span><span style="color:#FFC799;">true</span><span style="color:#FFF;">,</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">init</span><span style="color:#FFF;">: </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> (_, { posts, loading }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    posts.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.</span><span style="color:#FFC799;">query</span><span style="color:#FFF;">(</span>
<span style="color:#FFF;">      </span><span style="color:#99FFE4;">&quot;SELECT * FROM posts ORDER BY created_at DESC&quot;</span>
<span style="color:#FFF;">    );</span>
<span style="color:#FFF;">    loading.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">false</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (_, { posts, loading }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> (</span>
<span style="color:#FFF;">    loading.value</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">div</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">class=</span><span style="color:#99FFE4;">&quot;skeleton&quot;</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">/&gt;</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">ul</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">class=</span><span style="color:#99FFE4;">&quot;post-list&quot;</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">          </span><span style="color:#A0A0A0;">{</span><span style="color:#FFF;">posts.value.</span><span style="color:#FFC799;">map</span><span style="color:#FFF;">(post </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> (</span>
<span style="color:#FFF;">            </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">li</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">              </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">a</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">href={</span><span style="color:#99FFE4;">\`/blog/\${</span><span style="color:#FFF;">post</span><span style="color:#99FFE4;">.</span><span style="color:#FFF;">slug</span><span style="color:#99FFE4;">}\`</span><span style="color:#A0A0A0;">}&gt;{</span><span style="color:#FFF;">post.title</span><span style="color:#A0A0A0;">}&lt;/</span><span style="color:#FFC799;">a</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">              </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">time</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">datetime={</span><span style="color:#FFF;">post.date</span><span style="color:#A0A0A0;">}&gt;{</span><span style="color:#FFC799;">formatDate</span><span style="color:#FFF;">(post.date)</span><span style="color:#A0A0A0;">}&lt;/</span><span style="color:#FFC799;">time</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">            </span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFC799;">li</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">          ))</span><span style="color:#A0A0A0;">}</span>
<span style="color:#FFF;">        </span><span style="color:#A0A0A0;">&lt;/</span><span style="color:#FFC799;">ul</span><span style="color:#A0A0A0;">&gt;</span>
<span style="color:#FFF;">  )</span>
<span style="color:#FFF;">});</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">BlogIndex</span><span style="color:#FFF;">() {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">&lt;</span><span style="color:#FFC799;">PostList</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">/&gt;</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// .ts and .tsx files can import each other freely.</span>
<span style="color:#8B8B8B94;">// The preprocessor handles both; no tsconfig changes needed.</span></span>`,`<span><span style="color:#8B8B8B94;">// pages/api/posts/page.ts</span>
<span style="color:#8B8B8B94;">// Named exports for HTTP methods turn any page file into a handler.</span>
<span style="color:#8B8B8B94;">// Works alongside a default export.</span>

<span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">type</span><span style="color:#FFF;"> { IncomingMessage, ServerResponse } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;node:http&quot;</span><span style="color:#FFF;">;</span>
<span style="color:#A0A0A0;">import</span><span style="color:#FFF;"> { db } </span><span style="color:#A0A0A0;">from</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;~/lib/db&quot;</span><span style="color:#FFF;">;</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">GET</span><span style="color:#FFF;">(req</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">IncomingMessage</span><span style="color:#FFF;">, res</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">ServerResponse</span><span style="color:#FFF;">) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> posts </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.posts.</span><span style="color:#FFC799;">findMany</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">    where: { published: </span><span style="color:#FFC799;">true</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">    orderBy: { createdAt: </span><span style="color:#99FFE4;">&quot;desc&quot;</span><span style="color:#FFF;"> },</span>
<span style="color:#FFF;">    take: </span><span style="color:#FFC799;">20</span><span style="color:#FFF;">,</span>
<span style="color:#FFF;">  });</span>

<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">writeHead</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">200</span><span style="color:#FFF;">, { </span><span style="color:#99FFE4;">&quot;Content-Type&quot;</span><span style="color:#FFF;">: </span><span style="color:#99FFE4;">&quot;application/json&quot;</span><span style="color:#FFF;"> });</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">end</span><span style="color:#FFF;">(JSON.</span><span style="color:#FFC799;">stringify</span><span style="color:#FFF;">(posts));</span>
<span style="color:#FFF;">}</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">POST</span><span style="color:#FFF;">(req</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">IncomingMessage</span><span style="color:#FFF;">, res</span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">ServerResponse</span><span style="color:#FFF;">) {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">let</span><span style="color:#FFF;"> body </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#99FFE4;">&quot;&quot;</span><span style="color:#FFF;">;</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">for</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> (</span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> chunk </span><span style="color:#A0A0A0;">of</span><span style="color:#FFF;"> req) body </span><span style="color:#A0A0A0;">+=</span><span style="color:#FFF;"> chunk;</span>

<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> post </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> db.posts.</span><span style="color:#FFC799;">create</span><span style="color:#FFF;">({ data: JSON.</span><span style="color:#FFC799;">parse</span><span style="color:#FFF;">(body) });</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">writeHead</span><span style="color:#FFF;">(</span><span style="color:#FFC799;">201</span><span style="color:#FFF;">, { </span><span style="color:#99FFE4;">&quot;Content-Type&quot;</span><span style="color:#FFF;">: </span><span style="color:#99FFE4;">&quot;application/json&quot;</span><span style="color:#FFF;"> });</span>
<span style="color:#FFF;">  res.</span><span style="color:#FFC799;">end</span><span style="color:#FFF;">(JSON.</span><span style="color:#FFC799;">stringify</span><span style="color:#FFF;">(post));</span>
<span style="color:#FFF;">}</span>

<span style="color:#8B8B8B94;">// GET, POST, PUT, DELETE, PATCH are all supported</span></span>`,`<span><span style="color:#8B8B8B94;">// pages/dashboard/page.ts</span>
<span style="color:#8B8B8B94;">// Pages are static by default. Pre-rendered once at build time.</span>
<span style="color:#8B8B8B94;">// One export is all it takes to switch to SSR per-request.</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> isDynamic </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">true</span><span style="color:#FFF;">;</span>

<span style="color:#8B8B8B94;">// Layouts can export isDynamic independently.</span>
<span style="color:#8B8B8B94;">// Granularity is per file, not per project.</span>

<span style="color:#A0A0A0;">const</span><span style="color:#FFF;"> Dashboard </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">component</span><span style="color:#FFF;">({</span>
<span style="color:#FFF;">  atoms: { data: null </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">DashboardData</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">|</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">null</span><span style="color:#FFF;"> },</span>

<span style="color:#FFF;">  </span><span style="color:#8B8B8B94;">// With isDynamic = true, init runs on every request</span>
<span style="color:#FFF;">  </span><span style="color:#FFC799;">init</span><span style="color:#FFF;">: </span><span style="color:#A0A0A0;">async</span><span style="color:#FFF;"> (self, { data }) </span><span style="color:#A0A0A0;">=&gt;</span><span style="color:#FFF;"> {</span>
<span style="color:#FFF;">    data.value </span><span style="color:#A0A0A0;">=</span><span style="color:#FFF;"> (</span><span style="color:#A0A0A0;">await</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">fetchDashboardData</span><span style="color:#FFF;">(self.props.req </span><span style="color:#A0A0A0;">as</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Request</span><span style="color:#FFF;">));</span>
<span style="color:#FFF;">  },</span>

<span style="color:#FFF;">  </span><span style="color:#FFC799;">view</span><span style="color:#FFF;">: (_, { data }) </span><span style="color:#A0A0A0;">=&gt;</span>
<span style="color:#FFF;">    data.value</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">?</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;dashboard&quot;</span><span style="color:#FFF;"> }, </span><span style="color:#FFC799;">renderDashboard</span><span style="color:#FFF;">(data.value))</span>
<span style="color:#FFF;">      </span><span style="color:#A0A0A0;">:</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">div</span><span style="color:#FFF;">({ class: </span><span style="color:#99FFE4;">&quot;skeleton&quot;</span><span style="color:#FFF;"> })</span>
<span style="color:#FFF;">});</span>

<span style="color:#A0A0A0;">export</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">default</span><span style="color:#FFF;"> </span><span style="color:#A0A0A0;">function</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">DashboardPage</span><span style="color:#FFF;">() {</span>
<span style="color:#FFF;">  </span><span style="color:#A0A0A0;">return</span><span style="color:#FFF;"> </span><span style="color:#FFC799;">Dashboard</span><span style="color:#FFF;">();</span>
<span style="color:#FFF;">}</span></span>`]})],[d({href:"/docs/start/setup",class:"btn btn--amber"},"Read the docs"),d({href:"https://github.com/valdemar-dev/elegance-js",class:"btn btn--ghost",rel:"noopener noreferrer",target:"_blank"},"Star on GitHub")],[d({href:"/docs/start/setup",class:"col-link"},"Documentation")],[d({href:"https://github.com/valdemar-dev/elegance-js",class:"col-link"},"GitHub")]],a=[];return{regions:[...r.regions,...c],handlers:[...r.handlers,...a]}}
