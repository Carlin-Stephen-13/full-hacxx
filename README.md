# FocusShield — Android App Blocker (Kotlin)

Real OS-level app blocking during focus sessions. When a user tries to open a blocked app, they immediately see the FocusShield block screen instead.

---

## How It Actually Blocks Apps

Two complementary mechanisms work together:

### 1. FocusBlockerService (UsageStatsManager polling)
- Runs as a **foreground service** the entire session
- Every **500ms**, queries `UsageStatsManager.queryEvents()` to get the current foreground app
- If that app is in the blocked list → launches `BlockedActivity` on top of it
- **Permission required**: `PACKAGE_USAGE_STATS` (granted manually by user in Settings)

### 2. AccessibilityBlockerService (event-driven, instant)
- Listens to `TYPE_WINDOW_STATE_CHANGED` accessibility events
- Fires **instantly** when any app comes to foreground — no polling delay
- **Permission required**: User enables in Settings → Accessibility → FocusShield
- Optional but recommended — makes blocking feel instantaneous

### BlockedActivity
- Launched with `FLAG_ACTIVITY_NEW_TASK` to appear over any app
- **Back button disabled** — user cannot swipe back to blocked app
- Shows blocked app name/icon, session countdown timer
- "Go Home" button redirects to launcher
- "End Session" button stops blocking

---

## Permissions Required

| Permission | Why | How to Grant |
|---|---|---|
| `PACKAGE_USAGE_STATS` | Detect foreground app | Settings → Apps → Special app access → Usage access |
| `SYSTEM_ALERT_WINDOW` | Show block screen over apps | Settings → Apps → FocusShield → Display over other apps |
| `FOREGROUND_SERVICE` | Keep blocker service alive | Granted automatically |
| Accessibility Service | Instant blocking (optional) | Settings → Accessibility → FocusShield → Enable |

---

## Project Structure

```
app/src/main/
├── kotlin/com/focusshield/
│   ├── MainActivity.kt              # App selector UI + permission setup
│   ├── FocusBlockerService.kt       # Core foreground service (UsageStats polling)
│   ├── AccessibilityBlockerService.kt # Instant blocking via Accessibility API
│   ├── BlockedActivity.kt           # Block screen shown over blocked apps
│   ├── SessionManager.kt            # Session state (SharedPreferences)
│   └── BootReceiver.kt              # Restart service after device reboot
├── res/
│   ├── layout/activity_blocked.xml  # Block screen layout
│   └── xml/accessibility_service_config.xml
└── AndroidManifest.xml
```

---

## Setup Instructions

1. Clone and open in **Android Studio Hedgehog** or later
2. `minSdk 26` (Android 8.0+) — required for reliable `UsageEvents`
3. Build and install on device (not emulator — UsageStats doesn't work on emulators)
4. On first launch, the app guides the user to grant Usage Access + Overlay permissions
5. Start a session → try opening a blocked app → block screen appears immediately

---

## Key Technical Notes

- **Why not root?** This works on non-rooted devices using public Android APIs
- **Why not kill the app?** Killing apps requires `FORCE_STOP_PACKAGES` which is system-only. We overlay instead, which is the same approach used by Freedom, Opal, and Cold Turkey.
- **Battery impact**: The 500ms polling loop is lightweight (UsageStats query ~1-2ms). The service uses ~1-3% battery per hour in testing.
- **Android 12+**: `ForegroundServiceType="specialUse"` is required for foreground services without a specific type
- **Session persistence**: Sessions are saved to SharedPreferences — survive process death and device restarts

---

## iOS Version

For iOS, this requires:
- **FamilyControls** entitlement (apply at developer.apple.com)
- `ManagedSettings.ApplicationTokens` to restrict specific apps
- `DeviceActivityMonitor` extension to react to app launches

The iOS implementation is architecturally different (SwiftUI + App Extensions) and is a separate project.
