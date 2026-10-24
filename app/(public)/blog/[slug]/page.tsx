import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PostCard from "@/components/public/PostCard";
import ReadingProgress from "@/components/public/ReadingProgress";
import ShareLinks from "@/components/public/ShareLinks";
import TableOfContents from "@/components/public/TableOfContents";
import ContactCta from "@/components/public/sections/ContactCta";
import Markdown from "@/components/shared/Markdown";
import SmartImage from "@/components/shared/SmartImage";
import TagList from "@/components/shared/TagList";
import { posts as allPostData } from "@/data/blog";
import { getPostBySlug, getPosts, getSettings } from "@/lib/data";
import { getToc, parseMarkdown } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, cx, formatDate, readingTime } from "@/lib/utils";
import styles from "./article.module.css";

export async function generateStaticParams() {
  return allPostData.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.cover.src,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

// The route's App Shell is shared by every link to /blog/[slug], so it must not read the slug.
// Everything that depends on it resolves inside the Suspense boundary.
export default function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleDetails params={params} />
    </Suspense>
  );
}

function ArticleSkeleton() {
  return (
    <div className={styles.article} aria-busy="true">
      <span className="sr-only">Loading article…</span>
      <header className={`container ${styles.header}`}>
        <Link href="/blog" className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" /> All articles
        </Link>
        <div aria-hidden="true">
          <span className={cx(styles.skeleton, styles.skeletonMeta)} />
          <span className={cx(styles.skeleton, styles.skeletonTitle)} />
          <span className={cx(styles.skeleton, styles.skeletonText)} />
        </div>
      </header>
      <div className="container" aria-hidden="true">
        <div className={cx(styles.coverImage, styles.skeleton)} />
      </div>
    </div>
  );
}

async function ArticleDetails({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const [post, all, settings] = await Promise.all([getPostBySlug(slug), getPosts(), getSettings()]);
  if (!post) notFound();

  const blocks = parseMarkdown(post.content);
  const toc = getToc(blocks);
  const index = all.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index < all.length - 1 ? all[index + 1] : null;
  const related = all
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category) || b.tags.filter((t) => post.tags.includes(t)).length - a.tags.filter((t) => post.tags.includes(t)).length)
    .slice(0, 3);
  const url = absoluteUrl(settings.siteUrl, `/blog/${post.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover.src,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author },
    mainEntityOfPage: url,
  };

  return (
    <article className={styles.article}>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className={`container ${styles.header}`}>
        <Link href="/blog" className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" /> All articles
        </Link>
        <p className={styles.category}>{post.category}</p>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.intro}>{post.excerpt}</p>
        <div className={styles.meta}>
          <span className={styles.author}>
            <span className={styles.avatar} aria-hidden="true">
              AN
            </span>
            {post.author}
          </span>
          <span>
            <Calendar size={15} aria-hidden="true" />
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
          <span>
            <Clock size={15} aria-hidden="true" /> {readingTime(post.content)} min read
          </span>
        </div>
      </header>

      <div className="container">
        <figure className={styles.cover}>
          <div className={styles.coverImage}>
            <SmartImage src={post.cover.src} alt={post.cover.alt} priority sizes="100vw" />
          </div>
          {post.cover.credit && <figcaption>{post.cover.credit}</figcaption>}
        </figure>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <TableOfContents items={toc} />
          </aside>
          <div className={styles.body}>
            <Markdown blocks={blocks} />
            <footer className={styles.footer}>
              <TagList items={post.tags} label="Tags" />
              <ShareLinks url={url} title={post.title} />
            </footer>
          </div>
        </div>

        <nav className={styles.pager} aria-label="More articles">
          {older ? (
            <Link href={`/blog/${older.slug}`} className={styles.pagerLink}>
              <span className={styles.pagerLabel}>
                <ArrowLeft size={14} aria-hidden="true" /> Previous article
              </span>
              <span className={styles.pagerTitle}>{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link href={`/blog/${newer.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
              <span className={styles.pagerLabel}>
                Next article <ArrowRight size={14} aria-hidden="true" />
              </span>
              <span className={styles.pagerTitle}>{newer.title}</span>
            </Link>
          )}
        </nav>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className={styles.relatedTitle}>
              Related articles
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
      <ContactCta />
    </article>
  );
}
