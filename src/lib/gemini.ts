export interface Step {
    title: string;
    bullets: string[];
    link?: string;
  }
  
  export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
  export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  
  export async function generateRoadmap(title: string, year: string): Promise<Step[]> {
    try {
      const prompt = `
  Generate a roadmap for "${title}" suitable for a ${year ? `year ${year}` : 'general'} student. Provide:
  - 2-3 specific steps to achieve proficiency in the topic.
  - Each step should have:
    - A clear title (e.g., "Learn HTML").
    - 2-3 concise bullet points describing key actions or concepts.
    - An optional relevant link to a reputable resource (if applicable).
  - Return the response as a JSON array of objects with properties: title (string), bullets (array of strings), link (string, optional).
  - Ensure steps are practical, beginner-friendly, and relevant to the topic.
  
  Example response:
  [
    {
      "title": "Learn HTML",
      "bullets": ["Understand tags", "Create a webpage"],
      "link": "https://developer.mozilla.org/en-US/docs/Web/HTML"
    },
    {
      "title": "Learn CSS",
      "bullets": ["Style elements", "Use Flexbox"]
    }
  ]`;
  
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate roadmap steps");
      }
  
      const responseData = await response.json();
      const rawText = responseData.candidates[0].content.parts[0].text;
  
      // Extract JSON from response (handle code fences if present)
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/\[[\s\S]*\]/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : rawText;
  
      let steps: Step[];
      try {
        steps = JSON.parse(jsonText);
      } catch (error){
        console.log(error)
        throw new Error("Invalid JSON response from Gemini API");
      }
  
      // Validate steps format
      steps = steps.filter(step => step.title && Array.isArray(step.bullets) && step.bullets.length > 0);
      if (steps.length === 0) {
        throw new Error("No valid steps returned");
      }
  
      return steps;
    } catch (error) {
      console.error("Error generating roadmap:", error);
      return [
        {
          title: `Step 1 for ${title}`,
          bullets: ['Learn basics', 'Practice'],
          link: '',
        },
      ];
    }
  }

  export interface Step {
    title: string;
    bullets: string[];
    link?: string;
  }
  
  export interface RoadmapHelperResponse {
    answer: string;
  }
  
  
  export async function roadmapHelper(
    title: string,
    year: string,
    steps: Step[],
    query: string
  ): Promise<RoadmapHelperResponse> {
    try {
      const roadmapContext = `
  Roadmap Title: ${title}
  Year: ${year || 'General'}
  Steps:
  ${steps
    .map(
      (step, index) =>
        `${index + 1}. ${step.title}\n  - Bullets: ${step.bullets.join(', ')}\n  - Link: ${
          step.link || 'None'
        }`
    )
    .join('\n')}`;
  
      const prompt = `
  You are a helpful assistant for students following a specific roadmap. Provide concise, neutral, and beginner-friendly answers to the user's query based on the roadmap context below. Focus on practical guidance related to the roadmap's steps. Return the response as a JSON object with an "answer" property.
  
  Roadmap Context:
  ${roadmapContext}
  
  User Query: ${query}
  
  Example Response:
  {
    "answer": "To start with HTML, focus on learning basic tags like <div>, <p>, and <a>. Practice by creating a simple webpage using resources from the provided link."
  }
  `;
  
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5, // Lower temperature for consistent, neutral responses
            maxOutputTokens: 512,
          },
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }
  
      const responseData = await response.json();
      const rawText = responseData.candidates[0].content.parts[0].text;
  
      // Extract JSON from response (handle code fences if present)
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : rawText;
  
      let result: RoadmapHelperResponse;
      try {
        result = JSON.parse(jsonText);
      } catch {
        console.error('Invalid JSON from Gemini:', rawText);
        throw new Error("Invalid JSON response from Gemini API");
      }
  
      if (!result.answer) {
        throw new Error("No valid answer returned");
      }
  
      return result;
    } catch (error) {
      console.error("Error in roadmap helper:", error);
      return {
        answer: "Sorry, I couldn't process your request. Try asking something specific about the roadmap steps, like 'How do I start with HTML?'",
      };
    }
  }