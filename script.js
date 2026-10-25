// Theme toggle: remembers the visitor's choice, otherwise follows the OS setting.
(function () {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.dataset.theme = saved;
  } catch (e) {}

  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    drawWalks();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();

// Hero background: a handful of geometric Brownian motion sample paths.
const canvas = document.getElementById("walk");

function drawWalks() {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const styles = getComputedStyle(document.documentElement);
  const faint = styles.getPropertyValue("--walk").trim();
  const strong = styles.getPropertyValue("--walk-strong").trim();

  // Seeded PRNG so the picture is stable across redraws.
  let seed = 20280;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand());

  const steps = 240;
  const paths = 14;
  const mu = 0.04, sigma = 0.22, dt = 1 / steps;

  for (let p = 0; p < paths; p++) {
    let s = 1;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * w;
      const y = h * 0.58 - (Math.log(s) / 0.9) * h * 0.5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      s *= Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * gauss());
    }
    ctx.strokeStyle = p === 0 ? strong : faint;
    ctx.lineWidth = p === 0 ? 1.6 : 1;
    ctx.stroke();
  }
}

drawWalks();
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawWalks, 150);
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawWalks);
