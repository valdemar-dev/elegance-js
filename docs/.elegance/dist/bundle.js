//!allow-bundling
import{default as P}from"/chunks/layout_layout.client.mjs";import{Navbar as k}from"/chunks/chunk-ZW5PEK2I.js";import{Link_default as h}from"/chunks/chunk-ADESIFDG.js";onPageLoad(()=>{const o=new IntersectionObserver(e=>{e.forEach(a=>{a.isIntersecting?a.target.classList.add("sr-in"):a.target.classList.remove("sr-in")})},{threshold:.1,rootMargin:"0px 0px -56px 0px"});function c(){document.querySelectorAll(".section-head, .feats-grid, .how-tabs, .callouts, .cta-inner, .footer-inner, .hero-stats, .jsx-inner, .speed-compare, .speed-footnote").forEach(e=>o.observe(e))}function n(){const e=document.querySelector(".hero"),a=document.querySelector(".hero-grid"),s=document.querySelector(".hero-glow");if(!e||!a||!s)return;let u=0,i=0,p=0,v=!1;const b=()=>{a.style.transform=`translateY(${u*.22}px) translate(${i}px, ${p}px)`,s.style.transform=`translateY(${u*.1}px) translate(${i*.4}px, ${p*.4}px)`,v=!1},f=()=>{v||(v=!0,requestAnimationFrame(b))};window.addEventListener("scroll",()=>{u=window.scrollY,f()},{passive:!0}),e.addEventListener("mousemove",y=>{const m=e.getBoundingClientRect();i=((y.clientX-m.left)/m.width-.5)*30,p=((y.clientY-m.top)/m.height-.5)*18,f()}),e.addEventListener("mouseleave",()=>{i=0,p=0,f()})}function r(){document.querySelectorAll(".stat-n").forEach(a=>{const s=a.textContent?.trim()||"",u=s.replace(/,/g,""),i=u.match(/-?\d+(\.\d+)?/);if(!i)return;const p=parseFloat(i[0]);if(isNaN(p)||p===0)return;const v=u.slice(0,i.index),b=u.slice((i.index||0)+i[0].length),f=i[0].includes("."),y=900,m=performance.now();function w(E){const x=Math.min((E-m)/y,1),S=(1-Math.pow(1-x,3))*p,T=f?S.toFixed(i[0].split(".")[1].length):Math.round(S).toLocaleString("en-US");a.textContent=`${v}${T}${b}`,x<1?requestAnimationFrame(w):a.textContent=s}requestAnimationFrame(w)})}const t=document.querySelector(".hero-stats");if(t){const e=new IntersectionObserver(a=>{a.forEach(s=>{s.isIntersecting&&(setTimeout(r,700),e.unobserve(s.target))})},{threshold:.5});e.observe(t)}function d(){document.querySelectorAll(".btn--amber").forEach(e=>{e.addEventListener("mousemove",a=>{const s=e.getBoundingClientRect(),u=a.clientX-(s.left+s.width/2),i=a.clientY-(s.top+s.height/2);e.style.transform=`translate(${u*.18}px, ${i*.22}px) translateY(-2px)`}),e.addEventListener("mouseleave",()=>{e.style.transform=""})})}function l(){const e=document.querySelector(".feats-grid");if(!e)return;const a=Array.from(e.querySelectorAll(".feat"));e.addEventListener("mousemove",s=>{const u=e.getBoundingClientRect();e.style.setProperty("--gx",`${s.clientX-u.left}px`),e.style.setProperty("--gy",`${s.clientY-u.top}px`),a.forEach(i=>{const p=i.getBoundingClientRect();i.style.setProperty("--cx",`${s.clientX-p.left}px`),i.style.setProperty("--cy",`${s.clientY-p.top}px`)})},{passive:!0}),e.addEventListener("mouseleave",()=>{e.style.setProperty("--gx","-9999px"),e.style.setProperty("--gy","-9999px"),a.forEach(s=>{s.style.setProperty("--cx","-9999px"),s.style.setProperty("--cy","-9999px")})})}function g(){document.querySelectorAll(".window").forEach(e=>{const a=e.querySelector(".window-glow");a&&e.addEventListener("mousemove",s=>{const u=e.getBoundingClientRect();a.style.setProperty("--wx",`${s.clientX-u.left}px`),a.style.setProperty("--wy",`${s.clientY-u.top}px`)})})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{c(),n(),d(),l(),g()}):(c(),n(),d(),l(),g())});var q=component({__id:"dZPMS1u",atoms:{word:"",phase:0,idx:0,erasing:!1},onMount:async(o,{word:c,phase:n,idx:r,erasing:t})=>{const d=["readable.","auditable.","fast.","flexible."],l=()=>{const g=d[n.value],e=r.value;if(t.value)r.value=e-1,c.value=g.slice(0,e-1),e-1===0&&(t.value=!1,n.value=(n.value+1)%d.length);else if(r.value=e+1,c.value=g.slice(0,e+1),e+1===g.length){t.value=!0,setTimeout(l,2600);return}setTimeout(l,t.value?38:85)};setTimeout(l,800)},view:({atoms:{word:o}})=>__tags.section({class:"hero"},__tags.div({class:"hero-canvas","aria-hidden":"true"},__tags.div({class:"hero-grid"}),__tags.div({class:"hero-glow"})),__tags.div({class:"hero-content"},__tags.div({class:"hero-kicker"},__tags.span({class:"kicker-pill"},"v3.0 alpha"),__tags.div({class:"kicker-sep"}),__tags.span({class:"kicker-label"},"don't use in production")),__tags.h1({class:"hero-title"},__tags.span({class:"hero-dim"},"Framework"),__tags.br({}),__tags.span({class:"hero-dim"},"built to"),__tags.br({}),__tags.em({class:"hero-serif"},"disappear.")),__tags.div({class:"hero-typerow"},__tags.span({class:"typerow-pre"},"Development stays "),__tags.span({class:"typerow-word"},o.value),__tags.span({class:"typerow-cursor"},"\u258C")),__tags.p({class:"hero-pitch"},"FS routing, reactivity, SSR, and more.",__tags.br({}),"With Elegance you ship a runtime smaller than a JPEG."),__tags.div({class:"hero-actions"},h({href:"#how",class:"btn btn--amber"},"How it works \u2192"),h({href:"#examples",class:"btn btn--ghost"},__tags.svg({width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2.2","aria-hidden":"true"},__tags.polyline({points:"16 18 22 12 16 6"}),__tags.polyline({points:"8 6 2 12 8 18"})),"Examples")),__tags.div({class:"hero-stats"},__tags.div({class:"stat"},__tags.span({class:"stat-n"},"~24x"),__tags.span({class:"stat-l"},"faster than Next.JS")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"4"),__tags.span({class:"stat-l"},"KB runtime")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"0"),__tags.span({class:"stat-l"},"browser deps")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"MIT"),__tags.span({class:"stat-l"},"license"))),__tags.p({class:"hero-fine"},"on pages with 200K+ mounted components*")))}),_=component({__id:"GzhtpDv",view:({self:o})=>{const{num:c,title:n,body:r,detail:t,color:d}=o.props;return __tags.div({class:"feat",style:`--fc: ${d}`},__tags.div({class:"feat-head"},__tags.span({class:"feat-n"},c),__tags.div({class:"feat-rule"})),__tags.h3({class:"feat-title"},n),__tags.p({class:"feat-body"},r),__tags.span({class:"feat-detail"},t))}}),D=component({__id:"2rY4KOi",atoms:{slide:0,bodyVisible:!1,headVisible:!1},onMount:(o,{bodyVisible:c,headVisible:n})=>{const r=document.querySelector(".how-section");if(!r)return;const t=new IntersectionObserver(([d])=>{d.isIntersecting&&(c.value=!0,n.value=!0,t.disconnect())},{threshold:.1,rootMargin:"0px 0px -56px 0px"});t.observe(r)},view:({atoms:{slide:o,bodyVisible:c,headVisible:n}})=>{const r=[{n:"01",label:"Routes",body:"Drop a directory into pages/ with a page.ts inside. That's a route! No config, no imports, no registration step. The filesystem is the router.",aside:"Layouts stack from layout.ts files walking up the directory tree, outermost-first. Each one can independently opt into server rendering. You never touch a router config.",code:`pages/
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
    \u2514\u2500\u2500 page.ts        \u2192  /api/users  (HTTP handlers)`},{n:"02",label:"Components",body:"Write components with tag functions or JSX. Elegance compiles both the same way.",aside:"Props flow through the component<Props> generic. Atoms infer their type from the initial value, no config required.",code:`// pages/card/page.ts  \u2014 tag-function style
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
});`},{n:"03",label:"State",body:"Atoms live inside a component, or the page. When the value changes, only the components that read it re-render, nothing more.",aside:"DOM events use a single delegated listener per event type, so the listener count stays flat no matter how many components are mounted.",code:`// const globalAtom = state("Hello, Sailor!");
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
});`}],t=r[o.value];return __tags.section({class:"how-section",id:"how"},__tags.div({class:"how-inner"},__tags.header({class:`section-head${n.value?" sr-in":""}`},__tags.span({class:"overline"},"HOW IT FITS TOGETHER"),__tags.h2({class:"section-title"},"Three ideas.",__tags.br({}),__tags.em({class:"serif-accent"},"One framework.")),__tags.p({class:"section-sub"},"The entire mental model. Here's all of it.")),__tags.div({class:`how-tabs${n.value?" sr-in":""}`},...r.map((d,l)=>__tags.button({class:`how-tab${o.value===l?" how-tab--on":""}`,onclick:()=>o.value=l},__tags.span({class:"tab-n"},d.n),__tags.span({class:"tab-label"},d.label)))),__tags.div({class:`how-body${c.value?" sr-in":""}`},__tags.div({class:"how-text"},__tags.p({class:"how-lead"},t.body),__tags.p({class:"how-aside"},t.aside)),__tags.div({class:"how-code"},__tags.div({class:"window"},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.span({class:"window-label"},`concept ${t.n} | ${t.label}`)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code"},t.code)))))))}}),C=component({__id:"Krs5Sly",atoms:{tab:0,windowVisible:!1,headVisible:!1},onMount:(o,{windowVisible:c,headVisible:n})=>{const r={threshold:.1,rootMargin:"0px 0px -56px 0px"},t=document.querySelector(".examples-section .window--wide");if(t){const l=new IntersectionObserver(([g])=>{g.isIntersecting&&(c.value=!0,l.disconnect())},r);l.observe(t)}const d=document.querySelector(".examples-section .section-head");if(d){const l=new IntersectionObserver(([g])=>{g.isIntersecting&&(n.value=!0,l.disconnect())},r);l.observe(d)}},view:({atoms:{tab:o,windowVisible:c,headVisible:n}})=>{const r=[{label:"Routing",path:"pages/blog/page.ts",code:`// pages/blog/page.ts
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
}`},{label:"JSX / TSX",path:"pages/blog/page.tsx",code:`// pages/blog/page.tsx
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
// The preprocessor handles both; no tsconfig changes needed.`},{label:"API Routes",path:"pages/api/posts/page.ts",code:`// pages/api/posts/page.ts
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

// GET, POST, PUT, DELETE, PATCH are all supported`},{label:"isDynamic",path:"pages/dashboard/page.ts",code:`// pages/dashboard/page.ts
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
}`}],t=r[o.value];return __tags.section({class:"examples-section",id:"examples"},__tags.header({class:`section-head${n.value?" sr-in":""}`},__tags.span({class:"overline"},"REAL CODE"),__tags.h2({class:"section-title"},"Small surface.",__tags.br({}),__tags.em({class:"serif-accent"},"Real projects.")),__tags.p({class:"section-sub"},"Every concept above expressed as actual files you'd ship.")),__tags.div({class:`window window--wide${c.value?" sr-in":""}`},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.div({class:"tab-row"},...r.map((d,l)=>__tags.button({class:`file-tab${o.value===l?" file-tab--on":""}`,onclick:()=>o.value=l},d.label))),__tags.span({class:"window-path"},t.path)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code"},t.code))),__tags.div({class:"callouts"},__tags.div({class:"callout"},__tags.span({class:"callout-n"},"01"),__tags.div({},__tags.strong({class:"callout-title"},"Transparent preprocessing"),__tags.p({class:"callout-body"},"OXC rewrites tag calls and assigns atom IDs in one fast pass. Nothing changes about how you write TypeScript, the transformation is an implementation detail, not a mental model you carry around."))),__tags.div({class:"callout"},__tags.span({class:"callout-n"},"02"),__tags.div({},__tags.strong({class:"callout-title"},"Atom hydration, zero wiring"),__tags.p({class:"callout-body"},"Atom values are serialized to JSON during SSR and restored on the client automatically. No manual hydration calls, no mismatch warnings, no extra round-trip for state you already fetched."))),__tags.div({class:"callout"},__tags.span({class:"callout-n"},"03"),__tags.div({},__tags.strong({class:"callout-title"},"init server-side, onMount client-side"),__tags.p({class:"callout-body"},"init is awaited during SSR, the right place for data fetching. onMount fires after the DOM is live. onUnmount fires on teardown. The full lifecycle fits on an index card.")))))}});export default function R(){const o=P(),c=[[k({}),q({})],[_({num:"01",title:"Filesystem routing",body:"pages/ is your router. A directory with a page.ts inside is a route, full stop. Just export a default function that resolves into some element calls.",detail:"/[slug] \xB7 /[...rest] \xB7 layouts \xB7 API routes",color:"var(--amber)"}),_({num:"02",title:"Atoms",body:"State lives in atoms. Read one inside view() and just that component re-renders when the atom changes. Just a value with a .value.",detail:"Fine-grained \xB7 no vdom \xB7 auto-batched",color:"var(--lilac)"}),_({num:"03",title:"Server-first components",body:"Pages are always server-rendered, so you can run server-side code in your page, no API required. Server code is removed from the client bundle.",detail:"SSR by default \xB7 !no-bundle \xB7 dead code elimination",color:"var(--green)"}),_({num:"04",title:"Static or live, per page",body:"Build output is static HTML by default. Fast, cacheable and free to host anywhere. One export flips a page to build per-request. Mix them freely across the same project; your blog can be static while your dashboard is live.",detail:"export const isDynamic = true",color:"var(--blue)"}),_({num:"05",title:"Atom hydration",body:"Whatever state your server computed gets serialized into the page and restored on the client automatically. No need to re-fetch data you already have.",detail:"SSR state \u2192 client \xB7 zero wiring",color:"var(--orange)"}),_({num:"06",title:"Nested layouts",body:"Drop a layout.ts into any directory and it wraps every route beneath it. Layouts, just like pages, can be dynamic or static; you can even mix and match. They render outer to inner.",detail:"Nested \xB7 independent \xB7 per-layout isDynamic",color:"var(--pink)"}),_({num:"07",title:"API routes",body:"Export GET, POST, PUT, DELETE, or PATCH from any route.ts and that route handles the request as a plain HTTP handler.",detail:"GET \xB7 POST \xB7 PUT \xB7 DELETE \xB7 PATCH",color:"var(--amber)"}),_({num:"08",title:"Slug routes",body:"Name a directory [id] and the segment becomes a typed parameter. [...rest] catches everything that follows. Slug values are available as props inside the page constructor in that route.",detail:"/posts/[slug] \xB7 /files/[...path]",color:"var(--lilac)"}),_({num:"09",title:"Middleware",body:"Run code before any route resolves. Auth checks, redirects, request rewriting, header injection. Middleware composes cleanly and can short-circuit the response without touching the page at all.",detail:"Auth \xB7 redirects \xB7 headers \xB7 rewriting",color:"var(--green)"})],[D({})],[h({href:"/speed",class:"speed-full-link"},"Full methodology & raw results",{__type:"element",tag:"span",options:{class:"speed-arrow"},children:[" \u2192"]})],[C({})],[h({href:"/docs/start/setup",class:"btn btn--amber"},"Read the docs"),h({href:"https://github.com/valdemar-dev/elegance-js",class:"btn btn--ghost",rel:"noopener noreferrer",target:"_blank"},"Star on GitHub")],[h({href:"#",class:"col-link"},"Documentation")],[h({href:"#",class:"col-link"},"Examples")],[h({href:"#",class:"col-link"},"GitHub"),h({href:"#",class:"col-link"},"Twitter / X")]],n=[];return{regions:[...o.regions,...c],handlers:[...o.handlers,...n]}}
