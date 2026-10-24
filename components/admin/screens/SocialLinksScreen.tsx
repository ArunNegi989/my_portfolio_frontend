"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm, Controller, useWatch } from "react-hook-form";
import { SocialIcon } from "@/components/shared/BrandIcons";
import { adminActions, newId, useAdminState, useHydrated } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import { validateUrl } from "@/lib/validation";
import type { SocialLink, SocialPlatform } from "@/types/content";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { Select, TextInput, Toggle } from "../fields";
import { LoadingRows, PageHeader } from "../ui";

const PLATFORMS: Array<{ value: SocialPlatform; label: string }> = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

function SocialForm({ initial }: { initial: SocialLink[] }) {
  const { toast } = useFeedback();
  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<{ links: SocialLink[] }>({ defaultValues: { links: initial } });
  const links = useFieldArray({ control, name: "links" });
  const values = useWatch({ control, name: "links" });

  const onSubmit = handleSubmit(({ links: next }) => {
    adminActions.replace("socialLinks", next, "Updated social links");
    reset({ links: next });
    toast("Social links saved");
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="Social links"
        description={isDirty ? "You have unsaved changes." : "Links shown in the footer, contact section and contact page."}
        actions={
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>
            <Save size={15} aria-hidden="true" /> Save links
          </button>
        }
      />
      <ul role="list" className={ui.stack} style={{ margin: 0 }}>
        {links.fields.map((f, i) => (
          <li key={f.id} className={ui.card}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 160px 1fr 2fr auto", gap: 12, alignItems: "end" }} className="social-row">
              <span style={{ paddingBottom: 10, color: "var(--cyan)" }} aria-hidden="true">
                <SocialIcon platform={values[i]?.platform ?? "other"} size={20} />
              </span>
              <Select label="Platform" options={PLATFORMS} {...register(`links.${i}.platform` as const)} />
              <TextInput label="Label" {...register(`links.${i}.label` as const, { required: "Required" })} error={errors.links?.[i]?.label?.message} />
              <TextInput
                label="URL"
                placeholder="https://… or mailto:…"
                {...register(`links.${i}.url` as const, { validate: (v) => validateUrl(v, { optional: false }) })}
                error={errors.links?.[i]?.url?.message}
              />
              <div className={ui.rowActions} style={{ paddingBottom: 4 }}>
                <button type="button" className={ui.iconBtn} disabled={i === 0} onClick={() => links.move(i, i - 1)} aria-label={`Move link ${i + 1} up`}>
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button type="button" className={ui.iconBtn} disabled={i === links.fields.length - 1} onClick={() => links.move(i, i + 1)} aria-label={`Move link ${i + 1} down`}>
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
                <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => links.remove(i)} aria-label={`Remove link ${i + 1}`}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
            <Controller control={control} name={`links.${i}.visible` as const} render={({ field }) => <Toggle label="Visible" checked={field.value} onChange={field.onChange} />} />
          </li>
        ))}
      </ul>
      <button type="button" className={ui.btn} style={{ marginTop: 12 }} onClick={() => links.append({ id: newId("l"), platform: "website", label: "", url: "", visible: true })}>
        <Plus size={15} aria-hidden="true" /> Add link
      </button>
      <style>{`@media (max-width: 900px) { .social-row { grid-template-columns: 1fr !important; } }`}</style>
    </form>
  );
}

export default function SocialLinksScreen() {
  const { socialLinks } = useAdminState();
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingRows rows={5} />;
  return <SocialForm initial={socialLinks} />;
}
