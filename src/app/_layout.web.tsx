import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { initializeDatabase } from "../database/migrations";
import { queryClient } from "../database/queryClient";
import { stackScreenOptions, stackScreens } from "../design/navigation";

export default function RootLayout() {
	useEffect(() => {
		async function initDatabase() {
			try {
				await initializeDatabase();
			} catch (error) {
				console.error("[Layout] Database init failed:", error);
			}
		}
		initDatabase();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<StatusBar style="light" />
				{/* Web: native-stack slide options are limited — month/year slides + CSS route fade still apply */}
				<Stack screenOptions={stackScreenOptions}>
					<Stack.Screen name="index" />
					<Stack.Screen name="home" />
					<Stack.Screen name="year_overview" options={stackScreens.year_overview} />
					<Stack.Screen name="settings" options={stackScreens.settings} />
					<Stack.Screen name="add_event_page" options={stackScreens.add_event_page} />
					<Stack.Screen name="event_details" options={stackScreens.event_details} />
					<Stack.Screen name="passkey_page" options={stackScreens.passkey_page} />
				</Stack>
			</SafeAreaProvider>
		</QueryClientProvider>
	);
}
