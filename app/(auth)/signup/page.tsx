import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "@/components/auth/Auth.module.css";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthCard
      wide
      icon={<UserPlus size={22} />}
      eyebrow="New account"
      title="Create account"
      description="Set up access to the portfolio dashboard."
      note="New accounts don't get dashboard access automatically. An existing administrator has to grant it."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
