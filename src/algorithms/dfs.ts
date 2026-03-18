import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const dfsInfo: AlgorithmInfo = {
  id: 'dfs',
  name: 'Depth-First Search',
  description: 'Explores as far as possible along each branch before backtracking.',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  pseudocode: [
    'DFS(graph, source):',
    '  create stack S',
    '  push source onto S',
    '  while S is not empty:',
    '    node = S.pop()',
    '    if node not visited:',
    '      mark node as visited',
    '      for each neighbor of node:',
    '        if neighbor not visited:',
    '          push neighbor onto S',
    '  return visited',
  ],
};

function buildAdj(graph: Graph): Record<string, { node: string; edgeId: string }[]> {
  const adj: Record<string, { node: string; edgeId: string }[]> = {};
  graph.nodes.forEach(n => (adj[n.id] = []));
  graph.edges.forEach(e => {
    adj[e.source].push({ node: e.target, edgeId: e.id });
    if (!graph.directed) adj[e.target].push({ node: e.source, edgeId: e.id });
  });
  return adj;
}

export function runDFS(graph: Graph, sourceId: string, targetId?: string): AlgorithmStep[] {
  const adj = buildAdj(graph);
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const stack: string[] = [];
  const nodeStates: Record<string, NodeState> = {};
  const edgeStates: Record<string, EdgeState> = {};
  const parent: Record<string, string | null> = {};

  graph.nodes.forEach(n => (nodeStates[n.id] = 'default'));
  graph.edges.forEach(e => (edgeStates[e.id] = 'default'));
  if (targetId) nodeStates[targetId] = 'end';
  nodeStates[sourceId] = 'start';

  const snap = (
    type: AlgorithmStep['type'], desc: string, explanation: string, line: number,
    activeNode?: string, activeEdge?: string, stackState?: string[]
  ): AlgorithmStep => ({
    type, description: desc, explanation, pseudocodeLine: line,
    nodeStates: { ...nodeStates }, edgeStates: { ...edgeStates },
    activeNode, activeEdge,
    dataStructures: {
      stack: { label: 'Stack', type: 'list', data: stackState ? [...stackState] : [] },
      visited: { label: 'Visited', type: 'list', data: [...visited] },
    },
  });

  stack.push(sourceId);
  parent[sourceId] = null;
  steps.push(snap('visit', `Initialize: push ${sourceId}`, 'Start DFS by pushing source onto the stack.', 2, sourceId, undefined, [...stack]));

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    nodeStates[current] = current === sourceId ? 'start' : 'active';
    steps.push(snap('visit', `Pop & visit ${current}`, `Pop ${current} from the stack and mark it visited.`, 6, current, undefined, [...stack]));

    if (current === targetId) {
      const path: string[] = [];
      let cur: string | null = targetId;
      while (cur !== null) { path.unshift(cur); cur = parent[cur] ?? null; }
      path.forEach(n => (nodeStates[n] = n === sourceId ? 'start' : n === targetId ? 'end' : 'path'));
      steps.push(snap('path', `Path found: ${path.join(' → ')}`, `Found target ${targetId}.`, 10, undefined, undefined, [...stack]));
      return steps;
    }

    for (const { node: neighbor, edgeId } of adj[current]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        parent[neighbor] = current;
        edgeStates[edgeId] = 'visited';
        steps.push(snap('explore', `Push ${neighbor}`, `${neighbor} not visited, push onto stack.`, 9, neighbor, edgeId, [...stack]));
      }
    }
    if (nodeStates[current] !== 'start') nodeStates[current] = 'visited';
  }

  steps.push(snap('done', 'DFS Complete', 'All reachable nodes have been visited.', 10, undefined, undefined, []));
  return steps;
}
