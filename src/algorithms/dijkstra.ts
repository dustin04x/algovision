import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const dijkstraInfo: AlgorithmInfo = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  description: 'Finds the shortest path from a source node to all other nodes in a weighted graph.',
  timeComplexity: 'O((V + E) log V)',
  spaceComplexity: 'O(V)',
  pseudocode: [
    "Dijkstra(graph, source):",
    "  dist[source] = 0",
    "  for each vertex v: dist[v] = ∞",
    "  PQ = priority queue with (0, source)",
    "  while PQ is not empty:",
    "    (d, u) = PQ.extractMin()",
    "    if d > dist[u]: continue",
    "    for each neighbor v of u:",
    "      alt = dist[u] + weight(u, v)",
    "      if alt < dist[v]:",
    "        dist[v] = alt",
    "        prev[v] = u",
    "        PQ.insert(alt, v)",
    "  return dist, prev",
  ],
};

function buildAdj(graph: Graph): Record<string, { node: string; edgeId: string; weight: number }[]> {
  const adj: Record<string, { node: string; edgeId: string; weight: number }[]> = {};
  graph.nodes.forEach(n => (adj[n.id] = []));
  graph.edges.forEach(e => {
    adj[e.source].push({ node: e.target, edgeId: e.id, weight: e.weight });
    if (!graph.directed) adj[e.target].push({ node: e.source, edgeId: e.id, weight: e.weight });
  });
  return adj;
}

export function runDijkstra(graph: Graph, sourceId: string, targetId?: string): AlgorithmStep[] {
  const adj = buildAdj(graph);
  const steps: AlgorithmStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const nodeStates: Record<string, NodeState> = {};
  const edgeStates: Record<string, EdgeState> = {};

  // min-heap as array
  const pq: [number, string][] = [];
  const pqPush = (d: number, n: string) => { pq.push([d, n]); pq.sort((a, b) => a[0] - b[0]); };
  const pqPop = () => pq.shift()!;

  graph.nodes.forEach(n => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    nodeStates[n.id] = 'default';
  });
  graph.edges.forEach(e => (edgeStates[e.id] = 'default'));
  if (targetId) nodeStates[targetId] = 'end';
  nodeStates[sourceId] = 'start';
  dist[sourceId] = 0;

  const distDisplay = () => {
    const d: Record<string, string | number> = {};
    graph.nodes.forEach(n => (d[n.id] = dist[n.id] === Infinity ? '∞' : dist[n.id]));
    return d;
  };

  const pqDisplay = () => pq.map(([d, n]) => `${n}(${d})`);

  const snap = (
    type: AlgorithmStep['type'], desc: string, explanation: string, line: number,
    activeNode?: string, activeEdge?: string
  ): AlgorithmStep => ({
    type, description: desc, explanation, pseudocodeLine: line,
    nodeStates: { ...nodeStates }, edgeStates: { ...edgeStates },
    activeNode, activeEdge,
    dataStructures: {
      distances: { label: 'Distances', type: 'table', data: distDisplay() },
      priorityQueue: { label: 'Priority Queue', type: 'list', data: pqDisplay() },
      visited: { label: 'Visited', type: 'list', data: [...visited] },
    },
  });

  pqPush(0, sourceId);
  steps.push(snap('visit', `Initialize: dist[${sourceId}] = 0`, 'Set source distance to 0 and add to priority queue.', 1, sourceId));

  while (pq.length > 0) {
    const [d, u] = pqPop();
    if (d > dist[u]) continue;
    if (visited.has(u)) continue;
    visited.add(u);
    nodeStates[u] = u === sourceId ? 'start' : 'active';
    steps.push(snap('visit', `Extract min: ${u} (dist=${d})`, `Extract ${u} with distance ${d} from the priority queue.`, 5, u));

    if (u === targetId) {
      const path: string[] = [];
      let cur: string | null = targetId;
      while (cur !== null) { path.unshift(cur); cur = prev[cur]; }
      path.forEach(n => (nodeStates[n] = n === sourceId ? 'start' : n === targetId ? 'end' : 'path'));
      // highlight path edges
      for (let i = 0; i < path.length - 1; i++) {
        const edge = graph.edges.find(e =>
          (e.source === path[i] && e.target === path[i + 1]) ||
          (!graph.directed && e.source === path[i + 1] && e.target === path[i])
        );
        if (edge) edgeStates[edge.id] = 'path';
      }
      steps.push(snap('path', `Shortest path: ${path.join(' → ')} (cost=${dist[targetId]})`, `Found shortest path with total cost ${dist[targetId]}.`, 13));
      return steps;
    }

    for (const { node: v, edgeId, weight } of adj[u]) {
      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
        pqPush(alt, v);
        edgeStates[edgeId] = 'active';
        steps.push(snap('update', `Relax ${u}→${v}: ${alt}`, `Found shorter path to ${v}: ${dist[u]} + ${weight} = ${alt}.`, 10, v, edgeId));
        edgeStates[edgeId] = 'visited';
      }
    }
    if (nodeStates[u] !== 'start') nodeStates[u] = 'visited';
  }

  steps.push(snap('done', 'Dijkstra Complete', 'All reachable nodes processed.', 13));
  return steps;
}
