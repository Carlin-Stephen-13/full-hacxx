package com.focusshield

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * BootReceiver
 * ─────────────
 * Restarts the FocusBlockerService after the device reboots,
 * if a focus session was still active when the device shut down.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val session = SessionManager.getActiveSession(context) ?: return
        // Only restart if session hasn't expired
        if (session.isActive) {
            FocusBlockerService.startService(context)
        }
    }
}
