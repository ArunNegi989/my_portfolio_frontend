import { Suspense } from "react";
import PostEditor from "@/components/admin/screens/PostEditor";
import { Card, LoadingRows } from "@/components/admin/ui";
import { posts } from "@/data/blog";

export const metadata = { title: "Edit article" };

// Seeded articles are prerendered; ids created in the browser render on demand
// and are resolved from demo storage on the client.
export async function generateStaticParams() {
  return posts.map((p) => ({ id: p.id }));
}

// The id is URL data, so it is read inside Suspense to keep the route's shared App Shell id-independent.
export default function EditPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  return (
    <Suspense
      fallback={
        <Card>
          <LoadingRows rows={6} />
        </Card>
      }
    >
      <EditPostById params={params} />
    </Suspense>
  );
}

async function EditPostById({ params }: Pick<PageProps<"/admin/blog/[id]">, "params">) {
  const { id } = await params;
  return <PostEditor id={id} />;
}
