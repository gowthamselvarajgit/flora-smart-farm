/* ============================================================================
   DAY 2 — Animal choices · Breed block · Animal block · How everything links
   ============================================================================ */
JOURNAL.push({
  day:2,
  date:"2026-06-12",
  title:"Animal enums · Breed entity · Animal entity · All relationships explained",
  phase:1, status:"done",
  tags:["Animal domain","Enums","Entities","Relationships","Real world flow"],
  summary:"We taught Flora about animals. Now Gowtham can register each cow and hen by name, with its breed, age, weight and health. We also slowed down and understood all 8 ways our tables link to each other — using his real farm as the example.",
  story:`<p>Yesterday Gowtham just ticked a box: <b>\"I own cows and hens.\"</b> That's enough to personalise his home screen, but it's like saying <span class="hl">\"I have a car\"</span> — it doesn't tell you the model, the colour, or the number plate.</p>
  <p>Today we built the <b>full version</b>. Gowtham can now register <span class="hl">Lakshmi</span> — a Jersey cow, female, 3 years old, 320 kg, currently healthy. Each animal gets its own profile and its own id, exactly like an Aadhaar card for the animal.</p>
  <p>The neat trick: when he picks <b>Cow</b>, the breed list only shows cow breeds — Jersey, Holstein, Gir. No goat breeds sneak in. The app filters it automatically, so he can't make a wrong choice.</p>`,
  built:[
    `<span>Health status list</span> — Healthy, Sick, Recovering, Critical, Deceased. This colours a little badge on each animal's card so Gowtham sees its state at a glance.`,
    `<span>Gender list</span> — Male / Female. Female animals show milk/egg tracking; male animals hide it (it wouldn't make sense).`,
    `<span>Breed block</span> — every breed has English, Tamil and Hindi names, and is tied to one animal type so the dropdown stays clean.`,
    `<span>Animal block</span> — the full profile: name, type, breed, gender, birth date, weight, health, plus pregnancy info and an optional government ear-tag number.`,
    `<span>Pregnancy tracking</span> — mark a cow pregnant and the app shows a countdown and reminds Gowtham two weeks before the due date.`,
    `<span>2 new tables</span> — breeds and animals. We're now at 9 tables total.`,
    `<span>All 8 links understood</span> — every way our tables connect, explained with Gowtham's farm.`
  ],
  understood:[
    `<span>Quick tick vs full profile</span> — "I own cows" is a one-tap snapshot for the home screen. "Lakshmi, Jersey, female, 320 kg" is a full record with its own id and history. Two different depths of the same fact — like "I have a car" vs the car's RC book.`,
    `<span>The same link, read from two ends</span> — Standing inside Animal: "many animals belong to one farmer." Standing inside Farmer: "one farmer has many animals." Same connection, just described from each side.`,
    `<span>Breeds belong to a type</span> — Jersey is a cow breed; it must never appear in the goat list. Because each breed is tied to one animal type, picking "Cow" shows only cow breeds. The wrong choice is simply impossible.`,
    `<span>Use the right amount of detail for dates</span> — A birthday only needs the date (no clock time). A registration moment needs the exact date AND time, for sorting and history. We pick the smaller one whenever we can.`,
    `<span>Some blanks are on purpose</span> — Breed can be blank (a farmer may not know it). A name can be blank (people name cows, rarely hens). The government tag can be blank (most small farmers don't have one). We never force a field that would block someone from registering.`,
    `<span>Optional, but still unique</span> — The government ear-tag is optional, but if it IS given, no two animals can share it. Optional and unique at the same time.`
  ],
  code:[
    { file:"enums/animal/HealthStatus.java", sub:"colours the badge on every animal card",
      code:`<span class="kw">public enum</span> <span class="cls">HealthStatus</span> {

    <span class="val">HEALTHY</span>(<span class="str">"Healthy"</span>),       <span class="cmt">// 🟢 green  — Lakshmi is fine, nothing to do</span>
    <span class="val">SICK</span>(<span class="str">"Sick"</span>),             <span class="cmt">// 🔴 red    — needs attention now</span>
    <span class="val">RECOVERING</span>(<span class="str">"Recovering"</span>), <span class="cmt">// 🟡 amber  — was sick, getting better</span>
    <span class="val">CRITICAL</span>(<span class="str">"Critical"</span>),     <span class="cmt">// 🔴 urgent — call the vet immediately</span>
    <span class="val">DECEASED</span>(<span class="str">"Deceased"</span>);     <span class="cmt">// ⬛ grey    — kept for past records</span>

    <span class="kw">private final</span> String displayName;
    <span class="cls">HealthStatus</span>(String d) { <span class="kw">this</span>.displayName = d; }
    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
}
<span class="cmt">// The app reads the status and shows the matching colour.</span>
<span class="cmt">// Gowtham understands instantly — no reading needed. Colour does the talking.</span>` },
    { file:"entity/animal/Breed.java", sub:"a breed belongs to one animal type, so the list stays clean",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "breeds")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Breed</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "breed_id")</span>
    <span class="kw">private</span> Long breedId;

    <span class="ann">@Column(name = "breed_name", nullable = false, length = 100)</span>
    <span class="kw">private</span> String breedName;       <span class="cmt">// "Holstein Friesian"</span>
    <span class="ann">@Column(name = "breed_name_tamil", length = 100)</span>
    <span class="kw">private</span> String breedNameTamil;  <span class="cmt">// shown when the app is in Tamil</span>
    <span class="ann">@Column(name = "breed_name_hindi", length = 100)</span>
    <span class="kw">private</span> String breedNameHindi;  <span class="cmt">// shown when the app is in Hindi</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_type_id", nullable = false)</span>
    <span class="kw">private</span> AnimalType animalType;
    <span class="cmt">// MANY breeds belong to ONE type. Jersey → Cow. Boer → Goat.</span>
    <span class="cmt">// Pick "Cow" and only Jersey, Holstein, Gir, Sahiwal show up.</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
}` },
    { file:"entity/animal/Animal.java", sub:"one real animal — Lakshmi's full profile",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "animals")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Animal</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "animal_id")</span>
    <span class="kw">private</span> Long animalId;
    <span class="cmt">// Lakshmi becomes animal_id=1. Like an Aadhaar card for the animal.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY animals → ONE farmer. All 8 of Gowtham's animals point to farmer_id=1.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_type_id", nullable = false)</span>
    <span class="kw">private</span> AnimalType animalType;
    <span class="cmt">// MANY animals → ONE type. Lakshmi and Ponni are both Cows.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "breed_id")</span>   <span class="cmt">// blank allowed — he may not know the breed</span>
    <span class="kw">private</span> Breed breed;
    <span class="cmt">// Lakshmi → Jersey. An unnamed cow → blank. Both are fine.</span>

    <span class="ann">@Column(name = "animal_name", length = 100)</span>
    <span class="kw">private</span> String animalName;        <span class="cmt">// "Lakshmi" — blank allowed (hens rarely get names)</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "gender", length = 10)</span>
    <span class="kw">private</span> AnimalGender gender;
    <span class="cmt">// FEMALE → show milk/egg tracking.  MALE → hide it.</span>

    <span class="ann">@Column(name = "date_of_birth")</span>
    <span class="kw">private</span> LocalDate dateOfBirth;    <span class="cmt">// just the date — no clock time needed</span>

    <span class="ann">@Column(name = "weight_kg")</span>
    <span class="kw">private</span> Double weightKg;          <span class="cmt">// used later to work out the right feed amount</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "health_status", nullable = false, length = 20)</span>
    <span class="kw">private</span> HealthStatus healthStatus = HealthStatus.HEALTHY;
    <span class="cmt">// starts Healthy. Turns red the moment a symptom check says otherwise.</span>

    <span class="ann">@Column(name = "is_pregnant")</span>
    <span class="kw">private</span> Boolean isPregnant = <span class="kw">false</span>;
    <span class="cmt">// mark it on → the app shows a countdown and adjusts milk expectations</span>

    <span class="ann">@Column(name = "expected_delivery_date")</span>
    <span class="kw">private</span> LocalDate expectedDeliveryDate;
    <span class="cmt">// filled only when pregnant. Two weeks before → a reminder push to Gowtham.</span>

    <span class="ann">@Column(name = "unique_tag_number", unique = true, length = 50)</span>
    <span class="kw">private</span> String uniqueTagNumber;
    <span class="cmt">// the government ear-tag. Optional — but no two animals can share one.</span>

    <span class="ann">@Column(name = "registered_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime registeredAt = LocalDateTime.now();
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}` }
  ],
  extras:[
    { type:"flow", title:"Why Gowtham can never pick the wrong breed",
      steps:[
        { icon:"🐄", label:"He taps \"Cow\"", note:"chooses the animal type first" },
        { icon:"📋", label:"App asks for cow breeds", note:"only that type's breeds" },
        { icon:"✅", label:"Clean short list", note:"Jersey, Holstein, Gir — no goats" }
      ]
    },
    { type:"farm", title:"Gowtham's animals after Day 2 — each one now a full profile",
      farmer:{ name:"Gowtham Selvaraj", sub:"farmer_id = 1 · 8 animals registered", emoji:"🧑‍🌾" },
      lands:[
        { name:"Cattle", district:"3 cows",
          animals:[{name:"Lakshmi · Jersey 🟢",emoji:"🐄"},{name:"Ponni · Jersey 🟢",emoji:"🐄"},{name:"Unnamed · male",emoji:"🐂"}] },
        { name:"Poultry", district:"5 hens",
          animals:[{name:"Aseel hens",emoji:"🐔",count:5}] }
      ]
    },
    { type:"glossary", title:"New words & ideas on this page, in plain English",
      items:[
        { term:"Two sides of one link", def:"A connection between two tables can be <b>read from either end</b>. The side that holds the connecting column says <b>@ManyToOne</b>; the other side says <b>@OneToMany</b>. It's still one connection.",
          eg:"In <em>Animal</em>: \"many animals → one farmer\". In <em>Farmer</em>: \"one farmer → many animals\". Same fact, both true." },
        { term:"@OneToMany", def:"Sits on the <b>\"one\" side</b> so it can list its children. It adds <b>no</b> new column — the child table already holds the connecting id. It's just for convenience.",
          eg:"<em>farmer.getAnimals()</em> lists all his animals, but the <em>farmer_id</em> column actually lives in the animals table." },
        { term:"Which side holds the link?", def:"<b>Always the @ManyToOne side</b> — the \"many\" rows each store one id pointing back to their single parent.",
          eg:"Every animal row carries <em>farmer_id=1</em>. The farmer row carries no list of animal ids (it couldn't fit in one column)." },
        { term:"LocalDate", def:"A <b>date with no clock time</b> — year, month, day. Use it when the time of day genuinely doesn't matter.",
          eg:"<em>dateOfBirth = 2024-06-12</em>. We care about the day, not that it was 2:47 PM." },
        { term:"LocalDateTime", def:"A <b>date AND a clock time together</b>. Use it when the exact moment matters.",
          eg:"<em>registeredAt = 2026-06-12 14:32</em> — needed to sort records and keep an honest history." },
        { term:"Leaving a field optional", def:"If a column has no \"must be filled\" rule, it's <b>allowed to be blank</b> — a deliberate choice, because some facts simply aren't always known.",
          eg:"<em>breed</em> is optional: a farmer may truly not know his cow's breed. Forcing it would block him from registering at all." },
        { term:"Optional but unique", def:"A field can be both: <b>not required</b>, yet if given it must be <b>one of a kind</b>.",
          eg:"The government ear-tag: most animals have none (blank is fine), but two animals can never share the same tag." },
        { term:"A starting value for a choice", def:"An enum field can begin with a sensible value, so a brand-new record is never in an unknown state.",
          eg:"<em>healthStatus = HEALTHY</em> — a newly registered animal is assumed healthy until a check says otherwise." }
      ]
    },
    { type:"diagram", title:"Gowtham's animals — how each one links up",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Gowtham</span> (farmer_id=1)
    │
    └── 8 animals
            │
            ├── <span style="color:var(--g)">Lakshmi</span>   → Cow · Jersey · female · 🟢 healthy
            ├── <span style="color:var(--g)">Ponni</span>     → Cow · Jersey · female · 🟢 healthy
            ├── <span style="color:var(--g)">Unnamed</span>   → Cow · breed blank · male
            └── <span style="color:var(--g)">5 Hens</span>    → Hen · Aseel · female · 🥚 egg tracking on

<span style="color:var(--ink3)">// type decides which breed list and which tracking show up</span>
<span style="color:var(--ink3)">// gender decides whether milk/egg tracking appears at all</span></pre>` },
    { type:"table", title:"All 8 links in Flora — the complete map",
      html:`<table class="ann-table">
        <thead><tr><th>Link</th><th>Type</th><th>In plain words</th><th>Where the link is stored</th></tr></thead>
        <tbody>
          <tr><td>State → Districts</td><td>one-to-many</td><td>Tamil Nadu has 38 districts.</td><td>districts.state_id</td></tr>
          <tr><td>District → Farmers</td><td>one-to-many</td><td>Karur has thousands of farmers.</td><td>farmers.district_id</td></tr>
          <tr><td>Farmer ↔ Crops</td><td>many-to-many</td><td>Gowtham grows many crops; each crop is grown by many farmers.</td><td>farmer_crops table</td></tr>
          <tr><td>Farmer ↔ Animal types</td><td>many-to-many</td><td>He owns Cow + Hen; others own them too.</td><td>farmer_animal_types table</td></tr>
          <tr><td>Animal type → Breeds</td><td>one-to-many</td><td>Cow has Jersey, Holstein, Gir, Sahiwal.</td><td>breeds.animal_type_id</td></tr>
          <tr><td>Farmer → Animals</td><td>one-to-many</td><td>Gowtham has 8 animals.</td><td>animals.farmer_id</td></tr>
          <tr><td>Animal → Animal type</td><td>many-to-one</td><td>Lakshmi is a Cow.</td><td>animals.animal_type_id</td></tr>
          <tr><td>Animal → Breed</td><td>many-to-one</td><td>Lakshmi is a Jersey.</td><td>animals.breed_id (optional)</td></tr>
        </tbody>
      </table>` }
  ],
  next:[
    `<span>Animal records</span> — health checks, daily milk/egg production, and an auto-managed vaccination schedule, all linked to each animal.`
  ],
  snapshot:{ entities:7, enums:5, tables:9, endpoints:0 }
});
