/**
 * Document Knowledge Graph Connection Service
 * Computes semantic similarity between MUN documents and suggests links:
 * Research -> GSL -> Mod Caucus -> POI -> Resolution
 */

import { DocumentItem } from "../types";

export interface SuggestedConnection {
  sourceDocId: string;
  sourceDocTitle: string;
  sourceCategory: string;
  targetDocId: string;
  targetDocTitle: string;
  targetCategory: string;
  connectionType: string;
  similarityScore: number;
  explanation: string;
}

export function computeDocumentSimilarity(
  docA: { id: string; title: string; category: string; content: string },
  docB: { id: string; title: string; category: string; content: string }
): { similarity: number; explanation: string; connectionType: string } {
  const wordsA = (docA.content + " " + docA.title).toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordsB = (docB.content + " " + docB.title).toLowerCase().match(/\b[a-z]{4,}\b/g) || [];

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  const intersection = new Set(Array.from(setA).filter((x) => setB.has(x)));
  const union = new Set([...Array.from(setA), ...Array.from(setB)]);

  const jaccard = union.size > 0 ? intersection.size / union.size : 0;

  // Determine category relationship
  let connectionType = "THEMATIC";
  if (docA.category === "RESEARCH" && (docB.category === "GSL" || docB.category === "MODERATED_CAUCUS")) {
    connectionType = "RESEARCH_TO_SPEECH";
  } else if ((docA.category === "GSL" || docA.category === "MODERATED_CAUCUS") && docB.category === "POI") {
    connectionType = "SPEECH_TO_POI";
  } else if (docA.category === "POI" && docB.category === "RESOLUTION") {
    connectionType = "POI_TO_RESOLUTION";
  } else if (docA.category === "RESEARCH" && docB.category === "RESOLUTION") {
    connectionType = "RESEARCH_TO_RESOLUTION";
  }

  // Common MUN theme boosters
  const sharedKeyPhrases = Array.from(intersection)
    .filter((w) => ["monitoring", "sovereignty", "sanctions", "minorities", "treaty", "funding", "oversight", "framework", "charter", "mandate"].includes(w))
    .slice(0, 3);

  let boost = sharedKeyPhrases.length * 8;
  const similarityScore = Math.min(96, Math.max(48, Math.round((jaccard * 100 * 2.2 + boost))));

  let explanation = `Both documents share key terminology and policy substance`;
  if (sharedKeyPhrases.length > 0) {
    explanation = `Both materials develop strategic positions regarding ${sharedKeyPhrases.join(", ")}.`;
  }

  if (connectionType === "RESEARCH_TO_SPEECH") {
    explanation += ` Core research findings directly supply evidentiary foundation for the speech.`;
  } else if (connectionType === "SPEECH_TO_POI") {
    explanation += ` Key speech claims expose vulnerability points addressed in the POI bank.`;
  } else if (connectionType === "RESEARCH_TO_RESOLUTION") {
    explanation += ` Policy mechanisms proposed in the research paper formulate operative resolution clauses.`;
  }

  return {
    similarity: similarityScore,
    explanation,
    connectionType,
  };
}

export function findSuggestedConnections(
  documents: Array<{ id: string; title: string; category: string; content: string }>,
  existingConnectionPairs: Set<string>
): SuggestedConnection[] {
  const suggestions: SuggestedConnection[] = [];

  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const docA = documents[i];
      const docB = documents[j];

      const pairKey1 = `${docA.id}:${docB.id}`;
      const pairKey2 = `${docB.id}:${docA.id}`;

      if (existingConnectionPairs.has(pairKey1) || existingConnectionPairs.has(pairKey2)) {
        continue;
      }

      const { similarity, explanation, connectionType } = computeDocumentSimilarity(docA, docB);

      // Suggest if similarity >= 60%
      if (similarity >= 60) {
        suggestions.push({
          sourceDocId: docA.id,
          sourceDocTitle: docA.title,
          sourceCategory: docA.category,
          targetDocId: docB.id,
          targetDocTitle: docB.title,
          targetCategory: docB.category,
          connectionType,
          similarityScore: similarity,
          explanation,
        });
      }
    }
  }

  return suggestions.sort((a, b) => b.similarityScore - a.similarityScore);
}
