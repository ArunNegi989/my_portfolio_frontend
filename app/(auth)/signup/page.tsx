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
      demoNote="Account creation isn't connected to a backend yet, so no account is created and nothing you enter is saved."
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
