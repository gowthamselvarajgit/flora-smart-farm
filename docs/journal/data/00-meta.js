/* ============================================================================
   FLORA DEV JOURNAL — META / CONFIG
   ----------------------------------------------------------------------------
   This file holds the project-wide info. It MUST load before any day file,
   because it creates the empty JOURNAL array that every day-NN.js pushes into.

   You will rarely edit this file. The two things you might change over time:
     • PHASES — when you finish a phase, flip its `status` and bump `done`.
     • PLAN   — the list of upcoming days shown on the Roadmap page.
   ========================================================================== */

/* The shared list every day file adds to. Created empty here, filled by the
   day-NN.js files, then read by the engine. Do not remove this line. */
var JOURNAL = [];

var META = {
  project: "Flora",
  subtitle: "backend · spring boot · modular monolith",
  fullForm: "Farmer Livelihood and Operations Resource Assistant",
  totalDays: 60,
  repo: "github.com/gowthamselvarajgit/flora-smart-farm"
};

var PHASES = [
  { n:1, name:"Phase 1 — Foundation", when:"Month 1", status:"active", steps:10, done:3,
    desc:`Spring Boot setup · Package structure · All entities · JWT auth · MockSensorService · OpenWeatherMap · Data seeding · /api/farmer/dashboard stub<br><br><strong style="color:var(--a)">Gate check:</strong> Farmer registers → logs in → sees personalised dashboard → language toggle works → mock sensor returns district NPK.` },
  { n:2, name:"Phase 2 — Crop AI Core", when:"Month 2", status:"todo", steps:10, done:0,
    desc:`Python Flask setup · Model 1 (Crop Recommendation) · Model 2 (Fertilizer Calculator) · Location suitability re-ranking · POST /api/scan/submit pipeline · i18n translation layer<br><br><strong style="color:var(--a)">Gate check:</strong> Soil submit → Flask models run → Tamil prediction on screen in under 3 seconds.` },
  { n:3, name:"Phase 3 — Animals + Chat + Price", when:"Month 3", status:"todo", steps:10, done:0,
    desc:`Models 3–7 · Agmarknet price data + LSTM · WebSocket STOMP chat · All animal APIs · All 5 animal screens · Chat screens · Price Tracker · Alert endpoints<br><br><strong style="color:var(--a)">Gate check:</strong> All 7 models live · Symptoms checker works · Real-time chat works end to end.` },
  { n:4, name:"Phase 4 — Production + Polish", when:"Month 4", status:"todo", steps:10, done:0,
    desc:`AWS EC2 + RDS + S3 deployment · Firebase FCM push notifications · @Scheduled alert system · Tamil + Hindi translations · Offline cache testing · README + 3-minute demo video<br><br><strong style="color:var(--a)">Gate check:</strong> App live on AWS · Push received on real Android · Demo video recorded.` }
];

var PLAN = [
  { day:"Day 4", title:"JWT auth — register endpoint", desc:"POST /api/auth/register. Takes phone + password, saves farmer with BCrypt hash, returns JWT token." },
  { day:"Day 5", title:"JWT auth — login endpoint", desc:"POST /api/auth/login. Validates credentials, returns JWT. Understand Spring Security filter chain." },
  { day:"Day 6", title:"MockSensorService + /api/sensor/mock", desc:"First real GET endpoint. Returns district-realistic fake NPK soil values. Tests the full controller → service → response flow." },
  { day:"Day 7", title:"OpenWeatherMap integration", desc:"WeatherService calling OpenWeatherMap API for a farmer's district. API key in properties. Test with Chennai and Coimbatore." },
  { day:"Day 8", title:"State + District + Crop + Breed data seeding", desc:"Seed all 36 Indian states, 788 districts, ~80 TN crops with Tamil/Hindi names, 17 animal types, breeds per species. One SQL file, run once." },
  { day:"Day 9", title:"district_crop_suitability seeding", desc:"Load TNAU crop suitability scores for all 38 TN districts. This is the location intelligence layer — the feature no other app has." },
  { day:"Day 10", title:"Phase 1 Gate Check", desc:"Register → login → JWT → mock sensor → personalised dashboard. All passing = Phase 1 complete." }
];
