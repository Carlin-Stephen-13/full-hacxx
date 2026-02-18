package com.focusshield

import android.app.AppOpsManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.*
import android.provider.Settings
import android.view.*
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.focusshield.databinding.ActivityMainBinding
import com.google.android.material.chip.Chip

// ─── Popular apps with REAL Android package names ────────────────────────────
// These are the actual package names Android uses. When the user selects
// "Instagram" in the UI, the OS-level blocker targets "com.instagram.android".

data class KnownApp(
    val displayName: String,
    val packageName: String,
    val emoji: String,
    val category: String
)

val KNOWN_DISTRACTING_APPS = listOf(
    // Social
    KnownApp("Instagram",     "com.instagram.android",             "📸", "Social"),
    KnownApp("TikTok",        "com.zhiliaoapp.musically",          "🎵", "Social"),
    KnownApp("Snapchat",      "com.snapchat.android",              "👻", "Social"),
    KnownApp("Twitter / X",   "com.twitter.android",               "🐦", "Social"),
    KnownApp("Facebook",      "com.facebook.katana",               "👥", "Social"),
    KnownApp("Messenger",     "com.facebook.orca",                 "💬", "Social"),
    KnownApp("WhatsApp",      "com.whatsapp",                      "💬", "Messaging"),
    KnownApp("Telegram",      "org.telegram.messenger",            "✈️", "Messaging"),
    KnownApp("Discord",       "com.discord",                       "🎮", "Messaging"),
    KnownApp("Reddit",        "com.reddit.frontpage",              "🤖", "Social"),
    KnownApp("LinkedIn",      "com.linkedin.android",              "💼", "Social"),
    KnownApp("Pinterest",     "com.pinterest",                     "📌", "Social"),
    KnownApp("Tumblr",        "com.tumblr",                        "✍️", "Social"),
    KnownApp("BeReal",        "com.bereal.ft",                     "📷", "Social"),
    KnownApp("Threads",       "com.instagram.barcelona",           "🧵", "Social"),

    // Video & Entertainment
    KnownApp("YouTube",       "com.google.android.youtube",        "▶️", "Video"),
    KnownApp("Netflix",       "com.netflix.mediaclient",           "🎬", "Video"),
    KnownApp("Disney+",       "com.disney.disneyplus",             "🏰", "Video"),
    KnownApp("Prime Video",   "com.amazon.avod.thirdpartyclient",  "📦", "Video"),
    KnownApp("Hulu",          "com.hulu.plus",                     "🎥", "Video"),
    KnownApp("Twitch",        "tv.twitch.android.app",             "🟣", "Video"),
    KnownApp("HBO Max",       "com.hbo.hbomax",                    "🎭", "Video"),

    // Music
    KnownApp("Spotify",       "com.spotify.music",                 "🎧", "Music"),
    KnownApp("SoundCloud",    "com.soundcloud.android",            "☁️", "Music"),

    // Games
    KnownApp("Candy Crush",   "com.king.candycrushsaga",           "🍬", "Games"),
    KnownApp("Roblox",        "com.roblox.client",                 "🎮", "Games"),
    KnownApp("PUBG Mobile",   "com.tencent.ig",                    "🎯", "Games"),

    // Shopping
    KnownApp("Amazon",        "com.amazon.mShop.android.shopping", "📦", "Shopping"),
    KnownApp("Flipkart",      "com.flipkart.android",              "🛒", "Shopping"),
    KnownApp("Meesho",        "com.meesho.supply",                 "🛒", "Shopping"),
)

data class AppInfo(
    val packageName: String,
    val appName: String,
    val emoji: String,
    val icon: Drawable?,
    val isInstalled: Boolean
)

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var appAdapter: AppSelectionAdapter
    private val selectedPackages = mutableSetOf<String>()
    private val handler = Handler(Looper.getMainLooper())
    private var sessionRunnable: Runnable? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setupAppList()
        setupDurationPicker()
        setupStartButton()
        setupSelectAllButtons()
        checkActiveSession()
    }

    override fun onResume() {
        super.onResume()
        updatePermissionStatus()
    }

    override fun onDestroy() {
        sessionRunnable?.let { handler.removeCallbacks(it) }
        super.onDestroy()
    }

    // ─── Build App List ───────────────────────────────────────────────────────

    private fun setupAppList() {
        val apps = buildAppList()
        appAdapter = AppSelectionAdapter(apps, selectedPackages) { pkg, selected ->
            if (selected) selectedPackages.add(pkg) else selectedPackages.remove(pkg)
            updateStartButton()
        }
        binding.rvApps.apply {
            layoutManager = GridLayoutManager(this@MainActivity, 3)
            adapter = appAdapter
            isNestedScrollingEnabled = false
        }
    }

    /**
     * Builds the combined app list:
     *   1. All KNOWN_DISTRACTING_APPS always shown (greyed out if not installed)
     *   2. Any other user-installed apps appended below
     */
    private fun buildAppList(): List<AppInfo> {
        val pm = packageManager
        val result = mutableListOf<AppInfo>()

        // Known distracting apps first
        for (known in KNOWN_DISTRACTING_APPS) {
            val installed = isAppInstalled(pm, known.packageName)
            result.add(AppInfo(
                packageName = known.packageName,
                appName     = known.displayName,
                emoji       = known.emoji,
                icon        = if (installed) tryGetIcon(pm, known.packageName) else null,
                isInstalled = installed
            ))
        }

        // Other user-installed apps
        val knownPkgs = KNOWN_DISTRACTING_APPS.map { it.packageName }.toSet()
        pm.getInstalledApplications(PackageManager.GET_META_DATA)
            .filter { info ->
                info.packageName != packageName &&
                info.packageName !in knownPkgs &&
                (info.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) == 0
            }
            .forEach { info ->
                result.add(AppInfo(
                    packageName = info.packageName,
                    appName     = pm.getApplicationLabel(info).toString(),
                    emoji       = "📱",
                    icon        = tryGetIcon(pm, info.packageName),
                    isInstalled = true
                ))
            }

        // Installed first, then alphabetically
        return result.sortedWith(compareByDescending<AppInfo> { it.isInstalled }.thenBy { it.appName })
    }

    private fun isAppInstalled(pm: PackageManager, pkg: String) = try {
        pm.getPackageInfo(pkg, 0); true
    } catch (e: PackageManager.NameNotFoundException) { false }

    private fun tryGetIcon(pm: PackageManager, pkg: String) = try {
        pm.getApplicationIcon(pkg)
    } catch (e: Exception) { null }

    // ─── Duration ─────────────────────────────────────────────────────────────

    private fun setupDurationPicker() {
        binding.seekbarDuration.max = 35
        binding.seekbarDuration.progress = 4
        binding.seekbarDuration.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar?, progress: Int, fromUser: Boolean) {
                val m = 5 + progress * 5
                binding.tvDuration.text = if (m >= 60) "${m / 60}h ${m % 60}m".replace(" 0m", "") else "${m}m"
            }
            override fun onStartTrackingTouch(sb: SeekBar?) {}
            override fun onStopTrackingTouch(sb: SeekBar?) {}
        })
    }

    private fun getSelectedDurationMinutes() = 5 + binding.seekbarDuration.progress * 5

    // ─── Select All / Clear ───────────────────────────────────────────────────

    private fun setupSelectAllButtons() {
        binding.btnSelectAll.setOnClickListener {
            selectedPackages.clear()
            selectedPackages.addAll(appAdapter.getInstalledPackages())
            appAdapter.notifyDataSetChanged()
            updateStartButton()
        }
        binding.btnClearAll.setOnClickListener {
            selectedPackages.clear()
            appAdapter.notifyDataSetChanged()
            updateStartButton()
        }
    }

    private fun updateStartButton() {
        binding.btnStart.text = if (selectedPackages.isEmpty())
            "Select apps to block"
        else
            "🛡 Start Focus · ${selectedPackages.size} apps blocked"
    }

    // ─── Start Session ────────────────────────────────────────────────────────

    private fun setupStartButton() {
        binding.btnStart.setOnClickListener {
            if (selectedPackages.isEmpty()) {
                Toast.makeText(this, "Select at least one app to block", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (!checkAndRequestPermissions()) return@setOnClickListener
            startFocusSession()
        }
    }

    private fun startFocusSession() {
        val duration = getSelectedDurationMinutes()

        // ★ ACTUAL BLOCKING STARTS HERE:
        //
        // 1. SessionManager.startSession() saves:
        //      - Set of blocked package names (e.g. "com.instagram.android")
        //      - Session end time = now + duration
        //    to SharedPreferences so it survives process death.
        //
        // 2. FocusBlockerService.startService() launches a foreground Service that:
        //    - Every 500ms calls UsageStatsManager.queryEvents()
        //    - Gets the current foreground package name
        //    - If it matches any blocked package → launches BlockedActivity on top
        //
        // 3. AccessibilityBlockerService (if user enabled it):
        //    - Listens to TYPE_WINDOW_STATE_CHANGED events
        //    - Fires INSTANTLY when Instagram/YouTube etc comes to foreground
        //    - No polling delay → block screen appears before the app even fully loads

        SessionManager.startSession(this, selectedPackages.toSet(), duration)
        FocusBlockerService.startService(this)

        showActiveSessionUI()
        Toast.makeText(this,
            "🛡 Blocking ${selectedPackages.size} apps for ${duration}min!",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun showActiveSessionUI() {
        binding.layoutSetup.visibility   = View.GONE
        binding.layoutSession.visibility = View.VISIBLE

        // Populate blocked app chips
        binding.chipGroupBlockedApps.removeAllViews()
        selectedPackages.take(10).forEach { pkg ->
            val known = KNOWN_DISTRACTING_APPS.find { it.packageName == pkg }
            val name  = known?.displayName ?: try {
                packageManager.getApplicationLabel(
                    packageManager.getApplicationInfo(pkg, 0)
                ).toString()
            } catch (e: Exception) { pkg.substringAfterLast(".") }

            Chip(this).apply {
                text = "${known?.emoji ?: "📱"} $name"
                isClickable = false
                setTextColor(0xFFFFFFFF.toInt())
                chipBackgroundColor = android.content.res.ColorStateList.valueOf(0xFF1A1A2E.toInt())
                chipStrokeColor     = android.content.res.ColorStateList.valueOf(0xFF6366F1.toInt())
                chipStrokeWidth     = 1.5f
                binding.chipGroupBlockedApps.addView(this)
            }
        }
        if (selectedPackages.size > 10) {
            Chip(this).apply {
                text = "+${selectedPackages.size - 10} more blocked"
                isClickable = false
                setTextColor(0xFF888888.toInt())
                chipBackgroundColor = android.content.res.ColorStateList.valueOf(0xFF131318.toInt())
                binding.chipGroupBlockedApps.addView(this)
            }
        }

        startSessionCountdown()

        binding.btnEndSession.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("End Focus Session?")
                .setMessage("All blocked apps will become accessible again.")
                .setPositiveButton("End Session") { _, _ ->
                    SessionManager.clearSession(this)
                    FocusBlockerService.stopService(this)
                    binding.layoutSession.visibility = View.GONE
                    binding.layoutSetup.visibility   = View.VISIBLE
                    sessionRunnable?.let { handler.removeCallbacks(it) }
                    Toast.makeText(this, "Session ended. Apps unblocked.", Toast.LENGTH_SHORT).show()
                }
                .setNegativeButton("Keep Focusing", null)
                .show()
        }
    }

    private fun startSessionCountdown() {
        sessionRunnable?.let { handler.removeCallbacks(it) }
        sessionRunnable = object : Runnable {
            override fun run() {
                val session = SessionManager.getActiveSession(this@MainActivity)
                if (session == null) {
                    binding.layoutSession.visibility = View.GONE
                    binding.layoutSetup.visibility   = View.VISIBLE
                    Toast.makeText(this@MainActivity, "🎉 Focus session complete!", Toast.LENGTH_LONG).show()
                    return
                }
                val rem = session.remainingSeconds
                binding.tvSessionTime.text = "%02d:%02d".format(rem / 60, rem % 60)
                binding.tvSessionApps.text = "${session.blockedPackages.size} apps blocked"
                handler.postDelayed(this, 1000)
            }
        }
        handler.post(sessionRunnable!!)
    }

    private fun checkActiveSession() {
        val session = SessionManager.getActiveSession(this) ?: return
        selectedPackages.addAll(session.blockedPackages)
        showActiveSessionUI()
    }

    // ─── Permissions ──────────────────────────────────────────────────────────

    private fun checkAndRequestPermissions(): Boolean {
        if (!hasUsageStatsPermission()) {
            AlertDialog.Builder(this)
                .setTitle("⚠️ Usage Access Required")
                .setMessage("FocusShield needs Usage Access to detect when Instagram, YouTube etc. are opened.\n\n• Tap Open Settings\n• Find FocusShield\n• Toggle ON")
                .setPositiveButton("Open Settings") { _, _ ->
                    startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
                }
                .setNegativeButton("Cancel", null).show()
            return false
        }
        if (!Settings.canDrawOverlays(this)) {
            AlertDialog.Builder(this)
                .setTitle("⚠️ Overlay Permission Required")
                .setMessage("FocusShield needs to show the block screen over Instagram, YouTube etc.\n\n• Tap Open Settings\n• Find FocusShield\n• Toggle ON")
                .setPositiveButton("Open Settings") { _, _ ->
                    startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:$packageName")))
                }
                .setNegativeButton("Cancel", null).show()
            return false
        }
        return true
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = getSystemService(APP_OPS_SERVICE) as AppOpsManager
        return appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            packageName
        ) == AppOpsManager.MODE_ALLOWED
    }

    private fun updatePermissionStatus() {
        val hasUsage     = hasUsageStatsPermission()
        val hasOverlay   = Settings.canDrawOverlays(this)
        val hasA11y      = isAccessibilityServiceEnabled()

        binding.tvPermUsage.text = if (hasUsage) "✅ Usage Access" else "⚠️ Usage Access — tap to grant"
        binding.tvPermUsage.setTextColor(if (hasUsage) 0xFF86EFAC.toInt() else 0xFFF87171.toInt())
        binding.tvPermUsage.setOnClickListener {
            if (!hasUsage) startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
        }

        binding.tvPermOverlay.text = if (hasOverlay) "✅ Overlay Permission" else "⚠️ Overlay Permission — tap to grant"
        binding.tvPermOverlay.setTextColor(if (hasOverlay) 0xFF86EFAC.toInt() else 0xFFF87171.toInt())
        binding.tvPermOverlay.setOnClickListener {
            if (!hasOverlay) startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")))
        }

        binding.tvPermAccessibility.text = if (hasA11y)
            "✅ Accessibility (instant blocking)" else "ℹ️ Accessibility — tap to enable (optional, faster)"
        binding.tvPermAccessibility.setTextColor(if (hasA11y) 0xFF86EFAC.toInt() else 0xFF888888.toInt())
        binding.tvPermAccessibility.setOnClickListener {
            if (!hasA11y) startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val name    = "$packageName/${AccessibilityBlockerService::class.java.name}"
        val enabled = Settings.Secure.getString(contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: return false
        return enabled.contains(name)
    }
}

// ─── RecyclerView Adapter ──────────────────────────────────────────────────────

class AppSelectionAdapter(
    private val apps: List<AppInfo>,
    private val selectedPackages: MutableSet<String>,
    private val onToggle: (String, Boolean) -> Unit
) : RecyclerView.Adapter<AppSelectionAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val icon:    ImageView = view.findViewById(R.id.ivAppIcon)
        val name:    TextView  = view.findViewById(R.id.tvAppName)
        val overlay: View      = view.findViewById(R.id.viewBlockOverlay)
        val check:   ImageView = view.findViewById(R.id.ivCheck)
        val blocked: TextView  = view.findViewById(R.id.tvBlocked)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(LayoutInflater.from(parent.context).inflate(R.layout.item_app, parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val app      = apps[position]
        val selected = selectedPackages.contains(app.packageName)

        holder.icon.setImageDrawable(
            app.icon ?: holder.itemView.context.getDrawable(android.R.drawable.sym_def_app_icon)
        )
        holder.icon.alpha = if (app.isInstalled) 1f else 0.3f
        holder.name.text  = app.appName
        holder.name.alpha = if (app.isInstalled) 1f else 0.4f

        holder.overlay.visibility = if (selected) View.VISIBLE else View.GONE
        holder.check.visibility   = if (selected) View.VISIBLE else View.GONE
        holder.blocked.visibility = if (selected) View.VISIBLE else View.GONE

        holder.itemView.setOnClickListener {
            val nowSelected = !selectedPackages.contains(app.packageName)
            onToggle(app.packageName, nowSelected)
            notifyItemChanged(position)
        }
    }

    override fun getItemCount() = apps.size

    fun getInstalledPackages(): Set<String> =
        apps.filter { it.isInstalled }.map { it.packageName }.toSet()
}
