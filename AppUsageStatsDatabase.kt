package com.focusshield

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import java.util.Calendar

/**
 * AppUsageStatsDatabase
 * ─────────────────────
 * Local database for storing app usage events as per the wireframe:
 * "Stores all in local database" — foreground app, unlock events,
 * app switching, duration of usage per app.
 *
 * Used by UsageStatsCollectorService and DistractionAnalyzer.
 */
object AppUsageStatsDatabase {

    private const val DB_NAME = "focusshield_usage_stats.db"
    private const val DB_VERSION = 1

    private const val TABLE_APP_EVENTS = "app_events"
    private const val COL_ID = "_id"
    private const val COL_PACKAGE = "package_name"
    private const val COL_EVENT_TYPE = "event_type"  // FOREGROUND, UNLOCK, APP_SWITCH
    private const val COL_TIMESTAMP = "timestamp_ms"
    private const val COL_DAY_OF_WEEK = "day_of_week"  // 1=Sun .. 7=Sat
    private const val COL_HOUR = "hour"  // 0-23

    private const val TABLE_APP_DURATIONS = "app_durations"
    private const val COL_DURATION_ID = "_id"
    private const val COL_DURATION_PACKAGE = "package_name"
    private const val COL_DURATION_START = "start_ms"
    private const val COL_DURATION_END = "end_ms"
    private const val COL_DURATION_MS = "duration_ms"
    private const val COL_DURATION_DAY = "day_of_week"
    private const val COL_DURATION_HOUR = "hour"

    const val EVENT_FOREGROUND = "FOREGROUND"
    const val EVENT_UNLOCK = "UNLOCK"
    const val EVENT_APP_SWITCH = "APP_SWITCH"

    data class AppEvent(
        val packageName: String,
        val eventType: String,
        val timestampMs: Long,
        val dayOfWeek: Int,
        val hour: Int
    )

    data class AppDuration(
        val packageName: String,
        val startMs: Long,
        val endMs: Long,
        val durationMs: Long,
        val dayOfWeek: Int,
        val hour: Int
    )

    private var dbHelper: DbHelper? = null

    private fun getDb(context: Context): SQLiteDatabase {
        if (dbHelper == null) {
            dbHelper = DbHelper(context.applicationContext)
        }
        return dbHelper!!.writableDatabase
    }

    fun insertAppEvent(context: Context, packageName: String, eventType: String, timestampMs: Long = System.currentTimeMillis()) {
        val cal = Calendar.getInstance().apply { timeInMillis = timestampMs }
        val values = ContentValues().apply {
            put(COL_PACKAGE, packageName)
            put(COL_EVENT_TYPE, eventType)
            put(COL_TIMESTAMP, timestampMs)
            put(COL_DAY_OF_WEEK, cal.get(Calendar.DAY_OF_WEEK))
            put(COL_HOUR, cal.get(Calendar.HOUR_OF_DAY))
        }
        getDb(context).insert(TABLE_APP_EVENTS, null, values)
    }

    fun insertAppDuration(context: Context, packageName: String, startMs: Long, endMs: Long) {
        val durationMs = endMs - startMs
        if (durationMs <= 0) return
        val cal = Calendar.getInstance().apply { timeInMillis = startMs }
        val values = ContentValues().apply {
            put(COL_DURATION_PACKAGE, packageName)
            put(COL_DURATION_START, startMs)
            put(COL_DURATION_END, endMs)
            put(COL_DURATION_MS, durationMs)
            put(COL_DURATION_DAY, cal.get(Calendar.DAY_OF_WEEK))
            put(COL_DURATION_HOUR, cal.get(Calendar.HOUR_OF_DAY))
        }
        getDb(context).insert(TABLE_APP_DURATIONS, null, values)
    }

    /** Get app usage events for the last N days (wireframe: "3-5 days" for baseline). */
    fun getEventsSince(context: Context, days: Int): List<AppEvent> {
        val since = System.currentTimeMillis() - (days * 24 * 60 * 60 * 1000L)
        val c = getDb(context).query(
            TABLE_APP_EVENTS,
            arrayOf(COL_PACKAGE, COL_EVENT_TYPE, COL_TIMESTAMP, COL_DAY_OF_WEEK, COL_HOUR),
            "$COL_TIMESTAMP >= ?",
            arrayOf(since.toString()),
            null, null, "$COL_TIMESTAMP ASC"
        )
        val list = mutableListOf<AppEvent>()
        while (c.moveToNext()) {
            list.add(AppEvent(
                c.getString(0),
                c.getString(1),
                c.getLong(2),
                c.getInt(3),
                c.getInt(4)
            ))
        }
        c.close()
        return list
    }

    /** Get app durations for the last N days. */
    fun getDurationsSince(context: Context, days: Int): List<AppDuration> {
        val since = System.currentTimeMillis() - (days * 24 * 60 * 60 * 1000L)
        val c = getDb(context).query(
            TABLE_APP_DURATIONS,
            arrayOf(COL_DURATION_PACKAGE, COL_DURATION_START, COL_DURATION_END, COL_DURATION_MS, COL_DURATION_DAY, COL_DURATION_HOUR),
            "$COL_DURATION_START >= ?",
            arrayOf(since.toString()),
            null, null, "$COL_DURATION_START ASC"
        )
        val list = mutableListOf<AppDuration>()
        while (c.moveToNext()) {
            list.add(AppDuration(
                c.getString(0),
                c.getLong(1),
                c.getLong(2),
                c.getLong(3),
                c.getInt(4),
                c.getInt(5)
            ))
        }
        c.close()
        return list
    }

    /** Prune old data (keep last 14 days). */
    fun pruneOldData(context: Context) {
        val cutoff = System.currentTimeMillis() - (14 * 24 * 60 * 60 * 1000L)
        getDb(context).delete(TABLE_APP_EVENTS, "$COL_TIMESTAMP < ?", arrayOf(cutoff.toString()))
        getDb(context).delete(TABLE_APP_DURATIONS, "$COL_DURATION_START < ?", arrayOf(cutoff.toString()))
    }

    private class DbHelper(context: Context) : SQLiteOpenHelper(context, DB_NAME, null, DB_VERSION) {
        override fun onCreate(db: SQLiteDatabase) {
            db.execSQL("""
                CREATE TABLE $TABLE_APP_EVENTS (
                    $COL_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                    $COL_PACKAGE TEXT NOT NULL,
                    $COL_EVENT_TYPE TEXT NOT NULL,
                    $COL_TIMESTAMP INTEGER NOT NULL,
                    $COL_DAY_OF_WEEK INTEGER,
                    $COL_HOUR INTEGER
                )
            """.trimIndent())
            db.execSQL("CREATE INDEX idx_events_ts ON $TABLE_APP_EVENTS($COL_TIMESTAMP)")
            db.execSQL("CREATE INDEX idx_events_pkg ON $TABLE_APP_EVENTS($COL_PACKAGE)")

            db.execSQL("""
                CREATE TABLE $TABLE_APP_DURATIONS (
                    $COL_DURATION_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                    $COL_DURATION_PACKAGE TEXT NOT NULL,
                    $COL_DURATION_START INTEGER NOT NULL,
                    $COL_DURATION_END INTEGER NOT NULL,
                    $COL_DURATION_MS INTEGER NOT NULL,
                    $COL_DURATION_DAY INTEGER,
                    $COL_DURATION_HOUR INTEGER
                )
            """.trimIndent())
            db.execSQL("CREATE INDEX idx_durations_ts ON $TABLE_APP_DURATIONS($COL_DURATION_START)")
            db.execSQL("CREATE INDEX idx_durations_pkg ON $TABLE_APP_DURATIONS($COL_DURATION_PACKAGE)")
        }

        override fun onUpgrade(db: SQLiteDatabase, oldVer: Int, newVer: Int) {}
    }
}
