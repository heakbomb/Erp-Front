// components/ui/use-toast.ts
// 최소 구현: 우리 코드에서 toast?.(...) 이렇게 쓰니까
// 없어도 터지지 않게 noop 버전으로 만든다.

type ToastParams = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: (_p: ToastParams) => {
      // 실제 구현 없으면 콘솔로만 찍음
      // console.log("toast:", _p);
    },
  };
}

// shadcn처럼 바로 import { toast } from ... 할 수 있게
export const toast = (p: ToastParams) => {
  // console.log("toast:", p);
};