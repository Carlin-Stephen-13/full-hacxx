package com.focusshield

import android.content.Context
import android.content.SharedPreferences

/**
 * DistractionModeManager
 * ──────────────────────
 * Central API to control wireframe features:
 *
 * 1. Baseline collection — run UsageStatsCollectorService for 3-5 days
 *    to build app usage profile before distraction analysis
 * 2. Psychological mode — use grayscale, delay, etc. instead of hard blocking
 *    when distraction pattern is detected
 */
object DistractionModeManager {

    private const val PREFS = "distraction_mode_prefs"
    private const val KEY_COLLECTOR_ACTIVE = "collector_active"

    private fun prefs(ctx: Context): SharedPreferences =
        ctx.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    /** Start collecting usage stats for baseline (wireframe: "Background Monitoring Starts"). */
    fun startBaselineCollection(context: Context) {
        prefs(context).edit().putBoolean(KEY_COLLECTOR_ACTIVE, true).apply()
        UsageStatsCollectorService.startService(context)
    }

    /** Stop baseline collection. */
    fun stopBaselineCollection(context: Context) {
        prefs(context).edit().putBoolean(KEY_COLLECTOR_ACTIVE, false).apply()
        UsageStatsCollectorService.stopService(context)
    }

    /** Whether baseline collector is running. */
    fun isCollecting(context: Context): Boolean =
        prefs(context).getBoolean(KEY_COLLECTOR_ACTIVE, false)

    /** Use psychological interventions (grayscale, delay) when distraction pattern detected. */
    fun setPsychologicalMode(context: Context, enabled: Boolean) {
        PsychologicalInterventions.setPsychologicalMode(context, enabled)
    }

    fun isPsychologicalMode(context: Context): Boolean =
        PsychologicalInterventions.usePsychologicalMode(context)

    /** Check if we have enough data for distraction analysis (3+ days). */
    fun hasEnoughBaseline(context: Context): Boolean {
        val durations = AppUsageStatsDatabase.getDurationsSince(context, DistractionAnalyzer.MIN_DAYS_FOR_BASELINE)
        val uniqueDays = durations.map { it.startMs / (24 * 60 * 60 * 1000) }.distinct().size
        return uniqueDays >= DistractionAnalyzer.MIN_DAYS_FOR_BASELINE
    }
}
