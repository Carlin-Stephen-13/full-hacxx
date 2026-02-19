package com.focusshield

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.*
import androidx.core.app.NotificationCompat

/**
 * UsageStatsCollectorService
 * ──────────────────────────
 * Implements wireframe: "Background Monitoring Starts"
 *
 * Collects:
 *   • Detect foreground app
 *   • Detect unlock events (via ScreenUnlockReceiver)
 *   • App switching
 *   • Duration of usage per app
 *
 * Stores all in local database (AppUsageStatsDatabase).
 *
 * Wireframe: "BASED ON THE USER'S APP STATS" → UsageStatsManager
 * Run this service to build baseline over 3-5 days before distraction analysis.
 */
class UsageStatsCollectorService : Service() {

    companion object {
        const val ACTION_START = "com.focusshield.COLLECTOR_START"
        const val ACTION_STOP = "com.focusshield.COLLECTOR_STOP"
        const val NOTIF_CHANNEL_ID = "usage_collector_channel"
        const val NOTIF_ID = 1002
        private const val POLL_INTERVAL_MS = 2000L  // Every 2 seconds when collecting

        fun startService(ctx: Context) {
            val i = Intent(ctx, UsageStatsCollectorService::class.java).apply { action = ACTION_START }
            ctx.startForegroundService(i)
        }

        fun stopService(ctx: Context) {
            val i = Intent(ctx, UsageStatsCollectorService::class.java).apply { action = ACTION_STOP }
            ctx.startService(i)
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private lateinit var usageStatsManager: UsageStatsManager
    private var lastForegroundPackage: String? = null
    private var lastForegroundTimeMs: Long = 0L

    private val collectRunnable = object : Runnable {
        override fun run() {
            collectAndStoreUsage()
            handler.postDelayed(this, POLL_INTERVAL_MS)
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
                lastForegroundPackage = null
                lastForegroundTimeMs = System.currentTimeMillis()
                handler.post(collectRunnable)
            }
            ACTION_STOP -> {
                // Record final duration for current app before stopping
                lastForegroundPackage?.let { pkg ->
                    if (pkg != packageName) {
                        AppUsageStatsDatabase.insertAppDuration(
                            this, pkg, lastForegroundTimeMs, System.currentTimeMillis()
                        )
                    }
                }
                handler.removeCallbacks(collectRunnable)
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(collectRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun collectAndStoreUsage() {
        val now = System.currentTimeMillis()
        val foregroundPkg = getForegroundPackage() ?: return

        // Skip our own app
        if (foregroundPkg == packageName) return

        if (lastForegroundPackage != null && lastForegroundPackage != foregroundPkg) {
            // App switch detected
            AppUsageStatsDatabase.insertAppEvent(this, lastForegroundPackage!!, AppUsageStatsDatabase.EVENT_APP_SWITCH, now)
            AppUsageStatsDatabase.insertAppDuration(this, lastForegroundPackage!!, lastForegroundTimeMs, now)
        }

        if (lastForegroundPackage != foregroundPkg) {
            AppUsageStatsDatabase.insertAppEvent(this, foregroundPkg, AppUsageStatsDatabase.EVENT_FOREGROUND, now)
        }

        lastForegroundPackage = foregroundPkg
        lastForegroundTimeMs = now

        // Prune old data periodically
        if (now % 60000 < POLL_INTERVAL_MS) {
            AppUsageStatsDatabase.pruneOldData(this)
        }

        updateNotification()
    }

    private fun getForegroundPackage(): String? {
        val now = System.currentTimeMillis()
        val stats = usageStatsManager.queryEvents(now - 5000, now)
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
        return lastPackage
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            NOTIF_CHANNEL_ID,
            "Usage Collection",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Collecting app usage for distraction analysis"
            setShowBadge(false)
        }
        (getSystemService(NotificationManager::class.java) as NotificationManager).createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, NOTIF_CHANNEL_ID)
            .setContentTitle("📊 Usage Collection")
            .setContentText("Building baseline for distraction detection")
            .setSmallIcon(android.R.drawable.ic_menu_agenda)
            .setOngoing(true)
            .setContentIntent(openIntent)
            .build()
    }

    private fun updateNotification() {
        val nm = getSystemService(NotificationManager::class.java) as NotificationManager
        nm.notify(NOTIF_ID, buildNotification())
    }
}
