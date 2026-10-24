import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import SmartImage from "@/components/shared/SmartImage";
import { cx, formatDate, readingTime } from "@/lib/utils";
import type { BlogPost } from "@/types/content";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: BlogPost;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
}

export default function PostCard({ post, featured = false, headingLevel = "h3" }: PostCardProps) {
  const Heading = headingLevel;
  const href = `/blog/${post.slug}`;
  return (
    <article className={cx(styles.card, featured && styles.featured)}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        <SmartImage src={post.cover.src} alt="" sizes={featured ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 33vw"} className={styles.image} />
      </Link>
      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)} min read</span>
        </p>
        <Heading className={styles.title}>
          <Link href={href}>{post.title}</Link>
        </Heading>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <Link href={href} className={styles.more}>
          Read article <ArrowUpRight size={15} aria-hidden="true" />
          <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  );
}
