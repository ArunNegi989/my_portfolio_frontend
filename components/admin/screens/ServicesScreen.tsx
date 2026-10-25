"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails can use any host */
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { reportSaveError } from "@/lib/admin/errors";
import { validateImageSrc } from "@/lib/admin/media";
import { adminActions, move, newId, useAdminState } from "@/lib/admin/store";
import { cx, slugify } from "@/lib/utils";
import { validateSlug } from "@/lib/validation";
import type { Service } from "@/types/content";
import ui from "../admin.module.css";
import EditDialog from "../EditDialog";
import { useFeedback } from "../Feedback";
import { ImageUrlField, ListEditor, TextArea, TextInput, Toggle } from "../fields";
import { EmptyState, PageHeader } from "../ui";

function ServiceDialog({ item, isNew, onClose }: { item: Service; isNew: boolean; onClose: () => void }) {
  const { services } = useAdminState();
  const { toast } = useFeedback();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Service>({ defaultValues: item });
  const taken = services.filter((s) => s.id !== item.id).map((s) => s.slug);

  const save = handleSubmit(async (values) => {
    const saved = { ...values, id: isNew ? newId("s") : values.id };
    try {
      await adminActions.upsert("services", saved, `${isNew ? "Added" : "Updated"} service “${saved.title}”`);
      toast(isNew ? "Service added" : "Service saved");
      onClose();
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  });

  return (
    <EditDialog
      open
      title={isNew ? "Add service" : `Edit: ${item.title}`}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          <button type="button" className={ui.btn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <TextInput
        label="Title"
        {...register("title", { required: "Title is required.", onChange: (e) => isNew && setValue("slug", slugify(e.target.value)) })}
        error={errors.title?.message}
      />
      <div className={ui.grid2}>
        <TextInput label="Short title" {...register("shortTitle")} />
        <TextInput label="Anchor slug" {...register("slug", { validate: (v) => validateSlug(v, taken) })} error={errors.slug?.message} />
      </div>
      <TextArea label="Description" rows={3} {...register("description", { required: "Description is required." })} error={errors.description?.message} />
      <Controller control={control} name="deliverables" render={({ field }) => <ListEditor label="Deliverables" value={field.value} onChange={field.onChange} />} />
      <Controller control={control} name="technologies" render={({ field }) => <ListEditor label="Technologies" value={field.value} onChange={field.onChange} />} />
      <Controller
        control={control}
        name="image"
        rules={{ validate: (v) => validateImageSrc(v.src, { optional: false }) }}
        render={({ field, fieldState }) => <ImageUrlField label="Service image" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
      />
      <Controller control={control} name="visible" render={({ field }) => <Toggle label="Visible on the site" checked={field.value} onChange={field.onChange} />} />
    </EditDialog>
  );
}

export default function ServicesScreen() {
  const { services } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [editing, setEditing] = useState<{ item: Service; isNew: boolean } | null>(null);
  const items = [...services].sort((a, b) => a.order - b.order);

  async function reorder(index: number, delta: number) {
    const next = move(items, index, delta).map((s, i) => ({ ...s, order: i + 1 }));
    try {
      await adminActions.replace("services", next, "Reordered services");
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  async function toggleVisible(s: Service) {
    try {
      await adminActions.upsert("services", { ...s, visible: !s.visible }, `${s.visible ? "Hid" : "Showed"} service “${s.title}”`);
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  async function remove(item: Service) {
    const ok = await confirm({ title: "Delete service?", message: `“${item.title}” will be removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminActions.remove("services", item.id, `Deleted service “${item.title}”`);
      toast("Service deleted");
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  const blank: Service = { id: "new", slug: "", title: "", shortTitle: "", description: "", deliverables: [], technologies: [], image: { src: "", alt: "" }, visible: true, order: items.length + 1 };

  return (
    <>
      <PageHeader
        title="Services"
        description="Service categories shown on the homepage, on /services and as contact-form options."
        actions={
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={() => setEditing({ item: blank, isNew: true })}>
            <Plus size={15} aria-hidden="true" /> Add service
          </button>
        }
      />
      {items.length === 0 ? (
        <div className={ui.card}>
          <EmptyState title="No services yet" />
        </div>
      ) : (
        <ul role="list" className={ui.stack} style={{ margin: 0 }}>
          {items.map((s, i) => (
            <li key={s.id} className={ui.listRow}>
              <img src={s.image.src} alt="" className={ui.thumb} loading="lazy" />
              <div className={ui.listRowMain}>
                <p className={ui.cellTitle}>
                  {s.title} {!s.visible && <span className={cx(ui.badge, ui.badgeDraft)}>Hidden</span>}
                </p>
                <p className={ui.cellSub}>#{s.slug} · {s.deliverables.length} deliverables</p>
              </div>
              <div className={ui.rowActions}>
                <button type="button" className={ui.iconBtn} disabled={i === 0} onClick={() => reorder(i, -1)} aria-label={`Move ${s.title} up`}>
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button type="button" className={ui.iconBtn} disabled={i === items.length - 1} onClick={() => reorder(i, 1)} aria-label={`Move ${s.title} down`}>
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={ui.iconBtn}
                  onClick={() => toggleVisible(s)}
                  aria-label={s.visible ? `Hide ${s.title}` : `Show ${s.title}`}
                >
                  {s.visible ? <Eye size={15} aria-hidden="true" /> : <EyeOff size={15} aria-hidden="true" />}
                </button>
                <button type="button" className={ui.iconBtn} onClick={() => setEditing({ item: s, isNew: false })} aria-label={`Edit ${s.title}`}>
                  <Pencil size={15} aria-hidden="true" />
                </button>
                <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => remove(s)} aria-label={`Delete ${s.title}`}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <ServiceDialog key={editing.item.id} item={editing.item} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </>
  );
}
