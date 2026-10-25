"use client";

import { Archive, ChevronLeft, ChevronRight, Mail, MailOpen, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api/client";
import { reportSaveError } from "@/lib/admin/errors";
import { cx } from "@/lib/utils";
import ui from "../admin.module.css";
import { useFeedback } from "../Feedback";
import { Card, EmptyState, LoadingRows, PageHeader } from "../ui";

type MessageStatus = "new" | "read" | "archived";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

interface ListMeta {
  page: number;
  totalPages: number;
  total: number;
  unread: number;
}

const STATUS_LABEL: Record<MessageStatus, string> = { new: "New", read: "Read", archived: "Archived" };
const PAGE_SIZE = 20;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Contact-form submissions: read, filter, mark as read/archived, reply by email, delete. */
export default function MessagesScreen() {
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<"all" | MessageStatus>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ContactMessage[] | null>(null);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (status !== "all") params.set("status", status);
    if (deferredQuery) params.set("q", deferredQuery);
    api
      .request<ContactMessage[]>(`/admin/messages?${params}`)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setMeta(res.meta as unknown as ListMeta);
        setError(null);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Couldn't load messages.")));
    return () => {
      cancelled = true;
    };
  }, [status, deferredQuery, page, reloadKey]);

  async function setMessageStatus(message: ContactMessage, next: MessageStatus) {
    setBusyId(message.id);
    try {
      const saved = await api.patch<ContactMessage>(`/admin/messages/${message.id}`, { status: next });
      setItems((list) => (list ? (status === "all" || status === next ? list.map((m) => (m.id === saved.id ? saved : m)) : list.filter((m) => m.id !== saved.id)) : list));
      setMeta((m) => (m ? { ...m, unread: m.unread + (next === "new" ? 1 : 0) - (message.status === "new" ? 1 : 0) } : m));
    } catch (err) {
      reportSaveError(err, toast);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(message: ContactMessage) {
    const ok = await confirm({ title: "Delete message?", message: `The message from ${message.name} will be permanently deleted.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    setBusyId(message.id);
    try {
      await api.delete(`/admin/messages/${message.id}`);
      toast("Message deleted");
      refresh();
    } catch (err) {
      reportSaveError(err, toast);
    } finally {
      setBusyId(null);
    }
  }

  const filtered = status !== "all" || Boolean(deferredQuery);

  return (
    <>
      <PageHeader
        title="Messages"
        description={meta ? `Contact-form submissions · ${meta.unread} unread` : "Contact-form submissions from the public site."}
        actions={
          <button type="button" className={ui.btn} onClick={refresh}>
            <RefreshCw size={15} aria-hidden="true" /> Refresh
          </button>
        }
      />
      <div className={ui.toolbar}>
        <label className={ui.searchBox}>
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Search messages</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email or message"
          />
        </label>
        <select
          className={ui.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="all">All messages</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {error ? (
        <div className={ui.card}>
          <EmptyState
            title="Couldn't load messages"
            message={error}
            action={
              <button type="button" className={ui.btn} onClick={refresh}>
                Try again
              </button>
            }
          />
        </div>
      ) : items === null ? (
        <Card>
          <LoadingRows rows={5} />
        </Card>
      ) : items.length === 0 ? (
        <div className={ui.card}>
          <EmptyState
            title={filtered ? "No messages match these filters" : "No messages yet"}
            message={filtered ? "Try another search or status." : "Messages sent through the contact form will appear here."}
          />
        </div>
      ) : (
        <ul role="list" className={ui.stack} style={{ margin: 0 }}>
          {items.map((m) => (
            <li key={m.id} className={ui.card} aria-busy={busyId === m.id || undefined}>
              <div className={ui.cardHeader} style={{ marginBottom: 10 }}>
                <div>
                  <p className={ui.cardTitle}>
                    {m.name}{" "}
                    <span className={cx(ui.badge, m.status === "new" ? ui.badgeInfo : m.status === "read" ? ui.badgePublished : ui.badgeDraft)}>{STATUS_LABEL[m.status]}</span>
                  </p>
                  <p className={ui.cardSubtitle}>
                    {m.email} · {formatWhen(m.createdAt)}
                    {m.projectType ? ` · ${m.projectType}` : ""}
                  </p>
                </div>
                <div className={ui.rowActions}>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your message${m.projectType ? ` about ${m.projectType}` : ""}`)}`}
                    className={ui.iconBtn}
                    aria-label={`Reply to ${m.name} by email`}
                    title="Reply by email"
                  >
                    <Mail size={15} aria-hidden="true" />
                  </a>
                  {m.status === "new" ? (
                    <button type="button" className={ui.iconBtn} onClick={() => setMessageStatus(m, "read")} disabled={busyId === m.id} aria-label={`Mark message from ${m.name} as read`} title="Mark as read">
                      <MailOpen size={15} aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="button" className={ui.iconBtn} onClick={() => setMessageStatus(m, "new")} disabled={busyId === m.id} aria-label={`Mark message from ${m.name} as unread`} title="Mark as unread">
                      <Mail size={15} aria-hidden="true" />
                    </button>
                  )}
                  {m.status !== "archived" && (
                    <button type="button" className={ui.iconBtn} onClick={() => setMessageStatus(m, "archived")} disabled={busyId === m.id} aria-label={`Archive message from ${m.name}`} title="Archive">
                      <Archive size={15} aria-hidden="true" />
                    </button>
                  )}
                  <button type="button" className={cx(ui.iconBtn, ui.iconBtnDanger)} onClick={() => remove(m)} disabled={busyId === m.id} aria-label={`Delete message from ${m.name}`} title="Delete">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {/* Rendered as plain text by React: visitor content is never interpreted as HTML. */}
              <p style={{ whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>{m.message}</p>
            </li>
          ))}
        </ul>
      )}

      {meta && meta.totalPages > 1 && (
        <div className={ui.toolbar} style={{ marginTop: 16, justifyContent: "space-between" }}>
          <button type="button" className={ui.btn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={15} aria-hidden="true" /> Newer
          </button>
          <span className={ui.muted} style={{ fontSize: "0.85rem" }}>
            Page {meta.page} of {meta.totalPages} · {meta.total} messages
          </span>
          <button type="button" className={ui.btn} disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Older <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
