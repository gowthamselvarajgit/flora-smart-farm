/* ============================================================================
   DAY 3 — Health · Production · Vaccination records · Production system design
   ============================================================================ */
JOURNAL.push({
  day:3,
  date:"2026-06-13",
  title:"AnimalHealthRecord · AnimalProductionRecord · VaccinationRecord · Production system design",
  phase:1, status:"done",
  tags:["Animal domain","Health records","Production tracking","Vaccination","System design","Enums"],
  summary:"We gave each animal a memory. Flora can now record a health check, track daily milk and eggs (and spot a worrying drop), and run a vaccination schedule that looks after itself — Gowtham never has to set a reminder by hand.",
  story:`<p>An animal isn't a one-time form — it's a living thing with a story over time. <span class="hl">Lakshmi</span> might fall ill in July, give less milk one cold morning, and need her vaccine every six months. Today we built the three "memory" books that follow each animal through its life.</p>
  <p>The <b>health book</b> stores symptom checks and what to do. The <b>production book</b> records each day's milk or eggs and quietly flags a sudden drop. The <b>vaccination book</b> is the clever one: the moment Gowtham registers an animal, Flora <span class="hl">creates its vaccine reminders automatically</span> — and after each shot, it schedules the next one. The reminder loop never stops, and he never typed a thing.</p>`,
  built:[
    `<span>Health check record</span> — stores the symptoms Gowtham picked, any extra notes he typed, the likely illness, how serious it is, and whether a vet visit is needed.`,
    `<span>Symptom list</span> — 21 common symptoms as tappable tiles. A free-text box handles anything unusual that isn't on the list.`,
    `<span>Production record</span> — one simple book for milk, eggs, wool, honey and fish. The app already knows which one to track for each animal.`,
    `<span>Drop detector</span> — if today's milk is more than 20% below the recent average, the app flags it and warns Gowtham early.`,
    `<span>Vaccination record</span> — vaccine name, due date, status, and the next due date worked out automatically after each dose.`,
    `<span>Status list with colours</span> — Pending (grey), Due soon (amber), Overdue (red), Done (green). The colour decides the badge and when a reminder is sent.`,
    `<span>3 new tables</span> — health, production and vaccination records. We're now at 12 tables.`
  ],
  understood:[
    `<span>Sometimes you save what you could calculate — on purpose</span> — The app could always work out "is this a milk or egg record?" from the animal. But copying that answer straight into the record turns "show me all egg records" from a slow three-table lookup into a one-line search. Worth the small duplication.`,
    `<span>Fixed tiles + a free-text box = the best of both</span> — Tappable symptom tiles are fast and tidy for the app to understand. The free-text box catches the rare, unusual things (like "passing blood since two days"). The AI uses the tiles; the vet reads the notes.`,
    `<span>Three buckets cover every farm animal</span> — Milk (cow, buffalo, goat…), Eggs (hen, duck, quail…), and Weight/yield (wool, honey, silk, fish). Animals like dogs that produce nothing simply have no tracking. Three buckets, every Indian farm animal handled.`,
    `<span>Auto-set reminders = zero effort</span> — Register Lakshmi and four vaccine reminders appear instantly with due dates. Three days before each, a push arrives. Tap "Done" and the next dose schedules itself. Gowtham never opens a calendar.`,
    `<span>One flag can connect two features</span> — When a health check says "vet needed", a "Connect with Expert" button appears, and the chat opens already filled with the animal, the illness and the notes. Gowtham doesn't retype anything.`,
    `<span>A neat label vs a free note are different jobs</span> — "Shearing cycle 1 — June 2026" is a tidy label for grouping. "Lakshmi seemed restless" is a free note for a human to read later. Different purposes, different fields.`
  ],
  code:[
    { file:"entity/animal/AnimalHealthRecord.java", sub:"one row = one symptom check; the AI's answer is saved with it",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one symptom check on an animal. Maps to "animal_health_records".</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "animal_health_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">AnimalHealthRecord</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "health_record_id")</span>
    <span class="kw">private</span> Long healthRecordId;
    <span class="cmt">// the unique id of this check.   Example: 1</span>

    <span class="cmt">// ==================== WHICH ANIMAL ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY checks → ONE animal. Lakshmi may have 10 checks over her life.</span>

    <span class="cmt">// ==================== WHAT THE FARMER ENTERED ====================</span>

    <span class="ann">@Column(name = "symptoms_json", nullable = false)</span>
    <span class="cmt">// the tapped symptoms, saved as a small list in one column</span>
    <span class="kw">private</span> String symptomsJson;
    <span class="cmt">// Example: ["FEVER","NASAL_DISCHARGE"]   (no extra table needed)</span>

    <span class="ann">@Column(name = "additional_notes", length = 1000)</span>
    <span class="cmt">// optional free-text box, for anything not in the tile list</span>
    <span class="kw">private</span> String additionalNotes;
    <span class="cmt">// Example: "passing blood in stool since 2 days"</span>

    <span class="cmt">// ==================== THE AI'S ANSWER ====================</span>

    <span class="ann">@Column(name = "predicted_disease", length = 200)</span>
    <span class="kw">private</span> String predictedDisease;
    <span class="cmt">// the AI's best guess.   Example: "Foot and Mouth Disease"</span>

    <span class="ann">@Column(name = "confidence_score")</span>
    <span class="kw">private</span> Double confidenceScore;
    <span class="cmt">// how sure the AI is.   Example: 0.78 = 78% (shown as a small bar)</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "severity", length = 20)</span>
    <span class="kw">private</span> HealthStatus severity;
    <span class="cmt">// reuses the HealthStatus list from Day 2: SICK / CRITICAL …</span>

    <span class="ann">@Column(name = "action_required", length = 500)</span>
    <span class="kw">private</span> String actionRequired;
    <span class="cmt">// plain advice.   Example: "Isolate immediately, call the vet"</span>

    <span class="cmt">// ==================== FLAGS ====================</span>

    <span class="ann">@Column(name = "is_vet_visit_required", nullable = false)</span>
    <span class="kw">private</span> Boolean isVetVisitRequired = <span class="kw">false</span>;
    <span class="cmt">// true → a "Connect with Expert" button appears, chat pre-filled with everything</span>

    <span class="ann">@Column(name = "is_resolved", nullable = false)</span>
    <span class="kw">private</span> Boolean isResolved = <span class="kw">false</span>;
    <span class="cmt">// false = still active (shows on dashboard)   ·   true = sorted, moves to history</span>

    <span class="cmt">// ==================== TIMESTAMP ====================</span>

    <span class="ann">@Column(name = "checked_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime checkedAt = LocalDateTime.now();
    <span class="cmt">// used to show "3 days ago" on Lakshmi's health timeline</span>
}` },
    { file:"enums/animal/RecordType.java", sub:"a fixed list of what animals produce; each carries its own unit",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// A fixed list of what an animal produces. Each choice also carries its unit,</span>
<span class="cmt">// so the input screen can label itself with no extra code.</span>

<span class="kw">public enum</span> <span class="cls">RecordType</span> {

    <span class="cmt">// ============ THE ALLOWED CHOICES (name, unit) ============</span>

    <span class="val">MILK</span>(<span class="str">"Milk"</span>, <span class="str">"litres"</span>),
    <span class="cmt">// Cow, Buffalo, Goat, Sheep, Camel → input shows "8.5 litres"</span>

    <span class="val">EGG</span>(<span class="str">"Egg"</span>, <span class="str">"count"</span>),
    <span class="cmt">// Hen, Duck, Dove, Quail, Turkey → input shows "3 eggs"</span>

    <span class="val">WEIGHT_YIELD</span>(<span class="str">"Weight Yield"</span>, <span class="str">"kg"</span>);
    <span class="cmt">// Wool, honey, silk cocoons, fish → input shows "2.4 kg"</span>

    <span class="cmt">// ============ THE TWO LABELS EACH CHOICE CARRIES ============</span>

    <span class="kw">private final</span> String displayName;  <span class="cmt">// the friendly name, e.g. "Milk"</span>
    <span class="kw">private final</span> String unit;         <span class="cmt">// the unit, e.g. "litres"</span>

    <span class="cmt">// ============ CONSTRUCTOR (runs once for each choice) ============</span>

    <span class="cls">RecordType</span>(String displayName, String unit) {
        <span class="kw">this</span>.displayName = displayName;
        <span class="kw">this</span>.unit = unit;
    }

    <span class="cmt">// ============ GETTERS (read the labels back) ============</span>

    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
    <span class="kw">public</span> String <span class="prop">getUnit</span>() { <span class="kw">return</span> unit; }
    <span class="cmt">// Example: RecordType.MILK.getUnit() → "litres" — the screen needs no if/else</span>
}` },
    { file:"entity/animal/AnimalProductionRecord.java", sub:"one row = one day's milk, eggs or yield — one book for all",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one day's milk, eggs or yield. Maps to "animal_production_records".</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "animal_production_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">AnimalProductionRecord</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "production_record_id")</span>
    <span class="kw">private</span> Long productionRecordId;
    <span class="cmt">// the unique id of this record.   Example: 1</span>

    <span class="cmt">// ==================== WHICH ANIMAL ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY records → ONE animal. Lakshmi has 730 in a year (twice a day).</span>

    <span class="cmt">// ==================== WHAT + WHEN ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "record_type", nullable = false, length = 20)</span>
    <span class="kw">private</span> RecordType recordType;
    <span class="cmt">// the app fills this from the animal's type (MILK / EGG / WEIGHT_YIELD).</span>
    <span class="cmt">// saved here so "all egg records" is a one-line search, not a 3-table join.</span>

    <span class="ann">@Column(name = "record_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate recordDate;
    <span class="cmt">// just the day.   Example: 2026-06-13</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "session", nullable = false, length = 10)</span>
    <span class="kw">private</span> ProductionSession session;
    <span class="cmt">// MORNING / EVENING for milk + eggs. HARVEST for wool, honey, silk, fish.</span>

    <span class="cmt">// ==================== THE NUMBER ====================</span>

    <span class="ann">@Column(name = "quantity", nullable = false)</span>
    <span class="kw">private</span> Double quantity;
    <span class="cmt">// Example: 8.5 (litres) / 3 (eggs) / 2.4 (kg). The unit comes from recordType.</span>

    <span class="cmt">// ==================== DROP DETECTOR ====================</span>

    <span class="ann">@Column(name = "is_drop_detected", nullable = false)</span>
    <span class="kw">private</span> Boolean isDropDetected = <span class="kw">false</span>;
    <span class="cmt">// turns true when today is &gt;20% below the recent average → warns Gowtham early</span>

    <span class="cmt">// ==================== EXTRA NOTES ====================</span>

    <span class="ann">@Column(name = "harvest_cycle", length = 100)</span>
    <span class="kw">private</span> String harvestCycle;
    <span class="cmt">// a tidy label for yield records, e.g. "Shearing cycle 1 — June 2026". Blank for milk/eggs.</span>

    <span class="ann">@Column(name = "notes", length = 500)</span>
    <span class="kw">private</span> String notes;
    <span class="cmt">// free note.   Example: "Lakshmi seemed restless this morning"</span>

    <span class="cmt">// ==================== TIMESTAMP ====================</span>

    <span class="ann">@Column(name = "recorded_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime recordedAt = LocalDateTime.now();
}` },
    { file:"entity/animal/VaccinationRecord.java", sub:"one row = one vaccine reminder; created automatically",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one vaccine reminder for an animal. Maps to "vaccination_records".</span>
<span class="cmt">// These are created automatically when an animal is registered.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "vaccination_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">VaccinationRecord</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "vaccination_record_id")</span>
    <span class="kw">private</span> Long vaccinationRecordId;
    <span class="cmt">// the unique id of this reminder.   Example: 1</span>

    <span class="cmt">// ==================== WHICH ANIMAL ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// 4 reminders appear for Lakshmi the moment she is registered</span>

    <span class="cmt">// ============ VACCINE NAME (in three languages) ============</span>

    <span class="ann">@Column(name = "vaccine_name", nullable = false, length = 200)</span>
    <span class="kw">private</span> String vaccineName;      <span class="cmt">// Example: "Foot and Mouth Disease (FMD) Vaccine"</span>
    <span class="ann">@Column(name = "vaccine_name_tamil", length = 200)</span>
    <span class="kw">private</span> String vaccineNameTamil;
    <span class="ann">@Column(name = "vaccine_name_hindi", length = 200)</span>
    <span class="kw">private</span> String vaccineNameHindi;

    <span class="ann">@Column(name = "disease_protected_against", length = 200)</span>
    <span class="kw">private</span> String diseaseProtectedAgainst;
    <span class="cmt">// shown so Gowtham sees why the shot matters</span>

    <span class="cmt">// ==================== DATES ====================</span>

    <span class="ann">@Column(name = "due_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate dueDate;
    <span class="cmt">// the app checks this daily. 3 days before → "due soon" + a push.</span>

    <span class="ann">@Column(name = "administered_date")</span>
    <span class="kw">private</span> LocalDate administeredDate;
    <span class="cmt">// blank until the shot is actually given</span>

    <span class="ann">@Column(name = "next_due_date")</span>
    <span class="kw">private</span> LocalDate nextDueDate;
    <span class="cmt">// worked out after a shot (e.g. +6 months) → a fresh reminder is created.</span>
    <span class="cmt">// the cycle keeps itself going, forever.</span>

    <span class="cmt">// ==================== WHO GAVE IT ====================</span>

    <span class="ann">@Column(name = "administered_by", length = 200)</span>
    <span class="kw">private</span> String administeredBy;
    <span class="cmt">// optional.   Example: "Dr. Rajesh, Karur Govt Vet Hospital"</span>

    <span class="cmt">// ==================== STATUS ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "vaccination_status", nullable = false, length = 20)</span>
    <span class="kw">private</span> VaccinationStatus vaccinationStatus = VaccinationStatus.PENDING;
    <span class="cmt">// PENDING grey · DUE_SOON amber + push · OVERDUE red + alert · COMPLETED green</span>

    <span class="cmt">// ==================== NOTES + TIMESTAMPS ====================</span>

    <span class="ann">@Column(name = "notes", length = 500)</span>
    <span class="kw">private</span> String notes;          <span class="cmt">// Example: "Mild reaction, monitor for 24 hours"</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}` }
  ],
  extras:[
    { type:"flow", title:"The vaccination loop that runs itself",
      steps:[
        { icon:"🐄", label:"Register Lakshmi", note:"" },
        { icon:"📅", label:"4 reminders appear", note:"with due dates, automatically" },
        { icon:"🔔", label:"Push 3 days before", note:"\"FMD vaccine due Sunday\"" },
        { icon:"💉", label:"Tap \"Done\"", note:"after the vet visit" },
        { icon:"🔁", label:"Next dose scheduled", note:"+6 months, on its own" }
      ]
    },
    { type:"flow", title:"What happens when milk drops",
      steps:[
        { icon:"🥛", label:"Enter today's milk", note:"6.1 L this morning" },
        { icon:"📉", label:"App compares", note:"vs recent average 8.5 L" },
        { icon:"⚠️", label:"Drop flagged", note:"more than 20% down" },
        { icon:"🔔", label:"Gowtham warned", note:"\"Lakshmi's milk dropped 28%\"" }
      ]
    },
    { type:"glossary", title:"New ideas on this page, in plain English",
      items:[
        { term:"Saving a small list in one box", def:"Instead of a whole extra table for a few tick-boxes, we write the list as text in one column. Simpler, and quick to read back when you always want the whole list.",
          eg:"<em>[\"FEVER\",\"NASAL_DISCHARGE\"]</em> sits in a single cell — no separate \"symptoms\" table needed." },
        { term:"Reusing a list we already have", def:"If a list we already made fits perfectly, we reuse it instead of inventing a near-identical one. Less code, and the meaning stays the same everywhere.",
          eg:"\"How serious is it?\" reuses the <em>HealthStatus</em> list (SICK / CRITICAL …) we built on Day 2." },
        { term:"A choice that carries two facts", def:"A choice can hold more than one extra value. Each production type carries both a friendly name and its unit.",
          eg:"<em>MILK = \"Milk\" + \"litres\"</em> — the screen prints \"litres\" next to the number, with no extra code." },
        { term:"Copying a value on purpose (to search fast)", def:"Normally we never store what we can calculate. The exception: if we'll search by it constantly, copying it into its own column turns a slow lookup into an instant one.",
          eg:"Saving <em>record_type = EGG</em> on each record makes \"show all egg records\" instant." },
        { term:"A field the app fills for you", def:"A value the app works out from other data, so the farmer never types it. Less to enter means fewer mistakes.",
          eg:"The app sets <em>recordType</em> from the animal's type. Gowtham just types \"8.5\"." },
        { term:"Auto-creating related records", def:"When one thing is created, the app quietly sets up the related records too, so the user gets a ready-made experience.",
          eg:"Register Lakshmi → her 4 vaccine reminders appear instantly. He adds nothing." },
        { term:"A status that decides what happens", def:"A choice that doesn't just label a row — it drives the app: the badge colour, when a push is sent, whether an alert is raised.",
          eg:"<em>DUE_SOON</em> turns the badge amber AND fires a push 3 days early; <em>OVERDUE</em> turns it red AND raises an alert." },
        { term:"A loop that renews itself", def:"A record that, once finished, creates its own replacement for next time — so the schedule never needs manual upkeep.",
          eg:"Mark the FMD vaccine done → the app makes a fresh reminder 6 months later. The loop never stops." }
      ]
    },
    { type:"diagram", title:"Lakshmi's three record books, all linked to her",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Lakshmi</span> (animal_id=1)
    │
    ├── <span style="color:var(--g)">Health checks</span>
    │       fever + nasal discharge → likely "Foot &amp; Mouth", 78% sure
    │       vet needed: yes  ──► opens Expert Chat, already filled in
    │
    ├── <span style="color:var(--g)">Production (milk)</span>
    │       Mon morning 8.5 L · Mon evening 6.0 L
    │       Tue morning 6.1 L  <span style="color:var(--r)">← 28% drop flagged</span>  ──► warns Gowtham
    │
    └── <span style="color:var(--g)">Vaccinations</span>
            FMD · due 2026-12-13 · pending
            + 3 more, all created automatically when she was registered</pre>` },
    { type:"table", title:"Which animals produce what — the three buckets",
      html:`<table class="ann-table">
        <thead><tr><th>Bucket</th><th>Unit</th><th>Animals</th><th>When recorded</th></tr></thead>
        <tbody>
          <tr><td>Milk</td><td>litres</td><td>Cow, Buffalo, Goat, Sheep, Camel</td><td>Morning + evening</td></tr>
          <tr><td>Eggs</td><td>count</td><td>Hen, Duck, Dove, Quail, Turkey</td><td>Once a day</td></tr>
          <tr><td>Weight / yield</td><td>kg</td><td>Wool, honey, silk cocoons, fish</td><td>At harvest</td></tr>
          <tr><td>None</td><td>—</td><td>Pig, Dog, Horse</td><td>No production tracking</td></tr>
        </tbody>
      </table>` },
    { type:"versus", title:"The one time it's OK to store what you could calculate",
      bad:{ label:"Work it out every time", code:`<span class="cmt">// to list all EGG records, join</span>
<span class="cmt">// 3 tables every single time:</span>
<span class="cmt">//   production → animal → animal_type</span>
<span class="cmt">// then keep only type = EGG.</span>
<span class="cmt">// slow, and repeated all over the code.</span>` },
      good:{ label:"Copy it onto the record", code:`<span class="ann">@Enumerated(EnumType.STRING)</span>
<span class="kw">private</span> RecordType recordType;

<span class="cmt">// the app fills this from the animal.</span>
<span class="cmt">// now \"all egg records\" is one line:</span>
<span class="cmt">//   WHERE record_type = 'EGG'</span>
<span class="cmt">// fast. a deliberate, worth-it copy.</span>` },
      note:`<b>One-line answer:</b> normally never store what you can calculate. The exception: a value you <b>filter by constantly</b> — copying it turns a slow 3-table join into a one-line search.` },
    { type:"qa", title:"Interview questions — Day 3 (tap to reveal the answer)",
      items:[
        { q:"Why save the symptoms as a JSON string instead of a separate table?",
          a:`The symptoms are a short list of tick-boxes we always read together as a whole. Saving them as a small JSON list in one column is simpler and faster than building and joining a separate table for a handful of values.` },
        { q:"You said never store derived data — but record_type is derived. Why store it?",
          a:`Because we <b>filter by it all the time</b> (\"show all egg records\"). Calculating it would mean joining three tables on every query. Copying it onto each record makes that a one-line search. It's a deliberate, worth-it exception to the rule.` },
        { q:"How does one production table handle milk, eggs and wool together?",
          a:`Each record has a <b>RecordType</b> (MILK / EGG / WEIGHT_YIELD), and the type carries its own unit (litres / count / kg). So one table and one \"quantity\" field cover every animal, and the screen shows the right unit with no extra code.` },
        { q:"How does the vaccination schedule keep itself going?",
          a:`When a dose is marked done, the app calculates the <b>next due date</b> (e.g. +6 months) and creates a fresh reminder for it. So the loop renews itself forever — the farmer never has to set a reminder by hand.` },
        { q:"How does a health check connect to the expert chat?",
          a:`The health record has an <b>is_vet_visit_required</b> flag. When it's true, the app shows a \"Connect with Expert\" button and opens the chat already filled with the animal, the likely illness, and the notes — so nothing is retyped.` }
      ]
    }
  ],
  next:[
    `<span>The crop side begins</span> — soil tests, live weather, and the AI advice that grows out of them.`
  ],
  snapshot:{ entities:10, enums:9, tables:12, endpoints:0 }
});
