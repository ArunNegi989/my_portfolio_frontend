"use client";

import Link from "next/link";
import { useAdminState, useHydrated } from "@/lib/admin/store";
import type { BlogPost } from "@/types/content";
import ui from "../admin.module.css";
import { Card, EmptyState, LoadingRows } from "../ui";
import PostForm from "./PostForm";

function blankPost(author: string): BlogPost {
  return {
    id: "new",
    slug: "",
    title: "",
    excerpt: "",
    category: "",
    tags: [],
    cover: { src: "", alt: "" },
    content: "",
    author,
    publishedAt: "",
    status: "draft",
    featured: false,
  };
}

export default function PostEditor({ id }: { id?: string }) {
  const { posts, profile } = useAdminState();
  const hydrated = useHydrated();
  const existing = id ? posts.find((p) => p.id === id) : undefined;

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
          title="Article not found"
          message="It may have been deleted."
          action={
            <Link href="/admin/blog" className={ui.btn}>
              Back to blog
            </Link>
          }
        />
      </Card>
    );
  }
  const post = existing ?? blankPost(profile.name);
  return <PostForm key={post.id} initial={post} isNew={!existing} />;
}
