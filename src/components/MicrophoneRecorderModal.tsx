import React, { useState, useEffect, useRef } from 'react';
import { blobToBase64 } from '../utils/audioStorage';

interface MicrophoneRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetName: string;
  onSaveAudio: (base64Data: string, fileName: string) => Promise<void> | void;
}

export function MicrophoneRecorderModal({
  isOpen,
  onClose,
  title,
  targetName,
  onSaveAudio,
}: MicrophoneRecorderModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'ready' | 'recording' | 'recorded' | 'denied' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('Micro Mặc Định');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previewAudioElemRef = useRef<HTMLAudioElement | null>(null);

  // Stop all active streams and audio contexts
  const cleanupStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (previewAudioElemRef.current) {
      previewAudioElemRef.current.pause();
      previewAudioElemRef.current = null;
    }
    setVolumeLevel(0);
  };

  useEffect(() => {
    if (isOpen) {
      // Auto connect microphone when opening modal
      handleConnectMicrophone();
    } else {
      cleanupStream();
      setRecordedBlob(null);
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
        setPreviewAudioUrl(null);
      }
      setConnectionStatus('idle');
      setRecordingSeconds(0);
    }
    return () => {
      cleanupStream();
    };
  }, [isOpen]);

  // Connect microphone and set up audio visualizer
  const handleConnectMicrophone = async () => {
    cleanupStream();
    setConnectionStatus('connecting');
    setErrorMessage('');

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setConnectionStatus('error');
      setErrorMessage(
        'Trình duyệt của bạn hiện chưa hỗ trợ API ghi âm MediaDevices. Vui lòng sử dụng Chrome, Edge hoặc Safari phiên bản mới.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Extract device label if available
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack && audioTrack.label) {
        setDeviceName(audioTrack.label);
      } else {
        setDeviceName('Micro của bạn (Đã kết nối)');
      }

      // Setup Web Audio API Analyser for real-time sound meter
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
            }
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext visualization not available:', audioCtxErr);
      }

      setConnectionStatus('ready');
    } catch (err: unknown) {
      console.error('Lỗi khi mở micro:', err);
      const e = err as { name?: string; message?: string };
      if (
        e.name === 'NotAllowedError' ||
        e.name === 'PermissionDeniedError' ||
        e.message?.includes('denied')
      ) {
        setConnectionStatus('denied');
        setErrorMessage(
          'Trình duyệt đã chặn quyền truy cập Micro. Vui lòng bấm vào biểu tượng ổ khóa 🔒 hoặc Micro 🎙️ ở thanh địa chỉ trình duyệt, chọn "Cho phép (Allow)" rồi bấm nút "Thử Kết Nối Lại".'
        );
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setConnectionStatus('error');
        setErrorMessage(
          'Không tìm thấy thiết bị Micro nào được cắm vào máy tính / thiết bị của bạn. Vui lòng kiểm tra lại jack cắm hoặc tai nghe.'
        );
      } else {
        setConnectionStatus('error');
        setErrorMessage(
          `Không thể kết nối Micro: ${e.message || 'Lỗi không xác định'}. Vui lòng thử tải lại trang.`
        );
      }
    }
  };

  // Start live recording
  const handleStartRecording = () => {
    if (!streamRef.current || connectionStatus !== 'ready') return;

    audioChunksRef.current = [];
    setRecordedBlob(null);
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }

    // Determine supported mimeType
    let mimeType = '';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
    }

    try {
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || mimeType || 'audio/webm',
        });
        setRecordedBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setPreviewAudioUrl(url);
        setConnectionStatus('recorded');
      };

      mediaRecorder.start(100); // 100ms slice
      setConnectionStatus('recording');
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (recErr) {
      console.error('Không thể khởi tạo MediaRecorder:', recErr);
      setConnectionStatus('error');
      setErrorMessage('Lỗi khởi tạo bộ ghi âm trên trình duyệt.');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Play preview of recorded audio
  const handleTogglePlayPreview = () => {
    if (!previewAudioUrl) return;

    if (isPlayingPreview && previewAudioElemRef.current) {
      previewAudioElemRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    const audio = new Audio(previewAudioUrl);
    previewAudioElemRef.current = audio;
    audio.onended = () => {
      setIsPlayingPreview(false);
    };
    audio.onerror = () => {
      setIsPlayingPreview(false);
    };
    audio.play().catch(() => {
      setIsPlayingPreview(false);
    });
    setIsPlayingPreview(true);
  };

  // Re-record
  const handleReRecord = () => {
    if (previewAudioElemRef.current) {
      previewAudioElemRef.current.pause();
      previewAudioElemRef.current = null;
    }
    setIsPlayingPreview(false);
    setRecordedBlob(null);
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    setRecordingSeconds(0);
    setConnectionStatus('ready');
  };

  // Save recorded audio
  const handleSave = async () => {
    if (!recordedBlob) return;
    setIsSaving(true);
    try {
      const base64 = await blobToBase64(recordedBlob);
      const safeName = targetName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const fileName = `Thu_am_${safeName}_${Date.now()}.${ext}`;

      await onSaveAudio(base64, fileName);
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu audio:', err);
      alert('Không thể lưu file audio vừa thu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-primary/20 flex flex-col gap-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-2xl text-primary">mic</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-on-surface">
                {title}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Mục tiêu: <span className="font-bold text-primary">{targetName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* CONNECTION STATUS & LIVE VISUALIZER */}
        <div className="flex flex-col gap-3">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-surface-container">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connecting' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-600">
                    Đang kết nối Micro...
                  </span>
                </>
              )}
              {connectionStatus === 'ready' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">
                    Micro Đã Sẵn Sàng
                  </span>
                </>
              )}
              {connectionStatus === 'recording' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                  <span className="text-xs font-black text-rose-600 uppercase">
                    Đang Thu Âm Trực Tiếp ({formatTime(recordingSeconds)})
                  </span>
                </>
              )}
              {connectionStatus === 'recorded' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-xs font-bold text-secondary">
                    Đã Thu Âm Thành Công ({formatTime(recordingSeconds)})
                  </span>
                </>
              )}
              {(connectionStatus === 'denied' || connectionStatus === 'error') && (
                <>
                  <span className="w-3 h-3 rounded-full bg-error" />
                  <span className="text-xs font-bold text-error">
                    Chưa Kết Nối Được Micro
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] text-on-surface-variant/80 font-medium truncate max-w-[180px]">
              {deviceName}
            </span>
          </div>

          {/* Real-time Sound Wave Meter when Micro is Active */}
          {(connectionStatus === 'ready' || connectionStatus === 'recording') && (
            <div className="p-4 rounded-2xl bg-surface-container flex flex-col items-center gap-2 border border-surface-container-high">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">graphic_eq</span>
                <span>Thước Đo Âm Lượng Giọng Nói Thực Tế (Hãy Thử Nói Vào Mic):</span>
              </span>

              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs">
                {[0.4, 0.7, 1.0, 1.4, 1.1, 0.8, 1.3, 1.5, 1.2, 0.9, 0.6, 0.5].map((multiplier, idx) => {
                  const barHeight = Math.min(
                    48,
                    Math.max(6, (volumeLevel * multiplier * 0.48))
                  );
                  const isHigh = volumeLevel > 40;
                  return (
                    <div
                      key={idx}
                      className={`w-2 rounded-full transition-all duration-75 ${
                        connectionStatus === 'recording'
                          ? isHigh
                            ? 'bg-rose-500'
                            : 'bg-rose-400'
                          : isHigh
                          ? 'bg-emerald-500'
                          : 'bg-primary'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>

              <span className="text-[11px] font-bold text-primary">
                {volumeLevel > 15
                  ? '🎙️ Đang bắt được âm thanh giọng nói của bạn rất tốt!'
                  : 'Hãy thử nói "Alo" hoặc phát âm thử vào mic...'}
              </span>
            </div>
          )}

          {/* Error / Permission Denied Helper */}
          {(connectionStatus === 'denied' || connectionStatus === 'error') && (
            <div className="p-4 rounded-2xl bg-error-container/40 border border-error/30 flex flex-col gap-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 text-error font-black">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>Hướng Dẫn Cấp Quyền Kết Nối Micro:</span>
              </div>
              <p className="text-on-surface">{errorMessage}</p>
              <ol className="list-decimal list-inside text-on-surface-variant font-medium flex flex-col gap-1 pl-1">
                <li>Bấm vào biểu tượng ổ khóa 🔒 (hoặc Micro) bên trái thanh địa chỉ trình duyệt.</li>
                <li>Tìm dòng <strong>Microphone (Micro)</strong> và chọn <strong>Cho phép (Allow)</strong>.</li>
                <li>Bấm nút <strong>"Thử Kết Nối Lại Micro"</strong> bên dưới.</li>
              </ol>
              <button
                type="button"
                onClick={handleConnectMicrophone}
                className="self-start px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all cursor-pointer shadow-xs"
              >
                🔄 Thử Kết Nối Lại Micro
              </button>
            </div>
          )}

          {/* PREVIEW AUDITION CONTROLLER */}
          {connectionStatus === 'recorded' && previewAudioUrl && (
            <div className="p-4 rounded-2xl bg-secondary-container/30 border border-secondary/30 flex flex-col items-center gap-3 animate-in zoom-in-95">
              <span className="text-xs font-black text-secondary uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-base">headphones</span>
                Bản Thu Âm Vừa Hoàn Tất!
              </span>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleTogglePlayPreview}
                  className="px-6 py-3 rounded-2xl bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary font-black text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">
                    {isPlayingPreview ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlayingPreview ? 'Đang Nghe Bản Thu...' : 'Nghe Lại Bản Thu Vừa Ghi'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReRecord}
                  className="px-4 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Không hài lòng? Bấm để thu âm lại từ đầu"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                  <span>Thu Lại</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <div className="flex items-center gap-2">
            {connectionStatus === 'ready' && (
              <button
                type="button"
                onClick={handleStartRecording}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-rose-200"
              >
                <span className="material-symbols-outlined text-xl">fiber_manual_record</span>
                <span>Bắt Đầu Thu Âm</span>
              </button>
            )}

            {connectionStatus === 'recording' && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-6 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse ring-4 ring-rose-300"
              >
                <span className="material-symbols-outlined text-xl">stop</span>
                <span>Dừng & Nghe Lại ({formatTime(recordingSeconds)})</span>
              </button>
            )}

            {connectionStatus === 'recorded' && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl bg-primary text-on-primary hover:bg-primary-container font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-primary/20"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                <span>{isSaving ? 'Đang Lưu...' : 'Lưu Thành File Âm Chuẩn'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
