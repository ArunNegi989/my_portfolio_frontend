import { LogIn } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "@/components/auth/Auth.module.css";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard
      icon={<LogIn size={22} />}
      eyebrow="Admin access"
      title="Welcome back"
      description="Sign in to manage your portfolio content."
      demoNote="Sign-in isn't connected to a backend yet, so no account is checked and you won't be signed in."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.link}>
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
