import { timeAgo, formatMessageTime, formatDateSeparator, buildMessageItems } from "../lib/chatUtils";
import type { Message } from "@studioradar/shared";

// ─── timeAgo ─────────────────────────────────────────────────────────────────

describe("timeAgo", () => {
  const now = Date.now();

  it("returns empty string for undefined", () => {
    expect(timeAgo(undefined)).toBe("");
  });

  it("returns 'À l'instant' for timestamps < 1 minute ago", () => {
    expect(timeAgo(new Date(now - 30_000).toISOString())).toBe("À l'instant");
    expect(timeAgo(new Date(now - 59_000).toISOString())).toBe("À l'instant");
  });

  it("returns minutes for timestamps 1–59 minutes ago", () => {
    expect(timeAgo(new Date(now - 60_000).toISOString())).toBe("1m");
    expect(timeAgo(new Date(now - 30 * 60_000).toISOString())).toBe("30m");
    expect(timeAgo(new Date(now - 59 * 60_000).toISOString())).toBe("59m");
  });

  it("returns hours for timestamps 1–23 hours ago", () => {
    expect(timeAgo(new Date(now - 3_600_000).toISOString())).toBe("1h");
    expect(timeAgo(new Date(now - 12 * 3_600_000).toISOString())).toBe("12h");
    expect(timeAgo(new Date(now - 23 * 3_600_000).toISOString())).toBe("23h");
  });

  it("returns days for timestamps 1–6 days ago", () => {
    expect(timeAgo(new Date(now - 86_400_000).toISOString())).toBe("1j");
    expect(timeAgo(new Date(now - 5 * 86_400_000).toISOString())).toBe("5j");
  });

  it("returns a formatted date for timestamps 7+ days ago", () => {
    const old = new Date(now - 8 * 86_400_000).toISOString();
    const result = timeAgo(old);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // not a relative format
    expect(result).not.toMatch(/^(\d+[mhj]|À l'instant)$/);
  });
});

// ─── formatMessageTime ────────────────────────────────────────────────────────

describe("formatMessageTime", () => {
  it("formats time as HH:MM in French locale", () => {
    const iso = new Date("2025-06-15T14:35:00Z").toISOString();
    const result = formatMessageTime(iso);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

// ─── formatDateSeparator ──────────────────────────────────────────────────────

describe("formatDateSeparator", () => {
  it("returns 'Aujourd'hui' for today", () => {
    const result = formatDateSeparator(new Date().toISOString());
    expect(result).toBe("Aujourd'hui");
  });

  it("returns 'Hier' for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDateSeparator(yesterday.toISOString())).toBe("Hier");
  });

  it("returns a formatted date for older messages", () => {
    const old = new Date("2025-01-15T10:00:00Z").toISOString();
    const result = formatDateSeparator(old);
    expect(result).not.toBe("Aujourd'hui");
    expect(result).not.toBe("Hier");
    expect(typeof result).toBe("string");
  });
});

// ─── buildMessageItems ────────────────────────────────────────────────────────

function makeMessage(id: string, created_at: string, sender_id = "u1"): Message {
  return { id, conversation_id: "conv1", sender_id, content: `msg ${id}`, created_at };
}

describe("buildMessageItems", () => {
  it("returns empty array for no messages", () => {
    expect(buildMessageItems([])).toEqual([]);
  });

  it("inserts one date separator before the first message of each day", () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const msgs = [
      makeMessage("1", yesterday.toISOString()),
      makeMessage("2", yesterday.toISOString()),
      makeMessage("3", today.toISOString()),
    ];

    const items = buildMessageItems(msgs);
    // 2 separators + 3 messages = 5 items
    expect(items).toHaveLength(5);
    expect(items[0].type).toBe("sep");
    expect(items[1].type).toBe("msg");
    expect(items[2].type).toBe("msg");
    expect(items[3].type).toBe("sep");
    expect(items[4].type).toBe("msg");
  });

  it("assigns unique keys", () => {
    const now = new Date().toISOString();
    const msgs = [makeMessage("a", now), makeMessage("b", now)];
    const items = buildMessageItems(msgs);
    const keys = items.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("preserves message content and sender_id", () => {
    const now = new Date().toISOString();
    const msgs = [makeMessage("x", now, "alice")];
    const items = buildMessageItems(msgs);
    const msgItem = items.find((i) => i.type === "msg");
    expect(msgItem?.type).toBe("msg");
    if (msgItem?.type === "msg") {
      expect(msgItem.msg.sender_id).toBe("alice");
      expect(msgItem.msg.content).toBe("msg x");
    }
  });
});
