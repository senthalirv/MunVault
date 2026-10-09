/**
 * AI Research Analyst Service
 * Evaluates MUN conference research documents across 7 critical dimensions:
 * 1. Country Position
 * 2. Historical Background
 * 3. UN Precedents & Mechanisms
 * 4. Existing Resolutions
 * 5. Opposition Arguments & Counterarguments
 * 6. Implementation Strategies & Funding
 * 7. References & Credible Sources
 *
 * Implements external AI integration with resilient local heuristic fallback.
 */

export interface AnalysisInput {
  conferenceName: string;
  committee: string;
  portfolio: string;
  agenda: string;
  documents: Array<{
    title: string;
    category: string;
    content: string;
  }>;
}

export interface AnalysisOutput {
  overallScore: number; // 0 - 10
  countryPositionScore: number; // 0 - 100
  historicalScore: number;
  unPrecedentsScore: number;
  resolutionsScore: number;
  oppositionScore: number;
  implementationScore: number;
  sourcesScore: number;
  strongAreas: string[];
  missingAreas: string[];
  feedback: string;
}

export async function analyzeConferenceResearch(
  input: AnalysisInput
): Promise<AnalysisOutput> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      return await analyzeWithOpenAI(input, apiKey);
    } catch (err) {
      console.warn("OpenAI analysis failed, engaging local resilient evaluator:", err);
      return evaluateLocally(input);
    }
  }

  return evaluateLocally(input);
}

async function analyzeWithOpenAI(input: AnalysisInput, apiKey: string): Promise<AnalysisOutput> {
  const combinedDocs = input.documents
    .map((d, i) => `[Doc ${i + 1}: ${d.title} (${d.category})]\n${d.content.slice(0, 3000)}`)
    .join("\n\n---\n\n");

  const prompt = `You are a world-class Model United Nations (MUN) Chief Research Analyst and Secretary-General Advisor.
Analyze the following preparation dossier for a delegate:
Conference: ${input.conferenceName}
Committee: ${input.committee}
Portfolio (Country/Actor): ${input.portfolio}
Agenda: ${input.agenda}

Uploaded Materials:
${combinedDocs}

Perform an honest, strict, rigorous evaluation. Return ONLY a valid JSON object matching this schema:
{
  "overallScore": number (0 to 10, e.g. 8.4),
  "countryPositionScore": number (0 to 100),
  "historicalScore": number (0 to 100),
  "unPrecedentsScore": number (0 to 100),
  "resolutionsScore": number (0 to 100),
  "oppositionScore": number (0 to 100),
  "implementationScore": number (0 to 100),
  "sourcesScore": number (0 to 100),
  "strongAreas": string[] (e.g. ["National legal posture", "UN Charter precedent"]),
  "missingAreas": string[] (e.g. ["Clear funding mechanisms", "Opposition counter-arguments"]),
  "feedback": string (Detailed paragraphs explaining strengths, critical blind spots, and how to improve before committee)
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

  if (!res.ok) {
    throw new Error(`OpenAI HTTP ${res.status}`);
  }

  const json = await res.json();
  const parsed = JSON.parse(json.choices[0].message.content);
  return {
    overallScore: Number(parsed.overallScore) || 7.5,
    countryPositionScore: Number(parsed.countryPositionScore) || 80,
    historicalScore: Number(parsed.historicalScore) || 75,
    unPrecedentsScore: Number(parsed.unPrecedentsScore) || 70,
    resolutionsScore: Number(parsed.resolutionsScore) || 70,
    oppositionScore: Number(parsed.oppositionScore) || 65,
    implementationScore: Number(parsed.implementationScore) || 60,
    sourcesScore: Number(parsed.sourcesScore) || 75,
    strongAreas: Array.isArray(parsed.strongAreas) ? parsed.strongAreas : ["Country position", "Historical context"],
    missingAreas: Array.isArray(parsed.missingAreas) ? parsed.missingAreas : ["Implementation details", "Specific funding"],
    feedback: parsed.feedback || "Good preparation foundation.",
  };
}

/**
 * Resilient local analytical engine that inspects delegate documents for MUN-specific markers,
 * legal frameworks, opposition analysis, and concrete policy mechanisms.
 */
function evaluateLocally(input: AnalysisInput): AnalysisOutput {
  const corpus = input.documents.map((d) => `${d.title} ${d.content}`).join(" ").toLowerCase();
  const portfolioLower = input.portfolio.toLowerCase();

  // 1. Country Position evaluation
  const positionKeywords = [
    portfolioLower, "policy", "national interest", "constitution", "treaty", "sovereignty", "stance", "delegation", "foreign policy", "bilateral"
  ];
  let positionMatches = positionKeywords.filter((k) => corpus.includes(k)).length;
  const countryPositionScore = Math.min(95, Math.max(45, 50 + positionMatches * 6));

  // 2. Historical context
  const historyKeywords = ["history", "19", "20", "since", "established", "past", "conflict", "origin", "war", "decade", "treaty of", "convention"];
  let historyMatches = historyKeywords.filter((k) => corpus.includes(k)).length;
  const historicalScore = Math.min(94, Math.max(40, 48 + historyMatches * 5));

  // 3. UN Precedents & Mechanisms
  const unKeywords = ["resolution", "charter", "unhrc", "unsc", "general assembly", "icj", "icc", "special rapporteur", "article", "sanctions", "peacekeeping", "unicef", "undp"];
  let unMatches = unKeywords.filter((k) => corpus.includes(k)).length;
  const unPrecedentsScore = Math.min(92, Math.max(35, 45 + unMatches * 6));

  // 4. Existing Resolutions
  const resKeywords = ["resolution", "clause", "operative", "preambular", "reaffirming", "urges", "calls upon", "mandate", "protocol"];
  let resMatches = resKeywords.filter((k) => corpus.includes(k)).length;
  const resolutionsScore = Math.min(90, Math.max(30, 40 + resMatches * 6));

  // 5. Opposition Arguments & Counterarguments
  const oppKeywords = ["criticism", "opponent", "counterargument", "opposition", "rebuttal", "challenge", "allegations", "objections", "skeptics", "dissent"];
  let oppMatches = oppKeywords.filter((k) => corpus.includes(k)).length;
  const oppositionScore = Math.min(88, Math.max(25, 35 + oppMatches * 7));

  // 6. Implementation Strategies & Funding
  const implKeywords = ["funding", "budget", "implementation", "mechanism", "timeline", "oversight", "task force", "compliance", "inspection", "audit", "framework", "enforcement"];
  let implMatches = implKeywords.filter((k) => corpus.includes(k)).length;
  const implementationScore = Math.min(88, Math.max(25, 30 + implMatches * 6));

  // 7. Sources and Citations
  const sourceKeywords = ["source", "http", "doi", "report", "data", "statistic", "percent", "according to", "verified", "index", "amnesty", "reuters"];
  let sourceMatches = sourceKeywords.filter((k) => corpus.includes(k)).length;
  const sourcesScore = Math.min(96, Math.max(40, 50 + sourceMatches * 6));

  // Weighted overall score out of 10
  const weighted =
    countryPositionScore * 0.20 +
    historicalScore * 0.12 +
    unPrecedentsScore * 0.18 +
    resolutionsScore * 0.14 +
    oppositionScore * 0.12 +
    implementationScore * 0.14 +
    sourcesScore * 0.10;
  
  const overallScore = Math.round((weighted / 10) * 10) / 10;

  // Identify strong and missing areas
  const strongAreas: string[] = [];
  const missingAreas: string[] = [];

  if (countryPositionScore >= 75) strongAreas.push(`Clear ${input.portfolio} national policy posture`);
  else missingAreas.push(`Nuanced ${input.portfolio} state-level domestic interests`);

  if (unPrecedentsScore >= 70) strongAreas.push("UN Charter & institutional precedent coverage");
  else missingAreas.push("Recent UN Security Council / General Assembly resolutions");

  if (historicalScore >= 70) strongAreas.push("Historical diplomatic context & bilateral treaties");
  else missingAreas.push("Deeper timeline of past conflict resolution attempts");

  if (resolutionsScore >= 70) strongAreas.push("Resolution clause phrasing & actionable operative text");
  else missingAreas.push("Preambular and operative clause drafts");

  if (oppositionScore >= 65) strongAreas.push("Anticipation of adversary delegates' key attack angles");
  else missingAreas.push("Concrete rebuttals against likely opposition challenges");

  if (implementationScore >= 65) strongAreas.push("Actionable implementation frameworks and verification");
  else missingAreas.push("Independent funding pipelines & enforcement oversight mechanisms");

  if (sourcesScore >= 70) strongAreas.push("Multi-source citation bank and empirical verification");
  else missingAreas.push("Primary international body reports & verified statistical citations");

  const feedback = `### Strategic Dossier Evaluation for ${input.portfolio} in ${input.committee}

**Preparation Overview:**
Your dossier establishes a ${overallScore >= 8.0 ? "formidable" : overallScore >= 7.0 ? "solid" : "preliminary"} research baseline for addressing "${input.agenda}". 
Your strongest asset is **${strongAreas[0] || "Foundational topic awareness"}**, which provides you with diplomatic authority during General Speakers List (GSL) declarations.

**Critical Vulnerabilities to Address Before Committee:**
1. **${missingAreas[0] || "Implementation Frameworks"}**: In moderated caucuses, hostile delegations will challenge your ability to execute policy without infringing on national sovereignty or overburdening UN budgets.
2. **${missingAreas[1] || "Opposition Rebuttals"}**: Prepare defensive talking points specifically targeting rival bloc positions to maintain composure under unmoderated pressure and Point of Information (POI) challenges.

**Action Plan:**
- Draft an explicit 3-stage timeline (Phase 1: Verification, Phase 2: Funding, Phase 3: Transition).
- Connect your GSL rhetoric directly to working paper operative clauses.`;

  return {
    overallScore,
    countryPositionScore,
    historicalScore,
    unPrecedentsScore,
    resolutionsScore,
    oppositionScore,
    implementationScore,
    sourcesScore,
    strongAreas: strongAreas.slice(0, 4),
    missingAreas: missingAreas.slice(0, 4),
    feedback,
  };
}
