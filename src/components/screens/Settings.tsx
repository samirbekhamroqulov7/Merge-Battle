import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconButton } from "../IconButton";
import { NeonButton } from "../NeonButton";
import { ArrowLeft, Volume2, VolumeX, Music, Bell, Smartphone, HelpCircle, Mail, Globe } from "lucide-react";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";

interface SettingsProps {
  onNavigate: (screen: string) => void;
}

// Audio manager for mobile
const audioManager = {
  setSoundVolume: (volume: number) => {
    console.log("Setting sound volume to:", volume);
  },
  setMusicVolume: (volume: number) => {
    console.log("Setting music volume to:", volume);
  },
  toggleSound: (enabled: boolean) => {
    console.log("Sound effects:", enabled ? "ON" : "OFF");
  },
  toggleMusic: (enabled: boolean) => {
    console.log("Music:", enabled ? "ON" : "OFF");
  }
};

// Vibration for mobile
const vibrate = (pattern: number | number[] = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Custom Switch component with neon styling
const NeonSwitch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
  <div className="relative">
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`
        h-7 w-14 relative
        data-[state=checked]:bg-[#00FFFF]
        data-[state=unchecked]:bg-gray-700
        border-2 border-[#00FFFF]/50
        transition-all duration-300
      `}
    >
      <div className={`
        absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300
        ${checked ? 'transform translate-x-7 shadow-[0_0_10px_#00FFFF]' : ''}
      `} />
    </Switch>
    {checked && (
      <div className="absolute inset-0 rounded-full shadow-[0_0_15px_#00FFFF] pointer-events-none" />
    )}
  </div>
);

export function Settings({ onNavigate }: SettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [soundVolume, setSoundVolume] = useState([80]);
  const [musicVolume, setMusicVolume] = useState([60]);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  
  // Загрузка настроек из localStorage при монтировании
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
      setMusicEnabled(settings.musicEnabled ?? true);
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setHapticFeedback(settings.hapticFeedback ?? true);
      setSoundVolume([settings.soundVolume ?? 80]);
      setMusicVolume([settings.musicVolume ?? 60]);
      setCurrentLanguage(settings.language ?? "English");
    }
  }, []);

  // Сохранение настроек при изменении
  useEffect(() => {
    const settings = {
      soundEnabled,
      musicEnabled,
      notificationsEnabled,
      hapticFeedback,
      soundVolume: soundVolume[0],
      musicVolume: musicVolume[0],
      language: currentLanguage
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [soundEnabled, musicEnabled, notificationsEnabled, hapticFeedback, soundVolume, musicVolume, currentLanguage]);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    audioManager.toggleSound(enabled);
    if (enabled && hapticFeedback) vibrate(30);
  };

  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    audioManager.toggleMusic(enabled);
    if (enabled && hapticFeedback) vibrate(30);
  };

  const handleSoundVolumeChange = (value: number[]) => {
    setSoundVolume(value);
    audioManager.setSoundVolume(value[0]);
    if (hapticFeedback) vibrate(10);
  };

  const handleMusicVolumeChange = (value: number[]) => {
    setMusicVolume(value);
    audioManager.setMusicVolume(value[0]);
    if (hapticFeedback) vibrate(10);
  };

  const handleHapticToggle = (enabled: boolean) => {
    setHapticFeedback(enabled);
    if (enabled) vibrate([50, 50, 50]);
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (hapticFeedback) vibrate(30);
    
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleContactSupport = () => {
    if (hapticFeedback) vibrate(50);
    window.open('mailto:samirhamrakulov763@gmail.com?subject=Merge Battle Help&body=Hello, I need help with...', '_blank');
  };

  const handleLanguageChange = (language: string) => {
    if (hapticFeedback) vibrate(30);
    setCurrentLanguage(language);
    console.log("Language changed to:", language);
  };

  const popularLanguages = [
    { code: "en", name: "English", native: "English" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "fr", name: "French", native: "Français" },
    { code: "de", name: "German", native: "Deutsch" },
    { code: "ru", name: "Russian", native: "Русский" },
    { code: "zh", name: "Chinese", native: "中文" },
    { code: "ja", name: "Japanese", native: "日本語" },
    { code: "ar", name: "Arabic", native: "العربية" }
  ];

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A2E] safe-area-padding">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <IconButton
          icon={<ArrowLeft size={24} />}
          onClick={() => {
            if (hapticFeedback) vibrate(40);
            onNavigate("menu");
          }}
          className="text-[#00FFFF] hover:bg-[#00FFFF]/20 active:scale-95 transition-transform border-2 border-[#00FFFF]/30"
        />
        <motion.h2 
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#A100FF] text-glow-cyan"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          SETTINGS
        </motion.h2>
        <div className="w-12" />
      </div>

      {/* Settings Sections with proper scrolling */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        
        {/* Audio Section */}
        <motion.section
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#00FFFF]/10 to-[#A100FF]/10 rounded-2xl p-6 border-2 border-[#00FFFF]/30"
        >
          <h3 className="text-xl font-bold text-[#00FFFF] mb-4 flex items-center gap-2">
            <Volume2 size={20} />
            Audio
          </h3>
          
          <div className="space-y-6">
            {/* Sound Effects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-white font-semibold text-base">
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  Sound Effects
                </Label>
                <NeonSwitch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
              {soundEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#B8B8B8]">Volume</span>
                    <span className="text-[#00FFFF] font-bold">{soundVolume[0]}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX size={16} className="text-[#B8B8B8] flex-shrink-0" />
                    <Slider
                      value={soundVolume}
                      onValueChange={handleSoundVolumeChange}
                      max={100}
                      step={1}
                      className="w-full touch-pan-y"
                    />
                    <Volume2 size={16} className="text-[#B8B8B8] flex-shrink-0" />
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Music */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-white font-semibold text-base">
                  <Music size={18} />
                  Music
                </Label>
                <NeonSwitch
                  checked={musicEnabled}
                  onCheckedChange={handleMusicToggle}
                />
              </div>
              {musicEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#B8B8B8]">Volume</span>
                    <span className="text-[#00FFFF] font-bold">{musicVolume[0]}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX size={16} className="text-[#B8B8B8] flex-shrink-0" />
                    <Slider
                      value={musicVolume}
                      onValueChange={handleMusicVolumeChange}
                      max={100}
                      step={1}
                      className="w-full touch-pan-y"
                    />
                    <Volume2 size={16} className="text-[#B8B8B8] flex-shrink-0" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Notifications Section */}
        <motion.section
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#FF00FF]/10 to-[#00FFFF]/10 rounded-2xl p-6 border-2 border-[#FF00FF]/30"
        >
          <h3 className="text-xl font-bold text-[#FF00FF] mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-semibold text-base">Push Notifications</Label>
                <p className="text-sm text-[#B8B8B8]">Daily rewards & challenges</p>
              </div>
              <NeonSwitch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
          </div>
        </motion.section>

        {/* Accessibility Section */}
        <motion.section
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#00FF99]/10 to-[#00FFFF]/10 rounded-2xl p-6 border-2 border-[#00FF99]/30"
        >
          <h3 className="text-xl font-bold text-[#00FF99] mb-4 flex items-center gap-2">
            <Smartphone size={20} />
            Accessibility
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-semibold text-base flex items-center gap-2">
                  <span className="text-lg">📳</span>
                  Haptic Feedback
                </Label>
                <p className="text-sm text-[#B8B8B8]">Vibration on interactions</p>
              </div>
              <NeonSwitch
                checked={hapticFeedback}
                onCheckedChange={handleHapticToggle}
              />
            </div>
          </div>
        </motion.section>

        {/* Languages Section */}
        <motion.section
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 rounded-2xl p-6 border-2 border-[#FFD700]/30"
        >
          <h3 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
            <Globe size={20} />
            Languages
          </h3>
          
          <div className="space-y-3">
            <p className="text-sm text-[#B8B8B8] text-center mb-4">
              Supports 140+ countries worldwide
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {popularLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.name)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                    currentLanguage === language.name
                      ? "border-[#FFD700] bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 shadow-lg shadow-[#FFD700]/20"
                      : "border-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/5"
                  }`}
                >
                  <div className="font-semibold text-white text-sm">
                    {language.name}
                  </div>
                  <div className="text-[#B8B8B8] text-xs">
                    {language.native}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <button className="text-[#FFD700] text-sm font-semibold hover:underline">
                Show all languages...
              </button>
            </div>
          </div>
        </motion.section>

        {/* Help Section */}
        <motion.section
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#A100FF]/10 to-[#FF00FF]/10 rounded-2xl p-6 border-2 border-[#A100FF]/30"
        >
          <h3 className="text-xl font-bold text-[#A100FF] mb-4 flex items-center gap-2">
            <HelpCircle size={20} />
            Help
          </h3>
          
          <div className="space-y-3 text-center">
            <NeonButton 
              onClick={handleContactSupport}
              className="w-full justify-center gap-3 py-4 text-base font-bold mb-3"
            >
              <Mail size={20} />
              Contact Support
            </NeonButton>
            <p className="text-sm text-[#B8B8B8]">
              Need help? Write to us directly at<br />
              <span className="text-[#A100FF] font-semibold">samirhamrakulov763@gmail.com</span>
            </p>
          </div>
        </motion.section>

      </div>
    </div>
  );
}