import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runSeed() {
  console.log("🌱 Seeding MUNVault database with authentic MUN conference records...");

  // Clean existing data for idempotency
  await prisma.documentConnection.deleteMany();
  await prisma.speechComparison.deleteMany();
  await prisma.speech.deleteMany();
  await prisma.document.deleteMany();
  await prisma.researchAnalysis.deleteMany();
  await prisma.practiceSession.deleteMany();
  await prisma.conference.deleteMany();
  await prisma.delegateProfile.deleteMany();

  // 1. Delegate Profile
  await prisma.delegateProfile.create({
    data: {
      id: "default-profile",
      name: "Delegate Workspace",
      institution: "International MUN Society",
      country: "United Kingdom",
      avatarInitials: "MV",
      practiceStreak: 4,
      notes: "Focusing on human rights accountability and international legal verification.",
    },
  });

  // 2. Conference 1: Imperium MUN 2026 (Active)
  const conf1 = await prisma.conference.create({
    data: {
      name: "Imperium MUN 2026",
      date: "2026-03-15",
      committee: "UNHRC",
      portfolio: "United Kingdom",
      agenda: "Freedom of Religion & Protection of Religious Minorities",
      notes: "Chaired by veteran diplomats. Focus on multilateral monitoring mechanisms without infringing on sovereignty.",
      award: "Outstanding Delegate",
      status: "active",
      countryFlag: "🇬🇧",
    },
  });

  // Documents for Conf 1
  const doc1Research = await prisma.document.create({
    data: {
      conferenceId: conf1.id,
      title: "International Monitoring Mechanisms & Legal Precedents",
      category: "RESEARCH",
      tags: "monitoring,sovereignty,icc,unhrc,treaties",
      coverageScore: 88.0,
      content: `INTERNATIONAL MONITORING MECHANISMS & LEGAL PRECEDENTS
Delegation of the United Kingdom | UNHRC 2026

1. EXECUTIVE SUMMARY & POSITION
The United Kingdom firmly upholds Article 18 of the Universal Declaration of Human Rights and the ICCPR regarding the freedom of thought, conscience, and religion. When systemic state-sponsored persecution of minority faith groups occurs, the international community cannot remain silent behind the shield of Article 2(7) of the UN Charter.

2. UN PRECEDENTS & MANDATES
- UN General Assembly Resolution 36/55 (Declaration on the Elimination of All Forms of Intolerance and of Discrimination Based on Religion or Belief).
- Human Rights Council Resolution 16/18: Combating intolerance, negative stereotyping and stigmatization of, and discrimination, incitement to violence and violence against, persons based on religion or belief.
- Special Rapporteur on Freedom of Religion or Belief: Mandated by Commission on Human Rights resolution 1986/20.

3. OPPOSITION ARGUMENTS & COUNTER-STRATEGY
Adversary delegations (e.g., non-aligned or authoritarian blocs) argue that external fact-finding missions violate sovereign domestic jurisdiction.
Counterargument: Sovereign authority carries the sovereign responsibility to protect. Furthermore, UN verification missions operate strictly within fact-finding mandates established by multilateral consensus, reporting transparently to the General Assembly.

4. IMPLEMENTATION & OVERSIGHT
Establishment of the Multilateral Independent Verification Mechanism (MIVM), financed through voluntary contributions under the Office of the United Nations High Commissioner for Human Rights (OHCHR).`,
    },
  });

  const doc1GSL = await prisma.document.create({
    data: {
      conferenceId: conf1.id,
      title: "GSL #02 — Minority Rights & State Accountability",
      category: "GSL",
      tags: "gsl,human-rights,accountability,minorities",
      coverageScore: 92.0,
      content: `Honorable Chair, Esteemed Fellow Delegates,

"Freedom of religion is not a diplomatic privilege granted at the whim of the state; it is an inalienable pillar of human dignity."

The Delegation of the United Kingdom takes the floor today as millions belonging to religious and ethnic minorities across the globe face systemic erasure, arbitrary detention, and institutionalized silencing. While certain delegations argue that external scrutiny encroaches upon national sovereignty, the United Kingdom reaffirms that sovereignty cannot be a fortress behind which basic human rights are dismantled.

Under UN General Assembly Resolution 36/55 and Council Resolution 16/18, every member state committed to eliminating religious intolerance. The United Kingdom proposes a three-tier multilateral framework:
First, immediate deployment of independent fact-finding teams coordinated by the OHCHR.
Second, technical capacity-building for sovereign judicial systems to prosecute sectarian violence.
And third, a transparent funding mechanism to rehabilitate displaced faith communities.

Let this committee be remembered not for empty declarations, but for courageous, verifiable action. The United Kingdom yields our remaining time to the Chair.`,
    },
  });

  const doc1Mod = await prisma.document.create({
    data: {
      conferenceId: conf1.id,
      title: "Accountability Framework & Targeted Sanctions Matrix",
      category: "MODERATED_CAUCUS",
      tags: "mod-caucus,sanctions,accountability,oversight",
      coverageScore: 84.0,
      content: `MODERATED CAUCUS SPEAKING NOTES
Topic: Establishing Verifiable Accountability for State-Sponsored Persecution

Key Points for the Floor:
1. Proportionality Principle:
- Targeted individual asset freezes and travel restrictions against human rights abusers rather than broad economic sanctions that punish civilian populations.
- Magnitsky-style multilateral coordination among willing member states.

2. Evidence Threshold:
- Requires verified reporting by at least two independent international NGOs and OHCHR Special Rapporteurs before triggering referral to the UN Security Council or international tribunals.

3. Rebuttal against Sovereignty Claims:
- "The delegation of the UK reminds our esteemed colleagues that accountability is not intervention; it is the fulfillment of obligations freely ratified under the ICCPR."`,
    },
  });

  const doc1POI = await prisma.document.create({
    data: {
      conferenceId: conf1.id,
      title: "Questions Bank — UNHRC Sovereign Exemptions",
      category: "POI",
      tags: "poi,questions,rebuttals,cross-examination",
      coverageScore: 78.0,
      content: `POINT OF INFORMATION (POI) BANK — UNHRC 2026

Target 1: Delegations claiming absolute non-intervention
"Is the delegate aware that under Article 55 and 56 of the UN Charter, all members have pledged to take joint and separate action in cooperation with the Organization for universal respect for human rights? How does your delegation reconcile that pledge with refusing fact-finding missions?"

Target 2: Delegations raising funding obstacles
"Does the delegate not recognize that preventative verification costs less than 2% of the humanitarian emergency assistance required after sectarian conflicts escalate?"

Target 3: Delegations defending discriminatory national blasphemy laws
"Can the delegate explain how capital punishment for religious apostasy complies with Article 18 of the ICCPR, which explicitly protects the right to adopt or change one's religion?"`,
    },
  });

  const doc1Resolution = await prisma.document.create({
    data: {
      conferenceId: conf1.id,
      title: "Draft Resolution 1.1 — Comprehensive Protection & Verification Mechanism",
      category: "RESOLUTION",
      tags: "resolution,draft,clauses,unhrc",
      coverageScore: 90.0,
      content: `GENERAL ASSEMBLY / HUMAN RIGHTS COUNCIL DRAFT RESOLUTION 1.1

Sponsors: United Kingdom, Germany, Japan, Sweden
Signatories: Canada, Australia, Ghana, South Korea, Chile

The Human Rights Council,
Reaffirming the Universal Declaration of Human Rights and the International Covenant on Civil and Political Rights,
Guided by the principles of national sovereignty alongside sovereign responsibility to protect civilian populations,
Deeply concerned by escalating violence against religious and ethnic minorities,

1. Urges all Member States to review and amend domestic legislation criminalizing freedom of thought, conscience, and faith;
2. Authorizes the establishment of the Independent Multilateral Verification Taskforce (IMVT) under the auspices of the OHCHR;
3. Mandates unhindered access for UN Special Rapporteurs to conduct fact-finding visits in regions reporting systemic sectarian abuse;
4. Recommends the allocation of a dedicated Trust Fund for Victim Rehabilitation supported by voluntary contributions.`,
    },
  });

  // Pre-seed connections for Imperium MUN
  await prisma.documentConnection.create({
    data: {
      sourceDocId: doc1Research.id,
      targetDocId: doc1GSL.id,
      connectionType: "RESEARCH_TO_SPEECH",
      similarityScore: 88.0,
      explanation: "GSL speech directly translates the research on Resolution 16/18 and MIVM into opening arguments.",
      status: "accepted",
    },
  });

  await prisma.documentConnection.create({
    data: {
      sourceDocId: doc1Research.id,
      targetDocId: doc1Resolution.id,
      connectionType: "RESEARCH_TO_RESOLUTION",
      similarityScore: 84.0,
      explanation: "Independent Multilateral Verification Taskforce in clause 2 is derived directly from research section 4.",
      status: "accepted",
    },
  });

  await prisma.documentConnection.create({
    data: {
      sourceDocId: doc1GSL.id,
      targetDocId: doc1Mod.id,
      connectionType: "SPEECH_TO_CAUCUS",
      similarityScore: 76.0,
      explanation: "Mod caucus speaking notes operationalize the GSL call for verifiable accountability.",
      status: "accepted",
    },
  });

  await prisma.documentConnection.create({
    data: {
      sourceDocId: doc1Mod.id,
      targetDocId: doc1POI.id,
      connectionType: "SPEECH_TO_POI",
      similarityScore: 81.0,
      explanation: "Sovereignty counterarguments developed in mod caucus align with POI questions 1 and 3.",
      status: "accepted",
    },
  });

  // Research analysis for Conf 1
  await prisma.researchAnalysis.create({
    data: {
      conferenceId: conf1.id,
      overallScore: 8.4,
      countryPositionScore: 88.0,
      historicalScore: 82.0,
      unPrecedentsScore: 85.0,
      resolutionsScore: 86.0,
      oppositionScore: 74.0,
      implementationScore: 78.0,
      sourcesScore: 90.0,
      strongAreas: JSON.stringify([
        "Firm United Kingdom foreign policy posture",
        "UN Charter & ICCPR Article 18 legal grounding",
        "Actionable draft resolution clauses",
        "Empirical human rights reporting citations",
      ]),
      missingAreas: JSON.stringify([
        "Independent verification funding budget caps",
        "Opposition strategy against sovereignty objections",
        "Specific timeline for bilateral judicial training",
      ]),
      feedback:
        "Outstanding preparatory dossier. Your legal basis under UNHRC Resolution 16/18 is rock solid. Best next step: fortify your answers regarding funding distribution to defuse opposition criticism in unmoderated caucus.",
    },
  });

  // Speeches record for Conf 1
  await prisma.speech.create({
    data: {
      conferenceId: conf1.id,
      documentId: doc1GSL.id,
      title: "GSL #02 — Minority Rights & State Accountability",
      speechType: "GSL",
      content: doc1GSL.content,
      themes: JSON.stringify(["Human Rights & Minority Protection", "International Accountability & Sanctions", "State Sovereignty & Non-Intervention"]),
      arguments: JSON.stringify([
        "Sovereignty cannot be a fortress behind which basic human rights are dismantled.",
        "Under UNGA Res 36/55, all states committed to eliminating religious intolerance.",
        "Establishment of independent fact-finding teams coordinated by the OHCHR.",
      ]),
      policyProposals: JSON.stringify([
        "Deployment of independent fact-finding teams",
        "Technical judicial capacity building",
        "Transparent rehabilitation trust fund",
      ]),
      evidenceUsed: JSON.stringify(["UNGA Resolution 36/55", "UNHRC Resolution 16/18", "UDHR Article 18"]),
      framingType: "Humanitarian & Moral",
    },
  });

  // 3. Conference 2: SHMUN '24 (Past)
  const conf2 = await prisma.conference.create({
    data: {
      name: "SHMUN ’24",
      date: "2024-11-20",
      committee: "DISEC",
      portfolio: "Sweden",
      agenda: "Regulation of Cyber Warfare & Protection of Critical Infrastructure",
      notes: "First Committee of the UN General Assembly. Stressed international law applicability in cyberspace.",
      award: "High Commendation",
      status: "past",
      countryFlag: "🇸🇪",
    },
  });

  const doc2Research = await prisma.document.create({
    data: {
      conferenceId: conf2.id,
      title: "Cyber Warfare & State Sovereignty Legal Analysis",
      category: "RESEARCH",
      tags: "cyber,disec,international-law,tallinn",
      coverageScore: 82.0,
      content: `CYBER WARFARE & INTERNATIONAL HUMANITARIAN LAW
Delegation of Sweden | UN DISEC 2024

1. SWEDISH NATIONAL POSITION
Sweden affirms that international law, particularly the UN Charter and International Humanitarian Law (IHL), applies fully in cyberspace. Hostile cyber operations targeting hospitals, power grids, and water systems constitute violations of state sovereignty and IHL principles of distinction and proportionality.

2. MULTILATERAL PRECEDENTS
- UN Group of Governmental Experts (GGE) Consensus Reports (2013, 2015, 2021).
- Open-Ended Working Group (OEWG) on security of and in the use of information and communications technologies.
- Tallinn Manual 2.0 on the International Law Applicable to Cyber Operations.`,
    },
  });

  const doc2GSL = await prisma.document.create({
    data: {
      conferenceId: conf2.id,
      title: "GSL #01 — Neutrality and Digital Non-Proliferation",
      category: "GSL",
      tags: "gsl,cyber,sweden,disec",
      coverageScore: 85.0,
      content: `Honorable Chair and Fellow Delegates,

Cyberspace is no longer an unregulated frontier; it is the nervous system of modern civilization. When malware disables electrical grids or compromises nuclear safety monitoring, the casualties are not virtual—they are human.

Sweden reaffirms that the UN Charter applies in cyberspace just as it does in land, sea, and air. We call upon DISEC to establish binding norms prohibiting attacks against critical civilian infrastructure and establishing a multilateral forensics verification repository.`,
    },
  });

  await prisma.speech.create({
    data: {
      conferenceId: conf2.id,
      documentId: doc2GSL.id,
      title: "GSL #01 — Neutrality and Digital Non-Proliferation",
      speechType: "GSL",
      content: doc2GSL.content,
      themes: JSON.stringify(["Cyber Warfare & Security Protocols", "State Sovereignty & Non-Intervention", "Multilateral Cooperation & Peacekeeping"]),
      arguments: JSON.stringify([
        "UN Charter applies in cyberspace just as on land and sea.",
        "Binding norms prohibiting attacks against critical civilian infrastructure.",
      ]),
      policyProposals: JSON.stringify(["Multilateral forensics verification repository"]),
      evidenceUsed: JSON.stringify(["UN GGE 2021 Report", "Tallinn Manual 2.0"]),
      framingType: "Security & Realpolitik",
    },
  });

  // 4. Conference 3: IPC Crisis Summit (Past)
  const conf3 = await prisma.conference.create({
    data: {
      name: "IPC Crisis",
      date: "2024-05-10",
      committee: "International Press Corps",
      portfolio: "France (Le Monde)",
      agenda: "Live Crisis: Disinformation Networks & Protection of War Correspondents",
      notes: "Fast-paced crisis committee. Produced 4 press releases and exposed backroom covert arms agreements.",
      award: "Best Delegate",
      status: "past",
      countryFlag: "🇫🇷",
    },
  });

  await prisma.document.create({
    data: {
      conferenceId: conf3.id,
      title: "Press Dispatch: Covert Treaties & War Correspondent Safety",
      category: "RESEARCH",
      tags: "press,crisis,journalism,geneva",
      coverageScore: 80.0,
      content: `LE MONDE DISPATCH | IPC CRISIS 2024
Report on the protection of war correspondents under Geneva Conventions Additional Protocol I, Article 79. Systemic denial of press access in conflict theatres constitutes an effort to obscure violations of international humanitarian law.`,
    },
  });

  // 5. Practice Session Records
  await prisma.practiceSession.create({
    data: {
      conferenceId: conf1.id,
      question:
        "The United Kingdom claims to support freedom of religion. How would your delegation respond to criticism regarding its treatment of religious minorities and institutional historical biases?",
      topic: "Freedom of Religion & Minority Rights",
      committee: "UNHRC",
      portfolio: "United Kingdom",
      userTranscript:
        "The United Kingdom acknowledges our historical domestic challenges, but we maintain that open self-reflection and independent judicial review distinguish transparent democracies. Under the Equality Act and our multilateral treaty obligations, religious freedoms are legally safeguarded. Our delegation urges the committee to focus on systemic state-sponsored persecution occurring right now without judicial remedy.",
      contentScore: 8.5,
      accuracyScore: 8.2,
      relevanceScore: 8.0,
      diplomacyScore: 7.8,
      structureScore: 7.5,
      rebuttalScore: 7.2,
      overallScore: 7.9,
      strengths: "Directly addressed the criticism without evading, framing self-reflection as democratic strength.",
      weaknesses: "Took slightly long to pivot from domestic defense to the core agenda topic.",
      actionableSuggestion: "Use Position → Precedent → Policy → Pivot formula for 30-second POI counters.",
    },
  });

  await prisma.practiceSession.create({
    data: {
      conferenceId: conf1.id,
      question:
        "Your opponents argue that international monitoring violates state sovereignty under Article 2(7). Give a diplomatic rebuttal.",
      topic: "State Sovereignty vs Human Rights",
      committee: "UNHRC",
      portfolio: "United Kingdom",
      userTranscript:
        "The United Kingdom respects Article 2(7), but reminds this body that sovereignty is not absolute immunity. When states voluntarily ratify the ICCPR, they agree that human rights are matters of legitimate international concern. Fact-finding missions do not impose legislation; they ensure transparency.",
      contentScore: 8.8,
      accuracyScore: 8.6,
      relevanceScore: 8.8,
      diplomacyScore: 8.4,
      structureScore: 8.2,
      rebuttalScore: 8.5,
      overallScore: 8.5,
      strengths: "Masterful legal distinction between infringement of jurisdiction and legitimate treaty verification.",
      weaknesses: "Could have cited the ICJ Barcelona Traction precedent to solidify erga omnes obligations.",
      actionableSuggestion: "Close with a direct appeal to the fence-sitter delegations in the unmoderated caucus.",
    },
  });

  console.log("✅ Seed completed successfully! 3 Conferences, 9 Documents, Connections, and Sessions ready.");
}

// Execute if run directly
if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
