// shared/hooks/useSearch.ts
"use client";

import { useState, useCallback, ChangeEvent, KeyboardEvent } from "react";

interface UseSearchProps {
  initialValue?: string;
  /**
   * 검색이 실행되었을 때(엔터 or 버튼 클릭) 호출될 콜백입니다.
   * 주로 페이지네이션 초기화나 API 호출 로직을 넣습니다.
   */
  onSearch?: (value: string) => void;
}

export function useSearch({ initialValue = "", onSearch }: UseSearchProps = {}) {
  // 1. input에 표시되는 현재 입력값
  const [keyword, setKeyword] = useState(initialValue);
  
  // 2. 검색 버튼/엔터로 확정된 검색어 (API 요청 시 사용)
  const [activeKeyword, setActiveKeyword] = useState(initialValue);

  // Input 변경 핸들러
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  // 검색 실행 핸들러 (버튼 클릭 시)
  const submitSearch = useCallback(() => {
    const trimmed = keyword.trim();
    setActiveKeyword(trimmed);
    
    // 추가 작업(페이지 초기화 등)이 있다면 실행
    if (onSearch) {
      onSearch(trimmed);
    }
  }, [keyword, onSearch]);

  // 엔터키 핸들러
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitSearch();
    }
  }, [submitSearch]);

  return {
    keyword,           // input value 바인딩용
    setKeyword,        // 직접 값 수정이 필요할 때
    activeKeyword,     // API 쿼리용 (useEffect/useQuery 의존성 배열에 사용)
    handleChange,      // input onChange 바인딩용
    handleKeyDown,     // input onKeyDown 바인딩용
    submitSearch,      // 검색 버튼 onClick 바인딩용
  };
}