# Clinical Note Structuring Tool

An AI-assisted clinical documentation system that converts unstructured clinical notes and PDFs into structured medical summaries with an editable, admission-ready Revised HPI.

---

## 1. Architecture Overview

The system follows a simple full-stack architecture:

### Flow:
1. User uploads PDFs or pastes clinical notes
2. Frontend extracts text (if PDF)
3. Data is sent to backend API route
4. Gemini generates structured clinical output
5. Result is stored in Supabase
6. User can edit and re-save structured cases

---

## 2. Tech Stack Choices and Why

### Frontend: Next.js (App Router)
- Enables full-stack architecture in one framework
- File-based routing simplifies API + UI integration
- Easy deployment on Vercel

### Backend: Next.js API Routes
- Lightweight serverless functions
- Avoids need for separate backend service
- Ideal for AI orchestration workflows

### Database: Supabase (PostgreSQL + JSONB)
- JSONB chosen for flexible clinical schemas
- Easier to store evolving structured medical outputs
- Built-in API layer reduces backend complexity

### AI Model: Google Gemini (2.5 Pro / Flash)
- Strong structured output performance
- Good balance of speed and clinical summarization quality

### PDF Processing: pdfjs-dist
- Direct browser-side PDF parsing
- Avoids backend file handling complexity

---

## 3. How Clinical Notes Are Structured

Raw input (either pasted or extracted from PDFs) is converted into a standardized schema:

- Chief Complaint
- HPI Summary
- Key Findings
- Suspected Condition(s)
- Disposition Recommendation
  - Admit / Observe / Discharge / Unknown
- Uncertainties / Missing Information
- Revised HPI (generated narrative)

The schema is enforced through prompt engineering and validated JSON output from the LLM.

---

## 4. How the Revised HPI is Generated

The Revised HPI is generated using a structured prompt sent to Gemini.

The model is instructed to:
- Reconstruct the clinical story in a coherent, admission-ready format
- Prioritize clinical relevance over verbosity
- Emphasize symptoms, timeline, and risk factors
- Align with suspected diagnosis and disposition

The output is explicitly constrained to ensure:
- No hallucinated facts
- Only transformations of provided input
- Clinical tone consistency

---

## 5. Handling Uncertainty or Missing Information

The model is explicitly prompted to:
- Flag missing or ambiguous clinical details
- Separate confirmed findings from uncertain ones
- Avoid assumptions or fabrication

Output includes a dedicated field:

- **Uncertainties / Missing Information**

This ensures:
- Clinical transparency
- Safe downstream interpretation
- Reduced hallucination risk

---

## 6. How to Run Locally

### 1. Clone repository
```bash
git clone https://github.com/your-username/clinical-note-tool.git
cd clinical-note-tool

### 2. Install dependencies
npm install

### 3. Create env variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
MY_API_KEY=your_gemini_api_key

### 4. Run development server
npm run dev

---

## 7. Deployment Link

https://clinical-note-tool-oql3.vercel.app/

---

## 8. AI Tools
#### Google Gemini
- Core engine for structured clinical transformation (Model 2.5-pro)
- Used for:
	- Clinical summarization
	- HPI rewriting
	- Classification of findings and diagnoses
	- Prompt Engineering Techniques
	- Strict JSON schema enforcement
	- Role-based prompting (“you are a clinical assistant” style instructions)
	- Explicit constraints against hallucination
	- Token limit tuning to avoid truncation errors
	
### Additional tools:

#### Prompts used for frontend scaffolding and text parsing
- Used Claude to build the main page UI (src/app/page.js), the saved cases list, and the individual case view page
- For text parsing, prompted Gemini to return structured JSON output from clinical notes with specific fields
- Iteratively refined the Gemini prompt by testing against real case example A until output matched expected format

#### Which parts were AI-generated

- Initial frontend scaffolding for all three pages
- The Gemini API route (src/app/api/generate/route.js)
- The save and retrieve API routes, PDF text extraction logic
- Help with debugging

#### Which parts you manually implemented or modified

- System deisgn logic
- Creating Supabase database
- Connecting entire application
- Debugging and fixing application
- Prompting Gemini model to produce outputs
- Switching model & token limit to adjust to errors

#### How you verified correctness

- Tested generation end-to-end with real ER note and H&P PDFs
- Caught and fixed JSON truncation errors by validating API responses with try/catch
- Gave specific prompt instructions to ensure correctness
- Manually reviewed structured output fields against source documents to check for hallucination
- Tested save, edit, and retrieve flow for each case after every major change

---

## 8. Improvements
- There were things I wanted to implement but couldn't due to time constraints
- The UI could have looked more professional and been more consistent throughout application
- PDF rendering was supposed to be a button with output instead of full display
- Highlight of edited text also an original function
