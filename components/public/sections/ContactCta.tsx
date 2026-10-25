import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import ButtonLink from "@/components/shared/ButtonLink";
import { getHomeContent } from "@/lib/data";
import styles from "./ContactCta.module.css";

/** Compact closing call-to-action used at the end of inner pages. Defaults to the homepage contact headline. */
export default async function ContactCta({ title }: { title?: string }) {
  const heading = title ?? (await getHomeContent()).contactHeadline;
  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <div className="container">
        <Reveal className={styles.inner}>
          <h2 id="cta-title" className={styles.title}>
            {heading}
          </h2>
          <ButtonLink href="/contact" icon={<ArrowUpRight size={18} aria-hidden="true" />}>
            Let&apos;s Talk
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
