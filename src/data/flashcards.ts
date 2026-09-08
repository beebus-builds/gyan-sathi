export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashDeck {
  id: string;
  label: string;
  subject: string;
  cards: Flashcard[];
}

export const flashDecks: FlashDeck[] = [
  {
    id: "dbms",
    label: "DBMS",
    subject: "Database Management System",
    cards: [
      { front: "1NF requires…", back: "Atomic values, no repeating groups." },
      { front: "2NF removes…", back: "Partial dependency: non-key depending on only part of the key." },
      { front: "3NF removes…", back: "Transitive dependency: non-key → non-key (A→B→C means split)." },
      { front: "BCNF rule in one line?", back: "Every determinant must be a candidate key — stricter than 3NF." },
      { front: "ACID stands for?", back: "Atomicity, Consistency, Isolation, Durability — all-or-nothing, valid→valid, isolated, survives crashes." },
      { front: "WHERE vs HAVING?", back: "WHERE filters rows before grouping; HAVING filters groups after GROUP BY." },
      { front: "DROP vs TRUNCATE vs DELETE?", back: "DROP kills structure; TRUNCATE empties rows, keeps structure; DELETE removes filtered rows." },
      { front: "Weak entity symbol + need?", back: "Double rectangle; needs owner's key (e.g. Enrollment needs Student + Course)." },
    ],
  },
  {
    id: "os",
    label: "OS",
    subject: "Operating Systems",
    cards: [
      { front: "4 deadlock conditions (MHNC)?", back: "Mutual exclusion, Hold & wait, No preemption, Circular wait — break any one to prevent." },
      { front: "SJF's strength + flaw?", back: "Optimal average waiting time, but starves long jobs." },
      { front: "Huge Round Robin quantum ≈ ?", back: "FCFS (each job finishes in one slice)." },
      { front: "Aging fixes…", back: "Starvation — waiting jobs' priority rises over time." },
      { front: "Thrashing = ?", back: "Excessive page faults from too-small working set; fix with working-set model / more frames." },
      { front: "Paging vs segmentation fragmentation?", back: "Paging → internal (half-empty last page); segmentation → external (holes between segments)." },
      { front: "Banker's algorithm = prevention or avoidance?", back: "Avoidance — grants only safe-state requests." },
      { front: "Convoy effect belongs to…", back: "FCFS — one long job blocks everyone behind it." },
    ],
  },
  {
    id: "networks",
    label: "Networks",
    subject: "Computer Networks",
    cards: [
      { front: "OSI 7 layers in order?", back: "Physical → DataLink → Network → Transport → Session → Presentation → Application." },
      { front: "TCP vs UDP in one line?", back: "TCP: reliable, handshake + ACKs (web/files). UDP: fast, no guarantee (video/DNS/games)." },
      { front: "Usable hosts in /24? /26? /30?", back: "/24 → 254, /26 → 62, /30 → 2. Formula: 2^(32−prefix) − 2." },
      { front: "TCP handshake order?", back: "SYN → SYN-ACK → ACK." },
      { front: "DNS port + protocol?", back: "UDP 53 (TCP for zone transfers)." },
      { front: "RIP vs OSPF?", back: "RIP: distance-vector, slow, count-to-infinity. OSPF: link-state + Dijkstra, fast, heavier." },
      { front: "Router works at which layer?", back: "Network (Layer 3) — forwards on IP. Switches: Layer 2 (MAC)." },
      { front: "GET vs POST?", back: "GET retrieves, idempotent, no side effects. POST submits, has side effects." },
    ],
  },
  {
    id: "c",
    label: "C",
    subject: "C Programming",
    cards: [
      { front: "Dangling pointer?", back: "Points to freed memory. Fix: p = NULL right after free()." },
      { front: "malloc vs calloc?", back: "malloc(n bytes) = uninitialized; calloc(n, size) = zeroed. Both need NULL-check + free()." },
      { front: "a[i] == ?", back: "*(a+i) — array-pointer equivalence, asked almost every year." },
      { front: "a++ + ++a = ?", back: "Undefined behaviour (two side-effects between sequence points). Explain, never write." },
      { front: "Recursion needs…", back: "Base case (stops) + recursive step (shrinks). No base = stack overflow." },
      { front: "fopen modes r / w / a?", back: "r = read (must exist), w = write (truncates/creates), a = append. Add b for binary, + for update." },
      { front: "Default storage class of locals?", back: "auto — block lifetime, garbage initial value." },
      { front: "Stack vs heap?", back: "Stack: auto locals, fast, small. Heap: malloc'd, manual free, large." },
    ],
  },
  {
    id: "oop",
    label: "OOP",
    subject: "OOP / Java",
    cards: [
      { front: "4 OOP pillars?", back: "Encapsulation (bundle+hide), Abstraction (hide complexity), Inheritance (reuse), Polymorphism (same call, different behaviour)." },
      { front: "Overloading vs overriding?", back: "Overloading: same name, different signature, compile-time. Overriding: same signature base→derived, runtime via virtual." },
      { front: "Abstract class vs interface?", back: "Abstract: single inheritance, can have constructors + state. Interface: multiple, behaviour contract only." },
      { front: "What does virtual give you?", back: "Dynamic dispatch — derived override runs even via base pointer." },
      { front: "Java: multiple inheritance how?", back: "Implement multiple interfaces (one class extends only one class)." },
      { front: "finally always…", back: "Runs — cleanup code. finally ≠ finalize()." },
      { front: "Encapsulation one-liner?", back: "Private data + public getters/setters." },
    ],
  },
  {
    id: "dsa",
    label: "DSA",
    subject: "Data Structures & Algorithms",
    cards: [
      { front: "Order these: O(n²), O(log n), O(n), O(1)?", back: "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)." },
      { front: "Binary search complexity + why?", back: "O(log n) — halves the search space each step." },
      { front: "Stack vs queue?", back: "Stack = LIFO (undo, call stack). Queue = FIFO (scheduling, BFS)." },
      { front: "BST inorder gives…", back: "Sorted ascending order — verify sortedness to check your tree." },
      { front: "QuickSort vs MergeSort?", back: "Quick: avg O(n log n), worst O(n²), in-place, unstable. Merge: always O(n log n), stable, O(n) space." },
      { front: "Chaining vs open addressing?", back: "Chaining: lists in buckets, never full. Open addressing: in-table probing, clustering risk." },
      { front: "Circular queue FULL condition?", back: "(rear+1) % MAX == front — one slot stays empty." },
    ],
  },
];

export function findDeck(q: string): FlashDeck | null {
  const s = q.toLowerCase();
  const qt = s.split(/[^a-z0-9+#]+/).filter(Boolean);
  return (
    flashDecks.find(
      (d) =>
        qt.includes(d.id) ||
        qt.includes(d.label.toLowerCase()) ||
        s.includes(d.subject.toLowerCase())
    ) ?? null
  );
}
