import {
  Navbar
} from "/chunks/chunk-A4SHWCB5.js";

// pages/page.ts
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
      { class: "hero-content" },
      __tags.div(
        { class: "hero-kicker" },
        __tags.span({ class: "kicker-pill" }, "v3.0 alpha"),
        __tags.div({ class: "kicker-sep" }),
        __tags.span({ class: "kicker-label" }, "don't use in production")
      ),
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
        "FS routing, reactivity, SSR, and more.",
        __tags.br({}),
        "With Elegance you ship a runtime smaller than a JPEG."
      ),
      __tags.div(
        { class: "hero-actions" },
        __tags.a({ href: "#how", class: "btn btn--amber" }, "How it works \u2192"),
        __tags.a(
          { href: "#examples", class: "btn btn--ghost" },
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
          __tags.span({ class: "stat-n" }, "~24x"),
          __tags.span({ class: "stat-l" }, "faster than Next.JS")
        ),
        __tags.div({ class: "stat-sep" }),
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "4"),
          __tags.span({ class: "stat-l" }, "KB runtime")
        ),
        __tags.div({ class: "stat-sep" }),
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "0"),
          __tags.span({ class: "stat-l" }, "browser deps")
        ),
        __tags.div({ class: "stat-sep" }),
        __tags.div(
          { class: "stat" },
          __tags.span({ class: "stat-n" }, "MIT"),
          __tags.span({ class: "stat-l" }, "license")
        )
      ),
      __tags.p({ class: "hero-fine" }, "on pages with 200K+ mounted components*")
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
      if (entry.isIntersecting) {
        bodyVisible.value = true;
        headVisible.value = true;
        obs.disconnect();
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -56px 0px" });
    obs.observe(section2);
  },
  view: ({ atoms: { slide, bodyVisible, headVisible } }) => {
    const concepts = [
      {
        n: "01",
        label: "Routes",
        body: "Drop a directory into pages/ with a page.ts inside. That's a route! No config, no imports, no registration step. The filesystem is the router.",
        aside: "Layouts stack from layout.ts files walking up the directory tree, outermost-first. Each one can independently opt into server rendering. You never touch a router config.",
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
        n: "02",
        label: "Components",
        body: "Write components with tag functions or JSX. Elegance compiles both the same way.",
        aside: "Props flow through the component<Props> generic. Atoms infer their type from the initial value, no config required.",
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
        n: "03",
        label: "State",
        body: "Atoms live inside a component, or the page. When the value changes, only the components that read it re-render, nothing more.",
        aside: "DOM events use a single delegated listener per event type, so the listener count stays flat no matter how many components are mounted.",
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
    const current = concepts[slide.value];
    return __tags.section(
      { class: "how-section", id: "how" },
      __tags.div(
        { class: "how-inner" },
        __tags.header(
          { class: `section-head${headVisible.value ? " sr-in" : ""}` },
          __tags.span({ class: "overline" }, "HOW IT FITS TOGETHER"),
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
                __tags.code({ class: "window-code" }, current.code)
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
        if (entry.isIntersecting) {
          windowVisible.value = true;
          obsWin.disconnect();
        }
      }, ioOpts);
      obsWin.observe(win);
    }
    const head = document.querySelector(".examples-section .section-head");
    if (head) {
      const obsHead = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          headVisible.value = true;
          obsHead.disconnect();
        }
      }, ioOpts);
      obsHead.observe(head);
    }
  },
  view: ({ atoms: { tab, windowVisible, headVisible } }) => {
    const files = [
      {
        label: "Routing",
        path: "pages/blog/page.ts",
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
              a({ href: \`/blog/\${post.slug}\` }, post.title),
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
        label: "JSX / TSX",
        path: "pages/blog/page.tsx",
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
        label: "API Routes",
        path: "pages/api/posts/page.ts",
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
        label: "isDynamic",
        path: "pages/dashboard/page.ts",
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
    const active = files[tab.value];
    return __tags.section(
      { class: "examples-section", id: "examples" },
      __tags.header(
        { class: `section-head${headVisible.value ? " sr-in" : ""}` },
        __tags.span({ class: "overline" }, "REAL CODE"),
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
          __tags.code({ class: "window-code" }, active.code)
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

export default function __constructor() {
    const _p0 = {};
    const _p1 = { "num": "01", "title": "Filesystem routing", "body": "pages/ is your router. A directory with a page.ts inside is a route, full stop. Just export a default function that resolves into some element calls.", "detail": "/[slug] · /[...rest] · layouts · API routes", "color": "var(--amber)" };
    const _p2 = { "num": "02", "title": "Atoms", "body": "State lives in atoms. Read one inside view() and just that component re-renders when the atom changes. Just a value with a .value.", "detail": "Fine-grained · no vdom · auto-batched", "color": "var(--lilac)" };
    const _p3 = { "num": "03", "title": "Server-first components", "body": "Pages are always server-rendered, so you can run server-side code in your page, no API required. Server code is removed from the client bundle.", "detail": "SSR by default · !no-bundle · dead code elimination", "color": "var(--green)" };
    const _p4 = { "num": "04", "title": "Static or live, per page", "body": "Build output is static HTML by default. Fast, cacheable and free to host anywhere. One export flips a page to build per-request. Mix them freely across the same project; your blog can be static while your dashboard is live.", "detail": "export const isDynamic = true", "color": "var(--blue)" };
    const _p5 = { "num": "05", "title": "Atom hydration", "body": "Whatever state your server computed gets serialized into the page and restored on the client automatically. No need to re-fetch data you already have.", "detail": "SSR state → client · zero wiring", "color": "var(--orange)" };
    const _p6 = { "num": "06", "title": "Nested layouts", "body": "Drop a layout.ts into any directory and it wraps every route beneath it. Layouts, just like pages, can be dynamic or static; you can even mix and match. They render outer to inner.", "detail": "Nested · independent · per-layout isDynamic", "color": "var(--pink)" };
    const _p7 = { "num": "07", "title": "API routes", "body": "Export GET, POST, PUT, DELETE, or PATCH from any route.ts and that route handles the request as a plain HTTP handler.", "detail": "GET · POST · PUT · DELETE · PATCH", "color": "var(--amber)" };
    const _p8 = { "num": "08", "title": "Slug routes", "body": "Name a directory [id] and the segment becomes a typed parameter. [...rest] catches everything that follows. Slug values are available as props inside the page constructor in that route.", "detail": "/posts/[slug] · /files/[...path]", "color": "var(--lilac)" };
    const _p9 = { "num": "09", "title": "Middleware", "body": "Run code before any route resolves. Auth checks, redirects, request rewriting, header injection. Middleware composes cleanly and can short-circuit the response without touching the page at all.", "detail": "Auth · redirects · headers · rewriting", "color": "var(--green)" };


    const regions  = [[{ __cid: "8xBIPlt", props: _p0, count: 1 }, { __cid: "dZPMS1u", props: _p0, count: 1 }], [{ __cid: "GzhtpDv", props: _p1, count: 1 }, { __cid: "GzhtpDv", props: _p2, count: 1 }, { __cid: "GzhtpDv", props: _p3, count: 1 }, { __cid: "GzhtpDv", props: _p4, count: 1 }, { __cid: "GzhtpDv", props: _p5, count: 1 }, { __cid: "GzhtpDv", props: _p6, count: 1 }, { __cid: "GzhtpDv", props: _p7, count: 1 }, { __cid: "GzhtpDv", props: _p8, count: 1 }, { __cid: "GzhtpDv", props: _p9, count: 1 }], [{ __cid: "2rY4KOi", props: _p0, count: 1 }], [{ __cid: "Krs5Sly", props: _p0, count: 1 }]];
    const handlers = [];
    return { regions: regions, handlers: handlers };
}
