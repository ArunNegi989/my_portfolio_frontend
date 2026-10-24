import { Check } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import PageHero from "@/components/public/PageHero";
import ContactCta from "@/components/public/sections/ContactCta";
import SmartImage from "@/components/shared/SmartImage";
import TagList from "@/components/shared/TagList";
import { getServices } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import styles from "./services.module.css";

export const metadata = pageMetadata("/services");

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What I Build"
        description="From a single landing page to a full stack platform with an admin dashboard — here is how I can help."
      />
      <div className="container">
        {services.map((service, index) => (
          <section key={service.id} id={service.slug} className={styles.service} aria-labelledby={`${service.slug}-title`}>
            <Reveal className={styles.media}>
              <SmartImage src={service.image.src} alt={service.image.alt} sizes="(max-width: 900px) 100vw, 45vw" />
            </Reveal>
            <Reveal className={styles.body} delay={0.1}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <h2 id={`${service.slug}-title`} className={styles.title}>
                {service.title}
              </h2>
              <p className={styles.description}>{service.description}</p>
              <ul className={styles.deliverables} aria-label="Deliverables">
                {service.deliverables.map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
              <TagList items={service.technologies} variant="accent" label="Technologies" />
            </Reveal>
          </section>
        ))}
      </div>
      <ContactCta />
    </>
  );
}
