import sharp from "sharp";
import { fileURLToPath } from "url";
import { AttachmentBuilder } from "discord.js";

const inputPath = fileURLToPath(
  new URL("../assets/image.png", import.meta.url)
);

async function plotPlayerSUSPoints(susPlayerX: number, susPlayerY: number) {
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error("Image metadata missing width/height");

  // Game scale: (-609000, -609000) is top left, (609000, 609000) is bottom right, (0,0) is center
  const maxGameDistance = 609000;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const scaleX = halfWidth / maxGameDistance;
  const scaleY = halfHeight / maxGameDistance;

  // Project player position to pixel space
  const cx = halfWidth + susPlayerX * scaleX;
  const cy = halfHeight + susPlayerY * scaleY;
  const r = 9;

  // Draw a single red circle for SUS player
  const svgCircle = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="red" stroke="black" stroke-width="2" />`;
  const svgOverlay = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${svgCircle}
    </svg>
  `;

  const susPlayerImageBuffer = await image
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const attachment = new AttachmentBuilder(susPlayerImageBuffer, {
    name: "sus_player.png",
  });

  return attachment;
}

export default plotPlayerSUSPoints;
