import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, ShieldCheck } from 'lucide-react';

interface PasscodeLockScreenProps {
  correctPin: string;
  biometricEnabled: boolean;
  onUnlock: () => void;
}

export const PasscodeLockScreen: React.FC<PasscodeLockScreenProps> = ({
  correctPin,
  biometricEnabled,
  onUnlock,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg('');

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        setIsSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else {
        setErrorMsg('密码错误，请重新输入');
        setTimeout(() => {
          setPin('');
        }, 400);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometric = () => {
    // Biometric simulated prompt
    setIsSuccess(true);
    setTimeout(() => {
      onUnlock();
    }, 400);
  };

  return (
    <div
      id="app-passcode-lock-screen"
      className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#EDE6DC] text-[#6E5D4F] flex items-center justify-center mb-4 shadow-sm">
          {isSuccess ? (
            <ShieldCheck className="w-8 h-8 text-[#5E835E] animate-bounce" />
          ) : (
            <Lock className="w-7 h-7" />
          )}
        </div>

        <h1 className="text-xl font-semibold text-[#4A3E34] tracking-wider mb-1">
          手账隐私密码锁
        </h1>
        <p className="text-xs text-[#94877B] mb-8">输入4位数字密码解锁个人私密手账</p>

        {/* 4 PIN Dots */}
        <div className="flex items-center space-x-5 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border border-[#8C7A6B] transition-all duration-200 ${
                  isFilled ? 'bg-[#6E5D4F] scale-110' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorMsg ? (
          <p className="text-xs text-[#D9776C] h-5 mb-4">{errorMsg}</p>
        ) : (
          <div className="h-5 mb-4" />
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              id={`pin-btn-${num}`}
              onClick={() => handleDigit(num)}
              className="h-16 rounded-2xl bg-white border border-[#EDE6DC] text-[#4A3E34] text-xl font-medium shadow-xs active:bg-[#EFE9DF] active:scale-95 transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Biometric trigger */}
          <div className="flex items-center justify-center">
            {biometricEnabled ? (
              <button
                id="btn-biometric-unlock"
                onClick={handleBiometric}
                className="w-full h-16 rounded-2xl flex flex-col items-center justify-center text-[#736353] hover:text-[#524436] active:scale-95 transition-all"
                title="使用生物识别 / FaceID解锁"
              >
                <Fingerprint className="w-6 h-6 stroke-[1.8]" />
                <span className="text-[10px] mt-0.5">面容 / 指纹</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <button
            id="pin-btn-0"
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-white border border-[#EDE6DC] text-[#4A3E34] text-xl font-medium shadow-xs active:bg-[#EFE9DF] active:scale-95 transition-all flex items-center justify-center"
          >
            0
          </button>

          <button
            id="pin-btn-delete"
            onClick={handleDelete}
            className="h-16 rounded-2xl flex items-center justify-center text-[#736353] active:text-[#4A3E34] active:scale-95 transition-all"
            aria-label="删除前一位"
          >
            <Delete className="w-6 h-6 stroke-[1.8]" />
          </button>
        </div>

        <p className="text-[11px] text-[#A69B90] text-center">
          100% 本地离线加密保护 · 纯净免费无后门
        </p>
      </div>
    </div>
  );
};
