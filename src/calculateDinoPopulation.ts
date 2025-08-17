function calculateDinoPercentages(
  population: Record<string, number>,
  decimals = 2
): Record<string, number> {
  const total = Object.values(population).reduce((s, n) => s + (n || 0), 0);

  if (total === 0) {
    return Object.fromEntries(
      Object.keys(population).map((k) => [k, 0])
    ) as Record<string, number>;
  }

  const factor = Math.pow(10, decimals);
  const result: Record<string, number> = {};

  for (const [dino, count] of Object.entries(population)) {
    result[dino] = Math.round((count / total) * 100 * factor) / factor;
  }

  return result;
}

export default calculateDinoPercentages;
