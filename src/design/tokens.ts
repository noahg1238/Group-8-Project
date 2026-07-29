// Dark palette
export const Colors = {
	// Screen & surfaces
	screen: "#242736",
	screenAlt: "#1E2030",

	// Brand accents
	accent: {
		blue: "#5195E2",
		teal: "#4ECDC4",
		mint: "#4ECDC4",
		// Create Event CTA (Call to Action)
		cta: "#6BDBAD",
		ctaText: "#0F1F1A"
	},

	// Primary brand colors
	primary: {
		50: "#E8F3FC",
		100: "#C5DFF8",
		200: "#9ECAF3",
		300: "#77B5ED",
		400: "#5195E2",
		500: "#5195E2",
		600: "#3A7BC8",
		700: "#2D62A3",
		800: "#204A7E",
		900: "#133259"
	},

	secondary: {
		50: "#E6FAF8",
		100: "#BFF3EE",
		200: "#99EBE4",
		300: "#73E4DA",
		400: "#4ECDC4",
		500: "#4ECDC4",
		600: "#3BA89F",
		700: "#2D837C",
		800: "#1F5E59",
		900: "#113936"
	},

	// Semantic colors
	success: "#4ECDC4",
	error: "#FF6B6B",
	warning: "#FFB347",
	info: "#5195E2",

	// Neutral colors (dark theme)
	neutral: {
		0: "#FFFFFF",
		50: "#F5F7FA",
		100: "#E8ECF2",
		200: "#C7E0D6",
		300: "#B8D1C7",
		400: "#8E9AAF",
		500: "#6B7280",
		600: "#4A5068",
		700: "#363A4E",
		800: "#2A2E3F",
		900: "#242736",
		950: "#1E2030",
		1000: "#141622"
	},

	// Background colors
	background: {
		primary: "#242736",
		secondary: "#1E2030",
		tertiary: "#363A4E",
		grouped: "#242736"
	},

	// Surface colors
	surface: {
		primary: "rgba(255, 255, 255, 0.08)",
		secondary: "rgba(255, 255, 255, 0.05)",
		elevated: "rgba(255, 255, 255, 0.12)",
		overlay: "rgba(0, 0, 0, 0.5)"
	},

	// Liquid glass tokens
	glass: {
		fill: "rgba(255, 255, 255, 0.08)",
		fillMedium: "rgba(255, 255, 255, 0.10)",
		fillSmall: "rgba(255, 255, 255, 0.12)",
		fillStrong: "rgba(255, 255, 255, 0.16)",
		border: "rgba(255, 255, 255, 0.18)",
		borderLight: "rgba(255, 255, 255, 0.28)",
		borderDashed: "rgba(255, 255, 255, 0.28)",
		highlight: "rgba(255, 255, 255, 0.35)",
		blur: 24,
		blurSmall: 16,
		blurLarge: 32
	},

	// Event card tokens
	event: {
		background: "rgba(37, 56, 52, 0.82)",
		border: "rgba(255, 255, 255, 0.18)",
		title: "#FFFFFF",
		subtitle: "#B8D1C7",
		time: "#C7E0D6",
		chevron: "rgba(255, 255, 255, 0.45)"
	},

	// Text colors (dark mode)
	text: {
		primary: "#FFFFFF",
		secondary: "rgba(255, 255, 255, 0.72)",
		tertiary: "rgba(255, 255, 255, 0.45)",
		placeholder: "rgba(255, 255, 255, 0.35)",
		disabled: "rgba(255, 255, 255, 0.25)",
		accent: "#5195E2",
		mint: "#C7E0D6"
	},

	// Border colors
	border: {
		default: "rgba(255, 255, 255, 0.18)",
		light: "rgba(255, 255, 255, 0.28)",
		strong: "rgba(255, 255, 255, 0.40)",
		dashed: "rgba(255, 255, 255, 0.28)"
	},

	// Icon colors
	icon: {
		default: "rgba(255, 255, 255, 0.65)",
		active: "#4ECDC4",
		muted: "rgba(255, 255, 255, 0.45)",
		error: "#FF6B6B",
		success: "#4ECDC4"
	},

	// Toggle
	toggle: {
		trackOff: "rgba(255, 255, 255, 0.18)",
		trackOn: "#4ECDC4",
		thumb: "#FFFFFF"
	},

	// Event category colors
	eventColors: {
		red: "#FF6B6B",
		orange: "#FFB347",
		yellow: "#FFD93D",
		green: "#4ECDC4",
		mint: "#4ECDC4",
		teal: "#5195E2",
		cyan: "#64D2FF",
		blue: "#5195E2",
		indigo: "#7B79F0",
		purple: "#AF52DE",
		pink: "#FF6B9D",
		graphite: "#8E9AAF"
	}
} as const;

export const Typography = {
	fontFamily: {
		display: "System",
		text: "System",
		mono: "Courier New"
	},

	fontSize: {
		largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: "bold" as const },
		title1: { fontSize: 28, lineHeight: 34, fontWeight: "bold" as const },
		title2: { fontSize: 22, lineHeight: 28, fontWeight: "bold" as const },
		title3: { fontSize: 20, lineHeight: 25, fontWeight: "bold" as const },
		headline: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
		body: { fontSize: 17, lineHeight: 22, fontWeight: "400" as const },
		callout: { fontSize: 16, lineHeight: 21, fontWeight: "400" as const },
		subhead: { fontSize: 15, lineHeight: 20, fontWeight: "400" as const },
		footnote: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
		caption1: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
		caption2: { fontSize: 11, lineHeight: 13, fontWeight: "400" as const },
		buttonLarge: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
		buttonMedium: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const },
		buttonSmall: { fontSize: 13, lineHeight: 18, fontWeight: "600" as const }
	},

	fontWeight: {
		regular: "400" as const,
		medium: "500" as const,
		semibold: "600" as const,
		bold: "700" as const
	},

	letterSpacing: {
		tight: -0.5,
		normal: 0,
		wide: 0.5
	}
} as const; // Typography - Apple SF Pro inspired

export const Spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	screen: 15,
	// Top Bar horizontal inset
	topBar: 11,
	base: 16,
	lg: 20,
	xl: 24,
	"2xl": 32,
	"3xl": 40,
	"4xl": 48,
	"5xl": 56,
	"6xl": 64
} as const; // Home — Month horizontal inset

export const BorderRadius = {
	none: 0,
	sm: 4,
	md: 6,
	lg: 8,
	xl: 10,
	card: 12,
	large: 16,
	glass: 20,
	// Event cards + Create Event pill (half of 52px height)
	event: 22,
	pill: 26,
	full: 9999
} as const; // Liquid Glass — Regular — Medium

export const GlassControl = {
	size: 51,
	iconGap: 15,
	pillPaddingH: 14
} as const; // Liquid Glass — Regular — Small toolbar control

export const Shadows = {
	sm: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 2
	},
	md: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4
	},
	lg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.28,
		shadowRadius: 20,
		elevation: 8
	},
	xl: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.32,
		shadowRadius: 24,
		elevation: 12
	},
	event: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.28,
		shadowRadius: 20,
		elevation: 8
	},
	glass: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.25,
		shadowRadius: 24,
		elevation: 6
	},
	cta: {
		shadowColor: "rgba(51, 153, 115, 0.35)",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 1,
		shadowRadius: 18,
		elevation: 6
	},
	floating: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 30,
		elevation: 12
	}
} as const;

export const Animation = {
	duration: {
		instant: 75,
		fast: 150,
		normal: 250,
		slow: 350,
		slower: 500
	},
	easing: {
		linear: "linear",
		easeIn: "ease-in",
		easeOut: "ease-out",
		easeInOut: "ease-in-out",
		spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
		springFast: "cubic-bezier(0.25, 0.1, 0.25, 1.0)"
	},
	spring: {
		default: { mass: 1, stiffness: 100, damping: 15 },
		bouncy: { mass: 1, stiffness: 120, damping: 10 },
		gentle: { mass: 1, stiffness: 80, damping: 20 }
	}
} as const;

export const ZIndex = {
	base: 0,
	dropdown: 100,
	sticky: 200,
	fixed: 300,
	modalBackdrop: 400,
	modal: 500,
	popover: 600,
	toast: 700,
	tooltip: 800
} as const;

export type ColorToken = keyof typeof Colors | keyof typeof Colors.primary;
export type SpacingToken = keyof typeof Spacing;
export type BorderRadiusToken = keyof typeof BorderRadius;
export type ShadowToken = keyof typeof Shadows;
export type TypographyToken = keyof typeof Typography.fontSize;
export type AnimationToken = keyof typeof Animation.duration;

export const GlassColors = {
	background: "#242736",
	fieldBackground: "rgba(37, 56, 52, 0.55)",
	border: "rgba(255, 255, 255, 0.16)",
	borderLight: "rgba(255, 255, 255, 0.2)",
	title: "#EBF2FF",
	label: "#F2F5FA",
	placeholder: "rgba(255, 255, 255, 0.4)",
	placeholderStrong: "rgba(255, 255, 255, 0.45)",
	value: "#66B2FF",
	sectionHeader: "#8CBFFA",
	accent: "#6BDBAD",
	accentText: "#0F1F1A",
	footer: "#8C99A6",
	divider: "rgba(255, 255, 255, 0.12)",
	toggleOff: "#3A3F52",
	backButton: "rgba(255, 255, 255, 0.08)"
} as const;

export const GlassShadows = {
	field: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 4
	},
	button: {
		shadowColor: "#339973",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 18,
		elevation: 8
	}
} as const;
