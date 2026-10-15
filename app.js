const people = [
  { name: "Jordan Ellis", role: "Field Officer", initials: "JE", location: "Onsite", detail: "Riverside Plaza", reported: "8 min ago", stale: false },
  { name: "Maya Chen", role: "Shift Supervisor", initials: "MC", location: "Offsite", detail: "Status shared in Zenzap", reported: "22 min ago", stale: false },
  { name: "Darius Cole", role: "Field Officer", initials: "DC", location: "Onsite", detail: "Northgate — Lobby", reported: "18 min ago", stale: false },
  { name: "Alicia Brooks", role: "Field Officer", initials: "AB", location: "Unknown", detail: "No recent status message", reported: "Yesterday", stale: true },
  { name: "Noah Patel", role: "Field Officer", initials: "NP", location: "Offsite", detail: "Status shared in Zenzap", reported: "25 min ago", stale: false },
  { name: "Renee Smith", role: "Training Officer", initials: "RS", location: "Onsite", detail: "Training office", reported: "16 min ago", stale: false },
  { name: "Sierra Hawkins", role: "Field Officer", initials: "SH", location: "Unknown", detail: "Last status is out of date", reported: "2 days ago", stale: true },
];

const messages = [
  { id: 1, name: "Jordan Ellis", initials: "JE", subject: "Shift coverage for Friday", time: "9:42 AM", snippet: "I can cover the evening post if that still needs coverage.", text: "I can cover the evening post if that still needs coverage. Let me know what time you need me there.", tag: "Routine", tagClass: "green" },
  { id: 2, name: "Maya Chen", initials: "MC", subject: "Schedule change request", time: "9:18 AM", snippet: "Can I swap my Saturday shift with Noah?", text: "Can I swap my Saturday shift with Noah? We have not confirmed the change yet.", tag: "Needs review", tagClass: "amber" },
  { id: 3, name: "Darius Cole", initials: "DC", subject: "Site access issue", time: "8:56 AM", snippet: "The badge reader at Northgate is not working again.", text: "The badge reader at Northgate is not working again. I have reported it to the site contact.", tag: "Sensitive", tagClass: "red" },
  { id: 4, name: "Renee Smith", initials: "RS", subject: "Training check-in", time: "Yesterday", snippet: "The new officer finished the site orientation.", text: "The new officer finished the site orientation. I uploaded the checklist for the supervisor.", tag: "Routine", tagClass: "green" },
];

const approvals = [
  { kind: "Message reply", person: "Maya Chen", title: "Schedule change request", reason: "A shift swap affects coverage. Confirm the replacement and both officers before sending.", detail: "Draft: Thanks for checking. I’m confirming coverage before I update the schedule." },
  { kind: "Message reply", person: "Darius Cole", title: "Site access issue", reason: "Facilities or site-access issues need a supervisor response.", detail: "Draft: Thanks for the update. Please follow the site access procedure and let the supervisor know if coverage is affected." },
  { kind: "Schedule", person: "Northgate weekend", title: "Weekend coverage adjustment", reason: "The proposed change leaves one shift without a confirmed backup.", detail: "Saturday 18:00–00:00 needs a confirmed replacement before it can be published." },
];

let activeView = "overview";
let selectedMessageId = 1;
let generatedSchedule = false;
const messageDrafts = {};
let candidates = [
  { name: "Renee Taylor", role: "Security Officer", stage: "Interview", updated: "Today", initials: "RT" },
  { name: "Morgan Wells", role: "Security Officer", stage: "Screening", updated: "Today", initials: "MW" },
  { name: "Taylor Jackson", role: "Field Officer", stage: "Applied", updated: "Yesterday", initials: "TJ" },
  { name: "Cameron Price", role: "Security Officer", stage: "Documents", updated: "Oct 12", initials: "CP" },
  { name: "Jamie Rivera", role: "Field Officer", stage: "Onboarding", updated: "Oct 11", initials: "JR" },
];
let onboardingTasks = [
  { label: "Confirm identity and contact details", owner: "Renee Taylor", due: "Today", done: true },
  { label: "Collect required hiring documents", owner: "Morgan Wells", due: "Oct 16", done: false },
  { label: "Verify site-specific training", owner: "Jamie Rivera", due: "Oct 17", done: false },
  { label: "Assign field training officer", owner: "Jamie Rivera", due: "Oct 18", done: true },
];

const content = document.querySelector("#content");
const crumb = document.querySelector("#crumb");
const toastEl = document.querySelector("#toast");
let toastTimer;

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
}

function initialsAvatar(initials) {
  return `<span class="avatar">${initials}</span>`;
}

function heading(title, subtitle, action = "") {
  return `<div class="page-heading"><div><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ""}</div>`;
}

function panel(title, body, action = "") {
  return `<section class="panel"><div class="panel-head"><h2>${title}</h2>${action}</div><div class="panel-body">${body}</div></section>`;
}

function overviewView() {
  return `${heading("Welcome back, Sara", "Zephyr One Security — hiring, staffing, and field operations.", `<button class="btn" data-view="settings">⚙ Connections</button>`)}
    <div class="stat-grid">
      <article class="stat-card"><div class="stat-icon">▤</div><div><div class="stat-value">4</div><div class="stat-label">Messages to review</div></div></article>
      <article class="stat-card"><div class="stat-icon green">⌖</div><div><div class="stat-value">5 / 7</div><div class="stat-label">Recent team status reports</div></div></article>
      <article class="stat-card"><div class="stat-icon amber">▦</div><div><div class="stat-value">3</div><div class="stat-label">Schedule items for review</div></div></article>
      <article class="stat-card"><div class="stat-icon red">◷</div><div><div class="stat-value">2</div><div class="stat-label">Upcoming interviews</div></div></article>
    </div>
    <div class="callout" style="margin-bottom:16px"><span>ⓘ</span><span><strong>Preview only.</strong> These sample records demonstrate the workflow. Zenzap, Microsoft Teams, and Ollama are not connected; this preview will not send messages, publish schedules, or join calls.</span></div>
    <div class="grid-two">
      ${panel("Latest team status", `<div class="mini-list">${people.slice(0, 4).map(p => `<div class="mini-row">${initialsAvatar(p.initials)}<div class="mini-copy"><strong>${p.name}</strong><small>${p.detail} · ${p.reported}</small></div><span class="pill ${p.location === "Onsite" ? "green" : p.location === "Offsite" ? "blue" : "amber"}">${p.location}</span></div>`).join("")}</div>`, `<button class="text-button" data-view="locations">View all →</button>`)}
      ${panel("Needs your attention", `<div class="mini-list"><div class="mini-row"><span class="stat-icon amber">▤</span><div class="mini-copy"><strong>Schedule change request</strong><small>Maya Chen · shift swap</small></div><span class="pill amber">Review</span></div><div class="mini-row"><span class="stat-icon red">!</span><div class="mini-copy"><strong>Site access issue</strong><small>Darius Cole · Northgate</small></div><span class="pill red">Sensitive</span></div><div class="mini-row"><span class="stat-icon">▦</span><div class="mini-copy"><strong>Northgate weekend coverage</strong><small>One shift needs a backup</small></div><span class="pill amber">Review</span></div></div>`, `<button class="text-button" data-view="approvals">Open review queue →</button>`)}
    </div>
    <div class="grid-two">
      ${panel("Messages", `<div class="mini-list">${messages.slice(0, 3).map(m => `<div class="mini-row">${initialsAvatar(m.initials)}<div class="mini-copy"><strong>${m.name} · ${m.subject}</strong><small>${m.snippet}</small></div><span class="pill ${m.tagClass}">${m.tag}</span></div>`).join("")}</div>`, `<button class="text-button" data-view="inbox">Open inbox →</button>`)}
      ${panel("Upcoming interviews", `<div class="mini-list"><div class="mini-row"><span class="stat-icon">◷</span><div class="mini-copy"><strong>Candidate screening</strong><small>Today · 2:00 PM · AI disclosure required</small></div><span class="pill blue">Planned</span></div><div class="mini-row"><span class="stat-icon">◷</span><div class="mini-copy"><strong>Officer interview</strong><small>Tomorrow · 10:30 AM · Teams</small></div><span class="pill blue">Planned</span></div></div>`, `<button class="text-button" data-view="interviews">View interviews →</button>`)}
    </div>`;
}

function locationsView() {
  return `${heading("Team locations", "Onsite/offsite status from explicit Zenzap check-ins. No GPS or inferred location.", `<button class="btn" id="refresh-locations">↻ Refresh</button>`)}
    <div class="callout" style="margin-bottom:15px"><span>ⓘ</span><span>Status shown here must come from an explicit Zenzap message. Old or missing reports display as <strong>Unknown</strong>; the last reported time is shown for context. Sample data only until Zenzap is connected.</span></div>
    <div class="stat-grid">
      <article class="stat-card"><div class="stat-icon green">⌖</div><div><div class="stat-value">3</div><div class="stat-label">Reported onsite</div></div></article>
      <article class="stat-card"><div class="stat-icon">↗</div><div><div class="stat-value">2</div><div class="stat-label">Reported offsite</div></div></article>
      <article class="stat-card"><div class="stat-icon amber">?</div><div><div class="stat-value">2</div><div class="stat-label">Unknown / stale</div></div></article>
      <article class="stat-card"><div class="stat-icon">◷</div><div><div class="stat-value">30 min</div><div class="stat-label">Freshness window (example)</div></div></article>
    </div>
    <section class="panel">
      <div class="panel-head"><h2>Personnel check-ins</h2><div class="table-toolbar"><input class="search" id="people-search" placeholder="Search team..." aria-label="Search team"><select class="filter" id="location-filter" aria-label="Filter location"><option value="All">All statuses</option><option>Onsite</option><option>Offsite</option><option>Unknown</option></select></div></div>
      <div class="table-wrap"><table><thead><tr><th>Team member</th><th>Current status</th><th>Reported location</th><th>Last reported</th><th>Source</th></tr></thead><tbody id="people-rows"></tbody></table></div>
    </section>`;
}

function renderPeople() {
  const body = document.querySelector("#people-rows");
  if (!body) return;
  const query = (document.querySelector("#people-search")?.value || "").toLowerCase();
  const filter = document.querySelector("#location-filter")?.value || "All";
  const rows = people.filter(p => (`${p.name} ${p.role} ${p.detail}`).toLowerCase().includes(query))
    .filter(p => filter === "All" || p.location === filter);
  body.innerHTML = rows.length ? rows.map(p => `<tr><td><div class="person-cell">${initialsAvatar(p.initials)}<span><strong>${p.name}</strong><small>${p.role}</small></span></div></td><td><span class="location-cell ${p.stale ? "stale" : ""}"><i class="status-dot ${p.location === "Unknown" ? "offline" : ""}"></i>${p.location}${p.stale ? " · stale" : ""}</span></td><td>${p.detail}</td><td>${p.reported}</td><td><span class="pill">Zenzap message</span></td></tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">No team members match those filters.</div></td></tr>`;
}

function inboxView() {
  const selected = messages.find(m => m.id === selectedMessageId) || messages[0];
  return `${heading("Message inbox", "Read team messages and prepare protocol-aware replies.", `<button class="btn" id="compose-message">＋ New message</button>`)}
    <div class="callout" style="margin-bottom:14px"><span>ⓘ</span><span>Routine replies are marked for review in this preview. Live automatic sending requires an approved policy and a connected Zenzap integration.</span></div>
    <section class="panel message-layout">
      <div class="message-list">${messages.map(m => `<div class="message-item ${m.id === selected.id ? "selected" : ""}" data-message="${m.id}">${initialsAvatar(m.initials)}<div class="message-body"><div class="message-top"><strong>${m.name}</strong><small>${m.time}</small></div><div class="message-subject">${m.subject}</div><div class="message-snippet">${m.snippet}</div><span class="pill ${m.tagClass}" style="margin-top:7px">${m.tag}</span></div></div>`).join("")}</div>
      <div class="conversation">
        <div class="conversation-top"><strong>${selected.name}</strong><small>${selected.subject} · Zenzap preview message</small></div>
        <div class="conversation-content"><div class="bubble">${selected.text}</div>${messageDrafts[selected.id] ? `<div class="bubble mine">${messageDrafts[selected.id]}<div class="muted-note" style="margin-top:6px">Saved draft · not sent</div></div>` : ""}<div class="muted-note">AI assistance: Ollama is not connected. Replies must be composed by the administrator in this preview.</div></div>
        <div class="reply-box"><textarea id="reply-text" placeholder="Write a reply...">${messageDrafts[selected.id] || ""}</textarea><div class="reply-actions"><span class="muted-note">Preview only — not sent</span><button class="btn primary small" id="send-reply">Save draft</button></div></div>
      </div>
    </section>`;
}

function scheduleView() {
  return `${heading("Schedules", "Describe coverage in plain language and review a schedule before it is shared.", `<button class="btn" id="schedule-history">◷ History</button>`)}
    <div class="callout" style="margin-bottom:15px"><span>ⓘ</span><span>Schedule suggestions need staffing rules, availability, and Zenzap access to be reliable. No schedule is published from this preview.</span></div>
    <section class="panel"><div class="panel-head"><h2>Build a schedule with AI</h2><span class="pill blue">Ollama not connected</span></div><div class="panel-body">
      <div class="prompt-box"><label class="prompt-label" for="schedule-prompt">What schedule do you need?</label><textarea id="schedule-prompt" placeholder="Example: Create next week's coverage for Northgate. Keep two officers on each evening shift and avoid assigning anyone more than five shifts."></textarea><div class="prompt-hint">Include dates, sites, coverage needs, and any constraints. Missing details should be clarified before a schedule is approved.</div><div><button class="btn primary" id="generate-schedule">✦ Prepare schedule preview</button></div></div>
      <div id="schedule-result"></div>
    </div></section>
    <section class="panel" style="margin-top:15px"><div class="panel-head"><h2>Recent schedules</h2><span class="pill">Sample records</span></div><div class="table-wrap"><table><thead><tr><th>Schedule</th><th>Period</th><th>Status</th><th>Last updated</th></tr></thead><tbody><tr><td><strong>Northgate weekly coverage</strong></td><td>Oct 19–25, 2026</td><td><span class="pill green">Published · sample</span></td><td>Oct 12</td></tr><tr><td><strong>Riverside Plaza evening shifts</strong></td><td>Oct 18–24, 2026</td><td><span class="pill amber">Needs review · sample</span></td><td>Oct 11</td></tr></tbody></table></div></section>`;
}

function interviewsView() {
  return `${heading("Interviews", "Plan interviews and prepare a fair, consistent candidate experience.", `<button class="btn primary" id="new-interview">＋ Plan interview</button>`)}
    <div class="callout" style="margin-bottom:15px"><span>ⓘ</span><span>Any AI-led interview must disclose AI participation and transcription before the meeting, offer a human alternative, and obtain required consent. Teams calling and recording are not configured in this preview.</span></div>
    <section class="panel"><div class="panel-head"><h2>Upcoming</h2><span class="pill">2 planned · sample</span></div>
      <article class="interview-card"><div class="interview-card-head"><div><h3>Candidate screening</h3><div class="interview-meta"><span>◷ Today, 2:00 PM</span><span>◉ Microsoft Teams</span><span>Candidate: Renee Taylor</span></div></div><span class="pill amber">Disclosure required</span></div><p>AI interviewer: not enabled. Share the AI/transcription notice and offer a human interviewer before scheduling.</p><button class="btn small" data-interview="screening">Prepare questions</button> <button class="btn small" data-interview="disclosure">View disclosure</button></article>
      <article class="interview-card"><div class="interview-card-head"><div><h3>Officer interview</h3><div class="interview-meta"><span>◷ Tomorrow, 10:30 AM</span><span>◉ Microsoft Teams</span><span>Candidate: Morgan Wells</span></div></div><span class="pill blue">Planned</span></div><p>Question set is not yet attached. AI meeting participation is not available until a supported integration is configured.</p><button class="btn small" data-interview="officer">Prepare questions</button></article>
    </section>
    <section class="panel" style="margin-top:15px"><div class="panel-head"><h2>Interview safeguards</h2></div><div class="panel-body"><div class="mini-list"><div class="mini-row"><span class="stat-icon green">1</span><div class="mini-copy"><strong>Disclose AI before the meeting</strong><small>State clearly whether AI will ask questions, transcribe, or summarize.</small></div></div><div class="mini-row"><span class="stat-icon green">2</span><div class="mini-copy"><strong>Offer a human alternative</strong><small>Let candidates request a human interviewer without penalty.</small></div></div><div class="mini-row"><span class="stat-icon amber">3</span><div class="mini-copy"><strong>Confirm consent and retention</strong><small>Do not record or retain transcripts until policies and consent are set.</small></div></div></div></div></section>`;
}

function myRecordView() {
  return `${heading("My record", "Your profile and company information.", `<button class="btn" id="edit-profile">Edit profile</button>`)}
    <div class="grid-two">
      ${panel("Profile", `<div class="person-cell" style="margin-bottom:16px">${initialsAvatar("SB")}<span><strong>Sara Boudoin</strong><small>Area Supervisor · Zephyr One Security</small></span></div><div class="mini-list"><div class="mini-row"><div class="mini-copy"><strong>Work email</strong><small>s.boudoin@zephyrone.net</small></div></div><div class="mini-row"><div class="mini-copy"><strong>Department</strong><small>Operations</small></div></div><div class="mini-row"><div class="mini-copy"><strong>Access level</strong><small>Administrator</small></div></div></div>`)}
      ${panel("My activity", `<div class="mini-list"><div class="mini-row"><span class="stat-icon green">✓</span><div class="mini-copy"><strong>Profile verified</strong><small>Company details are up to date</small></div></div><div class="mini-row"><span class="stat-icon">▤</span><div class="mini-copy"><strong>Message assistance</strong><small>Human review is enabled for sensitive items</small></div></div><div class="mini-row"><span class="stat-icon amber">⚙</span><div class="mini-copy"><strong>Integrations</strong><small>Connections still need to be configured</small></div></div></div>`)}
    </div>`;
}

function pipelineView() {
  const stages = ["Applied", "Screening", "Interview", "Documents", "Onboarding"];
  return `${heading("Applicant pipeline", "Track candidates through hiring and onboarding.", `<button class="btn primary" id="add-candidate">＋ Add candidate</button>`)}
    <div class="stat-grid">${stages.slice(0, 4).map((stage, i) => `<article class="stat-card"><div class="stat-icon ${i === 3 ? "green" : ""}">${["⇢", "⌕", "◷", "▧"][i]}</div><div><div class="stat-value">${[28, 16, 7, 12][i]}</div><div class="stat-label">${stage}</div></div></article>`).join("")}</div>
    <section class="panel"><div class="panel-head"><h2>Candidate records</h2><div class="table-toolbar"><input class="search" id="candidate-search" placeholder="Search candidates..." aria-label="Search candidates"><select class="filter" id="stage-filter" aria-label="Filter by stage"><option value="All">All stages</option>${stages.map(s => `<option>${s}</option>`).join("")}</select></div></div><div class="table-wrap"><table><thead><tr><th>Candidate</th><th>Position</th><th>Stage</th><th>Updated</th><th>Action</th></tr></thead><tbody id="candidate-rows"></tbody></table></div></section>
    <div class="callout" style="margin-top:13px"><span>ⓘ</span><span>Sample applicant records for this local preview only. Connect your hiring system before using real applicant data.</span></div>`;
}

function renderCandidates() {
  const body = document.querySelector("#candidate-rows");
  if (!body) return;
  const query = (document.querySelector("#candidate-search")?.value || "").toLowerCase();
  const filter = document.querySelector("#stage-filter")?.value || "All";
  const rows = candidates.filter(c => (`${c.name} ${c.role}`).toLowerCase().includes(query)).filter(c => filter === "All" || c.stage === filter);
  body.innerHTML = rows.length ? rows.map(c => `<tr><td><div class="person-cell">${initialsAvatar(c.initials)}<span><strong>${c.name}</strong><small>Candidate</small></span></div></td><td>${c.role}</td><td><select class="filter candidate-stage" data-candidate="${c.name}" aria-label="Stage for ${c.name}">${["Applied", "Screening", "Interview", "Documents", "Onboarding", "Hired", "Declined"].map(stage => `<option ${stage === c.stage ? "selected" : ""}>${stage}</option>`).join("")}</select></td><td>${c.updated}</td><td><button class="btn small" data-candidate-record="${c.name}">Open record</button></td></tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">No candidates match those filters.</div></td></tr>`;
}

function submissionsView() {
  return `${heading("Officer submissions", "Review forms, documents, and updates submitted by officers and candidates.", `<button class="btn" id="submission-filter">All submissions⌄</button>`)}
    <section class="panel"><div class="panel-head"><h2>Recent submissions</h2><span class="pill">Sample records</span></div>
      <div class="interview-card"><div class="interview-card-head"><div><h3>Renee Taylor · New applicant pre-screen</h3><div class="interview-meta"><span>Submitted today, 9:14 AM</span><span>Application form</span></div></div><span class="pill amber">Needs review</span></div><p>Pre-screen responses and contact details are ready for review.</p><button class="btn small" data-submission="Renee Taylor">Review submission</button></div>
      <div class="interview-card"><div class="interview-card-head"><div><h3>Morgan Wells · Identification documents</h3><div class="interview-meta"><span>Submitted yesterday</span><span>Onboarding</span></div></div><span class="pill green">Received</span></div><p>Identity document upload received. Verify using the approved company process.</p><button class="btn small" data-submission="Morgan Wells">Review submission</button></div>
      <div class="interview-card"><div class="interview-card-head"><div><h3>Jordan Ellis · Schedule adjustment request</h3><div class="interview-meta"><span>Submitted Oct 11</span><span>Personnel request</span></div></div><span class="pill blue">In review</span></div><p>Request received. Check team coverage and applicable policy before responding.</p><button class="btn small" data-submission="Jordan Ellis">Review submission</button></div>
    </section>`;
}

function onboardingView() {
  return `${heading("Onboarding", "Coordinate new-hire requirements and track readiness for the first training shift.", `<button class="btn" id="onboarding-policy">Onboarding requirements</button>`)}
    <div class="stat-grid"><article class="stat-card"><div class="stat-icon amber">◷</div><div><div class="stat-value">2</div><div class="stat-label">In onboarding</div></div></article><article class="stat-card"><div class="stat-icon green">✓</div><div><div class="stat-value">${onboardingTasks.filter(t => t.done).length}</div><div class="stat-label">Tasks complete</div></div></article><article class="stat-card"><div class="stat-icon">▧</div><div><div class="stat-value">${onboardingTasks.filter(t => !t.done).length}</div><div class="stat-label">Open tasks</div></div></article><article class="stat-card"><div class="stat-icon red">!</div><div><div class="stat-value">0</div><div class="stat-label">Ready for FTO shift</div></div></article></div>
    <section class="panel"><div class="panel-head"><h2>Onboarding checklist</h2><span class="pill">Sample records</span></div><div class="table-wrap"><table><thead><tr><th>Requirement</th><th>Candidate</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>${onboardingTasks.map((t, i) => `<tr><td>${t.label}</td><td>${t.owner}</td><td>${t.due}</td><td><span class="pill ${t.done ? "green" : "amber"}">${t.done ? "Complete" : "Pending"}</span></td><td><button class="btn small" data-onboarding="${i}">${t.done ? "Reopen" : "Mark complete"}</button></td></tr>`).join("")}</tbody></table></div></section>`;
}

function complianceView() {
  return `${heading("Compliance", "Monitor required credentials, policy acknowledgements, and training follow-up.", `<button class="btn" id="compliance-export">Export report</button>`)}
    <div class="stat-grid"><article class="stat-card"><div class="stat-icon green">✓</div><div><div class="stat-value">22</div><div class="stat-label">Current credentials</div></div></article><article class="stat-card"><div class="stat-icon amber">◷</div><div><div class="stat-value">2</div><div class="stat-label">Expiring soon</div></div></article><article class="stat-card"><div class="stat-icon red">!</div><div><div class="stat-value">1</div><div class="stat-label">Needs follow-up</div></div></article><article class="stat-card"><div class="stat-icon">▧</div><div><div class="stat-value">24</div><div class="stat-label">Active officers</div></div></article></div>
    <section class="panel"><div class="panel-head"><h2>Items to follow up</h2></div><div class="table-wrap"><table><thead><tr><th>Officer</th><th>Requirement</th><th>Due date</th><th>Status</th><th></th></tr></thead><tbody><tr><td>Jordan Ellis</td><td>First aid certification</td><td>Oct 20, 2026</td><td><span class="pill amber">Expiring soon</span></td><td><button class="btn small" data-compliance="Jordan Ellis">View record</button></td></tr><tr><td>Darius Cole</td><td>Site policy acknowledgement</td><td>Overdue</td><td><span class="pill red">Needs follow-up</span></td><td><button class="btn small" data-compliance="Darius Cole">View record</button></td></tr><tr><td>Renee Smith</td><td>De-escalation refresher</td><td>Nov 02, 2026</td><td><span class="pill amber">Due soon</span></td><td><button class="btn small" data-compliance="Renee Smith">View record</button></td></tr></tbody></table></div></section>
    <div class="callout" style="margin-top:13px"><span>ⓘ</span><span>Sample-only compliance data. Verify requirements against company policy and applicable law before relying on a status.</span></div>`;
}

function timeclockView() {
  return `${heading("Timeclock", "This company feature is already built; this new app does not duplicate or replace its timesheet records.")}
    <section class="panel"><div class="panel-body"><div class="empty-state"><div class="empty-icon">◴</div><h3>Keep using the existing timeclock</h3><p>Timesheets remain in the existing company system. The new Zenzap location view is separate and only shows explicit onsite/offsite status messages with their timestamps.</p><button class="btn" id="existing-timeclock">Open existing timeclock</button></div></div></section>`;
}

function approvalsView() {
  return `${heading("Review queue", "Sensitive, ambiguous, and low-confidence items need your decision.", `<span class="pill amber">3 waiting</span>`)}
    <div class="callout" style="margin-bottom:15px"><span>ⓘ</span><span>Approving an item in this preview only dismisses the sample card. It does not send a message or publish a schedule.</span></div>
    <section class="panel"><div class="panel-head"><h2>Items requiring review</h2></div><div id="approval-list">${approvals.map((a, i) => `<article class="approval-card" data-approval="${i}"><div><div class="interview-meta"><span class="pill ${a.kind === "Schedule" ? "blue" : "amber"}">${a.kind}</span><span>${a.person}</span></div><h3>${a.title}</h3><p>${a.reason}</p><p><strong>Suggested draft:</strong> ${a.detail}</p></div><div class="approval-actions"><button class="btn small" data-action="edit">Edit</button><button class="btn primary small" data-action="approve">Approve</button></div></article>`).join("")}</div></section>`;
}

function settingsView() {
  return `${heading("Connections & settings", "Connect services securely before enabling live automation.", `<span class="pill amber">Not connected</span>`)}
    <div class="callout" style="margin-bottom:15px"><span>ⓘ</span><span>Do not paste access tokens or passwords into this demo. Production connections need secure server-side credential storage, least-privilege permissions, and an administrator sign-in.</span></div>
    <section class="panel"><div class="panel-head"><h2>Integrations</h2></div><div class="panel-body">
      <div class="integration-row"><div class="integration-logo">Z</div><div class="integration-copy"><strong>Zenzap</strong><p>Messages, team onsite/offsite check-ins, and schedule posts.</p></div><span class="pill amber">Not connected</span><button class="btn small" data-connect="Zenzap">Set up</button></div>
      <div class="integration-row"><div class="integration-logo">M</div><div class="integration-copy"><strong>Microsoft Teams</strong><p>Interview invitations and meetings, subject to supported permissions.</p></div><span class="pill amber">Not connected</span><button class="btn small" data-connect="Microsoft Teams">Set up</button></div>
      <div class="integration-row"><div class="integration-logo">AI</div><div class="integration-copy"><strong>Ollama</strong><p>Local model endpoint for drafting, classification, and schedule assistance.</p></div><span class="pill amber">Not connected</span><button class="btn small" data-connect="Ollama">Set up</button></div>
    </div></section>
    <section class="panel" style="margin-top:15px"><div class="panel-head"><h2>Automation policy</h2></div><div class="panel-body"><div class="mini-list"><div class="mini-row"><div class="mini-copy"><strong>Routine message responses</strong><small>Selected behavior: auto-send routine replies only after policy setup and connection; route sensitive/uncertain cases for review.</small></div><span class="pill amber">Disabled</span></div><div class="mini-row"><div class="mini-copy"><strong>Schedule publishing</strong><small>Preview first; require confirmation when coverage or constraints are unclear.</small></div><span class="pill amber">Disabled</span></div><div class="mini-row"><div class="mini-copy"><strong>Employee location</strong><small>Explicit Zenzap status only. No GPS; show last-reported time and mark stale/missing reports unknown.</small></div><span class="pill green">Policy set</span></div><div class="mini-row"><div class="mini-copy"><strong>AI interview participation</strong><small>Requires advance disclosure, human alternative, and consent/retention policy.</small></div><span class="pill amber">Disabled</span></div></div></div></section>`;
}

function render() {
  const titles = { overview: "Dashboard", "my-record": "My record", inbox: "Threads", locations: "Team locations", schedule: "Schedules", timeclock: "Timeclock", submissions: "Officer submissions", pipeline: "Applicant pipeline", onboarding: "Onboarding", compliance: "Compliance", interviews: "Interviews", approvals: "Review queue", settings: "Connections & settings" };
  activeView = titles[activeView] ? activeView : "overview";
  crumb.textContent = titles[activeView];
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === activeView));
  const views = { overview: overviewView, "my-record": myRecordView, inbox: inboxView, locations: locationsView, schedule: scheduleView, timeclock: timeclockView, submissions: submissionsView, pipeline: pipelineView, onboarding: onboardingView, compliance: complianceView, interviews: interviewsView, approvals: approvalsView, settings: settingsView };
  content.innerHTML = views[activeView]();
  if (activeView === "locations") renderPeople();
  if (activeView === "pipeline") renderCandidates();
}

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    activeView = viewButton.dataset.view;
    document.querySelector("#sidebar").classList.remove("open");
    render();
    return;
  }
  const message = event.target.closest("[data-message]");
  if (message) {
    selectedMessageId = Number(message.dataset.message);
    render();
    return;
  }
  const approvalAction = event.target.closest("[data-action]");
  if (approvalAction) {
    const card = approvalAction.closest("[data-approval]");
    const index = Number(card.dataset.approval);
    if (approvalAction.dataset.action === "edit") {
      openModal("Edit suggested response", `<p>${approvals[index].detail}</p><textarea id="edit-draft">${approvals[index].detail}</textarea>`, "Save draft");
    } else {
      openModal("Preview only", "<p>This demo cannot send messages or publish schedules. Connect the required services and configure approval policies before enabling this action.</p>", "Understood");
    }
    return;
  }
  const connect = event.target.closest("[data-connect]");
  if (connect) {
    toast(`${connect.dataset.connect} setup needs a secure server-side integration; none is configured in this preview.`);
    return;
  }
  const interview = event.target.closest("[data-interview]");
  if (interview) {
    const name = interview.dataset.interview;
    if (name === "disclosure") openModal("AI interview disclosure", "<p>Before an interview, tell the candidate whether AI will participate and whether audio/video will be transcribed or summarized. Offer a human interviewer and get required consent before recording.</p>", "Close");
    else openModal("Prepare interview questions", "<p>Example structured questions for a security officer role:</p><ol><li>What steps would you take when a visitor refuses to follow site procedures?</li><li>How do you document and escalate a safety incident?</li><li>Describe how you would handle a shift handoff with incomplete information.</li></ol><p>Review for job relevance and consistency before use.</p>", "Close");
    return;
  }
  if (event.target.id === "mobile-menu") document.querySelector("#sidebar").classList.toggle("open");
  if (event.target.id === "refresh-locations") toast("Preview records are static. Connect Zenzap to load live explicit check-ins.");
  if (event.target.id === "compose-message") openModal("New Zenzap message", "<p>Compose a draft. Sending is unavailable until Zenzap is connected.</p><label class='prompt-label' for='new-recipient'>Recipient or chat</label><input class='search' id='new-recipient' placeholder='Choose a recipient or chat'><textarea id='new-message-draft' placeholder='Write your message...'></textarea>", "Save draft");
  if (event.target.id === "send-reply") {
    const text = document.querySelector("#reply-text").value.trim();
    if (!text) { toast("Write a reply before saving the draft."); return; }
    messageDrafts[selectedMessageId] = text;
    render();
    toast("Draft saved in this preview only. No message was sent.");
  }
  if (event.target.id === "generate-schedule") {
    const prompt = document.querySelector("#schedule-prompt").value.trim();
    if (!prompt) { toast("Describe the dates, site, and coverage you need first."); return; }
    generatedSchedule = true;
    const result = document.querySelector("#schedule-result");
    result.innerHTML = `<div class="schedule-preview"><div class="panel-head" style="padding:0 0 12px"><h2>Schedule preview</h2><span class="pill amber">Sample assignments — verify before use</span></div><div class="schedule-day"><div class="schedule-date">Monday · Oct 19</div><div class="shift-list"><div class="shift"><span><strong>Northgate · Evening</strong> · Jordan Ellis, Maya Chen</span><span>18:00–00:00</span></div></div></div><div class="schedule-day"><div class="schedule-date">Tuesday · Oct 20</div><div class="shift-list"><div class="shift"><span><strong>Riverside Plaza · Day</strong> · Darius Cole, Renee Smith</span><span>08:00–16:00</span></div></div></div><div class="callout" style="margin-top:12px"><span>!</span><span>This is illustrative sample content, not AI-generated or checked against availability, labor rules, or Zenzap. Ollama is not connected.</span></div><div style="margin-top:12px"><button class="btn" id="publish-schedule" disabled>Publish unavailable</button></div></div>`;
    toast("Preview created with sample assignments only.");
    return;
  }
  if (event.target.id === "schedule-history") toast("Schedule history will be available when connected to the live schedule source.");
  if (event.target.id === "new-interview") openModal("Plan an interview", "<p>Scheduling requires a Teams connection and a completed AI disclosure / human alternative workflow.</p><label class='prompt-label' for='candidate-name'>Candidate name</label><input id='candidate-name' class='search' placeholder='Candidate name'><p style='margin-top:12px'>A human interview remains the safe default until AI interview capability, consent, and retention policies are configured.</p>", "Close");
  if (event.target.id === "add-candidate") openModal("Add candidate", "<p>Preview records stay in this browser session only.</p><label class='prompt-label' for='new-applicant-name'>Candidate name</label><input id='new-applicant-name' class='search' placeholder='Candidate name'><label class='prompt-label' for='new-applicant-role'>Position</label><input id='new-applicant-role' class='search' placeholder='Position title'>", "Add candidate");
  if (event.target.id === "edit-profile") openModal("Edit profile", "<p>Profile edits are unavailable until an administrator account service is connected.</p>", "Close");
  if (event.target.id === "onboarding-policy") openModal("Onboarding requirements", "<p>Confirm identity, required documents, training, site-specific requirements, and field-training assignments against Zephyr One Security's approved policies. Do not use this sample checklist as a substitute for company policy.</p>", "Close");
  if (event.target.id === "existing-timeclock") toast("The existing timeclock is not linked to this local preview.");
  if (event.target.id === "submission-filter") toast("Showing all sample submissions.");
  if (event.target.id === "compliance-export") toast("Export is unavailable for sample-only records.");
  const submission = event.target.closest("[data-submission]");
  if (submission) openModal("Submission review", `<p>Sample submission for ${submission.dataset.submission}. Verify all documents and follow the approved company process before changing a candidate's status.</p>`, "Close");
  const complianceRecord = event.target.closest("[data-compliance]");
  if (complianceRecord) openModal("Compliance record", `<p>Sample compliance item for ${complianceRecord.dataset.compliance}. Check the source record before acting.</p>`, "Close");
  const onboardingAction = event.target.closest("[data-onboarding]");
  if (onboardingAction) {
    const task = onboardingTasks[Number(onboardingAction.dataset.onboarding)];
    task.done = !task.done;
    render();
    return;
  }
  const candidateRecord = event.target.closest("[data-candidate-record]");
  if (candidateRecord) openModal("Candidate record", `<p>Sample candidate record for ${candidateRecord.dataset.candidate}. Use the connected hiring system for verified applicant information.</p>`, "Close");
  if (event.target.id === "confirm-modal" && document.querySelector("#new-applicant-name")) {
    const name = document.querySelector("#new-applicant-name").value.trim();
    const role = document.querySelector("#new-applicant-role").value.trim();
    if (!name || !role) { toast("Enter a candidate name and position."); return; }
    const initials = name.split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join("");
    candidates.unshift({ name, role, stage: "Applied", updated: "Just now", initials });
    closeModal();
    render();
    toast("Candidate added to this preview session.");
    return;
  }
  if (event.target.id === "confirm-modal" && document.querySelector("#new-message-draft")) {
    const text = document.querySelector("#new-message-draft").value.trim();
    if (!text) { toast("Write a message before saving the draft."); return; }
    closeModal();
    toast("Draft saved in this preview only. No message was sent.");
    return;
  }
  if (event.target.id === "close-modal" || event.target.id === "confirm-modal" || event.target.classList.contains("modal-backdrop")) closeModal();
});

document.addEventListener("input", event => {
  if (event.target.id === "people-search") renderPeople();
  if (event.target.id === "candidate-search") renderCandidates();
});
document.addEventListener("change", event => {
  if (event.target.id === "location-filter") renderPeople();
  if (event.target.id === "stage-filter") renderCandidates();
  if (event.target.matches(".candidate-stage")) {
    const candidate = candidates.find(c => c.name === event.target.dataset.candidate);
    if (candidate) {
      candidate.stage = event.target.value;
      candidate.updated = "Just now";
      toast(`${candidate.name}'s sample stage updated.`);
    }
  }
});

function openModal(title, body, confirmLabel) {
  closeModal();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><h2 id="modal-title">${title}</h2>${body}<div class="modal-actions"><button class="btn" id="close-modal">Cancel</button><button class="btn primary" id="confirm-modal">${confirmLabel}</button></div></section>`;
  document.body.append(backdrop);
}
function closeModal() { document.querySelector(".modal-backdrop")?.remove(); }

render();
