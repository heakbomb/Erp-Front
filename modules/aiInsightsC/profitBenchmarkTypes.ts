export type ProfitBenchmarkResponse = {
  storeId: number;
  year: number;
  month: number;

  sigungu: string | null;
  industry: string | null;
  repSubCat: string | null;

  sales: number;

  myCogsRate: number;
  myLaborRate: number;
  myCogsAmount: number;
  myLaborAmount: number;
  myProfit: number;
  myProfitRatePct: number;

  benchCogsRate: number;
  benchLaborRate: number;
  benchCogsAmount: number;
  benchLaborAmount: number;
  benchProfit: number;
  benchProfitRatePct: number;

  diffProfit: number;
  diffProfitRatePct: number;

  source: string;
  sampleCount: number;
};
