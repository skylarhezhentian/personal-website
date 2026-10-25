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

// In-page links glide only after the page has loaded. A smooth scroll that starts while fonts are still
// swapping in stops short, so a link like index.html#honors would miss its section.
addEventListener("load", () => root.classList.add("loaded"));

// A YouTube recording starts as a cover photo. Clicking it swaps in the player and starts the video;
// without JavaScript (or with a modifier key) the cover is a plain link to the video on YouTube.
document.querySelectorAll(".yt-cover").forEach((cover) => {
  cover.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const player = document.createElement("iframe");
    player.src = `https://www.youtube-nocookie.com/embed/${cover.dataset.yt}?autoplay=1&rel=0`;
    player.title = cover.dataset.title;
    player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.referrerPolicy = "strict-origin-when-cross-origin";
    player.allowFullscreen = true;
    cover.replaceWith(player);
    player.focus();
  });
});

// Wave canvases come in two modes.
// "string": a string of length 1 plucked at x = 0.3 and released from rest. Its motion is
//   d'Alembert's solution of the wave equation, u(x, t) = ½ [F(x − ct) + F(x + ct)],
//   where F is the odd, 2-periodic extension of the initial triangle.
// "modes": the same string above its first four normal modes, sin(nπx) cos(nωt).
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PLUCK = 0.3;
const MODES = 4;

function pluckShape(s) {
  let r = ((s % 2) + 2) % 2;
  const sign = r > 1 ? -1 : 1;
  if (r > 1) r = 2 - r;
  return sign * (r <= PLUCK ? r / PLUCK : (1 - r) / (1 - PLUCK));
}

function stringAt(x, ct) {
  return 0.5 * (pluckShape(x - ct) + pluckShape(x + ct));
}

class Wave {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = canvas.dataset.mode || "string";
    this.labels = canvas.dataset.labels !== undefined;
    this.animate = canvas.dataset.animate !== undefined && !reduceMotion;
    this.phase = 0;
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

  colors() {
    const css = getComputedStyle(root);
    const get = (name) => css.getPropertyValue(name).trim();
    return { rose: get("--rose"), roseInk: get("--rose-ink"), muted: get("--muted"), line: get("--line") };
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.font = '11px "DM Mono", ui-monospace, monospace';
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    if (this.mode === "modes") this.drawModes();
    else this.drawString();
  }

  // One plucked string with a short trail of earlier positions, inside a dotted outline
  // of its full range: the string never leaves the starting triangle or its mirror image.
  plucked(x0, len, y0, amp, roseInk, rose, line) {
    const { ctx } = this;
    const ct = this.phase / Math.PI;

    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + len, y0);
    ctx.stroke();

    ctx.setLineDash([2, 5]);
    ctx.strokeStyle = rose;
    ctx.lineWidth = 1.25;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + PLUCK * len, y0 + side * amp);
      ctx.lineTo(x0 + len, y0);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const curve = (t) => {
      ctx.beginPath();
      for (let i = 0; i <= len; i++) {
        const y = y0 - amp * stringAt(i / len, t);
        i === 0 ? ctx.moveTo(x0 + i, y) : ctx.lineTo(x0 + i, y);
      }
    };

    const step = this.animate ? 0.05 : 0.12;
    ctx.strokeStyle = rose;
    ctx.lineWidth = 1.5;
    for (let g = 5; g >= 1; g--) {
      ctx.globalAlpha = 0.75 * (1 - g / 6);
      curve(ct - g * step);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    curve(ct);
    ctx.strokeStyle = roseInk;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = roseInk;
    [x0, x0 + len].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, y0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawString() {
    const { rose, roseInk, line } = this.colors();
    const pad = 8;
    this.plucked(6, this.w - 12, this.h / 2, this.h / 2 - pad - 2, roseInk, rose, line);
  }

  drawModes() {
    const { ctx, w, h } = this;
    const { rose, roseInk, muted, line } = this.colors();
    const pad = 10;
    const labelW = this.labels ? 64 : 0;
    const x0 = labelW;
    const len = w - labelW - 6;

    // The string row gets 1.6 units of height, each mode row gets 1.
    const unit = (h - pad * 2) / (MODES + 1.6);
    const yString = pad + unit * 0.8;
    this.plucked(x0, len, yString, unit * 0.68, roseInk, rose, line);
    if (this.labels) {
      ctx.fillStyle = muted;
      ctx.fillText("u(x, t)", 0, yString);
    }

    for (let n = 1; n <= MODES; n++) {
      const y0 = pad + unit * (1.1 + n);
      const a = unit * 0.36 * Math.cos(n * this.phase);
      ctx.beginPath();
      for (let i = 0; i <= len; i += 2) {
        const y = y0 - a * Math.sin((n * Math.PI * i) / len);
        i === 0 ? ctx.moveTo(x0 + i, y) : ctx.lineTo(x0 + i, y);
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
        ctx.fillText(`n = ${n}`, 0, y0);
      }
    }
  }

  tick(t) {
    if (this.animate && this.visible) {
      this.phase = t * 0.0026;
      this.draw();
    }
  }
}

const staves = [...document.querySelectorAll("canvas.staff")].map((c) => new Wave(c));

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
