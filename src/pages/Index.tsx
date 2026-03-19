import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Sidebar } from '@/components/Sidebar';
import { ARRAY_ALGORITHMS } from '@/types/graph';
import { GraphCanvas } from '@/components/GraphCanvas';
import { ArrayCanvas } from '@/components/ArrayCanvas';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { ControlBar } from '@/components/ControlBar';

const Index: React.FC = () => {
  const selectedAlgorithm = useAppStore(s => s.selectedAlgorithm);
  const isArrayAlgo = ARRAY_ALGORITHMS.includes(selectedAlgorithm);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="flex flex-1 min-h-0 p-4 gap-4 relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative rounded-2xl border border-white/5 shadow-2xl bg-background/40 backdrop-blur-md overflow-hidden">
          <div className="flex-1 min-h-0 relative">
            {isArrayAlgo ? <ArrayCanvas /> : <GraphCanvas />}
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <ControlBar />
          </div>
        </div>
        <ExecutionPanel />
      </div>
    </div>
  );
};

export default Index;
