/**
 * AI MUN Coach Service
 * - Dynamic simulated MUN question generation based on portfolio, committee, agenda, and uploaded documents
 * - 6-Axis Speech/Rebuttal Evaluation:
 *   1. Content (0-10)
 *   2. Accuracy (0-10)
 *   3. Relevance (0-10)
 *   4. Diplomacy (0-10)
 *   5. Structure (0-10)
 *   6. Rebuttal (0-10)
 *   Overall Score (0-10)
 * - Actionable framing recommendations & feedback
 */

export interface CoachQuestionContext {
  conferenceName: string;
  committee: string;
  portfolio: string;
  agenda: string;
  researchSnippets?: string[];
}

export interface CoachEvaluationInput {
  question: string;
  userTranscript: string;
  portfolio: string;
  committee: string;
  agenda: string;
}

export interface CoachEvaluationOutput {
  contentScore: number;
  accuracyScore: number;
  relevanceScore: number;
  diplomacyScore: number;
  structureScore: number;
  rebuttalScore: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  actionableSuggestion: string;
}

export async function generateCoachQuestions(ctx: CoachQuestionContext): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `You are a tough, veteran MUN Committee Chair and crisis director for ${ctx.committee}.
Agenda: "${ctx.agenda}"
Delegate Portfolio: "${ctx.portfolio}"
Generate 5 hard-hitting, sharp, realistic MUN questions or hostile Point of Information (POI) challenges aimed directly at this delegate's country policy, historical hypocrisies, and practical implementation bottlenecks.
Return ONLY a JSON array of strings: ["question 1", "question 2", ...]`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices[0].message.content.trim();
        const parsed = JSON.parse(content.replace(/```json|```/g, ""));
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("OpenAI question generation failed, falling back to dynamic template pool:", e);
    }
  }

  // Dynamic portfolio-aware fallback question pool
  return [
    `The delegation of ${ctx.portfolio} claims to uphold international consensus on ${ctx.agenda}. However, how does your delegation reconcile this public stance with criticisms from sovereign nations regarding selective enforcement and historical inaction?`,
    `Your opponents argue that your proposed international monitoring mechanisms violate the sacred principle of state sovereignty under Article 2(7) of the UN Charter. What is your delegation's immediate diplomatic rebuttal?`,
    `If the committee adopts your resolution clauses regarding ${ctx.agenda}, which specific international financial institution or dedicated multilateral fund will guarantee implementation without overburdening developing member states?`,
    `A hostile bloc is preparing an amendment to strip verification mandates from your working paper. How will your delegation maintain your coalition while protecting the integrity of your enforcement mechanisms?`,
    `Given your country's domestic legal framework, how would ${ctx.portfolio} respond to accusations of double standards regarding the treatment of displaced communities and vulnerable populations?`,
  ];
}

export async function evaluatePracticeResponse(
  input: CoachEvaluationInput
): Promise<CoachEvaluationOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `You are an elite MUN Debate Coach evaluating a delegate's live spoken answer to a committee challenge.
Portfolio: ${input.portfolio}
Committee: ${input.committee}
Agenda: ${input.agenda}

Question Asked:
"${input.question}"

Delegate's Verbal Response:
"${input.userTranscript}"

Evaluate the delegate strictly on a 0-10 scale across all 6 axes:
- Content (depth of substance and policy clarity)
- Accuracy (factual, legal, and country alignment)
- Relevance (directly answering the question rather than dodging)
- Diplomacy (tact, parliamentary decorum, professional tone)
- Structure (logical flow, roadmap, transition)
- Rebuttal (effective counter to the opponent's premise)

Return ONLY a JSON object:
{
  "contentScore": number (0-10),
  "accuracyScore": number (0-10),
  "relevanceScore": number (0-10),
  "diplomacyScore": number (0-10),
  "structureScore": number (0-10),
  "rebuttalScore": number (0-10),
  "overallScore": number (0-10),
  "strengths": string,
  "weaknesses": string,
  "actionableSuggestion": string (e.g. Try using Position -> Evidence -> Policy -> Conclusion)
}`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const parsed = JSON.parse(json.choices[0].message.content);
        return {
          contentScore: Math.round(Number(parsed.contentScore) * 10) / 10 || 7.5,
          accuracyScore: Math.round(Number(parsed.accuracyScore) * 10) / 10 || 7.8,
          relevanceScore: Math.round(Number(parsed.relevanceScore) * 10) / 10 || 8.0,
          diplomacyScore: Math.round(Number(parsed.diplomacyScore) * 10) / 10 || 7.2,
          structureScore: Math.round(Number(parsed.structureScore) * 10) / 10 || 7.0,
          rebuttalScore: Math.round(Number(parsed.rebuttalScore) * 10) / 10 || 6.8,
          overallScore: Math.round(Number(parsed.overallScore) * 10) / 10 || 7.4,
          strengths: parsed.strengths || "Addressed the opposition's argument directly with diplomatic confidence.",
          weaknesses: parsed.weaknesses || "Took too long to state the definitive national position.",
          actionableSuggestion: parsed.actionableSuggestion || "Follow the formula: Position Statement → Verified Precedent → Operative Policy → Diplomatic Clincher.",
        };
      }
    } catch (e) {
      console.warn("OpenAI coach evaluation failed, using local evaluator:", e);
    }
  }

  // Resilient heuristic evaluator
  return evaluateLocally(input);
}

function evaluateLocally(input: CoachEvaluationInput): CoachEvaluationOutput {
  const text = input.userTranscript.trim();
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Length sanity checks
  const hasSubstance = wordCount >= 30;
  const isTooShort = wordCount < 15;

  // Keyword markers
  const diplomaticMarkers = ["delegation", "honorable", "chair", "reaffirms", "respectfully", "sovereignty", "dialogue", "multilateral", "consensus"];
  const evidenceMarkers = ["article", "resolution", "treaty", "convention", "report", "percent", "data", "established", "icj", "charter"];
  const structuralMarkers = ["firstly", "furthermore", "secondly", "in conclusion", "to address", "therefore", "in contrast"];
  const rebuttalMarkers = ["however", "contrary to", "mischaracterizes", "while", "rebuttal", "fails to consider", "we maintain"];

  const dipHits = diplomaticMarkers.filter((m) => lower.includes(m)).length;
  const evHits = evidenceMarkers.filter((m) => lower.includes(m)).length;
  const structHits = structuralMarkers.filter((m) => lower.includes(m)).length;
  const rebHits = rebuttalMarkers.filter((m) => lower.includes(m)).length;

  let baseScore = isTooShort ? 4.5 : hasSubstance ? 7.2 : 6.0;

  const contentScore = Math.min(9.6, Math.max(4.0, Math.round((baseScore + evHits * 0.5 + (wordCount > 60 ? 0.8 : 0)) * 10) / 10));
  const accuracyScore = Math.min(9.4, Math.max(4.5, Math.round((baseScore + (lower.includes(input.portfolio.toLowerCase()) ? 0.7 : 0.2) + evHits * 0.4) * 10) / 10));
  const relevanceScore = Math.min(9.8, Math.max(4.0, Math.round((baseScore + (rebHits > 0 ? 0.8 : 0.3) + 0.5) * 10) / 10));
  const diplomacyScore = Math.min(9.5, Math.max(5.0, Math.round((baseScore + dipHits * 0.6) * 10) / 10));
  const structureScore = Math.min(9.2, Math.max(4.0, Math.round((baseScore + structHits * 0.7) * 10) / 10));
  const rebuttalScore = Math.min(9.0, Math.max(3.5, Math.round((baseScore + rebHits * 0.8 + evHits * 0.3 - (isTooShort ? 1.5 : 0)) * 10) / 10));

  const overall = (
    contentScore * 0.2 +
    accuracyScore * 0.15 +
    relevanceScore * 0.2 +
    diplomacyScore * 0.15 +
    structureScore * 0.15 +
    rebuttalScore * 0.15
  );
  const overallScore = Math.round(overall * 10) / 10;

  const strengths = rebHits > 0
    ? `Strong diplomatic stance that directly confronted the premise of the challenge without ceding committee ground.`
    : `Maintained composed, parliamentary tone suitable for formal caucuses.`;

  const weaknesses = evHits === 0
    ? `Lacked concrete international legal citations, treaties, or verified empirical statistics to anchor the argument.`
    : `Could streamline the opening to deliver the core national position within the first 10 seconds.`;

  const actionableSuggestion = `Structure your next response using: **1. Immediate Country Position** → **2. Concrete Precedent/Article** → **3. Operative Policy Solution** → **4. Committee Clincher**.`;

  return {
    contentScore,
    accuracyScore,
    relevanceScore,
    diplomacyScore,
    structureScore,
    rebuttalScore,
    overallScore,
    strengths,
    weaknesses,
    actionableSuggestion,
  };
}
