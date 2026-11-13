export type EstimateInput = {
  length: number;
  type: "foundation" | "combined" | "plot";
  access: "easy" | "limited";
  landscaped: boolean;
};
export function estimateCost(input: EstimateInput) {
  if (!Number.isFinite(input.length) || input.length < 10 || input.length > 150)
    throw new Error("Ilgis turi būti nuo 10 iki 150 m.");
  const rate = { foundation: [25, 45], combined: [40, 70], plot: [25, 45] }[
    input.type
  ];
  const factor = input.access === "limited" ? 1.25 : 1;
  const fixed = input.landscaped ? [1000, 2500] : [600, 1600];
  const min =
    Math.round((input.length * rate[0] * factor + fixed[0]) / 100) * 100;
  const max =
    Math.round((input.length * rate[1] * factor + fixed[1]) / 100) * 100;
  return { min, max, rate, factor, fixed, length: input.length };
}
