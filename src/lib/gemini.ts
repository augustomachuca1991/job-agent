const MODEL_URL = import.meta.env.VITE_GEMINI_MODEL_URL;
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function callGemini(prompt: string): Promise<string> {
  const url = `${MODEL_URL}:generateContent?key=${API_KEY}`;

  if (!MODEL_URL || !API_KEY) {
    throw new Error("Faltan VITE_GEMINI_MODEL_URL o VITE_GEMINI_API_KEY en .env");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = `Gemini error ${res.status}`;
    try {
      const j = JSON.parse(text);
      msg = j.error?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini devolvió una respuesta vacía");
  return text;
}

export const INTERVIEW_PROMPT_TEMPLATE = `Genera una guía de preparación para una entrevista técnica para el siguiente puesto.

## Perfil del candidato
{{PROFILE}}

## Puesto
- Empresa: {{COMPANY_NAME}}
- Título: {{JOB_TITLE}}
- Descripción: {{JOB_DESCRIPTION}}

Genera SOLO preguntas técnicas con sus respuestas, en formato Markdown. Sin introducciones ni despedidas.

Para cada pregunta:
- **Pregunta**: [formula la pregunta técnica]
- **Respuesta**: [respuesta concisa y correcta con ejemplos de código si aplica]

Cubre las áreas técnicas más relevantes para este puesto específico. Usa español.

Formato de salida:
## [Área técnica]

### Pregunta 1: [pregunta]
**Respuesta:** [respuesta]

### Pregunta 2: [pregunta]
**Respuesta:** [respuesta]`;

export const CV_PROMPT_TEMPLATE = `You are an expert ATS resume writer and technical recruiter.

Candidate Master CV:

{{MASTER_CV}}

Target Role:

{{TARGET_ROLE}}

Job Description:

{{JOB_DESCRIPTION}}

Task:

Create a tailored ATS-friendly resume specifically optimized for this job opportunity.

Requirements:

* Maximum 2 pages.
* Use professional resume formatting in Markdown.
* Highlight only relevant experience.
* Reorder technologies according to relevance.
* Prioritize matching skills and achievements.
* Use concise bullet points.
* Focus on measurable impact whenever possible.
* Keep all information truthful.
* Do not invent technologies, projects, certifications or responsibilities.
* Remove irrelevant information when appropriate.
* Adapt the professional summary to the target role.

Role Optimization:

If Target Role is Backend:
* Prioritize Laravel.
* Prioritize PHP.
* Prioritize Node.js.
* Prioritize NestJS.
* Prioritize PostgreSQL.
* Prioritize REST API development.
* Prioritize backend architecture.

If Target Role is Frontend:
* Prioritize React.
* Prioritize Vue.js.
* Prioritize TypeScript.
* Prioritize Tailwind CSS.
* Prioritize UI development.
* Prioritize frontend performance and usability.

If Target Role is DevOps:
* Prioritize Docker.
* Prioritize Docker Compose.
* Prioritize AWS.
* Prioritize GitHub Actions.
* Prioritize Linux administration.
* Prioritize deployment and infrastructure experience.

If Target Role is Full Stack:
* Balance frontend and backend experience.
* Highlight end-to-end feature development.
* Highlight API integrations.
* Highlight database experience.

Resume Structure:

1. Professional Summary
2. Technical Skills
3. Professional Experience
4. Projects (if relevant)
5. Education
6. Languages

Output Rules:

* Return Markdown only.
* Do not use code fences.
* Do not include explanations.
* Do not include notes.
* Do not include placeholders.
* Output only the final resume.`;
