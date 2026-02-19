package com.focusshield

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents

/**
 * ScreenUnlockReceiver
 * ────────────────────
 * Wireframe: "Detect unlock events"
 *
 * Fired when user unlocks the device. We record UNLOCK event and
 * the foreground app at that moment (first app user sees).
 */
class ScreenUnlockReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_USER_PRESENT) return

        // At unlock, the launcher or last-used app is foreground
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return
        val now = System.currentTimeMillis()
        val stats = usm.queryEvents(now - 3000, now)
        val event = UsageEvents.Event()
        var lastPackage: String? = null
        var lastTime = 0L

        while (stats.hasNextEvent()) {
            stats.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED && event.timeStamp > lastTime) {
                lastTime = event.timeStamp
                lastPackage = event.packageName
            }
        }

        val pkg = lastPackage ?: "unknown"
        if (pkg != context.packageName) {
            AppUsageStatsDatabase.insertAppEvent(context, pkg, AppUsageStatsDatabase.EVENT_UNLOCK, now)
        }
    }
}
