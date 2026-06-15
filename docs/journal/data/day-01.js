/* ============================================================================
   DAY 1 — Project setup · Package structure · Enums · Core entities
   ----------------------------------------------------------------------------
   FIELDS A DAY CAN USE:
     story        — short plain-English intro at the top
     built[]      — "what we built today" bullets
     understood[] — "what clicked today" bullets
     code[]       — code cards { file, sub, code:`...highlighted html...` }
     extras[]     — visuals under the code:
        { type:'concept', title, items:[{term,meaning,analogy,steps:[...],
            table:{caption,head:[...],rows:[[...]],highlightCol,note}}] }  <- idea explained 3 ways + animation
        { type:'flow',    title, steps:[{icon,label,note}] }              <- animated step pipeline
        { type:'farm',    title, farmer, lands:[...] }                    <- animated farm map
        { type:'glossary',title, items:[{term,def,eg}] }                  <- quick word meanings
        { type:'diagram', title, html }                                   <- ascii map
        { type:'table',   title, html }                                   <- comparison table
     next[]       — "what comes next" bullets
     snapshot     — running totals { entities, enums, tables, endpoints }
   ========================================================================== */
JOURNAL.push({
  day:1,
  date:"2026-06-11",
  title:"Project setup · Package structure · Enums · Core entities",
  phase:1, status:"done",
  tags:["Setup","Spring Boot","Enums","Entities","GitHub"],
  summary:"Day one of Flora. We set up the project, connected it to the database, and made our first 5 building blocks. The app turned those into 7 tables on its own — we never wrote any database code.",
  story:`<p>Flora is a <b>digital notebook</b> for a farmer called <span class="hl">Gowtham</span>. Everything about him — his crops, his cows, his soil tests — needs to be written down so the app can remember it.</p>
  <p>That writing-down happens in a <b>database</b>. Inside it are <b>tables</b>: plain grids, exactly like sheets in Excel. One table for farmers, one for districts, and so on.</p>
  <p>Here's the nice part we learned today: we don't build those tables by hand. We just describe our ideas in simple Java — <span class="hl">"a farmer has a name and a phone number"</span> — and the app builds the matching tables for us. Describe the shape, and the database appears.</p>`,
  built:[
    `<span>Made the project</span> — a fresh Spring Boot app (the engine that runs our backend).`,
    `<span>Connected the database</span> — created an empty one called <span class="inline-code">flora_db</span>. All our tables will live inside it.`,
    `<span>Hid the password</span> — the real settings file is kept off GitHub, so nobody ever sees it.`,
    `<span>Made tidy folders</span> — a separate drawer for each part (farmer, crop, animal…) so it stays neat as it grows.`,
    `<span>Made 3 "pick one" lists</span> — Language (English / Tamil / Hindi) and main work (Crops / Animals / Both).`,
    `<span>Made 5 building blocks</span> — State, District, Farmer, Crop, AnimalType.`,
    `<span>7 tables appeared</span> — built automatically from those blocks. Zero database commands typed.`,
    `<span>Saved it to GitHub</span> — and started committing every day.`
  ],
  understood:[
    `<span>The app builds its own tables</span> — We write a Java class; the app reads it and creates the matching table. We never type "CREATE TABLE".`,
    `<span>A "pick one" list is safer than free text</span> — If language can only be English, Tamil or Hindi, nobody can ever type a wrong value by mistake.`,
    `<span>Save words, not numbers</span> — We store "TA" (which you can read), not "2" (which means nothing and can break if the list is reordered).`,
    `<span>Some links are "one", some are "many"</span> — A farmer lives in ONE district. A farmer grows MANY crops. The app stores each kind differently.`,
    `<span>Load only what you need</span> — Opening Gowtham's profile does not also load all his animals and crops. They load only when asked. Keeps it fast.`,
    `<span>Never store a photo in the database</span> — Save a short web link instead; the real photo lives in cheap cloud storage.`,
    `<span>States and districts are data, not code</span> — If a new district is created, we just add a row. No code change needed.`
  ],
  code:[
    { file:"enums/farmer/Language.java", sub:"a 'pick one' list that also keeps a friendly label",
      code:`<span class="kw">public enum</span> <span class="cls">Language</span> {

    <span class="val">EN</span>(<span class="str">"English"</span>),  <span class="cmt">// saved as "EN", shown as "English"</span>
    <span class="val">TA</span>(<span class="str">"Tamil"</span>),
    <span class="val">HI</span>(<span class="str">"Hindi"</span>);

    <span class="kw">private final</span> String displayName;   <span class="cmt">// the friendly label</span>

    <span class="cls">Language</span>(String displayName) {
        <span class="kw">this</span>.displayName = displayName;
    }
    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
}
<span class="cmt">// database keeps the short "TA"; the screen shows "Tamil".</span>` },
    { file:"entity/farmer/District.java", sub:"a district belongs to one state",
      code:`<span class="ann">@Entity</span>                       <span class="cmt">// this class is a table</span>
<span class="ann">@Table(name = "districts")</span>      <span class="cmt">// name the table "districts"</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">District</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "district_id")</span>
    <span class="kw">private</span> Long districtId;        <span class="cmt">// the unique row number</span>

    <span class="ann">@Column(name = "district_name", nullable = false, length = 100)</span>
    <span class="kw">private</span> String districtName;     <span class="cmt">// "Karur" — must be filled in</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "state_id", nullable = false)</span>
    <span class="kw">private</span> State state;             <span class="cmt">// many districts → one state</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
}` },
    { file:"entity/farmer/Farmer.java", sub:"the heart of the app — everything links back to the farmer",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "farmers")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Farmer</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "farmer_id")</span>
    <span class="kw">private</span> Long farmerId;          <span class="cmt">// Gowtham = 1. Everything links to this.</span>

    <span class="ann">@Column(name = "phone_number", unique = true, nullable = false, length = 15)</span>
    <span class="kw">private</span> String phoneNumber;      <span class="cmt">// his login. No two farmers share one.</span>

    <span class="ann">@Column(name = "hashed_password", nullable = false)</span>
    <span class="kw">private</span> String hashedPassword;   <span class="cmt">// scrambled. The real password is never stored.</span>

    <span class="ann">@Column(name = "first_name", nullable = false, length = 50)</span>
    <span class="kw">private</span> String firstName;
    <span class="ann">@Column(name = "last_name", nullable = false, length = 50)</span>
    <span class="kw">private</span> String lastName;          <span class="cmt">// split, so alerts can say just "Gowtham"</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "preferred_language", nullable = false, length = 10)</span>
    <span class="kw">private</span> Language preferredLanguage = Language.EN;   <span class="cmt">// pick Tamil → whole app turns Tamil</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "district_id", nullable = false)</span>
    <span class="kw">private</span> District district;        <span class="cmt">// his town → drives weather, advice, prices</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "primary_activity", nullable = false, length = 10)</span>
    <span class="kw">private</span> PrimaryActivity primaryActivity = PrimaryActivity.CROP;

    <span class="ann">@Column(name = "land_size_acres")</span>
    <span class="kw">private</span> Double landSizeAcres;     <span class="cmt">// (moves to the Land block on Day 4)</span>

    <span class="ann">@ManyToMany(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinTable(name = "farmer_crops",</span>
        <span class="ann">joinColumns = @JoinColumn(name = "farmer_id"),</span>
        <span class="ann">inverseJoinColumns = @JoinColumn(name = "crop_id"))</span>
    <span class="kw">private</span> List&lt;Crop&gt; currentlyGrowingCrops;   <span class="cmt">// grows many crops (many ↔ many)</span>

    <span class="ann">@ManyToMany(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinTable(name = "farmer_animal_types",</span>
        <span class="ann">joinColumns = @JoinColumn(name = "farmer_id"),</span>
        <span class="ann">inverseJoinColumns = @JoinColumn(name = "animal_type_id"))</span>
    <span class="kw">private</span> List&lt;AnimalType&gt; ownedAnimalTypes;  <span class="cmt">// quick "I own cows + hens" snapshot</span>

    <span class="ann">@Column(name = "alert_time")</span>
    <span class="kw">private</span> LocalTime alertTime;       <span class="cmt">// 6 AM → daily push at 06:00</span>

    <span class="ann">@Column(name = "is_onboarding_complete", nullable = false)</span>
    <span class="kw">private</span> Boolean isOnboardingComplete = <span class="kw">false</span>;

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();  <span class="cmt">// set once, never changed</span>
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();

    <span class="kw">public</span> String <span class="prop">getFullName</span>() { <span class="kw">return</span> firstName + <span class="str">" "</span> + lastName; }
}` }
  ],
  extras:[
    { type:"flow", title:"How a table is born — we write Java, the app does the rest",
      steps:[
        { icon:"✍️", label:"Write a Java class", note:"\"A farmer has a name + phone\"" },
        { icon:"⚙️", label:"The app reads it", note:"turns it into database commands" },
        { icon:"🗄️", label:"A table appears", note:"the farmers grid, ready to use" },
        { icon:"✅", label:"Save a farmer", note:"Gowtham becomes row #1" }
      ]
    },
    { type:"concept", title:"The 4 big ideas of Day 1 — each one explained three ways",
      items:[
        {
          term:"@Entity  —  a Java class becomes a table",
          meaning:"Put @Entity on a class and the app makes a matching grid (table) in the database. Each object you save becomes one row.",
          analogy:"Like a school <b>attendance register</b>: you design the columns once (name, roll no.), then add one row per student.",
          steps:[
            "We write a class <b>Farmer</b> with the fields we want.",
            "We add the line <b>@Entity</b> on top.",
            "The app sees it and creates a <b>farmers</b> table with those columns.",
            "Each farmer we save becomes <b>one row</b> in that table."
          ],
          table:{ caption:"farmers table", head:["farmer_id","first_name","phone_number"],
            rows:[["1","Gowtham","9876543210"],["2","Kumar","9000000000"]],
            highlightCol:0, note:"<b>farmer_id</b> is the unique row number the database hands out: 1, 2, 3…" }
        },
        {
          term:"enum  —  a fixed 'pick one' list",
          meaning:"A closed list of allowed choices. Nothing outside the list is ever allowed.",
          analogy:"Like the <b>radio buttons</b> on a paper form: you can tick English, Tamil or Hindi — you can't write your own option.",
          steps:[
            "We list the only allowed choices: <b>EN, TA, HI</b>.",
            "Each choice also carries a friendly label (\"Tamil\").",
            "The database <b>stores the short code</b> — \"TA\".",
            "The screen <b>shows the friendly label</b> — \"Tamil\".",
            "A wrong value like \"Klingon\" simply can't happen."
          ],
          table:{ caption:"how a language is kept", head:["stored in database","shown on screen"],
            rows:[["EN","English"],["TA","Tamil"],["HI","Hindi"]],
            highlightCol:0, note:"One list, two jobs: short for the computer, friendly for Gowtham." }
        },
        {
          term:"@ManyToOne  —  many belong to one",
          meaning:"Many rows point to one shared parent. The note about who the parent is sits on the 'many' side.",
          analogy:"Many <b>students</b> belong to one <b>class teacher</b>. The teacher doesn't belong to one student — all the students point to one teacher.",
          steps:[
            "There are many districts: Karur, Salem, Erode…",
            "Each district sits in <b>one</b> state.",
            "So on each district row we write one note: <b>state_id</b>.",
            "Karur's note says <b>state_id = 1</b>, which is Tamil Nadu.",
            "That single linking column is what @ManyToOne creates."
          ],
          table:{ caption:"districts table", head:["district_id","district_name","state_id"],
            rows:[["3","Karur","1"],["7","Salem","1"],["12","Erode","1"]],
            highlightCol:2, note:"Every <b>state_id = 1</b> means \"my state is Tamil Nadu\". The link lives on the district." }
        },
        {
          term:"@ManyToMany  —  both sides have many",
          meaning:"When each side can have many of the other, the app makes a small extra table just to list the pairs.",
          analogy:"<b>Students and courses</b>: one student takes many courses, one course has many students. You need a third sheet listing each (student, course) pair.",
          steps:[
            "Gowtham grows many crops (Cotton, Groundnut).",
            "Each crop is also grown by many farmers.",
            "This can't fit in a single column on either side.",
            "So the app makes a tiny <b>farmer_crops</b> table.",
            "Each row there is one pairing: \"this farmer grows this crop\"."
          ],
          table:{ caption:"farmer_crops table (the pairs)", head:["farmer_id","crop_id"],
            rows:[["1","2  (Cotton)"],["1","3  (Groundnut)"],["2","3  (Groundnut)"]],
            highlightCol:0, note:"Rows 1 & 2 = Gowtham's two crops. Row 3 = Kumar also grows Groundnut." }
        }
      ]
    },
    { type:"farm", title:"Gowtham's farm after Day 1 — what the app now knows",
      farmer:{ name:"Gowtham Selvaraj", sub:"farmer_id = 1 · speaks Tamil · town: Karur", emoji:"🧑‍🌾" },
      lands:[
        { name:"His farm", district:"Karur", size:"2.0 acres",
          crops:[{name:"Cotton",emoji:"🌿"},{name:"Groundnut",emoji:"🥜"}],
          animals:[{name:"Cow",emoji:"🐄"},{name:"Hen",emoji:"🐔",count:5}] }
      ]
    },
    { type:"glossary", title:"Quick words — the small labels in the code, in one line each",
      items:[
        { term:"@Id", def:"The one unique number for each row. Like an Aadhaar number — one per farmer, never repeated." },
        { term:"@GeneratedValue", def:"The database hands out that number automatically — 1, 2, 3 — like a token counter at a bank." },
        { term:"@Column(name=…)", def:"Names one column in the table (e.g. the Java field <em>districtName</em> becomes the column <em>district_name</em>)." },
        { term:"nullable = false", def:"\"Must be filled in.\" The database refuses to save a row that leaves this blank." },
        { term:"unique = true", def:"\"No duplicates.\" Two rows can never share this value (e.g. two farmers can't share a phone number)." },
        { term:"length = 100", def:"The most letters allowed in that box. Keeps data tidy." },
        { term:"updatable = false", def:"\"Set once, never change.\" Perfect for the date someone joined." },
        { term:"fetch = LAZY", def:"\"Load it only when I ask.\" Opening a farmer doesn't drag in all his animals until you actually need them." },
        { term:"@Data", def:"A shortcut that writes the boring get/set code for you, so you don't type ~50 lines by hand." }
      ]
    },
    { type:"diagram", title:"How it all links together after Day 1",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Tamil Nadu</span> (state 1)
    └── <span style="color:#E8E6E0;font-weight:600">Karur</span> (district 3, in state 1)
            └── <span style="color:#E8E6E0;font-weight:600">Gowtham</span> (farmer 1, in district 3)
                    ├── grows  → <span style="color:var(--g)">Cotton</span>, <span style="color:var(--g)">Groundnut</span>
                    └── owns   → <span style="color:var(--g)">Cow</span>, <span style="color:var(--g)">Hen</span>

<span style="color:var(--ink3)">// Everything points back to one number: farmer 1.</span></pre>` }
  ],
  next:[
    `<span>The animal side</span> — add Breed and Animal blocks so Gowtham can register each cow and hen by name.`
  ],
  snapshot:{ entities:5, enums:3, tables:7, endpoints:0 }
});
