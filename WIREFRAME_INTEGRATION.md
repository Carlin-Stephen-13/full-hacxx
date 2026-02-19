# Wireframe Integration — Distraction Detection & Psychological Interventions

This document describes the Android API / Kotlin integration of the wireframe events for distraction detection and psychological interventions.

## Overview

| Wireframe Step | Implementation |
|----------------|----------------|
| **Collect app usage stats (3-5 days)** | `UsageStatsCollectorService` + `AppUsageStatsDatabase` |
| **Background monitoring** | `FocusBlockerService` records usage; `UsageStatsCollectorService` runs baseline collection |
| **Detect foreground app** | `UsageStatsManager.queryEvents()` |
| **Detect unlock events** | `ScreenUnlockReceiver` (ACTION_USER_PRESENT) |
| **App switching** | Recorded in `AppUsageStatsDatabase.EVENT_APP_SWITCH` |
| **Duration per app** | Stored in `app_durations` table |
| **IS IT DISTRACTION LOOP?** | `DistractionAnalyzer.isDistractionLoop()` |
| **UsageStatsManager path** | `FocusBlockerService` + `DistractionAnalyzer` |
| **Accessibility Service path** | `AccessibilityBlockerService` (behavioral intervention) |
| **Psychological interventions** | Grayscale overlay, "Take a breath" messaging, mute notifications |

## New Files

| File | Purpose |
|------|---------|
| `AppUsageStatsDatabase.kt` | Local SQLite DB for app events and durations |
| `UsageStatsCollectorService.kt` | Foreground service for baseline collection |
| `DistractionAnalyzer.kt` | Pattern detection (work hours 9-5, evening 8-11pm) |
| `PsychologicalInterventions.kt` | Grayscale, mute, delay, reduced sensitivity prefs |
| `DistractionModeManager.kt` | API to start/stop collection and toggle psychological mode |
| `ScreenUnlockReceiver.kt` | Records unlock events to DB |

## Usage from MainActivity

Add UI controls and wire them:

```kotlin
// Start baseline collection (run for 3-5 days before distraction analysis)
DistractionModeManager.startBaselineCollection(this)

// Stop baseline collection
DistractionModeManager.stopBaselineCollection(this)

// Check if enough data for distraction analysis
val ready = DistractionModeManager.hasEnoughBaseline(this)

// Enable psychological interventions (grayscale, "Take a breath" instead of hard block)
DistractionModeManager.setPsychologicalMode(this, true)

// Disable psychological mode (use standard blocking)
DistractionModeManager.setPsychologicalMode(this, false)
```

## Flow

1. **Initial setup**: User grants Usage Access and Overlay. Optionally enable Accessibility Service.
2. **Baseline**: Call `DistractionModeManager.startBaselineCollection()` — runs `UsageStatsCollectorService` to collect app usage over 3-5 days.
3. **Pattern detection**: After baseline, `DistractionAnalyzer` uses stored data to detect:
   - Known distracting apps during work hours (9-5) when not in baseline
   - Known distracting apps during evening (8-11pm)
   - Unusual apps during typical evening slot
4. **Intervention**: If pattern detected:
   - **Psychological mode ON**: Shows "Take a breath before [app]" overlay; grayscale icon if enabled
   - **Psychological mode OFF** (or hard block session): Standard block screen
5. **Standard blocking**: Focus sessions with selected apps still use full blocking as before.

## Android APIs Used

- **UsageStatsManager**: `queryEvents()` for foreground app, `queryUsageStats()` for historical data
- **Accessibility Service**: `TYPE_WINDOW_STATE_CHANGED` for app/window events; `performGlobalAction()` available
- **SQLiteDatabase**: Local storage (no Room dependency)
- **BroadcastReceiver**: `ACTION_USER_PRESENT` for unlock events
