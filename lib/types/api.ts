/**
 * Spring Boot의 Page<T> 응답에 대응하는 공용 타입
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-based 현재 페이지
}