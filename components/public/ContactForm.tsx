"use client";

import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api, ApiError, errorMessage } from "@/lib/api/client";
import { emailPattern } from "@/lib/validation";
import buttonStyles from "@/components/shared/Button.module.css";
import styles from "./ContactForm.module.css";

interface ContactValues {
  name: string;
  email: string;
  projectType: string;
  message: string;
  /** Honeypot: hidden from people, filled in by bots. */
  website: string;
}

interface ContactFormProps {
  email: string;
  projectTypes: string[];
}

function mailtoHref(to: string, values: ContactValues) {
  const subject = encodeURIComponent(`Project inquiry${values.projectType ? ` — ${values.projectType}` : ""}`);
  const body = encodeURIComponent(`Hi Arun,\n\n${values.message}\n\n— ${values.name} (${values.email})`);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/** Validated contact form. Messages are stored by the backend and forwarded to the site owner by email. */
export default function ContactForm({ email, projectTypes }: ContactFormProps) {
  const [sentName, setSentName] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ message: string; values: ContactValues } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ defaultValues: { name: "", email: "", projectType: "", message: "", website: "" }, mode: "onBlur" });

  async function onSubmit(values: ContactValues) {
    setFailure(null);
    try {
      await api.post("/contact", values, { auth: false });
      setSentName(values.name);
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        for (const issue of err.details) {
          if (issue.field === "name" || issue.field === "email" || issue.field === "message") setError(issue.field, { type: "server", message: issue.message });
        }
      }
      setFailure({ message: errorMessage(err, "Your message couldn't be sent. Please try again."), values });
    }
  }

  if (sentName !== null) {
    return (
      <div className={styles.success} role="status">
        <CheckCircle2 size={32} aria-hidden="true" />
        <h3>Thanks, {sentName.split(" ")[0]}!</h3>
        <p>Your message has been sent. I&apos;ll get back to you soon, usually within a couple of days.</p>
        <div className={styles.successActions}>
          <button type="button" className={`${buttonStyles.button} ${buttonStyles.outline}`} onClick={() => setSentName(null)}>
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name", { required: "Please enter your name.", minLength: { value: 2, message: "Name is too short." } })}
          />
          {errors.name && (
            <p id="contact-name-error" className={styles.error}>
              {errors.name.message}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email", {
              required: "Please enter your email.",
              pattern: { value: emailPattern, message: "Please enter a valid email address." },
            })}
          />
          {errors.email && (
            <p id="contact-email-error" className={styles.error}>
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-type">What do you need? (optional)</label>
        <select id="contact-type" {...register("projectType")}>
          <option value="">Select a service</option>
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
          <option value="Full-time role">Full-time role</option>
          <option value="Something else">Something else</option>
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          rows={5}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          {...register("message", {
            required: "Please tell me a little about your idea.",
            minLength: { value: 20, message: "Please write at least 20 characters." },
            maxLength: { value: 5000, message: "Please keep your message under 5000 characters." },
          })}
        />
        {errors.message && (
          <p id="contact-message-error" className={styles.error}>
            {errors.message.message}
          </p>
        )}
      </div>
      {/* Honeypot: off-screen and hidden from assistive tech; real visitors never fill it in. */}
      <div aria-hidden="true" className={styles.honeypot}>
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      {failure && (
        <div className={`${styles.error} ${styles.sendError}`} role="alert">
          <span>
            <AlertCircle size={16} aria-hidden="true" style={{ verticalAlign: "-3px", marginRight: 6 }} />
            {failure.message}
          </span>
          <a href={mailtoHref(email, failure.values)}>
            <Mail size={15} aria-hidden="true" /> Send it from your email app instead
          </a>
        </div>
      )}
      <button type="submit" className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.submit}`} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
