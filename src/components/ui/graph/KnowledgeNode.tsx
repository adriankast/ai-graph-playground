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
