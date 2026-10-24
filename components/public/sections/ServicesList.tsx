import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/animations/Reveal";
import SmartImage from "@/components/shared/SmartImage";
import type { Service } from "@/types/content";
import styles from "./ServicesList.module.css";

/** Numbered service rows with an image thumbnail that expands on hover. */
export default function ServicesList({ services }: { services: Service[] }) {
  return (
    <ol role="list" className={styles.list}>
      {services.map((service, index) => (
        <Reveal as="li" key={service.id} className={styles.row} delay={index * 0.04}>
          <Link href={`/services#${service.slug}`} className={styles.link}>
            <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.title}>{service.title}</span>
            <span className={styles.description}>{service.description}</span>
            <span className={styles.thumb} aria-hidden="true">
              <SmartImage src={service.image.src} alt="" sizes="200px" />
            </span>
            <ArrowUpRight className={styles.arrow} size={22} aria-hidden="true" />
          </Link>
        </Reveal>
      ))}
    </ol>
  );
}
