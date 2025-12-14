'use client';

import { ReactFlow } from '@xyflow/react';
import { KnowledgeNode } from './KnowledgeNode';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  knowledge: KnowledgeNode,
};

const nodes = [
    { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Data Privacy Statement', type: 'Document' }, type: 'knowledge' },
    { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Execution Advisory for Data Privacy Statement', type: 'Scan' }, type: 'knowledge' },
    { id: 'n3', position: { x: 200, y: 100 }, data: { label: 'GDPR Compliance Policy', type: 'Document' }, type: 'knowledge' },
    { id: 'n4', position: { x: -200, y: 100 }, data: { label: 'Legacy Privacy Framework', type: 'Document' }, type: 'knowledge' },
    { id: 'n5', position: { x: 100, y: 200 }, data: { label: 'User Consent Module', type: 'Implementation' }, type: 'knowledge' },
];
const edges = [
    { id: 'n1-n2', source: 'n1', target: 'n2', label: 'is referenced by' },
    { id: 'n1-n3', source: 'n1', target: 'n3', label: 'is referenced by' },
    { id: 'n1-n4', source: 'n1', target: 'n4', label: 'conflicts with' },
    { id: 'n1-n5', source: 'n1', target: 'n5', label: 'implements' },
];

export function GraphCanvas() {
  return (
    <div className="h-[800px] w-[1200px] border border-muted/50 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        panOnScroll
      />
    </div>
  );
}
