package com.focusshield

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import java.util.Calendar

/**
 * AccessibilityBlockerService
 * ────────────────────────────
 * Alternative (and complementary) blocking mechanism using Android's
 * Accessibility Service API.
 *
 * Wireframe: "BASED ON THE BEHAVIOUR OF THE USER → ANDROID API: Accessibility Service"
 * When distraction pattern is detected, this service handles behavioral-level intervention.
 *
 * Capabilities (wireframe):
 *   • Detect foreground app
 *   • Track app/window events
 *   • Observe clicks and scrolls (via event types)
 *   • Get screen state info
 *   • Perform global actions
 *
 * ADVANTAGES over UsageStats approach:
 *   • No need for PACKAGE_USAGE_STATS permission
 *   • Event-driven (instant) rather than polling (500ms delay)
 *   • Works on more Android versions
 *
 * HOW IT WORKS:
 *   Android fires TYPE_WINDOW_STATE_CHANGED whenever a new Activity
 *   comes to the foreground. We intercept this event:
 *   1. Record usage for distraction analysis (local DB)
 *   2. If distraction pattern + psychological mode → intervention
 *   3. If blocked in session → launch BlockedActivity on top.
 */
class AccessibilityBlockerService : AccessibilityService() {

    override fun onServiceConnected() {
        serviceInfo = serviceInfo.apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 100
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Ignore our own app and the block screen
        if (packageName == this.packageName) return

        // Wireframe: Record foreground app event for local DB (app switching / duration)
        val now = System.currentTimeMillis()
        AppUsageStatsDatabase.insertAppEvent(this, packageName, AppUsageStatsDatabase.EVENT_FOREGROUND, now)

        // Wireframe: If psychological mode + distraction pattern → intervention instead of block
        if (PsychologicalInterventions.usePsychologicalMode(this)) {
            val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val pattern = DistractionAnalyzer.isDistractionLoop(this, packageName, hour)
            if (pattern != null) {
                val session = SessionManager.getActiveSession(this)
                val remaining = session?.remainingSeconds ?: 0L
                launchBlockScreen(packageName, remaining, psychologicalMode = true)
                return
            }
        }

        // Standard blocking: check if package is in blocked list
        if (!SessionManager.isBlocked(this, packageName)) return

        val session = SessionManager.getActiveSession(this) ?: return

        launchBlockScreen(packageName, session.remainingSeconds, psychologicalMode = false)
    }

    private fun launchBlockScreen(packageName: String, remainingSeconds: Long, psychologicalMode: Boolean = false) {
        val intent = Intent(this, BlockedActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(BlockedActivity.EXTRA_PACKAGE_NAME, packageName)
            putExtra(BlockedActivity.EXTRA_REMAINING_SECONDS, remainingSeconds)
            putExtra(BlockedActivity.EXTRA_PSYCHOLOGICAL_MODE, psychologicalMode)
        }
        startActivity(intent)
    }

    override fun onInterrupt() {
        // Called when the service is interrupted — nothing to clean up
    }
}
