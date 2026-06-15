/* ============================================================================
   DAY 4 — Crop module begins · The multi-land rethink
   ============================================================================ */
JOURNAL.push({
  day:4,
  date:"2026-06-15",
  title:"SoilScan · Multi-land architecture pivot · WeatherSnapshot · Prediction",
  phase:1, status:"today",
  tags:["Crop domain","Soil test","Multiple lands","One-to-one link","Weather","AI advice"],
  summary:"The crop side begins — and a simple question changed our whole design. A farmer doesn't have one field; he can have several, in different places. So we gave land its own block, captured a full soil test, saved the day's weather, and added the Prediction that holds the AI's advice.",
  story:`<p>Gowtham opens Flora, enters his soil test, and taps <span class="hl">"Get advice."</span> In a blink, the app checks his local weather, runs its AI, and tells him the best crop to plant, how much fertiliser to add, and when to water. That whole journey is what we started building today.</p>
  <p>But halfway through, a real-life question stopped us: <b>what if Gowtham owns more than one field?</b> Two acres in Karur, and one and a half inherited from his father in Namakkal — a different town, different weather, different soil. Our old design assumed one field per farmer. That was wrong.</p>
  <p>So we made <span class="hl">Land</span> its own block. Each field has its own place, size and crops. Every soil test now belongs to a <b>field</b>, not just the farmer — so the weather and advice are always right for that exact piece of ground.</p>`,
  built:[
    `<span>Land block (the big rethink)</span> — a farmer can now have many fields, each with its own town, size, soil type and crops. Soil tests attach to a field, not the farmer.`,
    `<span>Tidied the Farmer</span> — moved "land size" and "crops grown" off the farmer (they assumed one field) and onto each field instead.`,
    `<span>Soil test block</span> — not just N-P-K. Required: nitrogen, phosphorus, potassium, pH, moisture. Optional (from the free government Soil Health Card): sulphur, calcium, magnesium, zinc, iron and more.`,
    `<span>Season fills itself</span> — the app reads today's date to know the season (Kharif / Rabi / Zaid). Gowtham never picks it.`,
    `<span>Map coordinates on each district</span> — so the weather lookup is pinpoint-accurate, not a guess from the town's name.`,
    `<span>Weather snapshot</span> — saves the exact weather at the moment of the test, plus a 7-day forecast. Tied one-to-one to that test.`,
    `<span>Prediction block</span> — the advice Gowtham sees: best crop, confidence, runner-up crops, fertiliser tip, disease risk, watering tip, and an expected yield.`,
    `<span>4 new tables</span> — lands, soil tests, weather snapshots, predictions. We're now at 16 tables.`
  ],
  understood:[
    `<span>One farmer, many fields</span> — Karur and Namakkal have different weather and different soil. If the town lived only on the farmer, one field would always get the wrong advice. Giving each field its own block fixes this for good. This is the foundation the whole crop feature stands on.`,
    `<span>Crops need more than N-P-K</span> — Calcium stops rot in tomatoes, magnesium keeps leaves green, zinc is the most common shortage in our rice soils. So we capture them all — but keep them optional, because a basic test kit gives only the big three while the government card gives the rest. Gowtham fills what he has and is never blocked.</span>`,
    `<span>Work it out, but still write it down</span> — The app knows the season from the date, yet we save it on the record. A test done this June must always read "Kharif", even if someone opens it next December. Saved facts don't drift.`,
    `<span>"Exactly one" links (one-to-one)</span> — One soil test has exactly one weather snapshot and exactly one prediction — never shared. Like a passport: one person, one passport. The database itself blocks any attempt to share.`,
    `<span>Link what you'll search, save-as-text what you'll only show</span> — The top crop is a proper link to the Crop table (so we can count "how often was Cotton recommended"). The runner-up crops are just saved as text, because we only ever show them as a little list.`,
    `<span>Old records must still make sense</span> — Each test remembers its field's town, and each weather snapshot remembers that day's actual weather. So months later we can still explain "why did Flora suggest Cotton last June?" Nothing silently changes meaning.`
  ],
  code:[
    { file:"entity/farmer/Land.java", sub:"the rethink — a farmer owns many fields, each in its own town",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "lands")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Land</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "land_id")</span>
    <span class="kw">private</span> Long landId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY fields → ONE farmer. Gowtham: Karur AND Namakkal.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "district_id", nullable = false)</span>
    <span class="kw">private</span> District district;
    <span class="cmt">// each field has its OWN town. Weather + advice use THIS one,</span>
    <span class="cmt">// not the farmer's home town.</span>

    <span class="ann">@Column(name = "land_name", length = 100)</span>
    <span class="kw">private</span> String landName;        <span class="cmt">// "Karur farm", "Appa's land" — optional</span>
    <span class="ann">@Column(name = "size_acres", nullable = false)</span>
    <span class="kw">private</span> Double sizeAcres;       <span class="cmt">// used to scale the fertiliser amount</span>
    <span class="ann">@Column(name = "soil_type", length = 100)</span>
    <span class="kw">private</span> String soilType;        <span class="cmt">// "Red loamy", "Black cotton soil" — optional</span>

    <span class="ann">@ManyToMany(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinTable(name = "land_crops",</span>
        <span class="ann">joinColumns = @JoinColumn(name = "land_id"),</span>
        <span class="ann">inverseJoinColumns = @JoinColumn(name = "crop_id"))</span>
    <span class="kw">private</span> List&lt;Crop&gt; currentCrops;
    <span class="cmt">// Karur → Cotton. Namakkal → Turmeric. Tracked per field.</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
    <span class="cmt">// false = sold or no longer farmed. Old tests are still kept.</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}` },
    { file:"entity/crop/SoilScan.java", sub:"the full soil test — required basics + optional extras",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "soil_scans")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">SoilScan</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "scan_id")</span>
    <span class="kw">private</span> Long scanId;

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "land_id", nullable = false)</span>
    <span class="kw">private</span> Land land;
    <span class="cmt">// the test belongs to a FIELD. Through it we reach the farmer,</span>
    <span class="cmt">// the town and the field size — all in one hop.</span>

    <span class="cmt">// --- the big three + basics (always required) ---</span>
    <span class="ann">@Column(name = "nitrogen", nullable = false)</span>   <span class="kw">private</span> Double nitrogen;   <span class="cmt">// leafy growth</span>
    <span class="ann">@Column(name = "phosphorus", nullable = false)</span> <span class="kw">private</span> Double phosphorus; <span class="cmt">// roots + flowers</span>
    <span class="ann">@Column(name = "potassium", nullable = false)</span>  <span class="kw">private</span> Double potassium;  <span class="cmt">// strength + disease resistance</span>
    <span class="ann">@Column(name = "ph_level", nullable = false)</span>  <span class="kw">private</span> Double phLevel;    <span class="cmt">// sweet spot 6.5–7.5</span>
    <span class="ann">@Column(name = "moisture", nullable = false)</span>  <span class="kw">private</span> Double moisture;   <span class="cmt">// how wet the soil is now</span>

    <span class="cmt">// --- extras from the government Soil Health Card (optional) ---</span>
    <span class="ann">@Column(name = "electrical_conductivity")</span> <span class="kw">private</span> Double electricalConductivity; <span class="cmt">// saltiness</span>
    <span class="ann">@Column(name = "organic_carbon")</span> <span class="kw">private</span> Double organicCarbon;
    <span class="ann">@Column(name = "sulphur")</span>   <span class="kw">private</span> Double sulphur;
    <span class="ann">@Column(name = "calcium")</span>   <span class="kw">private</span> Double calcium;    <span class="cmt">// stops rot in tomatoes</span>
    <span class="ann">@Column(name = "magnesium")</span> <span class="kw">private</span> Double magnesium;  <span class="cmt">// keeps leaves green</span>
    <span class="ann">@Column(name = "zinc")</span>      <span class="kw">private</span> Double zinc;       <span class="cmt">// #1 shortage in our rice soils</span>
    <span class="ann">@Column(name = "iron")</span>      <span class="kw">private</span> Double iron;
    <span class="ann">@Column(name = "manganese")</span> <span class="kw">private</span> Double manganese;
    <span class="ann">@Column(name = "boron")</span>     <span class="kw">private</span> Double boron;
    <span class="ann">@Column(name = "copper")</span>    <span class="kw">private</span> Double copper;

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "season", length = 20)</span>
    <span class="kw">private</span> CropSeason season;   <span class="cmt">// the app fills this from today's date. Saved for history.</span>

    <span class="ann">@Column(name = "is_mock_data", nullable = false)</span>
    <span class="kw">private</span> Boolean isMockData = <span class="kw">false</span>;  <span class="cmt">// true = test data, not a real reading</span>

    <span class="ann">@Column(name = "scanned_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime scannedAt = LocalDateTime.now();
}` },
    { file:"entity/crop/WeatherSnapshot.java", sub:"one test, exactly one weather snapshot — the passport rule",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "weather_snapshots")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">WeatherSnapshot</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "weather_snapshot_id")</span>
    <span class="kw">private</span> Long weatherSnapshotId;

    <span class="ann">@OneToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "scan_id", nullable = false, unique = true)</span>
    <span class="kw">private</span> SoilScan soilScan;
    <span class="cmt">// ONE snapshot ↔ ONE test. unique = the database blocks any sharing.</span>
    <span class="cmt">// The town comes through the test → field → district. No extra column here.</span>

    <span class="ann">@Column(name = "temperature_celsius")</span> <span class="kw">private</span> Double temperatureCelsius;
    <span class="ann">@Column(name = "feels_like_celsius")</span>  <span class="kw">private</span> Double feelsLikeCelsius;
    <span class="ann">@Column(name = "humidity_percent")</span>    <span class="kw">private</span> Double humidityPercent;  <span class="cmt">// damp air → fungus risk</span>
    <span class="ann">@Column(name = "rainfall_mm")</span>         <span class="kw">private</span> Double rainfallMm;       <span class="cmt">// last 24 hours</span>
    <span class="ann">@Column(name = "wind_speed_kmh")</span>      <span class="kw">private</span> Double windSpeedKmh;     <span class="cmt">// affects spraying</span>
    <span class="ann">@Column(name = "weather_description", length = 100)</span> <span class="kw">private</span> String weatherDescription;
    <span class="ann">@Column(name = "weather_icon_code", length = 20)</span>    <span class="kw">private</span> String weatherIconCode;

    <span class="ann">@Column(name = "forecast_json", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String forecastJson;
    <span class="cmt">// the 7-day forecast saved as text — a small list we only ever show as a block</span>

    <span class="ann">@Column(name = "fetched_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime fetchedAt = LocalDateTime.now();  <span class="cmt">// fetched once, never again</span>
}` },
    { file:"entity/crop/Prediction.java", sub:"the advice Gowtham sees — link what we search, save-as-text what we show",
      code:`<span class="ann">@Entity</span> <span class="ann">@Table(name = "predictions")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Prediction</span> {

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "prediction_id")</span>
    <span class="kw">private</span> Long predictionId;

    <span class="ann">@OneToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "scan_id", nullable = false, unique = true)</span>
    <span class="kw">private</span> SoilScan soilScan;
    <span class="cmt">// ONE test → ONE set of advice.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "recommended_crop_id")</span>
    <span class="kw">private</span> Crop recommendedCrop;
    <span class="cmt">// a real link — so we can ask "how often was Cotton suggested?" in one query</span>

    <span class="ann">@Column(name = "confidence_score")</span>
    <span class="kw">private</span> Double confidenceScore;        <span class="cmt">// shown as "87% confident"</span>

    <span class="ann">@Column(name = "alternative_crops_json", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String alternativeCropsJson;   <span class="cmt">// runner-up crops, saved as a little list</span>

    <span class="ann">@Column(name = "fertilizer_advice", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String fertilizerAdvice;       <span class="cmt">// "Add 40 kg Urea + 20 kg DAP per acre"</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "disease_risk_level", length = 20)</span>
    <span class="kw">private</span> RiskLevel diseaseRiskLevel;    <span class="cmt">// LOW / MEDIUM / HIGH</span>
    <span class="ann">@Column(name = "disease_risk_note", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String diseaseRiskNote;        <span class="cmt">// "Watch for leaf blight after the rain"</span>

    <span class="ann">@Column(name = "irrigation_advice", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String irrigationAdvice;       <span class="cmt">// "Water again in 3 days"</span>

    <span class="ann">@Column(name = "estimated_yield")</span>  <span class="kw">private</span> Double estimatedYield;   <span class="cmt">// expected harvest per acre</span>
    <span class="ann">@Column(name = "estimated_profit")</span> <span class="kw">private</span> Double estimatedProfit;  <span class="cmt">// rough rupee estimate</span>

    <span class="ann">@Column(name = "model_version", length = 50)</span>
    <span class="kw">private</span> String modelVersion;           <span class="cmt">// which AI version gave this advice</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
}` }
  ],
  extras:[
    { type:"flow", title:"From a soil test to real advice — in one tap",
      steps:[
        { icon:"🌱", label:"Enter soil test", note:"N-P-K, pH, moisture" },
        { icon:"☁️", label:"App grabs weather", note:"for that exact field" },
        { icon:"🧠", label:"AI thinks it over", note:"soil + weather together" },
        { icon:"📋", label:"Advice appears", note:"best crop, fertiliser, watering" }
      ]
    },
    { type:"farm", title:"Gowtham's two fields — why one town wasn't enough",
      farmer:{ name:"Gowtham Selvaraj", sub:"farmer_id = 1 · two fields, two towns", emoji:"🧑‍🌾" },
      lands:[
        { name:"Karur farm", district:"Karur", size:"2.0 acres",
          crops:[{name:"Cotton",emoji:"🌿"}] },
        { name:"Appa's land", district:"Namakkal", size:"1.5 acres",
          crops:[{name:"Turmeric",emoji:"🌾"}] }
      ]
    },
    { type:"glossary", title:"New ideas on this page, in plain English",
      items:[
        { term:"Giving something its own block", def:"When a single value turns out to be a list of richer things, we give it its own table. \"The farmer's field\" became \"the farmer's fields\".",
          eg:"\"Land size\" used to sit on the farmer and assumed one field. Gowtham has two — so size, town and crops moved onto a <em>Land</em> block." },
        { term:"Required vs optional", def:"Core fields must be filled; richer ones can be left blank. The app works with whatever it's given.",
          eg:"N-P-K + pH are required (basic kit). Zinc and boron are optional (only on the government card). More data → better advice; less → still works." },
        { term:"\"Exactly one\" link (one-to-one)", def:"An exclusive pairing the app guards. One test has exactly one weather snapshot and exactly one set of advice — never shared.",
          eg:"Like a passport: one person, one passport. The database refuses to attach a second snapshot to the same test." },
        { term:"A record that remembers its moment", def:"A record keeps the details it was created with, so it still makes sense even after the world changes.",
          eg:"A June test keeps its field's town and that day's weather. Even if Gowtham moves later, the old advice still explains itself." },
        { term:"Link it, or just save the text?", def:"If you'll search by it, make it a real link. If you'll only ever show it, save it as plain text. Choose by how you'll use it.",
          eg:"The top crop is a link (we count Cotton suggestions). The runner-up crops are text — we only display them." },
        { term:"Ask by exact location, not by name", def:"The weather service is far more reliable with map coordinates than with a place name, which can be misspelt or unknown.",
          eg:"We saved each district's coordinates so the lookup is pinpoint — a small town's name might return nothing." }
      ]
    },
    { type:"diagram", title:"The crop chain — every piece of advice traces back to a place",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Gowtham</span>
    │
    ├── <span style="color:var(--g)">Karur farm</span> (2 acres) ── Cotton
    │       └── <span style="color:var(--g)">Soil test</span>
    │               ├──► <span style="color:var(--g)">Weather snapshot</span>  (Karur, that day + 7-day forecast)
    │               └──► <span style="color:var(--g)">Advice</span>           (Cotton · 87% · fertiliser · watering)
    │
    └── <span style="color:var(--g)">Appa's land</span> (1.5 acres) ── Turmeric
            └── <span style="color:var(--g)">Soil test</span>
                    ├──► <span style="color:var(--g)">Weather snapshot</span>  (Namakkal — a different town!)
                    └──► <span style="color:var(--g)">Advice</span>           (Turmeric suggested)

<span style="color:var(--ink3)">// Same soil numbers, different town → different weather → different advice.</span></pre>` },
    { type:"table", title:"The soil test — what's required vs what's a bonus",
      html:`<table class="ann-table">
        <thead><tr><th>Group</th><th>Fields</th><th>Comes from</th><th>Required?</th></tr></thead>
        <tbody>
          <tr><td>The big three</td><td>Nitrogen, Phosphorus, Potassium</td><td>Basic ₹50 test kit</td><td>Yes</td></tr>
          <tr><td>Basics</td><td>pH, Moisture</td><td>Basic kit</td><td>Yes</td></tr>
          <tr><td>Soil health</td><td>Saltiness, Organic carbon</td><td>Govt Soil Health Card</td><td>Optional</td></tr>
          <tr><td>Helpers</td><td>Sulphur, Calcium, Magnesium</td><td>Govt card</td><td>Optional</td></tr>
          <tr><td>Trace nutrients</td><td>Zinc, Iron, Manganese, Boron, Copper</td><td>Govt card</td><td>Optional</td></tr>
        </tbody>
      </table>` }
  ],
  next:[
    `<span>Market prices</span> — the last crop block. Local market rates per crop, to turn a yield estimate into a rupee estimate.`,
    `<span>Then chat, alerts and feedback</span> — expert chat, push notifications, and post-harvest ratings.`,
    `<span>After that</span> — login and sign-up. The first screens that really work end to end.`
  ],
  snapshot:{ entities:14, enums:11, tables:16, endpoints:0 }
});
