import { Node, Edge } from '@xyflow/react';

export function computeDistances(
  focusId: string,
  edges: Edge[]
) {
  const distances: Record<string, number> = { [focusId]: 0 };
  const queue = [focusId];

  while (queue.length) {
    const current = queue.shift()!;
    const dist = distances[current];

    edges.forEach((e) => {
      const neighbor =
        e.source === current
          ? e.target
          : e.target === current
          ? e.source
          : null;

      if (neighbor && distances[neighbor] == null) {
        distances[neighbor] = dist + 1;
        queue.push(neighbor);
      }
    });
  }

  return distances;
}

export function groupByDistance(
  nodes: Node[],
  distances: Record<string, number>
) {
  const rings: Record<number, Node[]> = {};

  nodes.forEach((n) => {
    const d = distances[n.id];
    if (d == null) return;

    rings[d] ||= [];
    rings[d].push(n);
  });

  return rings;
}

const BASE_RADIUS = 400;
const JITTER = 50;

function opacityForDistance(d: number) {
  if (d === 0) return 1;
  if (d === 1) return 0.9;
  if (d === 2) return 0.5;
  return 0.25;
}

function edgeOpacity(d1: number, d2: number) {
  const max = Math.max(d1, d2);
  return max <= 1 ? 0.8 : max === 2 ? 0.4 : 0.15;
}

export function radialLayout(
  focusId: string,
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[], edges: Edge[] } {
  const distances = computeDistances(focusId, edges);

  const visibleNodes: Node[] = [];
  const hiddenNodes: Node[] = [];

  nodes.forEach(node => {
      const d = distances[node.id];
      if (d !== undefined && d <= 3) {
          visibleNodes.push(node);
      } else {
          hiddenNodes.push(node);
      }
  });

  const neighbors = visibleNodes.filter(n => n.id !== focusId);

  const layoutedVisible = visibleNodes.map((node) => {
    const d = distances[node.id];
    
    const style = {
        ...node.style,
        opacity: opacityForDistance(d),
    };

    if (node.id === focusId) {
      return {
        ...node,
        position: { x: 0, y: 0 },
        style,
        hidden: false,
      };
    }

    const index = neighbors.findIndex(n => n.id === node.id);
    const safeIndex = index === -1 ? 0 : index;

    const angle = (2 * Math.PI * safeIndex) / neighbors.length;
    const jitter = (Math.random() - 0.5) * JITTER;
    const radius = BASE_RADIUS + jitter;

    return {
      ...node,
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      },
      style,
      hidden: false,
    };
  });

  const layoutedHidden = hiddenNodes.map(node => ({
      ...node,
      hidden: true,
  }));

  const layoutedNodes = [...layoutedVisible, ...layoutedHidden];

  const layoutedEdges = edges.map(edge => {
      const d1 = distances[edge.source];
      const d2 = distances[edge.target];
      
      if (d1 === undefined || d2 === undefined || d1 > 3 || d2 > 3) {
          return {
              ...edge,
              hidden: true,
          };
      }

      const opacity = edgeOpacity(d1, d2);
      return {
          ...edge,
          style: {
              ...edge.style,
              opacity,
          },
          hidden: false,
      };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}
