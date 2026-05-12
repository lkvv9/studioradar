import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Platform, KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import { ChevronLeft, Send } from "lucide-react-native";
import { useState } from "react";
import { useMessages } from "@/hooks/useChat";
import { useAuth } from "@/providers/AuthProvider";
import type { Message } from "@studioradar/shared";

const ROLE_LABELS: Record<string, string> = {
  artist:      "Artiste",
  pro_studio:  "Studio Pro",
  home_studio: "Home Studio",
  music_lover: "Passionné",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSep(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

type ListItem = { type: "sep"; date: string; key: string } | { type: "msg"; msg: Message; key: string };

function buildItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDay = "";
  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString();
    if (day !== lastDay) {
      items.push({ type: "sep", date: formatDateSep(msg.created_at), key: `sep-${day}` });
      lastDay = day;
    }
    items.push({ type: "msg", msg, key: msg.id });
  }
  return items;
}

export default function ChatRoomScreen() {
  const { id, otherName, otherRole } = useLocalSearchParams<{
    id: string; otherName?: string; otherRole?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage } = useMessages(id);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  async function handleSend() {
    const t = text.trim();
    if (!t) return;
    setText("");
    await sendMessage(t);
  }

  const items = buildItems(messages);

  function renderItem({ item }: { item: ListItem }) {
    if (item.type === "sep") {
      return (
        <View style={styles.sep}>
          <View style={styles.sepLine} />
          <Text style={styles.sepText}>{item.date}</Text>
          <View style={styles.sepLine} />
        </View>
      );
    }
    const isMine = item.msg.sender_id === user?.id;
    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
          {item.msg.content}
        </Text>
        <Text style={[styles.bubbleTime, isMine ? styles.bubbleTimeMine : styles.bubbleTimeOther]}>
          {formatTime(item.msg.created_at)}
          {isMine && item.msg.read_at ? "  ✓✓" : ""}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {otherName?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherName ?? "Conversation"}</Text>
          <Text style={styles.headerRole}>
            {ROLE_LABELS[otherRole ?? ""] ?? ""}
          </Text>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#5478ff" size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(i) => i.key}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Démarrez la conversation 👋</Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Message…"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.75}
        >
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Send size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: "#0a0a1a" },
  header:           { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  headerAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1a30f5", alignItems: "center", justifyContent: "center" },
  headerAvatarText: { fontSize: 17, fontWeight: "900", color: "#fff" },
  headerInfo:       { flex: 1 },
  headerName:       { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerRole:       { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 },

  loader:      { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingVertical: 16, paddingHorizontal: 14, gap: 6 },

  sep:      { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 10 },
  sepLine:  { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  sepText:  { fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: "600" },

  bubble:         { maxWidth: "78%", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, gap: 4 },
  bubbleMine:     { alignSelf: "flex-end", backgroundColor: "#2d4eff", borderBottomRightRadius: 4 },
  bubbleOther:    { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 },
  bubbleText:     { fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { color: "#fff" },
  bubbleTextOther:{ color: "rgba(255,255,255,0.85)" },
  bubbleTime:     { fontSize: 10, alignSelf: "flex-end" },
  bubbleTimeMine: { color: "rgba(255,255,255,0.45)" },
  bubbleTimeOther:{ color: "rgba(255,255,255,0.25)" },

  empty:     { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { color: "rgba(255,255,255,0.25)", fontSize: 15 },

  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 30 : 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", backgroundColor: "#0d0d20" },
  input:    { flex: 1, minHeight: 42, maxHeight: 120, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 21, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: "#fff" },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: "#2d4eff", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "rgba(45,78,255,0.35)" },
});
