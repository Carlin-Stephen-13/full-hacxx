package com.focusshield

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

/**
 * AccessibilityBlockerService
 * ────────────────────────────
 * Alternative (and complementary) blocking mechanism using Android's
 * Accessibility Service API.
 *
 * ADVANTAGES over UsageStats approach:
 *   • No need for PACKAGE_USAGE_STATS permission
 *   • Event-driven (instant) rather than polling (500ms delay)
 *   • Works on more Android versions
 *
 * DISADVANTAGES:
 *   • User must manually enable in Settings > Accessibility > FocusShield
 *   • More sensitive permission — some app stores scrutinize it
 *
 * HOW IT WORKS:
 *   Android fires TYPE_WINDOW_STATE_CHANGED whenever a new Activity
 *   comes to the foreground. We intercept this event, check the package
 *   name, and if it's blocked → immediately launch BlockedActivity on top.
 *
 * SETUP REQUIRED:
 *   User must go to Settings → Accessibility → Installed services → FocusShield
 *   and toggle it ON. We redirect them there from MainActivity.
 */
class AccessibilityBlockerService : AccessibilityService() {

    override fun onServiceConnected() {
        // Configure which events we want to listen to
        serviceInfo = serviceInfo.apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            notificationTimeout = 100 // ms between same events
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return

        // Ignore our own app and the block screen
        if (packageName == this.packageName) return

        // Check if this package is blocked in the current session
        if (!SessionManager.isBlocked(this, packageName)) return

        val session = SessionManager.getActiveSession(this) ?: return

        // Launch the block screen immediately
        val intent = Intent(this, BlockedActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(BlockedActivity.EXTRA_PACKAGE_NAME, packageName)
            putExtra(BlockedActivity.EXTRA_REMAINING_SECONDS, session.remainingSeconds)
        }
        startActivity(intent)
    }

    override fun onInterrupt() {
        // Called when the service is interrupted — nothing to clean up
    }
}
