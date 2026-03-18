import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const kruskalInfo: AlgorithmInfo = {
  id: 'kruskal',
  name: "Kruskal's MST",
  description: 'Finds the minimum spanning tree by greedily adding the cheapest edge that doesn\'t form a cycle.',
  timeComplexity: 'O(E log E)',
  spaceComplexity: 'O(V)',
  pseudocode: [
    "Kruskal(graph):",
    "  sort edges by weight ascending",
    "  MST = empty set",
    "  for each vertex: make_set(v)",
    "  for each edge (u, v, w) in sorted:",
    "    if find(u) ≠ find(v):",
    "      MST.add(edge)",
    "      union(u, v)",
    "      total_weight += w",
    "  return MST",
  ],
};

class UnionFind {
  parent: Record<string, string> = {};
  rank: Record<string, number> = {};

  makeSet(x: string) { this.parent[x] = x; this.rank[x] = 0; }

  find(x: string): string {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x: string, y: string): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    return true;
  }
}

export function runKruskal(graph: Graph, sourceId: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodeStates: Record<string, NodeState> = {};
  const edgeStates: Record<string, EdgeState> = {};
  const uf = new UnionFind();
  const mstEdges: string[] = [];
  let totalWeight = 0;

  graph.nodes.forEach(n => { nodeStates[n.id] = 'default'; uf.makeSet(n.id); });
  graph.edges.forEach(e => (edgeStates[e.id] = 'default'));

  const sorted = [...graph.edges].sort((a, b) => a.weight - b.weight);

  const snap = (type: AlgorithmStep['type'], desc: string, explanation: string, line: number, activeNode?: string, activeEdge?: string): AlgorithmStep => ({
    type, description: desc, explanation, pseudocodeLine: line,
    nodeStates: { ...nodeStates }, edgeStates: { ...edgeStates },
    activeNode, activeEdge,
    dataStructures: {
      mst: { label: 'MST Edges', type: 'list', data: [...mstEdges] },
      totalWeight: { label: 'Total Weight', type: 'value', data: totalWeight },
      sortedEdges: { label: 'Remaining Edges', type: 'list', data: sorted.filter(e => !mstEdges.includes(e.id) && edgeStates[e.id] !== 'default').length > 0 ? [] : sorted.filter(e => edgeStates[e.id] === 'default').map(e => `${e.source}-${e.target}(${e.weight})`) },
    },
  });

  steps.push(snap('visit', `Sorted ${sorted.length} edges by weight`, 'First step: sort all edges by weight in ascending order.', 1));

  for (const edge of sorted) {
    edgeStates[edge.id] = 'active';
    nodeStates[edge.source] = 'active';
    nodeStates[edge.target] = 'active';

    if (uf.union(edge.source, edge.target)) {
      mstEdges.push(edge.id);
      totalWeight += edge.weight;
      edgeStates[edge.id] = 'visited';
      nodeStates[edge.source] = 'visited';
      nodeStates[edge.target] = 'visited';
      steps.push(snap('explore', `Add edge ${edge.source}→${edge.target} (w=${edge.weight})`, `${edge.source} and ${edge.target} are in different components. Add edge to MST. Total: ${totalWeight}.`, 6, undefined, edge.id));
    } else {
      edgeStates[edge.id] = 'default';
      steps.push(snap('backtrack', `Skip edge ${edge.source}→${edge.target} (cycle)`, `${edge.source} and ${edge.target} are already connected. Adding this edge would create a cycle.`, 5, undefined, edge.id));
      nodeStates[edge.source] = mstEdges.some(id => { const e = graph.edges.find(x => x.id === id); return e && (e.source === edge.source || e.target === edge.source); }) ? 'visited' : 'default';
      nodeStates[edge.target] = mstEdges.some(id => { const e = graph.edges.find(x => x.id === id); return e && (e.source === edge.target || e.target === edge.target); }) ? 'visited' : 'default';
    }

    if (mstEdges.length === graph.nodes.length - 1) break;
  }

  // Highlight final MST
  graph.nodes.forEach(n => (nodeStates[n.id] = 'path'));
  mstEdges.forEach(id => (edgeStates[id] = 'path'));
  steps.push(snap('path', `MST complete: total weight = ${totalWeight}`, `Minimum spanning tree found with ${mstEdges.length} edges and total weight ${totalWeight}.`, 9));

  return steps;
}
