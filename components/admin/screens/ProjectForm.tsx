"use client";

import { ArrowDown, ArrowUp, Info, Plus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import ProjectCard from "@/components/public/ProjectCard";
import { reportSaveError } from "@/lib/admin/errors";
import { validateImageSrc } from "@/lib/admin/media";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { cx, slugify } from "@/lib/utils";
import { validateSlug, validateUrl, validateWebsiteUrl } from "@/lib/validation";
import type { Project } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { GalleryEditor, ImageUrlField, ListEditor, Select, TextArea, TextInput, Toggle } from "../fields";
import { Card, PageHeader } from "../ui";

interface ProjectFormProps {
  initial: Project;
  isNew: boolean;
}

export default function ProjectForm({ initial, isNew }: ProjectFormProps) {
  const { projects, settings } = useAdminState();
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Project>({ defaultValues: initial, mode: "onBlur" });
  const process = useFieldArray({ control, name: "process" });

  const takenSlugs = projects.filter((p) => p.id !== initial.id).map((p) => p.slug);
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  const preview = useWatch({ control }) as Project;

  async function onSubmit(values: Project) {
    const cleaned: Project = {
      ...values,
      id: isNew ? newId("p") : values.id,
      order: Number(values.order) || projects.length + 1,
      gallery: values.gallery.filter((g) => g.src.trim()),
      liveUrl: values.liveUrl?.trim() || undefined,
      githubUrl: values.githubUrl?.trim() || undefined,
    };
    try {
      const saved = await adminActions.upsert("projects", cleaned, `${isNew ? "Created" : "Updated"} project “${cleaned.title}”`);
      toast(isNew ? "Project created" : "Project saved");
      if (isNew) {
        // Activity keeps this page mounted; start the next visit with a clean form.
        reset(initial);
        setSlugTouched(false);
        router.push(`/admin/projects/${saved.id}`);
      } else {
        reset(saved);
      }
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  }

  async function onDelete() {
    const ok = await confirm({ title: "Delete project?", message: `“${initial.title}” will be permanently deleted.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminActions.remove("projects", initial.id, `Deleted project “${initial.title}”`);
      toast("Project deleted");
      router.push("/admin/projects");
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast("Please fix the highlighted fields", "error"))} noValidate>
      <PageHeader
        title={isNew ? "New project" : `Edit: ${initial.title}`}
        description={isDirty ? "You have unsaved changes." : isNew ? "Drafts stay private until you publish them." : "All changes saved."}
        actions={
          <>
            {!isNew && (
              <button type="button" className={cx(ui.btn, ui.btnDanger)} onClick={onDelete}>
                <Trash2 size={15} aria-hidden="true" /> Delete
              </button>
            )}
            <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>
              <Save size={15} aria-hidden="true" /> {isSubmitting ? "Saving…" : isNew ? "Create project" : "Save changes"}
            </button>
          </>
        }
      />

      <div className={ui.formLayout}>
        <div className={ui.stack}>
          <Card title="Basics">
            <div className={ui.stack}>
              <TextInput
                label="Title"
                {...register("title", {
                  required: "Title is required.",
                  onChange: (e) => {
                    if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: true });
                  },
                })}
                error={errors.title?.message}
              />
              <div className={ui.grid2}>
                <TextInput
                  label="Slug"
                  hint={`URL: /projects/${preview.slug || "…"}`}
                  {...register("slug", { validate: (v) => validateSlug(v, takenSlugs), onChange: () => setSlugTouched(true) })}
                  error={errors.slug?.message}
                />
                <TextInput label="Category" list="project-categories" {...register("category", { required: "Category is required." })} error={errors.category?.message} />
                <datalist id="project-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className={ui.grid2}>
                <TextInput label="Delivered at / context" {...register("context")} placeholder="Company or Freelance" />
                <TextInput label="Period" {...register("period")} placeholder="e.g. Mar 2024 – Oct 2025" />
              </div>
              <TextArea label="Summary (cards)" rows={2} counterMax={200} value={preview.summary} {...register("summary", { required: "Summary is required." })} error={errors.summary?.message} />
              <TextArea label="Overview" rows={3} {...register("overview")} />
            </div>
          </Card>

          <Card title="Case study" subtitle="Keep it factual: only include details and results you can verify.">
            <div className={ui.stack}>
              <TextArea label="Problem statement" rows={3} {...register("problem")} />
              <Controller control={control} name="goals" render={({ field }) => <ListEditor label="Goals" value={field.value} onChange={field.onChange} />} />
              <TextArea label="Solution & implementation" rows={4} {...register("solution")} />
              <Controller control={control} name="features" render={({ field }) => <ListEditor label="Key features" value={field.value} onChange={field.onChange} />} />
              <Controller
                control={control}
                name="technologies"
                rules={{ validate: (v) => v.length > 0 || "Add at least one technology." }}
                render={({ field, fieldState }) => <ListEditor label="Technology stack" value={field.value} onChange={field.onChange} placeholder="e.g. Next.js" error={fieldState.error?.message} />}
              />
              <div>
                <p className={ui.cardTitle} style={{ fontSize: "0.84rem", color: "var(--text-dim)", marginBottom: 8 }}>
                  Development process
                </p>
                <div className={ui.stack}>
                  {process.fields.map((f, i) => (
                    <div key={f.id} className={ui.listRow} style={{ alignItems: "flex-start" }}>
                      <div className={cx(ui.listRowMain, ui.grid2)}>
                        <TextInput label={`Step ${i + 1} title`} {...register(`process.${i}.title` as const, { required: "Required" })} error={errors.process?.[i]?.title?.message} />
                        <TextInput label="Description" {...register(`process.${i}.description` as const)} />
                      </div>
                      <div className={ui.rowActions}>
                        <button type="button" className={ui.iconBtn} disabled={i === 0} onClick={() => process.move(i, i - 1)} aria-label={`Move step ${i + 1} up`}>
                          <ArrowUp size={14} aria-hidden="true" />
                        </button>
                        <button type="button" className={ui.iconBtn} disabled={i === process.fields.length - 1} onClick={() => process.move(i, i + 1)} aria-label={`Move step ${i + 1} down`}>
                          <ArrowDown size={14} aria-hidden="true" />
                        </button>
                        <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => process.remove(i)} aria-label={`Remove step ${i + 1}`}>
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className={ui.btn} style={{ justifySelf: "start" }} onClick={() => process.append({ title: "", description: "" })}>
                    <Plus size={15} aria-hidden="true" /> Add step
                  </button>
                </div>
              </div>
              <Controller
                control={control}
                name="results"
                render={({ field }) => (
                  <ListEditor label="Results & impact (verified only)" value={field.value} onChange={field.onChange} hint="Leave empty if no measurable result has been verified. The section is hidden when empty." />
                )}
              />
            </div>
          </Card>

          <Card title="Media" subtitle="Paste an image URL or upload a file (JPG, PNG, WEBP or GIF, max 5 MB).">
            <div className={ui.stack}>
              <Controller
                control={control}
                name="cover"
                rules={{ validate: (v) => validateImageSrc(v.src, { optional: false }) }}
                render={({ field, fieldState }) => <ImageUrlField label="Cover image" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
              />
              <Controller control={control} name="gallery" render={({ field }) => <GalleryEditor value={field.value} onChange={field.onChange} />} />
              <Controller
                control={control}
                name="representativeImagery"
                render={({ field }) => <Toggle label="Representative imagery" description="Shows a “Representative image” label so stock photos are never mistaken for screenshots." checked={field.value} onChange={field.onChange} />}
              />
            </div>
          </Card>

          <Card title="Links & SEO">
            <div className={ui.stack}>
              <div className={ui.grid2}>
                <TextInput
                  label="Live Website URL"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.com"
                  hint="Add the live website URL so visitors can open this project directly from your portfolio."
                  {...register("liveUrl", { validate: (v) => validateWebsiteUrl(v, [settings.siteUrl, window.location.origin]) })}
                  error={errors.liveUrl?.message}
                />
                <TextInput label="GitHub URL (only if real)" {...register("githubUrl", { validate: (v) => validateUrl(v) })} error={errors.githubUrl?.message} placeholder="https://github.com/…" />
              </div>
              <TextInput label="SEO title" counterMax={60} value={preview.seoTitle ?? ""} {...register("seoTitle")} placeholder={preview.title} />
              <TextArea label="SEO description" rows={2} counterMax={160} value={preview.seoDescription ?? ""} {...register("seoDescription")} placeholder={preview.summary} />
            </div>
          </Card>
        </div>

        <div className={cx(ui.stack, ui.sticky)}>
          <Card title="Publishing">
            <div className={ui.stack}>
              <Select
                label="Status"
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                ]}
                {...register("status")}
              />
              <Controller control={control} name="featured" render={({ field }) => <Toggle label="Featured" description="Highlighted in listings" checked={field.value} onChange={field.onChange} />} />
              <Controller control={control} name="detailsPending" render={({ field }) => <Toggle label="Details pending" description="Shows a note that the case study will be expanded" checked={field.value} onChange={field.onChange} />} />
              <TextInput label="Display order" type="number" min={1} {...register("order", { valueAsNumber: true })} />
            </div>
          </Card>
          <Card title="Live preview" subtitle="How the card appears in listings">
            <div inert>
              <ProjectCard project={{ ...preview, title: preview.title || "Untitled project", summary: preview.summary || "Summary will appear here." }} variant="compact" />
            </div>
          </Card>
          <div className={cx(ui.notice, ui.noticeInfo)}>
            <Info size={16} aria-hidden="true" />
            <p>Set the status to Published to show the project on the public site. Drafts are only visible here.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
