
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { RssArticle } from '../types';

// As per guidelines, `process.env.API_KEY` is assumed to be available in the execution environment.
// Initialize the AI client directly with the API key from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const getArticlesContent = (articles: RssArticle[]): string => {
    // Number the articles starting from 1 for clear citation [Article 1], [Article 2], etc.
    return articles.map((article, index) => {
        const cleanDescription = article.description.replace(/<[^>]*>?/gm, '');
        return `Article ${index + 1}: ${article.title}\n${cleanDescription}`;
    }).join('\n\n---\n\n');
}

export const summarizeArticle = async (content: string): Promise<string> => {
  const prompt = `You are a cybersecurity analyst. Summarize the following news article for a threat intelligence report. Focus on key threats, vulnerabilities, threat actors, and affected systems. Provide a concise, professional summary in one or two paragraphs.\n\n---\n\n${content}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            temperature: 0.2,
            topP: 0.9,
            topK: 32,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to generate summary from AI model. Please check your API key and network connection.");
  }
};

export const generateExecutiveReport = async (articles: RssArticle[]): Promise<string> => {
    const articlesContent = getArticlesContent(articles);
    const prompt = `You are a senior cybersecurity analyst preparing an executive intelligence briefing. Based *only* on the following ${articles.length} recent articles, synthesize a high-level summary for a non-technical audience. Focus on emerging trends, significant threats, and potential business impact. Do not describe each article individually; instead, provide a cohesive narrative of the current threat landscape as revealed by these sources. The summary should be concise and strategic.

Here are the articles:
${articlesContent}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.3,
                topP: 0.9,
                topK: 40,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating executive report with Gemini:", error);
        throw new Error("Failed to generate executive report from AI model. Please check your API key and network connection.");
    }
};

const focusedReportPrompts: Record<string, (articlesContent: string) => string> = {
    'Key Security Alerts': (articlesContent) => `You are a senior analyst in a Security Operations Center (SOC). Your task is to extract critical, actionable security alerts from the following articles. Focus on identifying:
- Specific vulnerabilities and their CVE identifiers (e.g., CVE-2023-XXXXX).
- Malware families, threat actor groups, or specific tools mentioned.
- Patches, mitigations, or recommended actions for defenders.
- High-priority threats that require immediate attention.
Format the output as a series of bullet points under clear headings. Be concise and direct.

Here are the articles:
${articlesContent}`,

    'Major Cyber Incidents': (articlesContent) => `You are a cyber threat intelligence analyst reporting on major incidents. Based *only* on the provided articles, identify and synthesize a report on the most significant cyber incidents mentioned. For each major incident, detail:
- The victim(s) and their industry.
- The suspected threat actor or group.
- The timeline of the attack, if available.
- The impact of the incident (e.g., data breach, financial loss, operational disruption).
If no major incidents are detailed, state that. Synthesize information from multiple articles if they cover the same event.

Here are the articles:
${articlesContent}`,

    'Impact to Conglomerate': (articlesContent) => `You are a strategic risk advisor for a large, global conglomerate with diverse business units (e.g., manufacturing, finance, technology, healthcare). Analyze the following intelligence reports and provide a strategic assessment of the potential impact on the conglomerate. Focus on:
- Broad trends that could affect multiple business units.
- Supply chain risks or threats to third-party vendors.
- Geopolitical factors or nation-state activities that pose a strategic threat.
- Recommendations for adjusting the company's security posture or risk management strategy.
Your analysis should be high-level and forward-looking, intended for C-suite executives.

Here are the articles:
${articlesContent}`,
};

export const generateFocusedReport = async (articles: RssArticle[], reportType: string): Promise<string> => {
    const promptGenerator = focusedReportPrompts[reportType];
    if (!promptGenerator) {
        throw new Error(`Invalid report type specified: ${reportType}`);
    }

    const articlesContent = getArticlesContent(articles);
    const prompt = promptGenerator(articlesContent);

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.4,
                topP: 0.9,
                topK: 40,
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating focused report (${reportType}) with Gemini:`, error);
        throw new Error("Failed to generate focused report from AI model. Please check your API key and network connection.");
    }
};

export const generateFullReport = async (articles: RssArticle[]): Promise<string> => {
    const articlesContent = getArticlesContent(articles);
    const prompt = `You are a comprehensive cyber threat intelligence platform. Your task is to generate a full, multi-section intelligence report based ONLY on the provided articles. The report must be structured into the following three distinct sections, with each section clearly titled using Markdown headings (e.g., '## Key Security Alerts').

Crucially, you must cite the source for your claims. At the end of a sentence or paragraph that draws from a specific source, add a citation in the format [Article X], where X is the number of the source article. For example: "A new vulnerability was discovered [Article 3]." You can cite multiple sources like [Article 1][Article 4].

Here are the articles to analyze:
${articlesContent}

---

## Key Security Alerts
As a senior analyst in a Security Operations Center (SOC), extract critical, actionable security alerts. Focus on:
- Specific vulnerabilities and CVE identifiers (e.g., CVE-2023-XXXXX).
- Malware families, threat actor groups, or specific tools.
- Patches, mitigations, or recommended actions for defenders.
Format this section as a series of bullet points.

---

## Major Cyber Incidents
As a cyber threat intelligence analyst, report on the most significant cyber incidents mentioned. For each incident, detail:
- The victim(s) and their industry.
- The suspected threat actor or group.
- The impact of the incident (e.g., data breach, operational disruption).
Synthesize information from multiple articles if they cover the same event.

---

## Strategic Impact Assessment
As a strategic risk advisor for a large, global conglomerate, analyze the intelligence to assess potential impact. Focus on:
- Broad trends that could affect multiple business units.
- Supply chain risks or threats to third-party vendors.
- High-level recommendations for adjusting security posture.
This analysis should be strategic and forward-looking for a C-suite audience.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.4,
                topP: 0.9,
                topK: 40,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating full report with Gemini:", error);
        throw new Error("Failed to generate full report from AI model. Please check your API key and network connection.");
    }
};

export const generateCustomReport = async (articles: RssArticle[], sourceNames: string[]): Promise<string> => {
    const articlesContent = getArticlesContent(articles);
    const prompt = `You are a comprehensive cyber threat intelligence platform generating a custom report based on a user-defined list of sources. Your analysis must synthesize information ONLY from the provided articles.

The report is being generated from the following sources: ${sourceNames.join(', ')}.

The report must be structured into the following three distinct sections, with each section clearly titled using Markdown headings (e.g., '## Key Security Alerts'). Crucially, you must cite the source for your claims. At the end of a sentence or paragraph that draws from a specific source, add a citation in the format [Article X], where X is the number of the source article. For example: "A new vulnerability was discovered [Article 3]."

Here are the articles to analyze:
${articlesContent}

---

## Key Security Alerts
As a senior analyst in a Security Operations Center (SOC), extract critical, actionable security alerts from the combined sources. Focus on:
- Specific vulnerabilities and CVE identifiers.
- Malware families, threat actor groups, or specific tools.
- Patches, mitigations, or recommended actions for defenders.
Format this section as a series of bullet points.

---

## Major Cyber Incidents
As a cyber threat intelligence analyst, report on the most significant cyber incidents mentioned across the combined sources. For each incident, detail:
- The victim(s) and their industry.
- The suspected threat actor or group.
- The impact of the incident.
Synthesize information from multiple articles if they cover the same event.

---

## Strategic Impact Assessment
As a strategic risk advisor for a large, global conglomerate, analyze the combined intelligence to assess potential impact. Focus on:
- Broad trends emerging from the selected sources.
- Overlapping risks or corroborated threats.
- High-level recommendations for adjusting security posture based on this custom intel set.
This analysis should be strategic and forward-looking for a C-suite audience.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.4,
                topP: 0.9,
                topK: 40,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating custom report with Gemini:", error);
        throw new Error("Failed to generate custom report from AI model. Please check your API key and network connection.");
    }
};

export const generateReportFromSelection = async (articles: RssArticle[]): Promise<string> => {
    const articlesContent = getArticlesContent(articles);
    const prompt = `You are a comprehensive cyber threat intelligence platform. Your task is to generate a full, multi-section intelligence report based ONLY on the following hand-picked selection of articles provided by a user. The report must be structured into three distinct sections, with each section clearly titled using Markdown headings (e.g., '## Key Security Alerts').

Crucially, you must cite the source for your claims. At the end of a sentence or paragraph that draws from a specific source, add a citation in the format [Article X], where X is the number of the source article.

Here are the articles to analyze:
${articlesContent}

---

## Key Security Alerts
Extract critical, actionable security alerts from the provided articles. Focus on vulnerabilities, CVEs, malware, threat actors, and recommended mitigations. Format as bullet points.

---

## Major Cyber Incidents
Report on the most significant cyber incidents mentioned. Detail victims, threat actors, and impact. Synthesize information if multiple articles cover the same event.

---

## Synthesized Analysis
Provide a cohesive, high-level analysis of the combined articles. Identify connections, overarching themes, or emerging trends from this curated selection. This analysis should be strategic and forward-looking.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.4,
                topP: 0.9,
                topK: 40,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating report from selection with Gemini:", error);
        throw new Error("Failed to generate report from AI model. Please check your API key and network connection.");
    }
};
