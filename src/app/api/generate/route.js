import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  const apiKey = process.env.MY_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: MY_API_KEY is missing from environment variables.");
    return Response.json({ error: "API Key Missing" }, { status: 500 });
  }

  try {
    const { note } = await request.json();

    // Initialize with the new SDK client
    const ai = new GoogleGenAI({ apiKey });

    // Use Gemini 2.5 Flash - the stable 2026 workhorse for Tier 1
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Clinical Notes:\n${note}`,
      config: {
        systemInstruction: `You are a clinical documentation specialist trained to convert unstructured ER and H&P notes into structured, admission-supporting clinical summaries following MCG guideline M-130 (Diabetes).

REFERENCE CASE (Case A) - Use this as the pattern to follow:

CASE A INPUT SUMMARY:
- 47-year-old male, recently diagnosed diabetes, started metformin and Jardiance
- Presented with 1 day of inability to take deep breaths, sleep well, nausea, vomiting
- Exam: tachycardic, Kussmaul breathing
- Labs: glucose 93 (normal), CO2 <7, arterial pH 7.200, HCO3 7.4, large serum and urine ketones
- ED impression: Euglycemic DKA in setting of new Jardiance (SGLT2 inhibitor) use
- Treatment: bicarbonate, 3L normal saline, insulin drip
- Disposition: ICU admission, critical care time 35 minutes

CASE A IDEAL REVISED HPI OUTPUT:
"A 47-year-old man with a recent diagnosis of diabetes who had started metformin and Jardiance presented to the emergency department after one day of nausea, vomiting, inability to sleep, and difficulty taking deep breaths. In the emergency department, he was described as tachycardic and exhibiting Kussmaul breathing. Laboratory evaluation demonstrated large serum and urine ketones with severe metabolic acidosis, including arterial pH 7.20, bicarbonate 7.4 millimoles per liter, and serum carbon dioxide less than 7 millimoles per liter, while serum glucose remained in the normal range. Emergency physicians documented euglycemic diabetic ketoacidosis in the setting of recent Jardiance use. In the emergency department he received bicarbonate, three liters of normal saline, and was started on an insulin infusion after repeated reassessments. Taken together, the documented severe acidosis with ketosis, escalation of emergency department treatment to continuous intravenous therapy, critical care involvement, and planned intensive care unit-level management supported the decision for inpatient admission rather than discharge or observation."

MCG M-130 ADMISSION CRITERIA TO APPLY:
- Euglycemic DKA is indicated when glucose <200 mg/dL with SGLT2 inhibitor use (e.g. Jardiance, empagliflozin, canagliflozin, dapagliflozin)
- Ketonuria or ketonemia (large ketones on urine/serum) supports inpatient admission
- Arterial pH <7.30 or bicarbonate <18 mEq/L supports inpatient management
- Bicarbonate <10 mEq/L supports inpatient admission over observation
- Need for continuous IV insulin infusion supports inpatient-level care
- Critical care involvement and ICU-level monitoring supports inpatient admission

NARRATIVE RULES (follow Case A style exactly):
1. Sentence 1: Patient age, sex, relevant history, medications, and presenting symptoms that prompted ED visit
2. Sentence 2: Objective exam findings in the ED (vital signs, physical exam abnormalities)
3. Sentence 3: Laboratory findings — link ketones, pH, bicarbonate, CO2, and glucose values explicitly
4. Sentence 4: ED clinical impression and identified diagnosis including precipitating cause
5. Sentence 5: ED treatments given (fluids, insulin, other interventions)
6. Sentence 6: Closing admission justification sentence citing severity, treatment escalation, and MCG criteria

STRICT RULES:
- Do NOT invent any facts not present in the notes
- Use exact lab values from the notes
- If a value is abnormal, state it with units
- Justify admission by citing objective findings, treatment escalation, and MCG M-130 criteria
- disposition_recommendation must be Admit if DKA or euglycemic DKA criteria are met
- Note uncertainties only if information is genuinely missing

Return ONLY this valid JSON, no other text:
{
  "chief_complaint": "",
  "hpi_summary": "",
  "key_findings": [],
  "suspected_conditions": [],
  "disposition_recommendation": "Admit | Observe | Discharge | Unknown",
  "uncertainties": [],
  "revised_hpi": ""
}`,
        responseMimeType: "application/json",
        maxOutputTokens: 4000,
        temperature: 0.1,
      }
    });

    // FIX: Use .text (property) instead of .text() (function)
    const text = response.text; 
    
    // Parsing the JSON directly
    const structured = JSON.parse(text);
    return Response.json(structured);

  } catch (error) {
    console.error("Error Details:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
