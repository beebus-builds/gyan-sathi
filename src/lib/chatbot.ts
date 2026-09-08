import { allSubjects, programs } from "@/data/programs";
import { pastQuestions } from "@/data/pastQuestions";
import { mcqs, entranceMcqs, type MCQ } from "@/data/mcqs";
import { flashDecks, findDeck } from "@/data/flashcards";

/**
 * Sathi — GyanSathi's offline exam-prep engine (no external AI API).
 * Pipeline: normalize → greet/help → program & semester lookup → exam
 * commands (quiz-me, viva, important-Qs, past papers, study plans,
 * formula sheets) → scored topic explainers → subject lookup → fallback.
 * Typo-tolerant via token overlap + Levenshtein fuzzy match, with
 * follow-up context ("more", "example", "viva", "quiz me").
 */

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

/* ---------------- text utils ---------------- */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokens = (s: string) => norm(s).split(" ").filter(Boolean);

/** Romanized Nepali study words students actually type → English intent words. */
const MIX_MAP: Record<string, string> = {
  tayari: "plan", taiyari: "plan", tayaari: "plan",
  mahatvapurna: "important", mahatwapurna: "important", important: "important",
  sujhab: "tips", sujhav: "tips", sujhau: "tips",
  pariksha: "exam", parikshya: "exam",
  padhne: "study", padhnu: "study",
};
const mixToEnglish = (s: string) =>
  s.split(/\s+/).map((w) => MIX_MAP[w.toLowerCase()] ?? w).join(" ");

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

const similar = (a: string, b: string) => {
  const m = Math.max(a.length, b.length);
  return m === 0 ? 1 : 1 - levenshtein(a, b) / m;
};

/** true if `word` appears in q exactly, or as a close typo of some token */
function fuzzyHas(q: string, word: string): boolean {
  const w = norm(word);
  if (!w) return false;
  if (q.includes(w)) return true;
  return tokens(q).some((t) => t.length >= 4 && w.length >= 4 && similar(t, w) >= 0.82);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------- follow-up context (per-session, in-memory) ---------------- */

let lastTopic: string | null = null;
let lastSubjectCode: string | null = null;

export function resetChatContext() {
  lastTopic = null;
  lastSubjectCode = null;
}

/* ---------------- subject resolution ---------------- */

const SUBJECT_ALIASES: Record<string, string[]> = {
  dbms: ["database", "rdbms", "sql", "normalization", "normalize"],
  os: ["operating system", "scheduling", "deadlock", "paging"],
  networks: ["networking", "computer network", "tcp", "ip", "subnetting", "osi"],
  dsa: ["data structure", "algorithm", "sorting", "bst", "stack", "queue"],
  oop: ["object oriented", "polymorphism", "inheritance", "java", "c++"],
  c: ["c programming", "pointer", "malloc"],
  discrete: ["discrete structure", "graph theory", "combinatorics", "logic"],
  microprocessor: ["8085", "8086", "assembly"],
  se: ["software engineering", "agile", "scrum", "sdlc"],
  crypto: ["cryptography", "rsa", "aes", "encryption"],
  ai: ["artificial intelligence", "machine learning", "search"],
  compiler: ["compiler design", "parsing", "lexical"],
  web: ["web technology", "html", "javascript", "php", "http"],
  stats: ["statistics", "probability"],
  digital: ["digital logic", "boolean", "gates", "number system"],
};

interface SubjectHit {
  program: string;
  semester: number;
  code: string;
  title: string;
  description: string;
  units: string[];
}

/** short forms students actually type: os, dbms, dsa… (exact-token match) */
const SHORTS: Record<string, string[]> = {
  os: ["operating"],
  dbms: ["database"], db: ["database"], sql: ["database"],
  dsa: ["data"], ds: ["data"],
  oop: ["object", "oriented"], java: ["java"], "c++": ["c++"],
  c: ["c programming"],
  network: ["network"], networks: ["network"], cn: ["network"],
  se: ["software"], crypto: ["crypto"], ai: ["intelligence"],
  stats: ["statistic"], statistics: ["statistic"],
  discrete: ["discrete"], microprocessor: ["microprocessor"],
  compiler: ["compiler"], web: ["web"], digital: ["digital"],
};

function resolveSubject(q: string): SubjectHit | null {
  const flat = norm(q).replace(/\s+/g, "");
  const qt = tokens(q);
  let best: (SubjectHit & { score: number }) | null = null;
  for (const r of allSubjects()) {
    let score = 0;
    const code = norm(r.subject.code).replace(/\s+/g, "");
    if (code && flat.includes(code)) score += 12;
    // short-form exact tokens (os → Operating Systems, dbms → DBMS subjects…)
    const hay = norm(r.subject.title + " " + r.subject.code + " " + r.subject.description);
    for (const [short, stems] of Object.entries(SHORTS)) {
      if (qt.includes(short) && stems.some((s) => hay.includes(s))) score += 8;
    }
    // alias hits
    for (const [canon, aliases] of Object.entries(SUBJECT_ALIASES)) {
      void canon;
      for (const a of aliases) if (fuzzyHas(q, a)) {
        const hay = norm(r.subject.title + " " + r.subject.code + " " + r.subject.description);
        if (hay.includes(norm(a).split(" ")[0]) || fuzzyHas(hay, a)) score += 4;
      }
    }
    // title word overlap
    for (const w of tokens(r.subject.title)) {
      if (w.length > 3 && fuzzyHas(q, w)) score += 2;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = {
        program: r.program, semester: r.semester, code: r.subject.code,
        title: r.subject.title, description: r.subject.description, units: r.subject.units, score,
      };
    }
  }
  return best && best.score >= 4 ? best : null;
}

/* ---------------- topic library (exam-focused) ---------------- */

interface Topic {
  id: string;
  label: string;
  keys: string[];
  body: string;
}

export type { Topic as SathiTopic };
export { TOPICS as SATHI_TOPICS };

const TOPICS: Topic[] = [
  {
    id: "normalization", label: "Normalization (DBMS)",
    keys: ["normalization", "normalize", "normal form", "1nf", "2nf", "3nf", "bcnf", "functional dependency", "transitive"],
    body: "**Normalization (DBMS) — 2-min revision**\n\n• 1NF: atomic values, no repeating groups.\n• 2NF: 1NF + no partial dependency (non-key depends on FULL key).\n• 3NF: 2NF + no transitive dependency (non-key → non-key).\n• BCNF: every determinant is a candidate key (stricter 3NF).\n\nTU favourite: *'R(A,B,C), A→B, B→C — which NF?'* → 2NF only (transitive A→C via B). Decompose to R1(A,B), R2(B,C) for 3NF.\n\nViva favourites: partial vs transitive dependency with one example each; why BCNF is stricter than 3NF.\n\nNext: say `quiz me on DBMS` to drill, or `important questions DBMS` for board sets.",
  },
  {
    id: "sql-joins", label: "SQL Joins",
    keys: ["join", "inner join", "outer join", "left join", "right join", "self join", "sql queries", "group by"],
    body: "**SQL Joins — exam pack**\n\n• INNER: only matching rows. LEFT: all left + matches (NULLs where none). RIGHT: mirror. FULL: both sides.\n• `GROUP BY` + `HAVING` filters groups; `WHERE` filters rows before grouping.\n• 2nd-highest salary pattern TU loves:\n`SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);`\n• Per-dept variant: `... WHERE salary < (correlated max) GROUP BY dept`.\n\nViva favourites: WHERE vs HAVING; DELETE vs TRUNCATE vs DROP; what makes a query correlated.\n\nNext: `quiz me on DBMS` or `important questions DBMS`.",
  },
  {
    id: "acid", label: "ACID & Transactions",
    keys: ["acid", "transaction", "atomicity", "consistency", "isolation", "durability", "concurrency", "serializability", "lock", "deadlock db"],
    body: "**ACID & Transactions — 5-mark answer frame**\n\n• Atomicity: all-or-nothing (bank transfer either completes or rolls back).\n• Consistency: DB moves valid → valid.\n• Isolation: concurrent txns don't see half-done work (locks / serializability).\n• Durability: committed = survives crashes (write-ahead log + recovery).\n\nWrite it as: definition → one-line example each → concurrent-transfer story → recovery line. That structure earns step marks.\n\nViva favourites: dirty read vs lost update; two-phase locking in one line.\n\nNext: `quiz me on DBMS`.",
  },
  {
    id: "er-model", label: "ER Model",
    keys: ["er diagram", "er model", "entity relationship", "cardinality", "weak entity", "relational schema"],
    body: "**ER Model — how TU wants it drawn**\n\n• Rectangles = entities, diamonds = relationships, ovals = attributes (double oval = multivalued, dashed = derived).\n• Weak entity (double rectangle) needs owner's key: e.g. Enrollment needs Student + Course.\n• Cardinality 1:1 / 1:N / M:N — then convert: 1:N puts FK on N-side; M:N becomes its own table.\n\nAnswer frame: diagram → 3-line conversion rule → one schema example. Label everything — TU gives marks for labels alone.\n\nNext: `important questions DBMS` for the ER board set.",
  },
  {
    id: "scheduling", label: "CPU Scheduling (OS)",
    keys: ["scheduling", "fcfs", "sjf", "round robin", "priority scheduling", "gantt", "waiting time", "turnaround", "convoy"],
    body: "**CPU Scheduling — numericals decoded**\n\n• FCFS: simple, suffers convoy effect (one long job blocks all).\n• SJF: optimal avg waiting time, but starves long jobs.\n• Round Robin: each job gets a time quantum; large quantum ≈ FCFS, tiny quantum ≈ many context switches.\n• Priority + aging: aging fixes starvation.\n\nMethod for Gantt numericals: 1) order by rule, 2) draw timeline, 3) waiting = start − arrival, 4) avg = sum/n. Show every step — step marks live here.\n\nViva favourites: starvation vs convoy; why SJF is optimal; quantum trade-off.\n\nNext: `quiz me on OS` or `viva OS`.",
  },
  {
    id: "deadlock", label: "Deadlocks (OS)",
    keys: ["deadlock", "mutual exclusion", "hold and wait", "no preemption", "circular wait", "banker"],
    body: "**Deadlocks — the 4 conditions (memorize as MHNC)**\n\n1. Mutual exclusion 2. Hold & wait 3. No preemption 4. Circular wait.\n• Prevention = break ANY one (e.g. force all-or-nothing allocation kills hold&wait).\n• Avoidance = Banker's algorithm (safe-state check before granting).\n• Detection + recovery = wait-for graph, kill/rollback.\n\nTU frame: list 4 → one-line example (two printers, two processes) → prevention vs avoidance table.\n\nViva favourites: difference between prevention and avoidance; what is a safe state.\n\nNext: `quiz me on OS`.",
  },
  {
    id: "paging", label: "Paging & Virtual Memory",
    keys: ["paging", "segmentation", "virtual memory", "page fault", "thrashing", "tlb", "demand paging", "fragmentation"],
    body: "**Paging & Virtual Memory — quick map**\n\n• Paging: fixed-size pages/frames, page table translates; suffers internal fragmentation (last page half-empty).\n• Segmentation: variable logical units; suffers external fragmentation (holes).\n• TLB caches translations; page fault rate decides performance.\n• Thrashing = excessive page faults from too-small working set → fix with working-set model / more frames.\n\nViva favourites: internal vs external fragmentation; paging vs segmentation in 3 points.\n\nNext: `quiz me on OS`.",
  },
  {
    id: "osi", label: "OSI vs TCP/IP",
    keys: ["osi", "tcp/ip", "tcp ip", "layers", "udp", "three way handshake", "protocol stack"],
    body: "**OSI 7 vs TCP/IP 4 — say it in order**\n\nOSI: Physical → DataLink → Network → Transport → Session → Presentation → Application (mnemonic: *Please Do Not Throw Sausage Pizza Away*).\nTCP/IP: Link → Internet → Transport → Application.\n• TCP = reliable (3-way handshake, ACKs, retransmission) — web, email, files.\n• UDP = fast, no guarantee — video calls, DNS, gaming.\n\nTU frame: both stacks → device/protocol per layer (router@Network, TCP/UDP@Transport) → TCP vs UDP table.\n\nViva favourites: why UDP for video; what the handshake achieves.\n\nNext: `quiz me on Networks` or `subnetting formulas`.",
  },
  {
    id: "subnetting", label: "Subnetting",
    keys: ["subnet", "subnetting", "/24", "cidr", "ip address", "mask", "hosts", "block size", "network address", "broadcast"],
    body: "**Subnetting quick method (TU numericals)**\n\nUsable hosts = 2^(32−prefix) − 2 (minus network + broadcast).\n• /24 → 254 hosts, mask 255.255.255.0 • /26 → 62 hosts • /30 → 2 hosts (point-to-point links).\n\nSteps: 1) block size = 256 − interesting mask octet, 2) list network addresses, 3) first host = network+1, last = broadcast−1.\n\nViva favourites: why subtract 2; /30 use case.\n\nNext: `subnetting formulas` for the cheat sheet, or `quiz me on Networks`.",
  },
  {
    id: "routing", label: "Routing",
    keys: ["routing", "router", "distance vector", "link state", "rip", "ospf", "dijkstra"],
    body: "**Routing — DV vs LS in one table**\n\n• Distance Vector (RIP): neighbours swap vectors, count-to-infinity problem, slow convergence.\n• Link State (OSPF): full map via flooding + Dijkstra, fast convergence, heavier.\n• Dijkstra: repeatedly pick the nearest unsettled node and relax edges — show the table iteration-wise for step marks.\n\nViva favourites: count-to-infinity fix (split horizon); why OSPF scales better.\n\nNext: `quiz me on Networks`.",
  },
  {
    id: "dns-http", label: "DNS, HTTP & Web Protocols",
    keys: ["dns", "http", "https", "ftp", "dhcp", "cookies", "session", "get vs post", "status codes", "tls", "ssl"],
    body: "**DNS + HTTP — short notes that score**\n\n• DNS: hierarchical resolution (root → TLD → authoritative), cached at every level; record types A/AAAA/CNAME/MX.\n• HTTP: stateless; GET (idempotent, retrieve) vs POST (submit, side effects); cookies/sessions add state.\n• Status families: 2xx success, 3xx redirect, 4xx client error (404!), 5xx server error.\n\nViva favourites: GET vs POST idempotency; how DNS caching speeds repeat visits.\n\nNext: `quiz me on Web` or `quiz me on Networks`.",
  },
  {
    id: "pointers", label: "C Pointers",
    keys: ["pointer", "malloc", "calloc", "free", "dangling", "dereference", "double pointer", "pointer arithmetic"],
    body: "**C Pointers — viva + code pack**\n\n• `int *p` stores an address; `*p` dereferences it.\n• `malloc(n*sizeof(int))` allocates heap — always NULL-check and `free()` it.\n• Dangling pointer = points to freed memory → set `p = NULL` after free.\n• `a[i] == *(a+i)` — array-pointer equivalence (asked almost every year).\n• `a++ + ++a` = undefined behaviour (sequence points) — never write it, just explain it.\n\nViva favourites: malloc vs calloc; stack vs heap; why `free` doesn't null the pointer.\n\nNext: `quiz me on C` or `viva C`.",
  },
  {
    id: "recursion", label: "Recursion (C)",
    keys: ["recursion", "recursive", "base case", "factorial", "fibonacci", "palindrome recursion", "tower of hanoi"],
    body: "**Recursion — answer frame TU rewards**\n\n• Two parts: base case (stops) + recursive step (shrinks problem).\n• Palindrome: compare s[l] vs s[r], recurse inward.\n• Trace Fibonacci(4) call-by-call once — examiners love a correct trace with stack depth noted.\n• Cost: elegant but O(2^n) time for naive Fibonacci; iteration wins on stack safety.\n\nViva favourites: base case necessity; recursion vs iteration trade-off.\n\nNext: `important questions C` or `quiz me on C`.",
  },
  {
    id: "files-c", label: "File Handling in C",
    keys: ["file handling", "fopen", "fread", "fwrite", "fprintf", "fscanf", "file modes", "rb", "structures file"],
    body: "**File Handling in C — lab + 10-mark pattern**\n\n• Modes: `r/w/a` (+`b` binary, +`+` update). Always NULL-check `fopen`.\n• Text: `fprintf/fscanf`; binary records: `fwrite(&s, sizeof(s), 1, fp)` / `fread`.\n• Student-record system flow: struct → menu loop → add (append) / display (read loop) / search (strcmp scan) → `fclose`.\n\nWrite logic comments + sample I/O in the answer — TU awards presentation marks.\n\nNext: `important questions C`.",
  },
  {
    id: "oop-pillars", label: "OOP 4 Pillars",
    keys: ["oop", "object oriented", "encapsulation", "abstraction", "polymorphism", "inheritance", "pillars"],
    body: "**OOP 4 pillars (one-line examples each)**\n\n1. Encapsulation — bundle data+methods (`private balance` + `deposit()`).\n2. Abstraction — hide complexity (`interface Drawable { draw(); }`).\n3. Inheritance — reuse (`class Dog extends Animal`).\n4. Polymorphism — same call, different behaviour (overloading = compile-time, overriding = runtime/virtual).\n\nTU favourite: *abstract class vs interface* — single vs multiple inheritance, constructors, when to use which.\n\nViva favourites: real-life example of each pillar; virtual function need.\n\nNext: `viva OOP` or `quiz me on OOP`.",
  },
  {
    id: "poly", label: "Overloading vs Overriding",
    keys: ["overloading", "overriding", "override", "virtual function", "dynamic binding", "static binding", "function hiding"],
    body: "**Overloading vs Overriding — the classic 5-marker**\n\n• Overloading: same name, different signature, same scope, compile-time (static binding). Includes operator overloading in C++.\n• Overriding: same signature, base→derived, runtime via `virtual` (dynamic binding).\n• Complex-class answer shape: overloaded constructors + overloaded `+` operator + virtual `display()` in a hierarchy.\n\nViva favourites: binding time of each; what happens without `virtual`.\n\nNext: `important questions OOP`.",
  },
  {
    id: "exceptions", label: "Exception Handling (Java/C++)",
    keys: ["exception", "try catch", "throw", "throws", "finally", "custom exception", "checked unchecked"],
    body: "**Exception Handling — Java frame**\n\n• `try → catch (specific first!) → finally` (finally always runs — cleanup).\n• `throw` raises; `throws` declares. Checked (compile-time, e.g. IOException) vs unchecked (RuntimeException).\n• Bank-withdrawal example: `throw new InsufficientBalanceException(...)` beats returning error codes — enforced handling + clean flow.\n\nViva favourites: finally vs finalize; order of catch blocks.\n\nNext: `quiz me on Java`.",
  },
  {
    id: "complexity", label: "Big-O & Complexity",
    keys: ["big o", "complexity", "time complexity", "space complexity", "theta", "omega", "recurrence", "master theorem", "asymptotic"],
    body: "**Big-O survival sheet**\n\n• O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).\n• Binary search: halves each step → O(log n). Linear: O(n).\n• Recurrence T(n)=T(n/2)+O(1) → O(log n); T(n)=2T(n/2)+O(n) → O(n log n) (Master theorem).\n• State best/avg/worst explicitly (e.g. QuickSort avg O(n log n), worst O(n²)).\n\nViva favourites: why constants drop; log base irrelevance.\n\nNext: `complexity formulas` or `quiz me on DSA`.",
  },
  {
    id: "stackqueue", label: "Stack & Queue",
    keys: ["stack", "queue", "lifo", "fifo", "push pop", "circular queue", "deque", "infix postfix", "overflow underflow"],
    body: "**Stack vs Queue — implementation answers**\n\n• Stack = LIFO (push/pop/top); Queue = FIFO (enqueue/dequeue).\n• Array version: track `top` with overflow (`top==MAX-1`) / underflow (`top==-1`) checks — write the checks, they carry marks.\n• Uses: stacks → undo, call stack, postfix eval; queues → scheduling, BFS, buffers; circular queue fixes false overflow.\n\nViva favourites: how circular queue detects full vs empty; stack in recursion.\n\nNext: `quiz me on DSA`.",
  },
  {
    id: "bst", label: "BST & Traversals",
    keys: ["bst", "binary search tree", "traversal", "inorder", "preorder", "postorder", "insert delete", "avl"],
    body: "**BST — construct + traverse without fear**\n\n• Insert rule: smaller left, larger right (duplicates: pick a side, state it).\n• Traversals: inorder = L-N-R (sorted output!), preorder = N-L-R, postorder = L-R-N.\n• For 50,30,70,20,40,60,80: inorder gives 20 30 40 50 60 70 80 — always verify sortedness.\n• Deletion: leaf → drop; one child → bypass; two children → inorder successor swap.\n\nViva favourites: why inorder is sorted; worst-case height of naive BST.\n\nNext: `quiz me on DSA` or `important questions DSA`.",
  },
  {
    id: "sorting", label: "Sorting Algorithms",
    keys: ["sorting", "quick sort", "quicksort", "merge sort", "bubble", "insertion", "selection", "heap sort", "partition"],
    body: "**Quick vs Merge — the comparison TU sets**\n\n• QuickSort: partition around pivot, avg O(n log n), worst O(n²) (sorted + bad pivot), in-place, NOT stable.\n• MergeSort: divide + merge, always O(n log n), stable, needs O(n) extra space.\n• Trace format: show array after each partition/merge pass — partial traces still earn marks.\n\nViva favourites: stability meaning + example; when QuickSort degrades.\n\nNext: `quiz me on DSA`.",
  },
  {
    id: "hashing", label: "Hashing",
    keys: ["hash", "hashing", "collision", "chaining", "open addressing", "linear probing", "load factor", "hash function"],
    body: "**Hashing — collision handling decides your marks**\n\n• Chaining: buckets hold lists — simple, never 'full', extra memory.\n• Open addressing (linear/quadratic probing, double hashing): stays in table, clustering risk, needs resizing at high load factor.\n• Load factor α = n/m; keep α low for O(1) average behaviour.\n\nViva favourites: chaining vs probing trade-off; what clustering is.\n\nNext: `quiz me on DSA`.",
  },
  {
    id: "discrete-graphs", label: "Graphs (Discrete Structures)",
    keys: ["complete graph", "k5", "edges", "handshaking", "euler", "hamiltonian", "bipartite", "tree edges", "combinatorics", "permutation", "combination", "pigeonhole"],
    body: "**Discrete graphs + counting — formula bank**\n\n• Complete graph K_n edges = n(n−1)/2 → K5 = 10.\n• Handshaking lemma: sum of degrees = 2E.\n• Tree on n vertices has exactly n−1 edges.\n• nCr = n!/(r!(n−r)!); pigeonhole: n+1 items in n boxes ⇒ one box has ≥2.\n\nWrite the formula first, then substitute — formula + substitution + answer = full marks pattern.\n\nNext: `discrete formulas` or `quiz me on Discrete`.",
  },
  {
    id: "micro8085", label: "8085 Microprocessor",
    keys: ["8085", "8086", "microprocessor", "address lines", "addressing modes", "interrupt", "opcode", "flag register", "assembly"],
    body: "**8085 essentials (one-line facts)**\n\n• 8-bit data bus, 16 address lines → 2^16 = 64 KB addressable.\n• Registers: B,C,D,E,H,L (8-bit), SP/PC (16-bit); 5 flags (S,Z,AC,P,CY).\n• Addressing modes: immediate (`MVI A,05`), register (`MOV A,B`), direct (`LDA 2050`), indirect (`MOV A,M`), implied.\n• Interrupts: TRAP (highest, non-maskable) > RST7.5 > RST6.5 > RST5.5 > INTR.\n\nViva favourites: address-line math; TRAP vs INTR.\n\nNext: `quiz me on Microprocessor`.",
  },
  {
    id: "sdlc", label: "SDLC & Agile",
    keys: ["sdlc", "waterfall", "agile", "scrum", "spiral", "prototype", "product owner", "sprint", "backlog"],
    body: "**SDLC models — when to use which**\n\n• Waterfall: fixed requirements, rigid sequence — simple but inflexible.\n• Prototype/Spiral: unclear requirements / high risk — iterate, manage risk explicitly.\n• Agile/Scrum: changing needs — sprints, daily standups; Product Owner owns the backlog, Scrum Master guards the process.\n\nTU frame: 4-model table (use-when + pro + con) + Scrum roles line.\n\nViva favourites: Product Owner vs Scrum Master; spiral's risk focus.\n\nNext: `quiz me on SE`.",
  },
  {
    id: "testing", label: "Software Testing Levels",
    keys: ["testing", "unit test", "integration", "system testing", "acceptance", "black box", "white box", "regression", "alpha beta"],
    body: "**Testing levels — bottom-up order**\n\nUnit (single function, white-box) → Integration (module interfaces) → System (end-to-end, black-box) → Acceptance (alpha in-house / beta with users).\n• Black-box: no code knowledge (equivalence, boundary). White-box: paths/branches covered.\n• Regression: re-run after every change — the maintenance safety net.\n\nViva favourites: black vs white box; alpha vs beta.\n\nNext: `quiz me on SE`.",
  },
  {
    id: "rsa", label: "RSA & Cryptography",
    keys: ["rsa", "cryptography", "aes", "des", "public key", "private key", "digital signature", "hash sha", "caesar", "cipher", "pki"],
    body: "**RSA + crypto basics that score**\n\n• RSA: security = hardness of factoring n = p×q. Public key encrypts, private decrypts; reverse = signature.\n• Symmetric (AES/DES, one shared key, fast) vs asymmetric (key pair, slow, solves key distribution).\n• Hash (SHA): one-way fingerprint — integrity, not secrecy. Signature = hash + private key.\n\nViva favourites: why RSA keys are 2048+ bits; symmetric vs asymmetric use-when.\n\nNext: `quiz me on Crypto`.",
  },
  {
    id: "astar", label: "A* & Search (AI)",
    keys: ["a*", "a star", "search", "bfs", "dfs", "greedy", "heuristic", "admissible", "informed", "csp"],
    body: "**Search algorithms — optimality map**\n\n• BFS: optimal for uniform cost, memory-hungry. DFS: memory-light, not optimal.\n• Greedy: fastest guess (h only), not optimal.\n• A*: f = g + h — optimal with admissible/consistent heuristic (never overestimates).\n\nTU frame: 4-row table (formula + optimal? + use) + one-line admissibility definition.\n\nViva favourites: admissible vs consistent; why greedy fails.\n\nNext: `quiz me on AI`.",
  },
  {
    id: "compiler", label: "Compiler Phases",
    keys: ["compiler", "lexical", "syntax analysis", "parse tree", "semantic", "intermediate code", "code generation", "ll", "lr", "token"],
    body: "**Compiler phases in flow order**\n\nLexical (chars → tokens) → Syntax/parser (tokens → parse tree) → Semantic (annotated tree, type checks) → IR → Optimization → Code generation.\n• LL = top-down, leftmost; LR = bottom-up, rightmost — LR handles more grammars.\n\nViva favourites: which phase makes the parse tree; lexer vs parser output.\n\nNext: `quiz me on Compiler`.",
  },
  {
    id: "numbersys", label: "Number Systems (Digital Logic)",
    keys: ["number system", "binary", "hexadecimal", "octal", "1s complement", "2s complement", "conversion", "boolean algebra", "nand", "nor", "universal gate", "kmap"],
    body: "**Number systems + logic — conversion drill**\n\n• 2's complement: invert bits, add 1 (e.g. 101100 → 010100). It's how negatives are stored.\n• NAND and NOR are universal — any function from NAND alone.\n• Boolean laws to memorize: De Morgan, absorption (A+AB=A), distributive.\n\nViva favourites: why 2's complement over sign-magnitude; universal gate proof sketch.\n\nNext: `quiz me on Digital Logic`.",
  },
  {
    id: "stats-basic", label: "Probability & Statistics",
    keys: ["probability", "bayes", "distribution", "normal distribution", "mean median mode", "variance", "hypothesis", "regression", "p-value"],
    body: "**Stats essentials for CS papers**\n\n• Normal distribution: mean = median = mode (symmetric).\n• P(A|B) = P(B|A)P(A)/P(B) — Bayes in one line.\n• Variance = E[X²] − (E[X])².\n• Hypothesis flow: H0/H1 → test statistic → p-value → reject H0 if p < α (usually 0.05).\n\nViva favourites: when mean≠median (skew); p-value meaning.\n\nNext: `stats formulas` or `quiz me on Stats`.",
  },
  {
    id: "automata", label: "Automata & TOC",
    keys: ["automata", "finite automata", "nfa", "dfa", "pumping lemma", "turing", "halting", "pda", "context free", "subset construction", "undecidable"],
    body: "**Automata ladder (memorize the hierarchy)**\n\n• FA/DFA/NFA ↔ regular languages. NFA→DFA via subset construction (≤ 2ⁿ states).\n• PDA (+stack) ↔ context-free (handles aⁿbⁿ nesting).\n• Turing Machine ↔ recursively enumerable; halting problem is undecidable.\n• Pumping lemma = the tool to prove NOT regular (assume → pump → contradict).\n\nTU frame: hierarchy table → one conversion → one undecidability line.\n\nViva favourites: why FA can't count; NFA vs DFA state blowup.\n\nNext: `important questions CSC262` or `quiz me on TOC`.",
  },
  {
    id: "egov", label: "E-Governance (Nepal)",
    keys: ["e-governance", "egovernance", "g2c", "g2b", "g2g", "electronic transactions act", "eta 2063", "digital nepal"],
    body: "**E-Governance — the Nepal-flavoured 5-marker**\n\n• G2C (services to citizens), G2B (licenses/tenders/tax), G2G (between agencies), G2E (employees).\n• Maturity ladder: presence → interaction → transaction → transformation.\n• ETA 2063: e-signatures + electronic records legally valid, Controller of Certification.\n\nWrite it as: 4 models with one example each → ladder → ETA line. Examiners love the Nepal specifics.\n\nNext: `quiz me on E-Governance`.",
  },
  {
    id: "nummethods", label: "Numerical Methods",
    keys: ["numerical", "bisection", "newton raphson", "secant", "false position", "gauss elimination", "interpolation", "simpson", "trapezoidal", "runge kutta"],
    body: "**Numerical Methods — method picker for TU**\n\n• Roots: bisection (slow, always converges) → false position → secant → Newton-Raphson (fastest, needs f′ + good guess).\n• Linear systems: Gauss elimination → Gauss-Seidel iteration (diagonally dominant converges).\n• Integration: trapezoidal → Simpson's 1/3 (needs even intervals, O(h⁴)).\n• Always show 2 iterations by hand with error calc — iteration tables carry step marks.\n\nViva favourites: Newton convergence condition; Simpson's interval rule.\n\nNext: `important questions CSC212`.",
  },
  {
    id: "answer-writing", label: "How to Write TU Answers",
    keys: ["how to write", "answer writing", "10 marks", "5 marks", "presentation", "step marks", "time management", "exam tips", "diagram tips"],
    body: "**TU answer-writing system (works for every subject)**\n\n• Structure: 1-line definition → diagram/table → 4-6 points → one example → 1-line conclusion.\n• Diagrams + formulas + partial code earn step marks even when the final answer is wrong — never leave blanks.\n• 3-hour plan: 10-markers first (35 min each), then 5-markers (15 min), last 15 min for diagrams/labels review.\n• Hand-write code daily; examiners reward traced logic and comments.\n\nNext: say `plan <subject> <days>` e.g. `plan DBMS 7 days`, or `important questions <subject>`.",
  },
];

function scoreTopic(q: string, t: Topic): number {
  let score = 0;
  const qt = tokens(q);
  for (const k of t.keys) {
    const nk = norm(k);
    if (q.includes(nk)) score += nk.length >= 5 ? 3 : 2;
    else if (nk.length >= 7 && qt.some((tok) => similar(tok, nk) >= 0.88)) score += 3; // close typo of a long key
    else if (fuzzyHas(q, k)) score += 1;
  }
  return score;
}

function findTopic(q: string): Topic | null {
  let best: Topic | null = null;
  let bestScore = 0;
  for (const t of TOPICS) {
    const s = scoreTopic(q, t);
    if (s > bestScore) {
      bestScore = s;
      best = t;
    }
  }
  return bestScore >= 3 ? best : null;
}

/* ---------------- MCQ drill ---------------- */

function mcqPoolFor(q: string): { label: string; pool: MCQ[] } {
  const hit = (subj: string) => fuzzyHas(q, subj);
  if (/(entrance|entrance prep|iost entrance|100 mcq)/.test(q)) return { label: "Entrance", pool: entranceMcqs };
  const matched = mcqs.filter((m) => hit(m.subject));
  if (matched.length >= 3) return { label: matched[0].subject, pool: matched };
  // alias fallback across subjects
  const scored = mcqs.filter((m) => {
    const hay = norm(m.subject + " " + m.question);
    return tokens(q).some((t) => t.length > 3 && hay.includes(t));
  });
  if (scored.length >= 2) return { label: "Mixed (matched)", pool: scored };
  return { label: "Mixed revision", pool: mcqs };
}

function quizReply(q: string): string {
  const subj = resolveSubject(q);
  const { label, pool } = mcqPoolFor(subj ? `${subj.title} ${subj.code} ${q}` : q);
  if (!pool.length) return "Our MCQ bank is still growing for that area — try `quiz me on DBMS`, `quiz me on OS`, or open the **Quiz** page for the full bank.";
  // subject asked but bank thin there: lead with matched Qs, fill the rest mixed (honest label)
  const pure = !label.startsWith("Mixed");
  const title = subj && pure ? `${subj.code} — ${subj.title}` : subj ? `${subj.code} + mixed revision` : label;
  const picked = shuffle(pool).slice(0, 5);
  const letters = ["A", "B", "C", "D"];
  let out = `**Quick drill: ${title} (${picked.length} MCQs)**\nAnswer in your head, then check the key at the end — no peeking!\n`;
  const key: string[] = [];
  picked.forEach((m, i) => {
    const order = shuffle(m.options.map((text, oi) => ({ text, correct: oi === m.answer })));
    out += `\n${i + 1}. ${m.question}\n`;
    order.forEach((o, oi) => {
      out += `   ${letters[oi]}) ${o.text}\n`;
      if (o.correct) key.push(`${i + 1}-${letters[oi]}`);
    });
  });
  out += `\nKey: ${key.join("  ")} — score yourself /${picked.length}. Below 3? Say \`explain ${subj ? subj.title : label}\` then retry, or drill timed on the **Quiz** page.`;
  if (subj) lastSubjectCode = subj.code;
  return out;
}

/* ---------------- viva mode ---------------- */

function vivaReply(q: string): string {
  const t = findTopic(q);
  const subj = resolveSubject(q);
  if (t) {
    lastTopic = t.id;
    const vivaLines = t.body.split("\n").filter((l) => l.startsWith("Viva"));
    return `**Viva drill: ${t.label}**\n\nAnswer these aloud in 30 seconds each (examiner style):\n${vivaLines.length ? vivaLines.join("\n") : "• Define it in one line.\n• Give one example.\n• State one trade-off."}\n\nThen say \`quiz me\` to convert this into MCQs, or \`explain ${t.label}\` for the full note.`;
  }
  if (subj) {
    lastSubjectCode = subj.code;
    return `**Viva drill: ${subj.code} — ${subj.title}**\n\n• Define the subject's core idea in one line.\n• Name its 5 units and the one you'd bet exam marks on.\n• Give one real example + one trade-off.\n\nSay \`important questions ${subj.code}\` for board sets, or \`plan ${subj.code} 7 days\` for a revision plan.`;
  }
  return "Tell me the topic — e.g. `viva OOP`, `viva DBMS`, `viva pointers`, `viva OS` — and I'll fire examiner-style questions.";
}

/* ---------------- important questions + past papers ---------------- */

function importantReply(q: string): string {
  const subj = resolveSubject(q);
  const probe = subj ? `${subj.title} ${subj.code}` : q;
  const sets = pastQuestions.filter((p) => {
    const hay = norm(`${p.subject} ${p.code} ${p.program}`);
    return (
      tokens(probe).some((t) => t.length > 2 && hay.includes(t)) ||
      (subj && norm(p.code) === norm(subj.code))
    );
  }).slice(0, 3);
  const t = findTopic(q);
  let out = subj
    ? `**High-yield questions: ${subj.code} — ${subj.title}**\n`
    : "**High-yield questions**\n";
  if (sets.length) {
    for (const s of sets) {
      out += `\n[${s.type} · ${s.year}] ${s.subject} (${s.code}):\n`;
      for (const x of s.questions) out += `• [${x.marks}] ${x.text}\n`;
    }
  } else {
    out += "\nOur past-paper bank (v1) doesn't have this subject yet — the full **Questions** page lists every set we have.\n";
  }
  if (t) {
    const ask = t.body.split("\n").find((l) => l.includes("TU favourite") || l.includes("TU frame") || l.includes("TU loves"));
    if (ask) out += `\n${ask}`;
  }
  out += "\n\nMethod: write each answer timed, by hand, with diagram + example. Say `plan " + (subj ? subj.code : "this subject") + " 7 days` for a schedule.";
  if (subj) lastSubjectCode = subj.code;
  if (t) lastTopic = t.id;
  return out;
}

/* ---------------- study plans ---------------- */

function planReply(q: string): string {
  if (q.includes("entrance"))
    return "**CSIT/BIT Entrance plan (TU IOST)**\n\n• 100 MCQs, ~2 hrs: Math (40ish), Physics, English, CS/IQ. Need 35%+ to pass; top colleges need much higher merit.\n• 30-day split: Week 1 Math formulas + 200 MCQs; Week 2 Physics + English; Week 3 CS fundamentals + mocks; Week 4 timed full mocks (use our **Quiz** page + say `quiz me entrance`).\n• Revise: logs, trig, vectors, Kirchhoff, articles/prepositions, number systems, C output questions.";
  const daysMatch = q.match(/(\d+)\s*(day|week)/);
  let days = daysMatch ? parseInt(daysMatch[1]) * (daysMatch[2].startsWith("week") ? 7 : 1) : 7;
  days = Math.max(3, Math.min(30, days));
  const subj = resolveSubject(q);
  if (!subj) {
    return `**${days}-day semester rescue plan**\n\nDays 1–${Math.max(1, days - 3)}: syllabus mapping — list all units, mark repeated board topics (say \`important questions <subject>\`).\nDay ${Math.max(2, days - 2)}: one subject/day hand-written notes + code.\nDay ${Math.max(3, days - 1)}: past papers timed (3 hrs) + fix weak units.\nDay ${days}: formula/diagram book + 25-MCQ drills (say \`quiz me\`).\n\nGolden rule: never skip chapters 1–3 of any subject — TU sets 40%+ from foundations.\n\nWant it subject-specific? Say \`plan DBMS 7 days\` or \`plan OS 2 weeks\`.`;
  }
  lastSubjectCode = subj.code;
  const units = subj.units.length ? subj.units : ["Full syllabus revision"];
  const contentDays = Math.max(1, days - 2);
  const perDay = Math.ceil(units.length / contentDays);
  let out = `**${days}-day plan: ${subj.code} — ${subj.title}** (${subj.program}, Sem ${subj.semester})\n`;
  let d = 1;
  for (let i = 0; i < units.length; i += perDay, d++) {
    const chunk = units.slice(i, i + perDay);
    out += `\nDay ${d}: ${chunk.join(" + ")} — 1 diagram + 1 hand-written example per unit.`;
  }
  out += `\nDay ${days - 1}: past-paper set timed — say \`important questions ${subj.code}\`.`;
  out += `\nDay ${days}: full revision + drill — say \`quiz me on ${subj.code}\`.`;
  out += `\n\nTrack it on the **Tracker** page (check off each unit above as you finish).`;
  return out;
}

/* ---------------- formula sheets ---------------- */

export { FORMULAS as SATHI_FORMULAS };

const FORMULAS: { keys: string[]; body: string }[] = [
  {
    keys: ["subnet", "ip", "cidr", "mask"],
    body: "**Subnetting formula sheet**\n\n• Hosts = 2^(32−prefix) − 2 • /24→254 • /25→126 • /26→62 • /27→30 • /28→14 • /30→2.\n• Masks: /24=255.255.255.0, /16=255.255.0.0, /26=255.255.255.192.\n• Block size = 256 − interesting octet; first host = network+1, last = broadcast−1.",
  },
  {
    keys: ["complexity", "big o", "big-o", "asymptotic"],
    body: "**Complexity cheat sheet**\n\n• O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).\n• Binary search O(log n) • Linear O(n) • MergeSort O(n log n) always • QuickSort avg O(n log n), worst O(n²).\n• K5 edges = 10 via n(n−1)/2.",
  },
  {
    keys: ["stat", "probability", "bayes", "distribution"],
    body: "**Stats formula sheet**\n\n• Normal: mean = median = mode.\n• Bayes: P(A|B) = P(B|A)P(A)/P(B).\n• Variance = E[X²] − (E[X])².\n• nCr = n!/(r!(n−r)!). Reject H0 if p < 0.05.",
  },
  {
    keys: ["discrete", "combin", "graph", "counting"],
    body: "**Discrete formula sheet**\n\n• K_n edges = n(n−1)/2 • Handshaking: Σdeg = 2E • Tree(n) has n−1 edges.\n• nPr = n!/(n−r)!, nCr = n!/(r!(n−r)!) • Pigeonhole: n+1 items in n boxes ⇒ a box holds ≥2.",
  },
  {
    keys: ["number", "binary", "conversion", "complement"],
    body: "**Number-system sheet**\n\n• 2's complement = invert + 1 (stores negatives).\n• Binary→octal: group by 3; binary→hex: group by 4.\n• 8085: 16 address lines → 64 KB (2^16).",
  },
  {
    keys: ["8085", "assembly", "instruction set", "interrupt"],
    body: "**8085 cheat sheet**\n\n• Buses: 8-bit data, 16 address → 64 KB. Flags: S Z AC P CY.\n• MVI = immediate, LDA = direct, MOV A,M = register-indirect (HL).\n• Interrupts: TRAP > RST7.5 > RST6.5 > RST5.5 > INTR. FF+01 → 00, Zero=1, Carry=1.",
  },
  {
    keys: ["math", "calculus", "matrix", "log", "trigonometry", "integration", "differentiation"],
    body: "**Math-for-CS sheet (entrance + sem papers)**\n\n• d/dx(xⁿ) = n·xⁿ⁻¹ • ∫2x = x²+C • 2⁶ = 64 • subsets of n items = 2ⁿ.\n• Slope of ax+by=c → −a/b. ⁵C₂ = 10.\n• Matrices: (AB)ᵀ = BᵀAᵀ; singular ⟺ det = 0.",
  },
];

function formulaReply(q: string): string | null {
  for (const f of FORMULAS) {
    if (f.keys.some((k) => fuzzyHas(q, k))) return f.body + "\n\nSay `quiz me` to test these under pressure.";
  }
  return null;
}

/* ---------------- program / semester intents (kept from v1) ---------------- */

function parseSem(q: string): number | null {
  const map: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5, "6th": 6, "7th": 7, "8th": 8 };
  for (const k of Object.keys(map)) if (q.includes(k)) return map[k];
  const m = q.match(/\b([1-8])\b/);
  return m ? parseInt(m[1]) : null;
}

function programReply(q: string): string | null {
  for (const p of programs) {
    if (q.includes(p.id) || q.includes(p.short.toLowerCase()) || q.includes(norm(p.name))) {
      if (q.includes("eligib") || q.includes("admission") || q.includes("who can")) {
        return `**${p.short} — Eligibility & Admission**\n${p.eligibility}\n\nFaculty: ${p.faculty}\nDuration: ${p.duration} · ${p.totalCredits} credits.\n\nReference: ${p.references.map((r) => `${r.label} (${r.url})`).join(" · ")}\n\nNext: say \`plan ${p.short} 30 days\` for entrance prep, or \`${p.id} 1st sem subjects\` for the syllabus.`;
      }
      const n = parseSem(q);
      if (n || q.includes("subject") || q.includes("syllabus") || q.includes("semester") || q.includes("sem")) {
        if (n) {
          const sem = p.semesters.find((s) => s.num === n);
          if (sem) {
            lastSubjectCode = null;
            return `**${p.short} Semester ${n} — ${sem.label}**\n` +
              sem.subjects.map((s) => `• **${s.code}** — ${s.title} (${s.credits} cr${s.elective ? ", elective" : ""})\n  ${s.description}`).join("\n") +
              `\n\nPick a subject for a plan: \`plan ${sem.subjects[0].code} 7 days\`, or \`important questions ${sem.subjects[0].code}\`.`;
          }
        }
        return `**${p.short} — all 8 semesters**\n` +
          p.semesters.map((s) => `Sem ${s.num}: ${s.subjects.map((x) => x.title).join(", ")}`).join("\n") +
          `\n\nAsk e.g. \`${p.id} 4th sem subjects\` for detail.`;
      }
      return `**${p.short} — ${p.name}**\n${p.description}\n\n${p.duration} · ${p.totalCredits} credits · ${p.faculty}\nEligibility: ${p.eligibility}`;
    }
  }
  return null;
}

/* ---------------- flashcards ---------------- */

function flashReply(q: string): string {
  const deck = findDeck(q);
  if (!deck) {
    return `Pick a deck: ${flashDecks.map((d) => `**${d.label}** (${d.cards.length})`).join(" · ")}.\n\nSay e.g. \`flashcards DBMS\` — or open the interactive **Flashcards** page to flip, shuffle and self-score.`;
  }
  const cards = deck.cards.slice(0, 6);
  let out = `**Flashcards: ${deck.subject}** (showing ${cards.length}/${deck.cards.length})\nCover the answers, recall aloud, then check:\n`;
  cards.forEach((c, i) => {
    out += `\n${i + 1}. ${c.front}\n   → ${c.back}`;
  });
  out += `\n\nFor the full flip-card experience with shuffle + scoring, open the **Flashcards** page (${deck.label} deck). Say \`quiz me on ${deck.label}\` to convert this into MCQs.`;
  return out;
}

/* ---------------- main entry ---------------- */

export function botReply(input: string): string {
  const q = norm(mixToEnglish(input)).trim();
  if (!q) return "Ask me anything exam-related — e.g. `quiz me on OS`, `viva DBMS`, `important questions CSC265`, `plan Networks 7 days`, `subnetting formulas`.";

  if (/^(hi|hello|hey|namaste|namaskar)\b/.test(q))
    return "Namaste! I'm **Sathi** — GyanSathi's exam-prep buddy for CSIT, BIT & BCA.\n\nI can:\n• `quiz me on <subject>` — 5-MCQ lightning drill\n• `flashcards <subject>` — flip-card recall\n• `viva <topic>` — examiner-style questions\n• `important questions <subject>` — board sets + TU favourites\n• `plan <subject> <days>` — day-wise revision from real units\n• `<topic> formulas` — subnetting, complexity, stats sheets\n• `CSIT 4th sem subjects` — syllabus lookup\n\nWhat are we preparing today?";

  if (/what can you do|help|commands|features|how to use/.test(q))
    return "Here's my exam kit:\n\n• **Drill**: `quiz me on OS` / `quiz me entrance`\n• **Recall**: `flashcards DBMS` / `flash me on C`\n• **Viva**: `viva OOP` / `viva pointers`\n• **Boards**: `important questions DBMS` / `past questions C`\n• **Plans**: `plan DBMS 7 days` / `plan OS 2 weeks` / `entrance plan`\n• **Sheets**: `subnetting formulas` / `complexity formulas`\n• **Syllabus**: `CSIT 4th sem subjects` / `BIT eligibility` / `BCA vs CSIT`\n• **Method**: `how to write 10-mark answers`\n\nFollow-ups work too: after any answer, say `more`, `example`, `viva`, or `quiz me`.";

  if (q.includes("thank")) return "You're welcome! Good luck — TU rewards consistent hand practice. Say `quiz me` for one more drill.";
  if (q.includes("who made") || q.includes("creator") || q.includes("developer"))
    return "I'm a hand-coded exam-prep engine built into GyanSathi (no external AI API) — my answers come from the real TU CSIT/BIT/BCA syllabus, past-paper bank and MCQ bank in this app.";

  if ((q.includes("difference") || q.includes("which is better") || q.includes("compare") || q.includes(" vs ")) && (q.includes("csit") || q.includes("bit") || q.includes("bca")))
    return "**CSIT vs BIT vs BCA (TU)**\n\n• **BSc CSIT** (IOST, 126 cr): deepest CS theory — TOC, Compiler, Cryptography. Best for core software / research / abroad.\n• **BIT** (IOST, 120 cr, any stream): applied IT + business mix. Best from management/any stream.\n• **BCA** (Humanities): lab-heavy app dev — Java, .NET, mobile. Best for hands-on builders.\n\nAll share C, DSA, DBMS, OS, Networks, Web, Java. Decide by background + goal, then say `plan <your subject> 7 days`.";

  // exam commands first (they're the point of v2)
  if (/quiz me|drill me|practice|mock me|test me|mcq/.test(q)) return quizReply(q);
  if (/flash ?cards?|flip cards?|flash me|recall/.test(q)) return flashReply(q);
  if (/^viva|viva on|viva questions|oral/.test(q) || (q.includes("viva") && q.length < 40)) return vivaReply(q);
  if (/important|most asked|repeated|board questions|model questions|past (paper|question)/.test(q)) return importantReply(q);
  if (/past questions|old questions|previous year/.test(q)) return importantReply(q);
  if (/plan|routine|timetable|time table|schedule|how to study|study plan|prepare in|days|weeks/.test(q) && !q.includes("explain")) return planReply(q);
  if (/formula|cheat sheet|cheatsheet|sheet/.test(q)) return formulaReply(q) ?? "Which sheet? Try `subnetting formulas`, `complexity formulas`, `stats formulas`, `discrete formulas`.";
  if (/project|internship/.test(q))
    return "**Project & Internship tips**\n\n• CSIT Sem 7 project (3 cr) + Sem 8 internship (6 cr); BIT Sem 7 project + Sem 8 internship; BCA Project III (6 cr).\n• Pick MERN / Django / Flutter + a real client problem. Small but complete: auth + CRUD + report + deployment.\n• Docs TU checks: proposal → SRS/UML → implementation → testing → conclusion. Start docs in week 1!";

  const prog = programReply(q);
  if (prog) return prog;

  // follow-ups ride on last context
  if (/^(more|more detail|detail|explain more|elaborate|example|examples|eg|give example|short|short note|simply|simplify|easy|nepali|in nepali)/.test(q)) {
    if (lastTopic) {
      const t = TOPICS.find((x) => x.id === lastTopic)!;
      if (/viva/.test(q)) return vivaReply(t.label);
      if (/quiz|mcq|drill|test/.test(q)) return quizReply(t.label);
      return t.body + "\n\nWant it as viva Qs (`viva`) or a drill (`quiz me`)?";
    }
    if (lastSubjectCode) return importantReply(lastSubjectCode);
    return "Tell me the topic first — e.g. `explain normalization` — then say `more` or `example`.";
  }
  if (/^(quiz|drill|test)( me)?$/.test(q)) {
    if (lastTopic) return quizReply(TOPICS.find((x) => x.id === lastTopic)!.label);
    if (lastSubjectCode) return quizReply(lastSubjectCode);
  }

  // topic explainers (scored, typo-tolerant)
  const t = findTopic(q);
  if (t) {
    lastTopic = t.id;
    return t.body;
  }

  // subject info across programs
  const subjHits = allSubjects().filter(
    (r) =>
      q.includes(norm(r.subject.code)) ||
      norm(r.subject.title).split(" ").some((w) => w.length > 3 && q.includes(w))
  );
  if (subjHits.length > 0 && subjHits.length <= 8) {
    const h = subjHits[0];
    lastSubjectCode = h.subject.code;
    return `**${h.subject.code} — ${h.subject.title}** (${h.program}, Sem ${h.semester})\n${h.subject.description}\n\nUnits:\n` +
      h.subject.units.map((u, i) => `${i + 1}. ${u}`).join("\n") +
      `\n\nUse it: \`plan ${h.subject.code} 7 days\` · \`important questions ${h.subject.code}\` · \`quiz me on ${h.subject.code}\`.`;
  }
  const resolved = resolveSubject(q);
  if (resolved) {
    lastSubjectCode = resolved.code;
    return `**${resolved.code} — ${resolved.title}** (${resolved.program}, Sem ${resolved.semester})\n${resolved.description}\n\nUnits:\n` +
      resolved.units.map((u, i) => `${i + 1}. ${u}`).join("\n") +
      `\n\nUse it: \`plan ${resolved.code} 7 days\` · \`important questions ${resolved.code}\` · \`quiz me on ${resolved.code}\`.`;
  }

  // fallback: closest subjects (fuzzy)
  const keywords = tokens(q).filter((w) => w.length > 3).slice(0, 4);
  const sug = allSubjects()
    .filter((r) => keywords.some((k) => norm(r.subject.title).includes(k) || norm(r.subject.code).includes(k) || similar(k, norm(r.subject.title).split(" ")[0] ?? "") > 0.85))
    .slice(0, 3);
  if (sug.length)
    return `I don't have a full note on "${input.trim()}" yet, but it looks related to:\n` +
      sug.map((s) => `• **${s.subject.code}** — ${s.subject.title} (${s.program} Sem ${s.semester})`).join("\n") +
      `\n\nTry: \`explain ${sug[0].subject.title}\` · \`quiz me on ${sug[0].subject.code}\` · \`viva ${sug[0].subject.title}\`.`;
  return `Hmm, I'm an offline exam-prep bot, so I answer best on TU syllabus topics.\n\nTry:\n• \`quiz me on OS\`\n• \`viva DBMS\`\n• \`important questions CSC265\`\n• \`plan Networks 7 days\`\n• \`subnetting formulas\`\n• \`CSIT 4th sem subjects\``;
}
