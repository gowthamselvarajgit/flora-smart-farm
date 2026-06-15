/* ============================================================================
   FLORA — PROJECT DOCS (the "understand the whole app" page)
   ----------------------------------------------------------------------------
   This is a living reference. Read it like you've never seen the project before.
   Update the lists as new files are built. The engine renders it on #/docs.
   ========================================================================== */
var DOCS = {
  updatedLabel: "as of Day 4 · 2026-06-15",

  /* one-screen explanation of what this project even is */
  intro: [
    `<p><span class="hl">Flora</span> (Farmer Livelihood and Operations Resource Assistant) is a mobile app + backend that helps a small Indian farmer make better decisions every day.</p>`,
    `<p>Picture a farmer named <b>Gowtham</b> in Karur, Tamil Nadu. He opens Flora and it tells him: <b>which crop to plant</b> based on his soil and weather, <b>how much fertiliser</b> to add, <b>when to water</b>, whether his <b>cow looks ill</b>, when its <b>vaccine is due</b>, and what today's <b>market price</b> is. It speaks his language — Tamil, Hindi or English.</p>`,
    `<p>This documentation explains the <b>backend</b> — the part that stores all the data and does the thinking. It's built so that each new reader can understand the whole thing from the top down: what it's made of, how it's organised, and what data it keeps.</p>`
  ],

  /* technology stack, grouped, each line in plain English */
  stack: [
    { group:"Backend — the engine", icon:"⚙️", items:[
      { name:"Java 17", what:"the language the backend is written in." },
      { name:"Spring Boot", what:"the framework that runs the app and connects all the pieces together." },
      { name:"Spring Data JPA + Hibernate", what:"turns our Java classes into database tables and writes the SQL for us, so we never write 'CREATE TABLE' by hand." },
      { name:"Spring Security + JWT", what:"handles login and passwords, and gives each user a token that proves who they are on every request." },
      { name:"MySQL", what:"the database — where every farmer, field, animal and soil test is actually stored." },
      { name:"Lombok", what:"removes repetitive code (the get/set methods) so classes stay short." },
      { name:"Validation", what:"checks incoming data (e.g. phone number not blank) before anything is saved." }
    ]},
    { group:"AI brain", icon:"🧠", items:[
      { name:"Python + Flask", what:"a small separate service that runs the machine-learning models." },
      { name:"ML models", what:"crop recommendation, fertiliser calculator, disease risk, yield estimate, and market-price forecast." }
    ]},
    { group:"Outside data", icon:"🌐", items:[
      { name:"OpenWeatherMap", what:"live weather and a 7-day forecast for a field's exact town." },
      { name:"Agmarknet", what:"official government market (mandi) prices for each crop." },
      { name:"Firebase Cloud Messaging", what:"sends push notifications to the farmer's phone." }
    ]},
    { group:"Where it runs", icon:"☁️", items:[
      { name:"AWS EC2", what:"the cloud server the backend runs on." },
      { name:"AWS RDS", what:"the managed MySQL database in the cloud." },
      { name:"AWS S3", what:"cheap storage for images — we keep only the link in the database." }
    ]},
    { group:"Build & tools", icon:"🧰", items:[
      { name:"Maven", what:"downloads the libraries and builds the project." },
      { name:"Git + GitHub", what:"saves every day's work and keeps the full history." }
    ]}
  ],

  /* the layered architecture, top door to database */
  layers: [
    { name:"Controller", role:"The front door. Receives a request from the phone and sends a reply.", eg:"e.g. POST /api/scan/submit" },
    { name:"Service", role:"The brain. Holds the real rules and steps for a feature.", eg:"e.g. work out the season, call the AI, save the result" },
    { name:"Repository", role:"The librarian. The only part that reads from and writes to the database.", eg:"e.g. save this soil test, fetch this farmer" },
    { name:"Entity", role:"The shape of one table. One entity = one grid in MySQL.", eg:"e.g. Farmer, Land, SoilScan, Animal" },
    { name:"DTO", role:"A clean parcel of data sent to/from the phone. Hides internal fields.", eg:"e.g. never sends the password back out" },
    { name:"Enum", role:"A fixed 'pick one' list of allowed values.", eg:"e.g. Language = EN / TA / HI" }
  ],

  /* a request, end to end (rendered as an animated flow) */
  requestFlow: [
    { icon:"📱", label:"Phone app", note:"Gowtham taps a button" },
    { icon:"🚪", label:"Controller", note:"receives the request" },
    { icon:"🧠", label:"Service", note:"runs the rules, calls the AI" },
    { icon:"📚", label:"Repository", note:"reads / writes data" },
    { icon:"🗄️", label:"MySQL", note:"the data is stored" }
  ],

  /* the 6 feature areas */
  modules: [
    { name:"Farmer", icon:"🧑‍🌾", status:"In progress", purpose:"Who the farmer is, and where their fields are.",
      done:["State","District","Farmer","Land"], pending:[] },
    { name:"Crop", icon:"🌱", status:"Done", purpose:"Soil tests, weather, and the AI's crop advice (5 models).",
      done:["Crop","SoilScan","WeatherSnapshot","Prediction","MarketPrice"], pending:[] },
    { name:"Animal", icon:"🐄", status:"Done", purpose:"Livestock, plus health, production and vaccination records.",
      done:["AnimalType","Breed","Animal","AnimalHealthRecord","AnimalProductionRecord","VaccinationRecord"], pending:[] },
    { name:"Chat", icon:"💬", status:"Planned", purpose:"Talk to a real expert or vet, in real time.",
      done:[], pending:["ChatSession","ChatMessage"] },
    { name:"Alert", icon:"🔔", status:"Planned", purpose:"Reminders and push notifications.",
      done:[], pending:["Alert","DeviceToken"] },
    { name:"Feedback", icon:"⭐", status:"Planned", purpose:"Rate how good the advice was after harvest.",
      done:[], pending:["Feedback"] }
  ],

  /* ERD — entities grouped by module. pk = key, cols = plain fields, fks = links out */
  erd: [
    { module:"Farmer module", entities:[
      { name:"State", pk:"state_id", cols:["state_name"], fks:[] },
      { name:"District", pk:"district_id", cols:["district_name","latitude","longitude"], fks:["state_id → State"] },
      { name:"Farmer", pk:"farmer_id", cols:["phone_number","first_name","language","alert_time"], fks:["district_id → District"] },
      { name:"Land", pk:"land_id", cols:["land_name","size_acres","soil_type"], fks:["farmer_id → Farmer","district_id → District","↔ Crop (land_crops)"] }
    ]},
    { module:"Crop module", entities:[
      { name:"Crop", pk:"crop_id", cols:["crop_name","crop_name_tamil"], fks:[] },
      { name:"SoilScan", pk:"scan_id", cols:["nitrogen","phosphorus","potassium","pH","moisture","season"], fks:["land_id → Land"] },
      { name:"WeatherSnapshot", pk:"weather_snapshot_id", cols:["temperature","humidity","rainfall","forecast_json"], fks:["scan_id → SoilScan (one-to-one)"] },
      { name:"Prediction", pk:"prediction_id", cols:["top-3 crops (names) + confidence","fertiliser (urea/DAP/MOP)","disease_risk_level","irrigation","predicted_price_json"], fks:["scan_id → SoilScan (one-to-one)","weather_snapshot_id → WeatherSnapshot (one-to-one)"] },
      { name:"MarketPrice", pk:"market_price_id", cols:["price_per_quintal","min/max/modal","price_date","mandi_name","source"], fks:["crop_id → Crop","district_id → District"] }
    ]},
    { module:"Animal module", entities:[
      { name:"AnimalType", pk:"animal_type_id", cols:["type_name","record_type"], fks:[] },
      { name:"Breed", pk:"breed_id", cols:["breed_name (EN/TA/HI)"], fks:["animal_type_id → AnimalType"] },
      { name:"Animal", pk:"animal_id", cols:["name","gender","weight","health_status","is_pregnant"], fks:["farmer_id → Farmer","animal_type_id → AnimalType","breed_id → Breed"] },
      { name:"AnimalHealthRecord", pk:"health_record_id", cols:["symptoms","predicted_disease","severity"], fks:["animal_id → Animal"] },
      { name:"AnimalProductionRecord", pk:"production_record_id", cols:["record_type","quantity","session","drop?"], fks:["animal_id → Animal"] },
      { name:"VaccinationRecord", pk:"vaccination_record_id", cols:["vaccine_name","due_date","status"], fks:["animal_id → Animal"] }
    ]}
  ],

  /* COMPLETED FILES — what's actually built and saved */
  files: [
    { path:"ApiApplication.java", type:"Bootstrap", module:"Core", status:"Done" },
    { path:"resources/application.properties", type:"Config", module:"Core", status:"Done" },
    { path:"entity/farmer/State.java", type:"Entity", module:"Farmer", status:"Done" },
    { path:"entity/farmer/District.java", type:"Entity", module:"Farmer", status:"Done" },
    { path:"entity/farmer/Farmer.java", type:"Entity", module:"Farmer", status:"Done" },
    { path:"entity/farmer/Land.java", type:"Entity", module:"Farmer", status:"Done" },
    { path:"entity/crop/Crop.java", type:"Entity", module:"Crop", status:"Done" },
    { path:"entity/crop/SoilScan.java", type:"Entity", module:"Crop", status:"Done" },
    { path:"entity/crop/WeatherSnapshot.java", type:"Entity", module:"Crop", status:"Done" },
    { path:"entity/crop/Prediction.java", type:"Entity", module:"Crop", status:"Done" },
    { path:"entity/crop/MarketPrice.java", type:"Entity", module:"Crop", status:"Done" },
    { path:"entity/animal/AnimalType.java", type:"Entity", module:"Animal", status:"Done" },
    { path:"entity/animal/Breed.java", type:"Entity", module:"Animal", status:"Done" },
    { path:"entity/animal/Animal.java", type:"Entity", module:"Animal", status:"Done" },
    { path:"entity/animal/AnimalHealthRecord.java", type:"Entity", module:"Animal", status:"Done" },
    { path:"entity/animal/AnimalProductionRecord.java", type:"Entity", module:"Animal", status:"Done" },
    { path:"entity/animal/VaccinationRecord.java", type:"Entity", module:"Animal", status:"Done" },
    { path:"enums/farmer/Language.java", type:"Enum", module:"Farmer", status:"Done" },
    { path:"enums/farmer/PrimaryActivity.java", type:"Enum", module:"Farmer", status:"Done" },
    { path:"enums/farmer/AnimalCountRange.java", type:"Enum", module:"Farmer", status:"Done" },
    { path:"enums/animal/HealthStatus.java", type:"Enum", module:"Animal", status:"Done" },
    { path:"enums/animal/AnimalGender.java", type:"Enum", module:"Animal", status:"Done" },
    { path:"enums/animal/Symptom.java", type:"Enum", module:"Animal", status:"Done" },
    { path:"enums/animal/ProductionSession.java", type:"Enum", module:"Animal", status:"Done" },
    { path:"enums/animal/RecordType.java", type:"Enum", module:"Animal", status:"Done" },
    { path:"enums/animal/VaccinationStatus.java", type:"Enum", module:"Animal", status:"Done" },
    { path:"enums/crop/CropSeason.java", type:"Enum", module:"Crop", status:"Done" }
  ],

  /* what is still to come (so the reader knows the map isn't finished) */
  pending: [
    { path:"entity/chat/ChatSession.java + ChatMessage.java", type:"Entity", module:"Chat" },
    { path:"entity/alert/Alert.java + DeviceToken.java", type:"Entity", module:"Alert" },
    { path:"entity/feedback/Feedback.java", type:"Entity", module:"Feedback" },
    { path:"config/ — JWT security setup", type:"Config", module:"Core" },
    { path:"repository/ · service/ · controller/ · dto/", type:"Logic", module:"All" }
  ],

  /* enum catalog — every fixed list and what it's for */
  enums: [
    { name:"Language", values:"EN, TA, HI", use:"the app's language" },
    { name:"PrimaryActivity", values:"CROP, ANIMAL, BOTH", use:"which screens show first" },
    { name:"AnimalCountRange", values:"1-5, 5-15, 15-30, 30+", use:"rough herd size at sign-up" },
    { name:"HealthStatus", values:"HEALTHY, SICK, RECOVERING, CRITICAL, DECEASED", use:"colour badge on an animal" },
    { name:"AnimalGender", values:"MALE, FEMALE", use:"female shows milk/egg tracking" },
    { name:"Symptom", values:"21 common symptoms", use:"the tappable symptom tiles" },
    { name:"ProductionSession", values:"MORNING, EVENING, HARVEST", use:"when milk/eggs/yield is recorded" },
    { name:"RecordType", values:"MILK, EGG, WEIGHT_YIELD", use:"what an animal produces (+ its unit)" },
    { name:"VaccinationStatus", values:"PENDING, DUE_SOON, OVERDUE, COMPLETED", use:"badge + reminder timing" },
    { name:"CropSeason", values:"KHARIF, RABI, ZAID, PERENNIAL", use:"set from today's date on a soil test" }
  ]
};
