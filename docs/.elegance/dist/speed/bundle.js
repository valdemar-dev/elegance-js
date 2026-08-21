import {
  Navbar
} from "/chunks/chunk-A4SHWCB5.js";

// pages/speed/page.ts
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

export default function __constructor() {
    const _p0 = {};


    const regions  = [[{ __cid: "8xBIPlt", props: _p0, count: 1 }]];
    const handlers = [];
    return { regions: regions, handlers: handlers };
}
