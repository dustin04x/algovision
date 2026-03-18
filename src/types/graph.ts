export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

export type NodeState = 'default' | 'active' | 'visited' | 'path' | 'start' | 'end';
export type EdgeState = 'default' | 'active' | 'visited' | 'path';

export interface ArraySnapshot {
  array: number[];
  states: Record<number, 'default' | 'comparing' | 'swapping' | 'sorted' | 'target'>;
}

export interface AlgorithmStep {
  type: 'visit' | 'explore' | 'update' | 'backtrack' | 'path' | 'done';
  description: string;
  explanation: string;
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  activeNode?: string;
  activeEdge?: string;
  pseudocodeLine: number;
  dataStructures: Record<string, DataStructureSnapshot>;
  arraySnapshot?: ArraySnapshot;
}

export interface DataStructureSnapshot {
  label: string;
  type: 'table' | 'list' | 'value';
  data: Record<string, string | number> | string[] | string | number;
}

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'bellmanford' | 'kruskal' | 'prims' | 'bubblesort' | 'quicksort' | 'mergesort' | 'insertionsort' | 'binarysearch';

export const ARRAY_ALGORITHMS: AlgorithmType[] = ['bubblesort', 'quicksort', 'mergesort', 'insertionsort', 'binarysearch'];

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  pseudocode: string[];
}
