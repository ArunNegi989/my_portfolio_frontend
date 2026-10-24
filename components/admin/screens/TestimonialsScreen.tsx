"use client";

import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import type { Testimonial } from "@/types/content";
import ui from "../admin.module.css";
import EditDialog from "../EditDialog";
import { useFeedback } from "../Feedback";
import { TextArea, TextInput, Toggle } from "../fields";
import { EmptyState, PageHeader } from "../ui";

function TestimonialDialog({ item, isNew, onClose }: { item: Testimonial; isNew: boolean; onClose: () => void }) {
  const { toast } = useFeedback();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Testimonial & { confirmReal: boolean }>({ defaultValues: { ...item, confirmReal: !item.isDemo } });
  const isDemo = useWatch({ control, name: "isDemo" });

  const save = handleSubmit(({ confirmReal, ...values }) => {
    void confirmReal;
    const saved: Testimonial = { ...values, id: isNew ? newId("t") : values.id, visible: values.isDemo ? false : values.visible };
    adminActions.upsert("testimonials", saved, `${isNew ? "Added" : "Updated"} testimonial from ${saved.name}`);
    toast("Testimonial saved");
    onClose();
  });

  return (
    <EditDialog
      open
      title={isNew ? "Add testimonial" : `Edit testimonial: ${item.name}`}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          <button type="button" className={ui.btn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>
            Save
          </button>
        </>
      }
    >
      <div className={ui.grid3}>
        <TextInput label="Name" {...register("name", { required: "Name is required." })} error={errors.name?.message} />
        <TextInput label="Role" {...register("role")} />
        <TextInput label="Company" {...register("company")} />
      </div>
      <TextArea label="Quote" rows={4} {...register("quote", { required: "Quote is required." })} error={errors.quote?.message} />
      <Controller control={control} name="isDemo" render={({ field }) => <Toggle label="Demo entry" description="Demo entries are never shown on the public site." checked={field.value} onChange={field.onChange} />} />
      {!isDemo && (
        <>
          <label className={ui.notice} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              {...register("confirmReal", { validate: (v, all) => all.isDemo || v || "Please confirm this testimonial is real and approved." })}
            />
            <span>I confirm this is a real testimonial and the person approved publishing it.</span>
          </label>
          {errors.confirmReal && (
            <p role="alert" style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
              {errors.confirmReal.message}
            </p>
          )}
          <Controller control={control} name="visible" render={({ field }) => <Toggle label="Visible" description="Ready to display once a testimonials section is added." checked={field.value} onChange={field.onChange} />} />
        </>
      )}
    </EditDialog>
  );
}

export default function TestimonialsScreen() {
  const { testimonials } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [editing, setEditing] = useState<{ item: Testimonial; isNew: boolean } | null>(null);

  async function remove(item: Testimonial) {
    const ok = await confirm({ title: "Delete testimonial?", message: `The entry from ${item.name} will be removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    adminActions.remove("testimonials", item.id, `Deleted testimonial from ${item.name}`);
    toast("Testimonial deleted");
  }

  const blank: Testimonial = { id: "new", name: "", role: "", company: "", quote: "", isDemo: true, visible: false };

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Manage client testimonials. Only add real, approved quotes."
        actions={
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={() => setEditing({ item: blank, isNew: true })}>
            <Plus size={15} aria-hidden="true" /> Add testimonial
          </button>
        }
      />
      <div className={ui.notice} style={{ marginBottom: 16 }}>
        <AlertTriangle size={16} aria-hidden="true" />
        <p>
          No real testimonials have been supplied yet. The entries below are <strong>demo data</strong> to show how this screen works; they are
          never rendered on the public site.
        </p>
      </div>
      {testimonials.length === 0 ? (
        <div className={ui.card}>
          <EmptyState title="No testimonials" message="Add one when a client approves a quote." />
        </div>
      ) : (
        <ul role="list" className={ui.stack} style={{ margin: 0 }}>
          {testimonials.map((t) => (
            <li key={t.id} className={ui.card}>
              <div className={ui.cardHeader} style={{ marginBottom: 10 }}>
                <div>
                  <p className={ui.cardTitle}>
                    {t.name} {t.isDemo ? <span className={cx(ui.badge, ui.badgeDemo)}>Demo data</span> : <span className={cx(ui.badge, ui.badgePublished)}>Real</span>}
                  </p>
                  <p className={ui.cardSubtitle}>{[t.role, t.company].filter(Boolean).join(", ")}</p>
                </div>
                <div className={ui.rowActions}>
                  <button type="button" className={ui.iconBtn} onClick={() => setEditing({ item: t, isNew: false })} aria-label={`Edit testimonial from ${t.name}`}>
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => remove(t)} aria-label={`Delete testimonial from ${t.name}`}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <blockquote className={ui.muted} style={{ margin: 0, fontStyle: "italic" }}>
                “{t.quote}”
              </blockquote>
            </li>
          ))}
        </ul>
      )}
      {editing && <TestimonialDialog key={editing.item.id} item={editing.item} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </>
  );
}
