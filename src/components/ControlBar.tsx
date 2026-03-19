import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

export const ControlBar: React.FC = () => {
  const steps = useAppStore(s => s.steps);
  const currentStep = useAppStore(s => s.currentStep);
  const isPlaying = useAppStore(s => s.isPlaying);
  const speed = useAppStore(s => s.speed);
  const play = useAppStore(s => s.play);
  const pause = useAppStore(s => s.pause);
  const stepForward = useAppStore(s => s.stepForward);
  const stepBackward = useAppStore(s => s.stepBackward);
  const reset = useAppStore(s => s.reset);
  const setCurrentStep = useAppStore(s => s.setCurrentStep);
  const runVisualization = useAppStore(s => s.runVisualization);
  const selectedAlgorithm = useAppStore(s => s.selectedAlgorithm);
  const sourceNode = useAppStore(s => s.sourceNode);

  // We consider it runnable if it's an array algorithm, or a graph algorithm with a source node
  const isArrayAlgo = ['bubblesort', 'quicksort', 'mergesort', 'insertionsort', 'binarysearch'].includes(selectedAlgorithm);
  const canRun = isArrayAlgo ? true : !!sourceNode;

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        const state = useAppStore.getState();
        if (state.currentStep < state.steps.length - 1) {
          state.stepForward();
        } else {
          state.pause();
        }
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  const hasSteps = steps.length > 0;
  const progress = hasSteps ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="h-16 bg-card/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center px-6 gap-6 min-w-[500px]">
      <div className="flex items-center gap-2">
        <button onClick={reset} disabled={!hasSteps} className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
          <RotateCcw size={15} />
        </button>
        <button onClick={stepBackward} disabled={!hasSteps || currentStep <= 0} className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
          <SkipBack size={15} />
        </button>
        <button
          onClick={() => {
            if (!hasSteps) {
              runVisualization();
              play();
            } else if (isPlaying) {
              pause();
            } else {
              play();
            }
          }}
          disabled={(!hasSteps && !canRun)}
          className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          onClick={() => {
            if (!hasSteps) {
              runVisualization();
            } else {
              stepForward();
            }
          }}
          disabled={(!hasSteps && !canRun) || (hasSteps && currentStep >= steps.length - 1)}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <SkipForward size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-1 bg-accent rounded-full overflow-hidden cursor-pointer" onClick={e => {
          if (!hasSteps) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentStep(Math.min(Math.max(Math.round(pct * (steps.length - 1)), 0), steps.length - 1));
        }}>
          <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-mono text-muted-foreground min-w-[60px] text-right">
          {hasSteps ? `${currentStep + 1} / ${steps.length}` : '— / —'}
        </span>
      </div>
    </div>
  );
};
