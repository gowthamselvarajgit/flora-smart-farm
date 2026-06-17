/* ============================================================================
   DAY 5 — Chat · Alert · DeviceToken · Feedback — the last entities
   ============================================================================ */
JOURNAL.push({
  day:5,
  date:"2026-06-17",
  title:"ChatSession · ChatMessage · Alert · DeviceToken · Feedback",
  phase:1, status:"today",
  tags:["Chat","Alerts","Push notifications","Feedback","Entities","Enums"],
  summary:"The last 5 entities — expert chat (a session + its messages), alerts + device tokens for push notifications, and post-harvest feedback that teaches the AI. With these, the whole database layer is complete: 20 tables.",
  story:`<p>Until today, Flora could only <b>talk to itself</b> — store data and run its models. Now it can <span class="hl">talk to Gowtham, and listen back</span>.</p>
  <p>When Lakshmi's health check says \"see a vet\", he taps <b>Connect with Expert</b> and a chat opens — already filled with her name, the likely illness, and his notes. Flora also <b>nudges</b> him: a push notification when milk drops or a vaccine is due. And after harvest, he tells Flora whether the advice actually worked — which is how the AI gets smarter next season.</p>
  <p>Five small entities, and the database is done. Every screen the app will ever show now has a table behind it.</p>`,
  built:[
    `<span>ChatSession</span> — one conversation between a farmer and an expert. Knows its category (crop or animal), and can link to the exact animal + health record that started it, so the expert has the full picture.`,
    `<span>ChatMessage</span> — each message in a session: who sent it (farmer or expert), the text, a read flag, and an optional photo attachment.`,
    `<span>Alert</span> — one notification for a farmer: a type (disease, irrigation, price, weather, vaccination, production drop), a severity, a title + message, and a tap action that jumps to the right screen.`,
    `<span>DeviceToken</span> — the farmer's phone token, so the server can send a push. One farmer can have several devices; old tokens are switched off, not deleted.`,
    `<span>Feedback</span> — after harvest, the farmer rates a prediction and records what actually grew and the real yield. This closes the loop and trains the AI.`,
    `<span>7 new enums</span> — ChatCategory, ChatStatus, SenderType, AlertType, AlertSeverity, DevicePlatform, FeedbackType.`,
    `<span>5 new tables</span> — chat_sessions, chat_messages, alerts, device_tokens, feedback. The database layer is complete: 20 entities, 17 enums, 22 tables.`
  ],
  understood:[
    `<span>A conversation is two tables, not one</span> — A ChatSession holds the thread (who, what it's about, status); many ChatMessages hang off it. It's the exact same shape as a farmer and his animals — one parent, many children.`,
    `<span>Pre-filling context turns a cold chat warm</span> — Because a ChatSession can point to the animal and the health record that triggered it, the expert opens the chat already knowing the case. The farmer never retypes what's wrong.`,
    `<span>A token is how a server reaches a phone</span> — Push notifications can't just "find" a phone; the phone hands the server a token (from Firebase), and we store it. One farmer can have a phone and a tablet, so it's many tokens → one farmer.`,
    `<span>Switch off, don't delete</span> — When a token stops working, we set is_active = false instead of deleting the row. We keep the history, and a clean on/off flag is simpler than removing and re-adding.`,
    `<span>An alert carries its own action</span> — Each Alert stores a deep link, so tapping "Lakshmi's vaccine is due" jumps straight to her vaccination screen — not just to the home page.`,
    `<span>"Sent" and "read" are different questions</span> — is_push_sent answers "did we deliver it?"; is_read answers "did he actually see it?". We track both, because they fail in different ways.`,
    `<span>Feedback stores the truth, not just stars</span> — A rating alone teaches the AI little. Recording the crop that actually grew and the real yield is what lets us check the prediction against reality and improve it.`
  ],
  code:[
    { file:"entity/chat/ChatSession.java", sub:"one row = one conversation between a farmer and an expert",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one chat conversation. Maps to the "chat_sessions" table.</span>
<span class="cmt">// The messages themselves live in a separate ChatMessage table.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "chat_sessions")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">ChatSession</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "session_id")</span>
    <span class="kw">private</span> Long sessionId;
    <span class="cmt">// the unique id of this conversation.   Example: 1</span>

    <span class="cmt">// ==================== WHO STARTED IT ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY sessions → ONE farmer. Gowtham can open many chats over time.</span>

    <span class="cmt">// ==================== CATEGORY ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "category", nullable = false, length = 20)</span>
    <span class="kw">private</span> ChatCategory category;
    <span class="cmt">// CROP (crop advisory) or ANIMAL (animal health) — routes to the right expert</span>

    <span class="cmt">// ============ CONTEXT (what this chat is about — optional) ============</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "animal_id")</span>
    <span class="kw">private</span> Animal animal;
    <span class="cmt">// optional — if the chat is about a specific animal (e.g. Lakshmi)</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "health_record_id")</span>
    <span class="kw">private</span> AnimalHealthRecord healthRecord;
    <span class="cmt">// optional — the health check that triggered this chat. lets the expert</span>
    <span class="cmt">// open the conversation already knowing the case. no retyping.</span>

    <span class="cmt">// ==================== STATUS + TITLE ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "status", nullable = false, length = 20)</span>
    <span class="kw">private</span> ChatStatus status = ChatStatus.OPEN;
    <span class="cmt">// OPEN → RESOLVED → CLOSED</span>

    <span class="ann">@Column(name = "title", length = 200)</span>
    <span class="kw">private</span> String title;
    <span class="cmt">// short summary.   Example: "Lakshmi not eating — possible FMD"</span>

    <span class="cmt">// ==================== RATING (after the chat) ====================</span>

    <span class="ann">@Column(name = "farmer_rating")</span>
    <span class="kw">private</span> Integer farmerRating;     <span class="cmt">// 1–5 stars for the expert's help</span>
    <span class="ann">@Column(name = "farmer_feedback", length = 500)</span>
    <span class="kw">private</span> String farmerFeedback;    <span class="cmt">// optional words about the chat</span>

    <span class="cmt">// ==================== TIMESTAMPS ====================</span>

    <span class="ann">@Column(name = "opened_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime openedAt = LocalDateTime.now();
    <span class="ann">@Column(name = "resolved_at")</span>
    <span class="kw">private</span> LocalDateTime resolvedAt;   <span class="cmt">// filled when the chat is marked resolved</span>
}` },
    { file:"entity/chat/ChatMessage.java", sub:"one row = one message inside a chat session",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one message in a conversation. Maps to "chat_messages".</span>
<span class="cmt">// MANY messages → ONE session (same shape as animals → farmer).</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "chat_messages")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">ChatMessage</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "message_id")</span>
    <span class="kw">private</span> Long messageId;
    <span class="cmt">// the unique id of this message.   Example: 1</span>

    <span class="cmt">// ==================== WHICH SESSION ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "session_id", nullable = false)</span>
    <span class="kw">private</span> ChatSession chatSession;
    <span class="cmt">// the conversation this message belongs to</span>

    <span class="cmt">// ==================== WHO SENT IT ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "sender_type", nullable = false, length = 10)</span>
    <span class="kw">private</span> SenderType senderType;
    <span class="cmt">// FARMER or EXPERT — decides which side of the screen the bubble shows on</span>

    <span class="cmt">// ==================== THE MESSAGE ====================</span>

    <span class="ann">@Column(name = "message_content", nullable = false, columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String messageContent;
    <span class="cmt">// the text. TEXT (not VARCHAR) so long messages fit.</span>

    <span class="ann">@Column(name = "is_read", nullable = false)</span>
    <span class="kw">private</span> Boolean isRead = <span class="kw">false</span>;
    <span class="cmt">// false until the other person opens it → drives the unread badge</span>

    <span class="ann">@Column(name = "attachment_url", length = 500)</span>
    <span class="kw">private</span> String attachmentUrl;
    <span class="cmt">// optional photo (a link to cloud storage), e.g. a picture of the sick animal</span>

    <span class="cmt">// ==================== TIMESTAMP ====================</span>

    <span class="ann">@Column(name = "sent_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime sentAt = LocalDateTime.now();
}` },
    { file:"entity/alert/Alert.java", sub:"one row = one notification shown to a farmer",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one notification for a farmer. Maps to the "alerts" table.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "alerts")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Alert</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "alert_id")</span>
    <span class="kw">private</span> Long alertId;
    <span class="cmt">// the unique id of this alert.   Example: 1</span>

    <span class="cmt">// ==================== WHO IT'S FOR ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY alerts → ONE farmer</span>

    <span class="cmt">// ==================== WHAT KIND + HOW SERIOUS ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "alert_type", nullable = false, length = 30)</span>
    <span class="kw">private</span> AlertType alertType;
    <span class="cmt">// DISEASE / IRRIGATION / PRICE / WEATHER / VACCINATION / MILK_DROP</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "severity", nullable = false, length = 10)</span>
    <span class="kw">private</span> AlertSeverity severity;
    <span class="cmt">// LOW / MEDIUM / HIGH → decides the colour and how loud the nudge is</span>

    <span class="cmt">// ==================== WHAT IT SAYS ====================</span>

    <span class="ann">@Column(name = "title", nullable = false, length = 200)</span>
    <span class="kw">private</span> String title;     <span class="cmt">// Example: "Lakshmi's milk dropped 28%"</span>
    <span class="ann">@Column(name = "message", nullable = false, length = 1000)</span>
    <span class="kw">private</span> String message;   <span class="cmt">// the longer explanation</span>

    <span class="cmt">// ==================== THE TAP ACTION ====================</span>

    <span class="ann">@Column(name = "action_label", length = 100)</span>
    <span class="kw">private</span> String actionLabel;     <span class="cmt">// the button text.   Example: "Check symptoms"</span>
    <span class="ann">@Column(name = "action_deep_link", length = 200)</span>
    <span class="kw">private</span> String actionDeepLink;  <span class="cmt">// where tapping it jumps to, e.g. /animal/1/health</span>

    <span class="cmt">// ==================== FLAGS ====================</span>

    <span class="ann">@Column(name = "is_read", nullable = false)</span>
    <span class="kw">private</span> Boolean isRead = <span class="kw">false</span>;        <span class="cmt">// did the farmer open it?</span>
    <span class="ann">@Column(name = "is_push_sent", nullable = false)</span>
    <span class="kw">private</span> Boolean isPushSent = <span class="kw">false</span>;    <span class="cmt">// did we deliver the push? (different question)</span>

    <span class="cmt">// ==================== TIMESTAMPS ====================</span>

    <span class="ann">@Column(name = "created_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime createdAt = LocalDateTime.now();
    <span class="ann">@Column(name = "read_at")</span>
    <span class="kw">private</span> LocalDateTime readAt;     <span class="cmt">// filled when the farmer opens it</span>
}` },
    { file:"entity/alert/DeviceToken.java", sub:"one row = one phone we can send a push notification to",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one phone/tablet the server can push to. Maps to "device_tokens".</span>
<span class="cmt">// A "token" is the address Firebase gives us to reach a specific device.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "device_tokens")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">DeviceToken</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "token_id")</span>
    <span class="kw">private</span> Long tokenId;
    <span class="cmt">// the unique id of this device row.   Example: 1</span>

    <span class="cmt">// ==================== WHICH FARMER ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;
    <span class="cmt">// MANY devices → ONE farmer (he may have a phone AND a tablet)</span>

    <span class="cmt">// ==================== THE TOKEN ====================</span>

    <span class="ann">@Column(name = "fcm_token", nullable = false, unique = true, columnDefinition = "TEXT")</span>
    <span class="kw">private</span> String fcmToken;
    <span class="cmt">// the Firebase address for this device. unique → no two rows share it.</span>
    <span class="cmt">// TEXT because these tokens are long.</span>

    <span class="cmt">// ==================== WHICH DEVICE ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "platform", nullable = false, length = 10)</span>
    <span class="kw">private</span> DevicePlatform platform;   <span class="cmt">// ANDROID or IOS</span>
    <span class="ann">@Column(name = "device_model", length = 100)</span>
    <span class="kw">private</span> String deviceModel;         <span class="cmt">// Example: "Redmi Note 12"</span>

    <span class="cmt">// ==================== STATUS + TIMESTAMPS ====================</span>

    <span class="ann">@Column(name = "is_active", nullable = false)</span>
    <span class="kw">private</span> Boolean isActive = <span class="kw">true</span>;
    <span class="cmt">// false = token stopped working. we switch it off, we don't delete it.</span>

    <span class="ann">@Column(name = "registered_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime registeredAt = LocalDateTime.now();
    <span class="ann">@Column(name = "last_used_at")</span>
    <span class="kw">private</span> LocalDateTime lastUsedAt;    <span class="cmt">// updated each time we send to it</span>
}` },
    { file:"entity/feedback/Feedback.java", sub:"one row = a farmer rating a prediction after harvest",
      code:`<span class="cmt">// ==================== WHAT THIS FILE IS ====================</span>
<span class="cmt">// One row = one piece of feedback from a farmer. Maps to the "feedback" table.</span>
<span class="cmt">// Closes the loop: was the advice actually right? → trains the AI.</span>

<span class="ann">@Entity</span> <span class="ann">@Table(name = "feedback")</span>
<span class="ann">@Data</span> <span class="ann">@NoArgsConstructor</span> <span class="ann">@AllArgsConstructor</span>
<span class="kw">public class</span> <span class="cls">Feedback</span> {

    <span class="cmt">// ==================== PRIMARY KEY ====================</span>

    <span class="ann">@Id</span> <span class="ann">@GeneratedValue(strategy = GenerationType.IDENTITY)</span>
    <span class="ann">@Column(name = "feedback_id")</span>
    <span class="kw">private</span> Long feedbackId;
    <span class="cmt">// the unique id of this feedback.   Example: 1</span>

    <span class="cmt">// ==================== WHO GAVE IT ====================</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "farmer_id", nullable = false)</span>
    <span class="kw">private</span> Farmer farmer;

    <span class="cmt">// ==================== WHAT IT'S ABOUT ====================</span>

    <span class="ann">@Enumerated(EnumType.STRING)</span>
    <span class="ann">@Column(name = "feedback_type", nullable = false, length = 20)</span>
    <span class="kw">private</span> FeedbackType feedbackType;
    <span class="cmt">// PREDICTION (about the advice) / APP</span>
    <span class="cmt">// expert feedback is NOT here — it lives on ChatSession (its star + note)</span>

    <span class="ann">@ManyToOne(fetch = FetchType.LAZY)</span>
    <span class="ann">@JoinColumn(name = "prediction_id")</span>
    <span class="kw">private</span> Prediction prediction;
    <span class="cmt">// optional — which prediction this is about (for PREDICTION feedback)</span>

    <span class="cmt">// ==================== THE RATING + THE TRUTH ====================</span>

    <span class="ann">@Column(name = "rating", nullable = false)</span>
    <span class="kw">private</span> Integer rating;            <span class="cmt">// 1–5 stars</span>

    <span class="ann">@Column(name = "actual_crop_grown", length = 100)</span>
    <span class="kw">private</span> String actualCropGrown;    <span class="cmt">// what he REALLY planted.   Example: "Cotton"</span>
    <span class="ann">@Column(name = "actual_yield_kg")</span>
    <span class="kw">private</span> Double actualYieldKg;       <span class="cmt">// the REAL harvest — to check the estimate</span>

    <span class="ann">@Column(name = "comments", length = 1000)</span>
    <span class="kw">private</span> String comments;            <span class="cmt">// free words</span>

    <span class="cmt">// ==================== TIMESTAMP ====================</span>

    <span class="ann">@Column(name = "submitted_at", nullable = false, updatable = false)</span>
    <span class="kw">private</span> LocalDateTime submittedAt = LocalDateTime.now();
}` }
  ],
  extras:[
    { type:"flow", title:"From a health check to a real expert — nothing retyped",
      steps:[
        { icon:"🩺", label:"Health check", note:"AI says \"see a vet\"" },
        { icon:"👆", label:"Tap Connect", note:"\"Connect with Expert\"" },
        { icon:"💬", label:"Chat opens", note:"pre-filled: animal + illness + notes" },
        { icon:"⭐", label:"Rate the help", note:"1–5 stars when resolved" }
      ]
    },
    { type:"flow", title:"How a push notification reaches Gowtham",
      steps:[
        { icon:"📉", label:"Something happens", note:"milk drops / vaccine due" },
        { icon:"🔔", label:"Alert created", note:"type + severity + tap action" },
        { icon:"📲", label:"Push sent", note:"to his saved device token(s)" },
        { icon:"👀", label:"He taps it", note:"deep link → the right screen" }
      ]
    },
    { type:"qa", title:"Interview questions — Day 5 (tap to reveal the answer)",
      items:[
        { q:"Why split a chat into ChatSession and ChatMessage instead of one table?",
          a:`Because a conversation is one thing made of many messages. The <b>ChatSession</b> holds the shared facts (who, what it's about, status, rating); each <b>ChatMessage</b> is one bubble pointing back to it. It's the same one-parent-many-children shape as a farmer and his animals — clean, and easy to load a whole thread.` },
        { q:"What is a device token and why store it?",
          a:`A push notification can't just \"find\" a phone. The phone registers with Firebase and gets a <b>token</b> — an address. We save that token so the server can send a push to that exact device. One farmer can have several (phone + tablet), so it's many tokens to one farmer.` },
        { q:"Why set is_active = false on a token instead of deleting the row?",
          a:`We keep the history and avoid churn. A simple on/off flag is safer than deleting and re-adding rows, and it lets us see which devices a farmer used over time. Same idea as \"soft delete\".` },
        { q:"What's the difference between is_push_sent and is_read on an Alert?",
          a:`<b>is_push_sent</b> means \"we delivered the notification\". <b>is_read</b> means \"the farmer actually opened it\". They answer different questions and fail in different ways — a push can send but never be seen — so we track both.` },
        { q:"Why does Feedback store the actual crop and yield, not just a star rating?",
          a:`A star rating alone teaches the AI almost nothing. Recording <b>what actually grew</b> and the <b>real yield</b> lets us compare the prediction against reality and improve the models. The feedback links back to the exact prediction it's judging.` },
        { q:"Why can ChatSession link to an Animal and a HealthRecord, but those links are optional?",
          a:`A crop-advisory chat has no animal, so those links are left blank. When the chat <b>is</b> about a sick animal, filling them lets the expert see the case instantly. Optional links keep one table flexible for both kinds of chat.` }
      ]
    },
    { type:"versus", title:"A conversation: one table or two?",
      bad:{ label:"Everything in one row", code:`<span class="kw">class</span> <span class="cls">Chat</span> {
    Farmer farmer;
    String allMessages;  <span class="cmt">// one big blob?</span>
}
<span class="cmt">// how do you mark ONE message read?</span>
<span class="cmt">// how do you show sender sides?</span>
<span class="cmt">// how do you add a photo to one?</span>
<span class="cmt">// a blob can't do any of it.</span>` },
      good:{ label:"Session + messages", code:`<span class="kw">class</span> <span class="cls">ChatSession</span> { ... }   <span class="cmt">// the thread</span>
<span class="kw">class</span> <span class="cls">ChatMessage</span> {
    ChatSession session;     <span class="cmt">// belongs to one</span>
    SenderType  senderType;
    String      content;
    Boolean     isRead;
}
<span class="cmt">// each message is its own row →</span>
<span class="cmt">// read flags, sides, photos all work.</span>` },
      note:`<b>One-line answer:</b> when a thing is made of many smaller things you act on individually (mark read, attach a photo), each one needs its own row. One parent (session), many children (messages).` },
    { type:"diagram", title:"The last three modules — how they connect",
      html:`<pre style="color:var(--ink2)"><span style="color:#E8E6E0;font-weight:600">Gowtham</span> (farmer_id=1)
    │
    ├── <span style="color:var(--g)">ChatSession</span> (about Lakshmi's health check)
    │       ├── animal → Lakshmi,  health_record → check #1
    │       └── <span style="color:var(--g)">ChatMessage</span> × many  (FARMER ↔ EXPERT bubbles)
    │
    ├── <span style="color:var(--g)">Alert</span> "Lakshmi's milk dropped 28%"
    │       └── tap → deep link → her health screen
    │
    ├── <span style="color:var(--g)">DeviceToken</span> (Redmi Note 12, Android, active)
    │       └── the push for that alert is sent here
    │
    └── <span style="color:var(--g)">Feedback</span> on a Prediction
            └── actual crop: Cotton · actual yield: 11.5 quintals → trains the AI</pre>` },
    { type:"table", title:"The 7 new enums on this page",
      html:`<table class="ann-table">
        <thead><tr><th>Enum</th><th>Values</th><th>What it's for</th></tr></thead>
        <tbody>
          <tr><td>ChatCategory</td><td>CROP, ANIMAL</td><td>routes the chat to the right expert</td></tr>
          <tr><td>ChatStatus</td><td>OPEN, RESOLVED, CLOSED</td><td>where the conversation stands</td></tr>
          <tr><td>SenderType</td><td>FARMER, EXPERT</td><td>which side a message bubble shows on</td></tr>
          <tr><td>AlertType</td><td>DISEASE, IRRIGATION, PRICE, WEATHER, VACCINATION, MILK_DROP</td><td>what the notification is about</td></tr>
          <tr><td>AlertSeverity</td><td>LOW, MEDIUM, HIGH</td><td>colour + how loud the nudge is</td></tr>
          <tr><td>DevicePlatform</td><td>ANDROID, IOS</td><td>which kind of phone</td></tr>
          <tr><td>FeedbackType</td><td>PREDICTION, APP</td><td>what the feedback is about (expert rating lives on ChatSession)</td></tr>
        </tbody>
      </table>` }
  ],
  next:[
    `<span>The database layer is done</span> — 20 entities, 17 enums, 22 tables. Every screen now has a table behind it.`,
    `<span>JWT authentication</span> — register + login, BCrypt passwords, and a token on each request. The first endpoints that really work end to end.`,
    `<span>Then the AI pipeline</span> — wire the soil-test submit to the Python models and show real advice on screen.`
  ],
  snapshot:{ entities:20, enums:17, tables:22, endpoints:0 }
});
