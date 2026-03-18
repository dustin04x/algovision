import { Graph } from '@/types/graph';

export const sampleGraphs: Record<string, { name: string; graph: Graph }> = {
  simple: {
    name: 'Simple Graph',
    graph: {
      directed: false,
      nodes: [
        { id: 'A', x: 150, y: 200, label: 'A' },
        { id: 'B', x: 350, y: 100, label: 'B' },
        { id: 'C', x: 350, y: 300, label: 'C' },
        { id: 'D', x: 550, y: 200, label: 'D' },
        { id: 'E', x: 550, y: 400, label: 'E' },
        { id: 'F', x: 750, y: 300, label: 'F' },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', weight: 4 },
        { id: 'e2', source: 'A', target: 'C', weight: 2 },
        { id: 'e3', source: 'B', target: 'D', weight: 3 },
        { id: 'e4', source: 'C', target: 'D', weight: 1 },
        { id: 'e5', source: 'C', target: 'E', weight: 5 },
        { id: 'e6', source: 'D', target: 'F', weight: 2 },
        { id: 'e7', source: 'E', target: 'F', weight: 3 },
      ],
    },
  },
  complex: {
    name: 'Complex Network',
    graph: {
      directed: false,
      nodes: [
        { id: 'S', x: 100, y: 250, label: 'S' },
        { id: '1', x: 280, y: 120, label: '1' },
        { id: '2', x: 280, y: 380, label: '2' },
        { id: '3', x: 460, y: 120, label: '3' },
        { id: '4', x: 460, y: 250, label: '4' },
        { id: '5', x: 460, y: 380, label: '5' },
        { id: '6', x: 640, y: 180, label: '6' },
        { id: '7', x: 640, y: 320, label: '7' },
        { id: 'T', x: 800, y: 250, label: 'T' },
      ],
      edges: [
        { id: 'e1', source: 'S', target: '1', weight: 7 },
        { id: 'e2', source: 'S', target: '2', weight: 2 },
        { id: 'e3', source: '1', target: '3', weight: 3 },
        { id: 'e4', source: '1', target: '4', weight: 4 },
        { id: 'e5', source: '2', target: '4', weight: 1 },
        { id: 'e6', source: '2', target: '5', weight: 5 },
        { id: 'e7', source: '3', target: '6', weight: 1 },
        { id: 'e8', source: '4', target: '6', weight: 3 },
        { id: 'e9', source: '4', target: '7', weight: 2 },
        { id: 'e10', source: '5', target: '7', weight: 3 },
        { id: 'e11', source: '6', target: 'T', weight: 2 },
        { id: 'e12', source: '7', target: 'T', weight: 4 },
      ],
    },
  },
  directed: {
    name: 'Directed Graph',
    graph: {
      directed: true,
      nodes: [
        { id: 'A', x: 150, y: 150, label: 'A' },
        { id: 'B', x: 400, y: 100, label: 'B' },
        { id: 'C', x: 300, y: 300, label: 'C' },
        { id: 'D', x: 550, y: 250, label: 'D' },
        { id: 'E', x: 700, y: 150, label: 'E' },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', weight: 3 },
        { id: 'e2', source: 'A', target: 'C', weight: 6 },
        { id: 'e3', source: 'B', target: 'D', weight: 2 },
        { id: 'e4', source: 'C', target: 'D', weight: 1 },
        { id: 'e5', source: 'D', target: 'E', weight: 4 },
        { id: 'e6', source: 'B', target: 'E', weight: 8 },
      ],
    },
  },
};
