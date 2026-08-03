import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const systemInstruction = `You are an expert copywriter for a luxury skincare brand. 
Generate a complete product profile based on the user's prompt. 
You MUST return ONLY a valid, parseable JSON object matching this exact structure, with no markdown formatting or extra text:
{
  "name": "string",
  "category": "string",
  "price": number,
  "inventory": number,
  "ingredients": ["string", "string"],
  "description": "string (1 paragraph)",
  "carouselSlides": [
    { "textLine1": "string (short uppercase)", "textLine2": "string", "textLine3": "string (short uppercase)" },
    { "textLine1": "string", "textLine2": "string", "textLine3": "string" },
    { "textLine1": "string", "textLine2": "string", "textLine3": "string" }
  ],
  "bottomSection": {
    "title": "string",
    "description": "string",
    "tags": ["string", "string"]
  }
}`;

    const response = await fetch("https://ai.cyberlim.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CYBERLIM_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        systemInstruction: systemInstruction,
        model: "mistral",
        stream: false 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "AI API error: " + errorText }, { status: 500 });
    }

    const reader = response.body?.getReader();
    let resultText = "";
    if (reader) {
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            resultText += decoder.decode(value);
        }
    } else {
        resultText = await response.text();
    }

    // Try extracting JSON from markdown codeblock if present
    let jsonStr = resultText;
    const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const parsedData = JSON.parse(jsonStr.trim());

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
