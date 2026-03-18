import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const bfsInfo: AlgorithmInfo = {
  id: 'bfs',
  name: 'Breadth-First Search',
  description: 'Explores all neighbors at the present depth before moving to nodes at the next depth level.',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
  pseudocode: [
    'BFS(graph, source):',
    '  create queue Q',
    '  mark source as visited',
    '  enqueue source into Q',
    '  while Q is not empty:',
    '    node = Q.dequeue()',
    '    for each neighbor of node:',
    '      if neighbor not visited:',
    '        mark neighbor as visited',
    '        enqueue neighbor into Q',
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

export function runBFS(graph: Graph, sourceId: string, targetId?: string): AlgorithmStep[] {
  const adj = buildAdj(graph);
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];
  const nodeStates: Record<string, NodeState> = {};
  const edgeStates: Record<string, EdgeState> = {};
  const parent: Record<string, string | null> = {};

  graph.nodes.forEach(n => (nodeStates[n.id] = 'default'));
  graph.edges.forEach(e => (edgeStates[e.id] = 'default'));

  if (targetId) nodeStates[targetId] = 'end';
  nodeStates[sourceId] = 'start';

  const snap = (
    type: AlgorithmStep['type'],
    desc: string,
    explanation: string,
    line: number,
    activeNode?: string,
    activeEdge?: string,
    queueState?: string[]
  ): AlgorithmStep => ({
    type,
    description: desc,
    explanation,
    pseudocodeLine: line,
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    activeNode,
    activeEdge,
    dataStructures: {
      queue: { label: 'Queue', type: 'list', data: queueState ? [...queueState] : [] },
      visited: { label: 'Visited', type: 'list', data: [...visited] },
    },
  });

  visited.add(sourceId);
  queue.push(sourceId);
  parent[sourceId] = null;
  steps.push(snap('visit', `Initialize: enqueue ${sourceId}`, 'We start BFS by marking the source as visited and adding it to the queue.', 3, sourceId, undefined, [...queue]));

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodeStates[current] = current === sourceId ? 'start' : 'active';
    steps.push(snap('visit', `Dequeue ${current}`, `We dequeue ${current} and will explore its neighbors.`, 5, current, undefined, [...queue]));

    for (const { node: neighbor, edgeId } of adj[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = current;
        queue.push(neighbor);
        edgeStates[edgeId] = 'visited';
        nodeStates[neighbor] = neighbor === targetId ? 'end' : 'visited';
        steps.push(snap('explore', `Visit ${neighbor} via ${current}`, `${neighbor} hasn't been visited yet. Mark it visited and enqueue it.`, 8, neighbor, edgeId, [...queue]));

        if (neighbor === targetId) {
          // reconstruct path
          const path: string[] = [];
          let cur: string | null = targetId;
          while (cur !== null) {
            path.unshift(cur);
            cur = parent[cur] ?? null;
          }
          path.forEach(n => (nodeStates[n] = n === sourceId ? 'start' : n === targetId ? 'end' : 'path'));
          steps.push(snap('path', `Path found: ${path.join(' → ')}`, `Shortest path from ${sourceId} to ${targetId} has ${path.length - 1} edges.`, 10, undefined, undefined, [...queue]));
          return steps;
        }
      }
    }
    if (nodeStates[current] !== 'start') nodeStates[current] = 'visited';
  }

  steps.push(snap('done', 'BFS Complete', 'All reachable nodes have been visited.', 10, undefined, undefined, []));
  return steps;
}
