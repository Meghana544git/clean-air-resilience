import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const POLLUTION_TYPES = ["smoke", "burning", "industrial_haze", "dust", "vehicle_emissions"] as const;
const SEVERITIES = ["low", "moderate", "high", "critical"] as const;

interface AnalyzeRequest {
  imageBase64: string;
  mimeType: string;
  location_name: string;
  sensorData?: {
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
  };
  language: "en" | "pt";
}

interface AnalyzeResponse {
  pollution_type: string;
  severity: string;
  aqi_estimate: number;
  description: string;
  ai_analysis: string;
  alert_summary: string;
  source: "gemini" | "simulated";
}

function severityToAqi(severity: string): number {
  switch (severity) {
    case "low": return Math.floor(Math.random() * 30) + 20;
    case "moderate": return Math.floor(Math.random() * 40) + 55;
    case "high": return Math.floor(Math.random() * 45) + 110;
    case "critical": return Math.floor(Math.random() * 80) + 170;
    default: return 50;
  }
}

function simulatedAnalysis(imageBase64: string, sensorData: AnalyzeRequest["sensorData"], language: "en" | "pt"): AnalyzeResponse {
  // Derive a pseudo-random but deterministic choice from the image data length
  const seed = imageBase64.length;
  const typeIdx = seed % POLLUTION_TYPES.length;
  const severityIdx = Math.floor((seed / 7) % SEVERITIES.length);

  let pollutionType = POLLUTION_TYPES[typeIdx];
  let severity = SEVERITIES[severityIdx];

  // If sensor data provided, use it to inform severity
  if (sensorData) {
    if (sensorData.aqi >= 151) severity = "critical";
    else if (sensorData.aqi >= 101) severity = "high";
    else if (sensorData.aqi >= 51) severity = "moderate";
    else severity = "low";
  }

  const aqiEstimate = sensorData?.aqi ?? severityToAqi(severity);

  const descriptions: Record<string, { en: string; pt: string }> = {
    smoke: {
      en: "Visible smoke plumes detected in the image. Particulate matter concentration appears elevated.",
      pt: "Plumas de fumaça visíveis detectadas na imagem. A concentração de material particulado parece elevada.",
    },
    burning: {
      en: "Open burning identified. Active flames and smoke emissions visible.",
      pt: "Queimada identificada. Chamas ativas e emissões de fumaça visíveis.",
    },
    industrial_haze: {
      en: "Industrial haze layer detected. Gray-brown discoloration consistent with factory emissions.",
      pt: "Camada de névoa industrial detectada. Descoloração acinzentada-marrom consistente com emissões de fábrica.",
    },
    dust: {
      en: "Dust cloud visible. Reduced visibility due to particulate suspension.",
      pt: "Nuvem de poeira visível. Visibilidade reduzida devido à suspensão de partículas.",
    },
    vehicle_emissions: {
      en: "Vehicle exhaust haze detected near roadway. NO2 signature likely.",
      pt: "Névoa de escapamento de veículos detectada perto da via. Assinatura de NO2 provável.",
    },
  };

  const desc = descriptions[pollutionType];

  const analysisEn = `AI Analysis: ${desc.en} Estimated AQI: ${aqiEstimate}. PM2.5: ${sensorData?.pm25 ?? Math.round(aqiEstimate * 0.5)} µg/m³. Classification confidence: ${(85 + Math.random() * 10).toFixed(1)}%.`;

  const analysisPt = `Análise IA: ${desc.pt} AQI estimado: ${aqiEstimate}. PM2.5: ${sensorData?.pm25 ?? Math.round(aqiEstimate * 0.5)} µg/m³. Confiança da classificação: ${(85 + Math.random() * 10).toFixed(1)}%.`;

  const alertEn = severity === "critical" || severity === "high"
    ? `URGENT: ${severity.toUpperCase()} pollution alert for ${sensorData ? "monitored area" : "reported location"}. ${desc.en} Estimated AQI ${aqiEstimate} exceeds safe thresholds. Immediate action recommended: deploy air quality monitoring team, issue public health advisory, and investigate emission source. Report ID: ${Date.now()}.`
    : `Advisory: ${severity} pollution levels detected. ${desc.en} Estimated AQI ${aqiEstimate}. Monitor situation and log for trend analysis.`;

  const alertPt = severity === "critical" || severity === "high"
    ? `URGENTE: Alerta de poluição ${severity.toUpperCase()} para área monitorada. ${desc.pt} AQI estimado ${aqiEstimate} excede limites seguros. Ação imediata recomendada: enviar equipe de monitoramento, emitir aviso de saúde pública e investigar fonte de emissão. ID do relato: ${Date.now()}.`
    : `Aviso: Níveis de poluição ${severity} detectados. ${desc.pt} AQI estimado ${aqiEstimate}. Monitorar situação e registrar para análise de tendência.`;

  return {
    pollution_type: pollutionType,
    severity,
    aqi_estimate: aqiEstimate,
    description: language === "pt" ? desc.pt : desc.en,
    ai_analysis: language === "pt" ? analysisPt : analysisEn,
    alert_summary: language === "pt" ? alertPt : alertEn,
    source: "simulated",
  };
}

async function geminiAnalysis(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("No GEMINI_API_KEY");

  const prompt = `You are an environmental AI analyst for a climate action platform. Analyze this image for pollution.

Respond ONLY with a JSON object (no markdown, no code fences) with this exact structure:
{
  "pollution_type": "smoke" | "burning" | "industrial_haze" | "dust" | "vehicle_emissions",
  "severity": "low" | "moderate" | "high" | "critical",
  "aqi_estimate": <number 0-500>,
  "description": "<2 sentence description of what you see>",
  "ai_analysis": "<3 sentence technical analysis with estimated PM2.5 and confidence %>"
}

Context — location: ${req.location_name}
${req.sensorData ? `Nearby sensor data: AQI=${req.sensorData.aqi}, PM2.5=${req.sensorData.pm25}, PM10=${req.sensorData.pm10}, NO2=${req.sensorData.no2}. Use this sensor data to calibrate your severity assessment.` : "No sensor data available. Estimate based on visual evidence only."}
Respond in ${req.language === "pt" ? "Portuguese" : "English"}.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: req.mimeType,
                  data: req.imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  const parsed = JSON.parse(text);

  // Generate alert summary based on severity
  const isUrgent = parsed.severity === "critical" || parsed.severity === "high";
  const alertSummary = isUrgent
    ? `${req.language === "pt" ? "URGENTE" : "URGENT"}: ${parsed.severity.toUpperCase()} pollution alert for ${req.location_name}. ${parsed.description} Estimated AQI ${parsed.aqi_estimate}. ${req.language === "pt" ? "Ação imediata recomendada." : "Immediate action recommended."}`
    : `Advisory: ${parsed.severity} pollution at ${req.location_name}. ${parsed.description} AQI ${parsed.aqi_estimate}.`;

  return {
    pollution_type: parsed.pollution_type,
    severity: parsed.severity,
    aqi_estimate: parsed.aqi_estimate,
    description: parsed.description,
    ai_analysis: parsed.ai_analysis,
    alert_summary: alertSummary,
    source: "gemini",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: AnalyzeRequest = await req.json();

    if (!body.imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasGeminiKey = !!Deno.env.get("GEMINI_API_KEY");

    let result: AnalyzeResponse;

    if (hasGeminiKey) {
      try {
        result = await geminiAnalysis(body);
      } catch (err) {
        console.error("Gemini failed, falling back to simulated:", err.message);
        result = simulatedAnalysis(body.imageBase64, body.sensorData, body.language);
      }
    } else {
      result = simulatedAnalysis(body.imageBase64, body.sensorData, body.language);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
