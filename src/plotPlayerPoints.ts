import sharp from "sharp";
import { fileURLToPath } from "url";

const inputPath = fileURLToPath(
  new URL("../assets/image.png", import.meta.url)
);

const outputPath = fileURLToPath(
  new URL("../assets/output.png", import.meta.url)
);

async function plotPlayerPoints(activePlayers: Array<Record<string, any>>) {
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  // New scale: (-609000, -609000) is top left, (609000, 609000) is bottom right, (0,0) is center
  const maxGameDistance = 609000;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const scaleX = halfWidth / maxGameDistance;
  const scaleY = halfHeight / maxGameDistance;

  const svgCircles = activePlayers
    .map(({ x, y, color, member }) => {
      const cx = halfWidth + x * scaleX;
      const cy = halfHeight + y * scaleY;

      return `<circle cx="${cx}" cy="${cy}" r="8" fill="${
        member === "Unknown" ? "purple" : "red"
      }" stroke="black" stroke-width="2" />`;
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

export default plotPlayerPoints;
