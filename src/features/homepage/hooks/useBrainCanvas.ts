import { useEffect, type RefObject } from "react";
import { TAU, fitCanvas, glow, hexA, prefersReducedMotion } from "./canvas";

type Pt = { x: number; y: number };
type Node = Pt & { ph: number; sp: number };

/** Brain artwork coordinate space. */
const BW = 230;
const CORE: Pt = { x: 122, y: 127 };
/** Skill colours, in skill order (match the cobalt/iris/emerald/orchid/azure/pink tones). */
const COLS = ["#2F6BF2", "#7C4DE8", "#12A57A", "#9A55E0", "#2F8BE8", "#E0317A"];
/** Where each skill's pathway enters the brain. */
const DOTS: Pt[] = [{ x: 59, y: 77 }, { x: 28, y: 113 }, { x: 50, y: 144 }, { x: 178, y: 86 }, { x: 194, y: 130 }, { x: 167, y: 157 }];

/** Deterministic neuron layout (seeded PRNG, as in the export's `brainNet()`). */
function buildNetwork() {
  let seedV = 7;
  const rnd = () => {
    seedV = (seedV * 16807) % 2147483647;
    return seedV / 2147483647;
  };
  const nodes: Node[] = [];
  while (nodes.length < 34) {
    const x = 25 + rnd() * 190, y = 40 + rnd() * 130;
    const ex = (x - 120) / 92, ey = (y - 105) / 64;
    if (ex * ex + ey * ey < 1 && y < 168) nodes.push({ x, y, ph: rnd() * 6.28, sp: 0.012 + rnd() * 0.016 });
  }
  const links: [Node, Node][] = [];
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 34) links.push([nodes[i], nodes[j]]);
    }
  // each skill's pathway: its dot -> nearest mid node -> core
  const paths = DOTS.map((d): Pt[] => {
    const mx = (d.x + CORE.x) / 2, my = (d.y + CORE.y) / 2;
    let best = nodes[0], bd = 1e9;
    for (const n of nodes) {
      const q = Math.hypot(n.x - mx, n.y - my);
      if (q < bd) { bd = q; best = n; }
    }
    return [d, best, CORE];
  });
  return { nodes, links, paths };
}

function along(pts: Pt[], p: number): Pt {
  const segs: number[] = [];
  let tot = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segs.push(l);
    tot += l;
  }
  let d = p * tot;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const f = d / segs[i];
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
}

/**
 * Twinkling neurons over the brain image, with signals travelling from the
 * active skill (read from `activeRef` every frame) into the glowing core.
 */
export function useBrainCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, activeRef: RefObject<number>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const box = canvas?.parentElement;
    if (!canvas || !ctx || !box) return;

    const { nodes, links, paths } = buildNetwork();
    const reduce = prefersReducedMotion();
    let w = 0, h = 0, s = 1, raf = 0, t = 0, visible = true;
    let sparks: { a: Node; b: Node; p: number; v: number }[] = [];
    let signals: { i: number; p: number }[] = [];

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      const act = Math.max(0, Math.min(5, activeRef.current | 0));
      const ac = COLS[act];
      // faint synapse web
      ctx.lineWidth = 0.6;
      for (const [a, b] of links) {
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.beginPath(); ctx.moveTo(a.x * s, a.y * s); ctx.lineTo(b.x * s, b.y * s); ctx.stroke();
      }
      // active pathway
      const P = paths[act];
      ctx.strokeStyle = hexA(ac, 0.55);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(P[0].x * s, P[0].y * s);
      for (let i = 1; i < P.length; i++) ctx.lineTo(P[i].x * s, P[i].y * s);
      ctx.stroke();
      // twinkling neurons
      for (const n of nodes) {
        const tw = 0.45 + 0.55 * Math.max(0, Math.sin(t * n.sp + n.ph));
        glow(ctx, n.x * s, n.y * s, 5 * s * tw + 2, "#FFFFFF", 0.55 * tw);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * tw})`;
        ctx.beginPath(); ctx.arc(n.x * s, n.y * s, 0.9 * s, 0, TAU); ctx.fill();
      }
      if (!reduce) {
        // ambient sparks along random synapses
        if (sparks.length < 3 && Math.random() < 0.025) {
          const l = links[(Math.random() * links.length) | 0];
          const rev = Math.random() < 0.5;
          sparks.push({ a: rev ? l[1] : l[0], b: rev ? l[0] : l[1], p: 0, v: 0.01 + Math.random() * 0.008 });
        }
        sparks = sparks.filter((k) => k.p <= 1);
        for (const k of sparks) {
          k.p += k.v;
          glow(ctx, (k.a.x + (k.b.x - k.a.x) * k.p) * s, (k.a.y + (k.b.y - k.a.y) * k.p) * s, 4 * s, "#FFFFFF", 0.9);
        }
        // signals from the active skill into the core
        if (t % 90 === 0) signals.push({ i: act, p: 0 });
        signals = signals.filter((g) => g.p <= 1 && g.i === act);
        for (const g of signals) {
          g.p += 0.011;
          for (let k = 0; k < 5; k++) {
            const q = along(paths[g.i], Math.max(0, g.p - k * 0.025));
            glow(ctx, q.x * s, q.y * s, (5 - k * 0.7) * s, COLS[g.i], 0.85 - k * 0.15);
          }
          const q = along(paths[g.i], g.p);
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(q.x * s, q.y * s, 1.3 * s, 0, TAU); ctx.fill();
        }
      }
      // core responds in the active colour
      const beat = 0.55 + 0.45 * Math.sin(t * 0.035);
      glow(ctx, CORE.x * s, CORE.y * s, 16 * s * (0.8 + 0.3 * beat), ac, 0.35 * beat);
      glow(ctx, CORE.x * s, CORE.y * s, 6 * s, "#FFFFFF", 0.9);
    };
    const resize = () => {
      const r = fitCanvas(canvas, ctx, box);
      w = r.width;
      h = r.height;
      s = w / BW;
      if (reduce) draw();
    };
    const loop = () => { if (visible) draw(); raf = requestAnimationFrame(loop); };

    const ro = new ResizeObserver(() => resize());
    ro.observe(box);
    const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; });
    io.observe(box);
    resize();
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [canvasRef, activeRef]);
}
