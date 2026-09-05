import {
  Link_default
} from "/chunks/chunk-ADESIFDG.js";

// pages/docs/[...filename]/page.ts
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCallback, getOutputDirectory } from "elegance-js";
var DOCS_DIR = join(dirname(fileURLToPath(import.meta.url)), "docs/");
function slugify(text) {
  return text.toLowerCase().replace(/[`*[\]]/g, "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}
var _concepts = null;
async function loadConcepts() {
  if (_concepts !== null) return _concepts;
  try {
    const conceptsPath = join(dirname(fileURLToPath(import.meta.url)), "concepts.json");
    const raw = await readFile(conceptsPath, "utf-8");
    _concepts = JSON.parse(raw);
  } catch {
    _concepts = {};
  }
  return _concepts;
}
function wrapConcepts(nodes, concepts) {
  const terms = Object.keys(concepts).sort((a, b) => b.length - a.length);
  if (!terms.length) return nodes;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const out = [];
  for (const node of nodes) {
    if (typeof node !== "string") {
      out.push(node);
      continue;
    }
    let last = 0;
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(node)) !== null) {
      if (m.index > last) out.push(node.slice(last, m.index));
      const matched = m[1];
      const canonical = terms.find((t) => t.toLowerCase() === matched.toLowerCase());
      out.push(__tags.span({
        class: "concept-term",
        "data-concept-term": canonical,
        "data-concept-def": concepts[canonical]
      }, matched));
      last = m.index + matched.length;
    }
    if (last < node.length) out.push(node.slice(last));
  }
  return out;
}
function ic(text) {
  return __tags.code({ class: "ic" }, text);
}
function CodeBlock(filename, lang, codeText) {
  return __tags.div(
    { class: "window doc-window" },
    __tags.div(
      { class: "window-bar" },
      __tags.div(
        { class: "dots" },
        __tags.div({ class: "dot dot--r" }),
        __tags.div({ class: "dot dot--y" }),
        __tags.div({ class: "dot dot--g" })
      ),
      filename ? __tags.span({ class: "window-label" }, filename) : null,
      __tags.span({ class: "window-path" }, lang)
    ),
    __tags.pre(
      { class: "window-pre doc-pre" },
      __tags.code({ class: "window-code" }, codeText)
    )
  );
}
function parseInline(text, concepts = {}) {
  const result = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      result.push(buf);
      buf = "";
    }
  };
  while (i < text.length) {
    if (text[i] === "`") {
      flush();
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        result.push(ic(text.slice(i + 1, end)));
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] === "*") {
      flush();
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        result.push(__tags.strong({ class: "doc-strong" }, text.slice(i + 2, end)));
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      flush();
      const end = text.indexOf("*", i + 1);
      if (end !== -1) {
        result.push(__tags.em({ class: "doc-em" }, text.slice(i + 1, end)));
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "[") {
      const closeB = text.indexOf("]", i + 1);
      if (closeB !== -1 && text[closeB + 1] === "(") {
        const closeP = text.indexOf(")", closeB + 2);
        if (closeP !== -1) {
          flush();
          const linkText = text.slice(i + 1, closeB);
          const url = text.slice(closeB + 2, closeP);
          result.push(Link_default({ href: url, class: "doc-link" }, linkText));
          i = closeP + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return Object.keys(concepts).length ? wrapConcepts(result, concepts) : result;
}
function parseTable(lines, start, concepts = {}) {
  const headerCells = lines[start].split("|").map((s) => s.trim()).filter(Boolean);
  let i = start + 2;
  const bodyRows = [];
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    bodyRows.push(lines[i].split("|").map((s) => s.trim()).filter(Boolean));
    i++;
  }
  return {
    node: __tags.div(
      { class: "doc-table-wrap" },
      __tags.table(
        { class: "doc-table" },
        __tags.thead(
          {},
          __tags.tr(
            {},
            ...headerCells.map((cell) => __tags.th({}, ...parseInline(cell, concepts)))
          )
        ),
        __tags.tbody(
          {},
          ...bodyRows.map(
            (row) => __tags.tr(
              {},
              ...row.map((cell) => __tags.td({}, ...parseInline(cell, concepts)))
            )
          )
        )
      )
    ),
    consumed: i - start
  };
}
function parseMd(source, concepts = {}) {
  const lines = source.split("\n");
  const nodes = [];
  const toc = [];
  let title = "";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "text";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(CodeBlock("", lang, codeLines.join("\n")));
      continue;
    }
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      const id = slugify(text);
      toc.push({ id, label: text, depth: 2 });
      nodes.push(__tags.h2({ id, class: "doc-h2" }, text));
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      const id = slugify(text);
      toc.push({ id, label: text, depth: 3 });
      nodes.push(__tags.h3({ id, class: "doc-h3" }, text));
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      nodes.push(__tags.div({ class: "doc-rule" }));
      i++;
      continue;
    }
    if (line.trimStart().startsWith("|") && i + 1 < lines.length && /^\|[-| :]+\|/.test(lines[i + 1])) {
      const { node, consumed } = parseTable(lines, i, concepts);
      nodes.push(node);
      i += consumed;
      continue;
    }
    if (line.startsWith("> ") || line === ">") {
      const contentLines = [];
      let kind = "plain";
      const firstContent = line.replace(/^>\s?/, "");
      const typeMatch = firstContent.match(/^\[!(NOTE|TIP)\]\s*/i);
      if (typeMatch) {
        kind = typeMatch[1].toLowerCase();
        i++;
      } else {
        contentLines.push(firstContent);
        i++;
      }
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        contentLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const admonClass = kind === "plain" ? "doc-admonition doc-admonition--note" : `doc-admonition doc-admonition--${kind}`;
      const icon = kind === "tip" ? "\u25C6" : "\u25C6";
      nodes.push(__tags.div(
        { class: admonClass },
        __tags.span({ class: "admonition-icon" }, icon),
        __tags.p(
          { class: "admonition-text" },
          ...parseInline(contentLines.join(" "), concepts)
        )
      ));
      continue;
    }
    if (/^(\s*[-*+] )/.test(line)) {
      const items = [];
      while (i < lines.length && /^(\s*[-*+] )/.test(lines[i])) {
        const text = lines[i].replace(/^\s*[-*+] /, "");
        items.push(__tags.li({ class: "doc-li" }, ...parseInline(text, concepts)));
        i++;
      }
      nodes.push(__tags.ul({ class: "doc-ul" }, ...items));
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, "");
        items.push(__tags.li({ class: "doc-li" }, ...parseInline(text, concepts)));
        i++;
      }
      nodes.push(__tags.ol({ class: "doc-ol" }, ...items));
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("|") && !/^(\s*[-*+] )/.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      nodes.push(__tags.p({ class: "doc-p" }, ...parseInline(paraLines.join(" "), concepts)));
    }
  }
  return { title, nodes, toc };
}
async function findDocFile(slug) {
  const parts = slug.split("/");
  async function walk(dir, remaining) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    const target = remaining[0];
    if (remaining.length === 1) {
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.isDirectory()) continue;
        if (!entry.name.endsWith(".md")) continue;
        const fileSlug = entry.name.replace(/^\d+-/, "").replace(/\.md$/, "");
        if (fileSlug === target) return join(dir, entry.name);
      }
    } else {
      for (const entry of entries) {
        if (entry.name.startsWith(".") || !entry.isDirectory()) continue;
        const dirSlug = entry.name.replace(/^\d+-/, "");
        if (dirSlug === target) {
          return walk(join(dir, entry.name), remaining.slice(1));
        }
      }
    }
    return null;
  }
  return walk(DOCS_DIR, parts);
}
async function DocsContent(slug) {
  const [filePath, concepts] = await Promise.all([
    findDocFile(slug),
    loadConcepts()
  ]);
  if (!filePath) {
    return {
      article: __tags.article(
        { class: "doc-content" },
        __tags.div(
          { class: "doc-hero" },
          __tags.h1({ class: "doc-title" }, "Not found"),
          __tags.p({ class: "doc-lead" }, `No documentation file found for "${slug}".`)
        )
      ),
      toc: []
    };
  }
  const source = await readFile(filePath, "utf-8");
  const { title, nodes, toc } = parseMd(source, concepts);
  const lastSegment = slug.split("/").at(-1) ?? slug;
  const sectionLabel = lastSegment.split("-").map((w) => w.toUpperCase()).join(" ");
  return {
    toc,
    article: __tags.article(
      { class: "doc-content" },
      __tags.div(
        { class: "doc-breadcrumb" },
        Link_default({ href: "/docs", class: "breadcrumb-link" }, "Docs"),
        __tags.span({ class: "breadcrumb-sep" }, "/"),
        __tags.span({ class: "breadcrumb-current" }, title || lastSegment)
      ),
      __tags.div(
        { class: "doc-hero" },
        __tags.h1({ class: "doc-title" }, title || lastSegment)
      ),
      ...nodes
    )
  };
}
var DocsToc = component({ __id: "Q3edowQ",
  atoms: { activeId: "" },
  onNavigate(self, { activeId }) {
    if (self.props.items.length) {
      activeId.value = self.props.items[0].id;
    }
    const headings = Array.from(
      document.querySelectorAll(".doc-content h2[id], .doc-content h3[id]")
    );
    if (!headings.length) return;
    const OFFSET = window.innerHeight / 3;
    function updateActive() {
      const scrollY = window.scrollY + OFFSET;
      let current = headings[0].id;
      for (const h of headings) {
        if (h.offsetTop <= scrollY) {
          current = h.id;
        } else {
          break;
        }
      }
      activeId.value = current;
    }
    const tocEl = document.querySelector(".docs-toc");
    let lastScrollY = window.scrollY;
    let ticking = false;
    function handleScrollDirection() {
      if (!tocEl) return;
      const currentY = window.scrollY;
      const isMobile = window.innerWidth < 1280;
      if (isMobile) {
        if (currentY > lastScrollY && currentY > 80) {
          tocEl.classList.add("toc--hidden");
        } else {
          tocEl.classList.remove("toc--hidden");
        }
      } else {
        tocEl.classList.remove("toc--hidden");
      }
      lastScrollY = currentY;
      ticking = false;
    }
    function onScroll() {
      updateActive();
      if (!ticking) {
        requestAnimationFrame(handleScrollDirection);
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", onScroll);
  },
  view: ({ self, atoms: { activeId } }) => __tags.aside(
    { class: "docs-toc" },
    __tags.div(
      { class: "toc-inner" },
      __tags.p({ class: "toc-label" }, "ON THIS PAGE"),
      __tags.nav(
        { class: "toc-nav", "aria-label": "Page sections" },
        ...self.props.items.map((item) => {
          const isActive = activeId.value === item.id;
          const cls = [
            "toc-link",
            item.depth === 3 ? "toc-link--sub" : "",
            isActive ? "toc-link--active" : ""
          ].filter(Boolean).join(" ");
          return Link_default({ href: `#${item.id}`, class: cls }, item.label);
        })
      )
    )
  )
});
async function collectSlugs(dir, prefix = "") {
  const slugs = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return slugs;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const dirSlug = entry.name.replace(/^\d+-/, "");
      const newPrefix = prefix ? `${prefix}/${dirSlug}` : dirSlug;
      slugs.push(...await collectSlugs(fullPath, newPrefix));
    } else if (entry.name.endsWith(".md")) {
      const fileSlug = entry.name.replace(/^\d+-/, "").replace(/\.md$/, "");
      slugs.push(prefix ? `${prefix}/${fileSlug}` : fileSlug);
    }
  }
  return slugs;
}
async function getEnumeratedRoutes() {
  try {
    return await collectSlugs(DOCS_DIR);
  } catch {
    return [];
  }
}
buildCallback(async () => {
  const entries = [];
  async function walk(dir, prefix = "") {
    let dirEntries;
    try {
      dirEntries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of dirEntries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const dirSlug = entry.name.replace(/^\d+-/, "");
        const newPrefix = prefix ? `${prefix}/${dirSlug}` : dirSlug;
        await walk(fullPath, newPrefix);
      } else if (entry.name.endsWith(".md")) {
        const fileSlug = entry.name.replace(/^\d+-/, "").replace(/\.md$/, "");
        const slug = prefix ? `${prefix}/${fileSlug}` : fileSlug;
        try {
          const source = await readFile(fullPath, "utf-8");
          const { title, toc } = parseMd(source);
          const headings = toc.map((item) => ({ text: item.label, id: item.id }));
          const excerpt = source.split("\n").filter(
            (l) => l.trim() && !l.startsWith("#") && !l.startsWith("```") && !l.startsWith("|") && !/^(\s*[-*+] )/.test(l) && !/^\d+\. /.test(l) && !/^---+$/.test(l.trim())
          ).join(" ").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[(.+?)\]\(.+?\)/g, "$1").trim().slice(0, 160);
          entries.push({
            slug,
            title: title || slug,
            headings,
            excerpt
          });
        } catch {
          entries.push({ slug, title: slug, headings: [], excerpt: "" });
        }
      }
    }
  }
  await walk(DOCS_DIR);
  const outputPath = join(getOutputDirectory(), "search-index.json");
  await writeFile(outputPath, JSON.stringify(entries));
});
async function Page({ filename }) {
  const slug = filename.join("/");
  const { article: article2, toc } = await DocsContent(slug);
  return [
    ,
    __tags.main(
      { class: "docs-main" },
      article2
    ),
    DocsToc({ items: toc })
  ];
}
var isDynamic = false;
export {
  Page as default,
  getEnumeratedRoutes,
  isDynamic
};
