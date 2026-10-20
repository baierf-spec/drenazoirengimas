import pricing from "../content/pricing.json";
export interface PriceSource {
  label: string;
  url: string;
  scope: string;
  reviewedAt: string;
}
export const priceReview = {
  modelReviewedAt: pricing.modelReviewedAt,
  marketSources: pricing.marketSources as PriceSource[],
};
