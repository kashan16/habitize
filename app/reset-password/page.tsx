import { Suspense } from "react";
import ForgotPasswordPage from "@/components/ForgotPasswordPage";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
