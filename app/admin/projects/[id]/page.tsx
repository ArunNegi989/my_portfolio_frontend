import { Suspense } from "react";
import ProjectEditor from "@/components/admin/screens/ProjectEditor";
import { Card, LoadingRows } from "@/components/admin/ui";
import { projects } from "@/data/projects";

export const metadata = { title: "Edit project" };

// Only the page shell is prerendered (for the seeded ids); other ids render on demand. The project
// itself is always loaded from the API on the client, after the admin session is confirmed.
export async function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

// The id is URL data, so it is read inside Suspense to keep the route's shared App Shell id-independent.
export default function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  return (
    <Suspense
      fallback={
        <Card>
          <LoadingRows rows={6} />
        </Card>
      }
    >
      <EditProjectById params={params} />
    </Suspense>
  );
}

async function EditProjectById({ params }: Pick<PageProps<"/admin/projects/[id]">, "params">) {
  const { id } = await params;
  return <ProjectEditor id={id} />;
}
