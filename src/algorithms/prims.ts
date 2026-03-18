import { Graph, AlgorithmStep, AlgorithmInfo, NodeState, EdgeState } from '@/types/graph';

export const primsInfo: AlgorithmInfo = {
    id: 'prims',
    name: "Prim's MST",
    description: "Finds the minimum spanning tree for a connected weighted undirected graph by building the tree one vertex at a time.",
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V + E)',
    pseudocode: [
        "Prim(graph, source):",
        "  MST = empty set",
        "  visited = { source }",
        "  PQ = PriorityQueue(edges from source)",
        "  while PQ is not empty and |visited| < V:",
        "    let (u, v, w) = PQ.extractMin()",
        "    if v is in visited: continue",
        "    visited.add(v)",
        "    MST.add(edge)",
        "    for each neighbor x of v not in visited:",
        "      PQ.insert(edge(v, x))",
        "  return MST",
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

export function runPrims(graph: Graph, sourceId: string): AlgorithmStep[] {
    const adj = buildAdj(graph);
    const steps: AlgorithmStep[] = [];
    const visited = new Set<string>();
    const mstEdges: string[] = [];
    const mstNodes = new Set<string>();
    const nodeStates: Record<string, NodeState> = {};
    const edgeStates: Record<string, EdgeState> = {};
    let totalWeight = 0;

    // Min-heap for edges: [weight, sourceNode, targetNode, edgeId]
    const pq: [number, string, string, string][] = [];
    const pqPush = (w: number, u: string, v: string, eId: string) => {
        pq.push([w, u, v, eId]);
        pq.sort((a, b) => a[0] - b[0]);
    };
    const pqPop = () => pq.shift()!;

    graph.nodes.forEach(n => (nodeStates[n.id] = 'default'));
    graph.edges.forEach(e => (edgeStates[e.id] = 'default'));

    const pqDisplay = () => pq.map(([w, u, v]) => `${u}→${v}(${w})`);

    const snap = (
        type: AlgorithmStep['type'], desc: string, explanation: string, line: number,
        activeNode?: string, activeEdge?: string
    ): AlgorithmStep => ({
        type, description: desc, explanation, pseudocodeLine: line,
        nodeStates: { ...nodeStates }, edgeStates: { ...edgeStates },
        activeNode, activeEdge,
        dataStructures: {
            mst: { label: 'MST Edges', type: 'list', data: [...mstEdges] },
            totalWeight: { label: 'Total Weight', type: 'value', data: totalWeight },
            priorityQueue: { label: 'Priority Queue', type: 'list', data: pqDisplay() },
            visited: { label: 'Visited', type: 'list', data: [...visited] },
        },
    });

    // Start with the source node
    visited.add(sourceId);
    mstNodes.add(sourceId);
    nodeStates[sourceId] = 'visited';

    for (const { node: v, edgeId, weight } of adj[sourceId]) {
        pqPush(weight, sourceId, v, edgeId);
    }

    steps.push(snap('visit', `Start from source: ${sourceId}`, `Initialize MST with source vertex and add its edges to priority queue.`, 3, sourceId));

    while (pq.length > 0 && visited.size < graph.nodes.length) {
        const [w, u, v, edgeId] = pqPop();

        // Check if target node is already visited
        if (visited.has(v)) {
            steps.push(snap('backtrack', `Skip edge ${u}→${v}`, `Target ${v} is already in MST, adding this edge would create a cycle.`, 6, v, edgeId));
            continue;
        }

        // Add node and edge to MST
        visited.add(v);
        mstNodes.add(v);
        mstEdges.push(edgeId);
        totalWeight += w;

        nodeStates[v] = 'visited';
        edgeStates[edgeId] = 'visited';

        steps.push(snap('explore', `Add edge ${u}→${v} (w=${w})`, `Target ${v} is not in MST. Add edge to MST. Total cost: ${totalWeight}.`, 8, v, edgeId));

        // Add new edges to PQ
        for (const { node: neighbor, edgeId: neighborEdgeId, weight: neighborWeight } of adj[v]) {
            if (!visited.has(neighbor)) {
                pqPush(neighborWeight, v, neighbor, neighborEdgeId);
            }
        }
        steps.push(snap('update', `Add ${v}'s edges to PQ`, `Added edges from newly visited node ${v} to priority queue.`, 10, v));
    }

    // Highlight final MST path
    graph.nodes.forEach(n => {
        if (mstNodes.has(n.id)) nodeStates[n.id] = 'path';
    });
    mstEdges.forEach(id => (edgeStates[id] = 'path'));

    steps.push(snap('path', `MST complete: total weight = ${totalWeight}`, `Prim's algorithm finished. Found minimum spanning tree with weight ${totalWeight}.`, 11));

    return steps;
}
