import React from 'react';
import { useAppStore } from '@/store/useAppStore';

const COLOR_MAP = {
    default: 'hsl(215, 25%, 33%)',
    comparing: 'hsl(38, 92%, 50%)',
    swapping: 'hsl(0, 84%, 60%)',
    sorted: 'hsl(160, 84%, 39%)',
    target: 'hsl(280, 84%, 60%)',
};

export const ArrayCanvas: React.FC = () => {
    const steps = useAppStore(s => s.steps);
    const currentStep = useAppStore(s => s.currentStep);
    const storeArray = useAppStore(s => s.array);

    // Use snapshot array if available, otherwise use initial store array
    const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
    const snapshot = currentStepData?.arraySnapshot;

    const arrayToRender = snapshot?.array || storeArray;

    const maxVal = Math.max(...arrayToRender, 1);

    // States are defined by snapshot if running, else default
    const getBarColor = (index: number) => {
        if (!snapshot) return COLOR_MAP.default;
        const state = snapshot.states[index] || 'default';
        return COLOR_MAP[state];
    };

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-hidden">
            <div className="flex-1 flex items-end justify-center gap-2">
                {arrayToRender.map((value, index) => {
                    const heightPercent = Math.max((value / maxVal) * 100, 5); // min 5% height
                    const color = getBarColor(index);

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 max-w-[60px] group">
                            <span className="mb-2 text-xs font-mono font-medium text-foreground opacity-80 group-hover:opacity-100 transition-opacity">
                                {value}
                            </span>
                            <div
                                className="w-full rounded-t-md transition-all duration-300 ease-in-out relative shadow-sm"
                                style={{
                                    height: `${heightPercent}%`,
                                    backgroundColor: color,
                                }}
                            >
                                {/* Optional glow effect for active states */}
                                {(color === COLOR_MAP.comparing || color === COLOR_MAP.swapping || color === COLOR_MAP.target) && (
                                    <div className="absolute inset-0 rounded-t-md opacity-50 blur-sm" style={{ backgroundColor: color }} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP.default }} /> Default
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP.comparing }} /> Comparing
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP.swapping }} /> Swapping
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP.sorted }} /> Sorted
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP.target }} /> Target
                </div>
            </div>
        </div>
    );
};
