export type DraftRoomTimeFormat = "12h" | "24h";

export type DraftRoomPreferences = {
  defaultDueTime: string;
  timeFormat: DraftRoomTimeFormat;
  defaultProjectType: string;
};

export const DRAFT_ROOM_PREFERENCES_KEY = "draft-room-preferences";

export const DEFAULT_DRAFT_ROOM_PREFERENCES: DraftRoomPreferences = {
  defaultDueTime: "",
  timeFormat: "12h",
  defaultProjectType: "lyrics"
};

export function mergeDraftRoomPreferences(
  value: Partial<DraftRoomPreferences> | null | undefined
): DraftRoomPreferences {
  return {
    ...DEFAULT_DRAFT_ROOM_PREFERENCES,
    ...(value ?? {})
  };
}

