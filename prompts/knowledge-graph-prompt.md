# Knowledge Graph Implementation Prompt Template

I need to implement an interactive Knowledge Graph visualization in my Next.js project using React Flow. Please follow these steps:

1.  **Install Dependencies**:
    Ensure the following packages are installed:
    `npm install @xyflow/react lucide-react clsx tailwind-merge`

2.  **Create Utility**:
    If not already present, create `src/lib/utils.ts` for the `cn` helper:
    ```typescript
    import { clsx, type ClassValue } from "clsx"
    import { twMerge } from "tailwind-merge"

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }
    ```

3.  **Create Card Component**:
    If not already present, create `src/components/ui/card.tsx`. A simple version is sufficient:
    ```tsx
    import * as React from "react"
    import { cn } from "@/lib/utils"

    const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
        {...props}
      />
    ))
    Card.displayName = "Card"

    export { Card }
    ```

4.  **Create Graph Layout Logic**:
    Create `src/lib/graph-layout.ts` with the following radial layout algorithm:
    ```typescript
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
    ```

5.  **Create Custom Node Component**:
    Create `src/components/ui/graph/KnowledgeNode.tsx`:
    ```tsx
    import { Handle, Position, NodeProps } from '@xyflow/react'
    import { Card } from '@/components/ui/card'
    import { FileText } from 'lucide-react'
    import { cn } from '@/lib/utils'

    export function KnowledgeNode({ data, selected }: NodeProps) {
      return (
        <Card 
          className={cn(
            "min-w-[200px] max-w-[250px] p-4 shadow-sm transition-all duration-300 bg-card",
            "border-l-4", // Document look
            selected 
              ? "border-l-primary border-primary ring-2 ring-primary/20 shadow-lg scale-105 z-50" 
              : "border-l-muted-foreground/40 hover:border-l-primary/50 hover:shadow-md"
          )}
        >
          <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3" />
          
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-md shrink-0 transition-colors",
              selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <FileText className="w-5 h-5" />
            </div>
            
            <div className="flex flex-col gap-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold leading-tight truncate", 
                selected && "text-primary"
              )} 
                title={`${data.label ?? "unnamed"}`}>
                {`${data.label ?? "unnamed"}`}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {`${data.type}`}
              </p>
            </div>
          </div>

          <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-3 !h-3" />
        </Card>
      )
    }
    ```

6.  **Create Main Graph Component**:
    Create `src/components/ui/graph/GraphCanvas.tsx`:
    ```tsx
    'use client';

    import { ReactFlow, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider, Node, Edge, NodeTypes, NodeProps } from '@xyflow/react';
    import { useEffect, useCallback } from 'react';
    import { KnowledgeNode } from './KnowledgeNode';
    import { radialLayout } from '@/lib/graph-layout';
    import '@xyflow/react/dist/style.css';

    const nodeTypes: NodeTypes = {
      knowledge: KnowledgeNode as React.ComponentType<NodeProps>,
    };

    const initialNodes: Node[] = [
        { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Data Privacy Statement', type: 'Document' }, type: 'knowledge' },
        { id: 'n2', position: { x: 0, y: 0 }, data: { label: 'Execution Advisory for Data Privacy Statement', type: 'Scan' }, type: 'knowledge' },
        { id: 'n3', position: { x: 0, y: 0 }, data: { label: 'GDPR Compliance Policy', type: 'Document' }, type: 'knowledge' },
        { id: 'n4', position: { x: 0, y: 0 }, data: { label: 'Legacy Privacy Framework', type: 'Document' }, type: 'knowledge' },
        { id: 'n5', position: { x: 0, y: 0 }, data: { label: 'User Consent Remark', type: 'Implementation' }, type: 'knowledge' },
        { id: 'n6', position: { x: 0, y: 0 }, data: { label: 'Data Protection Impact Assessment', type: 'Assessment' }, type: 'knowledge' },
    ];
    const initialEdges: Edge[] = [
        { id: 'n1-n2', source: 'n1', target: 'n2', label: 'is referenced by' },
        { id: 'n1-n3', source: 'n1', target: 'n3', label: 'is referenced by' },
        { id: 'n1-n4', source: 'n1', target: 'n4', label: 'conflicts with' },
        { id: 'n1-n5', source: 'n1', target: 'n5', label: 'implements' },
        { id: 'n2-n6', source: 'n2', target: 'n6', label: 'requires' },
    ];
    const { nodes: layoutedInitialNodes, edges: layoutedInitialEdges } = radialLayout('n1', initialNodes, initialEdges);

    function GraphCanvasContent() {
      const [nodes, setNodes, onNodesChange] = useNodesState(layoutedInitialNodes);
      const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedInitialEdges);
      const { fitView } = useReactFlow();

      const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = radialLayout(node.id, nodes, edges);
        
        const animatedNodes = layoutedNodes.map(n => ({
          ...n,
          selected: n.id === node.id,
          style: { ...n.style, transition: 'all 0.5s' }
        }));
        
        setNodes(() => animatedNodes);
        setEdges(() => layoutedEdges);
        
        setTimeout(() => fitView({ padding: 0.3, duration: 800 }), 50);
      }, [nodes, edges, setNodes, setEdges, fitView]);

      // Initial layout
      useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = radialLayout('n1', nodes, edges);
        const initialNodesWithSelection = layoutedNodes.map(n => ({
            ...n,
            selected: n.id === 'n1',
        }));
        setNodes(initialNodesWithSelection);
        setEdges(layoutedEdges);
        window.requestAnimationFrame(() => fitView({ padding: 0.3 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); 

      return (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          onNodeClick={onNodeClick}
          nodesDraggable={false}
          edgesReconnectable={false}
          nodesConnectable={false}
        />
      );
    }

    export function GraphCanvas() {
      return (
        <div className="h-[800px] w-[1200px] border border-muted/50 rounded-lg">
          <ReactFlowProvider>
            <GraphCanvasContent />
          </ReactFlowProvider>
        </div>
      );
    }
    ```

7.  **Usage**:
    You can now use `<GraphCanvas />` in any page.
