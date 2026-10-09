/**
 * Speech Intelligence & Cross-Conference Similarity Engine
 * Analyzes speech corpus for:
 * - Repeated arguments & thematic patterns
 * - Framing habits (Humanitarian vs Security vs Economic vs Legalist)
 * - Structural & textual similarity comparisons between speeches
 */

export interface SpeechAnalysisResult {
  themes: string[];
  arguments: string[];
  policyProposals: string[];
  evidenceUsed: string[];
  framingType: string;
}

export interface SpeechComparisonOutput {
  overallSimilarity: number;
  wordingSimilarity: number;
  framingSimilarity: number;
  policySimilarity: number;
  evidenceSimilarity: number;
  explanation: string;
}

export interface MacroSpeechInsights {
  totalSpeechesAnalyzed: number;
  mostFrequentArguments: Array<{ argument: string; count: number; conferences: string[] }>;
  framingDistribution: Record<string, number>;
  diversityScore: number; // 0 - 100
  critique: string;
  recommendations: string[];
}

export function extractSpeechAttributesLocally(text: string, title: string): SpeechAnalysisResult {
  const lower = text.toLowerCase();

  // Themes
  const themeList = [
    { name: "State Sovereignty & Non-Intervention", keys: ["sovereignty", "territorial", "domestic jurisdiction", "interference"] },
    { name: "Human Rights & Minority Protection", keys: ["human rights", "minorities", "discrimination", "religious freedom", "dignity"] },
    { name: "International Accountability & Sanctions", keys: ["accountability", "monitoring", "sanctions", "tribunal", "icc", "investigation"] },
    { name: "Multilateral Cooperation & Peacekeeping", keys: ["multilateral", "un charter", "peacekeeping", "coalition", "dialogue", "consensus"] },
    { name: "Economic Feasibility & Funding", keys: ["funding", "budget", "economic", "aid", "trade", "resources", "infrastructure"] },
    { name: "Cyber Warfare & Security Protocols", keys: ["cyber", "digital", "espionage", "critical infrastructure", "malware", "surveillance"] },
  ];

  const matchedThemes = themeList
    .filter((t) => t.keys.some((k) => lower.includes(k)))
    .map((t) => t.name);

  // Framing classification
  let framingType = "Diplomatic Balance";
  let maxCount = 0;
  const framingWeights: Record<string, string[]> = {
    "Humanitarian & Moral": ["humanitarian", "suffering", "victims", "children", "innocent", "protection", "dignity"],
    "Security & Realpolitik": ["threat", "security", "defense", "deterrence", "strategic", "military", "border", "stability"],
    "Legalist & Procedural": ["charter", "article", "resolution", "precedent", "treaty", "jurisdiction", "customary law"],
    "Economic & Pragmatic": ["cost", "trade", "investment", "sanction", "supply chain", "efficiency", "resources"],
  };

  for (const [framing, keywords] of Object.entries(framingWeights)) {
    const hits = keywords.filter((k) => lower.includes(k)).length;
    if (hits > maxCount) {
      maxCount = hits;
      framingType = framing;
    }
  }

  // Arguments
  const sentences = text.split(/(?<=[.?!])\s+/).filter((s) => s.length > 25);
  const keyArguments = sentences
    .filter((s) => /must|urges|stands|believes|demands|calls upon|essential|cannot accept|reaffirms/i.test(s))
    .slice(0, 4);

  // Policy proposals
  const policies = sentences
    .filter((s) => /propose|establish|mandate|recommend|implement|create|resolve|framework/i.test(s))
    .slice(0, 3);

  // Evidence
  const evidence = sentences
    .filter((s) => /\d{4}|\d+%|treaty|resolution|convention|article|report|icc|unhrc|special rapporteur/i.test(s))
    .slice(0, 3);

  return {
    themes: matchedThemes.length > 0 ? matchedThemes : ["Multilateral Policy Alignment"],
    arguments: keyArguments.length > 0 ? keyArguments : ["Commitment to international legal principles"],
    policyProposals: policies.length > 0 ? policies : ["Establishment of independent oversight working group"],
    evidenceUsed: evidence.length > 0 ? evidence : ["UN Charter Article 2(7) and customary international law"],
    framingType,
  };
}

/**
 * Compare two speeches with structural metric breakdown
 */
export function compareSpeeches(
  textA: string,
  textB: string,
  titleA: string,
  titleB: string
): SpeechComparisonOutput {
  const wordsA = new Set(textA.toLowerCase().match(/\b[a-z]{4,}\b/g) || []);
  const wordsB = new Set(textB.toLowerCase().match(/\b[a-z]{4,}\b/g) || []);

  // Jaccard similarity for wording
  const intersection = new Set(Array.from(wordsA).filter((x) => wordsB.has(x)));
  const union = new Set([...Array.from(wordsA), ...Array.from(wordsB)]);
  const wordingSimilarity = Math.round(union.size > 0 ? (intersection.size / union.size) * 100 : 0);

  // Attribute extraction
  const attrA = extractSpeechAttributesLocally(textA, titleA);
  const attrB = extractSpeechAttributesLocally(textB, titleB);

  // Framing similarity
  const framingSimilarity = attrA.framingType === attrB.framingType ? 90 : 35;

  // Policy similarity
  const sharedThemes = attrA.themes.filter((t) => attrB.themes.includes(t));
  const policySimilarity = Math.round(
    Math.min(95, (sharedThemes.length / Math.max(1, Math.max(attrA.themes.length, attrB.themes.length))) * 100 + 20)
  );

  // Evidence overlap
  const evidenceOverlap = attrA.evidenceUsed.filter((e) =>
    attrB.evidenceUsed.some((e2) => e.slice(0, 15).toLowerCase() === e2.slice(0, 15).toLowerCase())
  ).length;
  const evidenceSimilarity = Math.round(evidenceOverlap > 0 ? 82 : 45);

  // Overall similarity
  const overallSimilarity = Math.round(
    wordingSimilarity * 0.35 +
    framingSimilarity * 0.25 +
    policySimilarity * 0.25 +
    evidenceSimilarity * 0.15
  );

  let explanation = `Speeches "${titleA}" and "${titleB}" demonstrate an estimated **${overallSimilarity}% structural similarity**. `;
  if (overallSimilarity >= 75) {
    explanation += `Both speeches heavily rely on ${attrA.framingType.toLowerCase()} rhetoric and reuse shared policy arguments regarding ${attrA.themes[0] || "treaty obligations"}.`;
  } else if (overallSimilarity >= 50) {
    explanation += `They share thematic overlap in ${sharedThemes.join(", ") || "diplomatic principles"}, though their concrete policy mechanisms and phrasing remain moderately distinct.`;
  } else {
    explanation += `They diverge significantly in framing (${attrA.framingType} vs ${attrB.framingType}) and leverage distinct evidence structures.`;
  }

  return {
    overallSimilarity,
    wordingSimilarity,
    framingSimilarity,
    policySimilarity,
    evidenceSimilarity,
    explanation,
  };
}

/**
 * Mine macro patterns across a delegate's speech archive
 */
export function mineDelegateSpeechHabits(
  speeches: Array<{ id: string; title: string; content: string; conferenceName: string }>
): MacroSpeechInsights {
  if (speeches.length === 0) {
    return {
      totalSpeechesAnalyzed: 0,
      mostFrequentArguments: [],
      framingDistribution: {},
      diversityScore: 100,
      critique: "Upload or create speeches to unlock speech intelligence and argument mining.",
      recommendations: ["Record your GSL and moderated caucus speeches across conferences."],
    };
  }

  const framingDistribution: Record<string, number> = {
    "Humanitarian & Moral": 0,
    "Security & Realpolitik": 0,
    "Legalist & Procedural": 0,
    "Economic & Pragmatic": 0,
    "Diplomatic Balance": 0,
  };

  const argumentOccurrences: Record<string, { count: number; conferences: Set<string> }> = {};

  for (const s of speeches) {
    const attr = extractSpeechAttributesLocally(s.content, s.title);
    framingDistribution[attr.framingType] = (framingDistribution[attr.framingType] || 0) + 1;

    for (const theme of attr.themes) {
      if (!argumentOccurrences[theme]) {
        argumentOccurrences[theme] = { count: 0, conferences: new Set() };
      }
      argumentOccurrences[theme].count += 1;
      argumentOccurrences[theme].conferences.add(s.conferenceName);
    }
  }

  const mostFrequentArguments = Object.entries(argumentOccurrences)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([argument, data]) => ({
      argument,
      count: data.count,
      conferences: Array.from(data.conferences),
    }));

  // Diversity score: how evenly distributed are the framings and themes
  const activeFramings = Object.values(framingDistribution).filter((c) => c > 0).length;
  const diversityScore = Math.min(95, Math.max(30, Math.round((activeFramings / 4) * 85 + (mostFrequentArguments.length > 2 ? 15 : 0))));

  const dominantFraming = Object.entries(framingDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "Humanitarian";

  const recommendations = [
    `Diversify beyond **${dominantFraming}** framing by integrating economic feasibility metrics into your next speech.`,
    "Build a dedicated POI bank targeting procedural loopholes rather than only relying on substantive moral calls.",
    "Introduce novel treaty citations (e.g., bilateral treaties or regional conventions) to differentiate your argumentation.",
  ];

  const critique = `Across ${speeches.length} speeches in your archive, you exhibit a strong reliance on **${dominantFraming}** framing. Your most recurrent pillar is "${mostFrequentArguments[0]?.argument || "International Accountability"}" (present in ${mostFrequentArguments[0]?.count || 1} speeches). While this builds recognizable authority, cross-committee judges reward multi-faceted delegates who can fluidly switch between legalist, security, and economic angles.`;

  return {
    totalSpeechesAnalyzed: speeches.length,
    mostFrequentArguments,
    framingDistribution,
    diversityScore,
    critique,
    recommendations,
  };
}
