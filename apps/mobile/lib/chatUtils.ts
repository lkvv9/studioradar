import type { Message } from "@studioradar/shared";

export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "À l'instant";
  if (mins  < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days  < 7)  return `${days}j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateSeparator(iso: string): string {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export type ListItem =
  | { type: "sep"; date: string; key: string }
  | { type: "msg"; msg: Message; key: string };

export function buildMessageItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDay = "";
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString();
    if (day !== lastDay) {
      items.push({ type: "sep", date: formatDateSeparator(msg.created_at), key: `sep-${day}` });
      lastDay = day;
    }
    items.push({ type: "msg", msg, key: msg.id });
  }
  return items;
}
