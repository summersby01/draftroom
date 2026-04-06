"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import {
  DEFAULT_DRAFT_ROOM_PREFERENCES,
  DRAFT_ROOM_PREFERENCES_KEY,
  mergeDraftRoomPreferences,
  type DraftRoomPreferences
} from "@/lib/profile-preferences";

const TIME_FORMAT_OPTIONS = [
  { value: "12h", label: "12-hour" },
  { value: "24h", label: "24-hour" }
] as const;

export function ProfilePreferences() {
  const [preferences, setPreferences] = useState<DraftRoomPreferences>(DEFAULT_DRAFT_ROOM_PREFERENCES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_ROOM_PREFERENCES_KEY);
      if (stored) {
        setPreferences(mergeDraftRoomPreferences(JSON.parse(stored) as Partial<DraftRoomPreferences>));
      }
    } catch {
      // Ignore malformed local settings and fall back to defaults.
    } finally {
      setIsReady(true);
    }
  }, []);

  function updatePreference<Key extends keyof DraftRoomPreferences>(key: Key, value: DraftRoomPreferences[Key]) {
    const next = {
      ...preferences,
      [key]: value
    };

    setPreferences(next);

    try {
      window.localStorage.setItem(DRAFT_ROOM_PREFERENCES_KEY, JSON.stringify(next));
      toast.success("Updated");
    } catch {
      toast.error("Could not save preferences");
    }
  }

  if (!isReady) {
    return <div className="rounded-[20px] bg-surface-soft px-4 py-4 text-sm text-ink-soft">Loading preferences…</div>;
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-line bg-white">
      <PreferenceRow
        label="Default due time"
        value={preferences.defaultDueTime || "Not set"}
        helper="Used for new project forms on this device"
      >
        <Input
          type="time"
          value={preferences.defaultDueTime}
          onChange={(event) => updatePreference("defaultDueTime", event.target.value)}
          className="mt-3"
        />
      </PreferenceRow>

      <PreferenceRow
        label="Time format"
        value={preferences.timeFormat === "12h" ? "12-hour" : "24-hour"}
        helper={`Preview: ${preferences.timeFormat === "12h" ? "6:00 PM" : "18:00"}`}
      >
        <Select
          options={TIME_FORMAT_OPTIONS.map((option) => ({ ...option }))}
          value={preferences.timeFormat}
          onChange={(event) => updatePreference("timeFormat", event.target.value as DraftRoomPreferences["timeFormat"])}
          className="mt-3"
        />
      </PreferenceRow>

      <PreferenceRow
        label="Default project type"
        value={PROJECT_TYPE_OPTIONS.find((option) => option.value === preferences.defaultProjectType)?.label ?? "Lyrics"}
      >
        <Select
          options={PROJECT_TYPE_OPTIONS}
          value={preferences.defaultProjectType}
          onChange={(event) => updatePreference("defaultProjectType", event.target.value)}
          className="mt-3"
        />
      </PreferenceRow>
    </div>
  );
}

function PreferenceRow({
  label,
  value,
  helper,
  children
}: {
  label: string;
  value: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden border-b border-line last:border-b-0">
      <div className="flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden px-4 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{label}</p>
          {helper ? <p className="mt-1 text-xs text-ink-soft">{helper}</p> : null}
        </div>
        <div className="flex min-w-0 shrink items-center gap-2 text-sm text-ink-soft">
          <span className="truncate">{value}</span>
          <ChevronRight className="h-4 w-4 text-ink-soft/60" />
        </div>
      </div>
      <div className="min-w-0 max-w-full overflow-hidden px-4 pb-4">{children}</div>
    </div>
  );
}
