"use client";

import { ArrowLeft, ArrowRight, Pencil, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import TechIcon from "@/components/shared/TechIcon";
import { reportSaveError } from "@/lib/admin/errors";
import { adminActions, newId, useAdminState } from "@/lib/admin/store";
import { cx } from "@/lib/utils";
import type { Skill, SkillCategory, SkillCategoryKey } from "@/types/content";
import ui from "../admin.module.css";
import EditDialog from "../EditDialog";
import { useFeedback } from "../Feedback";
import { TextArea, TextInput } from "../fields";
import { Card, PageHeader } from "../ui";

function CategoryDialog({ category, onClose }: { category: SkillCategory; onClose: () => void }) {
  const { skillCategories } = useAdminState();
  const { toast } = useFeedback();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SkillCategory>({ defaultValues: category });
  const save = handleSubmit(async (values) => {
    const title = values.title.trim();
    const next = skillCategories.map((c) => (c.key === category.key ? { ...c, title, description: values.description.trim() } : c));
    try {
      await adminActions.update("skillCategories", next, `Updated skill category “${title}”`);
      toast("Category saved");
      onClose();
    } catch (err) {
      reportSaveError(err, toast);
    }
  });
  return (
    <EditDialog
      open
      title={`Edit category: ${category.title}`}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          <button type="button" className={ui.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</button>
        </>
      }
    >
      <TextInput label="Title" {...register("title", { validate: (v) => Boolean(v.trim()) || "Title is required." })} error={errors.title?.message} />
      <TextArea label="Description" rows={2} {...register("description")} hint="Shown under the category title in the public skills showcase." />
    </EditDialog>
  );
}

export default function SkillsScreen() {
  const { skills, skillCategories } = useAdminState();
  const { toast, confirm } = useFeedback();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategoryKey>("frontend");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<SkillCategory | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? skills.filter((s) => s.name.toLowerCase().includes(q)) : skills;
  }, [skills, query]);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter a skill name.");
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.category === category)) return setError("This skill already exists in that category.");
    const order = skills.filter((s) => s.category === category).length + 1;
    setAdding(true);
    try {
      await adminActions.upsert("skills", { id: newId("k"), name: trimmed, category, order }, `Added skill “${trimmed}”`);
      toast(`Added “${trimmed}”`);
      setName("");
      setError("");
    } catch (err) {
      reportSaveError(err, toast);
    } finally {
      setAdding(false);
    }
  }

  async function reorder(skill: Skill, delta: number) {
    const inCat = skills.filter((s) => s.category === skill.category).sort((a, b) => a.order - b.order);
    const index = inCat.findIndex((s) => s.id === skill.id);
    const target = inCat[index + delta];
    if (!target) return;
    const next = skills.map((s) => (s.id === skill.id ? { ...s, order: target.order } : s.id === target.id ? { ...s, order: skill.order } : s));
    try {
      await adminActions.replace("skills", next, `Reordered “${skill.name}”`);
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  async function remove(skill: Skill) {
    if (!(await confirm({ title: "Remove skill?", message: `“${skill.name}” will be removed.`, confirmLabel: "Remove", danger: true }))) return;
    try {
      await adminActions.remove("skills", skill.id, `Removed skill “${skill.name}”`);
      toast(`Removed “${skill.name}”`);
    } catch (err) {
      reportSaveError(err, toast);
    }
  }

  return (
    <>
      <PageHeader title="Skills" description="Technologies grouped by category. Order within a category controls display order. No proficiency ratings by design." />
      <Card title="Add a skill">
        <form
          className={ui.toolbar}
          style={{ marginBottom: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input
            className={ui.select}
            style={{ flex: "1 1 220px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Docker"
            aria-label="Skill name"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "skill-error" : undefined}
          />
          <select className={ui.select} value={category} onChange={(e) => setCategory(e.target.value as SkillCategoryKey)} aria-label="Category">
            {skillCategories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.title}
              </option>
            ))}
          </select>
          <button type="submit" className={cx(ui.btn, ui.btnPrimary)} disabled={adding}>
            <Plus size={15} aria-hidden="true" /> {adding ? "Adding…" : "Add skill"}
          </button>
        </form>
        {error && (
          <p id="skill-error" role="alert" style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: 8 }}>
            {error}
          </p>
        )}
      </Card>

      <div className={ui.toolbar} style={{ marginTop: 16 }}>
        <label className={ui.searchBox}>
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Filter skills</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter skills" />
        </label>
        <span className={ui.muted} style={{ fontSize: "0.85rem" }}>
          {skills.length} skills
        </span>
      </div>

      <div className={ui.grid2}>
        {skillCategories.map((c) => {
          const items = visible.filter((s) => s.category === c.key).sort((a, b) => a.order - b.order);
          return (
            <Card
              key={c.key}
              title={c.title}
              subtitle={`${items.length} shown`}
              actions={
                <button type="button" className={ui.btn} onClick={() => setEditing(c)} aria-label={`Edit category ${c.title}`}>
                  <Pencil size={14} aria-hidden="true" /> Edit
                </button>
              }
            >
              {items.length === 0 ? (
                <p className={ui.muted} style={{ fontSize: "0.88rem" }}>
                  {query ? "No matches." : "No skills in this category."}
                </p>
              ) : (
                <ul role="list" className={ui.chips} style={{ margin: 0 }}>
                  {items.map((s, i) => (
                    <li key={s.id} className={ui.chip}>
                      <button type="button" className={ui.iconBtn} style={{ width: 24, height: 24 }} disabled={i === 0 || Boolean(query)} onClick={() => reorder(s, -1)} aria-label={`Move ${s.name} earlier`}>
                        <ArrowLeft size={12} aria-hidden="true" />
                      </button>
                      <TechIcon name={s.name} size={14} />
                      {s.name}
                      <button type="button" className={ui.iconBtn} style={{ width: 24, height: 24 }} disabled={i === items.length - 1 || Boolean(query)} onClick={() => reorder(s, 1)} aria-label={`Move ${s.name} later`}>
                        <ArrowRight size={12} aria-hidden="true" />
                      </button>
                      <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} style={{ width: 24, height: 24 }} onClick={() => remove(s)} aria-label={`Remove ${s.name}`}>
                        <X size={12} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
      {editing && <CategoryDialog key={editing.key} category={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
