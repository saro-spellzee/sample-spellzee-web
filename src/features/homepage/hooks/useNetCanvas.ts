"use client";

import { useEffect, type RefObject } from "react";
import { TAU, fitCanvas, glow, hexA, prefersReducedMotion } from "./canvas";

type Neuron = { id: number; x: number; y: number; vx: number; vy: number; r: number; c: string; ph: number; fire: number; rest: number };
type Dust = { x: number; y: number; vx: number; vy: number; r: number; c: string };
type Signal = { a: Neuron; b: Neuron; p: number; v: number; e: number };
type Ring = { x: number; y: number; c: string; p: number };
type Pt = { x: number; y: number };

const PALETTE = ["#7C3AED", "#0891B2", "#DB2777", "#D97706", "#2563EB"];
const IW = 1672;
const IH = 941;
const GAP = 84;
const LINK = 200;
const K = 2;
const REFRACT = 110;

/**
 * The hero's firing neural network (the export's `net()`), drawn on the photo's
 * background only. Pointer movement over `[data-hero-host]` fires nearby neurons.
 * Pauses off-screen; draws one static frame under reduced motion.
 */
export function useNetCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const box = canvas?.parentElement;
    const host = canvas?.closest<HTMLElement>("[data-hero-host]");
    if (!canvas || !ctx || !box || !host) return;
    const copy = host.querySelector<HTMLElement>("[data-hero-copy]");

    let w = 0, h = 0, sc = 1, ox = 0, minX = 0, raf = 0, visible = true, t = 0;
    let near: Neuron[] = [], far: Dust[] = [], signals: Signal[] = [], rings: Ring[] = [];
    const mouse = { x: -9999, y: -9999, on: false, px: 0, py: 0 };
    const reduce = prefersReducedMotion();

    // Background only (photo pixel space): wide band above her head, the back-right, never on the child.
    const inPhoto = (ix: number, iy: number) => {
      const hx = (ix - 1130) / 275, hy = (iy - 385) / 290;
      if (hx * hx + hy * hy < 1) return 0;
      if (iy > 460 && ix > 740 && ix < 1610) return 0;
      if (iy < 170) return 1;
      if (ix > 1350) return 1;
      if (ix < 860 && iy < 300) return 1;
      return 0;
    };
    const region = (x: number, y: number) => (x < minX ? 0 : inPhoto((x - ox) / sc, y / sc));
    const scatter = <T extends Pt>(count: number, gap: number, fn: (x: number, y: number, i: number) => T): T[] => {
      const out: T[] = [];
      let tries = 0;
      while (out.length < count && tries < 4000) {
        tries++;
        const x = Math.random() * w, y = Math.random() * h;
        if (!region(x, y) || out.some((n) => Math.hypot(n.x - x, n.y - y) < gap)) continue;
        out.push(fn(x, y, out.length));
      }
      return out;
    };
    const seed = () => {
      signals = [];
      rings = [];
      near = scatter(40, GAP, (x, y, i) => ({ id: i, x, y, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, r: 1.8 + Math.random() * 1.6, c: PALETTE[i % PALETTE.length], ph: Math.random() * 6.28, fire: 0, rest: 0 }));
      far = scatter(34, 46, (x, y) => ({ x, y, vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1, r: 0.8 + Math.random() * 0.8, c: PALETTE[(Math.random() * 5) | 0] }));
    };
    const resize = () => {
      const r = fitCanvas(canvas, ctx, box);
      w = r.width;
      h = r.height;
      const Wa = Math.min(Math.max(w, (h * IW) / IH), h * 2.2);
      sc = Wa / IW;
      ox = w - Wa;
      minX = 0;
      if (copy) {
        const c = copy.getBoundingClientRect();
        if (c.top < r.bottom && c.bottom > r.top && c.right - r.left < w * 0.7) minX = c.right - r.left + 24;
      }
      seed();
      if (reduce) draw();
    };
    // a gentle, stable bend for every synapse, like the flowing paths in the photo
    const ctrl = (a: Neuron, b: Neuron): Pt => {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
      const side = ((a.id * 7 + b.id * 13) % 2 ? 1 : -1) * (a.id < b.id ? 1 : -1);
      return { x: mx - dy * 0.18 * side, y: my + dx * 0.18 * side };
    };
    const qpt = (a: Pt, c: Pt, b: Pt, p: number): Pt => {
      const u = 1 - p;
      return { x: u * u * a.x + 2 * u * p * c.x + p * p * b.x, y: u * u * a.y + 2 * u * p * c.y + p * p * b.y };
    };
    const neighbours = new Map<Neuron, Neuron[]>();
    const fire = (n: Neuron, energy: number, from: Neuron | null) => {
      if (n.rest > 0) return;
      n.fire = 1;
      n.rest = REFRACT;
      rings.push({ x: n.x, y: n.y, c: n.c, p: 0 });
      if (energy <= 0) return;
      for (const m of neighbours.get(n) ?? []) {
        if (m === from || m.rest > 0) continue;
        if (Math.random() < 0.75) signals.push({ a: n, b: m, p: 0, v: 0.014 + Math.random() * 0.008, e: energy - 1 });
      }
    };
    const step = () => {
      mouse.px += ((mouse.on ? (mouse.x - w * 0.7) * -0.012 : 0) - mouse.px) * 0.05;
      mouse.py += ((mouse.on ? (mouse.y - h * 0.4) * -0.012 : 0) - mouse.py) * 0.05;
      for (const n of far) {
        const nx = n.x + n.vx, ny = n.y + n.vy;
        if (!region(nx, ny)) { n.vx *= -1; n.vy *= -1; } else { n.x = nx; n.y = ny; }
      }
      for (const n of near) {
        for (const m of near) {
          if (m === n) continue;
          const dx = n.x - m.x, dy = n.y - m.y, d = Math.hypot(dx, dy);
          if (d > 0 && d < GAP) { const f = ((GAP - d) / GAP) * 0.012; n.vx += (dx / d) * f; n.vy += (dy / d) * f; }
        }
        n.vx *= 0.985; n.vy *= 0.985;
        const sp = Math.hypot(n.vx, n.vy);
        if (sp < 0.07) { n.vx += (Math.random() - 0.5) * 0.03; n.vy += (Math.random() - 0.5) * 0.03; }
        if (sp > 0.5) { n.vx *= 0.9; n.vy *= 0.9; }
        const nx = n.x + n.vx, ny = n.y + n.vy;
        if (nx < 0 || nx > w || ny < 0 || ny > h || !region(nx, ny)) { n.vx *= -1; n.vy *= -1; } else { n.x = nx; n.y = ny; }
        if (n.rest > 0) n.rest--;
        n.fire *= 0.94;
        if (mouse.on && n.rest === 0 && Math.hypot(n.x - mouse.x, n.y - mouse.y) < 55) fire(n, 4, null);
      }
      if (Math.random() < 0.012 && near.length) fire(near[(Math.random() * near.length) | 0], 3, null);
    };
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      if (!reduce) step();
      // far layer: faint, tiny, drifting with a touch of parallax
      ctx.save();
      ctx.translate(mouse.px, mouse.py);
      for (let i = 0; i < far.length; i++) {
        const a = far[i];
        let best: Dust | null = null, bd = 120;
        for (let j = 0; j < far.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(a.x - far[j].x, a.y - far[j].y);
          if (d < bd) { bd = d; best = far[j]; }
        }
        if (best) { ctx.strokeStyle = hexA(a.c, 0.08); ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(best.x, best.y); ctx.stroke(); }
        ctx.fillStyle = hexA(a.c, 0.35); ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, TAU); ctx.fill();
      }
      ctx.restore();
      // near layer: each neuron joins its two nearest neighbours with a soft curve
      neighbours.clear();
      const seen = new Set<string>(), edges: [Neuron, Neuron][] = [];
      for (const a of near) {
        const cand: [number, Neuron][] = [];
        for (const b of near) { if (a === b) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < LINK) cand.push([d, b]); }
        cand.sort((p, q) => p[0] - q[0]);
        for (const [, b] of cand.slice(0, K)) {
          const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
          if (seen.has(key) || !region((a.x + b.x) / 2, (a.y + b.y) / 2)) continue;
          seen.add(key);
          edges.push([a, b]);
          neighbours.set(a, [...(neighbours.get(a) ?? []), b]);
          neighbours.set(b, [...(neighbours.get(b) ?? []), a]);
        }
      }
      for (const [a, b] of edges) {
        const c = ctrl(a, b), hot = Math.max(a.fire, b.fire);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, hexA(a.c, 0.2 + hot * 0.45)); g.addColorStop(1, hexA(b.c, 0.2 + hot * 0.45));
        ctx.strokeStyle = g; ctx.lineWidth = 1 + hot * 0.8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(c.x, c.y, b.x, b.y); ctx.stroke();
      }
      // travelling signals, with a short comet tail
      signals = signals.filter((s) => {
        s.p += s.v;
        const c = ctrl(s.a, s.b);
        for (let k = 0; k < 6; k++) {
          const q = qpt(s.a, c, s.b, Math.max(0, s.p - k * 0.03));
          glow(ctx, q.x, q.y, 7 - k, s.a.c, 0.8 - k * 0.12);
        }
        if (s.p >= 1) { fire(s.b, s.e, s.a); return false; }
        return true;
      });
      // firing rings
      rings = rings.filter((r) => {
        r.p += 0.025;
        ctx.strokeStyle = hexA(r.c, 0.5 * (1 - r.p)); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(r.x, r.y, 4 + r.p * 22, 0, TAU); ctx.stroke();
        return r.p < 1;
      });
      // neurons
      for (const n of near) {
        const tw = 0.6 + 0.4 * Math.sin(t * 0.025 + n.ph);
        glow(ctx, n.x, n.y, n.r * 4 + n.fire * 12, n.c, 0.16 * tw + n.fire * 0.5);
        ctx.fillStyle = hexA(n.c, 0.9);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.fire * 1.5, 0, TAU); ctx.fill();
        if (n.fire > 0.2) { ctx.fillStyle = `rgba(255,255,255,${n.fire})`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 0.6, 0, TAU); ctx.fill(); }
      }
    };
    const loop = () => { if (visible) draw(); raf = requestAnimationFrame(loop); };
    const move = (ev: PointerEvent) => {
      const r = box.getBoundingClientRect();
      mouse.x = ev.clientX - r.left;
      mouse.y = ev.clientY - r.top;
      mouse.on = region(mouse.x, mouse.y) > 0;
    };
    const leave = () => { mouse.on = false; };

    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    const ro = new ResizeObserver(() => resize());
    ro.observe(box);
    const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; });
    io.observe(box);
    resize();
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      ro.disconnect();
      io.disconnect();
    };
  }, [canvasRef]);
}
