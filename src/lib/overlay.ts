import type { LandmarkPoint } from './vision';

// Landmark index pairs defining the mesh web drawn over the face.
const CONNECTIONS: Array<[number, number]> = [
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454],
  [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400],
  [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54],
  [54, 103], [103, 67], [67, 109], [109, 10],
  [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
  [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384], [384, 398], [398, 263],
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409],
  [409, 291], [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405],
  [405, 321], [321, 375], [375, 291],
  [1, 4], [4, 5], [5, 6], [6, 19], [19, 94], [94, 2],
  [105, 107], [107, 336], [336, 334], [334, 46],
];

export interface OverlayTransform {
  offsetX: number; // normalized offsets for mirror + letterboxing
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

export function defaultTransform(): OverlayTransform {
  return { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
}

export function clearCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawOverlay(
  canvas: HTMLCanvasElement,
  points: LandmarkPoint[],
  transform: OverlayTransform,
  opts: { mirrored?: boolean; glow?: number; accent?: string } = {},
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { offsetX, offsetY, scaleX, scaleY } = transform;
  const mirrored = opts.mirrored ?? true;
  const glow = opts.glow ?? 1;
  const accent = opts.accent ?? 'rgba(52, 211, 153,';

  const px = (p: LandmarkPoint) => {
    let nx = (p.x - offsetX) * scaleX;
    const ny = (p.y - offsetY) * scaleY;
    if (mirrored) nx = 1 - nx;
    return { x: nx * canvas.width, y: ny * canvas.height };
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!points.length) return;

  // Mesh web
  ctx.lineWidth = 1;
  for (const [a, b] of CONNECTIONS) {
    const pa = points[a];
    const pb = points[b];
    if (!pa || !pb) continue;
    const p1 = px(pa);
    const p2 = px(pb);
    ctx.strokeStyle = `${accent} ${0.5 * glow})`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Point cloud
  ctx.fillStyle = `${accent} ${0.9 * glow})`;
  for (const p of points) {
    const { x, y } = px(p);
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }

  // Bounding indicator + eye-contact crosshair
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    const { x, y } = px(p);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const pad = 18;
  ctx.strokeStyle = `${accent} ${0.85 * glow})`;
  ctx.lineWidth = 2;
  const r = 14;
  const x0 = minX - pad, y0 = minY - pad, x1 = maxX + pad, y1 = maxY + pad;
  // Corner brackets only
  const corner = (cx: number, cy: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * r, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * r);
    ctx.stroke();
  };
  corner(x0, y0, 1, 1); corner(x1, y0, -1, 1); corner(x0, y1, 1, -1); corner(x1, y1, -1, -1);
}

/** Stylized synthetic-frame renderer used by demo mode. */
export function drawDemoOverlay(
  canvas: HTMLCanvasElement,
  points: Array<{ x: number; y: number }>,
  t: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;
  const yawShift = Math.sin(t * 0.9) * w * 0.015;

  const pt = (p: { x: number; y: number }) => ({ x: p.x * w + yawShift, y: p.y * h });

  // Breathing glow ring behind the mesh
  const breath = 0.5 + Math.sin(t * 1.4) * 0.5;
  const grad = ctx.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, w * 0.42);
  grad.addColorStop(0, `rgba(52, 211, 153, ${0.06 + breath * 0.05})`);
  grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.lineWidth = 1;
  for (const [a, b] of CONNECTIONS) {
    const pa = points[a];
    const pb = points[b];
    if (!pa || !pb) continue;
    const p1 = pt(pa);
    const p2 = pt(pb);
    const pulse = 0.25 + 0.35 * Math.abs(Math.sin(t * 2 + a * 0.05));
    ctx.strokeStyle = `rgba(110, 231, 183, ${pulse})`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(167, 243, 208, 0.95)';
  for (const p of points) {
    const { x, y } = pt(p);
    const size = 1.4 + Math.abs(Math.sin(t * 3 + p.x * 20)) * 1.2;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  // Corner brackets
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    const { x, y } = pt(p);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const pad = 22;
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
  ctx.lineWidth = 2;
  const r = 16;
  const x0 = minX - pad, y0 = minY - pad, x1 = maxX + pad, y1 = maxY + pad;
  const corner = (cx: number, cy: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * r, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * r);
    ctx.stroke();
  };
  corner(x0, y0, 1, 1); corner(x1, y0, -1, 1); corner(x0, y1, 1, -1); corner(x1, y1, -1, -1);
}
