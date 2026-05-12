import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Platform, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MessageCircle, ChevronRight } from "lucide-react-native";
import { useConversations } from "@/hooks/useChat";
import { timeAgo } from "@/lib/chatUtils";
import type { Conversation } from "@studioradar/shared";

const ROLE_LABELS: Record<string, string> = {
  artist:      "Artiste",
  pro_studio:  "Studio Pro",
  home_studio: "Home Studio",
  music_lover: "Passionné",
};

export default function ChatListScreen() {
  const router = useRouter();
  const { conversations, loading } = useConversations();

  function renderItem({ item }: { item: Conversation }) {
    const initial = item.other_name?.charAt(0)?.toUpperCase() ?? "?";
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id, otherName: item.other_name, otherRole: item.other_role } })}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
          {hasUnread && <View style={styles.unreadDot} />}
        </View>

        {/* Contenu */}
        <View style={styles.itemBody}>
          <View style={styles.itemTop}>
            <Text style={[styles.name, hasUnread && styles.nameBold]}>
              {item.other_name}
            </Text>
            <Text style={styles.time}>{timeAgo(item.last_message_at)}</Text>
          </View>
          <View style={styles.itemBottom}>
            <Text
              style={[styles.preview, hasUnread && styles.previewBold]}
              numberOfLines={1}
            >
              {item.last_message ?? "Démarrer la conversation"}
            </Text>
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
          <Text style={styles.role}>{ROLE_LABELS[item.other_role] ?? ""}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {!loading && conversations.length > 0 && (
          <Text style={styles.count}>{conversations.length}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#5478ff" size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <MessageCircle size={52} color="rgba(255,255,255,0.1)" />
          <Text style={styles.emptyTitle}>Aucun message</Text>
          <Text style={styles.emptySub}>
            Contacte un studio depuis le Radar ou un match depuis Music Match.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#0a0a1a" },
  header:       { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: Platform.OS === "ios" ? 58 : 38, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  title:        { flex: 1, fontSize: 26, fontWeight: "900", color: "#fff" },
  count:        { fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: "600" },
  loader:       { flex: 1, alignItems: "center", justifyContent: "center" },
  empty:        { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle:   { fontSize: 20, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
  emptySub:     { fontSize: 14, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 20 },
  item:         { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  avatar:       { position: "relative", width: 50, height: 50, borderRadius: 25, backgroundColor: "#1a30f5", alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 20, fontWeight: "900", color: "#fff" },
  unreadDot:    { position: "absolute", top: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: "#00ff88", borderWidth: 2, borderColor: "#0a0a1a" },
  itemBody:     { flex: 1, gap: 3 },
  itemTop:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name:         { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  nameBold:     { color: "#fff", fontWeight: "700" },
  time:         { fontSize: 12, color: "rgba(255,255,255,0.25)" },
  itemBottom:   { flexDirection: "row", alignItems: "center", gap: 8 },
  preview:      { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.35)" },
  previewBold:  { color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  badge:        { backgroundColor: "#2d4eff", borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText:    { color: "#fff", fontSize: 11, fontWeight: "800" },
  role:         { fontSize: 11, color: "rgba(255,255,255,0.25)" },
  sep:          { height: 1, backgroundColor: "rgba(255,255,255,0.04)", marginLeft: 84 },
});
