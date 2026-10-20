// Future owner: add only reviewed public URLs that actually support the stated scope/range.
export interface PriceSource {
  label: string;
  url: string;
  scope: string;
  reviewedAt: string;
}
export const priceReview = {
  modelReviewedAt: "2026-10-20",
  marketSources: [] as PriceSource[],
};
