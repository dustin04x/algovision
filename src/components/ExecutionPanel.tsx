import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { algorithmInfoMap } from '@/algorithms';

export const ExecutionPanel: React.FC = () => {
  const steps = useAppStore(s => s.steps);
  const currentStep = useAppStore(s => s.currentStep);
  const selectedAlgorithm = useAppStore(s => s.selectedAlgorithm);
  const explainMode = useAppStore(s => s.explainMode);

  const info = algorithmInfoMap[selectedAlgorithm];
  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  return (
    <div className="w-[350px] min-w-[350px] bg-card/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Pseudocode */}
      <div className="flex-1 min-h-0 border-b border-border/50 flex flex-col">
        <div className="px-5 py-4 border-b border-border/50 bg-background/30">
          <h2 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Pseudocode</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          <pre className="text-[13px] leading-relaxed font-mono">
            {info.pseudocode.map((line, i) => {
              const isActive = step?.pseudocodeLine === i;
              return (
                <div
                  key={i}
                  className={`px-3 py-0.5 rounded transition-all duration-200 border-l-2 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary font-medium glow' 
                      : 'border-transparent text-muted-foreground hover:text-foreground/80'
                  }`}
                >
                  <span className="inline-block w-5 text-right mr-3 opacity-40 select-none">{i + 1}</span>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* Live State */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live State</h2>
          {step && (
            <p className="text-xs text-foreground mt-1 font-medium">{step.description}</p>
          )}
          {step && explainMode && (
            <p className="text-xs text-muted-foreground mt-1">{step.explanation}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
          {step && Object.entries(step.dataStructures).map(([key, ds]) => (
            <div key={key}>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{ds.label}</h3>
              {ds.type === 'list' && Array.isArray(ds.data) && (
                <div className="flex flex-wrap gap-1">
                  {(ds.data as string[]).length === 0 ? (
                    <span className="text-xs text-muted-foreground/50 font-mono">empty</span>
                  ) : (
                    (ds.data as string[]).map((item, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-accent rounded text-xs font-mono text-foreground">
                        {item}
                      </span>
                    ))
                  )}
                </div>
              )}
              {ds.type === 'table' && typeof ds.data === 'object' && !Array.isArray(ds.data) && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs font-mono">
                  {Object.entries(ds.data as Record<string, string | number>).map(([k, v]) => (
                    <React.Fragment key={k}>
                      <span className="text-muted-foreground">{k}</span>
                      <span className={`text-right ${v === '∞' ? 'text-muted-foreground/50' : 'text-foreground'}`}>{v}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
              {ds.type === 'value' && (
                <span className="text-sm font-mono text-primary">{String(ds.data)}</span>
              )}
            </div>
          ))}
          {!step && (
            <p className="text-xs text-muted-foreground/50 text-center mt-8">Run a visualization to see live state</p>
          )}
        </div>
      </div>
    </div>
  );
};
