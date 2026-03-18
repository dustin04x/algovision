import { create } from 'zustand';
import { Graph, GraphNode, GraphEdge, AlgorithmStep, AlgorithmType, ARRAY_ALGORITHMS } from '@/types/graph';
import { runAlgorithm } from '@/algorithms';
import { sampleGraphs } from '@/data/sampleGraphs';

interface AppState {
  // Graph
  graph: Graph;
  sourceNode: string | null;
  targetNode: string | null;
  setGraph: (graph: Graph) => void;
  loadSampleGraph: (key: string) => void;

  // Array
  array: number[];
  generateRandomArray: (size?: number, sorted?: boolean) => void;
  setArray: (array: number[]) => void;

  addNode: (x: number, y: number) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  addEdge: (source: string, target: string, weight: number) => void;
  removeEdge: (id: string) => void;
  setSourceNode: (id: string | null) => void;
  setTargetNode: (id: string | null) => void;

  // Algorithm
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (algo: AlgorithmType) => void;

  // Execution
  steps: AlgorithmStep[];
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  explainMode: boolean;
  runVisualization: () => void;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setCurrentStep: (step: number) => void;
  toggleExplainMode: () => void;

  // Editing
  editMode: 'select' | 'addNode' | 'addEdge';
  edgeStart: string | null;
  setEditMode: (mode: 'select' | 'addNode' | 'addEdge') => void;
  setEdgeStart: (id: string | null) => void;
}

let nodeCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  graph: sampleGraphs.simple.graph,
  sourceNode: 'A',
  targetNode: 'F',
  array: [10, 45, 23, 8, 30, 2, 77, 65, 12, 54, 9],
  selectedAlgorithm: 'dijkstra',
  steps: [],
  currentStep: -1,
  isPlaying: false,
  speed: 500,
  explainMode: true,
  editMode: 'select',
  edgeStart: null,

  setGraph: (graph) => set({ graph, steps: [], currentStep: -1, isPlaying: false }),
  loadSampleGraph: (key) => {
    const sample = sampleGraphs[key];
    if (sample) {
      const firstNode = sample.graph.nodes[0]?.id || null;
      const lastNode = sample.graph.nodes[sample.graph.nodes.length - 1]?.id || null;
      set({ graph: sample.graph, sourceNode: firstNode, targetNode: lastNode, steps: [], currentStep: -1, isPlaying: false });
    }
  },

  generateRandomArray: (size = 15, sorted = false) => {
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    if (sorted) {
      newArray.sort((a, b) => a - b);
    }
    set({ array: newArray, steps: [], currentStep: -1, isPlaying: false });
  },
  setArray: (array) => set({ array, steps: [], currentStep: -1, isPlaying: false }),

  addNode: (x, y) => {
    const { graph } = get();
    const existingLabels = new Set(graph.nodes.map(n => n.label));
    let label = '';
    // Generate unique label
    for (let i = 0; i < 26; i++) {
      const candidate = String.fromCharCode(65 + ((nodeCounter + i) % 26));
      if (!existingLabels.has(candidate)) { label = candidate; break; }
    }
    if (!label) { nodeCounter++; label = `N${nodeCounter}`; }
    nodeCounter++;
    const id = label;
    const newNode: GraphNode = { id, x, y, label };
    set({ graph: { ...graph, nodes: [...graph.nodes, newNode] }, steps: [], currentStep: -1 });
  },
  removeNode: (id) => {
    const { graph, sourceNode, targetNode } = get();
    set({
      graph: {
        ...graph,
        nodes: graph.nodes.filter(n => n.id !== id),
        edges: graph.edges.filter(e => e.source !== id && e.target !== id),
      },
      sourceNode: sourceNode === id ? null : sourceNode,
      targetNode: targetNode === id ? null : targetNode,
      steps: [], currentStep: -1,
    });
  },
  moveNode: (id, x, y) => {
    const { graph } = get();
    set({ graph: { ...graph, nodes: graph.nodes.map(n => n.id === id ? { ...n, x, y } : n) } });
  },
  addEdge: (source, target, weight) => {
    const { graph } = get();
    const id = `e${Date.now()}`;
    const newEdge: GraphEdge = { id, source, target, weight };
    set({ graph: { ...graph, edges: [...graph.edges, newEdge] }, steps: [], currentStep: -1 });
  },
  removeEdge: (id) => {
    const { graph } = get();
    set({ graph: { ...graph, edges: graph.edges.filter(e => e.id !== id) }, steps: [], currentStep: -1 });
  },
  setSourceNode: (id) => set({ sourceNode: id, steps: [], currentStep: -1 }),
  setTargetNode: (id) => set({ targetNode: id, steps: [], currentStep: -1 }),
  setSelectedAlgorithm: (algo) => {
    const isArrayAlgo = ARRAY_ALGORITHMS.includes(algo);
    if (isArrayAlgo) {
      const isSortedRequired = algo === 'binarysearch';
      get().generateRandomArray(15, isSortedRequired);
    }
    set({ selectedAlgorithm: algo, steps: [], currentStep: -1, isPlaying: false });
  },

  runVisualization: () => {
    const { graph, sourceNode, targetNode, selectedAlgorithm, array } = get();
    const isArrayAlgo = ['bubblesort', 'binarysearch'].includes(selectedAlgorithm);

    let steps: AlgorithmStep[] = [];
    if (isArrayAlgo) {
      // @ts-expect-error: TypeScript gets confused by the union type of Graph | number[] required by the algorithms Map
      steps = runAlgorithm(selectedAlgorithm, array);
    } else {
      if (!sourceNode) return;
      steps = runAlgorithm(selectedAlgorithm, graph, sourceNode, targetNode || undefined);
    }
    set({ steps, currentStep: 0, isPlaying: false });
  },
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stepForward: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) set({ currentStep: currentStep + 1 });
    else set({ isPlaying: false });
  },
  stepBackward: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },
  reset: () => set({ steps: [], currentStep: -1, isPlaying: false }),
  setSpeed: (speed) => set({ speed }),
  setCurrentStep: (step) => set({ currentStep: step }),
  toggleExplainMode: () => set(s => ({ explainMode: !s.explainMode })),
  setEditMode: (mode) => set({ editMode: mode, edgeStart: null }),
  setEdgeStart: (id) => set({ edgeStart: id }),
}));
