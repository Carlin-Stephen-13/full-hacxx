package com.focusshield

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Represents a single focus session.
 */
data class FocusSession(
    val blockedPackages: Set<String>,   // e.g. {"com.instagram.android", "com.google.android.youtube"}
    val durationMinutes: Int,
    val startTimeMs: Long = System.currentTimeMillis()
) {
    val endTimeMs: Long get() = startTimeMs + (durationMinutes * 60 * 1000L)
    val isActive: Boolean get() = System.currentTimeMillis() < endTimeMs
    val remainingMs: Long get() = maxOf(0L, endTimeMs - System.currentTimeMillis())
    val remainingSeconds: Long get() = remainingMs / 1000
}

/**
 * SessionManager — single source of truth for the active focus session.
 * Uses SharedPreferences so the session survives process death.
 */
object SessionManager {

    private const val PREFS_NAME = "focus_session_prefs"
    private const val KEY_SESSION  = "active_session"
    private val gson = Gson()

    private fun prefs(ctx: Context): SharedPreferences =
        ctx.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /** Start a new session (overwrites any existing one). */
    fun startSession(ctx: Context, blockedPackages: Set<String>, durationMinutes: Int): FocusSession {
        val session = FocusSession(blockedPackages, durationMinutes)
        prefs(ctx).edit().putString(KEY_SESSION, gson.toJson(session)).apply()
        return session
    }

    /** Returns the active session, or null if none / expired. */
    fun getActiveSession(ctx: Context): FocusSession? {
        val json = prefs(ctx).getString(KEY_SESSION, null) ?: return null
        val session = gson.fromJson(json, FocusSession::class.java) ?: return null
        return if (session.isActive) session else {
            clearSession(ctx)
            null
        }
    }

    /** End the session early. */
    fun clearSession(ctx: Context) {
        prefs(ctx).edit().remove(KEY_SESSION).apply()
    }

    /** Returns true if [packageName] is blocked in the current active session. */
    fun isBlocked(ctx: Context, packageName: String): Boolean {
        return getActiveSession(ctx)?.blockedPackages?.contains(packageName) == true
    }
}
