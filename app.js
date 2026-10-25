let activeView = "dashboard";
const contentEl = document.querySelector("#content");
const crumbEl = document.querySelector("#crumb");
const toastEl = document.querySelector("#toast");
let toastTimer;

const scheduledInterviews = [
  { id: 1, candidate: "Renee Taylor", role: "Field Security Officer", date: "Today, 2:00 PM", status: "Needs Disclosure", statusClass: "amber", questionSet: "Standard Guard V2", teamsLink: "https://teams.microsoft.com/l/meetup-join/sample1" },
  { id: 2, candidate: "Morgan Wells", role: "Shift Supervisor", date: "Tomorrow, 10:30 AM", status: "Consent Granted", statusClass: "green", questionSet: "Supervisor Screening", teamsLink: "https://teams.microsoft.com/l/meetup-join/sample2" },
  { id: 3, candidate: "Taylor Jackson", role: "Field Officer", date: "Oct 28, 11:00 AM", status: "Human Option Requested", statusClass: "blue", questionSet: "Standard Guard V2", teamsLink: "https://teams.microsoft.com/l/meetup-join/sample3" }
];

const questionSets = [
  { id: "standard", name: "Standard Guard V2", count: 6, estimatedMin: 15, questions: ["Describe a situation where you had to handle an unauthorized person on site.", "How do you handle shift handovers during emergency situations?", "Walk us through your routine check-in procedure."] },
  { id: "supervisor", name: "Supervisor Screening", count: 8, estimatedMin: 20, questions: ["How do you manage missing team members on a post?", "Describe how you resolve conflict between two officers.", "What steps do you take when site access readers fail?"] }
];

const candidateConsents = [
  { candidate: "Morgan Wells", consentDate: "Oct 24, 2026", status: "Granted", alternativeRequested: false },
  { candidate: "Renee Taylor", consentDate: "Pending", status: "Pending Disclosure", alternativeRequested: false },
  { candidate: "Taylor Jackson", consentDate: "Oct 23, 2026", status: "Opted for Human", alternativeRequested: true }
];

const completedTranscripts = [
  { id: 101, candidate: "Jamie Rivera", role: "Field Officer", duration: "14m 20s", summary: "Strong candidate. Cleared perimeter response questions. Recommended for onboarding.", date: "Oct 22, 2026" },
  { id: 102, candidate: "Cameron Price", role: "Security Officer", duration: "12m 45s", summary: "Good communication. Needs follow-up on licensing verification.", date: "Oct 21, 2026" }
];

function toast(msg) {
  toastEl.textContent = msg;
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

function dashboardView() {
  return `${heading("AI Teams Interviewer", "Autonomous MS Teams interview coordination, AI participation compliance, and automated transcript scoring.", `<button class="btn primary" id="schedule-call">＋ Schedule Call</button>`)}
    <div class="stat-grid">
      <article class="stat-card"><div class="stat-icon blue">◷</div><div><div class="stat-value">3</div><div class="stat-label">Upcoming Calls</div></div></article>
      <article class="stat-card"><div class="stat-icon green">✓</div><div><div class="stat-value">1</div><div class="stat-label">Consent Granted</div></div></article>
      <article class="stat-card"><div class="stat-icon amber">!</div><div><div class="stat-value">1</div><div class="stat-label">Pending Consent</div></div></article>
      <article class="stat-card"><div class="stat-icon">▧</div><div><div class="stat-value">2</div><div class="stat-label">Transcripts Ready</div></div></article>
    </div>
    <div class="callout" style="margin-bottom:16px"><span>ⓘ</span><span><strong>AI Safeguard Active:</strong> All Teams interviews automatically include an obligatory disclosure card and offer an immediate option to request a human interviewer.</span></div>
    <div class="grid-two">
      ${panel("Upcoming Scheduled Calls", `<div class="mini-list">${scheduledInterviews.map(i => `<div class="mini-row"><span class="stat-icon blue">◷</span><div class="mini-copy"><strong>${i.candidate}</strong><small>${i.role} · ${i.date}</small></div><span class="pill ${i.statusClass}">${i.status}</span></div>`).join("")}</div>`, `<button class="text-button" data-view="interviews">View all →</button>`)}
      ${panel("Recent Transcripts", `<div class="mini-list">${completedTranscripts.map(t => `<div class="mini-row"><span class="stat-icon green">✓</span><div class="mini-copy"><strong>${t.candidate}</strong><small>${t.summary}</small></div></div>`).join("")}</div>`, `<button class="text-button" data-view="transcripts">View transcripts →</button>`)}
    </div>`;
}

function interviewsView() {
  return `${heading("Scheduled Teams Calls", "Manage upcoming automated interviews, assign question sets, and send disclosure forms.", `<button class="btn primary" id="schedule-call">＋ Schedule Call</button>`)}
    <section class="panel"><div class="panel-head"><h2>Upcoming Interviews</h2></div>
      ${scheduledInterviews.map(i => `
        <article class="interview-card">
          <div class="interview-card-head">
            <div>
              <h3>${i.candidate} — ${i.role}</h3>
              <div class="interview-meta">
                <span>◷ ${i.date}</span>
                <span>◉ Microsoft Teams</span>
                <span>Question Set: <strong>${i.questionSet}</strong></span>
              </div>
            </div>
            <span class="pill ${i.statusClass}">${i.status}</span>
          </div>
          <p>Bot link ready. Candidates receive automated disclosure 24 hours prior to call.</p>
          <button class="btn small" data-action="send-disclosure" data-candidate="${i.candidate}">Re-send Disclosure</button>
          <button class="btn small" data-action="join-call" data-link="${i.teamsLink}">Join Teams Meeting</button>
        </article>
      `).join("")}
    </section>`;
}

function questionnairesView() {
  return `${heading("Question Sets", "Configure scripted questions and scoring rubrics for the Teams AI bot.", `<button class="btn primary" id="new-qset">＋ New Question Set</button>`)}
    <div class="grid-two">
      ${questionSets.map(qs => panel(`${qs.name} (${qs.count} Questions)`, `
        <p class="muted-note" style="margin-bottom:10px">Est. Duration: ${qs.estimatedMin} mins</p>
        <ol style="padding-left:16px; font-size:11px; line-height:1.6; color:#4a5568">
          ${qs.questions.map(q => `<li>${q}</li>`).join("")}
        </ol>
      `, `<button class="btn small" data-action="edit-qset" data-id="${qs.id}">Edit Set</button>`)).join("")}
    </div>`;
}

function candidatesView() {
  return `${heading("Candidate AI Disclosures", "Track candidate consent, optical recordings acknowledgements, and human interviewer requests.", "")}
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Candidate</th><th>Status</th><th>Consent Date</th><th>Human Requested</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${candidateConsents.map(c => `
              <tr>
                <td><strong>${c.candidate}</strong></td>
                <td><span class="pill ${c.status === "Granted" ? "green" : c.status === "Opted for Human" ? "blue" : "amber"}">${c.status}</span></td>
                <td>${c.consentDate}</td>
                <td>${c.alternativeRequested ? "Yes (Re-assigned)" : "No"}</td>
                <td><button class="btn small" data-action="view-disclosure" data-candidate="${c.candidate}">View Log</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

function transcriptsView() {
  return `${heading("Transcripts & Scoring", "Review AI-generated call transcripts, candidate scorecards, and recordings.")}
    <section class="panel">
      <div class="panel-head"><h2>Completed Call Audits</h2></div>
      ${completedTranscripts.map(t => `
        <article class="interview-card">
          <div class="interview-card-head">
            <div>
              <h3>${t.candidate} — ${t.role}</h3>
              <div class="interview-meta"><span>Completed: ${t.date}</span><span>Duration: ${t.duration}</span></div>
            </div>
            <span class="pill green">Verified Transcript</span>
          </div>
          <p><strong>AI Evaluation Summary:</strong> ${t.summary}</p>
          <button class="btn small" data-action="view-transcript" data-id="${t.id}">View Full Transcript</button>
        </article>
      `).join("")}
    </section>`;
}

function botConfigView() {
  return `${heading("Teams Bot Configuration", "Configure Microsoft Graph API credentials, Bot Framework endpoints, and Azure Speech parameters.")}
    <section class="panel">
      <div class="panel-head"><h2>Azure Bot Service Integration</h2><span class="pill amber">Disconnected</span></div>
      <div class="panel-body">
        <div class="integration-row">
          <div class="integration-logo">MS</div>
          <div class="integration-copy">
            <strong>Microsoft App ID</strong>
            <p>Azure AD Application ID registered for Teams Calling Bot.</p>
          </div>
          <input class="search" style="width:200px" placeholder="00000000-0000-0000-0000" value="">
        </div>
        <div class="integration-row">
          <div class="integration-logo">AI</div>
          <div class="integration-copy">
            <strong>Azure Speech / LLM Model Endpoint</strong>
            <p>Real-time speech-to-text and transcript evaluation endpoint.</p>
          </div>
          <input class="search" style="width:200px" placeholder="https://your-resource.openai.azure.com" value="">
        </div>
        <div style="margin-top:15px; display:flex; justify-content:flex-end">
          <button class="btn primary" id="save-config">Save Credentials</button>
        </div>
      </div>
    </section>`;
}

function render() {
  const views = {
    dashboard: dashboardView,
    interviews: interviewsView,
    questionnaires: questionnairesView,
    candidates: candidatesView,
    transcripts: transcriptsView,
    "bot-config": botConfigView
  };

  const titles = {
    dashboard: "Dashboard",
    interviews: "Scheduled Calls",
    questionnaires: "Question Sets",
    candidates: "Candidate Disclosures",
    transcripts: "Transcripts & Audits",
    "bot-config": "Teams Bot Config"
  };

  if (!views[activeView]) activeView = "dashboard";
  crumbEl.textContent = titles[activeView];

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.view === activeView);
  });

  contentEl.innerHTML = views[activeView]();
}

document.addEventListener("click", e => {
  const navBtn = e.target.closest("[data-view]");
  if (navBtn) {
    activeView = navBtn.dataset.view;
    render();
    document.querySelector("#sidebar").classList.remove("open");
    return;
  }

  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    if (action === "send-disclosure") {
      toast(`Disclosure re-sent to ${actionBtn.dataset.candidate}`);
    } else if (action === "join-call") {
      window.open(actionBtn.dataset.link, "_blank");
    } else if (action === "view-disclosure") {
      toast(`Showing audit log for ${actionBtn.dataset.candidate}`);
    } else if (action === "view-transcript") {
      toast(`Loading transcript #${actionBtn.dataset.id}`);
    }
  }

  if (e.target.closest("#mobile-menu")) {
    document.querySelector("#sidebar").classList.toggle("open");
  }

  if (e.target.closest("#save-config") || e.target.closest("#schedule-call") || e.target.closest("#new-qset")) {
    toast("Action saved in local session.");
  }
});

render();
