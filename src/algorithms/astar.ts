import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const astarInfo: AlgorithmInfo = {
  id: 'astar',
  name: 'A* Search',
  description: 'Finds the shortest path using a heuristic to guide the search toward the target.',
  timeComplexity: 'O(E log V)',
  spaceComplexity: 'O(V)',
  pseudocode: [
    'A*(graph, source, target):',
    '  g[source] = 0',
    '  f[source] = h(source, target)',
    '  openSet = {source}',
    '  while openSet is not empty:',
    '    u = node in openSet with min f[u]',
    '    if u == target: reconstruct path',
    '    remove u from openSet',
    '    for each neighbor v of u:',
    '      tentative_g = g[u] + weight(u, v)',
    '      if tentative_g < g[v]:',
    '        prev[v] = u',
    '        g[v] = tentative_g',
    '        f[v] = g[v] + h(v, target)',
    '        add v to openSet',
    '  return failure',
  ],
};

function heuristic(graph: Graph, aId: string, bId: string): number {
  const a = graph.nodes.find(n => n.id === aId);
  const b = graph.nodes.find(n => n.id === bId);
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) / 50;
}

function buildAdj(graph: Graph): Record<string, { node: string; edgeId: string; weight: number }[]> {
  const adj: Record<string, { node: string; edgeId: string; weight: number }[]> = {};
  graph.nodes.forEach(n => (adj[n.id] = []));
  graph.edges.forEach(e => {
    adj[e.source].push({ node: e.target, edgeId: e.id, weight: e.weight });
    if (!graph.directed) adj[e.target].push({ node: e.source, edgeId: e.id, weight: e.weight });
  });
  return adj;
}

export function runAStar(graph: Graph, sourceId: string, targetId?: string): AlgorithmStep[] {
  if (!targetId) targetId = graph.nodes[graph.nodes.length - 1]?.id;
  const adj = buildAdj(graph);
  const steps: AlgorithmStep[] = [];
  const g: Record<string, number> = {};
  const f: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const openSet = new Set<string>();
  const closedSet = new Set<string>();
  const nodeStates: Record<string, NodeState> = {};
  const edgeStates: Record<string, EdgeState> = {};

  graph.nodes.forEach(n => { g[n.id] = Infinity; f[n.id] = Infinity; prev[n.id] = null; nodeStates[n.id] = 'default'; });
  graph.edges.forEach(e => (edgeStates[e.id] = 'default'));
  if (targetId) nodeStates[targetId] = 'end';
  nodeStates[sourceId] = 'start';

  const display = () => {
    const d: Record<string, string | number> = {};
    graph.nodes.forEach(n => (d[n.id] = `g=${g[n.id] === Infinity ? '∞' : Math.round(g[n.id] * 10) / 10} f=${f[n.id] === Infinity ? '∞' : Math.round(f[n.id] * 10) / 10}`));
    return d;
  };

  const snap = (type: AlgorithmStep['type'], desc: string, explanation: string, line: number, activeNode?: string, activeEdge?: string): AlgorithmStep => ({
    type, description: desc, explanation, pseudocodeLine: line,
    nodeStates: { ...nodeStates }, edgeStates: { ...edgeStates },
    activeNode, activeEdge,
    dataStructures: {
      scores: { label: 'g / f Scores', type: 'table', data: display() },
      openSet: { label: 'Open Set', type: 'list', data: [...openSet] },
      closedSet: { label: 'Closed Set', type: 'list', data: [...closedSet] },
    },
  });

  g[sourceId] = 0;
  f[sourceId] = heuristic(graph, sourceId, targetId!);
  openSet.add(sourceId);
  steps.push(snap('visit', `Initialize: f[${sourceId}] = ${Math.round(f[sourceId] * 10) / 10}`, 'Start A* with source in open set, f = heuristic estimate.', 2, sourceId));

  while (openSet.size > 0) {
    let u = '';
    let minF = Infinity;
    for (const n of openSet) { if (f[n] < minF) { minF = f[n]; u = n; } }

    if (u === targetId) {
      const path: string[] = [];
      let cur: string | null = targetId;
      while (cur !== null) { path.unshift(cur); cur = prev[cur]; }
      path.forEach(n => (nodeStates[n] = n === sourceId ? 'start' : n === targetId ? 'end' : 'path'));
      for (let i = 0; i < path.length - 1; i++) {
        const edge = graph.edges.find(e => (e.source === path[i] && e.target === path[i + 1]) || (!graph.directed && e.source === path[i + 1] && e.target === path[i]));
        if (edge) edgeStates[edge.id] = 'path';
      }
      steps.push(snap('path', `Path found: ${path.join(' → ')} (cost=${Math.round(g[targetId] * 10) / 10})`, 'A* found the optimal path to target.', 6));
      return steps;
    }

    openSet.delete(u);
    closedSet.add(u);
    nodeStates[u] = u === sourceId ? 'start' : 'active';
    steps.push(snap('visit', `Expand ${u} (f=${Math.round(f[u] * 10) / 10})`, `${u} has the lowest f-score in the open set. Expand it.`, 5, u));

    for (const { node: v, edgeId, weight } of adj[u]) {
      if (closedSet.has(v)) continue;
      const tentG = g[u] + weight;
      if (tentG < g[v]) {
        prev[v] = u;
        g[v] = tentG;
        f[v] = g[v] + heuristic(graph, v, targetId!);
        openSet.add(v);
        edgeStates[edgeId] = 'active';
        nodeStates[v] = v === targetId ? 'end' : 'visited';
        steps.push(snap('update', `Update ${v}: g=${Math.round(tentG * 10) / 10}, f=${Math.round(f[v] * 10) / 10}`, `Found better path to ${v} via ${u}.`, 12, v, edgeId));
        edgeStates[edgeId] = 'visited';
      }
    }
    if (nodeStates[u] !== 'start') nodeStates[u] = 'visited';
  }

  steps.push(snap('done', 'A* Complete — no path found', 'Target is unreachable from source.', 15));
  return steps;
}
