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
    { file:"enums/animal/HealthStatus.java", sub:"a fixed list of health states; each one colours a badge",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// A fixed list of an animal's health states.</span>
<span class="cmt">// The app turns each one into a coloured badge on the animal's card.</span>

<span class="kw">public enum</span> <span class="cls">HealthStatus</span> {

    <span class="cmt">// ==================== THE ALLOWED CHOICES ====================</span>

    <span class="val">HEALTHY</span>(<span class="str">"Healthy"</span>),
    <span class="cmt">// 🟢 green badge — the animal is fine, nothing to do</span>

    <span class="val">SICK</span>(<span class="str">"Sick"</span>),
    <span class="cmt">// 🔴 red badge — needs attention now</span>

    <span class="val">RECOVERING</span>(<span class="str">"Recovering"</span>),
    <span class="cmt">// 🟡 amber badge — was sick, now getting better</span>

    <span class="val">CRITICAL</span>(<span class="str">"Critical"</span>),
    <span class="cmt">// 🔴 urgent — call the vet immediately</span>

    <span class="val">DECEASED</span>(<span class="str">"Deceased"</span>);
    <span class="cmt">// ⬛ grey — kept only for past records</span>

    <span class="cmt">// ==================== THE LABEL EACH CHOICE CARRIES ====================</span>

    <span class="kw">private final</span> String displayName;
    <span class="cmt">// the friendly word shown on screen, e.g. "Healthy"</span>

    <span class="cmt">// ============ CONSTRUCTOR (runs once for each choice) ============</span>

    <span class="cls">HealthStatus</span>(String displayName) {
        <span class="kw">this</span>.displayName = displayName;
    }

    <span class="cmt">// ============ GETTER (reads the label back) ============</span>

    <span class="kw">public</span> String <span class="prop">getDisplayName</span>() { <span class="kw">return</span> displayName; }
    <span class="cmt">// Example: HealthStatus.SICK.getDisplayName() → "Sick"</span>
    <span class="cmt">// the app picks the colour from the value — Gowtham just sees red or green</span>
}`,
      lines:[
        { c:`package com.flora.api.enums.animal;`, e:`The <b>address of this file</b> — the <code>enums/animal</code> folder.` },
        { c:`public enum HealthStatus {`, e:`A fixed "pick one" list of an animal's health states. The five values below are the only ones allowed.` },
        { c:`HEALTHY("Healthy"),`, e:`Stored as <b>HEALTHY</b>, shown as <b>"Healthy"</b>. The app paints this badge green.` },
        { c:`SICK("Sick"),`, e:`Stored as <b>SICK</b>, shown as <b>"Sick"</b> — red badge, needs attention now.` },
        { c:`RECOVERING("Recovering"),`, e:`Was sick, now getting better — amber badge.` },
        { c:`CRITICAL("Critical"),`, e:`Urgent — call the vet immediately.` },
        { c:`DECEASED("Deceased");`, e:`Kept only for history. The <b>semicolon</b> ends the list of choices.` },
        { c:`private final String displayName;`, e:`The friendly label each choice carries. <b>private</b> + <b>final</b> = hidden and never changes.` },
        { c:`HealthStatus(String displayName){`, e:`The <b>constructor</b> — Java runs it once per choice, receiving that choice's label.` },
        { c:`this.displayName = displayName;`, e:`Saves the label onto this choice. <b>this.</b> means "this choice's own field".` },
        { c:`}`, e:`Closes the constructor.` },
        { c:`public String getDisplayName(){ return displayName; }`, e:`The <b>getter</b> — lets code read the label. The badge colour, though, the app decides from the value itself.` },
        { c:`}`, e:`Closes the enum.` }
      ] },
    { file:"enums/animal/AnimalGender.java", sub:"a fixed 'pick one' list — male or female",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// A fixed list of an animal's sex. Female turns ON milk/egg tracking;</span>
<span class="cmt">// male hides it (a bull gives no milk).</span>

<span class="kw">public enum</span> <span class="cls">AnimalGender</span> {

    <span class="val">MALE</span>(<span class="str">"Male"</span>),
    <span class="val">FEMALE</span>(<span class="str">"Female"</span>);

    <span class="kw">private final</span> String displayName;

    <span class="cls">AnimalGender</span>(String displayName){
        <span class="kw">this</span>.displayName = displayName;
    }

    <span class="kw">public</span> String <span class="prop">getDisplayName</span>(){ <span class="kw">return</span> displayName; }
}`,
      lines:[
        { c:`package com.flora.api.enums.animal;`, e:`The <b>address of this file</b> — the <code>enums/animal</code> folder.` },
        { c:`public enum AnimalGender {`, e:`A fixed "pick one" list of an animal's sex — only MALE or FEMALE.` },
        { c:`MALE("Male"),`, e:`Stored as <b>MALE</b>, shown as <b>"Male"</b>. For males, the app hides milk/egg tracking.` },
        { c:`FEMALE("Female");`, e:`Stored as <b>FEMALE</b>, shown as <b>"Female"</b>. Females show production tracking. The <b>semicolon</b> ends the list.` },
        { c:`private final String displayName;`, e:`The friendly label each choice carries.` },
        { c:`AnimalGender(String displayName){`, e:`The <b>constructor</b> — runs once per choice with its label.` },
        { c:`this.displayName = displayName;`, e:`Saves the label onto the choice.` },
        { c:`}`, e:`Closes the constructor.` },
        { c:`public String getDisplayName(){ return displayName; }`, e:`The <b>getter</b> — reads the label back for the screen.` },
        { c:`}`, e:`Closes the enum.` }
      ] },
    { file:"entity/animal/Breed.java", sub:"one row = one breed (like Jersey); belongs to one animal type",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one breed, e.g. Jersey. Maps to the "breeds" table.</span>
<span class="cmt">// Each breed belongs to one animal type, so the dropdown stays clean.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "breeds")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Breed</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "breed_id")</span>
    <span class="kw">private</span> Long breedId;
    <span class="cmt">// the unique id of the breed.   Example: 1</span>

    <span class="cmt">// ==================== NAMES (in three languages) ====================</span>

    <span class="ann">@Column(name = "breed_name", nullable = false, length = 100)</span>
    <span class="cmt">// nullable = false → must be filled in</span>
    <span class="kw">private</span> String breedName;       <span class="cmt">// Example: "Holstein Friesian"</span>
    <span class="ann">@Column(name = "breed_name_tamil", length = 100)</span>
    <span class="kw">private</span> String breedNameTamil;  <span class="cmt">// shown when the app is in Tamil</span>
    <span class="ann">@Column(name = "breed_name_hindi", length = 100)</span>
    <span class="kw">private</span> String breedNameHindi;  <span class="cmt">// shown when the app is in Hindi</span>

    <span class="cmt">// ============ RELATIONSHIP: which animal type this is ============</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="cmt">// MANY breeds belong to ONE animal type</span>
    <span class="cmt">// LAZY → load the AnimalType only when we actually use it</span>
    <span class="ann">@JoinColumn(name = "animal_type_id", nullable = false)</span>
    <span class="cmt">// makes an "animal_type_id" column pointing to the animal_types table</span>
    <span class="kw">private</span> AnimalType animalType;
    <span class="cmt">// Example: Jersey → Cow. So picking "Cow" shows only cow breeds.</span>

    <span class="cmt">// ==================== STATUS FLAG ====================</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
    <span class="cmt">// true = shown in the list   ·   false = hidden, kept for old records</span>
}`,
      lines:[
        { c:`package com.flora.api.entity.animal;`, e:`The <b>address of this file</b> — the <code>entity/animal</code> folder.` },
        { c:`import jakarta.persistence.*;`, e:`The <b>JPA toolbox</b> of database annotations.` },
        { c:`import lombok.AllArgsConstructor;`, e:`Lombok all-args constructor tool.` },
        { c:`import lombok.Data;`, e:`Lombok getters/setters tool.` },
        { c:`import lombok.NoArgsConstructor;`, e:`Lombok empty-constructor tool.` },
        { c:`@Entity`, e:`Marks this class as a database table — each breed is one row.` },
        { c:`@Table(name = "breeds")`, e:`Names the table <b>breeds</b>.` },
        { c:`@Data`, e:`Lombok writes the getters/setters and friends.` },
        { c:`@NoArgsConstructor`, e:`Empty constructor JPA needs.` },
        { c:`@AllArgsConstructor`, e:`All-fields constructor.` },
        { c:`public class Breed {`, e:`Declares the class. Its fields define the <code>breeds</code> table.` },
        { c:`@Id`, e:`The <b>primary key</b> — the breed's unique id.` },
        { c:`@GeneratedValue(strategy = GenerationType.IDENTITY)`, e:`The database <b>auto-creates the id</b>.` },
        { c:`@Column(name = "breed_id")`, e:`Maps to the <code>breed_id</code> column.` },
        { c:`private Long breedId;`, e:`Holds the id.   Example: 1 = Jersey.` },
        { c:`@Column(name = "breed_name", nullable = false, length = 100)`, e:`The name column: required, max 100. (No <b>unique</b> — different animal types could share a breed name.)` },
        { c:`private String breedName;`, e:`Example: "Holstein Friesian".` },
        { c:`@Column(name = "breed_name_tamil", length = 100)`, e:`Optional Tamil name.` },
        { c:`private String breedNameTamil;`, e:`Shown when the app is in Tamil.` },
        { c:`@Column(name = "breed_name_hindi", length = 100)`, e:`Optional Hindi name.` },
        { c:`private String breedNameHindi;`, e:`Shown when the app is in Hindi.` },
        { c:`@ManyToOne(fetch = FetchType.LAZY)`, e:`Many breeds → one animal type. <b>LAZY</b> = load the type only when used.` },
        { c:`@JoinColumn(name = "animal_type_id", nullable = false)`, e:`Creates the <code>animal_type_id</code> linking column, required — every breed must belong to a type.` },
        { c:`private AnimalType animalType;`, e:`Which animal type this breed is.   Example: Jersey → Cow. This is what keeps the breed dropdown showing only cow breeds when "Cow" is picked.` },
        { c:`@Column(name = "is_active", nullable = false)`, e:`Required "in use" flag.` },
        { c:`private Boolean isActive = true;`, e:`<b>Defaults to true</b> (we added this default during the audit so new rows are never left blank).` },
        { c:`}`, e:`Closes the class. Everything above defines the <code>breeds</code> table.` }
      ] },
    { file:"entity/animal/Animal.java", sub:"one row = one real animal — Lakshmi's full profile",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one real animal, e.g. Lakshmi. Maps to the "animals" table.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "animals")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Animal</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "animal_id")</span>
    <span class="kw">private</span> Long animalId;
    <span class="cmt">// the unique id of the animal.   Example: Lakshmi = 1</span>

    <span class="cmt">// ==================== WHO OWNS IT ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY animals → ONE farmer. All 8 of Gowtham's animals point to farmer_id = 1.</span>

    <span class="cmt">// ==================== WHAT IT IS (type + breed) ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_type_id", nullable = false)</span>
    <span class="kw">private</span> AnimalType animalType;
    <span class="cmt">// MANY animals → ONE type.   Example: Lakshmi and Ponni are both Cows.</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "breed_id")</span>
    <span class="cmt">// no "nullable = false" here → the breed is OPTIONAL (he may not know it)</span>
    <span class="kw">private</span> Breed breed;
    <span class="cmt">// Example: Lakshmi → Jersey.   An unnamed cow → blank. Both are fine.</span>

    <span class="cmt">// ==================== BASIC DETAILS ====================</span>

    <span class="ann">@Column(name = "animal_name", length = 100)</span>
    <span class="kw">private</span> String animalName;
    <span class="cmt">// optional — people name cows, rarely hens.   Example: "Lakshmi"</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "gender", length = 10)</span>
    <span class="kw">private</span> AnimalGender gender;
    <span class="cmt">// FEMALE → show milk/egg tracking.   MALE → hide it.</span>

    <span class="ann">@Column(name = "date_of_birth")</span>
    <span class="kw">private</span> LocalDate dateOfBirth;
    <span class="cmt">// LocalDate = just the day, no clock time.   Example: 2024-06-12</span>

    <span class="ann">@Column(name = "weight_kg")</span>
    <span class="kw">private</span> Double weightKg;
    <span class="cmt">// used later to work out the right feed amount.   Example: 320.0</span>

    <span class="cmt">// ==================== HEALTH ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "health_status", nullable = false, length = 20)</span>
    <span class="kw">private</span> HealthStatus healthStatus = HealthStatus.HEALTHY;
    <span class="cmt">// starts Healthy. Turns red the moment a symptom check says otherwise.</span>

    <span class="cmt">// ==================== PREGNANCY ====================</span>

    <span class="ann">@Column(name = "is_pregnant")</span>
    <span class="kw">private</span> Boolean isPregnant = <span class="kw">false</span>;
    <span class="cmt">// mark it on → the app shows a countdown and adjusts milk expectations</span>

    <span class="ann">@Column(name = "expected_delivery_date")</span>
    <span class="kw">private</span> LocalDate expectedDeliveryDate;
    <span class="cmt">// filled only when pregnant. Two weeks before → a reminder push to Gowtham.</span>

    <span class="cmt">// ==================== GOVERNMENT TAG ====================</span>

    <span class="ann">@Column(name = "unique_tag_number", unique = true, length = 50)</span>
    <span class="cmt">// unique = true → if given, no two animals can share it</span>
    <span class="cmt">// but still optional — most small farmers don't have one</span>
    <span class="kw">private</span> String uniqueTagNumber;
    <span class="cmt">// Example: a government ear-tag id, or blank</span>

    <span class="cmt">// ==================== TIMESTAMPS ====================</span>

    <span class="ann">@Column(name = "registered_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime registeredAt = LocalDateTime.now();
    <span class="cmt">// LocalDateTime = date + time. updatable = false → set once, never changed.</span>
    <span class="ann">@Column(name = "updated_at")</span>
    <span class="kw">private</span> LocalDateTime updatedAt = LocalDateTime.now();
}`,
      lines:[
        { c:`package com.flora.api.entity.animal;`, e:`The <b>address of this file</b> — the <code>entity/animal</code> folder.` },
        { c:`import com.flora.api.entity.farmer.Farmer;`, e:`Brings in the <b>Farmer</b> class — used for the "owner" link below.` },
        { c:`import com.flora.api.enums.animal.AnimalGender;`, e:`Brings in the <b>AnimalGender</b> choice list (MALE/FEMALE).` },
        { c:`import com.flora.api.enums.animal.HealthStatus;`, e:`Brings in the <b>HealthStatus</b> choice list.` },
        { c:`import jakarta.persistence.*;`, e:`The <b>JPA toolbox</b> of annotations.` },
        { c:`import lombok.AllArgsConstructor;`, e:`Lombok all-args constructor tool.` },
        { c:`import lombok.Data;`, e:`Lombok getters/setters tool.` },
        { c:`import lombok.NoArgsConstructor;`, e:`Lombok empty-constructor tool.` },
        { c:`import java.time.LocalDate;`, e:`A <b>date with no time</b> — for the birth date.` },
        { c:`import java.time.LocalDateTime;`, e:`A <b>date and time</b> — for the timestamps.` },
        { c:`@Entity`, e:`Marks this class as a database table — each animal is one row.` },
        { c:`@Table(name = "animals")`, e:`Names the table <b>animals</b>.` },
        { c:`@Data`, e:`Lombok writes the getters/setters and friends.` },
        { c:`@NoArgsConstructor`, e:`Empty constructor JPA needs.` },
        { c:`@AllArgsConstructor`, e:`All-fields constructor.` },
        { c:`public class Animal {`, e:`Declares the class. Its fields define the <code>animals</code> table.` },
        { c:`@Id`, e:`The <b>primary key</b> — the animal's unique id.` },
        { c:`@GeneratedValue(strategy = GenerationType.IDENTITY)`, e:`The database <b>auto-creates the id</b>.` },
        { c:`@Column(name = "animal_id")`, e:`Maps to the <code>animal_id</code> column.` },
        { c:`private Long animalId;`, e:`Holds the id.   Example: Lakshmi = 1. Like an Aadhaar card for the animal.` },
        { c:`@ManyToOne(fetch = FetchType.LAZY)`, e:`Many animals → one farmer. <b>LAZY</b> = load the farmer only when used.` },
        { c:`@JoinColumn(name = "farmer_id", nullable = false)`, e:`Creates the <code>farmer_id</code> link, required — every animal has an owner.` },
        { c:`private Farmer farmer;`, e:`Who owns this animal.   Example: all 8 animals → farmer_id 1 (Gowtham).` },
        { c:`@ManyToOne(fetch = FetchType.LAZY)`, e:`Many animals → one animal type.` },
        { c:`@JoinColumn(name = "animal_type_id", nullable = false)`, e:`Creates the <code>animal_type_id</code> link, required.` },
        { c:`private AnimalType animalType;`, e:`What kind of animal it is.   Example: Lakshmi and Ponni are both Cows.` },
        { c:`@ManyToOne(fetch = FetchType.LAZY)`, e:`Many animals → one breed.` },
        { c:`@JoinColumn(name = "breed_id")`, e:`Creates the <code>breed_id</code> link. <b>No "nullable = false"</b> → it's optional.` },
        { c:`private Breed breed;`, e:`The breed, if known.   Example: Lakshmi → Jersey; an unnamed cow → blank.` },
        { c:`@Column(name = "animal_name", length = 100)`, e:`Optional name column, max 100.` },
        { c:`private String animalName;`, e:`Example: "Lakshmi". Blank for animals people don't name (like hens).` },
        { c:`@Enumerated(EnumType.STRING)`, e:`Store the gender as a readable word (MALE/FEMALE).` },
        { c:`@Column(name = "gender", length = 10)`, e:`The gender column.` },
        { c:`private AnimalGender gender;`, e:`<b>FEMALE</b> → show milk/egg tracking; <b>MALE</b> → hide it.` },
        { c:`@Column(name = "date_of_birth")`, e:`Optional birth date column.` },
        { c:`private LocalDate dateOfBirth;`, e:`Just the day (no clock time).   Example: 2024-06-12.` },
        { c:`@Column(name = "weight_kg")`, e:`Optional weight column.` },
        { c:`private Double weightKg;`, e:`Used later to work out the right feed amount.   Example: 320.0.` },
        { c:`@Enumerated(EnumType.STRING)`, e:`Store the health state as a readable word.` },
        { c:`@Column(name = "health_status", nullable = false, length = 20)`, e:`The health column — required.` },
        { c:`private HealthStatus healthStatus = HealthStatus.HEALTHY;`, e:`<b>Defaults to HEALTHY</b>; turns red the moment a symptom check says otherwise.` },
        { c:`@Column(name = "is_pregnant")`, e:`Optional pregnancy flag column.` },
        { c:`private Boolean isPregnant = false;`, e:`Mark it on → the app shows a countdown and adjusts milk expectations.` },
        { c:`@Column(name = "expected_delivery_date")`, e:`Optional due-date column.` },
        { c:`private LocalDate expectedDeliveryDate;`, e:`Filled only when pregnant. Two weeks before → a reminder push.` },
        { c:`@Column(name = "unique_tag_number", unique = true, length = 50)`, e:`The government ear-tag column: <b>unique</b> (no two animals share one), but optional.` },
        { c:`private String uniqueTagNumber;`, e:`A government ear-tag id, or blank — most small farmers don't have one.` },
        { c:`@Column(name = "registered_at", nullable = false, updatable = false)`, e:`<b>updatable=false</b> → set once when registered, never changed.` },
        { c:`private LocalDateTime registeredAt = LocalDateTime.now();`, e:`When the animal was added.` },
        { c:`@Column(name = "updated_at")`, e:`Refreshed whenever the animal's record changes (via the @PreUpdate hook we added in the audit).` },
        { c:`private LocalDateTime updatedAt = LocalDateTime.now();`, e:`The last-changed time.` },
        { c:`}`, e:`Closes the class. Everything above defines the <code>animals</code> table.` }
      ] }
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
      </table>` },
    { type:"versus", title:"Pick the smallest date type that fits",
      bad:{ label:"LocalDateTime for a birthday", code:`<span class="ann">@Column(name = "date_of_birth")</span>
<span class="kw">private</span> LocalDateTime dob;

<span class="cmt">// stores 2024-06-12T00:00:00</span>
<span class="cmt">// the time is fake noise — we never</span>
<span class="cmt">// knew the hour a calf was born.</span>
<span class="cmt">// confusing to sort and show.</span>` },
      good:{ label:"LocalDate for a birthday", code:`<span class="ann">@Column(name = "date_of_birth")</span>
<span class="kw">private</span> LocalDate dob;

<span class="cmt">// stores just 2024-06-12</span>
<span class="cmt">// exactly what we know, nothing more.</span>
<span class="cmt">// (registeredAt still uses date+time —</span>
<span class="cmt">//  there the exact moment matters.)</span>` },
      note:`<b>One-line answer:</b> use <b>LocalDate</b> when only the day matters (a birthday) and <b>LocalDateTime</b> when the exact moment matters (when a record was created). Don't store a clock time you never knew.` },
    { type:"qa", title:"Interview questions — Day 2 (tap to reveal the answer)",
      items:[
        { q:"It's one relationship — why does it have two names (@ManyToOne and @OneToMany)?",
          a:`Because you can read the same link from either end. Standing in <b>Animal</b>: \"many animals belong to one farmer\" (@ManyToOne). Standing in <b>Farmer</b>: \"one farmer has many animals\" (@OneToMany). It's one connection described from two sides.` },
        { q:"Which side actually stores the link?",
          a:`Always the <b>@ManyToOne side</b> (the \"many\" side). Each animal row carries a <b>farmer_id</b> pointing to its owner. The farmer row stores no list of animal ids — that couldn't fit in a single column.` },
        { q:"How do you make sure only cow breeds show when the farmer picks 'Cow'?",
          a:`Each breed is linked to one animal type (Jersey → Cow). So when the farmer picks Cow, the app asks only for that type's breeds. A goat breed can never appear in the cow list — the link makes the wrong choice impossible.` },
        { q:"When do you use LocalDate vs LocalDateTime?",
          a:`<b>LocalDate</b> when only the day matters — a birthday. <b>LocalDateTime</b> when the exact moment matters — when a record was created, for sorting and history. Pick the smallest type that fits.` },
        { q:"Why is the breed field allowed to be blank?",
          a:`Because a farmer may genuinely not know his animal's breed. Forcing it would block him from registering at all. We never make a field required if a real, valid case can leave it empty.` },
        { q:"How can the government tag be optional but still unique?",
          a:`Optional means it can be blank (most small farmers have none). Unique means if it <b>is</b> given, no two animals can share it. A field can be both — not required, but one-of-a-kind when present.` }
      ]
    }
  ],
  next:[
    `<span>Animal records</span> — health checks, daily milk/egg production, and an auto-managed vaccination schedule, all linked to each animal.`
  ],
  snapshot:{ entities:7, enums:5, tables:9, endpoints:0 }
});
