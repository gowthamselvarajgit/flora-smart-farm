/* ============================================================================
   DAY 1 — Project setup · Package structure · Enums · Core entities
   ----------------------------------------------------------------------------
   HOW TO READ THIS FILE (so you can copy it for new days):
     built[]      — plain bullets: "what we built today"
     understood[] — plain bullets: "what clicked in my head today"
     code[]       — code cards. Each: { file, sub, code:`...highlighted html...` }
     extras[]     — diagrams / tables / glossaries shown under the code
                      { type:'glossary', title, items:[{term, def, eg}] }  <- line-by-line word meanings
                      { type:'diagram',  title, html }                     <- ascii relationship maps
                      { type:'table',    title, html }                     <- comparison tables
     next[]       — "what comes next" bullets (optional)
     snapshot     — running totals { entities, enums, tables, endpoints }
   ========================================================================== */
JOURNAL.push({
  day:1,
  date:"2026-06-11",
  title:"Project setup · Package structure · Enums · Core entities",
  phase:1, status:"done",
  tags:["Setup","Spring Boot","Enums","Entities","GitHub"],
  summary:"Spring Boot generated, MySQL connected, flora_db live, modular package layout, 3 farmer enums + 5 core entities → 7 tables auto-created. GitHub repo initialized.",
  built:[
    `<span>Spring Boot project generated</span> via start.spring.io — Group <span class="inline-code">com.flora</span>, Artifact <span class="inline-code">api</span>, package <span class="inline-code">com.flora.api</span>, port 8084`,
    `<span>6 dependencies added</span> — Spring Web, Spring Security, Spring Data JPA, MySQL Driver, Lombok, Validation`,
    `<span>flora_db database created</span> in MySQL — Spring creates all tables automatically inside it via Hibernate`,
    `<span>application.properties configured</span> — DB connection, JPA settings, server port 8084. application-example.properties committed to GitHub (real properties gitignored — password stays safe)`,
    `<span>Package structure created</span> — controller, service, repository, entity, dto, config, enums with feature-based sub-packages (entity/farmer, entity/crop, entity/animal etc.)`,
    `<span>3 enums created</span> in enums/farmer — Language (EN/TA/HI), PrimaryActivity (CROP/ANIMAL/BOTH) with displayName pattern`,
    `<span>5 entities created</span> — State, District, Farmer, Crop, AnimalType`,
    `<span>7 tables auto-created in MySQL</span> — states, districts, crops, animal_types, farmers, farmer_crops, farmer_animal_types`,
    `<span>GitHub repo created</span> — github.com/gowthamselvarajgit/flora-smart-farm. Daily commits started.`,
    `<span>Architecture decision made</span> — modular monolith for Spring Boot, not split microservices. Reason: one developer, faster build, microservice-ready package separation.`
  ],
  understood:[
    `<span>ddl-auto=update means zero manual SQL</span> — Hibernate reads your Java @Entity class and auto-creates or updates the matching MySQL table. You write Java, Hibernate writes SQL. You never type CREATE TABLE.`,
    `<span>Enum with properties pattern</span> — Every enum constant is a full Java object carrying extra data. EN("English") stores "EN" in the database (short, machine-readable) but getDisplayName() returns "English" for the UI (human-readable). One enum does both jobs.`,
    `<span>@Enumerated(EnumType.STRING) — always STRING, never ORDINAL</span> — ORDINAL stores 0, 1, 2 as numbers. If you reorder your enum constants later, all existing database rows silently get wrong values. STRING stores "EN", "TA", "HI" — safe forever.`,
    `<span>@ManyToOne vs @ManyToMany</span> — A farmer lives in one district (@ManyToOne — one foreign key column). A farmer grows many crops AND one crop is grown by many farmers (@ManyToMany — Hibernate creates a join table automatically with two foreign key columns).`,
    `<span>FetchType.LAZY — load only what you need</span> — When you load Gowtham from the DB, Hibernate does NOT automatically load all his 8 animals and all his crops. It loads them only when you explicitly ask. Without LAZY, every farmer query would load thousands of rows.`,
    `<span>Never store images in the database</span> — The database stores a short URL string. The actual image file lives on AWS S3. The app downloads it when needed. Fast, cheap, scalable.`,
    `<span>State and District as entities, not enums</span> — India has 36 states and 788 districts. When a new state is created (like Telangana in 2014), you just insert a row — no code change, no redeployment. Enums would require code change every time.`,
    `<span>Derived data rule</span> — Never store data that can be calculated. getFullName() returns firstName + " " + lastName. Storing a separate fullName column would mean two places to update whenever a name changes — a classic bug source.`
  ],
  code:[
    { file:"enums/farmer/Language.java", sub:"enum with displayName — machine code + human label in one",
      code:`<span class="kw">public enum</span> <span class="cls">Language</span> {

    <span class="val">EN</span>(<span class="str">"English"</span>),  <span class="cmt">// stored in DB as "EN"   — short, standard, fast to index</span>
    <span class="val">TA</span>(<span class="str">"Tamil"</span>),    <span class="cmt">// stored in DB as "TA"</span>
    <span class="val">HI</span>(<span class="str">"Hindi"</span>);   <span class="cmt">// stored in DB as "HI"</span>

    <span class="kw">private final</span> String displayName;
    <span class="cmt">// Each constant carries this extra field alongside its name</span>

    <span class="cls">Language</span>(String displayName) {
    <span class="cmt">// Java calls this constructor automatically for each constant above</span>
        <span class="kw">this</span>.displayName = displayName;
    }

    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() {
        <span class="kw">return</span> displayName;
    }
}
<span class="cmt">// farmer.getPreferredLanguage().name()           → "EN"      (stored in DB)</span>
<span class="cmt">// farmer.getPreferredLanguage().getDisplayName() → "English" (shown in UI)</span>
<span class="cmt">// The farmer sees "English". The database stores "EN". Same enum, two uses.</span>` },
    { file:"entity/farmer/District.java", sub:"@ManyToOne — the owning side of a relationship",
      code:`<span class="ann">@Entity</span>
<span class="ann">@Table(name = "districts")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">District</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "district_id")</span>
    <span class="kw">private</span> Long districtId;

    <span class="ann">@Column(name = "district_name", nullable = false, length = 100)</span>
    <span class="kw">private</span> String districtName;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="cmt">// Read from District's perspective: MANY districts → ONE state</span>
    <span class="cmt">// Karur belongs to Tamil Nadu. Bengaluru belongs to Karnataka.</span>
    <span class="ann">@JoinColumn(name = "state_id", nullable = false)</span>
    <span class="cmt">// Creates state_id column in districts table</span>
    <span class="cmt">// This is a FOREIGN KEY pointing to states.state_id</span>
    <span class="kw">private</span> State state;

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
}
<span class="cmt">// districts table in MySQL:</span>
<span class="cmt">// district_id | district_name | state_id | is_active</span>
<span class="cmt">// 3           | Karur         | 1        | 1   ← state_id=1 means Tamil Nadu</span>` },
    { file:"entity/farmer/Farmer.java", sub:"the central entity — everything connects to farmer_id",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "farmers")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Farmer</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "farmer_id")</span>
    <span class="kw">private</span> Long farmerId;
    <span class="cmt">// Gowtham gets farmer_id=1. Every row he ever creates links back to this number.</span>

    <span class="ann">@Column(name = "phone_number", unique = true, nullable = false, length = 15)</span>
    <span class="kw">private</span> String phoneNumber;
    <span class="cmt">// Login identifier — like a username. unique=true means no two farmers share a phone.</span>

    <span class="ann">@Column(name = "hashed_password", nullable = false)</span>
    <span class="kw">private</span> String hashedPassword;
    <span class="cmt">// BCrypt hash. "gowtham123" → "$2a$10$xyz..." (irreversible, one-way)</span>
    <span class="cmt">// Real password is NEVER stored. Even if DB is hacked, passwords are safe.</span>

    <span class="ann">@Column(name = "first_name", nullable = false, length = 50)</span>
    <span class="kw">private</span> String firstName;
    <span class="ann">@Column(name = "last_name", nullable = false, length = 50)</span>
    <span class="kw">private</span> String lastName;
    <span class="cmt">// Split into two — alerts say "Good morning, Gowtham" using only firstName</span>
    <span class="cmt">// getFullName() combines them when needed — never stored as a separate column</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "preferred_language", nullable = false, length = 10)</span>
    <span class="kw">private</span> Language preferredLanguage = Language.EN;
    <span class="cmt">// Q1 of onboarding. Gowtham picks Tamil → stored as "TA"</span>
    <span class="cmt">// Every prediction, alert, and message switches to Tamil from this moment</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "district_id", nullable = false)</span>
    <span class="kw">private</span> District district;
    <span class="cmt">// Q2. Gowtham picks Karur → district_id=3 stored here</span>
    <span class="cmt">// This one number drives: weather fetch, ML model re-ranking, market prices</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "primary_activity", nullable = false, length = 10)</span>
    <span class="kw">private</span> PrimaryActivity primaryActivity = PrimaryActivity.CROP;
    <span class="cmt">// Q3. CROP/ANIMAL/BOTH → decides which dashboard tabs appear first</span>

    <span class="ann">@Column(name = "land_size_acres")</span>
    <span class="kw">private</span> Double landSizeAcres;
    <span class="cmt">// Q4. 2.0 acres. Fertilizer calculation: recommended_kg_per_acre × 2.0</span>

    <span class="ann">@ManyToMany(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinTable(name = "farmer_crops",</span>
        <span class="ann">joinColumns = @JoinColumn(name = "farmer_id"),</span>
        <span class="ann">inverseJoinColumns = @JoinColumn(name = "crop_id"))</span>
    <span class="kw">private</span> List&lt;Crop&gt; currentlyGrowingCrops;
    <span class="cmt">// Q5. Gowtham selects Cotton from the dropdown</span>
    <span class="cmt">// Hibernate auto-creates farmer_crops join table: farmer_id=1, crop_id=2</span>

    <span class="ann">@ManyToMany(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinTable(name = "farmer_animal_types",</span>
        <span class="ann">joinColumns = @JoinColumn(name = "farmer_id"),</span>
        <span class="ann">inverseJoinColumns = @JoinColumn(name = "animal_type_id"))</span>
    <span class="kw">private</span> List&lt;AnimalType&gt; ownedAnimalTypes;
    <span class="cmt">// Q6. Gowtham taps Cow + Hen icons (with Lottie animations)</span>
    <span class="cmt">// farmer_animal_types: (1,1)=Cow and (1,4)=Hen seeded for farmer_id=1</span>

    <span class="ann">@Column(name = "alert_time")</span>
    <span class="kw">private</span> LocalTime alertTime;
    <span class="cmt">// Q7. Gowtham picks 6AM → stored as 06:00</span>
    <span class="cmt">// @Scheduled AlertScheduler reads this and sends push at exactly 6AM</span>

    <span class="ann">@Column(name = "is_onboarding_complete", nullable = false)</span>
    <span class="kw">private</span> Boolean isOnboardingComplete = <span class="kw">false</span>;
    <span class="cmt">// false = app shows onboarding wizard on launch</span>
    <span class="cmt">// true  = app shows personalised dashboard</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
    <span class="cmt">// updatable=false = Hibernate never changes this after first insert. Permanent record.</span>

    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();

    <span class="kw">public</span> String <span class="prop">getFullName</span>() { <span class="kw">return</span> firstName + <span class="str">" "</span> + lastName; }
    <span class="cmt">// Derived — computed from first+last. Never stored as a column.</span>
    <span class="cmt">// farmer.getFullName() → "Gowtham Selvaraj"</span>
}` }
  ],
  extras:[
    { type:"glossary", title:"Every word on this page, in plain English (read this slowly)",
      items:[
        { term:"public enum", def:"<b>enum</b> = a fixed, closed list of allowed choices. Nothing outside the list is ever allowed. <b>public</b> means any other file in the project is allowed to use it.",
          eg:"A language can ONLY be <em>EN</em>, <em>TA</em>, or <em>HI</em> — like a form with 3 radio buttons. Nobody can type \"Klingon\"." },
        { term:"EN(\"English\")", def:"An enum constant that <b>carries an extra value</b>. The name <b>EN</b> is what the computer/database uses. The text <b>\"English\"</b> is the friendly label kept next to it for the screen.",
          eg:"Like a contact saved as <em>AMMA</em> in your phone but the screen shows \"Mother\". One entry, two faces." },
        { term:"private final String displayName;", def:"<b>private</b> = only this class can touch it directly (kept safe inside). <b>final</b> = once set, it can never change. <b>String</b> = it holds text.",
          eg:"\"English\" is set once when the app starts and stays \"English\" forever — it should never be edited at runtime." },
        { term:"@Entity", def:"Tells Hibernate: <b>this Java class is a database table</b>. Every object of this class becomes one row in that table. Without this one line, the class is just plain Java and the database knows nothing about it.",
          eg:"Putting <em>@Entity</em> on <em>Farmer</em> is like telling MySQL \"please keep a Farmers register book, and add a row each time I create a farmer.\"" },
        { term:"@Table(name = \"districts\")", def:"Sets the <b>exact table name</b> in MySQL. Without it Hibernate guesses the name from the class. We set it ourselves so the table name is clean, lowercase, and plural — our choice, not a guess.",
          eg:"The class is <em>District</em> (singular, code style) but the table is <em>districts</em> (plural, database style). This line connects the two." },
        { term:"@Data", def:"A Lombok shortcut. It <b>auto-writes the boring code</b> for you: getters, setters, toString, equals. You'd normally type ~50 lines by hand; this one word generates them invisibly at build time.",
          eg:"Instead of writing <em>getFirstName()</em> and <em>setFirstName()</em> yourself, <em>@Data</em> writes them. Less typing, fewer mistakes." },
        { term:"@NoArgsConstructor / @AllArgsConstructor", def:"Lombok shortcuts that create two ways to make an object: one <b>empty</b> (no values) and one <b>with every value filled in</b>. Hibernate needs the empty one to rebuild rows it reads from the DB.",
          eg:"Empty: <em>new Farmer()</em> then fill later. Full: <em>new Farmer(1, \"Gowtham\", ...)</em> all at once. Both exist, you wrote neither." },
        { term:"@Id", def:"Marks the field that is the <b>primary key</b> — the one unique number that identifies each row. Every entity must have exactly one. No two rows can share it.",
          eg:"Like an Aadhaar number — every farmer has one, and it's never repeated for another farmer." },
        { term:"@GeneratedValue(strategy = IDENTITY)", def:"Tells the database to <b>create the id number automatically</b> — 1, 2, 3, 4… — each time a new row is inserted. You never set it by hand; MySQL counts for you.",
          eg:"You register a farmer and don't pick the id. MySQL hands out the next free number, like a token counter at a bank." },
        { term:"@Column(name = \"...\")", def:"Maps one Java field to one <b>column</b> in the table, and lets you name that column and set its rules. Without it, Hibernate still makes a column but guesses the name.",
          eg:"Java field <em>districtName</em> becomes DB column <em>district_name</em> — Java uses camelCase, databases prefer snake_case." },
        { term:"nullable = false", def:"A rule on a column: <b>this value must always be present</b>. The database itself rejects any attempt to save a row that leaves it blank. It's a safety net, not just a suggestion.",
          eg:"A farmer with no phone number makes no sense — <em>nullable=false</em> guarantees the app can never accidentally save one." },
        { term:"unique = true", def:"A rule: <b>no two rows can have the same value</b> in this column. The database blocks a duplicate before it's even saved.",
          eg:"Two farmers cannot register with the same phone number — the DB stops the second one cold." },
        { term:"length = 100", def:"The <b>maximum number of characters</b> the column allows. Keeps the table small and catches obviously-wrong data (a 5000-character name is a bug).",
          eg:"<em>district_name length=100</em> — \"Karur\" fits easily; a paragraph of junk gets rejected." },
        { term:"updatable = false", def:"A rule: this column can be <b>set once when the row is created, then never changed</b>. Perfect for permanent facts like a creation timestamp.",
          eg:"<em>created_at</em> records WHEN the farmer joined. That moment never changes, so we lock it." },
        { term:"@ManyToOne", def:"A relationship: <b>MANY of these rows point to ONE of those</b>. Read it standing inside the current class. The class with @ManyToOne is the side that holds the linking column.",
          eg:"Many districts belong to one state. Inside <em>District</em>, the state field is <em>@ManyToOne</em> — Karur, Salem, Erode all point to one Tamil Nadu." },
        { term:"@JoinColumn(name = \"state_id\")", def:"Names the actual <b>foreign-key column</b> that stores the link. A foreign key is just a column holding the id of a row in another table.",
          eg:"In the <em>districts</em> table, <em>state_id=1</em> in Karur's row literally means \"my state is the one with id 1\" = Tamil Nadu." },
        { term:"fetch = FetchType.LAZY", def:"\"<b>Load it only when I actually ask.</b>\" When you fetch a farmer, his crops and animals are NOT loaded yet — they load the moment you first touch them. Saves huge amounts of memory.",
          eg:"Opening Gowtham's profile shouldn't drag in all 8 animals + every crop + their breeds. LAZY keeps the first load light and fast." },
        { term:"@ManyToMany", def:"A relationship where <b>both sides can have many of each other</b>. Gowtham grows many crops; each crop is grown by many farmers. Hibernate can't store this with one column, so it builds a separate linking table.",
          eg:"Like students and courses: one student takes many courses, one course has many students. You need a third sheet listing the pairs." },
        { term:"@JoinTable + joinColumns + inverseJoinColumns", def:"For @ManyToMany, this creates the <b>middle linking table</b>. <b>joinColumns</b> = my id column; <b>inverseJoinColumns</b> = the other side's id column. Each row of this table is one pairing.",
          eg:"<em>farmer_crops</em> holds rows like (farmer_id=1, crop_id=2) = \"Gowtham grows Cotton\". One row per crop he grows." },
        { term:"@Enumerated(EnumType.STRING)", def:"When a field is an enum, this says <b>store the readable name (\"TA\") in the DB</b>, not a position number. STRING is safe; the alternative (ORDINAL) stores 0,1,2 and silently breaks if you reorder the enum later.",
          eg:"DB shows <em>preferred_language = 'TA'</em> — anyone reading the table instantly understands. \"2\" would mean nothing and could shift." },
        { term:"Long / String / Double / Boolean", def:"The basic Java <b>data types</b>. <b>Long</b> = whole number (ids). <b>String</b> = text. <b>Double</b> = decimal number. <b>Boolean</b> = true/false. Each field picks the type that fits its data.",
          eg:"<em>farmerId</em> is Long (1, 2, 3), <em>firstName</em> is String (\"Gowtham\"), <em>landSizeAcres</em> is Double (2.5), <em>isActive</em> is Boolean (true)." },
        { term:"LocalTime / LocalDateTime", def:"Java date/time types. <b>LocalTime</b> = time only (06:00). <b>LocalDateTime</b> = date + time together (2026-06-11 09:30). Pick the smallest one that fits — don't store a full timestamp when you only need a time.",
          eg:"<em>alertTime = 06:00</em> (just a clock time). <em>createdAt = 2026-06-11T09:30</em> (the exact moment Gowtham joined)." },
        { term:"= Language.EN  /  = true  /  = false", def:"A <b>default value</b>. If nobody sets the field, it starts with this. Saves the app from dealing with empty/null values and gives sensible behaviour out of the box.",
          eg:"<em>preferredLanguage = Language.EN</em> — a new farmer defaults to English until they choose Tamil during onboarding." }
      ]
    },
    { type:"diagram", title:"All relationships — after Day 1 (Gowtham's complete picture)",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Tamil Nadu</span> (state_id=1)
    │
    └── <span style="color:#E8E6E0;font-weight:600">Karur</span> (district_id=3)  ← state_id=1 links it to Tamil Nadu
            │
            └── <span style="color:#E8E6E0;font-weight:600">Gowtham</span> (farmer_id=1)  ← district_id=3 links him to Karur
                    │
                    ├── <span style="color:var(--g)">farmer_crops</span> join table
                    │       farmer_id=1, crop_id=2 → <span style="color:var(--g)">Cotton</span>
                    │       farmer_id=1, crop_id=3 → <span style="color:var(--g)">Groundnut</span>
                    │
                    └── <span style="color:var(--g)">farmer_animal_types</span> join table
                            farmer_id=1, animal_type_id=1 → <span style="color:var(--g)">Cow</span>
                            farmer_id=1, animal_type_id=4 → <span style="color:var(--g)">Hen</span>

<span style="color:var(--ink3)">// Everything connects back to farmer_id=1</span>
<span style="color:var(--ink3)">// That one number is Gowtham's entire identity in Flora</span></pre>` }
  ],
  next:[],
  snapshot:{ entities:5, enums:3, tables:7, endpoints:0 }
});
