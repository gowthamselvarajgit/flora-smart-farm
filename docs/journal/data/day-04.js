/* ============================================================================
   DAY 4 — Crop module begins · The multi-land rethink
   ============================================================================ */
JOURNAL.push({
  day:4,
  date:"2026-06-15",
  title:"SoilScan · Multi-land pivot · WeatherSnapshot · Prediction (5 AI models) · MarketPrice",
  phase:1, status:"today",
  tags:["Crop domain","Soil test","Multiple lands","One-to-one link","Weather","AI advice","Market price"],
  summary:"The crop side begins — and a simple question changed our whole design. A farmer doesn't have one field; he can have several, in different places. So we gave land its own block, captured a full soil test, saved the day's weather, added the Prediction that holds the output of all 5 AI models, and a MarketPrice block for daily mandi rates. The crop module's tables are now complete.",
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
    `<span>Prediction block</span> — one row holds the output of all 5 AI models for a test: top-3 crops (by name) with confidence, fertiliser amounts (urea/DAP/MOP), disease risk, watering advice, and a market-price forecast. It reads both the soil test AND the weather.`,
    `<span>MarketPrice block</span> — one row = one day's market (mandi) price for a crop in a town: per-quintal price plus min/max/modal, the market name and source (Agmarknet). Feeds the Price Tracker and the profit estimate.`,
    `<span>5 new tables</span> — lands, soil tests, weather snapshots, predictions, market prices. We're now at 17 tables.`
  ],
  understood:[
    `<span>One farmer, many fields</span> — Karur and Namakkal have different weather and different soil. If the town lived only on the farmer, one field would always get the wrong advice. Giving each field its own block fixes this for good. This is the foundation the whole crop feature stands on.`,
    `<span>Crops need more than N-P-K</span> — Calcium stops rot in tomatoes, magnesium keeps leaves green, zinc is the most common shortage in our rice soils. So we capture them all — but keep them optional, because a basic test kit gives only the big three while the government card gives the rest. Gowtham fills what he has and is never blocked.</span>`,
    `<span>Work it out, but still write it down</span> — The app knows the season from the date, yet we save it on the record. A test done this June must always read "Kharif", even if someone opens it next December. Saved facts don't drift.`,
    `<span>"Exactly one" links (one-to-one)</span> — One soil test has exactly one weather snapshot and exactly one prediction — never shared. Like a passport: one person, one passport. The database itself blocks any attempt to share.`,
    `<span>Save the AI's answer in the shape it comes</span> — The crop model returns crop names and confidence numbers, so we save those directly (it might even suggest a crop that isn't in our crops table yet). The price model returns a whole forecast, so that goes in as one JSON text field. Plain values for plain answers; JSON only for the variable-length list.`,
    `<span>One row, five models</span> — All 5 AI models run from the same soil test + weather at the same moment, and Gowtham sees their results on one screen. So one Prediction row holds them all, split into clear sections (crop · fertiliser · disease · irrigation · price). One save, one fetch, no joins.`,
    `<span>Old records must still make sense</span> — Each test remembers its field's town, and each weather snapshot remembers that day's actual weather. So months later we can still explain "why did Flora suggest Cotton last June?" Nothing silently changes meaning.`
  ],
  code:[
    { file:"entity/farmer/Land.java", sub:"one row = one field a farmer owns, in its own town",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one field a farmer owns. Maps to the "lands" table.</span>
<span class="cmt">// A farmer can have many fields, each in its own town.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "lands")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Land</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "land_id")</span>
    <span class="kw">private</span> Long landId;
    <span class="cmt">// the unique id of the field.   Example: 1 = Karur farm</span>

    <span class="cmt">// ==================== WHO OWNS IT ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY fields → ONE farmer.   Example: Gowtham owns Karur AND Namakkal.</span>

    <span class="cmt">// ==================== WHERE IT IS ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "district_id", nullable = false)</span>
    <span class="kw">private</span> District district;
    <span class="cmt">// each field has its OWN town. Weather + advice use THIS one,</span>
    <span class="cmt">// not the farmer's home town.</span>

    <span class="cmt">// ==================== FIELD DETAILS ====================</span>

    <span class="ann">@Column(name = "land_name", length = 100)</span>
    <span class="kw">private</span> String landName;
    <span class="cmt">// optional nickname.   Example: "Karur farm", "Appa's land"</span>

    <span class="ann">@Column(name = "size_acres", nullable = false)</span>
    <span class="kw">private</span> Double sizeAcres;
    <span class="cmt">// required. used to scale the fertiliser amount.   Example: 2.0</span>

    <span class="ann">@Column(name = "soil_type", length = 100)</span>
    <span class="kw">private</span> String soilType;
    <span class="cmt">// optional.   Example: "Red loamy", "Black cotton soil"</span>

    <span class="cmt">// ==================== CROPS ON THIS FIELD ====================</span>

    <span class="ann">@ManyToMany(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinTable(name = "land_crops",</span>
        <span class="ann">joinColumns = @JoinColumn(name = "land_id"),</span>
        <span class="ann">inverseJoinColumns = @JoinColumn(name = "crop_id"))</span>
    <span class="kw">private</span> List&lt;Crop&gt; currentCrops;
    <span class="cmt">// many ↔ many, tracked per field.   Karur → Cotton, Namakkal → Turmeric</span>

    <span class="cmt">// ==================== STATUS ====================</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
    <span class="cmt">// false = sold or no longer farmed. Old tests are still kept.</span>

    <span class="cmt">// ==================== TIMESTAMPS ====================</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}` },
    { file:"entity/crop/SoilScan.java", sub:"one row = one soil test on a field; required basics + optional extras",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one soil test on a field. Maps to the "soil_scans" table.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "soil_scans")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">SoilScan</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "scan_id")</span>
    <span class="kw">private</span> Long scanId;
    <span class="cmt">// the unique id of this test.   Example: 1</span>

    <span class="cmt">// ==================== WHICH FIELD ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "land_id", nullable = false)</span>
    <span class="kw">private</span> Land land;
    <span class="cmt">// the test belongs to a FIELD. Through it we reach the farmer,</span>
    <span class="cmt">// the town and the field size — all in one hop.</span>

    <span class="cmt">// ============ REQUIRED BASICS (basic ₹50 test kit) ============</span>
    <span class="cmt">// nullable = false on each → the test can't be saved without them.</span>

    <span class="ann">@Column(name = "nitrogen", nullable = false)</span>
    <span class="kw">private</span> Double nitrogen;     <span class="cmt">// leafy growth.   Example: 45.0</span>
    <span class="ann">@Column(name = "phosphorus", nullable = false)</span>
    <span class="kw">private</span> Double phosphorus;   <span class="cmt">// roots + flowers.   Example: 28.0</span>
    <span class="ann">@Column(name = "potassium", nullable = false)</span>
    <span class="kw">private</span> Double potassium;    <span class="cmt">// strength + disease resistance.   Example: 38.0</span>
    <span class="ann">@Column(name = "ph_level", nullable = false)</span>
    <span class="kw">private</span> Double phLevel;      <span class="cmt">// sweet spot 6.5–7.5.   Example: 6.8</span>
    <span class="ann">@Column(name = "moisture", nullable = false)</span>
    <span class="kw">private</span> Double moisture;     <span class="cmt">// how wet the soil is now (%).   Example: 42.0</span>

    <span class="cmt">// ============ OPTIONAL EXTRAS (govt Soil Health Card) ============</span>
    <span class="cmt">// no "nullable = false" → all optional. Fill what you have; missing is fine.</span>

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

    <span class="cmt">// ============ SEASON (filled by the app, not the farmer) ============</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "season", length = 20)</span>
    <span class="kw">private</span> CropSeason season;
    <span class="cmt">// the app sets this from today's date. saved so old tests stay correct.</span>

    <span class="cmt">// ============ TEST-DATA FLAG + TIMESTAMP ============</span>

    <span class="ann">@Column(name = "is_mock_data", nullable = false)</span>
    <span class="kw">private</span> Boolean isMockData = <span class="kw">false</span>;
    <span class="cmt">// true = fake test data, not a real reading</span>

    <span class="ann">@Column(name = "scanned_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime scannedAt = LocalDateTime.now();
}` },
    { file:"entity/crop/WeatherSnapshot.java", sub:"one row = the weather saved at the moment of one soil test",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = the weather saved at the moment of one soil test.</span>
<span class="cmt">// Maps to the "weather_snapshots" table.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "weather_snapshots")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">WeatherSnapshot</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "weather_snapshot_id")</span>
    <span class="kw">private</span> Long weatherSnapshotId;
    <span class="cmt">// the unique id of this snapshot.   Example: 1</span>

    <span class="cmt">// ============ THE TEST IT BELONGS TO (one-to-one) ============</span>

    <span class="ann">@OneToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "scan_id", nullable = false, unique = true)</span>
    <span class="kw">private</span> SoilScan soilScan;
    <span class="cmt">// ONE snapshot ↔ ONE test. unique = true → the database blocks any sharing.</span>
    <span class="cmt">// the town comes through the test → field → district. No extra column here.</span>

    <span class="cmt">// ============ CURRENT WEATHER (at the time of the test) ============</span>

    <span class="ann">@Column(name = "temperature_celsius")</span>
    <span class="kw">private</span> Double temperatureCelsius;   <span class="cmt">// Example: 34.5</span>
    <span class="ann">@Column(name = "feels_like_celsius")</span>
    <span class="kw">private</span> Double feelsLikeCelsius;     <span class="cmt">// Example: 38.0</span>
    <span class="ann">@Column(name = "humidity_percent")</span>
    <span class="kw">private</span> Double humidityPercent;      <span class="cmt">// damp air → fungus risk.   Example: 70.0</span>
    <span class="ann">@Column(name = "rainfall_mm")</span>
    <span class="kw">private</span> Double rainfallMm;           <span class="cmt">// last 24 hours.   Example: 5.0</span>
    <span class="ann">@Column(name = "wind_speed_kmh")</span>
    <span class="kw">private</span> Double windSpeedKmh;         <span class="cmt">// affects spraying.   Example: 12.0</span>
    <span class="ann">@Column(name = "weather_description", length = 100)</span>
    <span class="kw">private</span> String weatherDescription;  <span class="cmt">// Example: "Partly cloudy"</span>
    <span class="ann">@Column(name = "weather_icon_code", length = 20)</span>
    <span class="kw">private</span> String weatherIconCode;     <span class="cmt">// which weather icon to show</span>

    <span class="cmt">// ==================== 7-DAY FORECAST ====================</span>

    <span class="ann">@Column(name = "forecast_json", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String forecastJson;
    <span class="cmt">// the 7-day forecast saved as text — a small list we only ever show as a block</span>

    <span class="cmt">// ==================== TIMESTAMP ====================</span>

    <span class="ann">@Column(name = "fetched_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime fetchedAt = LocalDateTime.now();
    <span class="cmt">// fetched once when the test is taken, never again</span>
}` },
    { file:"entity/crop/Prediction.java", sub:"one row = the output of all 5 AI models for one test",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = all the AI advice for one soil test. Maps to "predictions".</span>
<span class="cmt">// The inputs are at the top; then one section per AI model.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "predictions")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Prediction</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "prediction_id")</span>
    <span class="kw">private</span> Long predictionId;
    <span class="cmt">// the unique id of this advice.   Example: 1</span>

    <span class="cmt">// ============ THE INPUTS (what the models read) ============</span>

    <span class="ann">@OneToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "scan_id", nullable = false, unique = true)</span>
    <span class="kw">private</span> SoilScan soilScan;
    <span class="cmt">// the soil test. unique = true → one test → one prediction.</span>

    <span class="ann">@OneToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "weather_snapshot_id", nullable = false)</span>
    <span class="kw">private</span> WeatherSnapshot weatherSnapshot;
    <span class="cmt">// that day's weather. the models read soil + weather TOGETHER.</span>

    <span class="cmt">// ============ MODEL 1 · CROP RECOMMENDATION ============</span>
    <span class="cmt">// the AI returns the top 3 crops by NAME (a name, not a link — the model</span>
    <span class="cmt">// may suggest a crop we don't keep in the crops table).</span>

    <span class="ann">@Column(name = "recommended_crop_1", length = 100)</span>
    <span class="kw">private</span> String recommendedCrop1;   <span class="cmt">// Example: "Cotton"</span>
    <span class="ann">@Column(name = "crop_1_confidence")</span>
    <span class="kw">private</span> Double crop1Confidence;     <span class="cmt">// Example: 0.87 = 87% sure</span>
    <span class="ann">@Column(name = "recommended_crop_2", length = 100)</span>
    <span class="kw">private</span> String recommendedCrop2;   <span class="cmt">// 2nd choice</span>
    <span class="ann">@Column(name = "crop_2_confidence")</span>
    <span class="kw">private</span> Double crop2Confidence;
    <span class="ann">@Column(name = "recommended_crop_3", length = 100)</span>
    <span class="kw">private</span> String recommendedCrop3;   <span class="cmt">// 3rd choice</span>
    <span class="ann">@Column(name = "crop_3_confidence")</span>
    <span class="kw">private</span> Double crop3Confidence;
    <span class="ann">@Column(name = "crop_recommendation_reason", length = 1000)</span>
    <span class="kw">private</span> String cropRecommendationReason;  <span class="cmt">// plain-text "why this crop"</span>

    <span class="cmt">// ============ MODEL 2 · FERTILISER CALCULATOR ============</span>

    <span class="ann">@Column(name = "urea_kg_per_acre")</span>
    <span class="kw">private</span> Double ureaKgPerAcre;   <span class="cmt">// how much urea, per acre.   Example: 40.0</span>
    <span class="ann">@Column(name = "dap_kg_per_acre")</span>
    <span class="kw">private</span> Double dapKgPerAcre;    <span class="cmt">// how much DAP, per acre.   Example: 20.0</span>
    <span class="ann">@Column(name = "mop_kg_per_acre")</span>
    <span class="kw">private</span> Double mopKgPerAcre;    <span class="cmt">// how much MOP (potash), per acre</span>
    <span class="ann">@Column(name = "fertilizer_schedule", length = 1000)</span>
    <span class="kw">private</span> String fertilizerSchedule;  <span class="cmt">// when to apply each one</span>

    <span class="cmt">// ============ MODEL 3 · DISEASE RISK ALERT ============</span>

    <span class="ann">@Column(name = "disease_risk_level", length = 20)</span>
    <span class="kw">private</span> String diseaseRiskLevel;  <span class="cmt">// "LOW" / "MEDIUM" / "HIGH" (plain text)</span>
    <span class="ann">@Column(name = "disease_name", length = 200)</span>
    <span class="kw">private</span> String diseaseName;       <span class="cmt">// Example: "Leaf blight"</span>
    <span class="ann">@Column(name = "disease_action", length = 500)</span>
    <span class="kw">private</span> String diseaseAction;     <span class="cmt">// what to do about it</span>

    <span class="cmt">// ============ MODEL 4 · IRRIGATION ADVISOR ============</span>

    <span class="ann">@Column(name = "days_until_irrigation")</span>
    <span class="kw">private</span> Integer daysUntilIrrigation;  <span class="cmt">// Example: 3</span>
    <span class="ann">@Column(name = "irrigation_volume_mm")</span>
    <span class="kw">private</span> Double irrigationVolumeMm;     <span class="cmt">// how much water</span>
    <span class="ann">@Column(name = "irrigation_advice", length = 500)</span>
    <span class="kw">private</span> String irrigationAdvice;       <span class="cmt">// Example: "Water again in 3 days"</span>

    <span class="cmt">// ============ MODEL 5 · MARKET PRICE PREDICTOR ============</span>

    <span class="ann">@Column(name = "predicted_price_json", columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String predictedPriceJson;
    <span class="cmt">// the price forecast saved as text — a variable-length list, so JSON fits</span>
    <span class="ann">@Column(name = "best_sell_window_start")</span>
    <span class="kw">private</span> LocalDateTime bestSellWindowStart;  <span class="cmt">// best time to sell — from</span>
    <span class="ann">@Column(name = "best_sell_window_end")</span>
    <span class="kw">private</span> LocalDateTime bestSellWindowEnd;    <span class="cmt">// best time to sell — to</span>
    <span class="ann">@Column(name = "price_advice", length = 500)</span>
    <span class="kw">private</span> String priceAdvice;     <span class="cmt">// Example: "Hold 2 weeks, prices rising"</span>

    <span class="cmt">// ==================== METADATA ====================</span>

    <span class="ann">@Column(name = "flask_response_time_ms")</span>
    <span class="kw">private</span> Long flaskResponseTimeMs;  <span class="cmt">// how long the Python AI took (ms)</span>

    <span class="ann">@Column(name = "predicted_at", nullable = false)</span>
    <span class="kw">private</span> LocalDateTime predictedAt = LocalDateTime.now();
}` },
    { file:"entity/crop/MarketPrice.java", sub:"one row = one day's market (mandi) price for a crop in a town",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one day's market (mandi) price for a crop in a town.</span>
<span class="cmt">// Maps to "market_prices". Feeds the Price Tracker + the profit estimate.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "market_prices")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">MarketPrice</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "market_price_id")</span>
    <span class="kw">private</span> Long marketPriceId;
    <span class="cmt">// the unique id of this price row.   Example: 1</span>

    <span class="cmt">// ==================== WHICH CROP ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "crop_id", nullable = false)</span>
    <span class="kw">private</span> Crop crop;
    <span class="cmt">// MANY prices → ONE crop. Example: many days of Cotton prices.</span>

    <span class="cmt">// ==================== WHICH TOWN ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "district_id", nullable = false)</span>
    <span class="kw">private</span> District district;
    <span class="cmt">// prices differ town to town, so each row records its district</span>

    <span class="cmt">// ============ PRICE DATA (₹ per quintal = 100 kg) ============</span>

    <span class="ann">@Column(name = "price_per_quintal", nullable = false)</span>
    <span class="kw">private</span> Double pricePerQuintal;  <span class="cmt">// required.   Example: 6200.0</span>
    <span class="ann">@Column(name = "min_price")</span>
    <span class="kw">private</span> Double minPrice;          <span class="cmt">// the day's lowest</span>
    <span class="ann">@Column(name = "max_price")</span>
    <span class="kw">private</span> Double maxPrice;          <span class="cmt">// the day's highest</span>
    <span class="ann">@Column(name = "modal_price")</span>
    <span class="kw">private</span> Double modalPrice;        <span class="cmt">// the most common price that day</span>

    <span class="cmt">// ==================== DATE ====================</span>

    <span class="ann">@Column(name = "price_date", nullable = false)</span>
    <span class="kw">private</span> LocalDate priceDate;      <span class="cmt">// which day this price is for</span>

    <span class="cmt">// ==================== SOURCE ====================</span>

    <span class="ann">@Column(name = "mandi_name", length = 200)</span>
    <span class="kw">private</span> String mandiName;         <span class="cmt">// which market.   Example: "Karur mandi"</span>
    <span class="ann">@Column(name = "source", length = 100)</span>
    <span class="kw">private</span> String source;            <span class="cmt">// where we got it.   Example: "Agmarknet"</span>

    <span class="cmt">// ==================== TIMESTAMP ====================</span>

    <span class="ann">@Column(name = "fetched_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime fetchedAt = LocalDateTime.now();
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
        { term:"Save plain answers plainly; JSON only for lists", def:"If the answer is a single value (a name, a number), save it in its own column. If it's a variable-length list, save it as one JSON text field instead of building an extra table.",
          eg:"The AI's top-3 crops are saved as plain names + numbers; the multi-day price forecast is saved as one JSON field." },
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
      </table>` },
    { type:"versus", title:"When 'one' quietly becomes 'many' — the multi-land fix",
      bad:{ label:"Town + size on the Farmer", code:`<span class="kw">class</span> <span class="cls">Farmer</span> {
    District district;       <span class="cmt">// one town</span>
    Double   landSizeAcres;  <span class="cmt">// one size</span>
}
<span class="cmt">// breaks the moment a farmer owns a</span>
<span class="cmt">// field in a SECOND town — wrong</span>
<span class="cmt">// weather + wrong advice for it.</span>` },
      good:{ label:"Give Land its own block", code:`<span class="kw">class</span> <span class="cls">Land</span> {
    Farmer   farmer;
    District district;   <span class="cmt">// each field's own town</span>
    Double   sizeAcres;
}
<span class="cmt">// a farmer has many Lands. every soil</span>
<span class="cmt">// test points to a field, so advice is</span>
<span class="cmt">// always right for that exact ground.</span>` },
      note:`<b>One-line answer:</b> when a single value turns out to be \"many\" in real life, give it its own entity. Karur and Namakkal need different weather, so the <b>land</b> owns the town — not the farmer.` },
    { type:"qa", title:"Interview questions — Day 4 (tap to reveal the answer)",
      items:[
        { q:"Why give Land its own entity instead of putting the town on the Farmer?",
          a:`Because a farmer can own fields in different towns — Karur and Namakkal — with different weather and soil. If the town lived on the farmer, one field would always get the wrong advice. A separate Land block lets every soil test use the right town.` },
        { q:"What's the difference between @OneToOne and @ManyToOne?",
          a:`<b>@ManyToOne</b> = many rows share one parent (many soil tests for one field). <b>@OneToOne</b> = an exclusive pair (one soil test has exactly one weather snapshot). Adding <b>unique=true</b> on the link makes the database refuse any sharing — like a passport: one person, one passport.` },
        { q:"Why does one Prediction row hold the output of all 5 AI models?",
          a:`Because all 5 models run from the same soil test + weather at the same moment, and Gowtham sees their results together on one screen. One row means one save, one fetch, and no joins to show the advice. The row is split into clear sections — crop, fertiliser, disease, irrigation, price.` },
        { q:"Why store the recommended crops as plain names instead of links to the Crop table?",
          a:`The AI returns crop names with confidence scores, and it may suggest a crop we don't keep in our crops table. Saving the names directly keeps it simple and honest — we only need to show them, not search or join on them.` },
        { q:"Why store the season when you can work it out from the date?",
          a:`So old records never change meaning. A test done this June must always read \"Kharif\", even when opened next December. We fill it from the date automatically, but we save it so the record stays honest forever.` },
        { q:"A farmer moves district next year. Why do his old predictions still make sense?",
          a:`Because each record is <b>self-contained</b>: the soil test points to a field whose town was fixed at the time, and the weather snapshot saved that day's actual weather. Nothing is recalculated from today's data, so the old advice still explains itself.` },
        { q:"Why are most soil fields optional (nullable)?",
          a:`A basic ₹50 kit gives only the big three plus pH; the full set comes from the government Soil Health Card. Making the extras optional lets a farmer enter what he has — more data gives better advice, but missing data never blocks him.` }
      ]
    }
  ],
  next:[
    `<span>Chat, alerts and feedback</span> — expert chat, push notifications, and post-harvest ratings. The crop module's tables are now complete.`,
    `<span>After that</span> — login and sign-up. The first screens that really work end to end.`
  ],
  snapshot:{ entities:15, enums:10, tables:17, endpoints:0 }
});
