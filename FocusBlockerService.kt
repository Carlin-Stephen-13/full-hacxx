package com.focusshield

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.*
import androidx.core.app.NotificationCompat

/**
 * FocusBlockerService
 * ───────────────────
 * A foreground Service that runs for the duration of a focus session.
 * Every 500ms it checks which app is in the foreground using UsageStatsManager.
 * If that app is in the blocked list, it immediately launches BlockedActivity
 * on top of it — effectively preventing the user from using the blocked app.
 *
 * HOW IT WORKS (UsageStats approach):
 *   1. We query UsageStatsManager for events in the last 3 seconds.
 *   2. We find the most recent ACTIVITY_RESUMED event.
 *   3. If the package of that event is blocked → launch BlockedActivity.
 *
 * REQUIRED PERMISSION: android.permission.PACKAGE_USAGE_STATS
 *   → Must be granted manually by user via Settings > Apps > Special app access > Usage access
 *   → We guide the user to this screen in MainActivity before starting a session.
 */
class FocusBlockerService : Service() {

    companion object {
        const val ACTION_START = "com.focusshield.START"
        const val ACTION_STOP  = "com.focusshield.STOP"
        const val NOTIF_CHANNEL_ID = "focus_shield_channel"
        const val NOTIF_ID = 1001

        fun startService(ctx: Context) {
            val intent = Intent(ctx, FocusBlockerService::class.java).apply {
                action = ACTION_START
            }
            ctx.startForegroundService(intent)
        }

        fun stopService(ctx: Context) {
            val intent = Intent(ctx, FocusBlockerService::class.java).apply {
                action = ACTION_STOP
            }
            ctx.startService(intent)
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var usageStatsManager: UsageStatsManager
    private var lastBlockedPackage: String = ""
    private var lastBlockedTime: Long = 0L

    private val monitorRunnable = object : Runnable {
        override fun run() {
            checkForegroundApp()
            handler.postDelayed(this, 500) // poll every 500ms
        }
    }

    override fun onCreate() {
        super.onCreate()
        usageStatsManager = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                startForeground(NOTIF_ID, buildNotification())
                handler.post(monitorRunnable)
            }
            ACTION_STOP -> {
                handler.removeCallbacks(monitorRunnable)
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY // Restart if killed by system
    }

    override fun onDestroy() {
        handler.removeCallbacks(monitorRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ─── Core Blocking Logic ──────────────────────────────────────────────────

    private var lastRecordedPackage: String? = null
    private var lastRecordedTimeMs: Long = 0L

    private fun checkForegroundApp() {
        val session = SessionManager.getActiveSession(this)

        // Session expired → stop service
        if (session == null) {
            stopService(this)
            return
        }

        val foregroundPackage = getForegroundPackage() ?: return

        // Wireframe: record usage to local DB for distraction analysis
        recordUsageForDistractionAnalysis(foregroundPackage)

        // Skip our own app and the block screen itself
        if (foregroundPackage == packageName) return

        // Wireframe: If distraction pattern detected and psychological mode enabled, use interventions
        if (PsychologicalInterventions.usePsychologicalMode(this)) {
            val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
            val pattern = DistractionAnalyzer.isDistractionLoop(this, foregroundPackage, hour)
            if (pattern != null) {
                val now = System.currentTimeMillis()
                if (foregroundPackage == lastBlockedPackage && now - lastBlockedTime < 2000L) {
                    updateNotification(session.remainingSeconds)
                    return
                }
                lastBlockedPackage = foregroundPackage
                lastBlockedTime = now
                applyPsychologicalIntervention(foregroundPackage, session.remainingSeconds)
                updateNotification(session.remainingSeconds)
                return
            }
        }

        if (session.blockedPackages.contains(foregroundPackage)) {
            // Debounce: don't spam BlockedActivity for the same package
            val now = System.currentTimeMillis()
            if (foregroundPackage == lastBlockedPackage && now - lastBlockedTime < 2000L) return

            lastBlockedPackage = foregroundPackage
            lastBlockedTime = now

            // Launch the block screen on top of the blocked app
            launchBlockScreen(foregroundPackage, session.remainingSeconds)
        } else {
            // Reset debounce when user navigates away from blocked app
            if (foregroundPackage != lastBlockedPackage) {
                lastBlockedPackage = ""
            }
        }

        // Update notification with remaining time
        updateNotification(session.remainingSeconds)
    }

    /**
     * Gets the package name of the app currently in the foreground.
     * Uses UsageStatsManager.queryEvents() which is accurate to the second.
     */
    private fun getForegroundPackage(): String? {
        val now = System.currentTimeMillis()
        val stats = usageStatsManager.queryEvents(now - 3000, now)
        val event = UsageEvents.Event()
        var lastPackage: String? = null
        var lastTime = 0L

        while (stats.hasNextEvent()) {
            stats.getNextEvent(event)
            // ACTIVITY_RESUMED = 1 (app came to foreground)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED && event.timeStamp > lastTime) {
                lastTime = event.timeStamp
                lastPackage = event.packageName
            }
        }
        return lastPackage
    }

    /** Wireframe: Store foreground app, app switching, and duration in local DB. */
    private fun recordUsageForDistractionAnalysis(foregroundPackage: String) {
        val now = System.currentTimeMillis()
        if (foregroundPackage == packageName) return
        if (lastRecordedPackage != null && lastRecordedPackage != foregroundPackage) {
            AppUsageStatsDatabase.insertAppEvent(this, lastRecordedPackage!!, AppUsageStatsDatabase.EVENT_APP_SWITCH, now)
            AppUsageStatsDatabase.insertAppDuration(this, lastRecordedPackage!!, lastRecordedTimeMs, now)
        }
        if (lastRecordedPackage != foregroundPackage) {
            AppUsageStatsDatabase.insertAppEvent(this, foregroundPackage, AppUsageStatsDatabase.EVENT_FOREGROUND, now)
        }
        lastRecordedPackage = foregroundPackage
        lastRecordedTimeMs = now
    }

    /** Wireframe: Psychological intervention instead of blocking — show delay / grayscale overlay. */
    private fun applyPsychologicalIntervention(packageName: String, remainingSeconds: Long) {
        launchBlockScreen(packageName, remainingSeconds, psychologicalMode = true)
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

    // ─── Notification ─────────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            NOTIF_CHANNEL_ID,
            "Focus Session",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Active focus session blocking distracting apps"
            setShowBadge(false)
        }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(channel)
    }

    private fun buildNotification(remainingSeconds: Long = 0): Notification {
        val session = SessionManager.getActiveSession(this)
        val remaining = session?.remainingSeconds ?: remainingSeconds
        val mins = remaining / 60
        val secs = remaining % 60
        val timeStr = if (remaining > 0) "%02d:%02d remaining".format(mins, secs) else "Starting…"

        val stopIntent = PendingIntent.getService(
            this, 0,
            Intent(this, FocusBlockerService::class.java).apply { action = ACTION_STOP },
            PendingIntent.FLAG_IMMUTABLE
        )
        val openIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NOTIF_CHANNEL_ID)
            .setContentTitle("🛡 Focus Shield Active")
            .setContentText("${session?.blockedPackages?.size ?: 0} apps blocked · $timeStr")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .setContentIntent(openIntent)
            .addAction(android.R.drawable.ic_delete, "End Session", stopIntent)
            .build()
    }

    private fun updateNotification(remainingSeconds: Long) {
        val nm = getSystemService(NotificationManager::class.java)
        nm.notify(NOTIF_ID, buildNotification(remainingSeconds))
    }
}
