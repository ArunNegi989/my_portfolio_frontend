import { ArrowLeft, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "@/components/auth/Auth.module.css";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      icon={<KeyRound size={22} />}
      eyebrow="Account recovery"
      title="Reset password"
      description="Enter the email address linked to your account. We'll send a single-use link to set a new password."
      footer={
        <Link href="/login" className={styles.link}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
