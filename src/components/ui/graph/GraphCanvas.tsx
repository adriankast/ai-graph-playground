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
