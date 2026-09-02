// pages/docs/[...filename]/components/Navbar.ts
var _docSearchIndex = null;
async function loadSearchIndex() {
  if (_docSearchIndex !== null) return _docSearchIndex;
  try {
    const res = await fetch("/search-index.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _docSearchIndex = await res.json();
  } catch {
    _docSearchIndex = [];
  }
  return _docSearchIndex;
}
function searchIndex(index, query, limit = 7) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results = [];
  for (const entry of index) {
    const titleMatches = entry.title.toLowerCase().includes(q);
    const excerptMatches = entry.excerpt.toLowerCase().includes(q);
    let matchedHeading;
    for (const h of entry.headings) {
      if (h.text.toLowerCase().includes(q)) {
        matchedHeading = h;
        break;
      }
    }
    if (titleMatches || excerptMatches || matchedHeading) {
      results.push({ entry, matchedHeading });
      if (results.length >= limit) break;
    }
  }
  return results;
}
function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return [text];
  return [
    text.slice(0, idx),
    __tags.mark({ class: "search-hl" }, text.slice(idx, idx + query.length)),
    text.slice(idx + query.length)
  ];
}
var DocsNavbar = component({ __id: "3C6OhqO",
  atoms: {
    pinned: false,
    query: "",
    open: false,
    results: []
  },
  onMount: (_, { pinned, query, open, results }) => {
    const inputEl = document.querySelector(".nav-search-input");
    if (!inputEl) return;
    const handleScroll = () => {
      pinned.value = window.scrollY > 32;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    inputEl.addEventListener("focus", async () => {
      const idx = await loadSearchIndex();
      if (query.value.trim()) {
        results.value = searchIndex(idx, query.value);
        open.value = results.value.length > 0;
      }
    });
    inputEl.addEventListener("input", async () => {
      const q = inputEl.value;
      query.value = q;
      if (!q.trim()) {
        results.value = [];
        open.value = false;
        return;
      }
      const idx = await loadSearchIndex();
      results.value = searchIndex(idx, q);
      open.value = true;
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-search-wrap")) {
        open.value = false;
      }
    });
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputEl.focus();
        inputEl.select();
        if (query.value.trim() && _docSearchIndex) {
          results.value = searchIndex(_docSearchIndex, query.value);
          open.value = true;
        }
      }
      if (e.key === "Enter" && (open.value && results.value.length > 0)) {
        const { entry, matchedHeading } = results.value[0];
        const href = matchedHeading ? `/docs/${entry.slug}#${matchedHeading.id}` : `/docs/${entry.slug}`;
        open.value = false;
        navigate(href);
      }
      if (e.key === "Escape" && open.value) {
        open.value = false;
        inputEl.blur();
      }
    });
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-sidebar-toggle");
      if (!btn) return;
      const shell = document.querySelector(".docs-shell");
      const isOpen = shell?.classList.toggle("sidebar--open");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("sidebar-backdrop")) return;
      document.querySelector(".docs-shell")?.classList.remove("sidebar--open");
      document.body.style.overflow = "";
    });
    document.addEventListener("click", (e) => {
      const link2 = e.target.closest(".sidebar-link");
      if (!link2) return;
      if (window.innerWidth >= 768) return;
      document.querySelector(".docs-shell")?.classList.remove("sidebar--open");
      document.body.style.overflow = "";
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  },
  view: ({ atoms: { pinned, query, open, results } }) => {
    return __tags.nav(
      { class: pinned.value ? "nav nav--pinned" : "nav" },
      __tags.div(
        { class: "nav-wrap nav-wrap--docs" },
        /* ── Left: hamburger (mobile) + logo + context ── */
        __tags.div(
          { class: "nav-left" },
          /* Hamburger — only visible on mobile via CSS */
          __tags.button(
            {
              class: "nav-sidebar-toggle",
              "aria-label": "Toggle sidebar",
              type: "button"
            },
            __tags.svg(
              { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "aria-hidden": "true" },
              __tags.line({ x1: 3, y1: 6, x2: 21, y2: 6 }),
              __tags.line({ x1: 3, y1: 12, x2: 21, y2: 12 }),
              __tags.line({ x1: 3, y1: 18, x2: 21, y2: 18 })
            )
          ),
          __tags.a(
            { href: "/", class: "nav-logo" },
            __tags.svg(
              { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": "true" },
              __tags.polygon({ points: "12,1 23,12 12,23 1,12", fill: "none", stroke: "var(--amber)", "stroke-width": "1.5" }),
              __tags.circle({ cx: 12, cy: 12, r: 2.5, fill: "var(--amber)" })
            ),
            __tags.span({ class: "nav-wordmark" }, "ELEGANCE")
          ),
          __tags.span({ class: "nav-slash" }, "/"),
          __tags.span({ class: "nav-context" }, "docs"),
          __tags.span({ class: "nav-version-badge" }, "v3.0 alpha")
        ),
        __tags.div(
          { class: "nav-search-wrap" },
          __tags.div(
            { class: "nav-search" },
            __tags.svg(
              {
                width: 13,
                height: 13,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2.2",
                class: "nav-search-icon",
                "aria-hidden": "true"
              },
              __tags.circle({ cx: 11, cy: 11, r: 8 }),
              __tags.path({ d: "M21 21l-4.35-4.35", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            __tags.input({
              type: "text",
              class: "nav-search-input",
              placeholder: "Search docs\u2026",
              "aria-label": "Search documentation",
              autocomplete: "off",
              spellcheck: false
            }),
            __tags.span({ class: "nav-search-kbd" }, "\u2318K")
          ),
          /* ── Dropdown ── */
          open.value ? __tags.div(
            { class: "search-dropdown", role: "listbox", "aria-label": "Search results" },
            results.value.length > 0 ? results.value.map(({ entry, matchedHeading }) => {
              const q = query.value.trim();
              const href = matchedHeading ? `/docs/${entry.slug}#${matchedHeading.id}` : `/docs/${entry.slug}`;
              return __tags.a(
                {
                  href,
                  class: "search-result",
                  role: "option",
                  onClick(_, event) {
                    event.preventDefault();
                    open.value = false;
                    navigate(event.target.href);
                  }
                },
                __tags.div(
                  { class: "search-result-icon", "aria-hidden": "true" },
                  __tags.svg(
                    { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" },
                    __tags.path({ d: "M14 2H6a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
                    __tags.polyline({ points: "14 2 14 8 20 8" }),
                    __tags.line({ x1: 16, y1: 13, x2: 8, y2: 13 }),
                    __tags.line({ x1: 16, y1: 17, x2: 8, y2: 17 }),
                    __tags.line({ x1: 10, y1: 9, x2: 8, y2: 9 })
                  )
                ),
                __tags.div(
                  { class: "search-result-body" },
                  __tags.span(
                    { class: "search-result-title" },
                    ...highlightMatch(entry.title, q)
                  ),
                  matchedHeading ? __tags.span(
                    { class: "search-result-heading" },
                    "\u203A ",
                    ...highlightMatch(matchedHeading.text, q)
                  ) : entry.excerpt ? __tags.span(
                    { class: "search-result-excerpt" },
                    ...highlightMatch(entry.excerpt, q)
                  ) : null
                )
              );
            }) : __tags.div(
              { class: "search-no-results" },
              __tags.span({ class: "search-no-results-label" }, `No results for `),
              __tags.span({ class: "search-no-results-query" }, `"${query.value}"`)
            )
          ) : null
        ),
        __tags.div(
          { class: "nav-links" },
          __tags.a(
            {
              href: "https://github.com/valdemar-dev/elegance-js",
              class: "nav-gh",
              rel: "noopener noreferrer",
              target: "_blank"
            },
            __tags.svg(
              { width: 15, height: 15, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" },
              __tags.path({ d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" })
            ),
            "GitHub"
          )
        )
      )
    );
  }
});

// pages/docs/[...filename]/metadata.ts
import "elegance-js";
var metadata = () => [
  __tags.title({}, "Getting Started \u2014 Elegance Docs"),
  __tags.meta({ charset: "UTF-8" }),
  __tags.meta({ name: "viewport", content: "width=device-width, initial-scale=1.0" }),
  __tags.meta({ name: "description", content: "Get started with Elegance: installation, project structure, your first page, and the dev server." }),
  __tags.meta({ name: "theme-color", content: "#080808" }),
  __tags.link({ rel: "stylesheet", href: "/index.css" })
];

// pages/docs/[...filename]/layout.ts
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var DOCS_DIR = join(dirname(fileURLToPath(import.meta.url)), "docs");
function dirToTitle(name) {
  return name.replace(/^\d+-/, "").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
async function readMdTitle(filePath, fallback) {
  try {
    const content = await readFile(filePath, "utf-8");
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallback;
  } catch {
    return fallback;
  }
}
async function DocsSidebar() {
  const docsDir = DOCS_DIR;
  let groupDirs = [];
  try {
    const entries = await readdir(docsDir, { withFileTypes: true });
    groupDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    throw new Error("Failed to read docs directory, make sure it's the right path.");
  }
  const groups = await Promise.all(
    groupDirs.map(async (dirName) => {
      const groupDir = join(docsDir, dirName);
      const title2 = dirToTitle(dirName);
      const dirSlug = dirName.replace(/^\d+-/, "");
      let files = [];
      try {
        const all = await readdir(groupDir);
        files = all.filter((f) => f.endsWith(".md")).sort();
      } catch {
      }
      const items = await Promise.all(
        files.map(async (filename) => {
          const fileSlug = filename.replace(/^\d+-/, "").replace(/\.md$/, "");
          const label = await readMdTitle(join(groupDir, filename), fileSlug);
          return { label, href: `/docs/${dirSlug}/${fileSlug}` };
        })
      );
      return { title: title2, items };
    })
  );
  return __tags.aside(
    { class: "docs-sidebar" },
    __tags.div(
      { class: "sidebar-inner" },
      ...groups.map(
        (group) => __tags.div(
          { class: "sidebar-group" },
          __tags.span({ class: "sidebar-group-title" }, group.title),
          ...group.items.map(
            (item) => __tags.a({ __eid: 0,
              onClick: (_, event) => {
                event.preventDefault();
                navigate(event.target.href);
              },
              href: item.href,
              class: "sidebar-link"
            }, item.label)
          )
        )
      )
    )
  );
}
onPageLoad(() => {
  const current = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".sidebar-link").forEach((el) => {
    const href = el.getAttribute("href")?.replace(/\/$/, "") ?? "";
    if (href === current) {
      el.classList.add("sidebar-link--active");
    }
  });
});
onPageLoad(() => {
  const tip = document.querySelector(".concept-tooltip");
  if (!tip) return;
  const termEl = tip.querySelector(".concept-tooltip-term");
  const bodyEl = tip.querySelector(".concept-tooltip-body");
  let mx = 0, my = 0;
  function reposition() {
    const gap = 16;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = mx + gap;
    let y = my + gap;
    if (x + tw > window.innerWidth - 8) x = mx - tw - gap;
    if (y + th > window.innerHeight - 8) y = my - th - gap;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  function onMouseMove(e) {
    mx = e.clientX;
    my = e.clientY;
    if (tip.classList.contains("concept-tooltip--visible")) reposition();
  }
  function onMouseEnter() {
    termEl.textContent = this.dataset.conceptTerm ?? "";
    bodyEl.textContent = this.dataset.conceptDef ?? "";
    tip.classList.add("concept-tooltip--visible");
    reposition();
  }
  function onMouseLeave() {
    tip.classList.remove("concept-tooltip--visible");
  }
  const terms = document.querySelectorAll(".concept-term");
  document.addEventListener("mousemove", onMouseMove, { passive: true });
  terms.forEach((el) => {
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
  });
  return () => {
    document.removeEventListener("mousemove", onMouseMove);
    terms.forEach((el) => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
    });
  };
});
async function Layout({ child }) {
  return __tags.div(
    { class: "docs-shell" },
    DocsNavbar(),
    __tags.div(
      { class: "docs-body" },
      await DocsSidebar(),
      await child()
    ),
    __tags.div(
      { className: "concept-tooltip" },
      __tags.div({ className: "concept-tooltip-term" }),
      __tags.div({ className: "concept-tooltip-body" })
    )
  );
}
export {
  Layout as default,
  metadata
};
