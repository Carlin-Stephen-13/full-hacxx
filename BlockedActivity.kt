package com.focusshield

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.focusshield.databinding.ActivityBlockedBinding

/**
 * BlockedActivity
 * ───────────────
 * This Activity is launched ON TOP of a blocked app when the user tries to open it.
 * It covers the entire screen, shows a motivational block message, and provides
 * a countdown of remaining session time.
 *
 * Key behaviors:
 *   • Launched with FLAG_ACTIVITY_NEW_TASK so it appears above any app
 *   • Overrides back button — user CANNOT go back to the blocked app
 *   • Shows app name/icon of the blocked app
 *   • Live countdown timer showing session remaining time
 *   • "Go Home" button sends user to launcher instead of blocked app
 */
class BlockedActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PACKAGE_NAME      = "blocked_package"
        const val EXTRA_REMAINING_SECONDS = "remaining_seconds"
    }

    private lateinit var binding: ActivityBlockedBinding
    private var countDownTimer: CountDownTimer? = null
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make this activity show over lock screen and keep screen on
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        )

        binding = ActivityBlockedBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val blockedPackage   = intent.getStringExtra(EXTRA_PACKAGE_NAME) ?: ""
        val remainingSeconds = intent.getLongExtra(EXTRA_REMAINING_SECONDS, 0L)

        setupAppInfo(blockedPackage)
        startCountdown(remainingSeconds)
        setupButtons()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        // Update remaining time if service re-triggers this activity
        val remaining = intent?.getLongExtra(EXTRA_REMAINING_SECONDS, 0L) ?: return
        startCountdown(remaining)
    }

    // Disable back button — user cannot go back to the blocked app
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        goHome()
    }

    override fun onDestroy() {
        countDownTimer?.cancel()
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    // ─── Setup ────────────────────────────────────────────────────────────────

    private fun setupAppInfo(packageName: String) {
        try {
            val pm = packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            val appName = pm.getApplicationLabel(appInfo).toString()
            val appIcon = pm.getApplicationIcon(appInfo)

            binding.tvBlockedAppName.text = "$appName is blocked"
            binding.ivBlockedAppIcon.setImageDrawable(appIcon)
        } catch (e: PackageManager.NameNotFoundException) {
            binding.tvBlockedAppName.text = "This app is blocked"
        }
    }

    private fun startCountdown(remainingSeconds: Long) {
        countDownTimer?.cancel()

        countDownTimer = object : CountDownTimer(remainingSeconds * 1000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val mins = (millisUntilFinished / 1000) / 60
                val secs = (millisUntilFinished / 1000) % 60
                binding.tvRemainingTime.text = "%02d:%02d".format(mins, secs)
                binding.tvRemainingLabel.text = "remaining in focus session"
            }

            override fun onFinish() {
                // Session ended — allow the app to open
                binding.tvBlockedAppName.text = "Focus session complete! 🎉"
                binding.tvRemainingTime.text = "00:00"
                binding.btnGoHome.text = "Open App"
                binding.btnGoHome.setOnClickListener { finish() }

                // Auto-dismiss after 2 seconds
                handler.postDelayed({ finish() }, 2000)
            }
        }.start()
    }

    private fun setupButtons() {
        // "Go Home" → send user to home screen instead of blocked app
        binding.btnGoHome.setOnClickListener { goHome() }

        // "End Session" → stop the focus session and dismiss block screen
        binding.btnEndSession.setOnClickListener {
            SessionManager.clearSession(this)
            FocusBlockerService.stopService(this)
            finish()
        }
    }

    private fun goHome() {
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        finish()
    }
}
