"use client";

import { ExternalLink, FileText, Loader2, Plus, RefreshCw, Save, Trash2, Upload, X } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { errorMessage } from "@/lib/api/client";
import { reportSaveError } from "@/lib/admin/errors";
import { checkResumeFile, formatBytes, uploadResume } from "@/lib/admin/media";
import { adminActions, useAdminState, useHydrated } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import { emailPattern, validateUrl } from "@/lib/validation";
import type { Profile } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { ImageUrlField, ListEditor, TextArea, TextInput, Toggle } from "../fields";
import { Card, LoadingRows, PageHeader } from "../ui";
import styles from "./ProfileScreen.module.css";

/**
 * Upload a resume PDF. Picking a file uploads it straight away (admin-only, checked on the server)
 * and puts its public URL in `resumePath`; saving the profile makes the site's download buttons use it.
 */
function ResumeUploadField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const errorId = useId();
  const [local, setLocal] = useState<{ name: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const problem = checkResumeFile(file);
    if (problem) return setFileError(problem);
    setFileError(undefined);
    setUploading(true);
    try {
      const media = await uploadResume(file);
      setLocal({ name: file.name, size: file.size });
      onChange(media.url);
    } catch (err) {
      setFileError(errorMessage(err, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    setLocal(null);
    setFileError(undefined);
    onChange("");
  }

  const openPicker = () => inputRef.current?.click();
  const fileName = local?.name ?? (value ? decodeURIComponent(value.split("/").pop() || value) : "");
  const message = fileError ?? error;
  const describedBy = message ? `${hintId} ${errorId}` : hintId;

  return (
    <div className={styles.resumeField}>
      <span className={styles.resumeLabel}>Resume</span>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className={styles.hiddenInput} onChange={onFile} tabIndex={-1} aria-hidden="true" />
      {uploading ? (
        <div className={styles.resumeFile} role="status">
          <span className={styles.resumeIcon}>
            <Loader2 size={20} aria-hidden="true" />
          </span>
          <div className={styles.resumeMeta}>
            <span className={styles.resumeName}>Uploading…</span>
          </div>
        </div>
      ) : fileName ? (
        <div className={cx(styles.resumeFile, message && styles.resumeInvalid)}>
          <span className={styles.resumeIcon}>
            <FileText size={20} aria-hidden="true" />
          </span>
          <div className={styles.resumeMeta}>
            <span className={styles.resumeName} title={fileName}>
              {fileName}
            </span>
            <span className={styles.resumeSub}>{local ? `${formatBytes(local.size)} · uploaded, save the profile to use it` : value}</span>
          </div>
          <div className={styles.resumeActions}>
            <a href={value} target="_blank" rel="noopener noreferrer" className={cx(ui.btn, ui.btnGhost)}>
              <ExternalLink size={15} aria-hidden="true" /> View PDF
            </a>
            <button type="button" className={ui.btn} onClick={openPicker} aria-describedby={describedBy}>
              <RefreshCw size={15} aria-hidden="true" /> Replace Resume
            </button>
            <button type="button" className={cx(ui.btn, ui.btnDanger)} onClick={remove}>
              <Trash2 size={15} aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={cx(styles.resumeUpload, message && styles.resumeInvalid)} onClick={openPicker} aria-describedby={describedBy}>
          <span className={styles.resumeIcon}>
            <Upload size={20} aria-hidden="true" />
          </span>
          <span className={styles.resumeUploadText}>
            <strong>Upload Resume PDF</strong>
            <span>PDF only, up to 10 MB</span>
          </span>
        </button>
      )}
      <p id={hintId} className={styles.resumeHint}>
        The PDF uploads as soon as you pick it. Save the profile to make the site&apos;s “Download Resume” buttons use it.
      </p>
      {message && (
        <p id={errorId} className={styles.resumeError} role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

function ProfileForm({ initial }: { initial: Profile }) {
  const { toast } = useFeedback();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Profile>({ defaultValues: initial, mode: "onBlur" });
  const stats = useFieldArray({ control, name: "stats" });
  const summary = useWatch({ control, name: "summary" });

  async function onSubmit(values: Profile) {
    const cleaned = { ...values, stats: values.stats.map((s) => ({ ...s, value: Number(s.value) || 0 })) };
    try {
      await adminActions.update("profile", cleaned, "Updated profile");
      reset(cleaned);
      toast("Profile saved");
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast("Please fix the highlighted fields", "error"))} noValidate>
      <PageHeader
        title="Profile & introduction"
        description={isDirty ? "You have unsaved changes." : "Name, role, summary, contact details and the numbers shown on the homepage."}
        actions={
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>
            <Save size={15} aria-hidden="true" /> {isSubmitting ? "Saving…" : "Save profile"}
          </button>
        }
      />
      <div className={ui.formLayout}>
        <div className={ui.stack}>
          <Card title="Identity">
            <div className={ui.stack}>
              <div className={ui.grid2}>
                <TextInput label="Full name" {...register("name", { required: "Name is required." })} error={errors.name?.message} />
                <TextInput label="Role" {...register("role", { required: "Role is required." })} error={errors.role?.message} />
              </div>
              <TextInput label="Short intro" {...register("intro")} />
              <TextArea label="Professional summary" rows={5} counterMax={500} value={summary} {...register("summary", { required: "Summary is required." })} error={errors.summary?.message} />
              <Controller control={control} name="aboutParagraphs" render={({ field }) => <ListEditor label="About page paragraphs" value={field.value} onChange={field.onChange} multiline />} />
              <Controller control={control} name="focusAreas" render={({ field }) => <ListEditor label="Focus areas" value={field.value} onChange={field.onChange} />} />
            </div>
          </Card>

          <Card title="Homepage statistics" subtitle="Only use numbers you can back up (these come from the resume).">
            <div className={ui.stack}>
              {stats.fields.map((f, i) => (
                <div key={f.id} className={ui.listRow} style={{ alignItems: "flex-end" }}>
                  <div className={ui.listRowMain} style={{ display: "grid", gridTemplateColumns: "100px 80px 1fr", gap: 10 }}>
                    <TextInput label="Value" type="number" {...register(`stats.${i}.value` as const, { valueAsNumber: true, required: true })} />
                    <TextInput label="Suffix" {...register(`stats.${i}.suffix` as const)} placeholder="+" />
                    <TextInput label="Label" {...register(`stats.${i}.label` as const, { required: "Label is required." })} error={errors.stats?.[i]?.label?.message} />
                  </div>
                  <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => stats.remove(i)} aria-label={`Remove statistic ${i + 1}`}>
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button type="button" className={ui.btn} style={{ justifySelf: "start" }} onClick={() => stats.append({ id: `stat-${stats.fields.length + 1}`, value: 0, suffix: "", label: "" })}>
                <Plus size={15} aria-hidden="true" /> Add statistic
              </button>
            </div>
          </Card>

          <Card title="Images" subtitle="Abstract/workspace imagery. Add a real photo of yourself here whenever you like.">
            <div className={ui.stack}>
              <Controller control={control} name="portraitImage" render={({ field }) => <ImageUrlField label="Homepage about image" value={field.value} onChange={field.onChange} />} />
              <Controller control={control} name="aboutImage" render={({ field }) => <ImageUrlField label="About page hero image" value={field.value} onChange={field.onChange} />} />
            </div>
          </Card>
        </div>

        <div className={cx(ui.stack, ui.sticky)}>
          <Card title="Contact & availability">
            <div className={ui.stack}>
              <TextInput label="Email" type="email" {...register("email", { required: "Email is required.", pattern: { value: emailPattern, message: "Enter a valid email." } })} error={errors.email?.message} />
              <TextInput
                label="Phone"
                type="tel"
                inputMode="tel"
                placeholder="+91 84768 98395"
                hint="Shown beside “Let’s Talk” in the header, in the mobile menu and in the footer. Leave empty to hide."
                {...register("phone", { validate: (v) => !v || /^\+?[\d\s()-]{8,20}$/.test(v) || "Use digits, spaces and an optional leading +." })}
                error={errors.phone?.message}
              />
              <TextInput label="Location" {...register("location")} />
              <TextInput label="Availability label" {...register("availability")} />
              <Controller control={control} name="availableForWork" render={({ field }) => <Toggle label="Available for work" description="Shows a green status dot in the hero" checked={field.value} onChange={field.onChange} />} />
              <Controller
                control={control}
                name="resumePath"
                rules={{ validate: (v) => (v ? validateUrl(v) : "Upload a resume PDF.") }}
                render={({ field }) => <ResumeUploadField value={field.value} onChange={field.onChange} error={errors.resumePath?.message} />}
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default function ProfileScreen() {
  const { profile } = useAdminState();
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingRows rows={8} />;
  return <ProfileForm initial={profile} />;
}
