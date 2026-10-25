"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { cx, telHref } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/utils/scroll";
import type { NavItem } from "@/types/content";
import styles from "./Navbar.module.css";

interface NavbarProps {
  items: NavItem[];
  phone: string;
  email: string;
}

/** Viewport width above which the inline desktop navigation replaces the menu button (keep in sync with the CSS). */
const DESKTOP_NAV_MIN = 1100;

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The current path is URL data: on pages whose params weren't known at build time it is only
 * available at request time. The bar renders immediately without an active link and the
 * highlighted version streams in, instead of the whole page failing to prerender.
 */
export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={<NavbarView {...props} pathname={null} />}>
      <NavbarWithPathname {...props} />
    </Suspense>
  );
}

function NavbarWithPathname(props: NavbarProps) {
  return <NavbarView {...props} pathname={usePathname()} />;
}

function NavbarView({ items, phone, email, pathname }: NavbarProps & { pathname: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll("menu");
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= DESKTOP_NAV_MIN && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      unlockScroll("menu");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={cx(styles.header, (scrolled || open) && styles.scrolled)}>
      <div className={cx("container", styles.inner)}>
        <Link href="/" className={styles.logo} aria-label="Arun Negi — home" onNavigate={close}>
          <span className={styles.logoA}>A</span>
          <span className={styles.logoN}>N</span>
          <span className={styles.logoDot} aria-hidden="true" />
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
          <ul role="list" className={styles.links}>
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cx(styles.link, active && styles.active)} aria-current={active ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          {phone && (
            <a href={telHref(phone)} className={styles.phone} aria-label={`Call ${phone}`}>
              <span className={styles.phoneIcon} aria-hidden="true">
                <Phone size={14} />
              </span>
              <span className={styles.phoneNumber}>{phone}</span>
            </a>
          )}
          <Link href="/contact" className={styles.cta} onNavigate={close}>
            Let&apos;s Talk <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className={styles.mobileMenu}
            // Lenis is stopped while the menu is open and would otherwise swallow wheel scrolling inside it.
            data-lenis-prevent
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul role="list" className={styles.mobileLinks}>
              {[...items, { label: "Services", href: "/services" }].map((item, index) => {
                const active = isActive(pathname, item.href);
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      onNavigate={close}
                      className={cx(styles.mobileLink, active && styles.active)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={styles.mobileIndex}>{String(index + 1).padStart(2, "0")}</span>
                      {item.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            <motion.div
              className={styles.mobileContact}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (items.length + 1) * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className={styles.mobileContactLabel}>Get in touch</p>
              {phone && (
                <a href={telHref(phone)} className={styles.mobileContactLink} onClick={close}>
                  <Phone size={16} aria-hidden="true" /> {phone}
                </a>
              )}
              <a href={`mailto:${email}`} className={styles.mobileContactLink} onClick={close}>
                <Mail size={16} aria-hidden="true" /> {email}
              </a>
              <Link href="/contact" className={styles.mobileCta} onNavigate={close}>
                Let&apos;s Talk <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
