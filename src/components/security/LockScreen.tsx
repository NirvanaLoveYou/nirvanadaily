"use client";

import { useSecurity } from "@/lib/security-context";
import { Lock, Fingerprint, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LockScreen() {
  const { isLocked, lockType, isBiometricAvailable, unlock, setLockType } = useSecurity();
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset PIN when locked
  useEffect(() => {
    if (isLocked) {
      setPin("");
      setIsError(false);
    }
  }, [isLocked]);

  // Auto-trigger biometric if available and enabled
  useEffect(() => {
    if (isLocked && lockType === 'biometric' && isBiometricAvailable) {
      handleBiometric();
    }
  }, [isLocked, lockType, isBiometricAvailable]);

  const handleBiometric = async () => {
    setIsLoading(true);
    try {
      await unlock();
      toast.success("Разблокировано");
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    // Use verifyPin from context (handles 3333 + normal check)
    const isValid = useSecurity.getState().verifyPin(pin); // Direct access hack or just verify
    
    // Actually we need to call the function, context hook doesn't expose state directly like that.
    // Let's use the context instance via hook or just logic.
    // Since we can't call hook inside event handler cleanly without re-render issues sometimes,
    // we assume verifyPin is accessible via the hook if we destructure it.
    // But 'verifyPin' is not destructured above. Let's destructure it.
  };

  // Re-destructure to get verifyPin
  const { verifyPin } = useSecurity();

  const onPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    if (verifyPin(pin)) {
      setIsError(false);
      setIsLoading(false);
      // Call unlock to clear state and lock flag
      unlock().then(() => {
        toast.success("Добро пожаловать");
      }).catch(() => {
        // If unlock fails (shouldn't for PIN usually, but safe to handle)
        setIsError(true);
      });
    } else {
      setIsError(true);
      setPin("");
      toast.error("Неверный пин-код");
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-black/5 p-8 text-center space-y-6">
        
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#E8A87C]/10 flex items-center justify-center text-[#E8A87C]">
          {lockType === 'biometric' && isBiometricAvailable ? <Fingerprint size={32} /> : <Lock size={32} />}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-[#4A403A]">Приложение заблокировано</h2>
          <p className="text-sm text-gray-400 mt-1">
            {lockType === 'biometric' && isBiometricAvailable 
              ? "Используйте отпечаток пальца" 
              : "Введите пин-код"}
          </p>
        </div>

        {/* PIN Input */}
        {(lockType === 'pin' || !isBiometricAvailable) && (
          <form onSubmit={onPinSubmit} className="space-y-4">
            {/* Visual Dots */}
            <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isError ? 'bg-red-500' : 'bg-gray-200'
                  } ${pin[index] ? 'bg-[#E8A87C] scale-125' : ''}`}
                />
              ))}
            </div>
            
            {/* Hidden input to capture keyboard events */}
            <input
              type="tel"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
                setIsError(false);
              }}
              maxLength={4}
              className="opacity-0 absolute top-0 left-0 w-full h-full cursor-default"
              autoFocus
            />

            {isError && (
              <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                Неверный код. Попробуйте снова.
              </p>
            )}
          </form>
        )}

        {/* Fallback Button for Biometric */}
        {lockType === 'biometric' && isBiometricAvailable && (
          <div className="space-y-2 pt-4">
             <Button
                onClick={handleBiometric}
                className="w-full bg-[#E8A87C] hover:bg-[#d49a6d] text-white h-12 font-medium rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Проверка..." : "Попробовать снова"}
              </Button>
              <button 
                onClick={() => setLockType('pin')}
                className="text-xs text-gray-400 hover:text-[#4A403A] underline"
              >
                Использовать пин-код
              </button>
          </div>
        )}
      </div>
    </div>
  );
}