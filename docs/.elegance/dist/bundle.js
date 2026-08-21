//!allow-bundling
import{default as E}from"/chunks/layout_layout.client.mjs";import"/chunks/chunk-A4SHWCB5.js";onPageLoad(()=>{const o=new IntersectionObserver(e=>{e.forEach(a=>{a.isIntersecting?a.target.classList.add("sr-in"):a.target.classList.remove("sr-in")})},{threshold:.1,rootMargin:"0px 0px -56px 0px"});function d(){document.querySelectorAll(".section-head, .feats-grid, .how-tabs, .callouts, .cta-inner, .footer-inner, .hero-stats, .jsx-inner, .speed-compare, .speed-footnote").forEach(e=>o.observe(e))}function i(){const e=document.querySelector(".hero"),a=document.querySelector(".hero-grid"),t=document.querySelector(".hero-glow");if(!e||!a||!t)return;let u=0,l=0,g=0,h=!1;const f=()=>{a.style.transform=`translateY(${u*.22}px) translate(${l}px, ${g}px)`,t.style.transform=`translateY(${u*.1}px) translate(${l*.4}px, ${g*.4}px)`,h=!1},v=()=>{h||(h=!0,requestAnimationFrame(f))};window.addEventListener("scroll",()=>{u=window.scrollY,v()},{passive:!0}),e.addEventListener("mousemove",m=>{const _=e.getBoundingClientRect();l=((m.clientX-_.left)/_.width-.5)*30,g=((m.clientY-_.top)/_.height-.5)*18,v()}),e.addEventListener("mouseleave",()=>{l=0,g=0,v()})}function n(){document.querySelectorAll(".stat-n").forEach(a=>{const t=a.textContent?.trim()||"",u=t.replace(/,/g,""),l=u.match(/-?\d+(\.\d+)?/);if(!l)return;const g=parseFloat(l[0]);if(isNaN(g)||g===0)return;const h=u.slice(0,l.index),f=u.slice((l.index||0)+l[0].length),v=l[0].includes("."),m=900,_=performance.now();function y(x){const w=Math.min((x-_)/m,1),b=(1-Math.pow(1-w,3))*g,S=v?b.toFixed(l[0].split(".")[1].length):Math.round(b).toLocaleString("en-US");a.textContent=`${h}${S}${f}`,w<1?requestAnimationFrame(y):a.textContent=t}requestAnimationFrame(y)})}const s=document.querySelector(".hero-stats");if(s){const e=new IntersectionObserver(a=>{a.forEach(t=>{t.isIntersecting&&(setTimeout(n,700),e.unobserve(t.target))})},{threshold:.5});e.observe(s)}function c(){document.querySelectorAll(".btn--amber").forEach(e=>{e.addEventListener("mousemove",a=>{const t=e.getBoundingClientRect(),u=a.clientX-(t.left+t.width/2),l=a.clientY-(t.top+t.height/2);e.style.transform=`translate(${u*.18}px, ${l*.22}px) translateY(-2px)`}),e.addEventListener("mouseleave",()=>{e.style.transform=""})})}function r(){const e=document.querySelector(".feats-grid");if(!e)return;const a=Array.from(e.querySelectorAll(".feat"));e.addEventListener("mousemove",t=>{const u=e.getBoundingClientRect();e.style.setProperty("--gx",`${t.clientX-u.left}px`),e.style.setProperty("--gy",`${t.clientY-u.top}px`),a.forEach(l=>{const g=l.getBoundingClientRect();l.style.setProperty("--cx",`${t.clientX-g.left}px`),l.style.setProperty("--cy",`${t.clientY-g.top}px`)})},{passive:!0}),e.addEventListener("mouseleave",()=>{e.style.setProperty("--gx","-9999px"),e.style.setProperty("--gy","-9999px"),a.forEach(t=>{t.style.setProperty("--cx","-9999px"),t.style.setProperty("--cy","-9999px")})})}function p(){document.querySelectorAll(".window").forEach(e=>{const a=e.querySelector(".window-glow");a&&e.addEventListener("mousemove",t=>{const u=e.getBoundingClientRect();a.style.setProperty("--wx",`${t.clientX-u.left}px`),a.style.setProperty("--wy",`${t.clientY-u.top}px`)})})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{d(),i(),c(),r(),p()}):(d(),i(),c(),r(),p())});var k=component({__id:"dZPMS1u",atoms:{word:"",phase:0,idx:0,erasing:!1},onMount:async(o,{word:d,phase:i,idx:n,erasing:s})=>{const c=["readable.","auditable.","fast.","flexible."],r=()=>{const p=c[i.value],e=n.value;if(s.value)n.value=e-1,d.value=p.slice(0,e-1),e-1===0&&(s.value=!1,i.value=(i.value+1)%c.length);else if(n.value=e+1,d.value=p.slice(0,e+1),e+1===p.length){s.value=!0,setTimeout(r,2600);return}setTimeout(r,s.value?38:85)};setTimeout(r,800)},view:({atoms:{word:o}})=>__tags.section({class:"hero"},__tags.div({class:"hero-canvas","aria-hidden":"true"},__tags.div({class:"hero-grid"}),__tags.div({class:"hero-glow"})),__tags.div({class:"hero-content"},__tags.div({class:"hero-kicker"},__tags.span({class:"kicker-pill"},"v3.0 alpha"),__tags.div({class:"kicker-sep"}),__tags.span({class:"kicker-label"},"don't use in production")),__tags.h1({class:"hero-title"},__tags.span({class:"hero-dim"},"Framework"),__tags.br({}),__tags.span({class:"hero-dim"},"built to"),__tags.br({}),__tags.em({class:"hero-serif"},"disappear.")),__tags.div({class:"hero-typerow"},__tags.span({class:"typerow-pre"},"Development stays "),__tags.span({class:"typerow-word"},o.value),__tags.span({class:"typerow-cursor"},"\u258C")),__tags.p({class:"hero-pitch"},"FS routing, reactivity, SSR, and more.",__tags.br({}),"With Elegance you ship a runtime smaller than a JPEG."),__tags.div({class:"hero-actions"},__tags.a({href:"#how",class:"btn btn--amber"},"How it works \u2192"),__tags.a({href:"#examples",class:"btn btn--ghost"},__tags.svg({width:13,height:13,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2.2","aria-hidden":"true"},__tags.polyline({points:"16 18 22 12 16 6"}),__tags.polyline({points:"8 6 2 12 8 18"})),"Examples")),__tags.div({class:"hero-stats"},__tags.div({class:"stat"},__tags.span({class:"stat-n"},"~24x"),__tags.span({class:"stat-l"},"faster than Next.JS")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"4"),__tags.span({class:"stat-l"},"KB runtime")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"0"),__tags.span({class:"stat-l"},"browser deps")),__tags.div({class:"stat-sep"}),__tags.div({class:"stat"},__tags.span({class:"stat-n"},"MIT"),__tags.span({class:"stat-l"},"license"))),__tags.p({class:"hero-fine"},"on pages with 200K+ mounted components*")))}),R=component({__id:"GzhtpDv",view:({self:o})=>{const{num:d,title:i,body:n,detail:s,color:c}=o.props;return __tags.div({class:"feat",style:`--fc: ${c}`},__tags.div({class:"feat-head"},__tags.span({class:"feat-n"},d),__tags.div({class:"feat-rule"})),__tags.h3({class:"feat-title"},i),__tags.p({class:"feat-body"},n),__tags.span({class:"feat-detail"},s))}}),O=component({__id:"2rY4KOi",atoms:{slide:0,bodyVisible:!1,headVisible:!1},onMount:(o,{bodyVisible:d,headVisible:i})=>{const n=document.querySelector(".how-section");if(!n)return;const s=new IntersectionObserver(([c])=>{c.isIntersecting&&(d.value=!0,i.value=!0,s.disconnect())},{threshold:.1,rootMargin:"0px 0px -56px 0px"});s.observe(n)},view:({atoms:{slide:o,bodyVisible:d,headVisible:i}})=>{const n=[{n:"01",label:"Routes",body:"Drop a directory into pages/ with a page.ts inside. That's a route! No config, no imports, no registration step. The filesystem is the router.",aside:"Layouts stack from layout.ts files walking up the directory tree, outermost-first. Each one can independently opt into server rendering. You never touch a router config.",code:`pages/
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
});`}],s=n[o.value];return __tags.section({class:"how-section",id:"how"},__tags.div({class:"how-inner"},__tags.header({class:`section-head${i.value?" sr-in":""}`},__tags.span({class:"overline"},"HOW IT FITS TOGETHER"),__tags.h2({class:"section-title"},"Three ideas.",__tags.br({}),__tags.em({class:"serif-accent"},"One framework.")),__tags.p({class:"section-sub"},"The entire mental model. Here's all of it.")),__tags.div({class:`how-tabs${i.value?" sr-in":""}`},...n.map((c,r)=>__tags.button({class:`how-tab${o.value===r?" how-tab--on":""}`,onclick:()=>o.value=r},__tags.span({class:"tab-n"},c.n),__tags.span({class:"tab-label"},c.label)))),__tags.div({class:`how-body${d.value?" sr-in":""}`},__tags.div({class:"how-text"},__tags.p({class:"how-lead"},s.body),__tags.p({class:"how-aside"},s.aside)),__tags.div({class:"how-code"},__tags.div({class:"window"},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.span({class:"window-label"},`concept ${s.n} | ${s.label}`)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code"},s.code)))))))}}),$=component({__id:"Krs5Sly",atoms:{tab:0,windowVisible:!1,headVisible:!1},onMount:(o,{windowVisible:d,headVisible:i})=>{const n={threshold:.1,rootMargin:"0px 0px -56px 0px"},s=document.querySelector(".examples-section .window--wide");if(s){const r=new IntersectionObserver(([p])=>{p.isIntersecting&&(d.value=!0,r.disconnect())},n);r.observe(s)}const c=document.querySelector(".examples-section .section-head");if(c){const r=new IntersectionObserver(([p])=>{p.isIntersecting&&(i.value=!0,r.disconnect())},n);r.observe(c)}},view:({atoms:{tab:o,windowVisible:d,headVisible:i}})=>{const n=[{label:"Routing",path:"pages/blog/page.ts",code:`// pages/blog/page.ts
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
              a({ href: \`/blog/\${post.slug}\` }, post.title),
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
}`}],s=n[o.value];return __tags.section({class:"examples-section",id:"examples"},__tags.header({class:`section-head${i.value?" sr-in":""}`},__tags.span({class:"overline"},"REAL CODE"),__tags.h2({class:"section-title"},"Small surface.",__tags.br({}),__tags.em({class:"serif-accent"},"Real projects.")),__tags.p({class:"section-sub"},"Every concept above expressed as actual files you'd ship.")),__tags.div({class:`window window--wide${d.value?" sr-in":""}`},__tags.div({class:"window-glow"}),__tags.div({class:"window-bar"},__tags.div({class:"dots"},__tags.div({class:"dot dot--r"}),__tags.div({class:"dot dot--y"}),__tags.div({class:"dot dot--g"})),__tags.div({class:"tab-row"},...n.map((c,r)=>__tags.button({class:`file-tab${o.value===r?" file-tab--on":""}`,onclick:()=>o.value=r},c.label))),__tags.span({class:"window-path"},s.path)),__tags.pre({class:"window-pre"},__tags.code({class:"window-code"},s.code))),__tags.div({class:"callouts"},__tags.div({class:"callout"},__tags.span({class:"callout-n"},"01"),__tags.div({},__tags.strong({class:"callout-title"},"Transparent preprocessing"),__tags.p({class:"callout-body"},"OXC rewrites tag calls and assigns atom IDs in one fast pass. Nothing changes about how you write TypeScript, the transformation is an implementation detail, not a mental model you carry around."))),__tags.div({class:"callout"},__tags.span({class:"callout-n"},"02"),__tags.div({},__tags.strong({class:"callout-title"},"Atom hydration, zero wiring"),__tags.p({class:"callout-body"},"Atom values are serialized to JSON during SSR and restored on the client automatically. No manual hydration calls, no mismatch warnings, no extra round-trip for state you already fetched."))),__tags.div({class:"callout"},__tags.span({class:"callout-n"},"03"),__tags.div({},__tags.strong({class:"callout-title"},"init server-side, onMount client-side"),__tags.p({class:"callout-body"},"init is awaited during SSR, the right place for data fetching. onMount fires after the DOM is live. onUnmount fires on teardown. The full lifecycle fits on an index card.")))))}});export default function T(){const o={},d={num:"01",title:"Filesystem routing",body:"pages/ is your router. A directory with a page.ts inside is a route, full stop. Just export a default function that resolves into some element calls.",detail:"/[slug] \xB7 /[...rest] \xB7 layouts \xB7 API routes",color:"var(--amber)"},i={num:"02",title:"Atoms",body:"State lives in atoms. Read one inside view() and just that component re-renders when the atom changes. Just a value with a .value.",detail:"Fine-grained \xB7 no vdom \xB7 auto-batched",color:"var(--lilac)"},n={num:"03",title:"Server-first components",body:"Pages are always server-rendered, so you can run server-side code in your page, no API required. Server code is removed from the client bundle.",detail:"SSR by default \xB7 !no-bundle \xB7 dead code elimination",color:"var(--green)"},s={num:"04",title:"Static or live, per page",body:"Build output is static HTML by default. Fast, cacheable and free to host anywhere. One export flips a page to build per-request. Mix them freely across the same project; your blog can be static while your dashboard is live.",detail:"export const isDynamic = true",color:"var(--blue)"},c={num:"05",title:"Atom hydration",body:"Whatever state your server computed gets serialized into the page and restored on the client automatically. No need to re-fetch data you already have.",detail:"SSR state \u2192 client \xB7 zero wiring",color:"var(--orange)"},r={num:"06",title:"Nested layouts",body:"Drop a layout.ts into any directory and it wraps every route beneath it. Layouts, just like pages, can be dynamic or static; you can even mix and match. They render outer to inner.",detail:"Nested \xB7 independent \xB7 per-layout isDynamic",color:"var(--pink)"},p={num:"07",title:"API routes",body:"Export GET, POST, PUT, DELETE, or PATCH from any route.ts and that route handles the request as a plain HTTP handler.",detail:"GET \xB7 POST \xB7 PUT \xB7 DELETE \xB7 PATCH",color:"var(--amber)"},e={num:"08",title:"Slug routes",body:"Name a directory [id] and the segment becomes a typed parameter. [...rest] catches everything that follows. Slug values are available as props inside the page constructor in that route.",detail:"/posts/[slug] \xB7 /files/[...path]",color:"var(--lilac)"},a={num:"09",title:"Middleware",body:"Run code before any route resolves. Auth checks, redirects, request rewriting, header injection. Middleware composes cleanly and can short-circuit the response without touching the page at all.",detail:"Auth \xB7 redirects \xB7 headers \xB7 rewriting",color:"var(--green)"},t=E(),u=[[{__cid:"8xBIPlt",props:o,count:1},{__cid:"dZPMS1u",props:o,count:1}],[{__cid:"GzhtpDv",props:d,count:1},{__cid:"GzhtpDv",props:i,count:1},{__cid:"GzhtpDv",props:n,count:1},{__cid:"GzhtpDv",props:s,count:1},{__cid:"GzhtpDv",props:c,count:1},{__cid:"GzhtpDv",props:r,count:1},{__cid:"GzhtpDv",props:p,count:1},{__cid:"GzhtpDv",props:e,count:1},{__cid:"GzhtpDv",props:a,count:1}],[{__cid:"2rY4KOi",props:o,count:1}],[{__cid:"Krs5Sly",props:o,count:1}]],l=[];return{regions:[...t.regions,...u],handlers:[...t.handlers,...l]}}
