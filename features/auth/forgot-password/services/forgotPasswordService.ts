/**
 * 실제 비밀번호 재설정 메일 발송 API가 붙으면
 * 이 함수 안만 수정하면 됨.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  // TODO: 여기에 axios.post(...) 같은 실제 API 호출 붙이면 됨.
  // 지금은 기존 코드와 동일하게 콘솔 로그만 남김.
  console.log("Password reset for:", email)
}