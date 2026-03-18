import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const bellmanFordInfo: AlgorithmInfo = {
  id: 'bellmanford',
  name: 'Bellman-Ford Algorithm',
  description: 'Finds shortest paths from a source, handling negative edge weights. Detects negative cycles.',
  timeComplexity: 'O(V × E)',
  spaceComplexity: 'O(V)',
  pseudocode: [
    'BellmanFord(graph, source):',
    '  dist[source] = 0',
    '  for each vertex v: dist[v] = ∞',
    '  for i = 1 to |V| - 1:',
    '    for each edge (u, v, w):',
    '      if dist[u] + w < dist[v]:',
    '        dist[v] = dist[u] + w',
    '        prev[v] = u',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      report negative cycle',
    '  return dist, prev',
  ],
};

export function runBellmanFord(graph: Graph, sourceId: string, targetId?: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const nodeStates: Record<string, NodeState> = {};
  const edgeStates: Record<string, EdgeState> = {};

  graph.nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null; nodeStates[n.id] = 'default'; });
  graph.edges.forEach(e => (edgeStates[e.id] = 'default'));
  if (targetId) nodeStates[targetId] = 'end';
  nodeStates[sourceId] = 'start';
  dist[sourceId] = 0;

  const distDisplay = () => {
    const d: Record<string, string | number> = {};
    graph.nodes.forEach(n => (d[n.id] = dist[n.id] === Infinity ? '∞' : dist[n.id]));
    return d;
  };

  const snap = (type: AlgorithmStep['type'], desc: string, explanation: string, line: number, activeNode?: string, activeEdge?: string): AlgorithmStep => ({
    type, description: desc, explanation, pseudocodeLine: line,
    nodeStates: { ...nodeStates }, edgeStates: { ...edgeStates },
    activeNode, activeEdge,
    dataStructures: {
      distances: { label: 'Distances', type: 'table', data: distDisplay() },
      iteration: { label: 'Iteration', type: 'value', data: '' },
    },
  });

  steps.push(snap('visit', `Initialize: dist[${sourceId}] = 0`, 'Set source distance to 0, all others to infinity.', 1, sourceId));

  const V = graph.nodes.length;
  const allEdges: { source: string; target: string; weight: number; edgeId: string }[] = [];
  graph.edges.forEach(e => {
    allEdges.push({ source: e.source, target: e.target, weight: e.weight, edgeId: e.id });
    if (!graph.directed) allEdges.push({ source: e.target, target: e.source, weight: e.weight, edgeId: e.id });
  });

  for (let i = 1; i < V; i++) {
    let updated = false;
    for (const { source, target, weight, edgeId } of allEdges) {
      if (dist[source] !== Infinity && dist[source] + weight < dist[target]) {
        dist[target] = dist[source] + weight;
        prev[target] = source;
        updated = true;
        edgeStates[edgeId] = 'active';
        nodeStates[target] = target === targetId ? 'end' : 'active';
        const step = snap('update', `Relax ${source}→${target}: ${dist[target]}`, `Iteration ${i}: Found shorter path to ${target} = ${dist[source]} + ${weight} = ${dist[target]}.`, 6, target, edgeId);
        (step.dataStructures.iteration as { label: string; type: 'value'; data: string }).data = `${i} of ${V - 1}`;
        steps.push(step);
        edgeStates[edgeId] = 'visited';
        if (nodeStates[target] !== 'end') nodeStates[target] = 'visited';
      }
    }
    if (!updated) {
      const step = snap('visit', `Iteration ${i}: no updates — early stop`, 'No edges were relaxed, algorithm can terminate early.', 3);
      (step.dataStructures.iteration as { label: string; type: 'value'; data: string }).data = `${i} of ${V - 1} (done)`;
      steps.push(step);
      break;
    }
  }

  // Reconstruct path if target
  if (targetId && dist[targetId] !== Infinity) {
    const path: string[] = [];
    let cur: string | null = targetId;
    while (cur !== null) { path.unshift(cur); cur = prev[cur]; }
    path.forEach(n => (nodeStates[n] = n === sourceId ? 'start' : n === targetId ? 'end' : 'path'));
    for (let i = 0; i < path.length - 1; i++) {
      const edge = graph.edges.find(e => (e.source === path[i] && e.target === path[i + 1]) || (!graph.directed && e.source === path[i + 1] && e.target === path[i]));
      if (edge) edgeStates[edge.id] = 'path';
    }
    steps.push(snap('path', `Shortest path: ${path.join(' → ')} (cost=${dist[targetId]})`, `Bellman-Ford found shortest path with cost ${dist[targetId]}.`, 11));
  } else {
    steps.push(snap('done', 'Bellman-Ford Complete', 'All shortest distances computed.', 11));
  }

  return steps;
}
