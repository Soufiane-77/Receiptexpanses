import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

// Utility page with no search value; kept out of the index and the sitemap.
export const metadata: Metadata = {
  title: "Log in · ReceiptExpenses",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
