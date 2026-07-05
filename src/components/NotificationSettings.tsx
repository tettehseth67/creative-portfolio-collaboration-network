import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Volume2, 
  Moon, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Save, 
  VolumeX, 
  Zap, 
  Info,
  ShieldAlert,
  Play,
  Check,
  ToggleLeft,
  ToggleRight,
  Clock,
  Send
} from "lucide-react";
import { CreativeProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NotificationSettingsProps {
  userProfile: CreativeProfile;
  setUserProfile: (profile: CreativeProfile) => void;
  onBack: () => void;
}

export default function NotificationSettings({
  userProfile,
  setUserProfile,
  onBack
}: NotificationSettingsProps) {
  // Initialize notification state from local storage or profile
  const [emailSettings, setEmailSettings] = useState(() => {
    return userProfile.emailSettings || {
      newApplications: true,
      newEndorsements: true,
      newMessages: false,
      weeklyDigest: true
    };
  });

  // Extended Push Settings
  const [pushSettings, setPushSettings] = useState(() => {
    const saved = localStorage.getItem("artcollab_push_settings");
    return saved ? JSON.parse(saved) : {
      enablePush: true,
      pushMessages: true,
      pushMentions: true,
      pushCollabs: true,
      pushLikes: false
    };
  });

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState(() => {
    const saved = localStorage.getItem("artcollab_sms_settings");
    return saved ? JSON.parse(saved) : {
      enableSms: false,
      phoneNumber: "",
      smsAlertsForMilestones: true
    };
  });

  // DND settings
  const [dndSettings, setDndSettings] = useState(() => {
    const saved = localStorage.getItem("artcollab_dnd_settings");
    return saved ? JSON.parse(saved) : {
      enableDnd: false,
      startTime: "22:00",
      endTime: "08:00"
    };
  });

  // Sound settings
  const [soundSettings, setSoundSettings] = useState(() => {
    const saved = localStorage.getItem("artcollab_sound_settings");
    return saved ? JSON.parse(saved) : {
      enableSound: true,
      soundTheme: "ambient", // ambient, cosmic, retro, cyber
      soundVolume: 75
    };
  });

  // UI status states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [permissionState, setPermissionState] = useState<"default" | "granted" | "denied">("default");
  
  // Custom interactive test toast notification preview
  const [activeTestToast, setActiveTestToast] = useState<{
    id: string;
    title: string;
    body: string;
    type: "message" | "endorsement" | "milestone";
  } | null>(null);

  // Audio Context helper to trigger simulated theme notifications
  const playSimulatedSound = (theme: string) => {
    if (!soundSettings.enableSound) return;

    try {
      // Create synthesizer notes natively with browser Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playFreqSequence = (freqs: number[], durations: number[], type: OscillatorType = "sine") => {
        let startTime = ctx.currentTime;
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = type;
          osc.frequency.setValueAtTime(freq, startTime);
          
          const volume = (soundSettings.soundVolume / 100) * 0.15; // capped to avoid loud shocks
          gain.gain.setValueAtTime(volume, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + durations[idx]);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(startTime);
          osc.stop(startTime + durations[idx]);
          
          startTime += durations[idx] * 0.7; // slight overlap
        });
      };

      if (theme === "ambient") {
        // Soft sine sound wave chords
        playFreqSequence([523.25, 659.25, 783.99], [0.35, 0.35, 0.5], "sine");
      } else if (theme === "cosmic") {
        // High sparkling bell
        playFreqSequence([880, 1046.5, 1318.5], [0.15, 0.15, 0.4], "triangle");
      } else if (theme === "retro") {
        // 8-bit classic chime
        playFreqSequence([392, 523.25, 659.25, 1046.50], [0.08, 0.08, 0.08, 0.25], "square");
      } else if (theme === "cyber") {
        // High-tech pulse
        playFreqSequence([220, 880, 440], [0.1, 0.1, 0.25], "sawtooth");
      }
    } catch (e) {
      console.warn("Web Audio API not allowed or supported in this context.", e);
    }
  };

  const handleRequestPushPermission = () => {
    setPermissionState("granted");
    // Show a success banner simulation
    triggerTestToast("system", "Push Notifications Enabled", "Browser notification permission has been simulated successfully!");
  };

  const triggerTestToast = (type: "message" | "endorsement" | "milestone" | "system", customTitle?: string, customBody?: string) => {
    let title = customTitle || "New Collaboration Ping";
    let body = customBody || "Anya Kovalenko sent you a design milestone update.";

    if (!customTitle) {
      if (type === "message") {
        title = "Marcus Vance (Greenroom)";
        body = '"Hey, I just finalized the React state selectors. Let me know what you think!"';
      } else if (type === "endorsement") {
        title = "Skill Endorsed! 🏆";
        body = "Hana Katsura endorsed your WebGL Shaders expertise.";
      } else if (type === "milestone") {
        title = "Milestone Approved 🎉";
        body = "Owner approved: 'Procedural Shader Render Pack' released for co-ownership.";
      }
    }

    // Play sound theme
    playSimulatedSound(soundSettings.soundTheme);

    setActiveTestToast({
      id: `toast-${Date.now()}`,
      title,
      body,
      type: type as any
    });
  };

  // Auto-hide active test toast banner after 4.5 seconds
  useEffect(() => {
    if (activeTestToast) {
      const timer = setTimeout(() => {
        setActiveTestToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activeTestToast]);

  const handleSaveAll = () => {
    setIsSaving(true);
    
    // Simulate real database commit and localStorage syncing
    setTimeout(() => {
      const updatedProfile: CreativeProfile = {
        ...userProfile,
        emailSettings: emailSettings
      };

      // Sync global user profile
      setUserProfile(updatedProfile);

      // Save rest to individual local storage records
      localStorage.setItem("artcollab_push_settings", JSON.stringify(pushSettings));
      localStorage.setItem("artcollab_sms_settings", JSON.stringify(smsSettings));
      localStorage.setItem("artcollab_dnd_settings", JSON.stringify(dndSettings));
      localStorage.setItem("artcollab_sound_settings", JSON.stringify(soundSettings));

      setIsSaving(false);
      setSaveSuccess(true);

      // Flash success state for 2.5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    }, 850);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative" id="notification-settings-page">
      {/* Floating Interactive Notification Toast Preview */}
      <AnimatePresence>
        {activeTestToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-20 right-4 sm:right-6 z-130 max-w-sm rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl flex gap-3.5 items-start backdrop-blur-md"
            id="mock-toast-banner"
          >
            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
              activeTestToast.type === "message" ? "bg-indigo-100 text-indigo-600" :
              activeTestToast.type === "endorsement" ? "bg-emerald-100 text-emerald-600" :
              "bg-purple-100 text-purple-600"
            }`}>
              <Bell size={16} className="animate-swing" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-xs font-black text-slate-800 block leading-tight">{activeTestToast.title}</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal italic line-clamp-2">{activeTestToast.body}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[8px] font-mono font-bold tracking-wider uppercase text-slate-300">Test Alert</span>
                <span className="h-1 w-1 rounded-full bg-slate-200" />
                <span className="text-[8px] font-mono font-bold text-indigo-500 capitalize">{soundSettings.soundTheme} Sound Theme Active</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveTestToast(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold font-sans self-start p-0.5"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button and title */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-100 bg-white p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
            title="Go Back"
            id="settings-back-btn"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Notification Hub
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                System preferences
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize real-time platform signals, sound themes, quiet times, and automated digests.
            </p>
          </div>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={() => triggerTestToast("message")}
            className="rounded-xl border border-slate-100 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            id="trigger-test-notif-btn"
          >
            <Send size={12} className="text-indigo-500" />
            <span>Test Sound & Chime</span>
          </button>

          <button
            disabled={isSaving}
            onClick={handleSaveAll}
            className="relative overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-indigo-100 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-70"
            id="save-all-settings-btn"
          >
            {isSaving ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : saveSuccess ? (
              <Check size={14} className="text-white animate-bounce" />
            ) : (
              <Save size={14} />
            )}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Preferences Saved!" : "Save All"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Side: Navigation Links & Fast Testing Console */}
        <div className="space-y-6 md:col-span-1">
          {/* Action Hub Box */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs text-left">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display mb-3 flex items-center gap-1.5">
              <Zap size={14} className="text-indigo-500 animate-pulse" />
              Chime Testing Console
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal mb-4">
              Trigger a high-fidelity visual and audio feedback simulator box to sample and test different soundscapes!
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => triggerTestToast("message")}
                className="w-full text-left rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-700 p-2.5 text-[11px] font-bold text-slate-700 border border-slate-100 hover:border-indigo-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Greenroom Direct Message
                </span>
                <Play size={10} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => triggerTestToast("endorsement")}
                className="w-full text-left rounded-xl bg-slate-50 hover:bg-emerald-50/50 hover:text-emerald-700 p-2.5 text-[11px] font-bold text-slate-700 border border-slate-100 hover:border-emerald-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Skill Endorsement Received
                </span>
                <Play size={10} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => triggerTestToast("milestone")}
                className="w-full text-left rounded-xl bg-slate-50 hover:bg-purple-50/50 hover:text-purple-700 p-2.5 text-[11px] font-bold text-slate-700 border border-slate-100 hover:border-purple-100 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Project Milestone Approved
                </span>
                <Play size={10} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="rounded-xl bg-indigo-50/40 p-3 border border-indigo-100/30 flex gap-2">
                <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[9px] leading-relaxed text-indigo-700 font-medium">
                  <strong>Did you know?</strong> Chimes are generated dynamically using the browser's Web Audio synthesizer context. No heavy external MP3 loading necessary!
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Trust info */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs text-left">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display mb-2.5 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-emerald-500" />
              Security & Spam Protection
            </h3>
            <p className="text-[10px] leading-relaxed text-slate-400">
              ArtCollab enforces strict professional limits. We strictly protect your focus. We do not sell or index your profile communication hooks, and restrict outbound frequency lists automatically.
            </p>
          </div>
        </div>

        {/* Right Side: Tabular Preferences Panel Form */}
        <div className="space-y-6 md:col-span-2 text-left">
          {/* Section 1: Push Notifications */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">In-Browser Push Alerts</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Real-time instant desktop messages</p>
                </div>
              </div>

              {permissionState !== "granted" ? (
                <button
                  onClick={handleRequestPushPermission}
                  className="rounded-lg bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-600 cursor-pointer transition-colors"
                >
                  Enable Permissions
                </button>
              ) : (
                <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[9px] font-mono font-extrabold tracking-wider text-emerald-600 flex items-center gap-1 border border-emerald-100">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                  ACTIVE
                </span>
              )}
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start justify-between">
                <div className="max-w-[80%]">
                  <span className="text-xs font-bold text-slate-700 block">General Push Activation</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    Turn on instant on-screen banners. Disabling this shuts off all push cues.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushSettings({...pushSettings, enablePush: !pushSettings.enablePush})}
                  className="text-indigo-600 hover:text-indigo-700 transition-transform active:scale-95 cursor-pointer"
                >
                  {pushSettings.enablePush ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-300" />}
                </button>
              </div>

              {pushSettings.enablePush && (
                <div className="pl-4 border-l-2 border-indigo-50/50 space-y-3.5 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Direct Greenroom Chats</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Receive immediate banners when peers write to you</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushSettings.pushMessages}
                      onChange={(e) => setPushSettings({...pushSettings, pushMessages: e.target.checked})}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Collaboration Applicants</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Ping when developers submit applications on team portals</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushSettings.pushCollabs}
                      onChange={(e) => setPushSettings({...pushSettings, pushCollabs: e.target.checked})}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Endorsements & Kudos</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Alert immediately when peers endorse profile skills</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushSettings.pushLikes}
                      onChange={(e) => setPushSettings({...pushSettings, pushLikes: e.target.checked})}
                      className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Sound Chimes */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Volume2 size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Audio Feedback & Chimes</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pick soundboards for real-time triggers</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSoundSettings({...soundSettings, enableSound: !soundSettings.enableSound})}
                className="text-indigo-600 hover:text-indigo-700 transition-transform active:scale-95 cursor-pointer"
              >
                {soundSettings.enableSound ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-300" />}
              </button>
            </div>

            {soundSettings.enableSound ? (
              <div className="space-y-4">
                {/* Sound theme cards */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Chime Synth Theme</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "ambient", name: "Ambient Zen", desc: "Soft sine wave chords" },
                      { id: "cosmic", name: "Cosmic Bell", desc: "Slightly echoing high bells" },
                      { id: "retro", name: "Retro Chime", desc: "Classic 8-bit pulse chime" },
                      { id: "cyber", name: "Cyber Matrix", desc: "High-tech futuristic wave" }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setSoundSettings({...soundSettings, soundTheme: theme.id});
                          playSimulatedSound(theme.id);
                        }}
                        className={`text-left rounded-xl border p-3 cursor-pointer transition-all ${
                          soundSettings.soundTheme === theme.id 
                            ? "bg-indigo-50/50 border-indigo-200 text-indigo-900" 
                            : "bg-slate-50/40 border-slate-100 hover:border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold block">{theme.name}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${soundSettings.soundTheme === theme.id ? "bg-indigo-600" : "bg-transparent"}`} />
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 block leading-tight">{theme.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound volume slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-600 uppercase">Alert Volume</span>
                    <span className="font-mono text-slate-400 font-bold">{soundSettings.soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={soundSettings.soundVolume}
                    onChange={(e) => setSoundSettings({...soundSettings, soundVolume: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
                <VolumeX size={14} className="shrink-0 text-slate-300" />
                <span className="text-[10px] leading-relaxed italic">Sounds and chimes are currently silenced globally. Toggles will operate in stealth.</span>
              </div>
            )}
          </div>

          {/* Section 3: Do Not Disturb Scheduling */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Moon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Quiet Hours (DND)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Silence chimes and push banners automatically</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDndSettings({...dndSettings, enableDnd: !dndSettings.enableDnd})}
                className="text-indigo-600 hover:text-indigo-700 transition-transform active:scale-95 cursor-pointer"
              >
                {dndSettings.enableDnd ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-300" />}
              </button>
            </div>

            {dndSettings.enableDnd && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in font-sans">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Silence Start Time</label>
                  <div className="relative">
                    <Clock size={12} className="absolute left-2.5 top-3 text-slate-400" />
                    <input
                      type="time"
                      value={dndSettings.startTime}
                      onChange={(e) => setDndSettings({...dndSettings, startTime: e.target.value})}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 px-3 pl-8 text-xs font-semibold text-slate-700 focus:border-indigo-400 focus:bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Silence End Time</label>
                  <div className="relative">
                    <Clock size={12} className="absolute left-2.5 top-3 text-slate-400" />
                    <input
                      type="time"
                      value={dndSettings.endTime}
                      onChange={(e) => setDndSettings({...dndSettings, endTime: e.target.value})}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 px-3 pl-8 text-xs font-semibold text-slate-700 focus:border-indigo-400 focus:bg-white outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Email Subscriptions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <Mail size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Email Communication Hooks</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Control outbound inbox delivery frequencies</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/25 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailSettings.newApplications}
                  onChange={(e) => setEmailSettings({...emailSettings, newApplications: e.target.checked})}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Outbound Applications Pings</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                    Send an email when a developer or professional applies to your published collaborations.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/25 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailSettings.newEndorsements}
                  onChange={(e) => setEmailSettings({...emailSettings, newEndorsements: e.target.checked})}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Endorsement Kudos Notifications</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                    Email me immediately when community developers endorse my verified skills block.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/25 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailSettings.newMessages}
                  onChange={(e) => setEmailSettings({...emailSettings, newMessages: e.target.checked})}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Greenroom Chat Direct Pings</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                    Send backup emails for new unread inbox messages when I am not actively logged on.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/25 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailSettings.weeklyDigest}
                  onChange={(e) => setEmailSettings({...emailSettings, weeklyDigest: e.target.checked})}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Weekly Network Digest Newsletters</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                    Keep me updated weekly with recommended co-creators, active projects, and hot milestones.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 5: SMS / Mobile Notifications */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">SMS & Text Alert Rules</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Urgent milestone changes sent to your phone</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSmsSettings({...smsSettings, enableSms: !smsSettings.enableSms})}
                className="text-indigo-600 hover:text-indigo-700 transition-transform active:scale-95 cursor-pointer"
              >
                {smsSettings.enableSms ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-300" />}
              </button>
            </div>

            {smsSettings.enableSms && (
              <div className="space-y-4 font-sans animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={smsSettings.phoneNumber}
                    onChange={(e) => setSmsSettings({...smsSettings, phoneNumber: e.target.value})}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-400 focus:bg-white outline-hidden"
                  />
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/25 hover:bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={smsSettings.smsAlertsForMilestones}
                    onChange={(e) => setSmsSettings({...smsSettings, smsAlertsForMilestones: e.target.checked})}
                    className="mt-0.5 h-4 w-4 rounded-sm border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Milestone Status & Contract Release</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal">
                      Only dispatch critical updates when co-ownership shares or payment milestone releases are officially confirmed on the platform ledger.
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
