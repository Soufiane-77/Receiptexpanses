import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

// Utility page with no search value; kept out of the index and the sitemap.
export const metadata: Metadata = {
  title: "Sign up · ReceiptExpenses",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
