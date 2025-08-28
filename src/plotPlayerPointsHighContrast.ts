import sharp from "sharp";
import { fileURLToPath } from "url";
import isAdminSteamID from "./isAdminSteamID.js";
import { stringUnknown } from "./strings.js";

const inputPath = fileURLToPath(
  new URL("../assets/image_high_contrast.png", import.meta.url)
);

const outputPath = fileURLToPath(
  new URL("../assets/output_high_contrast.png", import.meta.url)
);

async function plotPlayerPointsHighContrast(
  activePlayers: Array<Record<string, any>>
) {
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  // New scale: (-609000, -609000) is top left, (609000, 609000) is bottom right, (0,0) is center
  const maxGameDistance = 609000;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const scaleX = halfWidth / maxGameDistance;
  const scaleY = halfHeight / maxGameDistance;

  // Project player positions to pixel space first
  type Pt = {
    idx: number;
    cx: number;
    cy: number;
    isAdmin: boolean;
    isSUS: boolean;
    r: number; // marker radius
  };

  const points: Pt[] = activePlayers.map(({ x, y, member, steamID }, idx) => {
    const cx = halfWidth + x * scaleX;
    const cy = halfHeight + y * scaleY;
    const isAdmin = isAdminSteamID(steamID);
    const isSUS = member === stringUnknown;
    const r = isSUS ? 9 : 7;
    return { idx, cx, cy, isAdmin, isSUS, r };
  });

  // If many points are close, spread them out around their local centroid
  // Simple DBSCAN-like clustering using a distance threshold in pixels
  const threshold = 10; // pixels considered "too close"
  const visited = new Array(points.length).fill(false);

  function dist2(a: Pt, b: Pt) {
    const dx = a.cx - b.cx;
    const dy = a.cy - b.cy;
    return dx * dx + dy * dy;
  }

  for (let i = 0; i < points.length; i++) {
    if (visited[i]) continue;
    visited[i] = true;
    const cluster = [i];
    // BFS to collect connected points within threshold
    for (let p = 0; p < cluster.length; p++) {
      const aIdx = cluster[p]!;
      for (let j = 0; j < points.length; j++) {
        if (visited[j]) continue;
        const pa = points[aIdx]!;
        const pj = points[j]!;
        if (dist2(pa, pj) <= threshold * threshold) {
          visited[j] = true;
          cluster.push(j);
        }
      }
    }

    if (cluster.length <= 1) continue; // nothing to spread

    // Compute centroid and max marker radius in cluster
    let sx = 0,
      sy = 0,
      maxR = 0;
    for (const idx of cluster) {
      const p = points[idx]!;
      sx += p.cx;
      sy += p.cy;
      if (p.r > maxR) maxR = p.r;
    }
    const cx0 = sx / cluster.length;
    const cy0 = sy / cluster.length;

    // Minimal spacing to avoid overlap between adjacent points (tighter spread)
    const desiredSpacing = 2 * maxR; // remove extra padding to reduce spread
    const n = cluster.length;
    const angleStep = (2 * Math.PI) / n;
    // Radius so that chord length >= desiredSpacing: r >= s/(2*sin(pi/n))
    const baseRingR = Math.max(
      desiredSpacing / 2,
      desiredSpacing / (2 * Math.sin(Math.PI / n))
    );
    // Cap spread to just a few pixels from the centroid
    const maxRingOffsetPx = 4; // tweak: 2-6 px for tighter/looser visual
    const ringR = Math.min(baseRingR, maxRingOffsetPx);
    const startAngle = -Math.PI / 2; // start up for nicer distribution

    // Keep a deterministic order (by original index) for stability across runs
    cluster.sort((a, b) => points[a]!.idx - points[b]!.idx);

    cluster.forEach((ptIndex, k) => {
      const theta = startAngle + k * angleStep;
      const p = points[ptIndex]!;
      p.cx = cx0 + ringR * Math.cos(theta);
      p.cy = cy0 + ringR * Math.sin(theta);
    });
  }

  const svgCircles = points
    // Preserve previous drawing order: draw earlier players later by reversing
    .toReversed()
    .map((pt) => {
      const fill = pt.isSUS ? "red" : pt.isAdmin ? "yellow" : "#39FF14";
      return `<circle cx="${pt.cx}" cy="${pt.cy}" r="${pt.r}" fill="${fill}" stroke="black" stroke-width="2" />`;
    })
    .join("\n");

  // Adjust SVG size to match image
  const svgOverlay = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${svgCircles}
    </svg>
  `;

  await image
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .toFile(outputPath);
}

export default plotPlayerPointsHighContrast;
