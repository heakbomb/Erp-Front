// features/owner/ai-insights/services/priceOptimizationService.ts

const menuItemsData = [
  {
    id: 1,
    name: "아메리카노",
    currentMaterials: [
      { name: "국산 원두", cost: 800, origin: "국내" },
      { name: "물", cost: 10, origin: "국내" },
    ],
    alternativeMaterials: [
      { name: "스페인산 원두", cost: 600, origin: "스페인" },
      { name: "물", cost: 10, origin: "국내" },
    ],
    currentPrice: 4500,
    currentCost: 810,
    currentMargin: 82.0,
    alternativeCost: 610,
    alternativeMargin: 86.4,
    suggestedPrice: 4300,
  },
  {
    id: 2,
    name: "카페라떼",
    currentMaterials: [
      { name: "국산 원두", cost: 800, origin: "국내" },
      { name: "국산 우유", cost: 500, origin: "국내" },
    ],
    alternativeMaterials: [
      { name: "스페인산 원두", cost: 600, origin: "스페인" },
      { name: "수입 우유", cost: 400, origin: "호주" },
    ],
    currentPrice: 5000,
    currentCost: 1300,
    currentMargin: 74.0,
    alternativeCost: 1000,
    alternativeMargin: 80.0,
    suggestedPrice: 4800,
  },
]

// 나중에 여기만 axios 호출로 교체하면 됨
export function getMenuItems() {
  return menuItemsData
}

export type MenuItem = (typeof menuItemsData)[number]