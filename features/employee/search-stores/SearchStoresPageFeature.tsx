"use client";

import { useSearchStores } from "@/features/employee/search-stores/hooks/useSearchStores";
import SearchStoresView from "@/features/employee/search-stores/components/SearchStoresView";

export default function SearchStoresPageFeature() {
  const state = useSearchStores();

  return (
    <SearchStoresView
      workplaceCode={state.workplaceCode}
      searchResult={state.searchResult}
      appliedStores={state.appliedStores}
      submitting={state.submitting}
      searching={state.searching}
      assignmentStatus={state.assignmentStatus}
      // 함수 prop을 *Action으로 매핑해 전달 (실제 구현은 동일)
      setWorkplaceCodeAction={state.setWorkplaceCode}
      handleSearchAction={state.handleSearch}
      handleApplyAction={state.handleApply}
    />
  );
}