import { Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
export type IconFamily = "feather" | "material" | "ionicons" | "fontawesome";

export interface IconProps {
	name: string;
	family?: IconFamily;
	size?: number;
	color?: string;
	style?: any;
}

export function Icon({ name, family = "feather", size = 24, color = "#000000", style }: IconProps) {
	switch (family) {
		case "material":
			return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
		case "ionicons":
			return <Ionicons name={name as any} size={size} color={color} style={style} />;
		case "fontawesome":
			return <FontAwesome name={name as any} size={size} color={color} style={style} />;
		case "feather":
		default:
			return <Feather name={name as any} size={size} color={color} style={style} />;
	}
}

export function BackIcon({ size = 24, color = "#007AFF" }: { size?: number; color?: string }) {
	return <Icon name="chevron-left" family="feather" size={size} color={color} />;
}

export function AddIcon({ size = 24, color = "#007AFF" }: { size?: number; color?: string }) {
	return <Icon name="plus" family="feather" size={size} color={color} />;
}

export function SettingsIcon({ size = 24, color = "#8E8E93" }: { size?: number; color?: string }) {
	return <Icon name="settings" family="feather" size={size} color={color} />;
}

export function SearchIcon({ size = 24, color = "#8E8E93" }: { size?: number; color?: string }) {
	return <Icon name="search" family="feather" size={size} color={color} />;
}

export function CalendarIcon({ size = 24, color = "#8E8E93" }: { size?: number; color?: string }) {
	return <Icon name="calendar" family="feather" size={size} color={color} />;
}

export function MapPinIcon({ size = 24, color = "#8E8E93" }: { size?: number; color?: string }) {
	return <Icon name="map-pin" family="feather" size={size} color={color} />;
}

export function CloseIcon({ size = 24, color = "#8E8E93" }: { size?: number; color?: string }) {
	return <Icon name="x" family="feather" size={size} color={color} />;
}
