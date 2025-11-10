// app/owner/subscription/checkout/page.tsx
import CheckoutPageFeature from "@/features/subscription/checkout/CheckoutPageFeature";

export default function Page() {
  // ⭐️ Next.js의 Suspense 경계는 이 page.tsx를 감싸게 됩니다.
  // <Suspense>를 사용해 URL 쿼리 파라미터(useSearchParams)를
  // 읽는 CheckoutPageFeature를 감싸는 것이 좋습니다.
  // (만약 loading.tsx를 사용하지 않는다면 수동으로 추가)

  // 1. (권장) 수동으로 Suspense 추가하기
  // return (
  //   <Suspense fallback={<div>결제 페이지 로딩 중...</div>}>
  //     <CheckoutPageFeature />
  //   </Suspense>
  // );

  // 2. (기존 방식) Suspense 없이 바로 렌더링
  return <CheckoutPageFeature />;
}