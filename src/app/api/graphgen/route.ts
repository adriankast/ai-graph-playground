import { NextResponse } from 'next/server';
import ollama from 'ollama'
import documents from './documents';

const prompt = `Extract nodes (documents) and references between them from the documents below.
          Provide the output as a JSON object with two arrays: "nodes" and "edges".
          Nodes should represent documents and scans with their properties.
          Edges should represent relationships between these nodes.
          The format must be as follows:

          interface Node {
              id: string;
              type: "Document" | "Scan" | "Implementation" | "Assessment"
              label: string
              properties?: Record<string, any>
          }

          interface Edge {
              source: string
              target: string
              label: "is referenced by" | "conflicts with" | "implements" | "requires"
              properties?: Record<string, any>
          }

          Documents:
          ${documents.map((doc, index) => `Document ${index + 1}:
            """
            ${JSON.stringify(doc, null, 2)}
            """`).join('\n\n')}
            
          Output the JSON object only, without any additional text.
          `;



export async function GET() {
    const batch = await ollama.generate({
    model: 'gemma3',
    prompt
    })
    console.log(prompt);
    console.log(batch.response);
    return NextResponse.json(JSON.parse(batch.response.split('```json')[1].split('```')[0].trim()));
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}



