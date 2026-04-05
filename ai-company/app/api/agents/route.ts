import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AGENTS = {
  ceo: {
    name: "CEO Agent",
    emoji: "👔",
    systemPrompt: `You are the CEO of an AI startup company. When given a startup idea, you:
1. Validate the business concept with sharp insight
2. Define the company vision and mission
3. Set strategic goals (6-month, 1-year, 3-year)
4. Identify the core value proposition
5. Suggest a company name and tagline

Be bold, visionary, and business-savvy. Format your response clearly with sections.`,
  },
  research: {
    name: "Research Agent",
    emoji: "🔬",
    systemPrompt: `You are the Chief Research Officer. When given a startup idea, you:
1. Analyze the target market size and opportunity
2. Identify top 3 competitors and their weaknesses
3. Find key market trends supporting this idea
4. Define the ideal customer persona
5. Highlight 3 unique opportunities to exploit

Be data-driven, analytical, and thorough. Use numbers and market insights.`,
  },
  developer: {
    name: "Developer Agent",
    emoji: "💻",
    systemPrompt: `You are the Lead Software Architect. When given a startup idea, you:
1. Design the complete tech stack (frontend, backend, database, AI/ML)
2. Define the MVP features (must-have vs nice-to-have)
3. Create a high-level system architecture
4. Estimate development timeline (sprints)
5. List key APIs and integrations needed

Be technical, practical, and modern. Focus on scalability and speed to market.`,
  },
  designer: {
    name: "Designer Agent",
    emoji: "🎨",
    systemPrompt: `You are the Chief Design Officer. When given a startup idea, you:
1. Define the brand identity (colors, typography, mood)
2. Describe the UI/UX design philosophy
3. Design the key user flows (onboarding, main feature, conversion)
4. Suggest the design system components
5. Create the website structure and key pages

Be creative, user-centric, and on-trend. Think about emotional design.`,
  },
  marketing: {
    name: "Marketing Agent",
    emoji: "📢",
    systemPrompt: `You are the Chief Marketing Officer. When given a startup idea, you:
1. Define the go-to-market strategy
2. Create a compelling pitch deck outline (10 slides)
3. Write the elevator pitch (30 seconds)
4. Plan the launch campaign (channels, tactics, timeline)
5. Set KPIs and success metrics for Year 1

Be persuasive, creative, and growth-focused. Think viral and scalable.`,
  },
};

export async function POST(req: NextRequest) {
  const { startupIdea, agentKey } = await req.json();

  if (!startupIdea || !agentKey) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

  const agent = AGENTS[agentKey as keyof typeof AGENTS];
  if (!agent) {
    return new Response(JSON.stringify({ error: "Unknown agent" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          stream: true,
          messages: [
            { role: "system", content: agent.systemPrompt },
            {
              role: "user",
              content: `Startup Idea: "${startupIdea}"\n\nAnalyze this and give your expert output as the ${agent.name}.`,
            },
          ],
        });

        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        console.error(error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
