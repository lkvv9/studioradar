import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { MapPin, Heart, User, Radio, MessageCircle } from "lucide-react-native";
import { useConversations } from "@/hooks/useChat";

export default function TabsLayout() {
  const { totalUnread } = useConversations();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#5478ff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Radar",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<Radio size={22} color={color} />} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: "Match",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<Heart size={22} color={color} />} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<MessageCircle size={22} color={color} />} focused={focused} badge={totalUnread} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<User size={22} color={color} />} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, focused, badge }: { icon: React.ReactNode; focused: boolean; badge?: number }) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconActive]}>
      {icon}
      {!!badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0e0e24",
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
  iconWrapper: {
    width: 40,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    backgroundColor: "rgba(45,78,255,0.12)",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ff3b30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
});
