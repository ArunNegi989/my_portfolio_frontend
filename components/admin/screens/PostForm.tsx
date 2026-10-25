"use client";

import { Info, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import Markdown from "@/components/shared/Markdown";
import { reportSaveError } from "@/lib/admin/errors";
import { validateImageSrc } from "@/lib/admin/media";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { parseMarkdown } from "@/lib/markdown";
import { cx, readingTime, slugify } from "@/lib/utils";
import { validateSlug } from "@/lib/validation";
import type { BlogPost } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { ImageUrlField, ListEditor, Select, TextArea, TextInput, Toggle } from "../fields";
import { Card, PageHeader } from "../ui";
import styles from "./PostForm.module.css";

export default function PostForm({ initial, isNew }: { initial: BlogPost; isNew: boolean }) {
  const { posts } = useAdminState();
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BlogPost>({ defaultValues: initial, mode: "onBlur" });

  const values = useWatch({ control }) as BlogPost;
  const takenSlugs = posts.filter((p) => p.id !== initial.id).map((p) => p.slug);
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const blocks = useMemo(() => (tab === "preview" ? parseMarkdown(values.content || "") : []), [tab, values.content]);

  async function onSubmit(data: BlogPost) {
    try {
      const saved = await adminActions.upsert("posts", { ...data, id: isNew ? newId("b") : data.id }, `${isNew ? "Created" : "Updated"} article “${data.title}”`);
      toast(isNew ? "Article created" : "Article saved");
      if (isNew) {
        // Activity keeps this page mounted; start the next visit with a clean form.
        reset(initial);
        setSlugTouched(false);
        router.push(`/admin/blog/${saved.id}`);
      } else {
        reset(saved);
      }
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  }

  async function onDelete() {
    const ok = await confirm({ title: "Delete article?", message: `“${initial.title}” will be permanently deleted.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminActions.remove("posts", initial.id, `Deleted article “${initial.title}”`);
      toast("Article deleted");
      router.push("/admin/blog");
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast("Please fix the highlighted fields", "error"))} noValidate>
      <PageHeader
        title={isNew ? "New article" : `Edit: ${initial.title}`}
        description={isDirty ? "You have unsaved changes." : isNew ? "Drafts stay private until you publish them." : "All changes saved."}
        actions={
          <>
            {!isNew && (
              <button type="button" className={cx(ui.btn, ui.btnDanger)} onClick={onDelete}>
                <Trash2 size={15} aria-hidden="true" /> Delete
              </button>
            )}
            <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>
              <Save size={15} aria-hidden="true" /> {isSubmitting ? "Saving…" : isNew ? "Create article" : "Save changes"}
            </button>
          </>
        }
      />
      <div className={ui.formLayout}>
        <div className={ui.stack}>
          <Card>
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
              <TextInput
                label="Slug"
                hint={`URL: /blog/${values.slug || "…"}`}
                {...register("slug", { validate: (v) => validateSlug(v, takenSlugs), onChange: () => setSlugTouched(true) })}
                error={errors.slug?.message}
              />
              <TextArea label="Excerpt" rows={2} counterMax={220} value={values.excerpt} {...register("excerpt", { required: "Excerpt is required." })} error={errors.excerpt?.message} />
            </div>
          </Card>

          <Card
            title="Content"
            subtitle={`Markdown subset: ## headings, lists, > quotes, \`\`\`code\`\`\`, ![alt](url), **bold**, [links](url) · ~${readingTime(values.content || "")} min read`}
            actions={
              <div className={ui.tabs} role="tablist" aria-label="Editor mode">
                <button type="button" role="tab" aria-selected={tab === "write"} className={cx(ui.tab, tab === "write" && ui.tabActive)} onClick={() => setTab("write")}>
                  Write
                </button>
                <button type="button" role="tab" aria-selected={tab === "preview"} className={cx(ui.tab, tab === "preview" && ui.tabActive)} onClick={() => setTab("preview")}>
                  Preview
                </button>
              </div>
            }
          >
            {tab === "write" ? (
              <TextArea label="Article body" rows={22} className={styles.editor} {...register("content", { required: "Content is required.", minLength: { value: 50, message: "Write at least 50 characters." } })} error={errors.content?.message} />
            ) : (
              <div className={styles.preview}>{blocks.length ? <Markdown blocks={blocks} /> : <p className={ui.muted}>Nothing to preview yet.</p>}</div>
            )}
          </Card>

          <Card title="SEO">
            <div className={ui.stack}>
              <TextInput label="SEO title" counterMax={60} value={values.seoTitle ?? ""} {...register("seoTitle")} placeholder={values.title} />
              <TextArea label="SEO description" rows={2} counterMax={160} value={values.seoDescription ?? ""} {...register("seoDescription")} placeholder={values.excerpt} />
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
              <TextInput label="Publication date" type="date" {...register("publishedAt", { required: "Date is required." })} error={errors.publishedAt?.message} />
              <TextInput label="Category" list="post-categories" {...register("category", { required: "Category is required." })} error={errors.category?.message} />
              <datalist id="post-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Controller control={control} name="tags" render={({ field }) => <ListEditor label="Tags" value={field.value} onChange={field.onChange} placeholder="e.g. Next.js" />} />
              <Controller control={control} name="featured" render={({ field }) => <Toggle label="Featured article" checked={field.value} onChange={field.onChange} />} />
              <TextInput label="Author" {...register("author")} />
            </div>
          </Card>
          <Card title="Cover image">
            <Controller
              control={control}
              name="cover"
              rules={{ validate: (v) => validateImageSrc(v.src, { optional: false }) }}
              render={({ field, fieldState }) => (
                <div className={styles.coverField}>
                  <ImageUrlField label="Cover" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                </div>
              )}
            />
          </Card>
          <div className={cx(ui.notice, ui.noticeInfo)}>
            <Info size={16} aria-hidden="true" />
            <p>Set the status to Published to show the article on the public blog. Drafts are only visible here.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
