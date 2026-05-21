"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Exported for use in LockScreen
export const hashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return hash.toString(16);
};

type LockType = 'none' | 'pin' | 'biometric';

interface SecurityContextType {
  isLocked: boolean;
  lockType: LockType;
  isBiometricAvailable: boolean;
  isNative: boolean;
  pinHash: string | null;
  lock: () => void;
  unlock: () => Promise<void>;
  verifyPin: (pin: string) => boolean;
  setPin: (pin: string) => void;
  setLockType: (type: LockType) => void;
  checkAutoLock: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);
const SETTINGS_KEY = 'nirvana-security-settings';
const LOCK_KEY = 'nirvana-is-locked-temp';

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockType, setLockTypeState] = useState<LockType>('none');
  const [pinHash, setPinHashState] = useState<string | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLockTypeState(parsed.lockType || 'none');
        setPinHashState(parsed.pinHash || null);
      } catch (e) {
        console.error("Failed to parse security settings", e);
      }
    }

    // Check if we should be locked
    const wasLocked = localStorage.getItem(LOCK_KEY) === 'true';
    if (wasLocked && stored?.lockType !== 'none') {
      setIsLocked(true);
    }

    // Check platform and biometric availability async
    const checkPlatform = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        const native = Capacitor.isNativePlatform();
        setIsNative(native);
        
        if (native) {
          const { Identity } = await import('@capacitor/identity');
          const result = await Identity.checkBiometry();
          setIsBiometricAvailable(result.isAvailable);
        } else {
          setIsBiometricAvailable(false);
        }
      } catch (e) {
        // If import fails, we are on Web
        setIsNative(false);
        setIsBiometricAvailable(false);
      }
    };
    checkPlatform();
  }, []);

  // Auto-lock logic (Pause/Visibility)
  useEffect(() => {
    if (!mounted || lockType === 'none') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem(LOCK_KEY, 'true');
        setIsLocked(true);
      }
    };

    const setupNativeListener = async () => {
      if (!isNative) return;
      try {
        const { App } = await import('@capacitor/app');
        await App.addListener('pause', () => {
           localStorage.setItem(LOCK_KEY, 'true');
           setIsLocked(true);
        });
      } catch (e) {
        // Not native or error
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    setupNativeListener();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted, lockType, isNative]);

  const saveSettings = (newType: LockType, newPinHash: string | null) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      lockType: newType,
      pinHash: newPinHash
    }));
    setLockTypeState(newType);
    setPinHashState(newPinHash);
  };

  const lock = () => {
    if (lockType !== 'none') {
      setIsLocked(true);
    }
  };

  const unlock = async () => {
    if (lockType === 'biometric' && isBiometricAvailable) {
      try {
        const { Identity } = await import('@capacitor/identity');
        await Identity.verifyBiometry({
          reason: 'Разблокировать NirvanaDaily',
          title: 'Доступ',
          subtitle: 'Используйте отпечаток или Face ID',
        });
        setIsLocked(false);
        localStorage.removeItem(LOCK_KEY);
      } catch (e) {
        console.log('Biometric failed or cancelled', e);
        throw new Error('Biometric verification failed');
      }
    } else {
      setIsLocked(false);
      localStorage.removeItem(LOCK_KEY);
    }
  };

  const verifyPin = (pin: string): boolean => {
    // Проверяем сохраненный пароль пользователя
    if (!pinHash) return false;
    
    const currentHash = hashPin(pin);
    
    // === ЗАЩИТА ОТ БЛОКИРОВКИ (ОПЦИОНАЛЬНО) ===
    // Если вы забыли свой пароль, вы можете раскомментировать строку ниже,
    // чтобы 3333 работало как универсальный мастер-пароль.
    // if (pin === '3333') return true;
    // ========================================
    
    return currentHash === pinHash;
  };

  const setPin = (pin: string) => {
    const newHash = hashPin(pin);
    saveSettings('pin', newHash);
  };

  const setLockType = (type: LockType) => {
    if (type === 'none') {
      saveSettings('none', null);
      setIsLocked(false);
    } else if (type === 'biometric' && isBiometricAvailable) {
      saveSettings('biometric', pinHash);
    } else {
      saveSettings('pin', pinHash);
    }
  };

  const checkAutoLock = () => {
    const wasLocked = localStorage.getItem(LOCK_KEY) === 'true';
    if (wasLocked && lockType !== 'none') {
      setIsLocked(true);
    }
  };
  
  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        lockType,
        isBiometricAvailable,
        isNative,
        pinHash,
        lock,
        unlock,
        verifyPin,
        setPin,
        setLockType,
        checkAutoLock
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurity must be used within SecurityProvider');
  return context;
};