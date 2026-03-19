import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { algorithmInfoMap } from '@/algorithms';
import { AlgorithmType, ARRAY_ALGORITHMS } from '@/types/graph';
import { sampleGraphs } from '@/data/sampleGraphs';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, MousePointer, Plus, Link, Eye } from 'lucide-react';

const algorithms: { id: AlgorithmType; label: string; category: string }[] = [
  { id: 'bfs', label: 'BFS', category: 'Traversal' },
  { id: 'dfs', label: 'DFS', category: 'Traversal' },
  { id: 'dijkstra', label: "Dijkstra's", category: 'Shortest Path' },
  { id: 'astar', label: 'A* Search', category: 'Shortest Path' },
  { id: 'bellmanford', label: 'Bellman-Ford', category: 'Shortest Path' },
  { id: 'kruskal', label: "Kruskal's MST", category: 'Spanning Tree' },
  { id: 'prims', label: "Prim's MST", category: 'Spanning Tree' },
  { id: 'bubblesort', label: 'Bubble Sort', category: 'Sorting' },
  { id: 'quicksort', label: 'Quick Sort', category: 'Sorting' },
  { id: 'mergesort', label: 'Merge Sort', category: 'Sorting' },
  { id: 'insertionsort', label: 'Insertion Sort', category: 'Sorting' },
  { id: 'binarysearch', label: 'Binary Search', category: 'Searching' },
];

const categories = [...new Set(algorithms.map(a => a.category))];

export const Sidebar: React.FC = () => {
  const selectedAlgorithm = useAppStore(s => s.selectedAlgorithm);
  const setSelectedAlgorithm = useAppStore(s => s.setSelectedAlgorithm);
  const loadSampleGraph = useAppStore(s => s.loadSampleGraph);
  const runVisualization = useAppStore(s => s.runVisualization);
  const sourceNode = useAppStore(s => s.sourceNode);
  const targetNode = useAppStore(s => s.targetNode);
  const speed = useAppStore(s => s.speed);
  const setSpeed = useAppStore(s => s.setSpeed);
  const editMode = useAppStore(s => s.editMode);
  const setEditMode = useAppStore(s => s.setEditMode);
  const explainMode = useAppStore(s => s.explainMode);
  const toggleExplainMode = useAppStore(s => s.toggleExplainMode);

  const generateRandomArray = useAppStore(s => s.generateRandomArray);

  const info = algorithmInfoMap[selectedAlgorithm];
  const isArrayAlgo = ARRAY_ALGORITHMS.includes(selectedAlgorithm);

  return (
    <div className="w-[280px] min-w-[280px] bg-card/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-sm font-semibold text-foreground tracking-wide">AlgoVision</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Algorithm Visualization Platform</p>
      </div>

      {/* Algorithm Selection */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Algorithm</h2>
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1">{cat}</p>
              <div className="space-y-1">
                {algorithms.filter(a => a.category === cat).map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ${selectedAlgorithm === algo.id
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
                      }`}
                  >
                    {algo.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2.5 rounded-md bg-accent/50 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">{info.name}</p>
          <p>{info.description}</p>
          <div className="mt-2 font-mono text-[10px] space-y-0.5">
            <p>Time: <span className="text-primary">{info.timeComplexity}</span></p>
            <p>Space: <span className="text-primary">{info.spaceComplexity}</span></p>
          </div>
        </div>
      </div>

      {/* Graph Settings */}
      {!isArrayAlgo && (
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Graph</h2>
          <div className="space-y-1.5">
            {Object.entries(sampleGraphs).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => loadSampleGraph(key)}
                className="w-full text-left px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Array Settings */}
      {isArrayAlgo && (
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Array Tools</h2>
          <div className="space-y-1.5">
            <button
              onClick={() => generateRandomArray(15, false)}
              className="w-full text-left px-3 py-1.5 rounded-md bg-accent/50 text-xs text-foreground hover:bg-accent transition-colors border border-transparent hover:border-border"
            >
              Random Array
            </button>
            <button
              onClick={() => generateRandomArray(15, true)}
              className="w-full text-left px-3 py-1.5 rounded-md bg-accent/50 text-xs text-foreground hover:bg-accent transition-colors border border-transparent hover:border-border"
            >
              Sorted Array
            </button>
          </div>
        </div>
      )}

      {/* Edit Tools */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Edit Mode</h2>
        <div className="flex gap-1.5">
          {([
            { mode: 'select' as const, icon: MousePointer, label: 'Select' },
            { mode: 'addNode' as const, icon: Plus, label: 'Node' },
            { mode: 'addEdge' as const, icon: Link, label: 'Edge' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setEditMode(mode)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs transition-colors ${editMode === mode
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:bg-accent border border-transparent'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Speed</h2>
        <input
          type="range"
          min={50}
          max={2000}
          step={50}
          value={2050 - speed}
          onChange={e => setSpeed(2050 - Number(e.target.value))}
          className="w-full accent-primary h-1"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Slow</span>
          <span>{speed}ms</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Explain Mode */}
      <div className="p-4 border-b border-border">
        <button
          onClick={toggleExplainMode}
          className={`flex items-center gap-2 text-xs transition-colors ${explainMode ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Eye size={14} />
          Explain Mode {explainMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Run */}
      {!isArrayAlgo && (
        <div className="p-4 mt-auto">
          <div className="text-xs text-muted-foreground mb-2 font-mono">
            Source: <span className="text-primary">{sourceNode || '—'}</span> → Target: <span className="text-destructive">{targetNode || '—'}</span>
          </div>
          <button
            onClick={runVisualization}
            disabled={!sourceNode}
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Run Visualization
          </button>
        </div>
      )}
    </div>
  );
};
