import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { MapPin, Heart, User, Radio } from "lucide-react-native";

export default function TabsLayout() {
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

function TabIcon({ icon, focused }: { icon: React.ReactNode; focused: boolean }) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconActive]}>
      {icon}
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
});
