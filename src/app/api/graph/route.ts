import { NextResponse } from "next/server";
import ollama from "ollama";
import { prisma } from '@/lib/prisma'


interface Node {
    id: string;
    type: "Document" | "Scan" | "Implementation" | "Assessment"
    label: string
    properties?: Record<string, any>
}

interface Edge {
    source: string
    target: string
    label: string
    properties?: Record<string, any>
}

export async function GET() {

    // await prisma.node.create({
    //     data: {
    //         id: 1,
    //         name: 'Node 1',
    //     }
    // });
    const dbNodes = await prisma.node.findMany();
    console.log("DB Nodes:", dbNodes);

    const batch = await ollama.embed({
        model: 'embeddinggemma',
        input: [
            'Frankfurt is a city in Germany.',
            'Swift is a programming language developed by Apple.',
            'Apples are a type of fruit that come in various colors such as red, green, and yellow.',
        ],
    })
    console.log(batch.embeddings.length) // number of vectors
    return NextResponse.json<{
        nodes: Node[],
        edges: Edge[]
    }>({
        nodes: [
            { id: 'n1', label: 'Data Privacy Statement', type: 'Document' },
            { id: 'n2', label: 'Execution Advisory for Data Privacy Statement', type: 'Scan'},
            { id: 'n3', label: 'GDPR Compliance Policy', type: 'Document' },
            { id: 'n4', label: 'Legacy Privacy Framework', type: 'Document' },
            { id: 'n5', label: 'User Consent Remark', type: 'Implementation' },
            { id: 'n6', label: 'Data Protection Impact Assessment', type: 'Assessment' },
        ],
        edges: [
            {  source: 'n1', target: 'n2', label: 'is referenced by' },
            {  source: 'n1', target: 'n3', label: 'is referenced by' },
            {  source: 'n1', target: 'n4', label: 'conflicts with' },
            {  source: 'n1', target: 'n5', label: 'implements' },
            {  source: 'n2', target: 'n6', label: 'requires' },
        ]
    });
}