/* ============================================================================
   DAY 3 — Health · Production · Vaccination records · Production system design
   ============================================================================ */
JOURNAL.push({
  day:3,
  date:"2026-06-13",
  title:"AnimalHealthRecord · AnimalProductionRecord · VaccinationRecord · Production system design",
  phase:1, status:"today",
  tags:["Animal domain","Health records","Production tracking","Vaccination","System design","Enums"],
  summary:"Completed the full animal sub-entity chain. Deep dive on production tracking design — why RecordType belongs in DB, how MILK/EGG/WEIGHT_YIELD covers all animals, symptom strategy (enum + free text), and auto-seeded vaccination schedule.",
  built:[
    `<span>AnimalHealthRecord entity</span> — symptoms checker result linked to one animal. Stores symptomsJson, additionalNotes (free text for edge cases like blood in stool), predictedDisease, confidenceScore, severity, actionRequired, isVetVisitRequired, isResolved.`,
    `<span>Symptom enum created</span> — 21 predefined symptoms across 5 categories (General, Respiratory, Digestive, Physical, Reproductive, Behavioural). Drives the symptom tile grid on mobile. additionalNotes handles anything not in the list.`,
    `<span>AnimalProductionRecord entity</span> — tracks milk, eggs, wool, honey, fish yield. RecordType (MILK/EGG/WEIGHT_YIELD) system-filled from animal type. ProductionSession (MORNING/EVENING/HARVEST). Drop detection flag for 20% decline alerts.`,
    `<span>RecordType enum with unit property</span> — MILK("Milk","litres"), EGG("Egg","count"), WEIGHT_YIELD("Weight Yield","kg"). Mobile reads recordType.getUnit() to show correct label on input field.`,
    `<span>ProductionSession enum</span> — MORNING, EVENING, HARVEST. HARVEST covers periodic yield: wool shearing, honey extraction, silk cocoon harvest, fish yield.`,
    `<span>AnimalType updated</span> — added recordType field. Cow→MILK, Hen→EGG, Rabbit→WEIGHT_YIELD, Dog→null. System reads this to decide which production tracking to show.`,
    `<span>VaccinationRecord entity</span> — per-animal vaccination schedule. vaccineName, dueDate, administeredDate, nextDueDate (auto-calculated on completion), VaccinationStatus (PENDING/DUE_SOON/OVERDUE/COMPLETED). Auto-seeded when animal is registered.`,
    `<span>VaccinationStatus enum</span> — PENDING (grey), DUE_SOON (amber, 3 days before), OVERDUE (red), COMPLETED (green). Drives badge colours and FCM push timing.`,
    `<span>3 new tables in MySQL</span> — animal_health_records, animal_production_records, vaccination_records. Total: 12 tables.`
  ],
  understood:[
    `<span>Why RecordType should be stored in DB even though system fills it</span> — The system can always calculate RecordType from animal → animalType, but querying "show me all egg records" would require a JOIN across 3 tables every time. Storing record_type='EGG' directly in animal_production_records makes it a simple WHERE clause. Store what you query — even if derived.`,
    `<span>Fixed enum symptoms + free text = best of both worlds</span> — Predefined symptom tiles (from Symptom enum) are fast to select, AI-friendly, consistent. The additionalNotes free text field handles anything outside the list — like Gowtham's dog passing blood in stool. The AI uses structured symptoms for ML prediction. The vet in Expert Chat reads the additional notes for full context.`,
    `<span>MILK/EGG/WEIGHT_YIELD covers every producing animal in India</span> — Cow/Buffalo/Goat/Sheep/Camel → MILK. Hen/Duck/Dove/Quail/Turkey → EGG. Rabbit/Silkworm/Honey Bee/Fish → WEIGHT_YIELD. Pig/Dog/Horse → null (no production tracking). This three-category system handles every animal a Tamil Nadu farmer could own.`,
    `<span>Vaccination auto-seeding means zero effort for the farmer</span> — Gowtham registers Lakshmi. Flora immediately creates 4 vaccination records with due dates. Gowtham never has to manually add vaccine reminders. 3 days before each date, he gets a push notification. After the vet visit, he taps "Done" — Flora calculates the next dose and seeds a new record automatically. The cycle continues forever.`,
    `<span>isVetVisitRequired connects health check to Expert Chat</span> — When the symptoms checker returns isVetVisitRequired=true, the mobile app automatically shows a "Connect with Expert" button. Tapping it opens the Expert Chat pre-filled with animal name, predicted disease, symptoms, and Gowtham's additional notes. The vet sees everything without Gowtham having to type it again.`,
    `<span>harvestCycle vs notes — two different purposes</span> — harvestCycle is structured context for WEIGHT_YIELD records: "Shearing cycle 1 — June 2026" or "Honey harvest — Summer batch". notes is free text for anything unusual that day: "Lakshmi seemed restless". Different purposes, different fields.`
  ],
  code:[
    { file:"entity/animal/AnimalHealthRecord.java", sub:"Lakshmi's symptoms check result — every field explained",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "animal_health_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">AnimalHealthRecord</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "health_record_id")</span>
    <span class="kw">private</span> Long healthRecordId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY health records → ONE animal</span>
    <span class="cmt">// Lakshmi can have 10 health checks over her lifetime. All point to animal_id=1.</span>

    <span class="ann">@Column(name = "symptoms_json", nullable = false)</span>
    <span class="kw">private</span> String symptomsJson;
    <span class="cmt">// Predefined symptoms selected from tiles (from Symptom enum)</span>
    <span class="cmt">// Stored as JSON: ["FEVER","NASAL_DISCHARGE","LETHARGY"]</span>
    <span class="cmt">// Why JSON string and not a join table? — simpler, faster, one column</span>
    <span class="cmt">// Symptom enum validates values before save — no invalid data reaches DB</span>

    <span class="ann">@Column(name = "additional_notes", length = 1000)</span>
    <span class="kw">private</span> String additionalNotes;
    <span class="cmt">// Free text for anything NOT in the predefined symptom list</span>
    <span class="cmt">// Real example: "passing blood in stool since 2 days" (Gowtham's dog)</span>
    <span class="cmt">// Shown to the expert in chat when vet visit is needed</span>
    <span class="cmt">// Nullable — most checks won't need this</span>

    <span class="ann">@Column(name = "predicted_disease", length = 200)</span>
    <span class="kw">private</span> String predictedDisease;
    <span class="cmt">// Flask ML model output: "Foot and Mouth Disease"</span>

    <span class="ann">@Column(name = "confidence_score")</span>
    <span class="kw">private</span> Double confidenceScore;
    <span class="cmt">// 0.78 = 78% confidence. Shown as a progress bar on the result screen.</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "severity", length = 20)</span>
    <span class="kw">private</span> HealthStatus severity;
    <span class="cmt">// Reusing HealthStatus enum: SICK / CRITICAL / RECOVERING</span>
    <span class="cmt">// Drives the badge colour on the symptom result card</span>

    <span class="ann">@Column(name = "action_required", length = 500)</span>
    <span class="kw">private</span> String actionRequired;
    <span class="cmt">// Plain text advice shown as main instruction: "Isolate immediately, call vet"</span>

    <span class="ann">@Column(name = "is_vet_visit_required", nullable = false)</span>
    <span class="kw">private</span> Boolean isVetVisitRequired = <span class="kw">false</span>;
    <span class="cmt">// true → mobile app shows "Connect with Expert" button automatically</span>
    <span class="cmt">// Expert chat opens pre-filled: animal name + disease + symptoms + notes</span>
    <span class="cmt">// Gowtham doesn't retype anything. Expert sees everything.</span>

    <span class="ann">@Column(name = "is_resolved", nullable = false)</span>
    <span class="kw">private</span> Boolean isResolved = <span class="kw">false</span>;
    <span class="cmt">// false = active issue, shows on dashboard as alert</span>
    <span class="cmt">// true  = Gowtham marked it resolved, moves to history</span>

    <span class="ann">@Column(name = "checked_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime checkedAt = LocalDateTime.now();
    <span class="cmt">// Used to show "3 days ago" on Lakshmi's health history timeline</span>
}` },
    { file:"enums/animal/RecordType.java", sub:"unit property — mobile reads this to show correct label",
      code:`<span class="kw">public enum</span> <span class="cls">RecordType</span> {

    <span class="val">MILK</span>(<span class="str">"Milk"</span>, <span class="str">"litres"</span>),
    <span class="cmt">// Cow, Buffalo, Goat, Sheep, Camel</span>
    <span class="cmt">// Input field shows: "8.5 litres"</span>

    <span class="val">EGG</span>(<span class="str">"Egg"</span>, <span class="str">"count"</span>),
    <span class="cmt">// Hen, Duck, Dove, Quail, Turkey</span>
    <span class="cmt">// Input field shows: "3 eggs"</span>

    <span class="val">WEIGHT_YIELD</span>(<span class="str">"Weight Yield"</span>, <span class="str">"kg"</span>);
    <span class="cmt">// Rabbit (fur), Sheep (wool), Silkworm (cocoons), Honey Bee (honey), Fish</span>
    <span class="cmt">// Input field shows: "2.4 kg"</span>

    <span class="kw">private final</span> String displayName;
    <span class="kw">private final</span> String unit;

    <span class="cls">RecordType</span>(String displayName, String unit) {
        <span class="kw">this</span>.displayName = displayName;
        <span class="kw">this</span>.unit = unit;
    }

    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
    <span class="kw">public</span> String <span class="prop">getUnit</span>() { <span class="kw">return</span> unit; }
    <span class="cmt">// recordType.getUnit() → "litres" / "count" / "kg"</span>
    <span class="cmt">// Mobile app shows the right unit label without any if/else logic</span>
}` },
    { file:"entity/animal/AnimalProductionRecord.java", sub:"milk, eggs, wool, honey — one entity for all",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "animal_production_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">AnimalProductionRecord</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "production_record_id")</span>
    <span class="kw">private</span> Long productionRecordId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY production records → ONE animal</span>
    <span class="cmt">// Lakshmi has 730 records after one year (365 days × 2 sessions)</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "record_type", nullable = false, length = 20)</span>
    <span class="kw">private</span> RecordType recordType;
    <span class="cmt">// System fills from animal.getAnimalType().getRecordType()</span>
    <span class="cmt">// Farmer never selects. Stored in DB for easy filtering:</span>
    <span class="cmt">// SELECT * FROM animal_production_records WHERE record_type = 'EGG'</span>

    <span class="ann">@Column(name = "record_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate recordDate;

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "session", nullable = false, length = 10)</span>
    <span class="kw">private</span> ProductionSession session;
    <span class="cmt">// MORNING / EVENING → milk + egg animals (daily rhythm)</span>
    <span class="cmt">// HARVEST           → wool, honey, silk, fish (periodic)</span>

    <span class="ann">@Column(name = "quantity", nullable = false)</span>
    <span class="kw">private</span> Double quantity;
    <span class="cmt">// MILK → 8.5 litres. EGG → 3.0 eggs. WEIGHT_YIELD → 2.4 kg.</span>
    <span class="cmt">// Unit label on screen comes from recordType.getUnit(). Zero extra code.</span>

    <span class="ann">@Column(name = "is_drop_detected", nullable = false)</span>
    <span class="kw">private</span> Boolean isDropDetected = <span class="kw">false</span>;
    <span class="cmt">// System sets true when: quantity < (avg of last 3 days × 0.80)</span>
    <span class="cmt">// i.e. more than 20% drop from recent average</span>
    <span class="cmt">// When true → alert created → FCM push to Gowtham: "Lakshmi's milk dropped"</span>

    <span class="ann">@Column(name = "harvest_cycle", length = 100)</span>
    <span class="kw">private</span> String harvestCycle;
    <span class="cmt">// WEIGHT_YIELD only: "Shearing cycle 1 — June 2026" or "Summer honey batch"</span>
    <span class="cmt">// Nullable — not used for MILK and EGG records</span>

    <span class="ann">@Column(name = "notes", length = 500)</span>
    <span class="kw">private</span> String notes;
    <span class="cmt">// Free text: "Lakshmi seemed restless during morning milking"</span>

    <span class="ann">@Column(name = "recorded_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime recordedAt = LocalDateTime.now();
}` },
    { file:"entity/animal/VaccinationRecord.java", sub:"auto-seeded on animal registration — Gowtham never creates these manually",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "vaccination_records")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">VaccinationRecord</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "vaccination_record_id")</span>
    <span class="kw">private</span> Long vaccinationRecordId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id", nullable = false)</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// MANY vaccination records → ONE animal</span>
    <span class="cmt">// Lakshmi gets 4 records auto-seeded when Gowtham registers her</span>

    <span class="ann">@Column(name = "vaccine_name", nullable = false, length = 200)</span>
    <span class="kw">private</span> String vaccineName;      <span class="cmt">// "Foot and Mouth Disease (FMD) Vaccine"</span>
    <span class="ann">@Column(name = "vaccine_name_tamil", length = 200)</span>
    <span class="kw">private</span> String vaccineNameTamil; <span class="cmt">// shown when language = TA</span>
    <span class="ann">@Column(name = "vaccine_name_hindi", length = 200)</span>
    <span class="kw">private</span> String vaccineNameHindi; <span class="cmt">// shown when language = HI</span>

    <span class="ann">@Column(name = "disease_protected_against", length = 200)</span>
    <span class="kw">private</span> String diseaseProtectedAgainst;
    <span class="cmt">// "Foot and Mouth Disease" — shown so Gowtham understands why it matters</span>

    <span class="ann">@Column(name = "due_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate dueDate;
    <span class="cmt">// @Scheduled AlertScheduler checks this every day</span>
    <span class="cmt">// 3 days before → status=DUE_SOON + push notification sent</span>
    <span class="cmt">// After due date, not done → status=OVERDUE + urgent dashboard alert</span>

    <span class="ann">@Column(name = "administered_date")</span>
    <span class="kw">private</span> LocalDate administeredDate;
    <span class="cmt">// null = not yet given. Filled when Gowtham marks as COMPLETED.</span>

    <span class="ann">@Column(name = "next_due_date")</span>
    <span class="kw">private</span> LocalDate nextDueDate;
    <span class="cmt">// Auto-calculated when COMPLETED: administeredDate + vaccine interval</span>
    <span class="cmt">// FMD → every 6 months. Brucellosis → every 12 months.</span>
    <span class="cmt">// System creates a NEW VaccinationRecord with this date. Cycle continues forever.</span>

    <span class="ann">@Column(name = "administered_by", length = 200)</span>
    <span class="kw">private</span> String administeredBy;
    <span class="cmt">// Optional: "Dr. Rajesh, Karur Govt Vet Hospital"</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "vaccination_status", nullable = false, length = 20)</span>
    <span class="kw">private</span> VaccinationStatus vaccinationStatus = VaccinationStatus.PENDING;
    <span class="cmt">// PENDING  → grey badge,  waiting for due date</span>
    <span class="cmt">// DUE_SOON → amber badge, 3 days before → push notification</span>
    <span class="cmt">// OVERDUE  → red badge,   missed the date → urgent alert</span>
    <span class="cmt">// COMPLETED → green badge, done → next dose auto-seeded</span>

    <span class="ann">@Column(name = "notes", length = 500)</span>
    <span class="kw">private</span> String notes;
    <span class="cmt">// "Animal had mild reaction, monitor for 24 hours"</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}` }
  ],
  extras:[
    { type:"glossary", title:"New design ideas on this page, in plain English",
      items:[
        { term:"Storing a list as a JSON String", def:"Sometimes you need to save a <b>small list inside one column</b> instead of building a whole extra table. We write the list as text in JSON format and store it in a single String column. Simpler and faster to read back when you always want the whole list at once.",
          eg:"<em>symptoms_json = [\"FEVER\",\"NASAL_DISCHARGE\"]</em> sits in one cell — no separate \"symptoms\" table needed for a handful of tick-boxes." },
        { term:"Enum validates before save", def:"Because the symptom tiles come from the <b>Symptom enum</b> (a fixed list), the app can only ever send valid values. Garbage like \"asdf\" can't reach the database — the closed list is the gatekeeper.",
          eg:"The screen only shows the 21 real symptoms, so the JSON can only ever contain those 21 words. No typos, no junk." },
        { term:"Reusing an enum as a field type (severity)", def:"You don't always invent a new enum. If an existing one already describes the values you need, <b>reuse it</b>. Less code, and the meaning stays consistent everywhere.",
          eg:"<em>severity</em> reuses <em>HealthStatus</em> (SICK / CRITICAL / RECOVERING) instead of creating a brand-new \"Severity\" enum that says the same thing." },
        { term:"Enum with TWO carried values", def:"An enum constant can hold <b>more than one extra value</b>. RecordType carries both a friendly name AND a unit. The constructor just takes two arguments instead of one.",
          eg:"<em>MILK(\"Milk\", \"litres\")</em> — the app reads <em>.getUnit()</em> to print \"litres\" next to the number, with zero if/else code." },
        { term:"\"Store what you query\" (controlled duplication)", def:"Normally you never store data you can calculate. The exception: if you'll <b>filter or search by it constantly</b>, copying it into its own column turns a slow 3-table join into a one-line WHERE. A deliberate, worth-it duplication.",
          eg:"<em>record_type='EGG'</em> is copyable from the animal, but storing it lets \"show all egg records\" be instant instead of joining three tables every time." },
        { term:"System-filled field (farmer never types it)", def:"A column the <b>app fills automatically</b> from other data, so the user never has to. Less to enter = fewer mistakes and a faster screen.",
          eg:"<em>recordType</em> is read from the animal's type. Gowtham just enters \"8.5\" for milk; the app already knows it's MILK in litres." },
        { term:"Auto-seeding (records created for you)", def:"When one thing is created, the app <b>automatically generates related records</b> in the background. The user gets a fully set-up experience without lifting a finger.",
          eg:"Register Lakshmi → Flora instantly creates her 4 vaccination reminders with due dates. Gowtham never adds a single reminder by hand." },
        { term:"A status enum that drives behaviour", def:"An enum whose value doesn't just label a row — it <b>decides what the app does</b>: which colour to show, when to send a notification, whether to raise an alert.",
          eg:"<em>VaccinationStatus</em>: DUE_SOON turns the badge amber AND fires a push 3 days early; OVERDUE turns it red AND raises an urgent alert." },
        { term:"Self-renewing cycle (nextDueDate)", def:"A record that, once completed, <b>spawns its own replacement</b> for the next time. The schedule maintains itself forever with no manual upkeep.",
          eg:"Mark FMD vaccine done → app calculates +6 months → creates a fresh record for that date. The reminder loop never stops on its own." },
        { term:"structured field vs free-text field", def:"<b>Structured</b> fields hold a known, predictable shape the app can reason about. <b>Free-text</b> fields hold whatever a human types, for context a machine can't predict. Good designs use both, each for its job.",
          eg:"<em>harvestCycle</em> = \"Shearing cycle 1\" (structured, for grouping). <em>notes</em> = \"Lakshmi seemed restless\" (free text, for the human reading later)." }
      ]
    },
    { type:"diagram", title:"The complete animal module — all 6 tables connected",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Gowtham</span> (farmer_id=1)
    │
    └── <span style="color:var(--g)">Lakshmi</span> (animal_id=1, Cow, Jersey, FEMALE, HEALTHY)
            │
            ├── <span style="color:var(--g)">animal_health_records</span>
            │       health_record_id=1
            │       symptoms: ["FEVER","NASAL_DISCHARGE"]
            │       additional_notes: "not eating since morning"
            │       predicted_disease: "Foot and Mouth Disease"
            │       confidence: 0.78, severity: CRITICAL
            │       is_vet_visit_required: true  ──► Expert Chat opens pre-filled
            │       is_resolved: false  ──► shows as active alert on dashboard
            │
            ├── <span style="color:var(--g)">animal_production_records</span>
            │       record_id=1: MILK, 2026-06-13, MORNING, 8.5 litres, drop=false
            │       record_id=2: MILK, 2026-06-13, EVENING, 6.0 litres, drop=false
            │       record_id=3: MILK, 2026-06-14, MORNING, 6.1 litres, <span style="color:var(--r)">drop=true</span>
            │                    ──► Alert: "Lakshmi's milk dropped 28%"
            │
            └── <span style="color:var(--g)">vaccination_records</span>
                    vacc_id=1: FMD Vaccine, due 2026-12-13, PENDING
                    vacc_id=2: HS Vaccine,  due 2026-12-13, PENDING
                    vacc_id=3: BQ Vaccine,  due 2026-12-13, PENDING
                    vacc_id=4: Brucellosis, due 2027-06-13, PENDING
                    ──► All 4 auto-seeded when Lakshmi was registered
                    ──► Gowtham never typed any of this</pre>` },
    { type:"table", title:"RecordType → AnimalType mapping — every animal in Flora",
      html:`<table class="ann-table">
        <thead><tr><th>RecordType</th><th>Unit</th><th>Animals</th><th>Session</th></tr></thead>
        <tbody>
          <tr><td>MILK</td><td>litres</td><td>Cow, Buffalo, Goat, Sheep, Camel</td><td>MORNING + EVENING</td></tr>
          <tr><td>EGG</td><td>count</td><td>Hen, Duck, Dove, Quail, Turkey</td><td>MORNING (once daily)</td></tr>
          <tr><td>WEIGHT_YIELD</td><td>kg</td><td>Rabbit (fur), Sheep (wool), Silkworm (cocoons), Honey Bee (honey), Fish</td><td>HARVEST (periodic)</td></tr>
          <tr><td>null</td><td>—</td><td>Pig, Dog, Horse (no daily production)</td><td>— (no production tracking)</td></tr>
        </tbody>
      </table>` }
  ],
  next:[
    `<span>Remaining entities</span> — SoilScan, WeatherSnapshot, Prediction, MarketPrice for the crop module. ChatSession, ChatMessage for expert chat. Alert, DeviceToken for push notifications. Feedback for post-harvest ratings.`,
    `<span>After all entities are done</span> — JWT authentication. POST /api/auth/register and POST /api/auth/login. First real working endpoints in the project.`
  ],
  snapshot:{ entities:10, enums:9, tables:12, endpoints:0 }
});
