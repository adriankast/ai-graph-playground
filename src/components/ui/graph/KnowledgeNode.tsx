import { Handle, Position } from '@xyflow/react'
import { Card } from '@/components/ui/card'

export function KnowledgeNode({ data }: { data: { label: string; type: string } }){
  return (
    <Card className="min-w-[160px] p-3 shadow-sm">
      <Handle type="target" position={Position.Left} />
      <p className="text-sm font-semibold">{data.label}</p>
      <p className="text-xs text-muted-foreground">
        {data.type}
      </p>
      <Handle type="source" position={Position.Right} />
    </Card>
  )
}
