import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 30,
			refetchOnReconnect: false,
			refetchOnWindowFocus: true
		},
		mutations: {
			retry: 1
		}
	}
});

export const queryKeys = {
	events: {
		all: ["events"] as const,
		lists: () => [...queryKeys.events.all, "list"] as const,
		list: (filters: { year?: number; month?: number }) => [...queryKeys.events.lists(), filters] as const,
		details: () => [...queryKeys.events.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.events.details(), id] as const
	},
	settings: { all: ["settings"] as const },
	auth: { all: ["auth"] as const }
} as const;
