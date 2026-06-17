/* ============================================================================
   DAY 6 — JWT auth foundation · secrets moved to .env
   ============================================================================ */
JOURNAL.push({
  day:6,
  date:"2026-06-18",
  title:"JwtUtil · secrets in .env · the first piece of login security",
  phase:1, status:"today",
  tags:["Security","JWT","Auth","Secrets",".env","Config"],
  summary:"The database is done — now we start the lock on the door. We moved every secret (DB password, signing key) out of the code into a .env file, added the JWT library, and built JwtUtil: the helper that creates and checks login tokens.",
  story:`<p>Until today, the backend had no security — anyone who knew the address could call it. <b>JWT</b> (a signed login token) is how we fix that. When Gowtham logs in, the server hands him a <span class="hl">token</span>: a small signed pass that says "this really is Gowtham." He sends it on every request, and the server checks the signature. Tamper with it and the signature breaks, so the request is rejected.</p>
  <p>First, though, we cleaned up our secrets. The DB password and the token signing key were sitting in plain code. We moved them into a <span class="hl">.env</span> file that is <b>never committed</b> (it's git-ignored), and shared a safe <code>.env.example</code> template with placeholders. The code now reads them from the environment, not from the source.</p>
  <p>Then we built <span class="hl">JwtUtil</span> — the small toolbox that makes a token at login and verifies it on every later request.</p>`,
  built:[
    `<span>Secrets moved to .env</span> — DB url/username/password, the JWT signing key, token lifetimes and the port now live in <code>.env</code>. The real file is git-ignored; <code>.env.example</code> (placeholders only) is committed as the template.`,
    `<span>application.properties reads env vars</span> — every value is now a <code>\${...}</code> placeholder (e.g. <code>spring.datasource.password=\${DB_PASSWORD}</code>), so no secret is ever hard-coded.`,
    `<span>JWT library added</span> — jjwt 0.11.5 (api + impl + jackson) in pom.xml.`,
    `<span>JwtUtil</span> — creates a signed <b>access token</b> (15 min) carrying the farmer's phone number, makes a <b>refresh token</b> (a 90-day random id), and validates a token (right owner + not expired + untampered).`,
    `<span>.gitignore fixed</span> — corrected the rule so the real <code>.env</code> is actually ignored (the old path didn't match).`
  ],
  understood:[
    `<span>What a JWT actually is</span> — a small string in three parts: who you are (claims), when it expires, and a <b>signature</b> made with our secret key. The server doesn't need to remember it — it just re-checks the signature. If even one character is changed, the signature no longer matches and the token is thrown out.`,
    `<span>Access token vs refresh token</span> — the <b>access token</b> is short-lived (15 minutes) so a stolen one is useless quickly. The <b>refresh token</b> lives long (90 days) and is only used to quietly get a new access token, so the farmer isn't logged out every 15 minutes.`,
    `<span>Secrets never live in code</span> — anything that unlocks something (DB password, signing key) goes in <code>.env</code>, which git ignores. The code reads it from the environment. We commit only <code>.env.example</code> so a teammate knows which keys to set, without ever seeing the real values.`,
    `<span>The signing key is the whole game</span> — the token is signed with our secret. Anyone who has the secret can mint valid tokens, so it must never be exposed. That's exactly why it moved out of the code and into the ignored <code>.env</code>.`,
    `<span>The subject is the phone number</span> — we store the farmer's phone number as the token's "subject". On each request we read it back out and load that farmer — that's how the server knows who is calling without a password every time.`
  ],
  code:[
    { file:"resources/.env.example  +  application.properties", sub:"secrets out of code, into the environment",
      code:`<span class="cmt">// ===== .env.example (committed) — the TEMPLATE, placeholders only =====</span>
DB_URL=jdbc:mysql://localhost:3306/flora_db
DB_USERNAME=<span class="str">your_mysql_username</span>
DB_PASSWORD=<span class="str">your_mysql_password</span>
JWT_SECRET=<span class="str">your_64_char_hex_secret_here</span>
JWT_EXPIRATION=900000              <span class="cmt"># 15 minutes (in ms)</span>
JWT_REFRESH_EXPIRATION=7776000000  <span class="cmt"># 90 days (in ms)</span>
SERVER_PORT=8084

<span class="cmt">// the REAL .env (same keys, real values) is git-ignored — never committed</span>

<span class="cmt">// ===== application.properties — reads the env vars, hard-codes nothing =====</span>
spring.config.import=optional:classpath:.env
spring.datasource.url=<span class="kw">\${DB_URL}</span>
spring.datasource.username=<span class="kw">\${DB_USERNAME}</span>
spring.datasource.password=<span class="kw">\${DB_PASSWORD}</span>
jwt.secret=<span class="kw">\${JWT_SECRET}</span>
jwt.expiration=<span class="kw">\${JWT_EXPIRATION}</span>
jwt.refresh-expiration=<span class="kw">\${JWT_REFRESH_EXPIRATION}</span>` },
    { file:"config/JwtUtil.java", sub:"makes a login token, and checks it on every request",
      code:`<span class="ann">@Component</span>
<span class="cmt">// @Component → Spring creates one shared JwtUtil and injects it where needed</span>
<span class="kw">public class</span> <span class="cls">JwtUtil</span> {

    <span class="ann">@Value("\${jwt.secret}")</span>
    <span class="kw">private</span> String secretKey;        <span class="cmt">// read from .env → JWT_SECRET. never hard-coded.</span>
    <span class="ann">@Value("\${jwt.expiration}")</span>
    <span class="kw">private</span> <span class="kw">long</span> jwtExpiration;       <span class="cmt">// 900000 ms = 15 minutes</span>
    <span class="ann">@Value("\${jwt.refresh-expiration}")</span>
    <span class="kw">private</span> <span class="kw">long</span> refreshExpiration;   <span class="cmt">// 7776000000 ms = 90 days</span>

    <span class="cmt">// ============ MAKE AN ACCESS TOKEN (given at login) ============</span>
    <span class="kw">public</span> String <span class="prop">generateAccessToken</span>(UserDetails userDetails) {
        <span class="kw">return</span> generateAccessToken(<span class="kw">new</span> HashMap&lt;&gt;(), userDetails);
    }
    <span class="kw">public</span> String <span class="prop">generateAccessToken</span>(Map&lt;String,Object&gt; extraClaims, UserDetails userDetails) {
        <span class="kw">return</span> Jwts.builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.getUsername())       <span class="cmt">// subject = farmer's phone number</span>
            .setIssuedAt(<span class="kw">new</span> Date(System.currentTimeMillis()))
            .setExpiration(<span class="kw">new</span> Date(System.currentTimeMillis() + jwtExpiration))  <span class="cmt">// +15 min</span>
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)   <span class="cmt">// sign with our secret</span>
            .compact();                                  <span class="cmt">// → the finished token string</span>
    }

    <span class="cmt">// ============ MAKE A REFRESH TOKEN (long-lived) ============</span>
    <span class="kw">public</span> String <span class="prop">generateRefreshToken</span>() {
        <span class="kw">return</span> UUID.randomUUID().toString();   <span class="cmt">// just a random id, stored server-side later</span>
    }

    <span class="cmt">// ============ CHECK A TOKEN ON EACH REQUEST ============</span>
    <span class="kw">public</span> <span class="kw">boolean</span> <span class="prop">isAccessTokenValid</span>(String token, UserDetails userDetails) {
        <span class="kw">final</span> String phoneNumber = extractPhoneNumber(token);
        <span class="kw">return</span> phoneNumber.equals(userDetails.getUsername())   <span class="cmt">// right owner?</span>
            && !isTokenExpired(token);                         <span class="cmt">// still in date?</span>
    }
    <span class="kw">private</span> <span class="kw">boolean</span> <span class="prop">isTokenExpired</span>(String token) {
        <span class="kw">return</span> extractExpiration(token).before(<span class="kw">new</span> Date());
    }

    <span class="cmt">// ============ READ DATA OUT OF A TOKEN ============</span>
    <span class="kw">public</span> String <span class="prop">extractPhoneNumber</span>(String token) {
        <span class="kw">return</span> extractClaim(token, Claims::getSubject);   <span class="cmt">// the phone we stored as subject</span>
    }
    <span class="kw">private</span> Claims <span class="prop">extractAllClaims</span>(String token) {
        <span class="kw">return</span> Jwts.parserBuilder()
            .setSigningKey(getSigningKey())   <span class="cmt">// verify the signature with our secret</span>
            .build()
            .parseClaimsJws(token)            <span class="cmt">// tampered token → throws → request rejected</span>
            .getBody();
    }

    <span class="cmt">// ============ TURN THE SECRET STRING INTO A KEY ============</span>
    <span class="kw">private</span> Key <span class="prop">getSigningKey</span>() {
        <span class="kw">byte</span>[] keyBytes = Decoders.BASE64.decode(secretKey);
        <span class="kw">return</span> Keys.hmacShaKeyFor(keyBytes);
    }
}` }
  ],
  extras:[
    { type:"flow", title:"How login works with a JWT",
      steps:[
        { icon:"🔑", label:"Farmer logs in", note:"phone + password (checked once)" },
        { icon:"🪙", label:"Server signs a token", note:"15-min access + 90-day refresh" },
        { icon:"📲", label:"App stores it", note:"sends it on every request" },
        { icon:"🛡️", label:"Server verifies", note:"signature + not expired → allowed" }
      ]
    },
    { type:"flow", title:"Why secrets live in .env",
      steps:[
        { icon:"🙈", label:"Secret in code", note:"anyone reading the repo sees it" },
        { icon:"📄", label:"Move to .env", note:"DB password, signing key" },
        { icon:"🚫", label:"git-ignore it", note:"the real .env never leaves your machine" },
        { icon:"✅", label:"Commit .env.example", note:"placeholders, so teammates know the keys" }
      ]
    },
    { type:"qa", title:"Interview questions — Day 6 (tap to reveal the answer)",
      items:[
        { q:"What is a JWT and why is it good for a stateless API?",
          a:`A <b>JWT</b> is a signed token with three parts: claims (who you are), an expiry, and a signature made with the server's secret. Because the signature proves it's genuine, the server <b>doesn't have to store sessions</b> — it just re-checks the signature on each request. That keeps the API stateless and easy to scale.` },
        { q:"Why two tokens — access and refresh?",
          a:`The <b>access token</b> is short-lived (15 min) so a stolen one expires fast. The <b>refresh token</b> is long-lived (90 days) and used only to get a new access token, so the farmer stays logged in without re-typing the password — balancing security and convenience.` },
        { q:"Why move the JWT secret and DB password into a .env file?",
          a:`Secrets in source code get committed and exposed to anyone who can read the repo. Putting them in a git-ignored <code>.env</code> keeps them off GitHub. We commit only <code>.env.example</code> (placeholders) so teammates know which keys to set, without ever seeing the real values.` },
        { q:"What stops someone from forging or editing a token?",
          a:`The signature. The token is signed with our secret key; on every request the server recomputes the signature. Change one character of the token and the signatures won't match, so <code>parseClaimsJws</code> throws and the request is rejected. Forging one requires the secret — which is why the secret must never leak.` },
        { q:"Why is the farmer's phone number the token's 'subject'?",
          a:`The subject is the stable identity we put inside the token. On each request the server reads the phone number back out and loads that farmer from the database — so it knows who is calling without asking for the password again.` }
      ]
    },
    { type:"glossary", title:"New words on this page, in plain English",
      items:[
        { term:"JWT (JSON Web Token)", def:"A small signed pass that proves who you are. The server gives it at login and checks it on every later request — no password needed each time.",
          eg:"Like a wristband at an event: the stamp (signature) proves it's real, so security waves you through." },
        { term:"Signing key / secret", def:"The private key the server uses to sign and verify tokens. Anyone with it can mint valid tokens, so it must stay secret — hence the <code>.env</code>.",
          eg:"<em>JWT_SECRET</em> is a long hex string kept only in <code>.env</code>, never in the code." },
        { term:".env file", def:"A plain file of <code>KEY=VALUE</code> secrets that lives only on your machine/server and is <b>git-ignored</b>. The app reads its values at startup.",
          eg:"<em>DB_PASSWORD</em>, <em>JWT_SECRET</em> live here; the code says <code>${DB_PASSWORD}</code> instead of the real value." },
        { term:".env.example", def:"A safe copy of <code>.env</code> with the same keys but <b>fake placeholder values</b>. It IS committed, so teammates know what to fill in.",
          eg:"<em>DB_PASSWORD=your_mysql_password</em> — a hint, not a real secret." },
        { term:"@Value(\"${...}\")", def:"A Spring annotation that <b>injects a config value</b> into a field at startup, pulled from properties/the environment.",
          eg:"<em>@Value(\"${jwt.secret}\")</em> fills <code>secretKey</code> from <code>JWT_SECRET</code> in <code>.env</code>." },
        { term:"@Component", def:"Tells Spring to <b>create and manage one shared instance</b> of this class, ready to be injected wherever it's needed.",
          eg:"One <em>JwtUtil</em> is created and reused by the login and the request-checking code." }
      ]
    }
  ],
  next:[
    `<span>Finish the auth chain</span> — a Spring Security filter that reads the token on each request, a UserDetailsService that loads the farmer by phone, and a register/login controller.`,
    `<span>Then the first real endpoints</span> — POST /api/auth/register and /api/auth/login returning a token.`
  ],
  snapshot:{ entities:20, enums:17, tables:22, endpoints:0 }
});
