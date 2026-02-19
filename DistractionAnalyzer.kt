package com.focusshield

import android.content.Context

/**
 * DistractionAnalyzer
 * ───────────────────
 * Implements wireframe logic: "IS IT DISTRACTION LOOP?"
 *
 * Analyzes repeated behavior over 3-5 days:
 * - MON-FRI 9-5: Work hours — establish baseline of "productive" apps
 * - 8-11pm: User typically uses PARTICULAR APP — if anything OTHER than that
 *   in that window = monitoring of distraction
 *
 * Pattern detection: deviation from established baseline = distraction.
 */
object DistractionAnalyzer {

    // Work hours: 9am-5pm (9-17)
    private const val WORK_START_HOUR = 9
    private const val WORK_END_HOUR = 17

    // Typical evening distraction window: 8-11pm (20-23)
    private const val EVENING_START_HOUR = 20
    private const val EVENING_END_HOUR = 23

    // Minimum days of data to establish baseline
    const val MIN_DAYS_FOR_BASELINE = 3

    data class DistractionPattern(
        val packageName: String,
        val reason: String,
        val hour: Int,
        val isOutsideBaseline: Boolean
    )

    data class BaselineProfile(
        val workHourApps: Set<String>,    // Apps typically used 9-5
        val eveningApps: Set<String>,     // Apps typically used 8-11pm
        val totalDaysAnalyzed: Int
    )

    /**
     * Establish baseline from last 3-5 days of usage.
     * Wireframe: "Analyze repeated behavior over 3-5 days"
     */
    fun buildBaseline(context: Context, days: Int = 5): BaselineProfile {
        val durations = AppUsageStatsDatabase.getDurationsSince(context, days)
        val workApps = mutableSetOf<String>()
        val eveningApps = mutableSetOf<String>()

        for (d in durations) {
            if (d.hour in WORK_START_HOUR until WORK_END_HOUR) {
                workApps.add(d.packageName)
            }
            if (d.hour in EVENING_START_HOUR..EVENING_END_HOUR) {
                eveningApps.add(d.packageName)
            }
        }

        return BaselineProfile(
            workHourApps = workApps,
            eveningApps = eveningApps,
            totalDaysAnalyzed = days
        )
    }

    /**
     * Check if current app usage indicates a DISTRACTION PATTERN.
     * Wireframe: "8-11pm - USER USE PARTICULAR APP, IF ANYTHING OTHER
     * THAN THAT MEANS MONITORING OF DISTRACTION"
     */
    fun isDistractionLoop(
        context: Context,
        packageName: String,
        hour: Int,
        knownDistractingPackages: Set<String> = KNOWN_DISTRACTING_PACKAGES
    ): DistractionPattern? {
        val baseline = buildBaseline(context, MIN_DAYS_FOR_BASELINE)

        // Skip our own app
        if (packageName == context.packageName) return null

        // Known distracting app in evening (8-11pm) = likely distraction loop
        if (packageName in knownDistractingPackages && hour in EVENING_START_HOUR..EVENING_END_HOUR) {
            return DistractionPattern(
                packageName = packageName,
                reason = "Known distracting app during evening hours (8-11pm)",
                hour = hour,
                isOutsideBaseline = packageName !in baseline.eveningApps
            )
        }

        // Known distracting app during work hours (9-5) when not in work baseline
        if (packageName in knownDistractingPackages && hour in WORK_START_HOUR until WORK_END_HOUR) {
            if (packageName !in baseline.workHourApps) {
                return DistractionPattern(
                    packageName = packageName,
                    reason = "Distracting app during work hours (not in baseline)",
                    hour = hour,
                    isOutsideBaseline = true
                )
            }
        }

        // App used in evening that's NOT in user's typical evening apps
        if (hour in EVENING_START_HOUR..EVENING_END_HOUR && baseline.eveningApps.isNotEmpty()) {
            if (packageName !in baseline.eveningApps && packageName in knownDistractingPackages) {
                return DistractionPattern(
                    packageName = packageName,
                    reason = "Unusual app during typical evening slot",
                    hour = hour,
                    isOutsideBaseline = true
                )
            }
        }

        return null
    }

    /** Package names of known distracting apps (subset of KNOWN_DISTRACTING_APPS). */
    private val KNOWN_DISTRACTING_PACKAGES = setOf(
        "com.instagram.android",
        "com.zhiliaoapp.musically",
        "com.snapchat.android",
        "com.twitter.android",
        "com.facebook.katana",
        "com.facebook.orca",
        "com.whatsapp",
        "org.telegram.messenger",
        "com.discord",
        "com.reddit.frontpage",
        "com.pinterest",
        "com.google.android.youtube",
        "com.netflix.mediaclient",
        "tv.twitch.android.app",
        "com.spotify.music",
        "com.king.candycrushsaga",
        "com.roblox.client"
    )
}
