import { ArrowLeft, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "@/components/auth/Auth.module.css";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// The token arrives in the URL from the reset email; never leak that URL through the Referer header.
export const metadata: Metadata = { title: "Set a new password", referrer: "no-referrer" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      icon={<KeyRound size={22} />}
      eyebrow="Account recovery"
      title="New password"
      description="Choose a new password for your account. The link in your email works once and expires after 30 minutes."
      footer={
        <Link href="/login" className={styles.link}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to login
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
