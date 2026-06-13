/* ============================================================================
   DAY 2 — Animal enums · Breed entity · Animal entity · All relationships
   ============================================================================ */
JOURNAL.push({
  day:2,
  date:"2026-06-12",
  title:"Animal enums · Breed entity · Animal entity · All relationships explained",
  phase:1, status:"done",
  tags:["Animal domain","Enums","Entities","Relationships","Real world flow"],
  summary:"HealthStatus + AnimalGender enums, Breed entity filtered by AnimalType, Animal entity with full ownership chain. All 8 database relationships explained with Gowtham's farm as the example.",
  built:[
    `<span>HealthStatus enum</span> — HEALTHY, SICK, RECOVERING, CRITICAL, DECEASED with displayName. Drives colour-coded badges on every animal card.`,
    `<span>AnimalGender enum</span> — MALE, FEMALE with displayName. Drives feature visibility — FEMALE enables production tracking, MALE hides it.`,
    `<span>Breed entity</span> — breedName, breedNameTamil, breedNameHindi, @ManyToOne to AnimalType. Farmer selects breed from dropdown filtered by selected animal type.`,
    `<span>Animal entity</span> — individual registration with animalId, @ManyToOne to Farmer/AnimalType/Breed, gender, dateOfBirth, weightKg, healthStatus, isPregnant, expectedDeliveryDate, INAPH govt tag.`,
    `<span>isPregnant + expectedDeliveryDate added</span> — system shows pregnancy countdown, adjusts milk tracking, sends delivery reminder 2 weeks before due date.`,
    `<span>2 new tables in MySQL</span> — breeds, animals. Total: 9 tables.`,
    `<span>All 8 relationships fully understood</span> — State→District, District→Farmer, Farmer↔Crop, Farmer↔AnimalType, AnimalType→Breed, Farmer→Animal, Animal→AnimalType, Animal→Breed.`
  ],
  understood:[
    `<span>The difference between onboarding Q6 and animal registration</span> — Q6 ("I own cows and hens") is a quick snapshot for dashboard personalisation only — stored in farmer_animal_types join table. Animal registration is the full details — Lakshmi, Jersey cow, female, 3 years, 320kg — stored in the animals table with a unique animal_id. Like telling someone "I have a car" vs giving your car's RC book.`,
    `<span>The rule for @ManyToOne — always read from where you are standing</span> — Inside Animal.java: "Many animals belong to ONE farmer" = @ManyToOne. Inside Farmer.java: "One farmer has MANY animals" = @OneToMany. Same relationship described from two angles. The @ManyToOne side always holds the foreign key column.`,
    `<span>Breed is specific to AnimalType — not global</span> — Holstein Friesian is a Cow breed. It cannot appear in the Goat breed dropdown. The @ManyToOne from Breed to AnimalType enforces this. When farmer selects Cow, the mobile app calls GET /api/breeds?animalTypeId=1 and only cow breeds appear.`,
    `<span>LocalDate vs LocalDateTime</span> — dateOfBirth uses LocalDate (2024-06-12 — date only, no time needed). registeredAt uses LocalDateTime (2024-06-12T14:32:00 — exact timestamp needed). Always use the right precision. Storing time when you only need date wastes space and causes confusion.`,
    `<span>Nullable fields are intentional decisions, not mistakes</span> — breed is nullable because the farmer may not know the exact breed. animalName is nullable because farmers name cows but rarely name hens. uniqueTagNumber is nullable because most small farmers don't have INAPH registration yet. Never force a field that blocks registration.`,
    `<span>Government INAPH tag</span> — India's official cattle UID ear tag scheme. Optional but unique-constrained. If Gowtham's cow has a government tag, Flora stores it. No two animals can share the same tag number.`
  ],
  code:[
    { file:"enums/animal/HealthStatus.java", sub:"drives colour badge on every animal card",
      code:`<span class="kw">public enum</span> <span class="cls">HealthStatus</span> {

    <span class="val">HEALTHY</span>(<span class="str">"Healthy"</span>),       <span class="cmt">// 🟢 green badge  — Lakshmi is fine, nothing to do</span>
    <span class="val">SICK</span>(<span class="str">"Sick"</span>),             <span class="cmt">// 🔴 red badge    — Lakshmi needs attention now</span>
    <span class="val">RECOVERING</span>(<span class="str">"Recovering"</span>), <span class="cmt">// 🟡 amber badge  — Lakshmi was sick, getting better</span>
    <span class="val">CRITICAL</span>(<span class="str">"Critical"</span>),     <span class="cmt">// 🔴 flashing red — call vet immediately</span>
    <span class="val">DECEASED</span>(<span class="str">"Deceased"</span>);     <span class="cmt">// ⬛ grey         — kept for historical health records</span>

    <span class="kw">private final</span> String displayName;
    <span class="cls">HealthStatus</span>(String d) { <span class="kw">this</span>.displayName = d; }
    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
}
<span class="cmt">// Mobile app reads animal.healthStatus → shows correct badge colour</span>
<span class="cmt">// Gowtham sees colour instantly — no reading required. UX rule #3.</span>` },
    { file:"entity/animal/Breed.java", sub:"filtered by AnimalType — only relevant breeds shown",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "breeds")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Breed</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "breed_id")</span>
    <span class="kw">private</span> Long breedId;

    <span class="ann">@Column(name = "breed_name", nullable = false, length = 100)</span>
    <span class="kw">private</span> String breedName;       <span class="cmt">// "Holstein Friesian"</span>
    <span class="ann">@Column(name = "breed_name_tamil", length = 100)</span>
    <span class="kw">private</span> String breedNameTamil;  <span class="cmt">// "ஹோல்ஸ்டீன் ஃப்ரீசியன்"</span>
    <span class="ann">@Column(name = "breed_name_hindi", length = 100)</span>
    <span class="kw">private</span> String breedNameHindi;  <span class="cmt">// "होल्स्टीन फ्रीसियन"</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_type_id", nullable = false)</span>
    <span class="kw">private</span> AnimalType animalType;
    <span class="cmt">// MANY breeds belong to ONE animal type</span>
    <span class="cmt">// Jersey → Cow. Boer → Goat. Aseel → Hen.</span>
    <span class="cmt">// Mobile: farmer picks Cow → GET /api/breeds?animalTypeId=1</span>
    <span class="cmt">// Only Jersey, Holstein, Gir, Sahiwal appear. Not Boer, not Aseel.</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
}` },
    { file:"entity/animal/Animal.java", sub:"individual animal — Lakshmi's complete profile",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "animals")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Animal</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "animal_id")</span>
    <span class="kw">private</span> Long animalId;
    <span class="cmt">// Lakshmi gets animal_id=1. Like an Aadhaar card for the animal.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY animals → ONE farmer. Gowtham has 8 animals, all pointing to farmer_id=1.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_type_id", nullable = false)</span>
    <span class="kw">private</span> AnimalType animalType;
    <span class="cmt">// MANY animals → ONE type. Lakshmi, Ponni, unnamed cow → all point to Cow (type_id=1).</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "breed_id")</span>   <span class="cmt">// nullable — farmer may not know the breed</span>
    <span class="kw">private</span> Breed breed;
    <span class="cmt">// Lakshmi → Jersey (breed_id=1). Unnamed cow → null. Both are valid.</span>

    <span class="ann">@Column(name = "animal_name", length = 100)</span>
    <span class="kw">private</span> String animalName;        <span class="cmt">// "Lakshmi" — nullable, farmers name cows not hens</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "gender", length = 10)</span>
    <span class="kw">private</span> AnimalGender gender;
    <span class="cmt">// FEMALE → production tracking ON (milk/eggs/wool/honey)</span>
    <span class="cmt">// MALE   → production tracking OFF</span>

    <span class="ann">@Column(name = "date_of_birth")</span>
    <span class="kw">private</span> LocalDate dateOfBirth;    <span class="cmt">// LocalDate — date only, no time needed</span>

    <span class="ann">@Column(name = "weight_kg")</span>
    <span class="kw">private</span> Double weightKg;          <span class="cmt">// used in ICAR feed calculator</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "health_status", nullable = false, length = 20)</span>
    <span class="kw">private</span> HealthStatus healthStatus = HealthStatus.HEALTHY;
    <span class="cmt">// Updated automatically when symptoms checker runs</span>
    <span class="cmt">// SICK → red badge on Lakshmi's card → Gowtham knows to act immediately</span>

    <span class="ann">@Column(name = "is_pregnant")</span>
    <span class="kw">private</span> Boolean isPregnant = <span class="kw">false</span>;
    <span class="cmt">// Gowtham marks this when Lakshmi is pregnant</span>
    <span class="cmt">// App shows pregnancy countdown and adjusts milk tracking expectations</span>

    <span class="ann">@Column(name = "expected_delivery_date")</span>
    <span class="kw">private</span> LocalDate expectedDeliveryDate;
    <span class="cmt">// Nullable — only filled when isPregnant=true</span>
    <span class="cmt">// Cow ~9 months. Goat ~5 months. Buffalo ~10 months.</span>
    <span class="cmt">// 2 weeks before this date → push notification to Gowtham</span>

    <span class="ann">@Column(name = "unique_tag_number", unique = true, length = 50)</span>
    <span class="kw">private</span> String uniqueTagNumber;
    <span class="cmt">// INAPH government UID ear tag. Optional, unique. Most small farmers don't have it yet.</span>

    <span class="ann">@Column(name = "registered_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime registeredAt = LocalDateTime.now();
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}` }
  ],
  extras:[
    { type:"glossary", title:"New words & ideas on this page, in plain English",
      items:[
        { term:"Two sides of one relationship", def:"A link between two tables can be <b>read from either end</b>, and each end has its own annotation. The side holding the linking column uses <b>@ManyToOne</b>; the opposite side uses <b>@OneToMany</b>. It is still ONE relationship, just described from two doorways.",
          eg:"Standing in <em>Animal</em>: \"many animals → one farmer\" (@ManyToOne). Standing in <em>Farmer</em>: \"one farmer → many animals\" (@OneToMany). Same fact, both true." },
        { term:"@OneToMany (the mirror of @ManyToOne)", def:"Used on the <b>\"one\" side</b> that owns a collection of children. It does NOT add a column to its own table — the child table already holds the linking id. It's mostly for convenience, so you can do farmer.getAnimals().",
          eg:"<em>Farmer</em> can list all its animals, but the <em>farmer_id</em> column actually lives in the <em>animals</em> table, not the farmers table." },
        { term:"Which side holds the foreign key?", def:"<b>Always the @ManyToOne side.</b> The \"many\" rows each store one id pointing back to their single parent. The \"one\" side stores nothing extra.",
          eg:"Each animal row carries <em>farmer_id=1</em>. The farmer row does not carry a list of animal ids — that would be impossible to fit in one column." },
        { term:"LocalDate", def:"A <b>date with no time</b> — year, month, day only. Use it when the clock time genuinely doesn't matter.",
          eg:"<em>dateOfBirth = 2024-06-12</em>. We care that Lakshmi was born that day; we don't care it was 2:47 PM." },
        { term:"LocalDateTime", def:"A <b>date AND a clock time together</b>. Use it when you need the exact moment something happened.",
          eg:"<em>registeredAt = 2026-06-12T14:32</em>. The precise second of registration matters for sorting and audit history." },
        { term:"nullable (left out) = optional", def:"When a @Column has <b>no</b> <em>nullable=false</em> rule, the field is <b>allowed to be empty</b>. This is a deliberate design choice, not laziness — some real-world facts simply aren't always known.",
          eg:"<em>breed</em> is optional: a farmer may genuinely not know his cow's breed. Forcing it would block him from registering at all." },
        { term:"unique = true (reused here)", def:"Same rule as before — <b>no duplicates allowed</b> in that column — but here it's combined with optional. So the tag is not required, but IF given, it must be one-of-a-kind.",
          eg:"<em>unique_tag_number</em>: most animals have none (null is fine), but two animals can never share the same government ear tag." },
        { term:"enum field with a default", def:"A field whose type is an enum, started with a sensible value so a fresh record is never in an unknown state.",
          eg:"<em>healthStatus = HealthStatus.HEALTHY</em> — a newly registered animal is assumed healthy until a symptom check says otherwise." },
        { term:"Snapshot vs detail (Q6 vs registration)", def:"Two different depths of the same fact. A <b>snapshot</b> is a quick checkbox for personalising the app; the <b>detail</b> record is the full profile with its own id and history.",
          eg:"Q6 \"I own cows\" = a tick in <em>farmer_animal_types</em>. Registering \"Lakshmi, Jersey, female, 320kg\" = a full row in <em>animals</em>. Like \"I have a car\" vs the car's RC book." }
      ]
    },
    { type:"diagram", title:"Complete animal ownership chain — after Day 2",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Gowtham</span> (farmer_id=1)
    │
    └── 8 animals registered in animals table
            │
            ├── <span style="color:var(--g)">Lakshmi</span> (animal_id=1)
            │       ├── farmer_id=1    → Gowtham owns her
            │       ├── animal_type_id=1 → Cow
            │       ├── breed_id=1     → Jersey
            │       ├── gender=FEMALE  → production tracking ON
            │       └── health_status=HEALTHY → green badge
            │
            ├── <span style="color:var(--g)">Ponni</span> (animal_id=2)
            │       ├── farmer_id=1, animal_type_id=1, breed_id=1
            │       └── gender=FEMALE, health_status=HEALTHY
            │
            ├── <span style="color:var(--g)">Unnamed cow</span> (animal_id=3)
            │       ├── farmer_id=1, animal_type_id=1, breed_id=NULL
            │       └── gender=MALE → production tracking OFF
            │
            └── <span style="color:var(--g)">5 Hens</span> (animal_id=4,5,6,7,8)
                    ├── farmer_id=1, animal_type_id=4 (Hen), breed_id=7 (Aseel)
                    └── gender=FEMALE → egg tracking ON

<span style="color:var(--ink3)">// Every row connects back to farmer_id=1</span>
<span style="color:var(--ink3)">// animal_type drives: which breed dropdown shows, which production tracking shows</span>
<span style="color:var(--ink3)">// gender drives: whether production tracking appears at all</span></pre>` },
    { type:"table", title:"All 8 relationships in Flora — the complete map",
      html:`<table class="ann-table">
        <thead><tr><th>Relationship</th><th>Type</th><th>Real life example</th><th>Where FK lives</th></tr></thead>
        <tbody>
          <tr><td>State → Districts</td><td>@OneToMany</td><td>Tamil Nadu has 38 districts. One state, many districts.</td><td>districts.state_id</td></tr>
          <tr><td>District → Farmers</td><td>@OneToMany</td><td>Karur has thousands of farmers. One district, many farmers.</td><td>farmers.district_id</td></tr>
          <tr><td>Farmer ↔ Crops</td><td>@ManyToMany</td><td>Gowtham grows Cotton+Groundnut. Kumar also grows Groundnut. Many farmers, many crops.</td><td>farmer_crops join table</td></tr>
          <tr><td>Farmer ↔ AnimalTypes</td><td>@ManyToMany</td><td>Gowtham owns Cow+Hen. Kumar also owns Cow. Many farmers, many types.</td><td>farmer_animal_types join table</td></tr>
          <tr><td>AnimalType → Breeds</td><td>@OneToMany</td><td>Cow has Jersey, Holstein, Gir, Sahiwal. One type, many breeds.</td><td>breeds.animal_type_id</td></tr>
          <tr><td>Farmer → Animals</td><td>@OneToMany</td><td>Gowtham has 8 animals. One farmer, many animals.</td><td>animals.farmer_id</td></tr>
          <tr><td>Animal → AnimalType</td><td>@ManyToOne</td><td>Lakshmi is a Cow. Many animals can be Cows.</td><td>animals.animal_type_id</td></tr>
          <tr><td>Animal → Breed</td><td>@ManyToOne</td><td>Lakshmi is Jersey. Ponni is also Jersey. Many animals, one breed.</td><td>animals.breed_id (nullable)</td></tr>
        </tbody>
      </table>` }
  ],
  next:[],
  snapshot:{ entities:7, enums:5, tables:9, endpoints:0 }
});
