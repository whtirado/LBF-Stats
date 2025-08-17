// import { fileURLToPath } from "url";
import type { TextChannel } from "discord.js";
import { AttachmentBuilder } from "discord.js";

// const susImage = fileURLToPath(new URL("../assets/sus.png", import.meta.url));

async function sendUpdatedDinoPopulation(
  channel: TextChannel,
  chartImageBuffer: Buffer<ArrayBufferLike>
) {
  const attachment = new AttachmentBuilder(chartImageBuffer, {
    name: "population.png",
  });

  await channel.send({ files: [attachment] });
}

export default sendUpdatedDinoPopulation;
