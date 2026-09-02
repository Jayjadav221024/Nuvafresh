import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isLand } from '../../data/worldLandMask';

/* ═══════════════════════════════════════════════════════════════════
   EARTH GLOBE
   An orthographic globe drawn on a canvas. The dots are real land —
   sampled from a half-degree Natural Earth land mask — so the coastlines
   that turn past are the actual coastlines. Everything that makes it read
   as a sphere is lighting, not perspective: dots dim and shrink as
   they lean away from the viewer, a fixed light source above and to
   the left throws a terminator across the far side, and a thin band
   of atmosphere sits on the limb.

   Drag to spin it. The pins are the data.
═══════════════════════════════════════════════════════════════════ */

const RAD = Math.PI / 180;
/* Degrees between dot rings. Finer than about 4px of screen spacing and
   the dots smear into a solid mass, so the lattice coarsens with the
   globe rather than being fixed. */
const stepFor = (size) => (size >= 380 ? 1.15 : size >= 290 ? 1.5 : 2.1);
const SPIN_PER_SEC = 4.2;      // degrees of idle rotation per second
const SHADE_BUCKETS = 7;       // distinct dot brightnesses — lets us batch fills

/* Light direction in view space: above, left, and in front of the camera. */
const LIGHT = (() => {
  const [x, y, z] = [-0.42, 0.46, 0.78];
  const len = Math.hypot(x, y, z);
  return { x: x / len, y: y / len, z: z / len };
})();

/* Land has to stay clearly darker (light theme) or clearly brighter
   (dark theme) than the ocean under it at every point of the terminator,
   or the continents dissolve into the water. */
const PALETTE = {
  light: {
    oceanHi: [219, 239, 253],
    oceanLo: [132, 183, 218],
    landDim: [64, 116, 152],
    landLit: [10, 62, 104],
    atmosphere: [120, 186, 232],
    rim: [255, 255, 255],
    night: [12, 40, 66],
    nightStrength: 0.24,
    pin: [232, 97, 143],
    pinCore: [255, 255, 255]
  },
  dark: {
    oceanHi: [24, 58, 84],
    oceanLo: [7, 22, 36],
    landDim: [34, 88, 116],
    landLit: [124, 214, 248],
    atmosphere: [64, 154, 208],
    rim: [168, 222, 255],
    night: [2, 8, 16],
    nightStrength: 0.44,
    pin: [255, 123, 166],
    pinCore: [255, 255, 255]
  }
};

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;
const mix = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t)
];
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
/* Smooth 0→1 ramp; used to fade things out as they reach the limb. */
const ease = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
/* Shortest signed distance between two angles, so the globe never
   takes the long way round when it eases toward a location. */
const angleDelta = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;

const useIsDark = () => {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setDark(el.classList.contains('dark')));
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
};

const EarthGlobe = ({ locations = [], maxSize = 460, focus = null }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const dark = useIsDark();

  const [size, setSize] = useState(maxSize);
  const [hover, setHover] = useState(null);

  /* Live values the animation loop owns — kept off state so a frame
     never costs a React render. */
  const view = useRef({ spin: 78, tilt: 9, dragging: false, idleAt: 0, px: 0, py: 0 });
  const hitsRef = useRef([]);
  const focusRef = useRef(null);

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  /* The land lattice: rings of points spaced evenly over the sphere —
     each ring's population falls off with cos(latitude) so the spacing
     stays even instead of crowding at the poles — keeping only the
     points that land on land. Rebuilt only when the detail step changes. */
  const step = stepFor(size);
  const land = useMemo(() => {
    const out = [];
    for (let lat = -84; lat <= 84; lat += step) {
      const cosLat = Math.cos(lat * RAD);
      const ring = Math.max(8, Math.round((360 / step) * cosLat));
      for (let i = 0; i < ring; i += 1) {
        const lng = -180 + (i * 360) / ring;
        if (!isLand(lat, lng)) continue;
        out.push(Math.sin(lat * RAD), cosLat, lng * RAD);
      }
    }
    return new Float32Array(out);
  }, [step]);

  const pins = useMemo(
    () => locations.filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number'),
    [locations]
  );
  const pinsRef = useRef(pins);
  pinsRef.current = pins;

  /* Searching down to a single location swings the globe over to it. */
  useEffect(() => {
    focusRef.current = focus && typeof focus.lng === 'number' ? focus : null;
  }, [focus]);

  /* Fit the canvas to whatever width the card gives us. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const resize = () => setSize(Math.max(220, Math.min(maxSize, Math.floor(el.clientWidth))));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const C = PALETTE[dark ? 'dark' : 'light'];
    const shades = Array.from({ length: SHADE_BUCKETS }, (_, i) =>
      rgba(mix(C.landDim, C.landLit, i / (SHADE_BUCKETS - 1)), 1)
    );

    /* Scratch space for the dot batches, allocated once so a frame
       never asks the collector for anything. */
    const buckets = Array.from({ length: SHADE_BUCKETS }, () => new Float32Array(land.length));
    const counts = new Int32Array(SHADE_BUCKETS);

    const cx = size / 2;
    const cy = size / 2;
    const R = size / 2 - size * 0.055;   // leave room for the atmosphere
    const dotBase = Math.max(0.6, R * step * RAD * 0.34);   // ~⅔ of the gap to its neighbour

    let raf = 0;
    let last = performance.now();

    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const v = view.current;
      const target = focusRef.current;

      if (target) {
        // Ease onto the searched location and hold there.
        v.spin += angleDelta(v.spin, target.lng) * Math.min(1, dt * 3.2);
        v.tilt += (clamp(target.lat * 0.55, -35, 45) - v.tilt) * Math.min(1, dt * 3.2);
      } else if (!v.dragging && !reduceMotion && now - v.idleAt > 900) {
        v.spin = (v.spin + SPIN_PER_SEC * dt) % 360;
      }

      const spinRad = v.spin * RAD;
      const sinT = Math.sin(v.tilt * RAD);
      const cosT = Math.cos(v.tilt * RAD);

      const project = (latDeg, lngDeg) => {
        const cosLat = Math.cos(latDeg * RAD);
        const l = lngDeg * RAD - spinRad;
        const x = cosLat * Math.sin(l);
        const y = Math.sin(latDeg * RAD);
        const z = cosLat * Math.cos(l);
        const y2 = y * cosT - z * sinT;
        const z2 = y * sinT + z * cosT;
        return { x: cx + R * x, y: cy - R * y2, nz: z2 };
      };

      ctx.clearRect(0, 0, size, size);

      /* ── Atmosphere: a soft shell just outside the sphere ── */
      const halo = ctx.createRadialGradient(cx, cy, R * 0.94, cx, cy, R * 1.16);
      halo.addColorStop(0, rgba(C.atmosphere, 0));
      halo.addColorStop(0.28, rgba(C.atmosphere, dark ? 0.34 : 0.28));
      halo.addColorStop(1, rgba(C.atmosphere, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.16, 0, Math.PI * 2);
      ctx.fill();

      /* ── Ocean: a sphere lit from the light's side ── */
      const lit = ctx.createRadialGradient(
        cx + LIGHT.x * R * 0.55, cy - LIGHT.y * R * 0.55, R * 0.08,
        cx, cy, R * 1.06
      );
      lit.addColorStop(0, rgba(C.oceanHi, 1));
      lit.addColorStop(0.62, rgba(mix(C.oceanHi, C.oceanLo, 0.7), 1));
      lit.addColorStop(1, rgba(C.oceanLo, 1));
      ctx.fillStyle = lit;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      /* ── Land ── */
      counts.fill(0);
      for (let i = 0; i < land.length; i += 3) {
        const sinLat = land[i];
        const cosLat = land[i + 1];
        const l = land[i + 2] - spinRad;
        const z = cosLat * Math.cos(l);
        const y2 = sinLat * cosT - z * sinT;
        const z2 = sinLat * sinT + z * cosT;
        if (z2 <= 0.015) continue;                       // back of the globe

        const x = cosLat * Math.sin(l);
        const lambert = x * LIGHT.x + y2 * LIGHT.y + z2 * LIGHT.z;
        const limb = ease(0.015, 0.22, z2);
        // Floors on both terms: even the night side and the very edge keep
        // enough contrast to stay readable as coastline.
        const shade = clamp((0.34 + 0.76 * Math.max(0, lambert)) * (0.58 + 0.42 * limb), 0, 1);
        const bucket = Math.min(SHADE_BUCKETS - 1, Math.floor(shade * SHADE_BUCKETS));
        const buf = buckets[bucket];
        let n = counts[bucket];
        buf[n] = cx + R * x;
        buf[n + 1] = cy - R * y2;
        buf[n + 2] = dotBase * (0.5 + 0.6 * z2);
        counts[bucket] = n + 3;
      }

      for (let b = 0; b < SHADE_BUCKETS; b += 1) {
        const n = counts[b];
        if (!n) continue;
        const buf = buckets[b];
        ctx.fillStyle = shades[b];
        ctx.beginPath();
        for (let i = 0; i < n; i += 3) {
          ctx.moveTo(buf[i] + buf[i + 2], buf[i + 1]);
          ctx.arc(buf[i], buf[i + 1], buf[i + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      }

      /* Everything from here on belongs inside the sphere. */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      /* ── Night side: shadow falling away from the light ── */
      const night = ctx.createRadialGradient(
        cx + LIGHT.x * R * 0.7, cy - LIGHT.y * R * 0.7, R * 0.35,
        cx + LIGHT.x * R * 0.7, cy - LIGHT.y * R * 0.7, R * 2.05
      );
      night.addColorStop(0, rgba(C.night, 0));
      night.addColorStop(1, rgba(C.night, C.nightStrength));
      ctx.fillStyle = night;
      ctx.fillRect(0, 0, size, size);

      /* ── Specular sheen where the light meets the surface ── */
      const sheenX = cx + LIGHT.x * R * 0.5;
      const sheenY = cy - LIGHT.y * R * 0.5;
      const sheen = ctx.createRadialGradient(sheenX, sheenY, 0, sheenX, sheenY, R * 0.72);
      sheen.addColorStop(0, rgba(C.rim, dark ? 0.12 : 0.42));
      sheen.addColorStop(1, rgba(C.rim, 0));
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, size, size);

      /* ── Limb light: the bright hairline where the edge catches sun ── */
      ctx.strokeStyle = rgba(C.rim, dark ? 0.5 : 0.75);
      ctx.lineWidth = Math.max(1, R * 0.008);
      ctx.beginPath();
      ctx.arc(cx, cy, R - ctx.lineWidth * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* ── Pins ── */
      const pulse = (now % 2400) / 2400;
      let maxValue = 1;
      for (let i = 0; i < pinsRef.current.length; i += 1) {
        maxValue = Math.max(maxValue, Number(pinsRef.current[i].value) || 0);
      }
      const hits = [];

      pinsRef.current.forEach((loc) => {
        const p = project(loc.lat, loc.lng);
        if (p.nz <= 0.02) return;
        const alpha = ease(0.02, 0.2, p.nz);
        const r = (3.4 + ((Number(loc.value) || 0) / maxValue) * 3.6) * (0.72 + 0.28 * p.nz) * (size / 460);
        hits.push({ x: p.x, y: p.y, r, loc });

        /* A coordinate from a delivery address is a place. One derived from a
           timezone is a country, and drawing it as a solid pin would claim a
           precision we don't have — so it gets an open ring instead. */
        const exact = loc.precision === 'address';

        if (!reduceMotion) {
          ctx.fillStyle = rgba(C.pin, alpha * (exact ? 0.32 : 0.2) * (1 - pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + pulse * r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.shadowColor = rgba(C.pin, alpha * (exact ? 0.9 : 0.5));
        ctx.shadowBlur = r * 2.6;

        if (exact) {
          ctx.fillStyle = rgba(C.pin, alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = rgba(C.pin, alpha * 0.16);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = rgba(C.pin, alpha * 0.95);
          ctx.lineWidth = Math.max(1.1, r * 0.34);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        if (exact) {
          ctx.strokeStyle = rgba(C.pinCore, alpha * (dark ? 0.55 : 0.9));
          ctx.lineWidth = Math.max(1, r * 0.28);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      hitsRef.current = hits;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, dark, land, step, reduceMotion]);

  /* ── Pointer: drag to spin, hover to read a pin ── */
  const onPointerDown = (e) => {
    const v = view.current;
    v.dragging = true;
    v.px = e.clientX;
    v.py = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const v = view.current;
    const rect = e.currentTarget.getBoundingClientRect();

    if (v.dragging) {
      v.spin = (((v.spin - (e.clientX - v.px) * 0.32) % 360) + 360) % 360;
      v.tilt = clamp(v.tilt + (e.clientY - v.py) * 0.22, -60, 70);
      v.px = e.clientX;
      v.py = e.clientY;
      if (hover) setHover(null);
      return;
    }

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const near = hitsRef.current.find((h) => Math.hypot(h.x - mx, h.y - my) <= h.r + 7);
    if (near) {
      setHover({
        x: near.x,
        y: near.y,
        label: near.loc.label,
        value: near.loc.value,
        precision: near.loc.precision
      });
    } else if (hover) {
      setHover(null);
    }
  };

  const endDrag = () => {
    const v = view.current;
    if (!v.dragging) return;
    v.dragging = false;
    v.idleAt = performance.now();
  };

  const summary = pins.length
    ? `Globe showing sessions in ${pins.slice(0, 5).map((p) => p.label).join(', ')}${pins.length > 5 ? ` and ${pins.length - 5} more` : ''}`
    : 'Globe — no located sessions yet';

  return (
    <div ref={wrapRef} className="w-full flex justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={summary}
          className="touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={() => { endDrag(); setHover(null); }}
        />

        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-neutral-900/90 dark:bg-black/85 px-2 py-1 text-[11px] font-medium text-white shadow-lg whitespace-nowrap"
            style={{ left: hover.x, top: hover.y - 10 }}
          >
            {hover.label} · <span className="tabular-nums">{hover.value}</span>
            <span className="text-white/60">
              {hover.precision === 'address'
                ? ' · exact'
                : hover.precision === 'region'
                  ? ' · continent only'
                  : ' · country only'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarthGlobe;
