import { apiClient } from "@/shared/api/apiClient"; // ✅ apiClient 사용

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessNumber: string;
  phone: string;
};

export type SignUpResponse = {
  ownerId: number;
  message: string;
};

// 실제 API 연동 함수
export async function signUpOwner(data: SignUpRequest): Promise<SignUpResponse> {
  try {
    // 실제 백엔드 연결 시:
    // const res = await apiClient.post("/api/auth/register/owner", data); // ✅ apiClient.post로 수정
    // return res.data;

    console.log("📡 SignUp API Stub:", data);

    return {
      ownerId: 1,
      message: "회원가입 완료 (Mock)",
    };
  } catch (e: any) {
    throw new Error(e?.response?.data?.message ?? "회원가입 중 오류가 발생했습니다.");
  }
}