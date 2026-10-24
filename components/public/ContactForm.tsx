"use client";

import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { emailPattern } from "@/lib/validation";
import buttonStyles from "@/components/shared/Button.module.css";
import styles from "./ContactForm.module.css";

interface ContactValues {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

interface ContactFormProps {
  email: string;
  projectTypes: string[];
}

/**
 * Validated contact form. There is no backend yet, so submitting is a DEMO:
 * nothing is sent; the visitor is offered a pre-filled email instead.
 */
export default function ContactForm({ email, projectTypes }: ContactFormProps) {
  const [submitted, setSubmitted] = useState<ContactValues | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ defaultValues: { name: "", email: "", projectType: "", message: "" }, mode: "onBlur" });

  async function onSubmit(values: ContactValues) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitted(values);
    reset();
  }

  if (submitted) {
    const subject = encodeURIComponent(`Project inquiry${submitted.projectType ? ` — ${submitted.projectType}` : ""}`);
    const body = encodeURIComponent(`Hi Arun,\n\n${submitted.message}\n\n— ${submitted.name} (${submitted.email})`);
    return (
      <div className={styles.success} role="status">
        <CheckCircle2 size={32} aria-hidden="true" />
        <h3>Thanks, {submitted.name.split(" ")[0]}!</h3>
        <p>
          <strong>Demo mode:</strong> this form is not connected to an email service yet, so your message was <em>not</em> sent.
          Use the button below to send it from your email app.
        </p>
        <div className={styles.successActions}>
          <a href={`mailto:${email}?subject=${subject}&body=${body}`} className={`${buttonStyles.button} ${buttonStyles.primary}`}>
            <Mail size={16} aria-hidden="true" /> Send via email app
          </a>
          <button type="button" className={`${buttonStyles.button} ${buttonStyles.outline}`} onClick={() => setSubmitted(null)}>
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className={styles.demoNote}>Demo form — submissions are not sent until an email service is connected.</p>
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
          })}
        />
        {errors.message && (
          <p id="contact-message-error" className={styles.error}>
            {errors.message.message}
          </p>
        )}
      </div>
      <button type="submit" className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.submit}`} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
