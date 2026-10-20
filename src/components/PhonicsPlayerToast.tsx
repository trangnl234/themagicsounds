import { useEffect, useState } from 'react';
import { registerToastListener, unregisterToastListener, stopSpeaking } from '../utils/audioPlayer';

export function PhonicsPlayerToast() {
  const [toastData, setToastData] = useState<{
    sound: string;
    ipa?: string;
    word?: string;
    subtext?: string;
    active: boolean;
    isCustomAudio?: boolean;
  }>({
    sound: 's',
    ipa: '/sss/',
    word: 'snake (Con Rắn)',
    active: false,
    isCustomAudio: false,
  });

  useEffect(() => {
    registerToastListener((info) => {
      setToastData(info);
    });
    return () => {
      unregisterToastListener();
    };
  }, []);

  if (!toastData.active) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      role="status"
      aria-live="polite"
    >
      <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl shadow-2xl border border-inverse-on-surface/20 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
            {toastData.sound}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base truncate">
                Âm /{toastData.sound}/
              </span>
              {toastData.ipa && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-primary-fixed shrink-0 font-mono">
                  {toastData.ipa}
                </span>
              )}
              {toastData.isCustomAudio && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-group-ai-j-oa-ie-ee-or/20 text-group-ai-j-oa-ie-ee-or font-bold shrink-0 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  File Chuẩn
                </span>
              )}
            </div>
            <p className="text-xs text-inverse-on-surface/80 truncate">
              {toastData.word || 'Phonics Sound'}
            </p>
            {toastData.subtext && (
              <p className="text-[10px] text-inverse-on-surface/60 truncate">
                {toastData.subtext}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-end gap-1 h-6 w-8">
            <span className="w-1 bg-secondary-container rounded-full animate-pulse h-3" />
            <span className="w-1 bg-secondary-container rounded-full animate-pulse h-6 delay-75" />
            <span className="w-1 bg-secondary-container rounded-full animate-pulse h-4 delay-150" />
            <span className="w-1 bg-secondary-container rounded-full animate-pulse h-2 delay-100" />
          </div>
          <button
            onClick={() => stopSpeaking()}
            className="text-inverse-on-surface/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Dừng phát"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
