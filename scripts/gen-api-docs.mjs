import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  convertInchesToTwip,
} from "docx";
import fs from "fs";

const DARK   = "1E1E2E";
const CODE_BG= "2A2A3E";
const ACCENT = "6366F1";
const WHITE  = "FFFFFF";
const GRAY   = "6B7280";

function h1(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    run: { color: DARK, bold: true },
  });
}
function h2(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_2,
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
  const colors = { GET:"059669", POST:"2563EB", PATCH:"D97706", DELETE:"DC2626" };
  return new TextRun({ text: ` ${method} `, bold:true, color:WHITE, size:18,
    shading:{ type:ShadingType.SOLID, color: colors[method]||GRAY } });
}
function methodLine(method, path) {
  return new Paragraph({
    children: [badge(method), new TextRun({ text:`  ${path}`, font:"Courier New", size:20, color:DARK })],
    spacing: { before:160, after:80 },
  });
}
function codeBlock(lines) {
  return new Paragraph({
    children: [new TextRun({ text:lines, font:"Courier New", size:18, color:"A5F3FC" })],
    shading: { type:ShadingType.SOLID, color:CODE_BG },
    spacing: { before:60, after:120 },
    indent: { left:convertInchesToTwip(0.2), right:convertInchesToTwip(0.2) },
  });
}
function fieldTable(rows) {
  const headers = ["Field","Type","Required","Description"];
  return new Table({
    width: { size:100, type:WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          children:[new Paragraph({ children:[new TextRun({text:h,bold:true,color:WHITE,size:18})] })],
          shading:{type:ShadingType.SOLID,color:ACCENT},
          margins:{top:60,bottom:60,left:100,right:100},
        })),
      }),
      ...rows.map((r,i) => new TableRow({
        children: r.map(cell => new TableCell({
          children:[new Paragraph({ children:[new TextRun({text:cell,size:18,color:DARK})] })],
          shading:{type:ShadingType.SOLID,color: i%2===0?"F9FAFB":WHITE},
          margins:{top:60,bottom:60,left:100,right:100},
        })),
      })),
    ],
  });
}
function spacer() { return new Paragraph({ text:"", spacing:{before:80,after:80} }); }
function divider() {
  return new Paragraph({
    text:"",
    border:{ bottom:{style:BorderStyle.SINGLE,size:1,color:"E5E7EB"} },
    spacing:{before:160,after:160},
  });
}

const doc = new Document({
  styles:{
    default:{ document:{ run:{ font:"Calibri", size:20, color:DARK } } },
  },
  sections:[{
    properties:{ page:{ margin:{top:900,bottom:900,left:1080,right:1080} } },
    children:[

      // Title
      new Paragraph({
        children:[new TextRun({text:"Consultancy Dashboard — API Reference",bold:true,size:48,color:ACCENT})],
        alignment:AlignmentType.CENTER,
        spacing:{before:200,after:100},
      }),
      new Paragraph({
        children:[new TextRun({text:"Complete internal API documentation for all dashboard endpoints",size:20,color:GRAY})],
        alignment:AlignmentType.CENTER,
        spacing:{after:60},
      }),
      new Paragraph({
        children:[new TextRun({text:"Base URL: https://consultancy-dashboard-xi.vercel.app/api",font:"Courier New",size:18,color:GRAY})],
        alignment:AlignmentType.CENTER,
        spacing:{after:300},
      }),
      divider(),

      // ── 1. Opportunities ──
      h1("1. Opportunities (Pitches)"),
      body("Manages all pitch/freelance/job opportunities shown on the Pitches dashboard."),

      h2("List all opportunities"),
      methodLine("GET","/api/opportunities"),
      body("Returns all opportunities ordered by creation date (newest first)."),
      h3("Query parameters"),
      fieldTable([
        ["`type`","string","No","Filter by type: freelance | pitch | job"],
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
    "budget": "$500-$1,000",
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
      methodLine("POST","/api/opportunities"),
      h3("Request body"),
      fieldTable([
        ["`title`",   "string", "Yes","Job or project title"],
        ["`type`",    "string", "Yes","freelance | pitch | job"],
        ["`status`",  "string", "No", "pending (default) | pitch_approved | pitch_submitted | mvp_submitted | approved | in_progress | needs_edit | closed"],
        ["`pitch`",   "string", "No", "Pitch text / cover letter"],
        ["`jobLink`", "string", "No", "Link to the job posting"],
        ["`mvpLink`", "string", "No", "Link to the MVP demo"],
        ["`budget`",  "string", "No", "Budget range e.g. $500-$1,000"],
        ["`deadline`","string", "No", "Deadline text"],
        ["`skills`",  "string", "No", "Comma-separated required skills"],
        ["`author`",  "string", "No", "Defaults to Anonymous"],
        ["`rank`",    "integer","No", "Star rank 1-5, used for default sort"],
      ]),
      spacer(),

      h2("Update opportunity"),
      methodLine("PATCH","/api/opportunities/:id"),
      body("Partially updates an opportunity. Send only the fields you want to change."),
      h3("Common use cases"),
      codeBlock(`// Advance through pipeline
PATCH /api/opportunities/42
{ "status": "pitch_approved" }

// Submit MVP link
PATCH /api/opportunities/42
{ "status": "mvp_submitted", "mvpLink": "https://demo.example.com" }

// Approve MVP / close deal
PATCH /api/opportunities/42
{ "status": "approved" }

// Set star rank
PATCH /api/opportunities/42
{ "rank": 5 }`),
      spacer(),

      h2("Delete opportunity"),
      methodLine("DELETE","/api/opportunities/:id"),
      body("Permanently deletes the opportunity and all its comments."),
      spacer(),

      h2("Opportunity comments"),
      methodLine("GET", "/api/opportunities/:id/comments"),
      body("Returns all comments for an opportunity ordered oldest-first."),
      spacer(),
      methodLine("POST","/api/opportunities/:id/comments"),
      fieldTable([
        ["`author`", "string","No", "Commenter name — defaults to Anonymous"],
        ["`content`","string","Yes","Comment text"],
        ["`parentId`","integer","No","ID of parent comment for threaded replies"],
      ]),
      divider(),

      // ── 2. Agent Logs ──
      h1("2. Agent Logs"),
      body("Logs actions taken by Claude agents. Only the last 5 days of data are retained — every POST automatically purges entries older than 5 days."),

      h2("List logs"),
      methodLine("GET","/api/agent-logs"),
      body("Returns all logs from the last 5 days, ordered newest-first."),
      h3("Example response"),
      codeBlock(`[
  {
    "id": 12,
    "agent": "claude",
    "action": "Generated pitch for AI Customer Support job",
    "details": "Used Claude Sonnet 4.6, 3 revisions",
    "status": "success",
    "createdAt": "2025-06-26T09:15:00Z"
  }
]`),
      spacer(),

      h2("Create log entry"),
      methodLine("POST","/api/agent-logs"),
      body("Inserts a new log and auto-deletes entries older than 5 days."),
      h3("Request body"),
      fieldTable([
        ["`action`", "string","Yes","Short description of what the agent did"],
        ["`agent`",  "string","No", "Agent identifier — defaults to 'claude'"],
        ["`status`", "string","No", "info (default) | success | warning | error"],
        ["`details`","string","No", "Extra context, stack trace, or output snippet"],
      ]),
      h3("Examples"),
      codeBlock(`// Log success
POST /api/agent-logs
{
  "action": "Generated pitch for AI Workflow Automation job",
  "status": "success",
  "details": "Pitch length: 420 chars. Model: claude-sonnet-4-6"
}

// Log an error
POST /api/agent-logs
{
  "action": "Failed to fetch job listings",
  "status": "error",
  "details": "Error: 429 Too Many Requests"
}`),
      divider(),

      // ── 3. Tasks ──
      h1("3. Tasks"),
      body("Kanban tasks with four status columns: todo, in_progress, done, blocked."),

      h2("List all tasks"),
      methodLine("GET","/api/tasks"),
      spacer(),

      h2("Create task"),
      methodLine("POST","/api/tasks"),
      fieldTable([
        ["`title`",      "string","Yes","Task title"],
        ["`description`","string","No", "Task details"],
        ["`status`",     "string","No", "todo | in_progress | done | blocked"],
        ["`priority`",   "string","No", "low | medium | high"],
        ["`assignee`",   "string","No", "Name of person responsible"],
        ["`dueDate`",    "string","No", "YYYY-MM-DD"],
      ]),
      spacer(),

      h2("Update task"),
      methodLine("PATCH","/api/tasks/:id"),
      body("Send any subset of the fields above to update."),
      spacer(),

      h2("Delete task"),
      methodLine("DELETE","/api/tasks/:id"),
      spacer(),

      h2("Task comments"),
      methodLine("GET", "/api/tasks/:id/comments"),
      body("Returns comments for a task ordered oldest-first."),
      spacer(),
      methodLine("POST","/api/tasks/:id/comments"),
      fieldTable([
        ["`author`", "string","No", "Defaults to Anonymous"],
        ["`content`","string","Yes","Comment text"],
        ["`parentId`","integer","No","Parent comment ID for threaded replies"],
      ]),
      divider(),

      // ── 4. Targets ──
      h1("4. Targets"),
      body("Short-term and long-term goals shown on the Home dashboard. Ordered by position for drag-to-reorder."),

      h2("List all targets"),
      methodLine("GET","/api/targets"),
      body("Returns targets ordered by position (ascending)."),
      spacer(),

      h2("Create target"),
      methodLine("POST","/api/targets"),
      fieldTable([
        ["`title`",      "string","Yes","Target title"],
        ["`description`","string","No", "Details"],
        ["`duration`",   "string","No", "e.g. '2 weeks', 'Q3 2025'"],
        ["`status`",     "string","No", "active (default) | completed | paused"],
        ["`term`",       "string","No", "short_term (default) | long_term"],
        ["`position`",   "integer","No","Sort order — defaults to 0"],
      ]),
      spacer(),

      h2("Update target"),
      methodLine("PATCH","/api/targets/:id"),
      body("Send any subset of the fields above to update."),
      spacer(),

      h2("Delete target"),
      methodLine("DELETE","/api/targets/:id"),
      spacer(),

      h2("Reorder targets"),
      methodLine("POST","/api/targets/reorder"),
      body("Updates the position of multiple targets in one call. Used by drag-and-drop."),
      fieldTable([
        ["`ids`","integer[]","Yes","Ordered array of target IDs — position is set to their index in this array"],
      ]),
      h3("Example"),
      codeBlock(`POST /api/targets/reorder
{ "ids": [5, 2, 8, 1] }
// target 5 gets position 0, target 2 gets position 1, etc.`),
      spacer(),

      h2("Target comments"),
      methodLine("GET", "/api/targets/:id/comments"),
      body("Returns comments for a target ordered oldest-first."),
      spacer(),
      methodLine("POST","/api/targets/:id/comments"),
      fieldTable([
        ["`author`", "string","No", "Defaults to Anonymous"],
        ["`content`","string","Yes","Comment text"],
      ]),
      divider(),

      // ── 5. Notes ──
      h1("5. Notes"),

      h2("List notes"),
      methodLine("GET","/api/notes"),
      body("Returns notes ordered by pinned desc, then updatedAt desc."),
      spacer(),

      h2("Create note"),
      methodLine("POST","/api/notes"),
      fieldTable([
        ["`title`",  "string", "No","Defaults to 'Untitled'"],
        ["`content`","string", "No","Note body text"],
        ["`color`",  "string", "No","white | yellow | blue | green | pink | purple | orange"],
        ["`pinned`", "integer","No","1 = pinned, 0 = unpinned (default)"],
      ]),
      spacer(),

      h2("Update note"),
      methodLine("PATCH","/api/notes/:id"),
      spacer(),

      h2("Delete note"),
      methodLine("DELETE","/api/notes/:id"),
      divider(),

      // ── 6. Mission ──
      h1("6. Mission"),
      body("Single-row text block shown on the Home page. Always uses id = 1."),

      h2("Get mission"),
      methodLine("GET","/api/mission"),
      h3("Example response"),
      codeBlock(`{
  "id": 1,
  "content": "Build and ship AI-powered tools...",
  "updatedAt": "2025-06-26T08:00:00Z"
}`),
      spacer(),

      h2("Update mission"),
      methodLine("PATCH","/api/mission"),
      fieldTable([
        ["`content`","string","Yes","New mission statement text"],
      ]),
      divider(),

      // ── 7. Notices ──
      h1("7. Notices (Editable callouts)"),
      body("Key-value editable text blocks. Currently used for the pitch criteria notice on the Pitches page."),

      h2("Get notice by key"),
      methodLine("GET","/api/notices/:key"),
      h3("Example"),
      codeBlock(`GET /api/notices/pitch_criteria`),
      spacer(),

      h2("Update notice"),
      methodLine("PATCH","/api/notices/:key"),
      body("Creates the notice if it does not exist (upsert by key)."),
      fieldTable([
        ["`content`","string","Yes","Notice text — supports **bold** markers for rich rendering"],
      ]),
      h3("Example"),
      codeBlock(`PATCH /api/notices/pitch_criteria
{ "content": "**Budget:** Minimum $300\\n**Skills:** Claude API required" }`),
      divider(),

      // ── 8. Ideas ──
      h1("8. Ideas"),
      body("Fully customizable idea board with status, priority, category, tags, color, and pin support."),

      h2("List ideas"),
      methodLine("GET","/api/ideas"),
      body("Returns all ideas ordered by pinned desc, then updatedAt desc."),
      h3("Query parameters"),
      fieldTable([
        ["`category`","string","No","Filter by category name"],
        ["`status`",  "string","No","Filter by status: idea | exploring | in_progress | done | shelved"],
      ]),
      h3("Example response"),
      codeBlock(`[
  {
    "id": 1,
    "title": "AI-powered lead scoring tool",
    "description": "Build a Claude agent that scores inbound leads...",
    "category": "product",
    "status": "exploring",
    "priority": "high",
    "color": "yellow",
    "tags": "ai, leads, automation",
    "pinned": 1,
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-07-01T12:30:00Z"
  }
]`),
      spacer(),

      h2("Create idea"),
      methodLine("POST","/api/ideas"),
      fieldTable([
        ["`title`",      "string", "No", "Idea title — defaults to empty string"],
        ["`description`","string", "No", "Full description of the idea"],
        ["`category`",   "string", "No", "Free-text category label — defaults to 'general'"],
        ["`status`",     "string", "No", "idea (default) | exploring | in_progress | done | shelved"],
        ["`priority`",   "string", "No", "low | medium (default) | high"],
        ["`color`",      "string", "No", "white (default) | yellow | blue | green | pink | purple | orange"],
        ["`tags`",       "string", "No", "Comma-separated tags e.g. 'ai, product, saas'"],
        ["`pinned`",     "integer","No", "1 = pinned, 0 = unpinned (default)"],
      ]),
      h3("Example"),
      codeBlock(`POST /api/ideas
{
  "title": "RAG pipeline for client onboarding docs",
  "description": "Ingest client-provided docs into Pinecone...",
  "category": "product",
  "status": "exploring",
  "priority": "high",
  "color": "blue",
  "tags": "rag, pinecone, onboarding"
}`),
      spacer(),

      h2("Update idea"),
      methodLine("PATCH","/api/ideas/:id"),
      body("Partially updates an idea. Send only the fields you want to change. updatedAt is always refreshed."),
      h3("Examples"),
      codeBlock(`// Move to in_progress
PATCH /api/ideas/3
{ "status": "in_progress" }

// Pin an idea
PATCH /api/ideas/3
{ "pinned": 1 }

// Update tags
PATCH /api/ideas/3
{ "tags": "ai, automation, v2" }`),
      spacer(),

      h2("Delete idea"),
      methodLine("DELETE","/api/ideas/:id"),
      body("Permanently deletes a single idea."),
      spacer(),

      h2("Delete all ideas"),
      methodLine("DELETE","/api/ideas"),
      body("Permanently deletes every idea. No confirmation required — use with care."),
      divider(),

      // ── 9. Services ──
      h1("9. Services"),


      h2("List / Create / Update / Delete"),
      methodLine("GET",   "/api/services"),
      methodLine("POST",  "/api/services"),
      methodLine("PATCH", "/api/services/:id"),
      methodLine("DELETE","/api/services/:id"),
      fieldTable([
        ["`name`",       "string","Yes","Service name"],
        ["`description`","string","No", "What the service does"],
        ["`url`",        "string","No", "Service URL"],
        ["`status`",     "string","No", "active | evaluating | cancelled"],
        ["`cost`",       "string","No", "Monthly cost or pricing"],
        ["`category`",   "string","No", "Grouping label"],
      ]),
      divider(),

      // ── 10. Portfolio ──
      h1("10. Portfolio"),

      h2("List / Create / Update / Delete"),
      methodLine("GET",   "/api/portfolio"),
      methodLine("POST",  "/api/portfolio"),
      methodLine("PATCH", "/api/portfolio/:id"),
      methodLine("DELETE","/api/portfolio/:id"),
      fieldTable([
        ["`title`",      "string","Yes","Project title"],
        ["`description`","string","No", "Project description"],
        ["`url`",        "string","No", "Live URL"],
        ["`repoUrl`",    "string","No", "GitHub repo URL"],
        ["`skills`",     "string","No", "Comma-separated tech stack"],
      ]),
      divider(),

      new Paragraph({
        children:[new TextRun({
          text:`Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} · Consultancy Dashboard Internal Docs`,
          size:16, color:GRAY,
        })],
        alignment:AlignmentType.CENTER,
        spacing:{before:400},
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("API_Documentation.docx", buffer);
console.log("Done — API_Documentation.docx updated.");
