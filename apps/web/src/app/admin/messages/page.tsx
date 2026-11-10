"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  pageQuery,
  type Paginated,
} from "@/lib/admin/pagination";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminMessagesSkeleton } from "@/components/skeletons/AdminSkeletons";

type Reply = { id: string; body: string; createdAt: string };

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  read: boolean;
  notes: string;
  createdAt: string;
  replies: Reply[];
  replyCount?: number;
};

type Status = { key: string; label: string; color: string; inInbox: boolean };

export default function MessagesPage() {
  return (
    <Suspense fallback={<AdminMessagesSkeleton />}>
      <MessagesInner />
    </Suspense>
  );
}

function MessagesInner() {
  const router = useRouter();
  const search = useSearchParams();
  const openId = search.get("id");
  const [messages, setMessages] = useState<Message[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const pageSize = ADMIN_PAGE_SIZE.messages;

  useEffect(() => {
    setPage(1);
  }, [query]);

  const load = async (nextPage = page) => {
    setLoading(true);
    try {
      const data = await api<
        Paginated<Message> & {
          messages: Message[];
          statuses: Status[];
        }
      >(
        `/admin/messages${pageQuery(nextPage, pageSize, {
          inbox: "1",
          q: query.trim() || undefined,
        })}`,
      );
      setMessages(data.messages ?? data.items);
      setStatuses(data.statuses);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      if (data.page !== page) setPage(data.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  useEffect(() => {
    if (!openId) return;
    api<Message>(`/admin/messages/${openId}`)
      .then((full) => {
        setSelected(full);
        setReplyBody("");
      })
      .catch(() => toast.error("Message not found"));
  }, [openId]);

  const statusLabel = useMemo(() => {
    const map = Object.fromEntries(statuses.map((s) => [s.key, s.label]));
    return (key: string) => map[key] || key;
  }, [statuses]);

  const sendReply = async () => {
    if (!selected || replyBody.trim().length < 2) {
      toast.error("Write a reply first");
      return;
    }
    setSending(true);
    try {
      const res = await api<{
        message: Message;
        emailed: boolean;
        emailNote?: string;
      }>(`/admin/messages/${selected.id}/replies`, {
        method: "POST",
        body: JSON.stringify({ body: replyBody, sendEmail: true }),
      });
      setSelected(res.message);
      setMessages((prev) =>
        prev.map((m) => (m.id === res.message.id ? res.message : m)),
      );
      setReplyBody("");
      if (res.emailed) {
        toast.success("Reply saved & emailed to customer");
      } else {
        toast.success(
          res.emailNote
            ? `Reply saved (${res.emailNote})`
            : "Reply saved",
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reply failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Messages"
        description="Contact inbox — reply to customers and manage lead status."
      />

      <div className="mb-4">
        <input
          className="admin-input max-w-md"
          placeholder="Search name, email, message…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <AdminMessagesSkeleton />
      ) : (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
        <div className="admin-card overflow-hidden">
          {messages.length === 0 ? (
            <EmptyState
              title="Inbox is quiet"
              description="New contact form messages will show up here."
            />
          ) : (
            <>
              <ul className="divide-y divide-ink/10">
                {messages.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-paper"
                      onClick={() => {
                        router.replace(`/admin/messages?id=${m.id}`);
                        setSelected(m);
                        setReplyBody("");
                        void api<Message>(`/admin/messages/${m.id}`).then(
                          (full) => {
                            setSelected(full);
                            setMessages((prev) =>
                              prev.map((row) =>
                                row.id === full.id
                                  ? { ...row, read: true }
                                  : row,
                              ),
                            );
                          },
                        );
                      }}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-rose"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {m.name}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted">
                            {formatDate(m.createdAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {m.subject || m.message}
                        </span>
                        <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.14em] text-rose">
                          {statusLabel(m.status)}
                          {(m.replyCount ?? m.replies?.length ?? 0) > 0
                            ? ` · ${m.replyCount ?? m.replies.length} reply`
                            : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 pb-4">
                <AdminPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onChange={setPage}
                  className="mt-0 border-t-0 pt-4"
                />
              </div>
            </>
          )}
        </div>

        <div className="admin-card p-5">
          {!selected ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-muted">
              <Inbox className="mb-3 h-8 w-8 opacity-40" />
              <p className="text-sm">Select a message to read & reply.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-2xl text-ink">
                  {selected.name}
                </h2>
                <p className="text-sm text-muted">
                  <a
                    href={`mailto:${selected.email}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {selected.email}
                  </a>
                  {selected.phone ? ` · ${selected.phone}` : ""}
                </p>
                {selected.subject ? (
                  <p className="mt-2 text-sm font-medium">{selected.subject}</p>
                ) : null}
              </div>

              <div className="rounded-sm border border-ink/10 bg-paper/70 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  Customer message · {formatDate(selected.createdAt)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink/85">
                  {selected.message}
                </p>
              </div>

              {(selected.replies?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Replies
                  </p>
                  {selected.replies.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-sm border border-[#c9a08a]/25 bg-[#c9a08a]/8 p-3"
                    >
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#c9a08a]">
                        You · {formatDate(r.createdAt)}
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink/85">
                        {r.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <span className="admin-label">Reply to customer</span>
                <textarea
                  className="admin-input min-h-[7rem] resize-y"
                  placeholder="Write your reply… (emailed when RESEND_API_KEY is set)"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button loading={sending} onClick={() => void sendReply()}>
                    <Send className="h-3.5 w-3.5" />
                    Send reply
                  </Button>
                </div>
              </div>

              <label className="block">
                <span className="admin-label">Status</span>
                <select
                  className="admin-input"
                  value={selected.status}
                  onChange={async (e) => {
                    const status = e.target.value;
                    const updated = await api<Message>(
                      `/admin/messages/${selected.id}`,
                      {
                        method: "PATCH",
                        body: JSON.stringify({ status }),
                      },
                    );
                    setSelected(updated);
                    setMessages((prev) =>
                      prev.map((m) => (m.id === updated.id ? updated : m)),
                    );
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="admin-label">Internal notes</span>
                <textarea
                  className="admin-input min-h-[5rem] resize-y"
                  value={selected.notes}
                  onChange={(e) =>
                    setSelected({ ...selected, notes: e.target.value })
                  }
                  onBlur={async () => {
                    await api(`/admin/messages/${selected.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ notes: selected.notes }),
                    });
                  }}
                />
              </label>

              <Button
                variant="danger"
                onClick={async () => {
                  await api(`/admin/messages/${selected.id}`, {
                    method: "DELETE",
                  });
                  setSelected(null);
                  router.replace("/admin/messages");
                  void load();
                  toast.success("Deleted");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
