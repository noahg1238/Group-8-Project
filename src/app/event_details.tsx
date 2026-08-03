import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MiniMonthCalendar } from "../components/calendar/MiniMonthCalendar";
import { EventDetailCard } from "../components/events/EventDetailCard";
import { SearchOverlay } from "../components/search/SearchOverlay";
import { EventDetailsTopBar } from "../components/ui/EventDetailsTopBar";
import { GlassScreen } from "../components/ui/GlassScreen";
import { MotionView } from "../components/ui/MotionView";
import { useDeleteEvent, useEvent } from "../database/events";
import type { Event } from "../database/types";
import { BorderRadius, Colors, Spacing } from "../design/tokens";

function formatEventWhen(event: Event): string {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  if (event.allDay) {
    return format(start, "EEE, MMM d");
  }

  const datePart = format(start, "EEE, MMM d");
  const startTime = format(start, "h:mm");
  const endTime = end ? format(end, "h:mm a") : format(start, "h:mm a");
  return `${datePart} · ${startTime}–${endTime}`;
}

function formatCalendarLabel(event: Event): string {
  if (event.notes?.trim()) return event.notes.trim();
  if (event.description?.trim()) return event.description.trim();
  return "Personal";
}

function isOnlineEvent(event: Event): boolean {
  const location = event.location?.toLowerCase() ?? "";
  return (
    !event.location ||
    location.includes("online") ||
    location.includes("virtual")
  );
}

// Demo fallback when no ?id= is provided in the URL. This is used for the "Add Event" flow, where we want to show a sample event.
const DEMO_EVENT: Event = {
  id: "demo-executive-meeting",
  title: "Executive team meeting",
  description: "Work · Executive",
  location: "631 Confluence Way SE, Calgary, AB T2G 1C3",
  latitude: null,
  longitude: null,
  startDate: new Date(2026, 5, 10, 6, 30).toISOString(),
  endDate: new Date(2026, 5, 10, 7, 30).toISOString(),
  allDay: false,
  color: "#5195E2",
  notes: "Work · Executive",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function EventActionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (Platform.OS === "ios") return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.actionsBackdrop} onPress={onClose}>
        <View style={styles.actionsSheet}>
          <Pressable style={styles.actionsRow} onPress={onEdit}>
            <Text style={styles.actionsRowText}>Edit Event</Text>
          </Pressable>
          <View style={styles.actionsDivider} />
          <Pressable style={styles.actionsRow} onPress={onDelete}>
            <Text style={[styles.actionsRowText, styles.actionsDestructive]}>
              Delete Event
            </Text>
          </Pressable>
          <View style={styles.actionsDivider} />
          <Pressable style={styles.actionsRow} onPress={onClose}>
            <Text style={styles.actionsCancel}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = typeof id === "string" && id.length > 0 ? id : null;
  const { data: loadedEvent, isLoading, isError } = useEvent(eventId);
  const deleteMutation = useDeleteEvent();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionsVisible, setActionsVisible] = useState(false);
  const event = loadedEvent ?? (!eventId ? DEMO_EVENT : null);
  const isDemoEvent = !eventId || event?.id === DEMO_EVENT.id;
  const eventDate = useMemo(
    () => (event ? new Date(event.startDate) : new Date()),
    [event],
  );

  const handleEdit = useCallback(() => {
    if (!event) return;
    setActionsVisible(false);
    router.push({
      pathname: "/add_event_page",
      params: { id: event.id, date: event.startDate },
    });
  }, [event, router]);

  const handleDelete = useCallback(async () => {
    if (!event) return;
    setActionsVisible(false);

    const confirmDelete = () =>
      new Promise<boolean>((resolve) => {
        if (Platform.OS === "web") {
          resolve(window.confirm(`Delete "${event.title}"?`));
          return;
        }
        Alert.alert("Delete Event", `Delete "${event.title}"?`, [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ]);
      });

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      if (isDemoEvent) {
        router.back();
        return;
      }
      if (eventId) {
        await deleteMutation.mutateAsync(eventId);
      }
      router.back();
    } catch (error) {
      console.error("[EventDetails] Delete failed:", error);
      if (Platform.OS === "web") {
        window.alert("Could not delete event.");
      } else {
        Alert.alert("Error", "Could not delete event.");
      }
    }
  }, [event, eventId, isDemoEvent, deleteMutation, router]);

  const showActions = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit Event", "Delete Event"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleEdit();
          if (buttonIndex === 2) void handleDelete();
        },
      );
      return;
    }
    setActionsVisible(true);
  }, [handleEdit, handleDelete]);

  if (isLoading && eventId) {
    return (
      <GlassScreen>
        <EventDetailsTopBar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.text.accent} />
        </View>
      </GlassScreen>
    );
  }

  if (!event) {
    return (
      <GlassScreen>
        <EventDetailsTopBar />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Event not found</Text>
          <Text style={styles.errorBody} onPress={() => router.back()}>
            Go back
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen
      contentStyle={styles.screenContent}
      onBack={() => router.back()}
      hideHeader
    >
      <MotionView enter="fade" duration={220}>
        <EventDetailsTopBar
          onSearchPress={() => {
            setSearchQuery("");
            setSearchVisible(true);
          }}
          onCalendarPress={() => router.push("/year_overview")}
          onSettingsPress={() => router.push("/settings")}
        />
      </MotionView>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MiniMonthCalendar date={eventDate} selectedDate={eventDate} />
        <EventDetailCard
          event={event}
          whenLabel={formatEventWhen(event)}
          calendarLabel={formatCalendarLabel(event)}
          isOnline={!eventId ? true : isOnlineEvent(event)}
          onActionPress={showActions}
        />
        {isError && eventId ? (
          <Text style={styles.fallbackNote}>Showing cached or demo data.</Text>
        ) : null}
      </ScrollView>

      <SearchOverlay
        visible={searchVisible}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => {
          setSearchVisible(false);
          setSearchQuery("");
        }}
        onSuggestionPress={(suggestion) => {
          setSearchVisible(false);
          setSearchQuery("");
          router.push({
            pathname: "./event_details",
            params: { id: suggestion.eventId ?? suggestion.id },
          });
        }}
      />

      <EventActionsModal
        visible={actionsVisible}
        onClose={() => setActionsVisible(false)}
        onEdit={handleEdit}
        onDelete={() => void handleDelete()}
      />
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 15,
    color: Colors.text.accent,
  },
  fallbackNote: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
  actionsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 28,
  },
  actionsSheet: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.large,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.event.border,
  },
  actionsRow: {
    paddingVertical: 16,
    alignItems: "center",
  },
  actionsRowText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  actionsDestructive: {
    color: Colors.error,
  },
  actionsCancel: {
    fontSize: 16,
    color: Colors.text.tertiary,
  },
  actionsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.event.border,
  },
});
