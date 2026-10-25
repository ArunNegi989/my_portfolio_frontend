"use client";

import { Download, RotateCcw, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { reportSaveError } from "@/lib/admin/errors";
import { adminActions, adminStore, useAdminState, useHydrated } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import type { SiteSettings } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { ImageUrlField, ListEditor, TextArea, TextInput, Toggle } from "../fields";
import { Card, LoadingRows, PageHeader } from "../ui";

const PAGE_IMAGE_LABELS: Record<keyof SiteSettings["pageImages"], string> = {
  projectsHero: "Projects page hero",
  blogHero: "Blog page hero",
  skillsHero: "Skills page hero",
  educationSide: "About page — education image",
};

function SettingsForm({ initial }: { initial: SiteSettings }) {
  const { toast, confirm } = useFeedback();
  const { register, control, handleSubmit, reset, setError, formState: { errors, isDirty, isSubmitting } } = useForm<SiteSettings>({ defaultValues: initial });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adminActions.update("settings", values, "Updated site settings");
      reset(values);
      toast("Settings saved");
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  });

  function exportJson() {
    const blob = new Blob([adminActions.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-content.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Content exported as JSON");
  }

  async function reloadFromServer() {
    if (isDirty) {
      const ok = await confirm({
        title: "Discard unsaved changes?",
        message: "Reloading fetches the latest saved content from the server. Unsaved edits on this screen will be lost.",
        confirmLabel: "Reload",
        danger: true,
      });
      if (!ok) return;
    }
    await adminActions.reload();
    const fresh = adminStore.getSnapshot().state?.settings;
    if (fresh) reset(fresh);
    toast("Content reloaded from the server", "info");
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="General settings"
        description={isDirty ? "You have unsaved changes." : "Site-wide options and data tools."}
        actions={
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>
            <Save size={15} aria-hidden="true" /> {isSubmitting ? "Saving…" : "Save settings"}
          </button>
        }
      />
      <div className={ui.formLayout}>
        <div className={ui.stack}>
          <Card title="Site">
            <div className={ui.stack}>
              <TextInput label="Site name" {...register("siteName", { required: "Required" })} error={errors.siteName?.message} />
              <TextInput label="Tagline" {...register("tagline")} />
              <TextInput label="Site URL" disabled {...register("siteUrl")} hint="Read from NEXT_PUBLIC_SITE_URL (defaults to localhost until a domain is chosen)." />
              <TextInput
                label="WhatsApp number (optional)"
                inputMode="tel"
                placeholder="Digits with country code, e.g. 91XXXXXXXXXX"
                hint="Leave empty to hide the WhatsApp button."
                {...register("whatsappNumber", { pattern: { value: /^\d{8,15}$/, message: "Use 8–15 digits, no spaces or +." } })}
                error={errors.whatsappNumber?.message}
              />
            </div>
          </Card>
          <Card title="Footer" subtitle="Phone, email and social links come from Profile and Social links.">
            <div className={ui.stack}>
              <TextInput label="Oversized headline" {...register("footerHeadline", { required: "Required" })} error={errors.footerHeadline?.message} hint="The last word is drawn in cyan outline." />
              <TextArea label="Collaboration invitation" rows={3} {...register("footerInvitation")} />
              <TextInput label="Contact button label" {...register("footerCtaLabel", { required: "Required" })} error={errors.footerCtaLabel?.message} />
              <Controller control={control} name="footerHighlights" render={({ field }) => <ListEditor label="Roles & technologies" value={field.value} onChange={field.onChange} placeholder="e.g. Next.js" />} />
              <TextInput label="Copyright note" {...register("footerNote")} />
            </div>
          </Card>
          <Card title="Default social sharing image">
            <Controller
              control={control}
              name="defaultOgImage"
              render={({ field }) => <ImageUrlField label="Default share image" value={{ src: field.value, alt: "Default share image" }} onChange={(v) => field.onChange(v.src)} />}
            />
          </Card>
          <Card title="Page imagery">
            <div className={ui.stack}>
              {(Object.keys(PAGE_IMAGE_LABELS) as Array<keyof SiteSettings["pageImages"]>).map((key) => (
                <Controller key={key} control={control} name={`pageImages.${key}` as const} render={({ field }) => <ImageUrlField label={PAGE_IMAGE_LABELS[key]} value={field.value} onChange={field.onChange} />} />
              ))}
            </div>
          </Card>
        </div>
        <div className={cx(ui.stack, ui.sticky)}>
          <Card title="Experience">
            <Controller control={control} name="introEnabled" render={({ field }) => <Toggle label="Cinematic intro" description="Plays on a visitor's first homepage visit" checked={field.value} onChange={field.onChange} />} />
            <Controller
              control={control}
              name="introAudioEnabled"
              render={({ field }) => <Toggle label="Intro audio" description="Off by default. No audio track is bundled yet." checked={field.value} onChange={field.onChange} disabled />}
            />
            <Controller control={control} name="smoothScroll" render={({ field }) => <Toggle label="Smooth scrolling" description="Lenis on desktop pointers; off for reduced motion" checked={field.value} onChange={field.onChange} />} />
          </Card>
          <Card title="Data tools" subtitle="Content is stored in the database.">
            <div className={ui.stack}>
              <button type="button" className={ui.btn} onClick={exportJson}>
                <Download size={15} aria-hidden="true" /> Export content as JSON
              </button>
              <p className={ui.muted} style={{ fontSize: "0.8rem" }}>
                A snapshot of everything in the dashboard, useful as a manual backup.
              </p>
              <button type="button" className={ui.btn} onClick={reloadFromServer}>
                <RotateCcw size={15} aria-hidden="true" /> Reload from server
              </button>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

export default function SettingsScreen() {
  const { settings } = useAdminState();
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingRows rows={8} />;
  return <SettingsForm initial={settings} />;
}
