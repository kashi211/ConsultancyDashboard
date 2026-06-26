import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  convertInchesToTwip,
} from "docx";
import fs from "fs";

const DARK = "1E1E2E";
const CODE_BG = "2A2A3E";
const ACCENT = "6366F1";
const WHITE = "FFFFFF";
const GRAY = "6B7280";
const GREEN = "10B981";
const AMBER = "F59E0B";

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    run: { color: DARK, bold: true },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    run: { color: ACCENT },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: DARK, size: 22 })],
    spacing: { before: 240, after: 80 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: "374151", size: 20 })],
    spacing: { before: 40, after: 80 },
  });
}

function badge(method) {
  const colors = { GET: "059669", POST: "2563EB", PATCH: "D97706", DELETE: "DC2626" };
  return new TextRun({ text: ` ${method} `, bold: true, color: WHITE, highlight: undefined, size: 18,
    shading: { type: ShadingType.SOLID, color: colors[method] || GRAY } });
}

function methodLine(method, path) {
  return new Paragraph({
    children: [badge(method), new TextRun({ text: `  ${path}`, font: "Courier New", size: 20, color: DARK })],
    spacing: { before: 160, after: 80 },
  });
}

function codeBlock(lines) {
  return new Paragraph({
    children: [new TextRun({ text: lines, font: "Courier New", size: 18, color: "A5F3FC" })],
    shading: { type: ShadingType.SOLID, color: CODE_BG },
    spacing: { before: 60, after: 120 },
    indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
  });
}

function fieldTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["Field", "Type", "Required", "Description"].map(h =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: WHITE, size: 18 })] })],
            shading: { type: ShadingType.SOLID, color: ACCENT },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
          })
        ),
      }),
      ...rows.map((r, i) =>
        new TableRow({
          children: r.map(cell =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, color: DARK, font: typeof cell === "string" && cell.startsWith("`") ? "Courier New" : undefined })] })],
              shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "F9FAFB" : WHITE },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
            })
          ),
        })
      ),
    ],
  });
}

function spacer() {
  return new Paragraph({ text: "", spacing: { before: 80, after: 80 } });
}

function divider() {
  return new Paragraph({
    text: "",
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" } },
    spacing: { before: 160, after: 160 },
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 20, color: "1E1E2E" } },
    },
  },
  sections: [{
    properties: { page: { margin: { top: 900, bottom: 900, left: 1080, right: 1080 } } },
    children: [

      // ── Title ──
      new Paragraph({
        children: [new TextRun({ text: "Consultancy Dashboard — API Reference", bold: true, size: 48, color: ACCENT })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Internal API documentation for all dashboard endpoints", size: 20, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Base URL: https://consultancy-dashboard-xi.vercel.app/api`, font: "Courier New", size: 18, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
      divider(),

      // ── 1. Opportunities (Pitches) ──
      h1("1. Opportunities (Pitches)"),
      body("Manages all pitch/freelance/job opportunities shown on the Pitches dashboard."),

      h2("List all opportunities"),
      methodLine("GET", "/api/opportunities"),
      body("Returns all opportunities ordered by creation date (newest first). Optionally filter by type."),
      h3("Query parameters"),
      fieldTable([
        ["`type`", "string", "No", "Filter by type: freelance | pitch | job"],
      ]),
      h3("Example response"),
      codeBlock(`[
  {
    "id": 1,
    "title": "AI Workflow Automation for SaaS",
    "type": "pitch",
    "status": "pending",
    "pitch": "We build custom Claude-powered ...",
    "jobLink": "https://upwork.com/...",
    "mvpLink": null,
    "budget": "$500–$1,000",
    "deadline": null,
    "skills": "Python, Claude API, Next.js",
    "author": "Kashish",
    "rank": 4,
    "createdAt": "2025-06-20T10:00:00Z",
    "updatedAt": "2025-06-20T10:00:00Z"
  }
]`),
      spacer(),

      h2("Create opportunity"),
      methodLine("POST", "/api/opportunities"),
      h3("Request body"),
      fieldTable([
        ["`title`",    "string",  "Yes", "Job or project title"],
        ["`type`",     "string",  "Yes", "freelance | pitch | job"],
        ["`status`",   "string",  "No",  "pending (default) | pitch_approved | pitch_submitted | mvp_submitted | approved | in_progress | needs_edit | closed"],
        ["`pitch`",    "string",  "No",  "Pitch text / cover letter"],
        ["`jobLink`",  "string",  "No",  "Link to the job posting"],
        ["`mvpLink`",  "string",  "No",  "Link to the MVP demo"],
        ["`budget`",   "string",  "No",  "Budget range, e.g. $500–$1,000"],
        ["`deadline`", "string",  "No",  "Deadline text"],
        ["`skills`",   "string",  "No",  "Comma-separated required skills"],
        ["`author`",   "string",  "No",  "Defaults to Anonymous"],
        ["`rank`",     "integer", "No",  "Star rank 1–5, used for default sort"],
      ]),
      h3("Example"),
      codeBlock(`POST /api/opportunities
Content-Type: application/json

{
  "title": "AI Customer Support Bot",
  "type": "pitch",
  "status": "pending",
  "pitch": "We specialize in RAG-based support assistants...",
  "jobLink": "https://upwork.com/jobs/...",
  "budget": "$800–$1,500",
  "skills": "Claude API, Python, Pinecone",
  "rank": 5
}`),
      spacer(),

      h2("Update opportunity"),
      methodLine("PATCH", "/api/opportunities/:id"),
      body("Partially updates an opportunity. Send only the fields you want to change."),
      h3("Common use cases"),
      codeBlock(`// Approve pitch
PATCH /api/opportunities/42
{ "status": "pitch_approved" }

// Mark pitch submitted with link
PATCH /api/opportunities/42
{ "status": "pitch_submitted" }

// Submit MVP
PATCH /api/opportunities/42
{ "status": "mvp_submitted", "mvpLink": "https://demo.example.com" }

// Approve MVP
PATCH /api/opportunities/42
{ "status": "approved" }

// Set star rank
PATCH /api/opportunities/42
{ "rank": 4 }`),
      spacer(),

      h2("Delete opportunity"),
      methodLine("DELETE", "/api/opportunities/:id"),
      body("Permanently deletes the opportunity and all its comments."),
      divider(),

      // ── 2. Agent Logs ──
      h1("2. Agent Logs"),
      body("Logs actions taken by Claude agents. Only the last 5 days of data are retained — every POST automatically purges entries older than 5 days."),

      h2("List logs"),
      methodLine("GET", "/api/agent-logs"),
      body("Returns all logs from the last 5 days, ordered by creation time (newest first)."),
      h3("Example response"),
      codeBlock(`[
  {
    "id": 12,
    "agent": "claude",
    "action": "Generated pitch for AI Customer Support job",
    "details": "Used Claude Sonnet 4.6, 3 revisions",
    "status": "success",
    "createdAt": "2025-06-26T09:15:00Z"
  },
  {
    "id": 11,
    "agent": "claude",
    "action": "Fetched Upwork job listings",
    "details": null,
    "status": "info",
    "createdAt": "2025-06-26T09:10:00Z"
  }
]`),
      spacer(),

      h2("Create log entry"),
      methodLine("POST", "/api/agent-logs"),
      body("Inserts a new log entry and automatically deletes any entries older than 5 days."),
      h3("Request body"),
      fieldTable([
        ["`action`",  "string", "Yes", "Short description of what the agent did"],
        ["`agent`",   "string", "No",  "Agent identifier — defaults to 'claude'"],
        ["`status`",  "string", "No",  "info (default) | success | warning | error"],
        ["`details`", "string", "No",  "Extra context, stack trace, or output snippet"],
      ]),
      h3("Status values"),
      fieldTable([
        ["`info`",    "Informational — general actions with no outcome yet"],
        ["`success`", "Action completed successfully"],
        ["`warning`", "Completed but with caveats or partial results"],
        ["`error`",   "Action failed"],
      ].map(r => r.length === 2 ? [r[0], "", "", r[1]] : r)),
      h3("Example — log a successful pitch generation"),
      codeBlock(`POST /api/agent-logs
Content-Type: application/json

{
  "action": "Generated pitch for AI Workflow Automation job",
  "agent": "claude",
  "status": "success",
  "details": "Pitch length: 420 chars. Model: claude-sonnet-4-6"
}`),
      h3("Example — log an error"),
      codeBlock(`POST /api/agent-logs
Content-Type: application/json

{
  "action": "Failed to fetch job listings",
  "status": "error",
  "details": "Error: 429 Too Many Requests from Upwork API"
}`),
      h3("Example response (201 Created)"),
      codeBlock(`{
  "id": 13,
  "agent": "claude",
  "action": "Generated pitch for AI Workflow Automation job",
  "details": "Pitch length: 420 chars. Model: claude-sonnet-4-6",
  "status": "success",
  "createdAt": "2025-06-26T09:20:00Z"
}`),
      body("Note: logs older than 5 days are deleted automatically on every POST. The GET endpoint also only returns the last 5 days."),
      divider(),

      // ── 3. Tasks ──
      h1("3. Tasks"),
      body("Kanban tasks with statuses: todo, in_progress, done, blocked."),

      h2("List all tasks"),
      methodLine("GET", "/api/tasks"),
      h3("Example response"),
      codeBlock(`[
  {
    "id": 1,
    "title": "Set up Claude agent workflow",
    "description": "Wire up the AgentOS pipeline",
    "status": "in_progress",
    "priority": "high",
    "assignee": "Kashish",
    "dueDate": "2025-07-01",
    "createdAt": "...",
    "updatedAt": "..."
  }
]`),
      spacer(),

      h2("Create task"),
      methodLine("POST", "/api/tasks"),
      fieldTable([
        ["`title`",       "string", "Yes", "Task title"],
        ["`description`", "string", "No",  "Details"],
        ["`status`",      "string", "No",  "todo | in_progress | done | blocked"],
        ["`priority`",    "string", "No",  "low | medium | high"],
        ["`assignee`",    "string", "No",  "Name of person responsible"],
        ["`dueDate`",     "string", "No",  "YYYY-MM-DD"],
      ]),
      spacer(),

      h2("Update task"),
      methodLine("PATCH", "/api/tasks/:id"),
      body("Send any subset of the fields above to update."),

      h2("Delete task"),
      methodLine("DELETE", "/api/tasks/:id"),
      divider(),

      // ── 4. Notes ──
      h1("4. Notes"),

      h2("List notes"),
      methodLine("GET", "/api/notes"),
      body("Returns notes ordered by pinned desc, then updatedAt desc."),

      h2("Create note"),
      methodLine("POST", "/api/notes"),
      fieldTable([
        ["`title`",   "string",  "No", "Note title — defaults to 'Untitled'"],
        ["`content`", "string",  "No", "Note body text"],
        ["`color`",   "string",  "No", "white | yellow | blue | green | pink | purple | orange"],
        ["`pinned`",  "integer", "No", "1 = pinned, 0 = unpinned (default)"],
      ]),

      h2("Update note"),
      methodLine("PATCH", "/api/notes/:id"),

      h2("Delete note"),
      methodLine("DELETE", "/api/notes/:id"),
      divider(),

      // ── 5. Notices ──
      h1("5. Notices (Editable callouts)"),
      body("Key-value editable text blocks, e.g. the pitch criteria notice."),

      h2("Get notice by key"),
      methodLine("GET", "/api/notices/:key"),
      h3("Example"),
      codeBlock(`GET /api/notices/pitch_criteria`),

      h2("Update notice"),
      methodLine("PATCH", "/api/notices/:key"),
      codeBlock(`PATCH /api/notices/pitch_criteria
Content-Type: application/json

{ "content": "Updated criteria text here..." }`),
      body("Creates the notice if it doesn't exist (upsert)."),
      divider(),

      // ── 6. Services ──
      h1("6. Services"),

      h2("List / Create / Update / Delete"),
      methodLine("GET",    "/api/services"),
      methodLine("POST",   "/api/services"),
      methodLine("PATCH",  "/api/services/:id"),
      methodLine("DELETE", "/api/services/:id"),
      fieldTable([
        ["`name`",        "string", "Yes", "Service name"],
        ["`description`", "string", "No",  "What the service does"],
        ["`url`",         "string", "No",  "Service URL"],
        ["`status`",      "string", "No",  "active | evaluating | cancelled"],
        ["`cost`",        "string", "No",  "Monthly cost or pricing"],
        ["`category`",    "string", "No",  "Grouping label"],
      ]),
      divider(),

      // ── 7. Portfolio ──
      h1("7. Portfolio"),

      h2("List / Create / Update / Delete"),
      methodLine("GET",    "/api/portfolio"),
      methodLine("POST",   "/api/portfolio"),
      methodLine("PATCH",  "/api/portfolio/:id"),
      methodLine("DELETE", "/api/portfolio/:id"),
      fieldTable([
        ["`title`",       "string", "Yes", "Project title"],
        ["`description`", "string", "No",  "Project description"],
        ["`url`",         "string", "No",  "Live URL"],
        ["`repoUrl`",     "string", "No",  "GitHub repo URL"],
        ["`skills`",      "string", "No",  "Comma-separated tech stack"],
      ]),
      divider(),

      new Paragraph({
        children: [new TextRun({ text: `Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Consultancy Dashboard Internal Docs`, size: 16, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("API_Documentation.docx", buffer);
console.log("API_Documentation.docx updated.");
