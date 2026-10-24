import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import type { PublishStatus } from "@/types/content";
import ui from "./admin.module.css";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className={ui.pageHeader}>
      <div>
        <h1 className={ui.pageTitle}>{title}</h1>
        {description && <p className={ui.pageDescription}>{description}</p>}
      </div>
      {actions && <div className={ui.headerActions}>{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx(ui.card, className)}>
      {(title || actions) && (
        <div className={ui.cardHeader}>
          <div>
            {title && <h2 className={ui.cardTitle}>{title}</h2>}
            {subtitle && <p className={ui.cardSubtitle}>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: PublishStatus }) {
  return <span className={cx(ui.badge, status === "published" ? ui.badgePublished : ui.badgeDraft)}>{status === "published" ? "Published" : "Draft"}</span>;
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className={ui.empty}>
      <Inbox size={36} aria-hidden="true" />
      <p className={ui.emptyTitle}>{title}</p>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className={ui.stack} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={ui.skeleton} style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}
