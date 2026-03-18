import { Graph, AlgorithmStep, AlgorithmInfo, AlgorithmType } from '@/types/graph';
import { runBFS, bfsInfo } from './bfs';
import { runDFS, dfsInfo } from './dfs';
import { runDijkstra, dijkstraInfo } from './dijkstra';
import { runAStar, astarInfo } from './astar';
import { runBellmanFord, bellmanFordInfo } from './bellmanford';
import { runKruskal, kruskalInfo } from './kruskal';
import { runPrims, primsInfo } from './prims';
import { runBubbleSort, bubblesortInfo } from './bubblesort';
import { runQuickSort, quicksortInfo } from './quicksort';
import { runMergeSort, mergesortInfo } from './mergesort';
import { runInsertionSort, insertionsortInfo } from './insertionsort';
import { runBinarySearch, binarysearchInfo } from './binarysearch';

export const algorithmInfoMap: Record<AlgorithmType, AlgorithmInfo> = {
  bfs: bfsInfo,
  dfs: dfsInfo,
  dijkstra: dijkstraInfo,
  astar: astarInfo,
  bellmanford: bellmanFordInfo,
  kruskal: kruskalInfo,
  prims: primsInfo,
  bubblesort: bubblesortInfo,
  quicksort: quicksortInfo,
  mergesort: mergesortInfo,
  insertionsort: insertionsortInfo,
  binarysearch: binarysearchInfo,
};

export function runAlgorithm(
  type: AlgorithmType,
  graphOrArray: Graph | number[],
  sourceId?: string,
  targetId?: string
): AlgorithmStep[] {
  switch (type) {
    case 'bubblesort': return runBubbleSort(graphOrArray as number[]);
    case 'quicksort': return runQuickSort(graphOrArray as number[]);
    case 'mergesort': return runMergeSort(graphOrArray as number[]);
    case 'insertionsort': return runInsertionSort(graphOrArray as number[]);
    case 'binarysearch': return runBinarySearch(graphOrArray as number[]);
    case 'bfs': return runBFS(graphOrArray as Graph, sourceId!, targetId);
    case 'dfs': return runDFS(graphOrArray as Graph, sourceId!, targetId);
    case 'dijkstra': return runDijkstra(graphOrArray as Graph, sourceId!, targetId);
    case 'astar': return runAStar(graphOrArray as Graph, sourceId!, targetId);
    case 'bellmanford': return runBellmanFord(graphOrArray as Graph, sourceId!, targetId);
    case 'kruskal': return runKruskal(graphOrArray as Graph, sourceId!);
    case 'prims': return runPrims(graphOrArray as Graph, sourceId!);
  }
}
