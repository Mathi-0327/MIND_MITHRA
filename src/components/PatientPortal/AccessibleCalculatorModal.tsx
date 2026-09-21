import React, { useState } from 'react';
import { X, Delete, RotateCcw, Calculator as CalcIcon } from 'lucide-react';
import { audioService } from '../../lib/audioService';

interface AccessibleCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibleCalculatorModal: React.FC<AccessibleCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  if (!isOpen) return null;

  const playTap = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  const playSuccess = () => {
    audioService.playFeedbackSound('SUCCESS');
  };

  const handleDigit = (digit: string) => {
    playTap();
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const handleDecimal = () => {
    playTap();
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleClear = () => {
    playTap();
    setDisplayValue('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    playTap();
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue('0');
    }
  };

  const handleOperation = (nextOp: string) => {
    playTap();
    const inputValue = parseFloat(displayValue);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const result = calculate(prevValue, inputValue, operation);
      setDisplayValue(String(result));
      setPrevValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(displayValue);

    if (prevValue !== null && operation) {
      playSuccess();
      const result = calculate(prevValue, inputValue, operation);
      setDisplayValue(String(result));
      setPrevValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    } else {
      playTap();
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '−':
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b === 0 ? 0 : Math.round((a / b) * 10000) / 10000;
      default:
        return b;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#FFFDF7] w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border-3 border-[#E5BD78] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] px-5 py-3.5 flex items-center justify-between border-b-2 border-[#E5BD78]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-sm">
              <CalcIcon className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2D2115]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Simple Calculator
              </h2>
              <p className="text-xs text-[#6B543E] font-medium">
                Large, easy numbers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white text-[#4A2E12] hover:bg-[#FFF8EE] flex items-center justify-center border-2 border-[#E5BD78] shadow-xs transition-transform active:scale-95 cursor-pointer"
            aria-label="Close Calculator"
          >
            <X className="w-5 h-5 stroke-[2.6]" />
          </button>
        </div>

        {/* Big High-Contrast Display */}
        <div className="p-4 sm:p-5">
          <div className="bg-white rounded-2xl p-4 border-2 border-[#D4C5A9] shadow-inner flex flex-col items-end justify-center min-h-[90px]">
            {operation && prevValue !== null && (
              <span className="text-xs font-black text-[#D97706] mb-1">
                {prevValue} {operation}
              </span>
            )}
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#2D2115] tracking-tight break-all">
              {displayValue}
            </div>
          </div>
        </div>

        {/* Large Touch Target Keypad */}
        <div className="px-4 pb-5 pt-1 grid grid-cols-4 gap-2.5 sm:gap-3 select-none">
          {/* Row 1: Clear, Backspace, Divide, Multiply */}
          <button
            onClick={handleClear}
            className="h-14 sm:h-16 rounded-2xl bg-[#FEE2E2] hover:bg-[#FECDD3] text-[#B91C1C] font-black text-base sm:text-lg border-2 border-[#FCA5A5] shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>C</span>
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 sm:h-16 rounded-2xl bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#44403C] font-black text-base sm:text-lg border-2 border-[#D6D3D1] shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Erase last number"
          >
            <Delete className="w-5 h-5 stroke-[2.4]" />
          </button>

          <button
            onClick={() => handleOperation('÷')}
            className={`h-14 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl border-2 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
              operation === '÷'
                ? 'bg-[#D97706] text-white border-[#B45309]'
                : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] hover:bg-[#FDE68A]'
            }`}
          >
            ÷
          </button>

          <button
            onClick={() => handleOperation('×')}
            className={`h-14 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl border-2 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
              operation === '×'
                ? 'bg-[#D97706] text-white border-[#B45309]'
                : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] hover:bg-[#FDE68A]'
            }`}
          >
            ×
          </button>

          {/* Row 2: 7, 8, 9, Minus */}
          {['7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-[#FFF8EE] text-[#2D2115] font-black text-2xl sm:text-3xl border-2 border-[#EADFCB] shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => handleOperation('−')}
            className={`h-14 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl border-2 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
              operation === '−'
                ? 'bg-[#D97706] text-white border-[#B45309]'
                : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] hover:bg-[#FDE68A]'
            }`}
          >
            −
          </button>

          {/* Row 3: 4, 5, 6, Plus */}
          {['4', '5', '6'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-[#FFF8EE] text-[#2D2115] font-black text-2xl sm:text-3xl border-2 border-[#EADFCB] shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => handleOperation('+')}
            className={`h-14 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl border-2 shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
              operation === '+'
                ? 'bg-[#D97706] text-white border-[#B45309]'
                : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] hover:bg-[#FDE68A]'
            }`}
          >
            +
          </button>

          {/* Row 4: 1, 2, 3, Equals */}
          {['1', '2', '3'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-[#FFF8EE] text-[#2D2115] font-black text-2xl sm:text-3xl border-2 border-[#EADFCB] shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleEquals}
            className="row-span-2 h-full rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-2xl sm:text-3xl border-2 border-[#15803D] shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Calculate answer"
          >
            =
          </button>

          {/* Row 5: 0 (spans 2 cols), Decimal */}
          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 h-14 sm:h-16 rounded-2xl bg-white hover:bg-[#FFF8EE] text-[#2D2115] font-black text-2xl sm:text-3xl border-2 border-[#EADFCB] shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="h-14 sm:h-16 rounded-2xl bg-white hover:bg-[#FFF8EE] text-[#2D2115] font-black text-2xl sm:text-3xl border-2 border-[#EADFCB] shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            .
          </button>
        </div>

        {/* Calm close button at bottom */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#FFF6E5] hover:bg-[#FDE8B5] text-[#422B14] font-black text-sm border-2 border-[#E5BD78] transition-all active:scale-98 cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
