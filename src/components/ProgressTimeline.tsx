import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const ProgressTimeline: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Reading File', description: 'Loading and parsing Java source code' },
    { title: 'Analyzing Code', description: 'Identifying classes, methods, and dependencies' },
    { title: 'Generating Tests', description: 'Creating comprehensive test cases with LLM' },
    { title: 'Finalizing', description: 'Formatting and preparing test output' }
  ];

  useEffect(() => {
    const intervals = [800, 1200, 2000, 600];
    let totalDelay = 0;

    steps.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, totalDelay);
      totalDelay += intervals[index];
    });

    return () => {
      setCurrentStep(0);
    };
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🔄 Processing Progress
        </h3>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          const isPending = currentStep < stepNumber;
          
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle size={16} /> : stepNumber}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-8 mt-2 transition-colors ${
                    isCompleted ? 'bg-green-600' : 'bg-slate-600'
                  }`} />
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <div className="font-medium text-slate-200">{step.title}</div>
                <div className="text-sm text-slate-400">{step.description}</div>
                <div className={`text-xs mt-1 transition-colors ${
                  isCompleted
                    ? 'text-green-400'
                    : isActive
                    ? 'text-blue-400'
                    : 'text-slate-500'
                }`}>
                  {isCompleted ? '✅ Completed' : isActive ? '🔄 Processing...' : '⏳ Pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTimeline;