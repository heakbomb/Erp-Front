/**
 * Spring Boot의 Page<T> 응답에 대응하는 공용 타입
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * 백엔드 GlobalExceptionHandler의 ErrorResponse와 일치하는 타입
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string>; // 유효성 검사 에러 (필드명: 메시지)
}