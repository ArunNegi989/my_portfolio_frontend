"use client";

import { CheckCircle2, Info, Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { validateImageSrc } from "@/lib/admin/localImages";
import { adminActions, useAdminState, useHydrated } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import { validateUrl } from "@/lib/validation";
import type { PageSeo } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { ImagePreview, ImageSourceInput, TextArea, TextInput } from "../fields";
import { Card, LoadingRows, PageHeader } from "../ui";

function SeoForm({ initial }: { initial: PageSeo[] }) {
  const { projects, posts, settings } = useAdminState();
  const { toast } = useFeedback();
  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<{ pages: PageSeo[] }>({ defaultValues: { pages: initial } });
  const pages = useWatch({ control, name: "pages" });

  const onSubmit = handleSubmit(({ pages: next }) => {
    const cleaned = next.map((p) => ({ ...p, canonical: p.canonical?.trim() || undefined, ogImage: p.ogImage?.trim() || undefined }));
    adminActions.replace("seo", cleaned, "Updated SEO settings");
    reset({ pages: cleaned });
    toast("SEO settings saved");
  });

  const missingProjects = projects.filter((p) => p.status === "published" && (!p.seoDescription || !p.seoTitle)).length;
  const missingPosts = posts.filter((p) => p.status === "published" && (!p.seoDescription || !p.seoTitle)).length;

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="SEO"
        description={isDirty ? "You have unsaved changes." : "Titles, descriptions, canonical URLs and social sharing images for each static page."}
        actions={
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>
            <Save size={15} aria-hidden="true" /> Save SEO
          </button>
        }
      />
      <div className={ui.grid2} style={{ marginBottom: 16 }}>
        <div className={cx(ui.notice, ui.noticeInfo)}>
          <Info size={16} aria-hidden="true" />
          <p>
            Base URL: <strong>{settings.siteUrl}</strong>. Set <code>NEXT_PUBLIC_SITE_URL</code> once the production domain is known. Leave canonical
            empty to use the page URL.
          </p>
        </div>
        <div className={ui.notice}>
          {missingProjects + missingPosts > 0 ? <TriangleAlert size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
          <p>
            {missingProjects} projects and {missingPosts} articles fall back to their title/summary for SEO. Override them in{" "}
            <Link href="/admin/projects" style={{ textDecoration: "underline" }}>projects</Link> or <Link href="/admin/blog" style={{ textDecoration: "underline" }}>blog</Link>.
          </p>
        </div>
      </div>
      <div className={ui.stack}>
        {initial.map((page, i) => (
          <Card key={page.id} title={page.label} subtitle={page.path}>
            <div className={ui.formLayout} style={{ gridTemplateColumns: "minmax(0, 1fr) 260px" }}>
              <div className={ui.stack}>
                <TextInput label="Title" counterMax={60} value={pages[i]?.title ?? ""} {...register(`pages.${i}.title` as const, { required: "Title is required." })} error={errors.pages?.[i]?.title?.message} />
                <TextArea label="Description" rows={2} counterMax={160} value={pages[i]?.description ?? ""} {...register(`pages.${i}.description` as const, { required: "Description is required." })} error={errors.pages?.[i]?.description?.message} />
                <div className={ui.grid2}>
                  <TextInput label="Canonical URL (optional)" placeholder={`${settings.siteUrl}${page.path === "/" ? "" : page.path}`} {...register(`pages.${i}.canonical` as const, { validate: (v) => validateUrl(v) })} error={errors.pages?.[i]?.canonical?.message} />
                  <Controller
                    control={control}
                    name={`pages.${i}.ogImage` as const}
                    rules={{ validate: (v) => validateImageSrc(v) }}
                    render={({ field }) => (
                      <ImageSourceInput label="Social image (optional)" placeholder="Defaults to the site image" value={field.value ?? ""} onChange={field.onChange} error={errors.pages?.[i]?.ogImage?.message} />
                    )}
                  />
                </div>
              </div>
              <div>
                <p className={ui.muted} style={{ fontSize: "0.8rem", marginBottom: 6 }}>Share preview</p>
                <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "var(--bg-2)" }}>
                  <ImagePreview src={pages[i]?.ogImage || settings.defaultOgImage} alt="" />
                  <div style={{ padding: 10 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>{pages[i]?.title}</p>
                    <p className={ui.muted} style={{ fontSize: "0.76rem" }}>{(pages[i]?.description ?? "").slice(0, 90)}…</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </form>
  );
}

export default function SeoScreen() {
  const { seo } = useAdminState();
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingRows rows={8} />;
  return <SeoForm initial={seo} />;
}
