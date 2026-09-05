// ../../libraries/elegance-js/dist/components/Link.js
var Link = component({ __id: "NBeH2j0",
  init(self) {
    if (!self.props.href) {
      throw new Error("Link components require an HREF attribute to be set. Received: " + self.props.href);
    }
  },
  onMount(self) {
    if (self.props.preload === "load") {
      fetchPage(self.props.href);
    }
  },
  view({ self, children }) {
    return __tags.a(
      {
        ...self.props,
        onClick(_, event) {
          event.preventDefault();
          navigate(self.props.href, true, self.props.doViewTransition);
        },
        onMouseenter() {
          if (self.props.preload !== "hover") {
            return;
          }
          fetchPage(self.props.href);
        }
      },
      ...children
    );
  }
});
var Link_default = Link;

// pages/components/nav.ts
var Navbar = component({ __id: "8xBIPlt",
  atoms: { pinned: false },
  onMount: (_, { pinned }) => {
    window.addEventListener("scroll", () => {
      pinned.value = window.scrollY > 32;
    }, { passive: true });
  },
  view: ({ atoms: { pinned } }) => __tags.nav(
    { class: pinned.value ? "nav nav--pinned" : "nav" },
    __tags.div(
      { class: "nav-wrap" },
      Link_default(
        { href: "/", onClick: (_, e) => {
          e.preventDefault();
          navigate("/");
        }, class: "nav-logo" },
        __tags.svg(
          { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": "true" },
          __tags.polygon({ points: "12,1 23,12 12,23 1,12", fill: "none", stroke: "var(--amber)", "stroke-width": "1.5" }),
          __tags.circle({ cx: 12, cy: 12, r: 2.5, fill: "var(--amber)" })
        ),
        __tags.span({ class: "nav-wordmark" }, "ELEGANCE")
      ),
      __tags.div(
        { class: "nav-links" },
        Link_default({ href: "#examples", onClick: (_, e) => {
          e.preventDefault();
          navigate("/#examples");
        }, class: "nav-link" }, "Examples"),
        Link_default({ href: "/speed", onClick: (_, e) => {
          e.preventDefault();
          navigate("/speed");
        }, class: "nav-link nav-link--speed" }, "Speed"),
        Link_default({ href: "/docs/start/setup", onClick: (_, e) => {
          e.preventDefault();
          navigate("/docs/start/setup");
        }, class: "nav-link" }, "Docs"),
        Link_default(
          {
            href: "https://github.com/valdemar-dev/elegance-js",
            class: "nav-gh",
            rel: "noopener noreferrer",
            target: "_blank"
          },
          __tags.svg(
            { width: 15, height: 15, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" },
            __tags.path({ d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s1.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A11.02 11.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" })
          ),
          "GitHub"
        )
      )
    )
  )
});

// pages/speed/page.ts
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var RESULTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../for-ai/results/results");
function parseTestMd(source) {
  const lines = source.split("\n");
  const desc = [];
  const code2 = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code2.push(line);
      continue;
    }
    if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("Code:") || line.trim() === "") {
      continue;
    }
    desc.push(line.trim());
  }
  return {
    desc: desc.join(" ").trim().replace(/\s*The page code looks as follows:?\s*$/i, ""),
    code: code2.join("\n").trim()
  };
}
async function loadBench(dir, file) {
  return JSON.parse(await readFile(join(RESULTS_DIR, dir, file), "utf-8"));
}
async function loadTest(dir, name, tagline, eleganceFile, nextFile) {
  const md = await readFile(join(RESULTS_DIR, dir, "test.md"), "utf-8");
  const { desc, code: code2 } = parseTestMd(md);
  const [elegance, next] = await Promise.all([
    loadBench(dir, eleganceFile),
    loadBench(dir, nextFile)
  ]);
  return {
    id: dir,
    name,
    tagline,
    desc,
    code: code2,
    eleganceFile,
    nextFile,
    elegance,
    next,
    rpsRatio: elegance.summary.requestsPerSec / next.summary.requestsPerSec
  };
}
async function loadMethodology() {
  const raw = await readFile(join(RESULTS_DIR, "..", "methodology.md"), "utf-8");
  const blocks = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[-*] /.test(trimmed)) {
      const item = trimmed.replace(/^[-*] /, "");
      const last = blocks.at(-1);
      if (last?.kind === "ul") last.content.push(item);
      else blocks.push({ kind: "ul", content: [item] });
    } else {
      blocks.push({ kind: "p", content: [trimmed] });
    }
  }
  return blocks;
}
var fmtRps = (n) => Math.round(n).toLocaleString("en-US");
var fmtSec = (s) => s >= 1 ? `${s.toFixed(2)} s` : `${(s * 1e3).toFixed(2)} ms`;
var fmtBytes = (b) => b >= 1e6 ? `${(b / 1e6).toFixed(2)} MB` : b >= 1e3 ? `${(b / 1e3).toFixed(1)} KB` : `${b} B`;
var fmtRatio = (r) => r >= 100 ? `${Math.round(r).toLocaleString("en-US")}\xD7` : `${r.toFixed(1)}\xD7`;
var fmtPct = (p2) => `${(p2 * 100).toFixed(2)}%`;
function metricsRows(t) {
  const e = t.elegance.summary;
  const n = t.next.summary;
  return [
    {
      label: "Requests / sec",
      e: fmtRps(e.requestsPerSec),
      n: fmtRps(n.requestsPerSec),
      ratio: `${fmtRatio(t.rpsRatio)} more`
    },
    {
      label: "Average latency",
      e: fmtSec(e.average),
      n: fmtSec(n.average),
      ratio: `${fmtRatio(n.average / e.average)} lower`
    },
    {
      label: "p99 latency",
      e: fmtSec(t.elegance.latencyPercentiles.p99),
      n: fmtSec(t.next.latencyPercentiles.p99),
      ratio: `${fmtRatio(t.next.latencyPercentiles.p99 / t.elegance.latencyPercentiles.p99)} lower`
    },
    {
      label: "Transferred / request",
      e: fmtBytes(e.sizePerRequest),
      n: fmtBytes(n.sizePerRequest),
      ratio: e.sizePerRequest === n.sizePerRequest ? "identical" : `${fmtRatio(n.sizePerRequest / e.sizePerRequest)} less`
    },
    {
      label: "Success rate",
      e: fmtPct(e.successRate),
      n: fmtPct(n.successRate),
      ratio: ""
    }
  ];
}
function zipTree(tests) {
  const lines = ["testing.zip", "\u251C\u2500\u2500 methodology.md", "\u251C\u2500\u2500 view-results.js", "\u2514\u2500\u2500 results/"];
  tests.forEach((t, i) => {
    const lastDir = i === tests.length - 1;
    const dirConnector = lastDir ? "    " : "\u2502   ";
    lines.push(`${dirConnector}${lastDir ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 "}${t.id}/`);
    const files = ["test.md", t.eleganceFile, t.nextFile];
    files.forEach((f, j) => {
      const lastFile = j === files.length - 1;
      lines.push(`${dirConnector}${dirConnector}${lastFile ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 "}${f}`);
    });
  });
  return lines.join("\n");
}
function inline(text) {
  const nodes = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = "";
    }
  };
  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        nodes.push(__tags.code({ class: "ic" }, text.slice(i + 1, end)));
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        nodes.push(__tags.strong({ class: "doc-strong" }, text.slice(i + 2, end)));
        i = end + 2;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return nodes;
}
var Footer = () => __tags.footer(
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
        __tags.h5({ class: "col-head" }, "Resources"),
        Link_default({ href: "/testing.zip", class: "col-link" }, "Benchmark data")
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
    __tags.span({ class: "footer-v" }, "v3.0.0")
  )
);
var SpeedTestCard = (t, idx) => {
  const rows = metricsRows(t);
  return __tags.article(
    { class: "spd-test" },
    __tags.div(
      { class: "spd-test-head" },
      __tags.span({ class: "spd-test-n" }, String(idx + 1).padStart(2, "0")),
      __tags.div(
        { class: "spd-test-titlewrap" },
        __tags.h3({ class: "spd-test-title" }, t.name),
        __tags.span({ class: "spd-test-tag" }, t.tagline)
      ),
      __tags.div(
        { class: "spd-test-ratio" },
        __tags.strong({}, fmtRatio(t.rpsRatio)),
        __tags.span({}, "\xD7 requests/sec")
      )
    ),
    __tags.p({ class: "spd-test-desc" }, t.desc),
    __tags.div(
      { class: "spd-table" },
      __tags.div(
        { class: "spd-row spd-row--head" },
        __tags.span({}, "metric"),
        __tags.span({ class: "spd-e" }, "Elegance"),
        __tags.span({ class: "spd-n" }, "Next.JS"),
        __tags.span({ class: "spd-r" }, "ratio")
      ),
      ...rows.map(
        (row) => __tags.div(
          { class: "spd-row" },
          __tags.span({ class: "spd-metric-label" }, row.label),
          __tags.span({ class: "spd-val spd-e" }, row.e),
          __tags.span({ class: "spd-val spd-n" }, row.n),
          __tags.span({ class: "spd-val spd-r" }, row.ratio)
        )
      )
    ),
    t.code ? __tags.div(
      { class: "window spd-code" },
      __tags.div(
        { class: "window-bar" },
        __tags.div(
          { class: "dots" },
          __tags.div({ class: "dot dot--r" }),
          __tags.div({ class: "dot dot--y" }),
          __tags.div({ class: "dot dot--g" })
        ),
        __tags.span({ class: "window-label" }, t.name),
        __tags.span({ class: "window-path" }, `results/${t.id}/test.md`)
      ),
      __tags.pre(
        { class: "window-pre" },
        __tags.code({ class: "window-code" }, t.code)
      )
    ) : null
  );
};
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
  document.querySelectorAll(
    ".section-head, .spd-test, .spd-meth, .spd-dl, .footer-inner"
  ).forEach((el) => io.observe(el));
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
});
async function Page() {
  const [tests, methodology] = await Promise.all([
    Promise.all([
      loadTest(
        "200k-lines",
        "200K Lines",
        "200,000 mounted <p> elements",
        "elegance-production-mode.json",
        "next-production-mode.json"
      ),
      loadTest(
        "raw-rps-test",
        "Raw API RPS",
        "one GET endpoint \xB7 identical payloads",
        "elegance-production-mode.json",
        "next-production-mode.json"
      ),
      loadTest(
        "hello-world",
        "Hello World",
        "minimal static page",
        "elegance-production-mode.json",
        "next-production-mode.json"
      ),
      loadTest(
        "ssr-test",
        "SSR Test",
        "dynamic page \xB7 rendered per request",
        "elegance-run-5.json",
        "next-run-5.json"
      )
    ]),
    loadMethodology()
  ]);
  const stress = tests[0];
  const raw = tests[1];
  return __tags.div(
    { class: "root" },
    Navbar(),
    __tags.section(
      { class: "hero spd-hero" },
      __tags.div(
        { class: "hero-canvas", "aria-hidden": "true" },
        __tags.div({ class: "hero-grid" }),
        __tags.div({ class: "hero-glow" })
      ),
      __tags.div(
        { class: "hero-content" },
        __tags.div(
          { class: "hero-kicker" },
          __tags.span({ class: "kicker-pill" }, "BENCHMARKS"),
          __tags.div({ class: "kicker-sep" }),
          __tags.span({ class: "kicker-label" }, "elegance vs next.js")
        ),
        __tags.h1(
          { class: "hero-title" },
          __tags.span({ class: "hero-dim" }, "Built for"),
          __tags.br({}),
          __tags.em({ class: "hero-serif" }, "absurd speed.")
        ),
        __tags.p(
          { class: "hero-pitch" },
          "Every number on this page comes straight from oha JSON output. Same machine every run."
        ),
        __tags.div(
          { class: "hero-actions" },
          Link_default({ href: "#results", class: "btn btn--amber" }, "See the results \u2193"),
          Link_default({ href: "/testing.zip", class: "btn btn--ghost" }, "Download raw data")
        ),
        __tags.div(
          { class: "hero-stats" },
          __tags.div(
            { class: "stat" },
            __tags.span({ class: "stat-n stat-n--rps" }, fmtRps(raw.elegance.summary.requestsPerSec)),
            __tags.span({ class: "stat-l" }, "req/s for a raw API route")
          ),
          __tags.div({ class: "stat-sep" }),
          __tags.div(
            { class: "stat" },
            __tags.span({ class: "stat-n stat-n--ratio" }, fmtRatio(stress.rpsRatio)),
            __tags.span({ class: "stat-l" }, "faster on \xB7 200K page")
          ),
          __tags.div({ class: "stat-sep" }),
          __tags.div(
            { class: "stat" },
            __tags.span({ class: "stat-n stat-n--sec" }, fmtSec(stress.elegance.summary.average)),
            __tags.span({ class: "stat-l" }, "avg latency \xB7 200K page")
          ),
          __tags.div({ class: "stat-sep" }),
          __tags.div(
            { class: "stat" },
            __tags.span({ class: "stat-n stat-n--bytes" }, fmtBytes(stress.elegance.summary.sizePerRequest)),
            __tags.span({ class: "stat-l" }, "transferred \xB7 200K page")
          )
        )
      )
    ),
    __tags.section(
      { class: "spd-section", id: "results" },
      __tags.div(
        { class: "spd-inner" },
        __tags.header(
          { class: "section-head" },
          __tags.span({ class: "overline" }, "TEST RESULTS"),
          __tags.h2(
            { class: "section-title" },
            "Proof, not ",
            __tags.em({ class: "serif-accent" }, "promises.")
          )
        ),
        __tags.div(
          { class: "spd-tests" },
          ...tests.map((t, i) => SpeedTestCard(t, i))
        )
      )
    ),
    __tags.section(
      { class: "spd-section spd-section--alt", id: "methodology" },
      __tags.div(
        { class: "spd-inner" },
        __tags.header(
          { class: "section-head" },
          __tags.span({ class: "overline" }, "METHODOLOGY"),
          __tags.h2(
            { class: "section-title" },
            "How we ",
            __tags.em({ class: "serif-accent" }, "measured it.")
          )
        ),
        __tags.div(
          { class: "spd-meth" },
          ...methodology.map(
            (block) => block.kind === "p" ? __tags.p({ class: "spd-meth-p" }, ...inline(block.content[0])) : __tags.ul(
              { class: "spd-meth-list" },
              ...block.content.map((item) => __tags.li({}, ...inline(item)))
            )
          )
        )
      )
    ),
    __tags.section(
      { class: "spd-section", id: "download" },
      __tags.div(
        { class: "spd-inner" },
        __tags.div(
          { class: "spd-dl" },
          __tags.div(
            { class: "spd-dl-text" },
            __tags.span({ class: "overline" }, "RAW DATA"),
            __tags.h2(
              { class: "spd-dl-title" },
              "Download the",
              __tags.br({}),
              __tags.em({ class: "spd-dl-accent" }, "full results.")
            ),
            __tags.p(
              { class: "spd-dl-sub" },
              "Everything: the oha JSON summaries, per-test writeups, the methodology, and a small viewer script so you can browse the numbers yourself. ~37 KB, zero excuses."
            ),
            __tags.div(
              { class: "spd-dl-actions" },
              Link_default({ href: "/testing.zip", class: "btn btn--amber", download: "testing.zip" }, "testing.zip \u2193"),
              Link_default({ href: "/speed#results", class: "btn btn--ghost" }, "Back to results")
            )
          ),
          __tags.div(
            { class: "window" },
            __tags.div(
              { class: "window-bar" },
              __tags.div(
                { class: "dots" },
                __tags.div({ class: "dot dot--r" }),
                __tags.div({ class: "dot dot--y" }),
                __tags.div({ class: "dot dot--g" })
              ),
              __tags.span({ class: "window-label" }, "archive contents"),
              __tags.span({ class: "window-path" }, "testing.zip")
            ),
            __tags.pre(
              { class: "window-pre spd-dl-pre" },
              __tags.code({ class: "window-code" }, zipTree(tests))
            )
          )
        )
      )
    ),
    Footer()
  );
}
var metadata = () => [
  __tags.title({}, "Speed \u2014 Elegance Benchmarks"),
  __tags.meta({ charset: "UTF-8" }),
  __tags.meta({ name: "viewport", content: "width=device-width, initial-scale=1.0" }),
  __tags.meta({ name: "description", content: "Elegance vs Next.JS: oha stress-test results across four benchmarks \u2014 raw API routes, static pages, SSR, and a 200K-component page." }),
  __tags.meta({ name: "theme-color", content: "#080808" }),
  __tags.link({ rel: "stylesheet", href: "/home.css" }),
  __tags.link({ rel: "stylesheet", href: "/index.css" })
];
var isDynamic = false;
export {
  Page as default,
  isDynamic,
  metadata
};
