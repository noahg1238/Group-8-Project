import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "../../global.css";
import PasskeyEntry from "../components/PasskeyEntry";
import { hasPassword } from "../database/auth";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [passwordExists, setPasswordExists] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const exists = await hasPassword();
        setPasswordExists(exists);
      } catch (e) {
        console.error("Failed to read password status", e);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.activityindicator}>
        <ActivityIndicator size={"large"} color="#ffffff" />
      </View>
    );
  }

  if (!passwordExists) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <PasskeyEntry />
    </View>
  );
}

const styles = StyleSheet.create({
  activityindicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#242736",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#242736",
    paddingHorizontal: 24,
  },
});
