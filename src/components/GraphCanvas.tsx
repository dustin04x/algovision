import React, { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { NodeState, EdgeState } from '@/types/graph';

const NODE_RADIUS = 22;

const nodeColorMap: Record<NodeState, string> = {
  default: 'hsl(215, 25%, 63%)',
  active: 'hsl(38, 92%, 50%)',
  visited: 'hsl(160, 84%, 39%)',
  path: 'hsl(198, 93%, 60%)',
  start: 'hsl(198, 93%, 60%)',
  end: 'hsl(0, 84%, 60%)',
};

const edgeColorMap: Record<EdgeState | 'path', string> = {
  default: 'hsl(217, 33%, 30%)',
  active: 'hsl(38, 92%, 50%)',
  visited: 'hsl(160, 84%, 39%)',
  path: 'hsl(198, 93%, 60%)',
};

export const GraphCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingNode = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);

  const graph = useAppStore(s => s.graph);
  const steps = useAppStore(s => s.steps);
  const currentStep = useAppStore(s => s.currentStep);
  const editMode = useAppStore(s => s.editMode);
  const edgeStart = useAppStore(s => s.edgeStart);
  const sourceNode = useAppStore(s => s.sourceNode);
  const targetNode = useAppStore(s => s.targetNode);
  const moveNode = useAppStore(s => s.moveNode);
  const addNode = useAppStore(s => s.addNode);
  const setSourceNode = useAppStore(s => s.setSourceNode);
  const setTargetNode = useAppStore(s => s.setTargetNode);
  const setEdgeStart = useAppStore(s => s.setEdgeStart);
  const addEdge = useAppStore(s => s.addEdge);

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Dot grid
    ctx.fillStyle = 'hsla(217, 33%, 30%, 0.3)';
    for (let x = 0; x < rect.width; x += 20) {
      for (let y = 0; y < rect.height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw edges
    graph.edges.forEach(edge => {
      const source = graph.nodes.find(n => n.id === edge.source);
      const target = graph.nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const state = currentStepData?.edgeStates[edge.id] || 'default';
      const color = edgeColorMap[state];
      const width = state === 'default' ? 1.5 : 3;

      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Arrow for directed
      if (graph.directed) {
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const tipX = target.x - Math.cos(angle) * NODE_RADIUS;
        const tipY = target.y - Math.sin(angle) * NODE_RADIUS;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - 10 * Math.cos(angle - 0.3), tipY - 10 * Math.sin(angle - 0.3));
        ctx.lineTo(tipX - 10 * Math.cos(angle + 0.3), tipY - 10 * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fill();
      }

      // Weight label
      const mx = (source.x + target.x) / 2;
      const my = (source.y + target.y) / 2;
      ctx.fillStyle = 'hsl(210, 40%, 98%)';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Background for weight
      const text = String(edge.weight);
      const tw = ctx.measureText(text).width + 8;
      ctx.fillStyle = 'hsl(222, 47%, 11%)';
      ctx.fillRect(mx - tw / 2, my - 9, tw, 18);
      ctx.fillStyle = 'hsl(215, 25%, 63%)';
      ctx.fillText(text, mx, my);
    });

    // Draw nodes
    graph.nodes.forEach(node => {
      let state: NodeState = 'default';
      if (currentStepData) {
        state = currentStepData.nodeStates[node.id] || 'default';
      } else {
        if (node.id === sourceNode) state = 'start';
        else if (node.id === targetNode) state = 'end';
      }
      const color = nodeColorMap[state];
      const isActive = currentStepData?.activeNode === node.id;

      // Glow for active
      if (isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(222, 47%, 11%)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = color;
      ctx.font = '600 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    });

    // Edge start indicator
    if (editMode === 'addEdge' && edgeStart) {
      const startNode = graph.nodes.find(n => n.id === edgeStart);
      if (startNode) {
        ctx.strokeStyle = 'hsl(198, 93%, 60%)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(startNode.x, startNode.y, NODE_RADIUS + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [graph, currentStepData, editMode, edgeStart, sourceNode, targetNode]);

  useEffect(() => {
    const render = () => {
      draw();
      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  const getNodeAt = (x: number, y: number): string | null => {
    for (const node of graph.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) return node.id;
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeId = getNodeAt(x, y);

    if (editMode === 'select') {
      if (nodeId) draggingNode.current = nodeId;
    } else if (editMode === 'addNode') {
      if (!nodeId) addNode(x, y);
    } else if (editMode === 'addEdge') {
      if (nodeId) {
        if (!edgeStart) {
          setEdgeStart(nodeId);
        } else if (edgeStart !== nodeId) {
          addEdge(edgeStart, nodeId, Math.floor(Math.random() * 9) + 1);
          setEdgeStart(null);
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode.current && editMode === 'select') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      moveNode(draggingNode.current, e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => { draggingNode.current = null; };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nodeId = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (nodeId) {
      // Right-click cycles: none -> source -> target -> none
      if (sourceNode === nodeId) {
        setSourceNode(null);
        setTargetNode(nodeId);
      } else if (targetNode === nodeId) {
        setTargetNode(null);
      } else {
        if (!sourceNode) setSourceNode(nodeId);
        else if (!targetNode) setTargetNode(nodeId);
        else setSourceNode(nodeId);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      />
      <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono bg-background/50 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-lg whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: nodeColorMap.start }} />Source
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: nodeColorMap.end }} />Target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: nodeColorMap.active }} />Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: nodeColorMap.visited }} />Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: nodeColorMap.path }} />Path
        </span>
      </div>
      <div className="absolute top-3 right-3 text-xs text-muted-foreground font-mono">
        Right-click node to set source/target
      </div>
    </div>
  );
};
