"use client";

import { Award, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import type { Certification, Education } from "@/types/content";
import ui from "../admin.module.css";
import EditDialog from "../EditDialog";
import { useFeedback } from "../Feedback";
import { TextInput } from "../fields";
import { Card, EmptyState, PageHeader } from "../ui";

const YEAR = /^(19|20)\d{2}$/;

function EducationDialog({ item, isNew, onClose }: { item: Education; isNew: boolean; onClose: () => void }) {
  const { toast } = useFeedback();
  const { register, handleSubmit, formState: { errors } } = useForm<Education>({ defaultValues: item });
  const save = handleSubmit((values) => {
    const saved = { ...values, id: isNew ? newId("e") : values.id };
    adminActions.upsert("education", saved, `${isNew ? "Added" : "Updated"} education “${saved.degree}”`);
    toast("Education saved");
    onClose();
  });
  return (
    <EditDialog
      open
      title={isNew ? "Add education" : `Edit: ${item.degree}`}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          <button type="button" className={ui.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>Save</button>
        </>
      }
    >
      <div className={ui.grid2}>
        <TextInput label="Degree" {...register("degree", { required: "Degree is required." })} error={errors.degree?.message} />
        <TextInput label="Institution" {...register("institution", { required: "Institution is required." })} error={errors.institution?.message} />
      </div>
      <div className={ui.grid3}>
        <TextInput label="Location" {...register("location")} />
        <TextInput label="Start year" inputMode="numeric" {...register("startYear", { pattern: { value: YEAR, message: "Use a 4-digit year." } })} error={errors.startYear?.message} />
        <TextInput
          label="End year"
          inputMode="numeric"
          {...register("endYear", { pattern: { value: YEAR, message: "Use a 4-digit year." }, validate: (v, all) => !v || !all.startYear || v >= all.startYear || "End year must be after start year." })}
          error={errors.endYear?.message}
        />
      </div>
    </EditDialog>
  );
}

function CertificationDialog({ item, isNew, onClose }: { item: Certification; isNew: boolean; onClose: () => void }) {
  const { toast } = useFeedback();
  const { register, handleSubmit, formState: { errors } } = useForm<Certification>({ defaultValues: item });
  const save = handleSubmit((values) => {
    const saved = { ...values, id: isNew ? newId("c") : values.id };
    adminActions.upsert("certifications", saved, `${isNew ? "Added" : "Updated"} certification “${saved.title}”`);
    toast("Certification saved");
    onClose();
  });
  return (
    <EditDialog
      open
      title={isNew ? "Add certification" : `Edit: ${item.title}`}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          <button type="button" className={ui.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)}>Save</button>
        </>
      }
    >
      <TextInput label="Title" {...register("title", { required: "Title is required." })} error={errors.title?.message} />
      <TextInput label="Issuer (optional)" {...register("issuer")} />
    </EditDialog>
  );
}

export default function EducationScreen() {
  const { education, certifications } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [editEdu, setEditEdu] = useState<{ item: Education; isNew: boolean } | null>(null);
  const [editCert, setEditCert] = useState<{ item: Certification; isNew: boolean } | null>(null);

  async function removeEdu(item: Education) {
    if (!(await confirm({ title: "Delete education?", message: `“${item.degree}, ${item.institution}” will be removed.`, confirmLabel: "Delete", danger: true }))) return;
    adminActions.remove("education", item.id, `Deleted education “${item.degree}”`);
    toast("Education deleted");
  }
  async function removeCert(item: Certification) {
    if (!(await confirm({ title: "Delete certification?", message: `“${item.title}” will be removed.`, confirmLabel: "Delete", danger: true }))) return;
    adminActions.remove("certifications", item.id, `Deleted certification “${item.title}”`);
    toast("Certification deleted");
  }

  return (
    <>
      <PageHeader title="Education & certifications" description="Shown on the About page." />
      <div className={ui.grid2} style={{ alignItems: "start" }}>
        <Card
          title="Education"
          actions={
            <button type="button" className={ui.btn} onClick={() => setEditEdu({ item: { id: "new", degree: "", institution: "", location: "", startYear: "", endYear: "" }, isNew: true })}>
              <Plus size={15} aria-hidden="true" /> Add
            </button>
          }
        >
          {education.length === 0 ? (
            <EmptyState title="No education entries" />
          ) : (
            <ul role="list" className={ui.stack} style={{ margin: 0 }}>
              {education.map((e) => (
                <li key={e.id} className={ui.listRow}>
                  <GraduationCap size={18} aria-hidden="true" color="var(--cyan)" />
                  <div className={ui.listRowMain}>
                    <p className={ui.cellTitle}>{e.degree}</p>
                    <p className={ui.cellSub}>
                      {e.institution}, {e.location} · {e.startYear}–{e.endYear}
                    </p>
                  </div>
                  <button type="button" className={ui.iconBtn} onClick={() => setEditEdu({ item: e, isNew: false })} aria-label={`Edit ${e.degree}`}>
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => removeEdu(e)} aria-label={`Delete ${e.degree}`}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card
          title="Certifications"
          actions={
            <button type="button" className={ui.btn} onClick={() => setEditCert({ item: { id: "new", title: "", issuer: "" }, isNew: true })}>
              <Plus size={15} aria-hidden="true" /> Add
            </button>
          }
        >
          {certifications.length === 0 ? (
            <EmptyState title="No certifications" />
          ) : (
            <ul role="list" className={ui.stack} style={{ margin: 0 }}>
              {certifications.map((c) => (
                <li key={c.id} className={ui.listRow}>
                  <Award size={18} aria-hidden="true" color="var(--lime)" />
                  <div className={ui.listRowMain}>
                    <p className={ui.cellTitle}>{c.title}</p>
                    {c.issuer && <p className={ui.cellSub}>{c.issuer}</p>}
                  </div>
                  <button type="button" className={ui.iconBtn} onClick={() => setEditCert({ item: c, isNew: false })} aria-label={`Edit ${c.title}`}>
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => removeCert(c)} aria-label={`Delete ${c.title}`}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {editEdu && <EducationDialog key={editEdu.item.id} item={editEdu.item} isNew={editEdu.isNew} onClose={() => setEditEdu(null)} />}
      {editCert && <CertificationDialog key={editCert.item.id} item={editCert.item} isNew={editCert.isNew} onClose={() => setEditCert(null)} />}
    </>
  );
}
