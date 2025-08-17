import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import type { ChartConfiguration } from "chart.js";

const width = 800;
const height = 600;
const backgroundColor = "white";

async function generatePopulationChartBuffer(
  populationPercentages: Record<string, number>
): Promise<Buffer> {
  const labels = Object.keys(populationPercentages);
  const data = labels.map((l) => Number(populationPercentages[l] ?? 0));

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: backgroundColor,
  });

  const configuration: ChartConfiguration<"pie", number[], unknown> = {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map(
            (_, i) => `hsl(${(i * 360) / Math.max(labels.length, 1)},70%,50%)`
          ),
          borderColor: "rgba(255,255,255,0.8)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "right", labels: { boxWidth: 16 } },
        title: {
          display: true,
          text: "Dino population (%)",
          font: { size: 20 },
        },
      },
    },
  };

  const buffer = await chartJSNodeCanvas.renderToBuffer(
    configuration,
    "image/png"
  );

  return buffer;
}

export default generatePopulationChartBuffer;
