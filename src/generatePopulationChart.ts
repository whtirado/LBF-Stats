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
        legend: {
          position: "left",
          labels: {
            boxWidth: 16,
            // generateLabels is the supported hook to customize legend items.
            // Use `any` casts to avoid strict Chart.js typing differences across versions.
            generateLabels: (chart: any) => {
              try {
                const data = chart.data.datasets?.[0]?.data ?? [];
                const bg = chart.data.datasets?.[0]?.backgroundColor ?? [];

                return (chart.data.labels ?? []).map(
                  (label: any, i: number) => {
                    const value = Number(data[i] ?? 0) || 0;
                    const display = Number.isInteger(value)
                      ? String(value)
                      : value.toFixed(1);

                    return {
                      text: `${display}% — ${String(label)}`,
                      fillStyle: Array.isArray(bg) ? bg[i] : bg,
                      hidden: !!(chart.getDataVisibility
                        ? !chart.getDataVisibility(i)
                        : false),
                      index: i,
                    } as any;
                  }
                );
              } catch (e) {
                return [] as any;
              }
            },
          } as any,
        },
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
