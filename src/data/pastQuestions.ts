export interface PastQuestion {
  id: string;
  program: string;
  subject: string;
  code: string;
  year: string;
  type: "Board" | "Model" | "Important";
  questions: { marks: string; text: string }[];
}

export const pastQuestions: PastQuestion[] = [
  {
    id: "csit-cprog-2080",
    program: "BSc CSIT",
    subject: "C Programming",
    code: "CSC115",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "2×5=10", text: "a) Differentiate between %d and %i in scanf with example. b) What is a dangling pointer? How to avoid it?" },
      { marks: "3×5=15", text: "a) Write a C program to check palindrome using recursion. b) Explain call by value vs call by reference with example. c) Write a program to read 10 integers, sort them using pointers." },
      { marks: "10", text: "Write a C program for a simple student record system using structures + file handling (add, display, search). Explain the logic." },
    ],
  },
  {
    id: "csit-dsa-2080",
    program: "BSc CSIT",
    subject: "Data Structures and Algorithms",
    code: "CSC211",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "5", text: "Explain stack with array implementation + algorithm for push/pop with overflow/underflow handling." },
      { marks: "5", text: "Construct BST for 50, 30, 70, 20, 40, 60, 80 and show inorder, preorder, postorder traversals." },
      { marks: "10", text: "Compare Quick Sort vs Merge Sort with complexity analysis + trace Quick Sort on [38, 27, 43, 3, 9, 82, 10]." },
    ],
  },
  {
    id: "csit-dbms-2081",
    program: "BSc CSIT",
    subject: "Database Management System",
    code: "CSC265",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "Draw ER diagram for College (Student, Teacher, Course, Enrollment) and convert to relational schema." },
      { marks: "5", text: "Normalize R(A,B,C,D,E) with FDs A→B, B→C, A→D up to 3NF." },
      { marks: "10", text: "Write SQL for: employees(dept, salary) — 2nd highest salary per dept; explain ACID with concurrent transfer example." },
    ],
  },
  {
    id: "bit-oop-2081",
    program: "BIT",
    subject: "Object Oriented Programming",
    code: "BIT153",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "Explain 4 pillars of OOP with real examples (encapsulation, inheritance, polymorphism, abstraction)." },
      { marks: "5", text: "Write a C++ program showing function overloading + operator overloading for a Complex class." },
      { marks: "10", text: "Design a BankAccount hierarchy (Savings/Current) with virtual functions + exception handling for insufficient balance." },
    ],
  },
  {
    id: "bca-java-2080",
    program: "BCA",
    subject: "OOP in Java",
    code: "CACS202",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "5", text: "Differentiate abstract class vs interface with programs." },
      { marks: "5", text: "Write a Java program for multithreading using Runnable + synchronization example." },
      { marks: "10", text: "Build a small Swing form (student admission) with event handling + JDBC save to MySQL." },
    ],
  },
  {
    id: "common-networks-important",
    program: "CSIT / BIT / BCA",
    subject: "Computer Networks",
    code: "CSC263",
    year: "Repeatedly asked",
    type: "Important",
    questions: [
      { marks: "5", text: "Explain OSI vs TCP/IP with diagram. Why is TCP called reliable?" },
      { marks: "5", text: "Subnet 192.168.1.0/24 into 4 subnets: find subnet mask, ranges, broadcast addresses." },
      { marks: "10", text: "Explain Distance Vector vs Link State routing with example + DNS resolution steps." },
    ],
  },
  {
    id: "csit-os-2081",
    program: "BSc CSIT",
    subject: "Operating Systems",
    code: "CSC264",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "Given arrival/burst table, draw Gantt charts for FCFS vs SJF and compute average waiting time." },
      { marks: "5", text: "Explain the 4 deadlock conditions (MHNC) with a two-process printer example + one prevention method." },
      { marks: "10", text: "Compare paging vs segmentation (fragmentation, table structure) + explain thrashing and how the working-set model fixes it." },
    ],
  },
  {
    id: "csit-oop-2080",
    program: "BSc CSIT",
    subject: "Object Oriented Programming (C++)",
    code: "CSC166",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "2×5=10", text: "a) 4 pillars of OOP with one example each. b) Constructor vs destructor + copy constructor need." },
      { marks: "3×5=15", text: "a) Function overloading vs overriding with programs. b) Virtual functions + dynamic binding. c) Templates vs macros." },
      { marks: "10", text: "Design a Shape hierarchy (Circle/Rectangle) with virtual area(), operator overloading for Complex addition, file I/O of objects." },
    ],
  },
  {
    id: "csit-toc-2081",
    program: "BSc CSIT",
    subject: "Theory of Computation",
    code: "CSC262",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "Convert the NFA for strings ending in 01 to an equivalent DFA via subset construction." },
      { marks: "5", text: "Use the pumping lemma to prove L = {aⁿbⁿ | n ≥ 0} is not regular." },
      { marks: "10", text: "Design a PDA for balanced parentheses + explain why no FA can do it; state the halting problem and why it is undecidable." },
    ],
  },
  {
    id: "csit-web-2080",
    program: "BSc CSIT",
    subject: "Web Technology",
    code: "CSC329",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "2×5=10", text: "a) GET vs POST with idempotency. b) Cookies vs sessions with a login example." },
      { marks: "3×5=15", text: "a) Same-origin policy + CORS. b) PHP form handling ($_GET/$_POST) with validation. c) HTTP status families with examples." },
      { marks: "10", text: "Build a JS-validated admission form + PHP/MySQL save; explain client vs server validation split." },
    ],
  },
  {
    id: "csit-stats-2081",
    program: "BSc CSIT",
    subject: "Statistics I",
    code: "STA169",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "Mean vs median on skewed data + compute both for a given frequency table." },
      { marks: "5", text: "State and apply Bayes' theorem to a diagnostic-test problem (sensitivity/specificity given)." },
      { marks: "10", text: "Full hypothesis-test workflow (H0/H1 → test statistic → p-value → decision at α=0.05) on a worked dataset." },
    ],
  },
  {
    id: "csit-micro-2080",
    program: "BSc CSIT",
    subject: "Microprocessor",
    code: "CSC167",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "2×5=10", text: "a) 16 address lines → 64KB math. b) TRAP vs INTR with priority order." },
      { marks: "3×5=15", text: "a) Addressing modes with one example each. b) Trace MVI A,FFH + ADI 01H flags. c) LDA vs MOV A,M." },
      { marks: "10", text: "Write 8085 assembly to add two 16-bit numbers + explain the delay-loop technique with calculation." },
    ],
  },
  {
    id: "csit-discrete-2081",
    program: "BSc CSIT",
    subject: "Discrete Structures",
    code: "CSC165",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "Prove K5 has 10 edges via n(n−1)/2 + state the handshaking lemma with one application." },
      { marks: "5", text: "Pigeonhole principle: 13 pigeons, 12 holes + one counting (nCr) problem." },
      { marks: "10", text: "Partial orders (reflexive/antisymmetric/transitive for ≤) + draw a Hasse diagram for divisors of 12." },
    ],
  },
  {
    id: "csit-se-2080",
    program: "BSc CSIT",
    subject: "Software Engineering",
    code: "CSC375",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "2×5=10", text: "a) Waterfall vs Agile use-when. b) Product Owner vs Scrum Master." },
      { marks: "3×5=15", text: "a) Low coupling, high cohesion with example. b) Unit→integration→system→acceptance. c) Black-box vs white-box." },
      { marks: "10", text: "Draw Level-0 + Level-1 DFDs for a library system + write 5 functional requirements (SRS style)." },
    ],
  },
  {
    id: "csit-ai-2081",
    program: "BSc CSIT",
    subject: "Artificial Intelligence",
    code: "CSC266",
    year: "2081 BS (Model)",
    type: "Model",
    questions: [
      { marks: "5", text: "BFS vs DFS vs A* comparison table (optimal? memory? formula) + admissibility defined." },
      { marks: "5", text: "Supervised vs unsupervised learning with one dataset example each." },
      { marks: "10", text: "Trace A* (f = g + h) on a given grid graph + explain why greedy best-first can fail." },
    ],
  },
  {
    id: "csit-compiler-2080",
    program: "BSc CSIT",
    subject: "Compiler Design and Construction",
    code: "CSC376",
    year: "2080 BS (Board)",
    type: "Board",
    questions: [
      { marks: "2×5=10", text: "a) Lexer vs parser outputs. b) LL vs LR with one grammar each handles/fails." },
      { marks: "3×5=15", text: "a) All 6 phases in flow order with I/O of each. b) Three-address code for a=b+c*d. c) Symbol table contents." },
      { marks: "10", text: "Eliminate left recursion from a given grammar + construct the predictive parsing table." },
    ],
  },
];

export const studyTips = [
  { tag: "TU pattern", tip: "TU repeats 30–40% concepts. Solve last 5 years board papers per subject before reading new notes." },
  { tag: "70/30 rule", tip: "Spend 70% time writing code/queries by hand, 30% reading. TU practicals + theory both reward hand-written practice." },
  { tag: "Diagrams", tip: "OSI, ER, BST traversals, CPU pipeline — always draw labelled diagrams. They carry step marks." },
  { tag: "Numericals", tip: "Numerical Methods + Stats: make a formula page per chapter and revise it the morning of the exam." },
];
