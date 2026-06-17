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
  if(e.type==='concept') return renderConcept(e);
  if(e.type==='qa') return renderQa(e);
  if(e.type==='versus') return renderVersus(e);
  if(e.type==='farm') return renderFarm(e);
  if(e.type==='flow') return renderFlow(e);
  if(e.type==='diagram'){
    return `<div class="extra-title">${e.title}</div><div class="rel-diagram">${e.html}</div>`;
  }
  // default: table (or any raw html block)
  return `<div class="extra-title">${e.title}</div>${e.html}`;
}

/* Interview Q&A — each question opens to reveal a model answer (native <details>).
   Data: { type:'qa', title, items:[{q, a}] } */
function renderQa(e){
  const items=(e.items||[]).map(it=>
    `<details class="qa reveal"><summary><span class="qmark">Q</span><span class="qx">${it.q}</span></summary><div class="qa-ans"><span class="amark">A</span>${it.a}</div></details>`
  ).join('');
  return `<div class="extra-title">${e.title||'Interview questions'}</div>${items}`;
}

/* Good vs Bad — two code columns side by side, with a one-line takeaway.
   Data: { type:'versus', title, bad:{label,code}, good:{label,code}, note } */
function renderVersus(e){
  const note=e.note?`<div class="doc-note" style="margin-top:8px">${e.note}</div>`:'';
  return `<div class="extra-title">${e.title}</div>
    <div class="versus reveal">
      <div class="vcol bad"><div class="vh">✗ ${(e.bad&&e.bad.label)||'Avoid'}</div><pre>${(e.bad&&e.bad.code)||''}</pre></div>
      <div class="vcol good"><div class="vh">✓ ${(e.good&&e.good.label)||'Better'}</div><pre>${(e.good&&e.good.code)||''}</pre></div>
    </div>${note}`;
}

/* Concept card — one idea explained 3 ways: a real-life analogy, numbered
   steps that animate in, and a small table showing what actually gets stored.
   Data: { type:'concept', title, items:[{ term, meaning, analogy,
           steps:[...], table:{caption,head:[...],rows:[[...]],highlightCol,note} }] } */
function renderConcept(e){
  const cards=(e.items||[]).map(c=>{
    const steps=(c.steps||[]).map((s,i)=>`<li style="animation-delay:${i*150}ms">${s}</li>`).join('');
    let table='';
    if(c.table){
      const t=c.table;
      const head=(t.head||[]).map(h=>`<th>${h}</th>`).join('');
      const rows=(t.rows||[]).map(r=>`<tr>`+r.map((cell,ci)=>`<td class="${t.highlightCol===ci?'hl':''}">${cell}</td>`).join('')+`</tr>`).join('');
      table=`<div class="cseg"><div class="cseg-label">🗄️ what actually gets stored</div>
        <table class="ctable">${t.caption?`<caption>${t.caption}</caption>`:''}<thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
        ${t.note?`<div class="cnote">${t.note}</div>`:''}</div>`;
    }
    return `<div class="concept reveal">
      <div class="concept-term">${c.term}</div>
      <div class="concept-body">
        ${c.meaning?`<div class="concept-meaning">${c.meaning}</div>`:''}
        ${c.analogy?`<div class="cseg"><div class="cseg-label">🌾 like in real life</div><div class="canalogy">${c.analogy}</div></div>`:''}
        ${steps?`<div class="cseg"><div class="cseg-label">🪜 step by step</div><ol class="csteps">${steps}</ol></div>`:''}
        ${table}
      </div>
    </div>`;
  }).join('');
  return `<div class="extra-title">${e.title}</div>${cards}`;
}

/* Farm scene — a farmer, their plots of land, and the crops + animals on each.
   Data: { type:'farm', title, farmer:{name,sub,emoji}, lands:[{name,district,size,
           crops:[{name,emoji}], animals:[{name,emoji,count}]}] }  */
function renderFarm(e){
  const f=e.farmer||{};
  const plots=(e.lands||e.plots||[]).map((p,i)=>{
    const crops=(p.crops||[]).map(c=>`<span class="tag-chip crop"><span class="ic">${c.emoji||'🌱'}</span>${c.name}</span>`).join('');
    const animals=(p.animals||[]).map(a=>`<span class="tag-chip animal"><span class="ic">${a.emoji||'🐄'}</span>${a.name}${a.count?` <span class="cnt">×${a.count}</span>`:''}</span>`).join('');
    return `<div class="plot reveal" style="transition-delay:${i*90}ms">
      <div class="plot-top"><div class="plot-name">${p.name||'Land'}</div>${p.district?`<div class="plot-badge">📍 ${p.district}</div>`:''}</div>
      ${p.size?`<div class="plot-size">${p.size}</div>`:''}
      ${crops?`<div class="plot-row">${crops}</div>`:''}
      ${animals?`<div class="plot-row">${animals}</div>`:''}
    </div>`;
  }).join('');
  return `<div class="extra-title">${e.title}</div>
    <div class="farm">
      ${f.name?`<div class="farm-farmer"><div class="who">${f.emoji||'🧑‍🌾'}</div><div class="meta">${f.name}${f.sub?`<span>${f.sub}</span>`:''}</div></div>`:''}
      <div class="plots">${plots}</div>
    </div>`;
}

/* Flow pipeline — animated left-to-right steps with arrows between them.
   Data: { type:'flow', title, steps:[{icon,label,note}] }  */
function renderFlow(e){
  const steps=e.steps||[];
  let h='';
  steps.forEach((s,i)=>{
    h+=`<div class="flow-step" style="animation-delay:${i*130}ms"><span class="fic">${s.icon||'•'}</span><span class="flab">${s.label}</span>${s.note?`<span class="fnote">${s.note}</span>`:''}</div>`;
    if(i<steps.length-1) h+=`<div class="flow-arrow">→</div>`;
  });
  return `<div class="extra-title">${e.title}</div><div class="flow">${h}</div>`;
}

function renderDayBody(d){
  let h='';
  if(d.story) h+=`<div class="story reveal"><div class="story-label">// the story behind today</div>${d.story}</div>`;
  if(d.built&&d.built.length) h+=`<div class="block built reveal"><div class="block-head">What we built</div><div class="block-body">${elist('built',d.built)}</div></div>`;
  if(d.understood&&d.understood.length) h+=`<div class="block learned reveal"><div class="block-head">What clicked today</div><div class="block-body">${elist('learned',d.understood)}</div></div>`;
  if((d.code&&d.code.length)||(d.extras&&d.extras.length)){
    h+=`<div class="block code"><div class="block-head">Code &amp; design — files explained</div><div class="block-body">`;
    (d.code||[]).forEach(c=>{
      h+=`<div class="code-file"><div class="code-file-label">📄 ${c.file} <span>— ${c.sub}</span></div><div class="code-block"><pre>${c.code}</pre></div>${renderLineRef(c.lines)}</div>`;
    });
    (d.extras||[]).forEach(e=>{ h+=`<div class="reveal">${renderExtra(e)}</div>`; });
    h+=`</div></div>`;
  }
  if(d.next&&d.next.length) h+=`<div class="block next reveal"><div class="block-head">What comes next — Day ${d.day+1}</div><div class="block-body">${elist('next',d.next)}</div></div>`;
  return h;
}

/* Line-by-line explanation panel shown under a code block.
   Data: a code entry's optional `lines:[{c:"<one line of code>", e:"explanation html"}]`.
   The `c` (code) is HTML-escaped so raw Java like List<Crop> renders literally;
   the `e` (explanation) is treated as HTML so it can use <b> and <code>. */
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderLineRef(lines){
  if(!lines||!lines.length) return '';
  const rows=lines.map(l=>`<div class="lr-row"><code class="lr-code">${esc(l.c)}</code><div class="lr-exp">${l.e}</div></div>`).join('');
  return `<details class="lineref"><summary>📖 Line-by-line explanation — every line in plain English</summary><div class="lineref-body">${rows}</div></details>`;
}

/* Scroll-reveal: ease blocks in as they enter the viewport. Falls back to
   showing everything if the browser has no IntersectionObserver. */
function observeReveals(){
  const els=document.querySelectorAll('.reveal:not(.in)');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
  const io=new IntersectionObserver((entries,obs)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); } });
  },{rootMargin:'0px 0px -6% 0px',threshold:.06});
  els.forEach(e=>io.observe(e));
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

/* ---------- PROJECT DOCS ---------- */
function pillClass(s){
  s=(s||'').toLowerCase();
  if(s.includes('progress')) return 'progress';
  if(s.includes('plan')||s.includes('pending')) return 'planned';
  return 'done';
}
function viewDocs(){
  const D=(typeof DOCS!=='undefined')?DOCS:null;
  if(!D){ $app.innerHTML=`<div class="empty-state fade"><div class="es-ico">📘</div>Docs data not loaded.</div>`; return; }
  const snap=totalSnapshot();
  const doneFiles=D.files.length;

  const stack=D.stack.map(g=>`<div class="stack-group reveal"><h4>${g.icon} ${g.group}</h4>${g.items.map(it=>`<div class="stack-item"><b>${it.name}</b><span>${it.what}</span></div>`).join('')}</div>`).join('');
  const layers=D.layers.map(l=>`<div class="layer"><div class="ln">${l.name}</div><div class="lr">${l.role}<em>${l.eg}</em></div></div>`).join('');
  const mods=D.modules.map(m=>{
    const done=(m.done||[]).map(f=>`<span class="mf done">${f} ✓</span>`).join('');
    const todo=(m.pending||[]).map(f=>`<span class="mf todo">${f}</span>`).join('');
    return `<div class="mod-card reveal"><div class="mh"><span class="mi">${m.icon}</span><span class="mn">${m.name}</span><span class="pill ${pillClass(m.status)}">${m.status}</span></div><div class="mp">${m.purpose}</div><div class="mod-files">${done}${todo}</div></div>`;
  }).join('');
  const erd=D.erd.map(col=>{
    const boxes=col.entities.map(en=>{
      const pk=en.pk?`<li class="pk">🔑 ${en.pk}</li>`:'';
      const cols=(en.cols||[]).map(c=>`<li>${c}</li>`).join('');
      const fks=(en.fks||[]).map(f=>`<li class="fk">→ ${f}</li>`).join('');
      return `<div class="erd-box"><div class="et">${en.name}</div><ul>${pk}${cols}${fks}</ul></div>`;
    }).join('');
    return `<div class="erd-col"><h4>${col.module}</h4>${boxes}</div>`;
  }).join('');
  const fileRows=D.files.map(f=>`<tr><td>${f.path}</td><td>${f.type}</td><td>${f.module}</td><td><span class="pill ${pillClass(f.status)}">${f.status}</span></td></tr>`).join('');
  const pendRows=(D.pending||[]).map(f=>`<tr><td>${f.path}</td><td>${f.type}</td><td>${f.module}</td><td><span class="pill planned">Not yet</span></td></tr>`).join('');
  const enumRows=D.enums.map(e=>`<tr><td>${e.name}</td><td>${e.values}</td><td>${e.use}</td></tr>`).join('');

  $app.innerHTML=`
  <div class="page-header fade">
    <div class="page-eyebrow">// project documentation · ${D.updatedLabel||''}</div>
    <div class="page-title">Understand Flora, top to bottom</div>
    <div class="page-sub">Everything you need to read this project as if for the first time — what it is, what it's built with, how it's organised, and exactly which files exist today.</div>
  </div>

  <div class="stats fade">
    ${statCard(snap.entities,'entities (tables)','var(--p)')}
    ${statCard(snap.enums,'fixed lists (enums)','var(--g)')}
    ${statCard(doneFiles,'files completed','var(--b)')}
    ${statCard(D.modules.length,'feature modules','var(--a)')}
  </div>

  <div class="sec-head"><div class="sec-label">// 1 · what is Flora</div><div class="sec-line"></div></div>
  <div class="block note reveal"><div class="block-body"><div class="doc-intro">${D.intro.join('')}</div></div></div>

  <div class="sec-head"><div class="sec-label">// 2 · technology used</div><div class="sec-line"></div></div>
  <div class="stack-grid">${stack}</div>

  <div class="sec-head"><div class="sec-label">// 3 · how the code is organised</div><div class="sec-line"></div></div>
  <div class="block note reveal"><div class="block-head">The layers — front door to database</div><div class="block-body">${layers}</div></div>
  ${renderExtra({type:'flow',title:'One request, end to end',steps:D.requestFlow})}

  <div class="sec-head"><div class="sec-label">// 4 · the feature modules</div><div class="sec-line"></div></div>
  <div class="mod-grid">${mods}</div>

  <div class="sec-head"><div class="sec-label">// 5 · the data model (ERD)</div><div class="sec-line"></div></div>
  <div class="doc-note reveal">Each box is a table. <b>🔑</b> is its unique id. A <b style="color:var(--g)">→ green line</b> means "links to" another table. Read it like a map: a soil test points to a field, a field points to a farmer and a town.</div>
  <div class="erd" style="margin-top:14px">${erd}</div>

  <div class="sec-head"><div class="sec-label">// 6 · completed files</div><div class="sec-line"></div></div>
  <div class="doc-note reveal"><b>${doneFiles} files</b> built and saved so far — ${snap.entities} entities and ${snap.enums} enums, plus the app setup. Everything below is live in the project right now.</div>
  <table class="ann-table reveal" style="margin-top:12px">
    <thead><tr><th>File</th><th>Type</th><th>Module</th><th>Status</th></tr></thead>
    <tbody>${fileRows}</tbody>
  </table>

  <div class="extra-title" style="margin-top:22px">Still to build (the road ahead)</div>
  <table class="ann-table reveal">
    <thead><tr><th>File</th><th>Type</th><th>Module</th><th>Status</th></tr></thead>
    <tbody>${pendRows}</tbody>
  </table>

  <div class="sec-head"><div class="sec-label">// 7 · the fixed lists (enums)</div><div class="sec-line"></div></div>
  <table class="ann-table reveal">
    <thead><tr><th>Name</th><th>Allowed values</th><th>What it's for</th></tr></thead>
    <tbody>${enumRows}</tbody>
  </table>
  `;
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
    case 'docs': viewDocs(); break;
    case 'calendar': viewCalendar(); break;
    case 'timeline': viewTimeline(); break;
    case 'roadmap': viewRoadmap(); break;
    case 'day': viewDay(param); break;
    default: viewDashboard();
  }
  setActiveNav(view,param);
  observeReveals();
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
