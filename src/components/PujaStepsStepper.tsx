'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, Play } from 'lucide-react';

interface Step {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
}

export default function PujaStepsStepper({ steps }: StepperProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStepCompleted = (id: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
      {/* Stepper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 no-print">
        <div className="space-y-1">
          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-stone-800">
            పూజా విధానము (దశలవారీగా)
          </h3>
          <p className="font-lora text-xs sm:text-sm text-stone-500">
            Step-by-step guidance. Check off steps as you complete them to keep your position during worship.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] tracking-wider text-amber-800 font-outfit uppercase font-semibold block">Ritual Progress</span>
            <span className="text-xs font-bold text-stone-800 font-outfit">{completedCount} of {steps.length} Steps ({progressPercent}%)</span>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-500 flex items-center justify-center font-outfit text-xs font-extrabold text-amber-800 bg-white shadow-sm">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Stepper Content */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isActive = currentStepIndex === idx;
          const isCompleted = !!completedSteps[step.id];

          return (
            <div
              key={step.id}
              className={`border rounded-2xl p-4 transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-50/60 to-amber-50/20 border-amber-500 shadow-md ring-1 ring-amber-300'
                  : 'bg-stone-50/50 border-stone-200 hover:bg-stone-50'
              } print:border-stone-300 print:bg-transparent print:p-3 print:my-2`}
            >
              <div className="flex items-start gap-4">
                {/* Step Number Badge */}
                <div
                  onClick={() => toggleStepCompleted(step.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-outfit text-xs font-bold flex-shrink-0 cursor-pointer select-none transition-all ${
                    isCompleted
                      ? 'bg-amber-600 text-stone-950 shadow-md'
                      : isActive
                      ? 'bg-stone-900 text-amber-400'
                      : 'bg-stone-200 text-stone-600'
                  } print:bg-stone-100 print:text-black`}
                >
                  {isCompleted ? '✓' : step.stepNumber}
                </div>

                {/* Description details */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-center justify-between">
                    <h4
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`font-cinzel text-sm sm:text-base font-bold cursor-pointer hover:text-amber-700 transition-colors ${
                        isCompleted ? 'line-through text-stone-400 font-normal' : 'text-stone-800'
                      }`}
                    >
                      {step.title}
                    </h4>

                    {/* Completion check square (Hidden on print) */}
                    <button
                      onClick={() => toggleStepCompleted(step.id)}
                      className="text-stone-400 hover:text-amber-600 transition-colors no-print"
                      aria-label="Toggle completion"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-amber-600 fill-amber-100" />
                      ) : (
                        <Circle className="h-5 w-5 hover:text-amber-500" />
                      )}
                    </button>
                  </div>

                  {/* Instructions (Collaspable, shown fully if active, or truncated/readable) */}
                  <div
                    className={`font-lora text-xs sm:text-sm text-stone-600 leading-relaxed transition-all duration-300 ${
                      isActive ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'
                    } print:max-h-none print:opacity-100 print:block print:mt-1`}
                  >
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Buttons (Hidden on Print) */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-100 no-print">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="text-xs font-outfit font-bold px-4 py-2 border border-stone-200 hover:border-amber-400 hover:text-amber-700 rounded-xl disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:text-stone-500 transition-all"
        >
          Previous Step
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === steps.length - 1}
          className="bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 text-xs font-outfit font-bold px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-40 disabled:hover:bg-stone-900 disabled:hover:text-amber-100"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
