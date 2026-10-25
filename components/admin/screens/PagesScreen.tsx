"use client";

import { ArrowDown, ArrowUp, Info, Save } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { reportSaveError } from "@/lib/admin/errors";
import { adminActions, move, useAdminState, useHydrated } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import type { HomeContent } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { ListEditor, TextArea, TextInput, Toggle } from "../fields";
import { Card, LoadingRows, PageHeader } from "../ui";
import styles from "./PagesScreen.module.css";

/** Fixed-template editor for the homepage: hero copy, section visibility & headings, featured projects. */
function HomeEditor({ initial }: { initial: HomeContent }) {
  const { projects } = useAdminState();
  const { toast } = useFeedback();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<HomeContent>({ defaultValues: initial });
  const sections = useFieldArray({ control, name: "sections" });
  const hero = useWatch({ control }) as HomeContent;

  async function onSubmit(values: HomeContent) {
    try {
      await adminActions.update("home", values, "Updated homepage content");
      reset(values);
      toast("Homepage content saved");
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <PageHeader
        title="Pages & sections"
        description={isDirty ? "You have unsaved changes." : "Edit the homepage template: hero copy, section order of content, visibility and featured work."}
        actions={
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>
            <Save size={15} aria-hidden="true" /> {isSubmitting ? "Saving…" : "Save homepage"}
          </button>
        }
      />
      <div className={ui.formLayout}>
        <div className={ui.stack}>
          <Card title="Hero">
            <div className={ui.stack}>
              <div className={ui.grid2}>
                <TextInput label="Hero name" {...register("heroName", { required: "Required" })} error={errors.heroName?.message} />
                <TextInput label="Cyan label above the name" {...register("heroRole", { required: "Required" })} error={errors.heroRole?.message} />
              </div>
              <Controller
                control={control}
                name="heroRoles"
                rules={{ validate: (v) => v.some((r) => r.trim()) || "Add at least one role." }}
                render={({ field, fieldState }) => (
                  <ListEditor
                    label="Rotating headline roles"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. Next.js Developer"
                    hint="The hero headline cycles through these in order. Visitors who prefer reduced motion see the first one."
                    error={fieldState.error?.message}
                  />
                )}
              />
              <TextInput
                label="Seconds per role"
                type="number"
                min={1.5}
                max={10}
                step={0.5}
                {...register("heroRoleInterval", { valueAsNumber: true, min: { value: 1.5, message: "At least 1.5 seconds." }, max: { value: 10, message: "At most 10 seconds." } })}
                error={errors.heroRoleInterval?.message}
              />
              <TextArea label="Supporting text" rows={2} {...register("heroSupportingText")} />
              <div className={ui.grid2}>
                <TextInput label="Primary CTA label" {...register("primaryCtaLabel")} />
                <TextInput label="Resume CTA label" {...register("secondaryCtaLabel")} />
              </div>
              <Controller control={control} name="techLabels" render={({ field }) => <ListEditor label="Orbiting technology labels" value={field.value} onChange={field.onChange} hint="Shown in the 3D scene and the marquee." />} />
            </div>
          </Card>

          <Card title="Sections" subtitle="Toggle visibility and edit headings. The layout order is fixed by the template.">
            <ul role="list" className={styles.sections}>
              {sections.fields.map((s, i) => (
                <li key={s.id} className={styles.section}>
                  <Controller
                    control={control}
                    name={`sections.${i}.visible` as const}
                    render={({ field }) => <Toggle label={s.label} description={field.value ? "Visible on the homepage" : "Hidden"} checked={field.value} onChange={field.onChange} />}
                  />
                  <div className={ui.grid2}>
                    <TextInput label="Eyebrow" {...register(`sections.${i}.eyebrow` as const)} />
                    <TextInput label="Title" {...register(`sections.${i}.title` as const)} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Contact call-to-action">
            <div className={ui.stack}>
              <TextInput label="Headline" {...register("contactHeadline")} />
              <TextArea label="Text" rows={2} {...register("contactText")} />
            </div>
          </Card>
        </div>

        <div className={cx(ui.stack, ui.sticky)}>
          <Card title="Featured projects" subtitle="Choose and order the projects in the homepage showcase.">
            <Controller
              control={control}
              name="featuredProjectSlugs"
              render={({ field }) => {
                const selected = field.value;
                const available = projects.filter((p) => !selected.includes(p.slug));
                return (
                  <div className={ui.stack}>
                    <ol className={styles.picked}>
                      {selected.map((slug, i) => {
                        const p = projects.find((x) => x.slug === slug);
                        return (
                          <li key={slug} className={ui.listRow}>
                            <span className={styles.pickIndex}>{i + 1}</span>
                            <span className={ui.listRowMain}>{p?.title ?? `${slug} (missing)`}</span>
                            <button type="button" className={ui.iconBtn} disabled={i === 0} onClick={() => field.onChange(move(selected, i, -1))} aria-label={`Move ${p?.title ?? slug} up`}>
                              <ArrowUp size={14} aria-hidden="true" />
                            </button>
                            <button type="button" className={ui.iconBtn} disabled={i === selected.length - 1} onClick={() => field.onChange(move(selected, i, 1))} aria-label={`Move ${p?.title ?? slug} down`}>
                              <ArrowDown size={14} aria-hidden="true" />
                            </button>
                            <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => field.onChange(selected.filter((s) => s !== slug))} aria-label={`Remove ${p?.title ?? slug}`}>
                              ×
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                    {available.length > 0 && (
                      <select
                        className={ui.select}
                        value=""
                        aria-label="Add a featured project"
                        onChange={(e) => e.target.value && field.onChange([...selected, e.target.value])}
                      >
                        <option value="">+ Add a project…</option>
                        {available.map((p) => (
                          <option key={p.id} value={p.slug}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              }}
            />
          </Card>
          <Card title="Hero preview">
            <div className={styles.heroPreview}>
              <span className={styles.previewRole}>{hero.heroRole}</span>
              <span className={styles.previewName}>{hero.heroName}</span>
              <span className={styles.previewHeadline}>{hero.heroRoles?.filter(Boolean).join(" / ")}</span>
            </div>
          </Card>
          <div className={cx(ui.notice, ui.noticeInfo)}>
            <Info size={16} aria-hidden="true" />
            <p>Statistics live under Profile. Saved changes appear on the homepage straight away.</p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function PagesScreen() {
  const { home } = useAdminState();
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingRows rows={8} />;
  return <HomeEditor initial={home} />;
}
