/* ============================================================================
   FLORA DEV JOURNAL — ENGINE
   ----------------------------------------------------------------------------
   This file renders every page (dashboard, calendar, timeline, roadmap, day
   detail) from the data in /data. You almost never need to touch this file.

   To ADD A NEW DAY you only do two things:
     1. Create  data/day-NN.js   (copy an existing one, change the numbers)
     2. Add one <script src="data/day-NN.js"></script> line in index.html

   Everything else — calendar tiles, stats, streak counter, sidebar list,
   progress bar — updates by itself. Just save & refresh the browser.

   The data globals this engine reads (defined in data/00-meta.js):
     META    — project info
     PHASES  — the 4-phase plan
     PLAN    — upcoming planned days (shown on the roadmap)
     JOURNAL — the array every day-NN.js file pushes into
   ========================================================================== */
const $app = document.getElementById('app');
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function byDate(){ return [...JOURNAL].sort((a,b)=>a.date.localeCompare(b.date)); }
function byDay(n){ return JOURNAL.find(d=>d.day===Number(n)); }
function latest(){ return byDate()[byDate().length-1]; }
function fmtDate(s){ const [y,m,d]=s.split('-').map(Number); return `${MONTHS[m-1]} ${d}, ${y}`; }
function fmtShort(s){ const [y,m,d]=s.split('-').map(Number); return `${String(d).padStart(2,'0')} ${MONTHS[m-1].slice(0,3)}`; }

function streak(){
  const dates = byDate().map(d=>d.date);
  if(!dates.length) return 0;
  let s=1;
  for(let i=dates.length-1;i>0;i--){
    const a=new Date(dates[i]), b=new Date(dates[i-1]);
    if(Math.round((a-b)/86400000)===1) s++; else break;
  }
  return s;
}
function totalSnapshot(){
  const l=latest(); return l&&l.snapshot ? l.snapshot : {entities:0,enums:0,tables:0,endpoints:0};
}

/* Effective status — derived, so you never hand-flip "today" → "done".
   The latest-dated logged entry is always "today"; earlier ones are "done";
   anything explicitly marked "upcoming" stays upcoming. */
function effStatus(d){
  if(d.status==='upcoming') return 'upcoming';
  const l=latest();
  return (l && d.day===l.day) ? 'today' : 'done';
}

/* ---------- shared bits ---------- */
function elist(cls, items){
  if(!items||!items.length) return '';
  return `<ul class="elist">`+items.map(i=>`<li>${i}</li>`).join('')+`</ul>`;
}
function badgeClass(s){ return s==='today'?'today':(s==='upcoming'?'upcoming':'done'); }
function badgeText(d){ const s=effStatus(d); return s==='today'?`Day ${d.day} • today`:(s==='upcoming'?`Day ${d.day}`:`Day ${d.day} ✓`); }

/* Render one "extra" (a diagram, a table, or a plain-English glossary). */
function renderExtra(e){
  if(e.type==='glossary'){
    const rows=(e.items||[]).map(g=>
      `<div class="gloss-row"><div class="gloss-term">${g.term}</div><div class="gloss-def">${g.def}${g.eg?`<span class="eg">${g.eg}</span>`:''}</div></div>`
    ).join('');
    return `<div class="extra-title">${e.title}</div><div class="gloss">${rows}</div>`;
  }
  if(e.type==='diagram'){
    return `<div class="extra-title">${e.title}</div><div class="rel-diagram">${e.html}</div>`;
  }
  // default: table (or any raw html block)
  return `<div class="extra-title">${e.title}</div>${e.html}`;
}

function renderDayBody(d){
  let h='';
  if(d.built&&d.built.length) h+=`<div class="block built"><div class="block-head">What we built</div><div class="block-body">${elist('built',d.built)}</div></div>`;
  if(d.understood&&d.understood.length) h+=`<div class="block learned"><div class="block-head">What we understood</div><div class="block-body">${elist('learned',d.understood)}</div></div>`;
  if((d.code&&d.code.length)||(d.extras&&d.extras.length)){
    h+=`<div class="block code"><div class="block-head">Code &amp; design — files explained</div><div class="block-body">`;
    (d.code||[]).forEach(c=>{
      h+=`<div class="code-file"><div class="code-file-label">📄 ${c.file} <span>— ${c.sub}</span></div><div class="code-block"><pre>${c.code}</pre></div></div>`;
    });
    (d.extras||[]).forEach(e=>{ h+=renderExtra(e); });
    h+=`</div></div>`;
  }
  if(d.next&&d.next.length) h+=`<div class="block next"><div class="block-head">What comes next — Day ${d.day+1}</div><div class="block-body">${elist('next',d.next)}</div></div>`;
  return h;
}

/* ---------- DASHBOARD ---------- */
function viewDashboard(){
  const l=latest(), snap=totalSnapshot(), st=streak();
  const activePhase=PHASES.find(p=>p.status==='active')||PHASES[0];
  const tags=(l.tags||[]).map(t=>`<span class="day-tag">${t}</span>`).join('');
  $app.innerHTML=`
  <div class="page-header fade">
    <div class="page-eyebrow">// ${META.project.toLowerCase()} · ${META.subtitle}</div>
    <div class="page-title">Dev Journal</div>
    <div class="page-sub">A daily log of what was built, what was understood, and what comes next. Every line of code explained. Updated every session.</div>
  </div>

  <div class="hero fade">
    <div class="hero-main">
      <div class="hero-eyebrow">// latest entry · ${fmtDate(l.date)}</div>
      <div class="hero-h">Day ${l.day} — ${l.title}</div>
      <div class="hero-p">${l.summary||''}</div>
      <div class="day-tagrow" style="position:relative;z-index:1">${tags}</div>
      <a class="hero-cta" href="#/day/${l.day}">Open Day ${l.day} →</a>
    </div>
    <div class="hero-side">
      <div class="streak">
        <div class="streak-fire">🔥</div>
        <div class="streak-n">${st}</div>
        <div class="streak-l">day streak</div>
      </div>
      <div class="mini-phase">
        <div class="mini-phase-t"><span>Current phase</span><b>${activePhase.done}/${activePhase.steps}</b></div>
        <div class="phase-progress">${phaseSteps(activePhase)}</div>
        <div style="font-size:12px;color:var(--ink2);font-weight:500">${activePhase.name}</div>
      </div>
    </div>
  </div>

  <div class="stats fade">
    ${statCard(JOURNAL.filter(d=>d.status!=='upcoming').length,'days logged','var(--g)')}
    ${statCard(snap.entities,'entities created','var(--p)')}
    ${statCard(snap.tables,'tables in MySQL','var(--b)')}
    ${statCard(snap.endpoints,'endpoints built','var(--a)')}
  </div>

  <div class="phase-row fade">
    ${PHASES.map(p=>`<div class="phase-chip ${p.status}">${p.name}${p.status==='active'?' · active':''}</div>`).join('')}
  </div>

  <div class="sec-head"><div class="sec-label">// recent activity</div><div class="sec-line"></div></div>
  <div class="tl fade">${byDate().slice().reverse().slice(0,4).map(tlItem).join('')}</div>
  <a class="hero-cta" href="#/timeline" style="margin-top:4px">View full timeline →</a>
  `;
}
function statCard(n,l,c){ return `<div class="stat"><div class="stat-n" style="color:${c}">${n}</div><div class="stat-l">${l}</div></div>`; }
function phaseSteps(p){ let h=''; for(let i=0;i<p.steps;i++){ h+=`<div class="phase-step ${i<p.done?'done':(i===p.done&&p.status==='active'?'active':'')}"></div>`; } return h; }

/* ---------- CALENDAR ---------- */
let calY, calM; // current calendar month
function viewCalendar(){
  if(calY===undefined){ const l=latest(); const [y,m]=l.date.split('-').map(Number); calY=y; calM=m-1; }
  $app.innerHTML=`
  <div class="page-header fade">
    <div class="page-eyebrow">// calendar view</div>
    <div class="page-title">The Journey, by date</div>
    <div class="page-sub">Each green tile is a logged day. Click any tile to open that day's full entry.</div>
  </div>
  <div class="cal-wrap fade" id="calWrap"></div>`;
  renderCal();
}
function renderCal(){
  const map={}; JOURNAL.forEach(d=>{ if(d.status!=='upcoming') map[d.date]=d; });
  const first=new Date(calY,calM,1).getDay();
  const days=new Date(calY,calM+1,0).getDate();
  const today=new Date(); const tStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  let cells='';
  DOW.forEach(d=>cells+=`<div class="cal-dow">${d}</div>`);
  for(let i=0;i<first;i++) cells+=`<div class="cal-cell empty"></div>`;
  for(let dd=1;dd<=days;dd++){
    const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    const entry=map[ds];
    const cls=['cal-cell']; if(entry) cls.push('has'); if(ds===tStr) cls.push('today');
    const inner = entry
      ? `<div class="cal-dnum">${dd}</div><div class="cal-daylabel">Day ${entry.day}</div><div class="cal-dtitle">${entry.title}</div>`
      : `<div class="cal-dnum">${dd}</div>`;
    cells+= entry
      ? `<a class="${cls.join(' ')}" href="#/day/${entry.day}">${inner}</a>`
      : `<div class="${cls.join(' ')}">${inner}</div>`;
  }
  document.getElementById('calWrap').innerHTML=`
    <div class="cal-top">
      <div class="cal-month">${MONTHS[calM]} <span>${calY}</span></div>
      <div class="cal-btns">
        <div class="cal-btn" id="calPrev">‹</div>
        <div class="cal-btn txt" id="calToday">today</div>
        <div class="cal-btn" id="calNext">›</div>
      </div>
    </div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-legend">
      <div><span class="sw" style="background:var(--glt);border:1px solid var(--gdim)"></span> Logged day</div>
      <div><span class="sw" style="background:var(--bg);border:1px solid var(--line);outline:1px solid var(--a)"></span> Today</div>
      <div><span class="sw" style="background:var(--bg);border:1px solid var(--line)"></span> No entry</div>
    </div>`;
  document.getElementById('calPrev').onclick=()=>{ calM--; if(calM<0){calM=11;calY--;} renderCal(); };
  document.getElementById('calNext').onclick=()=>{ calM++; if(calM>11){calM=0;calY++;} renderCal(); };
  document.getElementById('calToday').onclick=()=>{ const t=new Date(); calY=t.getFullYear(); calM=t.getMonth(); renderCal(); };
}

/* ---------- TIMELINE ---------- */
function tlItem(d){
  const c=d.snapshot||{};
  const counts=[];
  if(d.built) counts.push(`<span><b>${d.built.length}</b> built</span>`);
  if(d.understood) counts.push(`<span><b>${d.understood.length}</b> learned</span>`);
  if(d.code) counts.push(`<span><b>${d.code.length}</b> files</span>`);
  const es=effStatus(d);
  return `<a class="tl-item ${es==='upcoming'?'upcoming':''}" href="#/day/${d.day}">
    <div class="tl-card">
      <div class="tl-meta"><span class="tl-day">Day ${d.day}</span><span class="tl-date">${fmtDate(d.date)}</span>${es==='today'?'<span class="day-badge today" style="font-size:9px;padding:2px 7px">today</span>':''}</div>
      <div class="tl-title">${d.title}</div>
      <div class="tl-summary">${d.summary||''}</div>
      <div class="tl-counts">${counts.join('')}</div>
    </div></a>`;
}
function viewTimeline(){
  $app.innerHTML=`
  <div class="page-header fade">
    <div class="page-eyebrow">// timeline</div>
    <div class="page-title">Every day, in order</div>
    <div class="page-sub">The full build, one entry per session. Search to jump to a topic, a file, or a concept.</div>
  </div>
  <input class="tl-search" id="tlSearch" placeholder="Search days — e.g. enum, @ManyToOne, JWT, breed…">
  <div class="tl fade" id="tlList"></div>`;
  const list=document.getElementById('tlList');
  const draw=(q)=>{
    q=(q||'').toLowerCase().trim();
    const items=byDate().filter(d=>{
      if(!q) return true;
      const hay=(d.title+' '+(d.summary||'')+' '+(d.tags||[]).join(' ')+' '+JSON.stringify(d.built||[])+JSON.stringify(d.understood||[])+JSON.stringify(d.code||[])+JSON.stringify(d.extras||[])).toLowerCase();
      return hay.includes(q);
    });
    list.innerHTML = items.length ? items.map(tlItem).join('') : `<div class="empty-state"><div class="es-ico">🔍</div>No entries match "${q}".</div>`;
  };
  draw('');
  document.getElementById('tlSearch').addEventListener('input',e=>draw(e.target.value));
}

/* ---------- DAY DETAIL ---------- */
function viewDay(n){
  const d=byDay(n);
  if(!d){ $app.innerHTML=`<div class="empty-state fade"><div class="es-ico">🌱</div>No entry for Day ${n} yet.<br><br><a class="hero-cta" href="#/timeline">Back to timeline</a></div>`; return; }
  const ordered=byDate();
  const idx=ordered.findIndex(x=>x.day===d.day);
  const prev=ordered[idx-1], next=ordered[idx+1];
  const tags=(d.tags||[]).map(t=>`<span class="day-tag">${t}</span>`).join('');
  $app.innerHTML=`
  <a class="backlink fade" href="#/timeline">‹ back to timeline</a>
  <div class="day-entry fade" id="day${d.day}">
    <div class="day-header">
      <div class="day-badge ${badgeClass(effStatus(d))}">${badgeText(d)}</div>
      <div>
        <div class="day-title-text">${d.title}</div>
        <div class="day-date">${fmtDate(d.date)} · Phase ${d.phase} · ${PHASES[d.phase-1].name.split('—')[1].trim()}</div>
        <div class="day-tagrow">${tags}</div>
      </div>
    </div>
    ${renderDayBody(d)}
    <div class="day-nav">
      ${prev?`<a href="#/day/${prev.day}"><div class="dn-dir">‹ previous</div><div class="dn-t">Day ${prev.day} — ${prev.title}</div></a>`:`<a class="disabled"><div class="dn-dir">‹ previous</div><div class="dn-t">Start of journal</div></a>`}
      ${next?`<a class="next-dir" href="#/day/${next.day}"><div class="dn-dir">next ›</div><div class="dn-t">Day ${next.day} — ${next.title}</div></a>`:`<a class="next-dir disabled"><div class="dn-dir">next ›</div><div class="dn-t">Latest entry</div></a>`}
    </div>
  </div>`;
  window.scrollTo(0,0);
}

/* ---------- ROADMAP ---------- */
function viewRoadmap(){
  // Hide any planned day already logged in JOURNAL — no manual "move" needed.
  const upcoming=PLAN.filter(p=>{
    const m=(p.day||'').match(/\d+/);
    return !(m && byDay(m[0]));
  });
  $app.innerHTML=`
  <div class="page-header fade">
    <div class="page-eyebrow">// full project roadmap</div>
    <div class="page-title">The 4-Phase Plan</div>
    <div class="page-sub">From foundation to a production app live on AWS. Each phase ends with a gate check that must pass before moving on.</div>
  </div>
  <div class="sec-head"><div class="sec-label">// planned build order — phase 1</div><div class="sec-line"></div></div>
  <div class="block note fade" style="margin-bottom:32px">
    <div class="block-head">Upcoming days</div>
    <div class="block-body">
      ${upcoming.length ? upcoming.map(p=>`<div class="upcoming-item"><div class="uday">${p.day}</div><div><div class="utitle">${p.title}</div><div class="udesc">${p.desc}</div></div></div>`).join('') : `<div class="udesc" style="padding:6px 0">All planned days for this phase are logged. 🎉</div>`}
    </div>
  </div>
  <div class="sec-head"><div class="sec-label">// the phases</div><div class="sec-line"></div></div>
  ${PHASES.map(p=>`
    <div class="phase-block fade">
      <div class="phase-header"><div class="phase-name">${p.name}</div><div class="phase-tag ${p.status}">${p.when}${p.status==='active'?' · In progress':''}</div></div>
      <div class="phase-body">
        <div class="phase-progress">${phaseSteps(p)}</div>
        <div class="phase-desc">${p.desc}</div>
      </div>
    </div>`).join('')}
  `;
}

/* ---------- sidebar + router ---------- */
function buildSidebarDays(){
  const wrap=document.getElementById('navDays');
  wrap.innerHTML=byDate().slice().reverse().map(d=>{
    const es=effStatus(d);
    return `<a class="nav-item" data-view="day" data-day="${d.day}" href="#/day/${d.day}">
      <div class="nav-dot" style="background:${es==='upcoming'?'var(--ink3)':'var(--g)'}"></div>
      <div class="nav-text"><strong>Day ${d.day}${es==='done'?' ✓':(es==='today'?' • today':'')}</strong>${d.title.split('·')[0].trim().slice(0,30)}</div>
    </a>`;}).join('');
}
function buildProgress(){
  const logged=JOURNAL.filter(d=>d.status!=='upcoming').length;
  document.getElementById('pgLabel').textContent=`Day ${logged} / ~${META.totalDays}`;
  document.getElementById('pgFill').style.width=Math.max(4,Math.round(logged/META.totalDays*100))+'%';
  document.getElementById('pgPhases').innerHTML=PHASES.map(p=>`<div class="ph ${p.status==='active'?'active':(p.status==='done'?'done':'')}"></div>`).join('');
}
function setActiveNav(view,day){
  document.querySelectorAll('.nav-item').forEach(n=>{
    const isDay=n.dataset.view==='day';
    let on = n.dataset.view===view && !isDay;
    if(view==='day'&&isDay&&Number(n.dataset.day)===Number(day)) on=true;
    n.classList.toggle('active',on);
  });
}
function router(){
  const raw=location.hash.replace(/^#\/?/,'')||'dashboard';
  const [view,param]=raw.split('/');
  switch(view){
    case 'calendar': viewCalendar(); break;
    case 'timeline': viewTimeline(); break;
    case 'roadmap': viewRoadmap(); break;
    case 'day': viewDay(param); break;
    default: viewDashboard();
  }
  setActiveNav(view,param);
  if(window.innerWidth<=900) closeSidebar();
}

/* ---------- mobile sidebar ---------- */
const sidebar=document.getElementById('sidebar');
const overlay=document.getElementById('overlay');
const hbtn=document.getElementById('hbtn');
function openSidebar(){sidebar.classList.add('open');overlay.classList.add('on');document.body.style.overflow='hidden';}
function closeSidebar(){sidebar.classList.remove('open');overlay.classList.remove('on');document.body.style.overflow='';}
hbtn.addEventListener('click',openSidebar);
overlay.addEventListener('click',closeSidebar);

/* ---------- boot ---------- */
buildSidebarDays();
buildProgress();
window.addEventListener('hashchange',router);
router();
