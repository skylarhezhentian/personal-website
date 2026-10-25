// Theme toggle: remembers the visitor's choice, otherwise follows the OS setting.
const root = document.documentElement;
const darkQuery = matchMedia("(prefers-color-scheme: dark)");

document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isDark = root.dataset.theme ? root.dataset.theme === "dark" : darkQuery.matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    staves.forEach((s) => s.draw());
  });
});

document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// Staff: five lines, each a string vibrating in its nth harmonic,
// y = (A / n) · sin(nπx / L) · cos(nωt). Dots mark the nodes.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

class Staff {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.labels = canvas.dataset.labels !== undefined;
    this.animate = canvas.dataset.animate !== undefined && !reduceMotion;
    this.phase = 0.15 * Math.PI;
    this.visible = true;
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  draw() {
    const { ctx, w, h } = this;
    const css = getComputedStyle(root);
    const rose = css.getPropertyValue("--rose").trim();
    const roseInk = css.getPropertyValue("--rose-ink").trim();
    const muted = css.getPropertyValue("--muted").trim();

    ctx.clearRect(0, 0, w, h);
    const pad = 14;
    const gap = (h - pad * 2) / 4;
    const x0 = this.labels ? 40 : 0;
    const len = w - x0;
    const amp = gap * 0.55;

    for (let i = 0; i < 5; i++) {
      const n = i + 1;
      const y0 = pad + i * gap;
      const a = (amp / n) * Math.cos(n * this.phase);

      ctx.beginPath();
      for (let x = 0; x <= len; x += 2) {
        const y = y0 + a * Math.sin((n * Math.PI * x) / len);
        x === 0 ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y);
      }
      ctx.strokeStyle = rose;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = roseInk;
      for (let k = 0; k <= n; k++) {
        ctx.beginPath();
        ctx.arc(x0 + (k * len) / n, y0, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (this.labels) {
        ctx.fillStyle = muted;
        ctx.font = '11px "DM Mono", ui-monospace, monospace';
        ctx.textBaseline = "middle";
        ctx.fillText(n === 1 ? "f" : `${n}f`, 0, y0);
      }
    }
  }

  tick(t) {
    if (this.animate && this.visible) {
      this.phase = 0.15 * Math.PI + t * 0.0011;
      this.draw();
    }
  }
}

const staves = [...document.querySelectorAll("canvas.staff")].map((c) => new Staff(c));

if (staves.some((s) => s.animate)) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const s = staves.find((st) => st.canvas === e.target);
      if (s) s.visible = e.isIntersecting;
    });
  });
  staves.forEach((s) => io.observe(s.canvas));
  const loop = (t) => { staves.forEach((s) => s.tick(t)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => staves.forEach((s) => s.resize()), 120);
});
darkQuery.addEventListener("change", () => staves.forEach((s) => s.draw()));
if (document.fonts) document.fonts.ready.then(() => staves.forEach((s) => s.draw()));
