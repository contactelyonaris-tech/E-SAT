import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface SecurityEvent {
  type: 'copy' | 'paste' | 'screenshot' | 'tab-switch' | 'exit-fullscreen';
  timestamp: Date;
}

export const useSecureExam = (isActive: boolean, examId?: string) => {
  const [violations, setViolations] = useState<SecurityEvent[]>([]);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const logViolation = useCallback((type: SecurityEvent['type']) => {
    const event: SecurityEvent = { type, timestamp: new Date() };
    setViolations(prev => [...prev, event]);
    
    if (type === 'screenshot') {
      setScreenshotCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 6) {
          toast.error('Screenshot Warning!', {
            description: 'You have exceeded the screenshot limit. This attempt has been logged.',
          });
        }
        return newCount;
      });
    }

    // Persist violations except exit-fullscreen (do not permanently cancel on fullscreen exit)
    try {
      if (type !== 'exit-fullscreen') {
        const admissionId = String(localStorage.getItem('student_admission_id') || '').trim();
        if (examId && admissionId) {
          const reason = `${type} detected`;
          void (async () => {
            try {
              await supabase.from('exam_incidents').insert([{ exam_id: examId, admission_id: admissionId, reason, created_at: new Date().toISOString() }]);
            } catch (e) { /* ignore */ }
          })();
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('copy');
      toast.error('Copying is disabled during the exam');
    };

    // Prevent paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('paste');
      toast.error('Pasting is disabled during the exam');
    };

    // Detect screenshots (keyboard shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows: PrtScn, Alt+PrtScn, Win+Shift+S
      // Some browsers/platforms may expose PrintScreen via key or code; accept multiple variants
      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();
      if (
        key === 'printscreen' ||
        code === 'printscrn' ||
        code === 'printscreen' ||
        (e.altKey && (key === 'printscreen' || code.includes('print')))
      ) {
        logViolation('screenshot');
        // attempt a clipboard check if possible (best-effort)
        tryReadClipboardImage();
      }

      // Windows: Win+Shift+S or Meta(Win)+Shift+S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === 's') {
        logViolation('screenshot');
        tryReadClipboardImage();
      }

      // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(String(e.key))) {
        logViolation('screenshot');
        tryReadClipboardImage();
      }

      // Prevent common cheating shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'u')) {
        e.preventDefault();
        toast.error('This action is disabled during the exam');
      }
    };

    // Some platforms won't fire keydown for PrintScreen; handle keyup as well
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();
      if (key === 'printscreen' || code === 'printscrn' || code === 'printscreen') {
        logViolation('screenshot');
        tryReadClipboardImage();
      }
    };

    // Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab-switch');
        toast.warning('Tab switch detected', {
          description: 'Please stay on the exam page',
        });
        // best-effort clipboard image check when visibility changes (some screenshot tools copy to clipboard)
        tryReadClipboardImage();
      }
    };

    // Some screenshot tools (e.g., Snipping Tool) take focus away without making the document hidden
    // Listen for window blur and run a clipboard check and heuristic logging
    const handleWindowBlur = () => {
      // best-effort: check clipboard for an image and only log a screenshot if an image was found
      // This reduces false positives from system popups or notifications that steal focus.
      tryReadClipboardImage().catch(() => {
        // ignore errors and do not log on blur alone
      });
    };

    // Detect fullscreen changes
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      if (!isNowFullscreen && isActive) {
        logViolation('exit-fullscreen');
        // Show warning and try to re-enter fullscreen
        toast.warning('Please return to fullscreen mode');
        setTimeout(() => {
          if (!document.fullscreenElement) {
            enterFullscreen();
          }
        }, 100);
      }
    };

  document.addEventListener('copy', handleCopy);
  document.addEventListener('paste', handlePaste);
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, logViolation, examId]);

  // Try reading the clipboard for images (best-effort). Returns true if an image type was found.
  const tryReadClipboardImage = async (): Promise<boolean> => {
    try {
      // feature-detect
      const clipboard = navigator.clipboard as Clipboard & { read?: () => Promise<ClipboardItem[]> };
      if (!clipboard || typeof clipboard.read !== 'function') return false;
      // Requesting the clipboard may require permissions and a secure context
      const items = await clipboard.read();
      for (const item of items) {
        const types = item.types as ReadonlyArray<string>;
        for (const t of types) {
          if (typeof t === 'string' && t.startsWith('image/')) {
            logViolation('screenshot');
            return true;
          }
        }
      }
    } catch (err) {
      // ignore errors (permissions, unsupported browsers)
      return false;
    }
    return false;
  };

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      // Save fullscreen state to localStorage
      localStorage.setItem('examFullscreen', 'true');
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Failed to enter fullscreen mode');
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
      localStorage.removeItem('examFullscreen');
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  return {
    violations,
    screenshotCount,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
};
