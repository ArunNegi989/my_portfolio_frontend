import Reveal from "@/components/animations/Reveal";
import BlogExplorer from "@/components/public/BlogExplorer";
import PageHero from "@/components/public/PageHero";
import PostCard from "@/components/public/PostCard";
import { getPosts, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "../inner.module.css";

export const metadata = pageMetadata("/blog");

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes & Lessons"
        description="Practical writing on Next.js, React, Node.js, REST APIs, performance, SEO and shipping production web apps."
        image={settings.pageImages.blogHero}
      />
      {featured && (
        <section className={styles.section} aria-labelledby="featured-post">
          <div className="container">
            <p id="featured-post" className={styles.eyebrow}>
              Featured article
            </p>
            <Reveal>
              <PostCard post={featured} featured headingLevel="h2" />
            </Reveal>
          </div>
        </section>
      )}
      <section className={styles.section} aria-labelledby="all-posts">
        <div className="container">
          <h2 id="all-posts" className={styles.h2} style={{ marginBottom: 32 }}>
            All articles
          </h2>
          <BlogExplorer posts={rest} categories={categories} />
        </div>
      </section>
    </>
  );
}
