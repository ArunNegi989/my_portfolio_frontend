"use client";

import Link from "next/link";
import { useAdminState, useHydrated } from "@/lib/admin/store";
import type { Project } from "@/types/content";
import ui from "../admin.module.css";
import { Card, EmptyState, LoadingRows } from "../ui";
import ProjectForm from "./ProjectForm";

function blankProject(order: number): Project {
  return {
    id: "new",
    slug: "",
    title: "",
    category: "",
    context: "",
    summary: "",
    overview: "",
    problem: "",
    goals: [],
    solution: "",
    features: [],
    technologies: [],
    process: [],
    results: [],
    featured: false,
    status: "draft",
    order,
    cover: { src: "", alt: "" },
    gallery: [],
    representativeImagery: true,
    detailsPending: true,
  };
}

/** Loads a project from the dashboard store (or a blank one) and renders the shared form. */
export default function ProjectEditor({ id }: { id?: string }) {
  const { projects } = useAdminState();
  const hydrated = useHydrated();
  const existing = id ? projects.find((p) => p.id === id) : undefined;

  if (!hydrated) {
    return (
      <Card>
        <LoadingRows rows={6} />
      </Card>
    );
  }
  if (id && !existing) {
    return (
      <Card>
        <EmptyState
          title="Project not found"
          message="It may have been deleted."
          action={
            <Link href="/admin/projects" className={ui.btn}>
              Back to projects
            </Link>
          }
        />
      </Card>
    );
  }
  // New projects get their real id when first saved.
  const project = existing ?? blankProject(projects.length + 1);
  return <ProjectForm key={project.id} initial={project} isNew={!existing} />;
}
