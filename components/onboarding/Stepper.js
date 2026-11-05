"use client";

export default function Stepper({ currentStep, steps, onStepClick }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
      {/* Mobile Step Counter */}
      <div className="sm:hidden flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>
        <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
          {currentStep}/{steps.length}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 cursor-default"
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(stepNumber);
                }
              }}
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  isCompleted
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 cursor-pointer hover:bg-emerald-700"
                    : isCurrent
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md shadow-emerald-200"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Step Title & Subtitle */}
              <div className="text-center mt-2">
                <span
                  className={`text-xs font-semibold block transition-colors ${
                    isCurrent
                      ? "text-emerald-700"
                      : isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[10px] text-gray-400 hidden md:block">
                  {step.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

