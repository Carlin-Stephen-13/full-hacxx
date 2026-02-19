package com.focusshield

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.os.Build
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * PsychologicalInterventions
 * ──────────────────────────
 * Wireframe: "Psychological ways to handle Rather than blocking based on the time limits"
 *
 * Interventions:
 *   1. Grayscale Mode — reduce visual appeal
 *   2. Turn off Notifications from the distraction app
 *   3. Use minimal app icons — (requires launcher; we provide helper for future use)
 *   4. Delay opening apps — intercept and add delay before showing
 *   5. Making mobile sensitivity low — reduce touch responsiveness
 */
object PsychologicalInterventions {

    private var grayscaleEnabled = false

    /**
     * Grayscale Mode — applies monochrome filter.
     * Best implemented via Display's ColorTransform or Accessibility Settings.
     * On Android 9+ we can use Simulate color space (Developer option) or
     * Settings.Secure.ACCESSIBILITY_DISPLAY_DALTONIZER_ENABLED for color correction.
     * Simpler approach: we don't control system-wide grayscale without root.
     * Alternative: show a grayscale overlay (our BlockedActivity can use grayscale theme).
     *
     * For Accessibility Service: we can use performGlobalAction to toggle
     * color inversion / reduce motion if available.
     */
    fun enableGrayscaleOverlay(context: Context): Boolean {
        // Android doesn't expose system-wide grayscale to 3rd party apps without
        // Accessibility Service + WRITE_SECURE_SETTINGS.
        // We record preference for use in BlockedActivity / overlay UI.
        DistractionPrefs.setGrayscaleMode(context, true)
        grayscaleEnabled = true
        return true
    }

    fun disableGrayscaleOverlay(context: Context) {
        DistractionPrefs.setGrayscaleMode(context, false)
        grayscaleEnabled = false
    }

    fun isGrayscaleEnabled(context: Context): Boolean =
        DistractionPrefs.getGrayscaleMode(context)

    /**
     * Create a ColorMatrixColorFilter for grayscale (for use in custom overlays).
     */
    fun createGrayscaleFilter(): ColorMatrixColorFilter {
        val matrix = ColorMatrix().apply { setSaturation(0f) }
        return ColorMatrixColorFilter(matrix)
    }

    /**
     * Turn off notifications from a specific app.
     * Requires NotificationListenerService — user must grant.
     * We store the "mute" preference; actual implementation needs
     * NotificationListenerService to filter by package.
     */
    fun muteAppNotifications(context: Context, packageName: String) {
        DistractionPrefs.addMutedPackage(context, packageName)
    }

    fun unmuteAppNotifications(context: Context, packageName: String) {
        DistractionPrefs.removeMutedPackage(context, packageName)
    }

    fun isAppMuted(context: Context, packageName: String): Boolean =
        DistractionPrefs.getMutedPackages(context).contains(packageName)

    /**
     * Delay opening apps — Accessibility Service intercepts and adds delay.
     * We use a delayed "perform back" or show a "Take a breath" overlay
     * before allowing the app to fully load.
     */
    const val DELAY_OPEN_MS = 3000L  // 3 second pause

    /**
     * Reduce touch sensitivity — not directly controllable via API.
     * We store preference; could be used to show a "slow down" reminder overlay.
     */
    fun setReducedSensitivity(context: Context, enabled: Boolean) {
        DistractionPrefs.setReducedSensitivity(context, enabled)
    }

    fun isReducedSensitivity(context: Context): Boolean =
        DistractionPrefs.getReducedSensitivity(context)

    /**
     * Check if psychological interventions mode is enabled (vs hard blocking).
     */
    fun usePsychologicalMode(context: Context): Boolean =
        DistractionPrefs.getPsychologicalMode(context)

    fun setPsychologicalMode(context: Context, enabled: Boolean) {
        DistractionPrefs.setPsychologicalMode(context, enabled)
    }
}

/**
 * Stores preferences for distraction / psychological interventions.
 */
private object DistractionPrefs {
    private const val PREFS = "distraction_interventions"
    private const val KEY_GRAYSCALE = "grayscale"
    private const val KEY_MUTED_PKGS = "muted_packages"
    private const val KEY_REDUCED_SENSITIVITY = "reduced_sensitivity"
    private const val KEY_PSYCHOLOGICAL_MODE = "psychological_mode"

    private fun prefs(ctx: Context) =
        ctx.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun setGrayscaleMode(ctx: Context, enabled: Boolean) {
        prefs(ctx).edit().putBoolean(KEY_GRAYSCALE, enabled).apply()
    }

    fun getGrayscaleMode(ctx: Context) = prefs(ctx).getBoolean(KEY_GRAYSCALE, false)

    fun addMutedPackage(ctx: Context, pkg: String) {
        val set = prefs(ctx).getStringSet(KEY_MUTED_PKGS, mutableSetOf())!!.toMutableSet()
        set.add(pkg)
        prefs(ctx).edit().putStringSet(KEY_MUTED_PKGS, set).apply()
    }

    fun removeMutedPackage(ctx: Context, pkg: String) {
        val set = prefs(ctx).getStringSet(KEY_MUTED_PKGS, mutableSetOf())!!.toMutableSet()
        set.remove(pkg)
        prefs(ctx).edit().putStringSet(KEY_MUTED_PKGS, set).apply()
    }

    fun getMutedPackages(ctx: Context): Set<String> =
        prefs(ctx).getStringSet(KEY_MUTED_PKGS, emptySet()) ?: emptySet()

    fun setReducedSensitivity(ctx: Context, enabled: Boolean) {
        prefs(ctx).edit().putBoolean(KEY_REDUCED_SENSITIVITY, enabled).apply()
    }

    fun getReducedSensitivity(ctx: Context) = prefs(ctx).getBoolean(KEY_REDUCED_SENSITIVITY, false)

    fun setPsychologicalMode(ctx: Context, enabled: Boolean) {
        prefs(ctx).edit().putBoolean(KEY_PSYCHOLOGICAL_MODE, enabled).apply()
    }

    fun getPsychologicalMode(ctx: Context) = prefs(ctx).getBoolean(KEY_PSYCHOLOGICAL_MODE, false)
}
