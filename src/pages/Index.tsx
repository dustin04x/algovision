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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 bg-background/50">
            {isArrayAlgo ? <ArrayCanvas /> : <GraphCanvas />}
          </div>
          <ControlBar />
        </div>
        <ExecutionPanel />
      </div>
    </div>
  );
};

export default Index;
