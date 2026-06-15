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
    { file:"entity/animal/AnimalHealthRecord.java", sub:"the result of a symptom check — every field explained",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "animal_health_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">AnimalHealthRecord</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "health_record_id")</span>
    <span class="kw">private</span> Long healthRecordId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY health checks → ONE animal. Lakshmi may have 10 over her life.</span>

    <span class="ann">@Column(name = "symptoms_json", nullable = false)</span>
    <span class="kw">private</span> String symptomsJson;
    <span class="cmt">// the tapped symptoms, saved as a small list: ["FEVER","NASAL_DISCHARGE"]</span>
    <span class="cmt">// one column instead of a whole extra table — simpler and faster</span>

    <span class="ann">@Column(name = "additional_notes", length = 1000)</span>
    <span class="kw">private</span> String additionalNotes;
    <span class="cmt">// the free-text box, for anything not in the tile list</span>
    <span class="cmt">// real example: "passing blood in stool since 2 days"</span>

    <span class="ann">@Column(name = "predicted_disease", length = 200)</span>
    <span class="kw">private</span> String predictedDisease;     <span class="cmt">// the AI's best guess: "Foot and Mouth Disease"</span>

    <span class="ann">@Column(name = "confidence_score")</span>
    <span class="kw">private</span> Double confidenceScore;       <span class="cmt">// 0.78 = 78% sure. Shown as a little bar.</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "severity", length = 20)</span>
    <span class="kw">private</span> HealthStatus severity;        <span class="cmt">// reuses our health list: SICK / CRITICAL …</span>

    <span class="ann">@Column(name = "action_required", length = 500)</span>
    <span class="kw">private</span> String actionRequired;        <span class="cmt">// plain advice: "Isolate immediately, call vet"</span>

    <span class="ann">@Column(name = "is_vet_visit_required", nullable = false)</span>
    <span class="kw">private</span> Boolean isVetVisitRequired = <span class="kw">false</span>;
    <span class="cmt">// true → a "Connect with Expert" button appears, chat pre-filled with everything</span>

    <span class="ann">@Column(name = "is_resolved", nullable = false)</span>
    <span class="kw">private</span> Boolean isResolved = <span class="kw">false</span>;
    <span class="cmt">// false = still active (shows on dashboard). true = sorted, moves to history.</span>

    <span class="ann">@Column(name = "checked_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime checkedAt = LocalDateTime.now();
    <span class="cmt">// used to show "3 days ago" on Lakshmi's health timeline</span>
}` },
    { file:"enums/animal/RecordType.java", sub:"each type carries its own unit, so the screen labels itself",
      code:`<span class="kw">public enum</span> <span class="cls">RecordType</span> {

    <span class="val">MILK</span>(<span class="str">"Milk"</span>, <span class="str">"litres"</span>),
    <span class="cmt">// Cow, Buffalo, Goat, Sheep, Camel → input shows "8.5 litres"</span>

    <span class="val">EGG</span>(<span class="str">"Egg"</span>, <span class="str">"count"</span>),
    <span class="cmt">// Hen, Duck, Dove, Quail, Turkey → input shows "3 eggs"</span>

    <span class="val">WEIGHT_YIELD</span>(<span class="str">"Weight Yield"</span>, <span class="str">"kg"</span>);
    <span class="cmt">// Wool, honey, silk cocoons, fish → input shows "2.4 kg"</span>

    <span class="kw">private final</span> String displayName;
    <span class="kw">private final</span> String unit;

    <span class="cls">RecordType</span>(String displayName, String unit) {
        <span class="kw">this</span>.displayName = displayName;
        <span class="kw">this</span>.unit = unit;
    }

    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
    <span class="kw">public</span> String <span class="prop">getUnit</span>() { <span class="kw">return</span> unit; }
    <span class="cmt">// the app reads .getUnit() to print the right label — no if/else needed</span>
}` },
    { file:"entity/animal/AnimalProductionRecord.java", sub:"milk, eggs, wool, honey — one simple book for all",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "animal_production_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">AnimalProductionRecord</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "production_record_id")</span>
    <span class="kw">private</span> Long productionRecordId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY records → ONE animal. Lakshmi has 730 in a year (twice daily).</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "record_type", nullable = false, length = 20)</span>
    <span class="kw">private</span> RecordType recordType;
    <span class="cmt">// the app fills this from the animal's type. Saved here so "all egg records"</span>
    <span class="cmt">// is a one-line search instead of a three-table lookup.</span>

    <span class="ann">@Column(name = "record_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate recordDate;

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "session", nullable = false, length = 10)</span>
    <span class="kw">private</span> ProductionSession session;
    <span class="cmt">// MORNING / EVENING for milk + eggs. HARVEST for wool, honey, silk, fish.</span>

    <span class="ann">@Column(name = "quantity", nullable = false)</span>
    <span class="kw">private</span> Double quantity;
    <span class="cmt">// 8.5 litres / 3 eggs / 2.4 kg. The unit label comes from the type. Zero extra code.</span>

    <span class="ann">@Column(name = "is_drop_detected", nullable = false)</span>
    <span class="kw">private</span> Boolean isDropDetected = <span class="kw">false</span>;
    <span class="cmt">// turns true when today is &gt;20% below the recent average → warns Gowtham early</span>

    <span class="ann">@Column(name = "harvest_cycle", length = 100)</span>
    <span class="kw">private</span> String harvestCycle;
    <span class="cmt">// a tidy label for yield records: "Shearing cycle 1 — June 2026". Blank for milk/eggs.</span>

    <span class="ann">@Column(name = "notes", length = 500)</span>
    <span class="kw">private</span> String notes;          <span class="cmt">// free note: "Lakshmi seemed restless this morning"</span>

    <span class="ann">@Column(name = "recorded_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime recordedAt = LocalDateTime.now();
}` },
    { file:"entity/animal/VaccinationRecord.java", sub:"created automatically — Gowtham never adds these by hand",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "vaccination_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">VaccinationRecord</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "vaccination_record_id")</span>
    <span class="kw">private</span> Long vaccinationRecordId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// 4 records appear for Lakshmi the moment she's registered</span>

    <span class="ann">@Column(name = "vaccine_name", nullable = false, length = 200)</span>
    <span class="kw">private</span> String vaccineName;      <span class="cmt">// "Foot and Mouth Disease (FMD) Vaccine"</span>
    <span class="ann">@Column(name = "vaccine_name_tamil", length = 200)</span>
    <span class="kw">private</span> String vaccineNameTamil;
    <span class="ann">@Column(name = "vaccine_name_hindi", length = 200)</span>
    <span class="kw">private</span> String vaccineNameHindi;

    <span class="ann">@Column(name = "disease_protected_against", length = 200)</span>
    <span class="kw">private</span> String diseaseProtectedAgainst;   <span class="cmt">// so Gowtham sees why it matters</span>

    <span class="ann">@Column(name = "due_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate dueDate;
    <span class="cmt">// the app checks this daily. 3 days before → "due soon" + a push.</span>

    <span class="ann">@Column(name = "administered_date")</span>
    <span class="kw">private</span> LocalDate administeredDate;        <span class="cmt">// blank until the shot is given</span>

    <span class="ann">@Column(name = "next_due_date")</span>
    <span class="kw">private</span> LocalDate nextDueDate;
    <span class="cmt">// worked out automatically after a shot (e.g. +6 months) → a fresh record is</span>
    <span class="cmt">// created for that date. The cycle keeps going on its own, forever.</span>

    <span class="ann">@Column(name = "administered_by", length = 200)</span>
    <span class="kw">private</span> String administeredBy;            <span class="cmt">// "Dr. Rajesh, Karur Govt Vet Hospital"</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "vaccination_status", nullable = false, length = 20)</span>
    <span class="kw">private</span> VaccinationStatus vaccinationStatus = VaccinationStatus.PENDING;
    <span class="cmt">// PENDING grey · DUE_SOON amber + push · OVERDUE red + alert · COMPLETED green</span>

    <span class="ann">@Column(name = "notes", length = 500)</span>
    <span class="kw">private</span> String notes;          <span class="cmt">// "Mild reaction, monitor for 24 hours"</span>

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
      </table>` }
  ],
  next:[
    `<span>The crop side begins</span> — soil tests, live weather, and the AI advice that grows out of them.`
  ],
  snapshot:{ entities:10, enums:9, tables:12, endpoints:0 }
});
