export type IndustryCategoryRankItem = {
  industry: string;       // "CHICKEN" | "KOREAN" ...
  categoryName: string;   // menu_item.category_name
  quantity: number;
  shareQty: number;       // %
  rank: number;           // 1..N
  sampleCount: number;    // 표본 매장 수
};

export type IndustrySubCategoryRankItem = {
  industry: string;
  categoryName: string;
  subCategoryName: string;
  quantity: number;
  shareQty: number;   // %
  rank: number;
  sampleCount: number;
};


