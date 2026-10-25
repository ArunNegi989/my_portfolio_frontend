"use client";

import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { reportSaveError } from "@/lib/admin/errors";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { cx, formatRange } from "@/lib/utils";
import type { Experience } from "@/types/content";
import ui from "../admin.module.css";
import EditDialog from "../EditDialog";
import { useFeedback } from "../Feedback";
import { ListEditor, TextArea, TextInput, Toggle } from "../fields";
import { EmptyState, PageHeader } from "../ui";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function ExperienceDialog({ item, isNew, onClose }: { item: Experience; isNew: boolean; onClose: () => void }) {
  const { projects } = useAdminState();
  const { toast } = useFeedback();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Experience & { current: boolean }>({ defaultValues: { ...item, current: item.endDate === null } });
  const current = useWatch({ control, name: "current" });

  const save = handleSubmit(async ({ current: isCurrent, ...values }) => {
    const saved: Experience = { ...values, id: isNew ? newId("x") : values.id, endDate: isCurrent ? null : values.endDate || null, order: Number(values.order) || 1 };
    try {
      await adminActions.upsert("experience", saved, `${isNew ? "Added" : "Updated"} experience “${saved.role} — ${saved.company}”`);
      toast(isNew ? "Experience added" : "Experience saved");
      onClose();
    } catch (err) {
      reportSaveError(err, toast, setError);
    }
  });

  return (
    <EditDialog
      open
      title={isNew ? "Add experience" : `Edit: ${item.role}`}
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
      <div className={ui.grid2}>
        <TextInput label="Role" {...register("role", { required: "Role is required." })} error={errors.role?.message} />
        <TextInput label="Company" {...register("company", { required: "Company is required." })} error={errors.company?.message} />
      </div>
      <div className={ui.grid3}>
        <TextInput label="Location" {...register("location")} />
        <TextInput label="Start (YYYY-MM)" type="month" {...register("startDate", { required: "Start date is required.", pattern: { value: MONTH, message: "Use YYYY-MM." } })} error={errors.startDate?.message} />
        <TextInput
          label="End (YYYY-MM)"
          type="month"
          disabled={current}
          {...register("endDate", {
            validate: (v, all) => all.current || (v && MONTH.test(v) ? (v >= all.startDate || "End must be after start.") : "End date is required (or mark as current)."),
          })}
          error={errors.endDate?.message}
        />
      </div>
      <Controller
        control={control}
        name="current"
        render={({ field }) => (
          <Toggle
            label="Current role"
            checked={field.value}
            onChange={(v) => {
              field.onChange(v);
              if (v) setValue("endDate", null);
            }}
          />
        )}
      />
      <TextArea label="Summary" rows={2} {...register("summary")} />
      <Controller control={control} name="responsibilities" render={({ field }) => <ListEditor label="Responsibilities & achievements" value={field.value} onChange={field.onChange} multiline />} />
      <Controller control={control} name="technologies" render={({ field }) => <ListEditor label="Technologies" value={field.value} onChange={field.onChange} />} />
      <Controller
        control={control}
        name="relatedProjectSlugs"
        render={({ field }) => (
          <fieldset className={ui.card} style={{ padding: 14 }}>
            <legend className={ui.muted} style={{ fontSize: "0.84rem", padding: "0 6px" }}>
              Related projects
            </legend>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
              {projects.map((p) => (
                <label key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.88rem" }}>
                  <input
                    type="checkbox"
                    checked={field.value.includes(p.slug)}
                    onChange={(e) => field.onChange(e.target.checked ? [...field.value, p.slug] : field.value.filter((s) => s !== p.slug))}
                  />
                  {p.title}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      />
      <TextInput label="Display order" type="number" min={1} {...register("order", { valueAsNumber: true })} />
    </EditDialog>
  );
}

export default function ExperienceScreen() {
  const { experience } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [editing, setEditing] = useState<{ item: Experience; isNew: boolean } | null>(null);
  const items = [...experience].sort((a, b) => a.order - b.order);

  async function remove(item: Experience) {
    const ok = await confirm({ title: "Delete experience?", message: `“${item.role} — ${item.company}” will be removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminActions.remove("experience", item.id, `Deleted experience “${item.role} — ${item.company}”`);
      toast("Experience deleted");
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  const blank: Experience = { id: "new", role: "", company: "", location: "", startDate: "", endDate: null, summary: "", responsibilities: [], relatedProjectSlugs: [], technologies: [], order: items.length + 1 };

  return (
    <>
      <PageHeader
        title="Experience"
        description="Roles shown on the experience timeline. Keep entries consistent with your resume."
        actions={
          <button type="button" className={cx(ui.btn, ui.btnPrimary)} onClick={() => setEditing({ item: blank, isNew: true })}>
            <Plus size={15} aria-hidden="true" /> Add experience
          </button>
        }
      />
      {items.length === 0 ? (
        <div className={ui.card}>
          <EmptyState title="No experience entries" message="Add your first role to build the timeline." />
        </div>
      ) : (
        <ul role="list" className={ui.stack} style={{ margin: 0 }}>
          {items.map((item) => (
            <li key={item.id} className={ui.card}>
              <div className={ui.cardHeader} style={{ marginBottom: 8 }}>
                <div>
                  <h2 className={ui.cardTitle} style={{ fontSize: "1.1rem" }}>
                    {item.role}
                  </h2>
                  <p className={ui.cardSubtitle}>
                    {item.company} · <MapPin size={12} aria-hidden="true" style={{ display: "inline", verticalAlign: "-1px" }} /> {item.location} · {formatRange(item.startDate, item.endDate)}
                  </p>
                </div>
                <div className={ui.rowActions}>
                  <button type="button" className={ui.btn} onClick={() => setEditing({ item, isNew: false })}>
                    <Pencil size={14} aria-hidden="true" /> Edit
                  </button>
                  <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => remove(item)} aria-label={`Delete ${item.role}`}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className={ui.muted} style={{ fontSize: "0.9rem" }}>
                {item.summary}
              </p>
              <p className={ui.muted} style={{ fontSize: "0.8rem", marginTop: 8 }}>
                {item.responsibilities.length} responsibilities · {item.relatedProjectSlugs.length} related projects · {item.technologies.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
      {editing && <ExperienceDialog key={editing.item.id} item={editing.item} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </>
  );
}
