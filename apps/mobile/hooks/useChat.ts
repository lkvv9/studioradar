import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { Conversation, Message } from "@studioradar/shared";

// ─── Liste des conversations ──────────────────────────────────────────────────

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading]             = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations_with_other")
      .select("*");
    setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Temps réel — nouvelle conversation ou nouveau message
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-list")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "conversations",
        filter: `participant_1=eq.${user.id}`,
      }, () => fetch())
      .on("postgres_changes", {
        event: "*", schema: "public", table: "conversations",
        filter: `participant_2=eq.${user.id}`,
      }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetch]);

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0);

  return { conversations, loading, refetch: fetch, totalUnread };
}

// ─── Messages d'une conversation ─────────────────────────────────────────────

export function useMessages(conversationId: string) {
  const { user }  = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<boolean>(false);

  const fetch = useCallback(async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data as Message[]) ?? []);
    setLoading(false);
    // Marquer tous les messages de l'autre comme lus
    if (user) {
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null)
        .then(() => {});
    }
  }, [conversationId, user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Temps réel — nouveau message
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => [...prev, msg]);
        // Marquer lu si c'est un message reçu
        if (user && msg.sender_id !== user.id) {
          supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("id", msg.id)
            .then(() => {});
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  async function sendMessage(content: string) {
    if (!content.trim() || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id:       user.id,
      content:         content.trim(),
    });
    setSending(false);
  }

  return { messages, loading, sending, sendMessage };
}

// ─── Ouvrir / créer une conversation ─────────────────────────────────────────

export function useOpenConversation() {
  const [loading, setLoading] = useState(false);

  async function openConversation(otherUserId: string): Promise<string | null> {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      p_other_user_id: otherUserId,
    });
    setLoading(false);
    if (error) return null;
    return data as string;
  }

  return { openConversation, loading };
}
