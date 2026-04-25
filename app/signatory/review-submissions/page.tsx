import { Suspense } from "react";
import ReviewSubmissions from "@/components/signatory/ReviewSubmisssions";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReviewSubmissions />
    </Suspense>
  );
}
