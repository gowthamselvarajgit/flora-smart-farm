# FLORA Backend — Project Status

**Stack:** Spring Boot 3.5.14 · Java 17 · MySQL · Spring Security + JWT (jjwt 0.11.5) · Lombok
**Package root:** `com.flora.api`

This file is the single source of truth for what is built vs. not built.
When starting a new chat, paste this so the assistant has accurate context.

---

## LEGEND
- ✅ Complete and working
- 🟡 Started but incomplete (stub / empty body)
- ❌ Not started (file does not exist)

---

## LAYER 1 — Foundation & Config — ✅ DONE

| Item | File | Status |
|------|------|--------|
| Dependencies (web, JPA, security, validation, lombok, mysql, jjwt) | `pom.xml` | ✅ |
| App config (DB, JPA ddl-auto=update, JWT props) | `src/main/resources/application.properties` | ✅ |
| Secrets externalized | `src/main/resources/.env` + `.env.example` | ✅ |
| Main application class | `ApiApplication.java` | ✅ |

---

## LAYER 2 — Entities (Database Model) — ✅ DONE (20 entities + 18 enums)

| Domain | Entities | Status |
|--------|----------|--------|
| Farmer | Farmer, Land, District, State | ✅ |
| Animal | Animal, AnimalType, Breed, AnimalHealthRecord, AnimalProductionRecord, VaccinationRecord | ✅ |
| Crop | Crop, MarketPrice, Prediction, SoilScan, WeatherSnapshot | ✅ |
| Chat | ChatSession, ChatMessage | ✅ |
| Alert | Alert, DeviceToken | ✅ |
| Feedback | Feedback | ✅ |
| Enums (18) | all domains (Language, PrimaryActivity, AnimalGender, HealthStatus, Symptom, CropSeason, AlertType, etc.) | ✅ |

---

## LAYER 3 — Authentication — 🟡 IN PROGRESS (this is the current focus)

| Item | File | Status | Notes |
|------|------|--------|-------|
| JWT util (generate/validate/extract access token, generate refresh token) | `config/JwtUtil.java` | ✅ | Access token = JWT signed HS256; refresh token = UUID |
| Farmer repository (findByPhoneNumber, existsByPhoneNumber) | `repository/FarmerRepository.java` | ✅ | |
| Register request DTO | `dto/auth/RegisterRequest.java` | 🟡 | EMPTY — has no fields yet |
| Login request DTO | `dto/auth/LoginRequest.java` | 🟡 | EMPTY — has no fields yet |
| Auth response DTO | `dto/auth/AuthResponse.java` | 🟡 | EMPTY — has no fields yet |

---

## LAYER 4 — NOT STARTED — ❌

### Auth completion (do these next)
| Item | Purpose | Status |
|------|---------|--------|
| `RefreshToken` entity + repository | JwtUtil generates refresh tokens but there is NOWHERE to store them | ❌ |
| `SecurityConfig` | SecurityFilterChain, PasswordEncoder bean, CORS, public vs protected routes | ❌ |
| JWT auth filter (OncePerRequestFilter) | Validate token on every request, set authenticated user | ❌ |
| `UserDetailsService` impl | Load Farmer from DB for Spring Security | ❌ |
| `AuthService` | register / login / refresh logic + password hashing | ❌ |
| `AuthController` | Endpoints: POST /api/auth/register, /login, /refresh | ❌ |
| `GlobalExceptionHandler` | Consistent error responses | ❌ |

### Other domains (repeat pattern: Repository → Service → Controller → DTO)
| Item | Status |
|------|--------|
| Repositories for the other 19 entities (only FarmerRepository exists) | ❌ |
| Services (farmer, animal, crop, chat, alert, feedback) | ❌ |
| Controllers (farmer, animal, crop, chat, alert, feedback) | ❌ |
| DTOs for all non-auth domains | ❌ |

---

## RECOMMENDED NEXT STEPS (in order)

1. Fill the 3 empty auth DTOs: RegisterRequest, LoginRequest, AuthResponse.
2. Create RefreshToken entity + RefreshTokenRepository (needed to store refresh tokens).
3. Create SecurityConfig + JWT filter + UserDetailsService impl.
4. Create AuthService → AuthController (register / login / refresh).
5. Test auth end-to-end (register a farmer, log in, hit a protected route).
6. Then build other domains one at a time using Repository → Service → Controller → DTO.

> Rule of thumb: finish ONE vertical slice (auth) fully before starting another domain.
