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

// Staff canvases come in two modes.
// "harmonics": five strings, each vibrating in its nth harmonic,
//   y = (A / n) · sin(nπx / L) · cos(nωt). Dots mark the nodes.
// "fourier": a square wave rebuilt from its first four odd harmonics,
//   f(x) = (4/π) Σ sin(nx) / n for n = 1, 3, 5, 7, with each basis wave
//   below it and the magnitude spectrum (1/n) on the right.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FOURIER_TERMS = [1, 3, 5, 7];

class Staff {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.mode = canvas.dataset.mode || "harmonics";
    this.labels = canvas.dataset.labels !== undefined;
    this.animate = canvas.dataset.animate !== undefined && !reduceMotion;
    this.phase = this.mode === "fourier" ? 0 : 0.15 * Math.PI;
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
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.font = '11px "DM Mono", ui-monospace, monospace';
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
    if (this.mode === "fourier") this.drawFourier();
    else this.drawHarmonics();
  }

  drawHarmonics() {
    const { ctx, w, h } = this;
    const { rose, roseInk, muted } = this.colors();
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
        ctx.fillText(n === 1 ? "f" : `${n}f`, 0, y0);
      }
    }
  }

  drawFourier() {
    const { ctx, w, h } = this;
    const { rose, roseInk, muted, line } = this.colors();
    const narrow = w < 600;
    const pad = 10;
    const labelW = this.labels ? (narrow ? 46 : 58) : 0;
    const specW = Math.round(Math.min(180, Math.max(88, w * 0.16)));
    const gapX = narrow ? 18 : 36;
    const x0 = labelW;
    const len = w - labelW - specW - gapX;

    // Rows: the sum gets 1.5 units of height, each basis wave gets 1.
    const unit = (h - pad * 2) / 5.5;
    const cycles = Math.max(1, Math.min(2.5, len / 380));
    const k = (2 * Math.PI * cycles) / len;
    const rows = [{ y: pad + unit * 0.75, n: 0, label: "f(x)" }].concat(
      FOURIER_TERMS.map((n, i) => ({ y: pad + unit * (2 + i), n, label: n === 1 ? "sin x" : `sin ${n}x` }))
    );

    rows.forEach((row) => {
      ctx.beginPath();
      for (let x = 0; x <= len; x++) {
        const t = k * x - this.phase;
        let v;
        if (row.n === 0) {
          v = 0;
          for (const n of FOURIER_TERMS) v += Math.sin(n * t) / n;
          v *= (4 / Math.PI) * unit * 0.55;
        } else {
          v = Math.sin(row.n * t) * unit * 0.36;
        }
        x === 0 ? ctx.moveTo(x0 + x, row.y - v) : ctx.lineTo(x0 + x, row.y - v);
      }
      ctx.strokeStyle = row.n === 0 ? roseInk : rose;
      ctx.lineWidth = row.n === 0 ? 2 : 1.5;
      ctx.stroke();

      if (this.labels) {
        ctx.fillStyle = muted;
        ctx.fillText(row.label, 0, row.y);
      }
    });

    // Divider between the time domain and the frequency domain.
    const divX = Math.round(x0 + len + gapX / 2) + 0.5;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(divX, pad);
    ctx.lineTo(divX, h - pad);
    ctx.stroke();

    // Magnitude spectrum: one stem per harmonic, height 1/n.
    const sx0 = x0 + len + gapX;
    const sx1 = w - 2;
    const base = h - pad - 16;
    const top = pad + 22;
    ctx.beginPath();
    ctx.moveTo(sx0, base + 0.5);
    ctx.lineTo(sx1, base + 0.5);
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.fillText("spectrum", sx0, pad + 4);
    ctx.textAlign = "center";
    FOURIER_TERMS.forEach((n, i) => {
      const sx = Math.round(sx0 + ((i + 0.5) * (sx1 - sx0)) / FOURIER_TERMS.length) + 0.5;
      const sy = base - (base - top) / n;
      ctx.strokeStyle = roseInk;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, base);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      ctx.fillStyle = roseInk;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = muted;
      ctx.fillText(n === 1 ? "f" : `${n}f`, sx, base + 10);
    });
    ctx.textAlign = "left";
  }

  tick(t) {
    if (this.animate && this.visible) {
      this.phase = this.mode === "fourier" ? t * 0.0005 : 0.15 * Math.PI + t * 0.0011;
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
