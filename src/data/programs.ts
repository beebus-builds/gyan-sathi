export interface Subject {
  code: string;
  title: string;
  credits: number;
  elective?: boolean;
  description: string;
  units: string[];
}

export interface Semester {
  num: number;
  label: string;
  subjects: Subject[];
}

export interface Program {
  id: string;
  short: string;
  name: string;
  faculty: string;
  duration: string;
  totalCredits: number;
  eligibility: string;
  description: string;
  semesters: Semester[];
  references: { label: string; url: string }[];
}

export const programs: Program[] = [
  {
    id: "csit",
    short: "BSc CSIT",
    name: "BSc in Computer Science and Information Technology",
    faculty: "TU · Institute of Science and Technology (IOST)",
    duration: "4 years · 8 semesters",
    totalCredits: 126,
    eligibility: "+2 Science / A-Level Science with 45%+, must pass TU IOST CSIT entrance (35%+). Entrance covers Math, Physics, English + CS fundamentals.",
    description:
      "The most popular TU IT degree. Core CS + IT with Math, Stats, Physics, Management, electives, project and internship.",
    references: [
      { label: "HamroCSIT — notes & questions", url: "https://hamrocsit.com/" },
      { label: "Official TU IOST", url: "https://tuiost.edu.np/" },
    ],
    semesters: [
      {
        num: 1,
        label: "First Semester",
        subjects: [
          { code: "CSC114", title: "Introduction to Information Technology", credits: 3, description: "Fundamentals of computers, hardware/software, networks, internet, security and IT applications.", units: ["Intro to computers & IT", "Computer hardware & memory", "Software & OS basics", "Networks & Internet", "Security, ethics & emerging tech"] },
          { code: "CSC115", title: "C Programming", credits: 3, description: "Techniques of programming in C: control flow, functions, arrays, pointers, structures, files.", units: ["Tokens & control statements", "Functions & recursion", "Arrays & strings", "Pointers & dynamic memory", "Structures, unions & file handling"] },
          { code: "CSC116", title: "Digital Logic", credits: 3, description: "Design of digital circuits: number systems, Boolean algebra, combinational & sequential circuits.", units: ["Number systems & codes", "Boolean algebra & gates", "Combinational circuits", "Sequential circuits", "Registers, counters & memory"] },
          { code: "MTH117", title: "Mathematics I", credits: 3, description: "Calculus foundations for CS: functions, limits, derivatives, integrals and series.", units: ["Functions & limits", "Differentiation", "Applications of derivatives", "Integration", "Series & differential equations intro"] },
          { code: "PHY118", title: "Physics", credits: 3, description: "Physics for computing: mechanics, electromagnetism, electronics and optics basics.", units: ["Mechanics", "Electromagnetism", "Semiconductors & electronics", "Digital electronics intro", "Optics & modern physics"] },
        ],
      },
      {
        num: 2,
        label: "Second Semester",
        subjects: [
          { code: "CSC165", title: "Discrete Structures", credits: 3, description: "Logic, sets, relations, graphs and counting — math backbone of CS.", units: ["Logic & proofs", "Sets, relations & functions", "Combinatorics", "Graphs & trees", "Recurrence & automata intro"] },
          { code: "CSC166", title: "Object Oriented Programming (C++)", credits: 3, description: "OOP with C++: classes, inheritance, polymorphism, templates and STL.", units: ["Classes & objects", "Constructors & overloading", "Inheritance", "Polymorphism & virtual functions", "Templates, STL & file I/O"] },
          { code: "CSC167", title: "Microprocessor", credits: 3, description: "8085/8086 architecture, assembly programming and interfacing.", units: ["Microprocessor architecture", "Instruction set", "Assembly programming", "Interrupts & interfacing", "Advanced microprocessors"] },
          { code: "MTH168", title: "Mathematics II", credits: 3, description: "Linear algebra, vector calculus and advanced calculus for CS.", units: ["Matrices & linear systems", "Vector spaces", "Vector calculus", "Multiple integrals", "Laplace & Fourier intro"] },
          { code: "STA169", title: "Statistics I", credits: 3, description: "Descriptive stats, probability and distributions.", units: ["Data & sampling", "Probability", "Random variables", "Distributions", "Estimation intro"] },
        ],
      },
      {
        num: 3,
        label: "Third Semester",
        subjects: [
          { code: "CSC211", title: "Data Structures and Algorithms", credits: 3, description: "Stacks, queues, lists, trees, graphs, sorting and searching.", units: ["Complexity analysis", "Stacks, queues & lists", "Trees & BST", "Graphs & traversals", "Sorting & hashing"] },
          { code: "CSC212", title: "Numerical Methods", credits: 3, description: "Root finding, interpolation, numerical integration and solving linear systems.", units: ["Errors & root finding", "Interpolation", "Numerical differentiation/integration", "Linear systems", "ODE solutions"] },
          { code: "CSC213", title: "Computer Architecture", credits: 3, description: "CPU organization, pipelining, memory hierarchy and I/O.", units: ["Digital design review", "CPU organization", "Control unit & pipelining", "Memory hierarchy", "I/O & multiprocessors"] },
          { code: "CSC214", title: "Computer Graphics", credits: 3, description: "2D/3D graphics, transformations, clipping and rendering basics.", units: ["Graphics pipeline", "2D transformations", "Clipping & windowing", "3D viewing", "Illumination & shading intro"] },
          { code: "STA215", title: "Statistics II", credits: 3, description: "Hypothesis testing, regression, ANOVA and inference.", units: ["Sampling distributions", "Hypothesis testing", "Regression & correlation", "ANOVA", "Non-parametric tests"] },
        ],
      },
      {
        num: 4,
        label: "Fourth Semester",
        subjects: [
          { code: "CSC262", title: "Theory of Computation", credits: 3, description: "Automata, regular languages, CFGs, Turing machines and decidability.", units: ["Finite automata", "Regular expressions", "Context-free grammars", "Turing machines", "Decidability & complexity"] },
          { code: "CSC263", title: "Computer Networks", credits: 3, description: "OSI/TCP-IP, addressing, routing, transport and application protocols.", units: ["Network models", "Physical & data link layer", "IP addressing & subnetting", "Routing & transport (TCP/UDP)", "Application layer: DNS, HTTP, FTP"] },
          { code: "CSC264", title: "Operating Systems", credits: 3, description: "Processes, scheduling, deadlocks, memory and file systems.", units: ["OS structures", "Processes & threads", "CPU scheduling", "Deadlocks & memory management", "File systems & virtualization"] },
          { code: "CSC265", title: "Database Management System", credits: 3, description: "ER modeling, relational algebra, SQL, normalization and transactions.", units: ["ER model", "Relational model & SQL", "Normalization", "Transactions & concurrency", "Indexing & recovery"] },
          { code: "CSC266", title: "Artificial Intelligence", credits: 3, description: "Search, knowledge representation, ML basics and expert systems.", units: ["Intelligent agents & search", "Informed search & CSP", "Knowledge & reasoning", "ML intro", "NLP & expert systems"] },
        ],
      },
      {
        num: 5,
        label: "Fifth Semester",
        subjects: [
          { code: "CSC325", title: "Design and Analysis of Algorithms", credits: 3, description: "Divide & conquer, greedy, DP, graph algorithms and NP-completeness.", units: ["Asymptotics & recurrences", "Divide & conquer", "Greedy algorithms", "Dynamic programming", "NP-completeness"] },
          { code: "CSC326", title: "System Analysis and Design", credits: 3, description: "SDLC, requirements, UML, design and testing.", units: ["SDLC models", "Requirements engineering", "UML modeling", "System design", "Implementation & maintenance"] },
          { code: "CSC327", title: "Cryptography", credits: 3, description: "Classical + modern ciphers, PKI, hashes and signatures.", units: ["Classical ciphers", "Block/stream ciphers (DES, AES)", "Public-key crypto (RSA)", "Hashes & signatures", "Protocols & PKI"] },
          { code: "CSC328", title: "Simulation and Modeling", credits: 3, description: "Discrete-event simulation, random numbers, queuing models.", units: ["System modeling", "Random number generation", "Discrete-event simulation", "Queuing theory", "Simulation tools"] },
          { code: "CSC329", title: "Web Technology", credits: 3, description: "HTML/CSS/JS, server-side scripting and web apps.", units: ["HTML & CSS", "JavaScript & DOM", "Server-side basics (PHP/Node)", "Sessions & databases", "AJAX & deployment"] },
          { code: "ELECTIVE-I", title: "Elective I (Multimedia / Wireless / Image Processing / KM / Ethics / MPD)", credits: 3, elective: true, description: "Choose one: Multimedia Computing, Wireless Networking, Image Processing, Knowledge Management, Society & Ethics in IT, Microprocessor Based Design.", units: ["As per chosen elective"] },
        ],
      },
      {
        num: 6,
        label: "Sixth Semester",
        subjects: [
          { code: "CSC375", title: "Software Engineering", credits: 3, description: "Agile/waterfall, estimation, testing, maintenance and quality.", units: ["Process models", "Requirements & estimation", "Design & architecture", "Testing & QA", "Maintenance & DevOps intro"] },
          { code: "CSC376", title: "Compiler Design and Construction", credits: 3, description: "Lexing, parsing, semantic analysis and code generation.", units: ["Lexical analysis", "Parsing (LL/LR)", "Semantic analysis", "Intermediate code", "Code gen & optimization"] },
          { code: "CSC377", title: "E-Governance", credits: 3, description: "Digital government models, policies and e-services in Nepal.", units: ["E-gov models", "Nepal e-gov master plan", "Digital identity & services", "Security & policy", "Case studies"] },
          { code: "CSC378", title: "NET Centric Computing", credits: 3, description: ".NET framework, C#, ASP.NET and database-driven apps.", units: ["C# fundamentals", "OOP in .NET", "ASP.NET & MVC", "ADO.NET & EF", "Deployment & security"] },
          { code: "CSC379", title: "Technical Writing", credits: 3, description: "Reports, proposals, documentation and research writing.", units: ["Writing process", "Technical reports", "Proposals & documentation", "Presentations", "Research ethics"] },
          { code: "ELECTIVE-II", title: "Elective II (E-commerce / AI / Robotics / Hardware / Logic)", credits: 3, elective: true, description: "Choose one: E-commerce, Neural Networks, Automation & Robotics, Computer Hardware Design, Applied Logic, Cognitive Science.", units: ["As per chosen elective"] },
        ],
      },
      {
        num: 7,
        label: "Seventh Semester",
        subjects: [
          { code: "CSC419", title: "Advanced Java Programming", credits: 3, description: "Java EE: servlets, JSP, Spring/Hibernate intro, multithreading.", units: ["Collections & generics", "Multithreading", "JDBC", "Servlets & JSP", "Spring/Hibernate intro"] },
          { code: "CSC420", title: "Data Warehousing and Data Mining", credits: 3, description: "OLAP, ETL, association, classification and clustering.", units: ["DW architecture & OLAP", "ETL", "Association mining", "Classification", "Clustering"] },
          { code: "CSC421", title: "Principles of Management", credits: 3, description: "Management theory, leadership, HR and project organization.", units: ["Management evolution", "Planning & organizing", "Leadership", "HR & motivation", "Control & MIS"] },
          { code: "CSC422", title: "Project Work", credits: 3, description: "Team-based major project with documentation and defense.", units: ["Proposal", "Design & implementation", "Testing", "Documentation", "Defense"] },
          { code: "ELECTIVE-III", title: "Elective III (Network Security / IR / DBA / SPM / DSD)", credits: 3, elective: true, description: "Choose one: Network Security, Information Retrieval, Database Administration, Software Project Management, Digital System Design.", units: ["As per chosen elective"] },
        ],
      },
      {
        num: 8,
        label: "Eighth Semester",
        subjects: [
          { code: "CSC475", title: "Advanced Database", credits: 3, description: "Distributed DBs, NoSQL, query optimization and big data intro.", units: ["Advanced SQL & PL/SQL", "Query optimization", "Distributed databases", "NoSQL", "Big data & cloud DBs"] },
          { code: "CSC476", title: "Internship", credits: 6, description: "Full-semester industry internship with report and evaluation.", units: ["Placement", "Work log", "Mentor review", "Final report", "Viva"] },
          { code: "ELECTIVE-IV", title: "Elective IV", credits: 3, elective: true, description: "Choose: Advanced Networking (IPv6), Game Tech, Cloud Computing, GIS, Mobile App Dev, Embedded Systems, etc.", units: ["As per chosen elective"] },
          { code: "ELECTIVE-V", title: "Elective V", credits: 3, elective: true, description: "Second elective of sem 8 from the same pool.", units: ["As per chosen elective"] },
        ],
      },
    ],
  },
  {
    id: "bit",
    short: "BIT",
    name: "Bachelor in Information Technology",
    faculty: "TU · Institute of Science and Technology (IOST)",
    duration: "4 years · 8 semesters",
    totalCredits: 120,
    eligibility: "+2 in ANY stream with 2nd division+, must pass TU IOST BIT entrance. Designed for non-science students too.",
    description:
      "Newer TU program (started 2076 BS). More applied/management mix: IT + business + social sciences, with internship.",
    references: [
      { label: "bitinfoNepal — notes & mock tests", url: "https://bitinfonepal.com/" },
      { label: "Official TU IOST", url: "https://tuiost.edu.np/" },
    ],
    semesters: [
      {
        num: 1, label: "First Semester",
        subjects: [
          { code: "BIT101", title: "Introduction to Information Technology", credits: 3, description: "Computer basics, hardware, software, networks and emerging tech.", units: ["Computer fundamentals", "Hardware & software", "Internet & web", "Security basics", "Emerging tech"] },
          { code: "BIT102", title: "C Programming", credits: 3, description: "Structured programming in C.", units: ["Basics & I/O", "Control flow", "Functions & arrays", "Pointers & structures", "Files"] },
          { code: "BIT103", title: "Digital Logic", credits: 3, description: "Number systems, gates, combinational/sequential design.", units: ["Number systems", "Boolean algebra", "Combinational design", "Sequential design", "Memory"] },
          { code: "MTH104", title: "Basic Mathematics", credits: 3, description: "Functions, limits, calculus for IT students.", units: ["Functions", "Limits & continuity", "Derivatives", "Integrals", "Matrices intro"] },
          { code: "SCO105", title: "Sociology", credits: 3, description: "Society, culture and technology-society interaction.", units: ["Intro to sociology", "Culture & society", "Social institutions", "Technology & society", "Nepalese society"] },
        ],
      },
      {
        num: 2, label: "Second Semester",
        subjects: [
          { code: "ECO155", title: "Economics", credits: 3, description: "Micro/macro basics for IT business context.", units: ["Demand & supply", "Production & cost", "Market structures", "National income", "Money & banking"] },
          { code: "STA154", title: "Business Statistics", credits: 3, description: "Stats for business decisions.", units: ["Descriptive stats", "Probability", "Distributions", "Hypothesis testing", "Regression"] },
          { code: "BIT153", title: "Object Oriented Programming", credits: 3, description: "OOP with C++/Java basics.", units: ["OOP concepts", "Classes & objects", "Inheritance", "Polymorphism", "Exception & files"] },
          { code: "BIT152", title: "Discrete Structure", credits: 3, description: "Logic, sets, graphs, counting.", units: ["Logic", "Sets & relations", "Counting", "Graphs", "Recurrence"] },
          { code: "BIT151", title: "Microprocessor and Computer Architecture", credits: 3, description: "CPU, assembly and organization.", units: ["Architecture basics", "Instruction set", "Assembly", "Memory & I/O", "Pipelining intro"] },
        ],
      },
      {
        num: 3, label: "Third Semester",
        subjects: [
          { code: "BIT201", title: "Data Structure and Algorithm", credits: 3, description: "Core DS + algorithms.", units: ["Complexity", "Lists/stacks/queues", "Trees", "Graphs", "Sorting/searching"] },
          { code: "BIT202", title: "Database Management System", credits: 3, description: "SQL, design, normalization, transactions.", units: ["ER & relational model", "SQL", "Normalization", "Transactions", "Security & recovery"] },
          { code: "BIT203", title: "Operating System", credits: 3, description: "Processes, scheduling, memory, files.", units: ["OS intro", "Processes", "Scheduling & sync", "Memory", "File systems"] },
          { code: "BIT204", title: "Numerical Methods", credits: 3, description: "Computation methods for IT.", units: ["Errors", "Root finding", "Interpolation", "Integration", "Linear systems"] },
          { code: "BIT205", title: "Principles of Management", credits: 3, description: "Management for tech teams.", units: ["Management basics", "Planning", "Organizing", "Leading", "Controlling"] },
        ],
      },
      {
        num: 4, label: "Fourth Semester",
        subjects: [
          { code: "BIT206", title: "Operations Research", credits: 3, description: "Optimization: LP, transportation, queuing.", units: ["OR intro & LP", "Simplex", "Transportation", "Queuing", "Decision theory"] },
          { code: "BIT207", title: "Network and Data Communications", credits: 3, description: "Signals, transmission, multiplexing, switching.", units: ["Signals & media", "Multiplexing", "Switching", "Error control", "LAN/WAN"] },
          { code: "BIT208", title: "System Analysis and Design", credits: 3, description: "SDLC, UML, design.", units: ["SDLC", "Requirements", "UML", "Design", "Testing & deployment"] },
          { code: "BIT209", title: "Artificial Intelligence", credits: 3, description: "Agents, search, knowledge, ML intro.", units: ["Agents", "Search", "Knowledge representation", "ML basics", "Applications"] },
          { code: "BIT210", title: "Web Technology I", credits: 3, description: "Frontend: HTML/CSS/JS.", units: ["HTML", "CSS", "JavaScript", "DOM & events", "Responsive & hosting"] },
        ],
      },
      {
        num: 5, label: "Fifth Semester",
        subjects: [
          { code: "BIT301", title: "Web Technology II (PHP)", credits: 3, description: "Server-side with PHP & MySQL.", units: ["PHP basics", "Forms & sessions", "MySQL integration", "Auth & file upload", "Project"] },
          { code: "BIT302", title: "Software Engineering", credits: 3, description: "Processes, agile, testing, quality.", units: ["Process models", "Requirements", "Design", "Testing", "Maintenance"] },
          { code: "BIT303", title: "Information Security", credits: 3, description: "CIA triad, crypto, network security.", units: ["Security basics", "Crypto", "Network security", "Web security", "Policy & ethics"] },
          { code: "BIT304", title: "Computer Graphics", credits: 3, description: "2D/3D, transformations, rendering.", units: ["Pipeline", "2D transforms", "Clipping", "3D", "Animation intro"] },
          { code: "BIT305", title: "Technical Writing", credits: 3, description: "Reports, docs, proposals.", units: ["Writing basics", "Reports", "Documentation", "Proposals", "Presentation"] },
        ],
      },
      {
        num: 6, label: "Sixth Semester",
        subjects: [
          { code: "BIT306", title: "Net-Centric Computing (.NET)", credits: 3, description: "C# + ASP.NET apps.", units: ["C#", "OOP .NET", "ASP.NET", "DB access", "Deployment"] },
          { code: "BIT307", title: "Database Administration", credits: 3, description: "Install, backup, tuning, security.", units: ["DBA roles", "Backup/recovery", "Security", "Tuning", "Cloud DBs"] },
          { code: "BIT308", title: "Management Information System", credits: 3, description: "IS for business decisions.", units: ["IS types", "ERP/CRM", "Decision support", "E-business", "Case studies"] },
          { code: "BIT309", title: "Research Methodology", credits: 3, description: "Research design, sampling, report writing.", units: ["Research basics", "Design & sampling", "Data collection", "Analysis", "Report writing"] },
          { code: "ELECTIVE-I", title: "Elective I", credits: 3, elective: true, description: "Psychology / Multimedia / Wireless / Society & Ethics in IT, etc.", units: ["As per chosen elective"] },
        ],
      },
      {
        num: 7, label: "Seventh Semester",
        subjects: [
          { code: "BIT310", title: "Advanced Java Programming", credits: 3, description: "JDBC, servlets, JSP, frameworks intro.", units: ["Advanced Java", "JDBC", "Servlets/JSP", "Frameworks intro", "Project"] },
          { code: "BIT311", title: "Software Project Management", credits: 3, description: "Estimation, scheduling, risk, agile.", units: ["PM basics", "Estimation", "Scheduling", "Risk", "Agile & tools"] },
          { code: "BIT312", title: "E-Commerce", credits: 3, description: "Online business, payments, security.", units: ["E-com models", "Payments", "Security", "Marketing", "Nepal case studies"] },
          { code: "BIT313", title: "Project Work", credits: 3, description: "Major team project + defense.", units: ["Proposal", "Build", "Test", "Docs", "Defense"] },
          { code: "ELECTIVE-II", title: "Elective II", credits: 3, elective: true, description: "Mobile App Dev / Cloud / Simulation / DSS / Marketing, etc.", units: ["As per chosen elective"] },
        ],
      },
      {
        num: 8, label: "Eighth Semester",
        subjects: [
          { code: "BIT314", title: "Internship", credits: 6, description: "Industry internship with report + viva.", units: ["Placement", "Work log", "Review", "Report", "Viva"] },
          { code: "ELECTIVE-III", title: "Elective III", credits: 3, elective: true, description: "Network Security / Image Processing / GIS / Knowledge Mgmt, etc.", units: ["As per chosen elective"] },
          { code: "ELECTIVE-IV", title: "Elective IV", credits: 3, elective: true, description: "Second elective of final semester.", units: ["As per chosen elective"] },
          { code: "BIT315", title: "Career & Professional Development", credits: 3, description: "Ethics, communication, freelancing, interview prep.", units: ["Ethics", "Communication", "CV & interviews", "Freelancing", "Portfolio"] },
        ],
      },
    ],
  },
  {
    id: "bca",
    short: "BCA",
    name: "Bachelor in Computer Applications",
    faculty: "TU · Faculty of Humanities & Social Sciences",
    duration: "4 years · 8 semesters",
    totalCredits: 126,
    eligibility: "+2 / PCL in any discipline with 40%+ (100/40 marks in English). Must pass TU BCA entrance.",
    description:
      "Application-focused degree under Humanities faculty. Programming + business + management with lab-heavy subjects.",
    references: [
      { label: "BCANepalTU — notes & lab reports", url: "https://bcanepaltu.com/" },
    ],
    semesters: [
      {
        num: 1, label: "BCA I Semester",
        subjects: [
          { code: "CACS101", title: "Computer Fundamentals and Applications", credits: 4, description: "Computer basics + office/productivity applications.", units: ["Fundamentals", "Hardware/software", "OS basics", "Office apps", "Internet"] },
          { code: "CACO102", title: "Society and Technology", credits: 3, description: "Tech-society relationship, ethics.", units: ["Society & tech", "Digital divide", "Ethics", "E-governance", "Nepal context"] },
          { code: "CAEN103", title: "English I", credits: 3, description: "Academic reading/writing.", units: ["Reading", "Writing", "Grammar", "Speaking", "Reports"] },
          { code: "CAMT104", title: "Mathematics I", credits: 3, description: "Algebra, calculus foundations.", units: ["Sets & functions", "Limits", "Derivatives", "Integrals", "Matrices"] },
          { code: "CADL105", title: "Digital Logic", credits: 3, description: "Gates, circuits, memory.", units: ["Number systems", "Gates", "Combinational", "Sequential", "Memory"] },
        ],
      },
      {
        num: 2, label: "BCA II Semester",
        subjects: [
          { code: "CACS151", title: "C Programming", credits: 4, description: "Structured programming in C with labs.", units: ["Basics", "Control", "Functions", "Pointers", "Files"] },
          { code: "CAAC152", title: "Financial Accounting", credits: 3, description: "Journal, ledger, statements.", units: ["Accounting basics", "Journal/ledger", "Trial balance", "Statements", "Analysis"] },
          { code: "CAEN153", title: "English II", credits: 3, description: "Professional communication.", units: ["Business writing", "Presentations", "Reports", "Interviews", "Documentation"] },
          { code: "CAMT154", title: "Mathematics II", credits: 3, description: "Discrete + linear math.", units: ["Logic", "Matrices", "Vectors", "Probability intro", "Statistics intro"] },
          { code: "CACO155", title: "Microprocessor and Computer Architecture", credits: 3, description: "8085/8086 + organization.", units: ["Architecture", "Instructions", "Assembly", "Memory", "I/O"] },
        ],
      },
      {
        num: 3, label: "BCA III Semester",
        subjects: [
          { code: "CACS201", title: "Data Structure and Algorithm", credits: 3, description: "DS + algo with labs.", units: ["Complexity", "Stacks/queues", "Trees", "Graphs", "Sorting"] },
          { code: "CACS202", title: "OOP in Java", credits: 3, description: "Java OOP: classes, GUI, threads.", units: ["Java basics", "Classes", "Inheritance", "GUI & events", "Threads & files"] },
          { code: "CACS203", title: "System Analysis and Design", credits: 3, description: "SDLC + UML.", units: ["SDLC", "Requirements", "DFD/UML", "Design", "Implementation"] },
          { code: "CACS204", title: "Web Technology", credits: 3, description: "HTML/CSS/JS + backend intro.", units: ["HTML/CSS", "JS", "Server basics", "PHP intro", "Hosting"] },
          { code: "CAST205", title: "Probability and Statistics", credits: 3, description: "Probability, distributions, inference.", units: ["Probability", "Distributions", "Sampling", "Testing", "Regression"] },
        ],
      },
      {
        num: 4, label: "BCA IV Semester",
        subjects: [
          { code: "CACS251", title: "Database Management System", credits: 3, description: "SQL + design + transactions.", units: ["ER", "SQL", "Normalization", "Transactions", "Recovery"] },
          { code: "CACS252", title: "Operating System", credits: 3, description: "Processes, memory, files.", units: ["Intro", "Processes", "Scheduling", "Memory", "Files"] },
          { code: "CACS253", title: "Scripting Language", credits: 3, description: "Python/JS/Bash scripting with labs.", units: ["Scripting intro", "Python basics", "JS scripting", "Shell", "Project"] },
          { code: "CAMT254", title: "Numerical Methods", credits: 3, description: "Computation techniques.", units: ["Errors", "Root finding", "Interpolation", "Integration", "ODE"] },
          { code: "CACS255", title: "Software Engineering", credits: 3, description: "Lifecycle, agile, testing.", units: ["Models", "Requirements", "Design", "Testing", "Maintenance"] },
        ],
      },
      {
        num: 5, label: "BCA V Semester",
        subjects: [
          { code: "CACS301", title: "Computer Networking", credits: 3, description: "OSI, TCP/IP, LAN/WAN.", units: ["Models", "Media", "IP & subnetting", "Routing", "Apps"] },
          { code: "CAMG302", title: "Introduction to Management", credits: 3, description: "Management principles.", units: ["Basics", "Planning", "Organizing", "Leading", "Control"] },
          { code: "CACS303", title: "Dot-Net Technology", credits: 3, description: "C# + ASP.NET.", units: ["C#", ".NET OOP", "WinForms", "ASP.NET", "DB apps"] },
          { code: "CACS304", title: "MIS & E-Business", credits: 3, description: "IS + e-commerce.", units: ["MIS types", "ERP", "E-business models", "Payments", "Security"] },
          { code: "CACS305", title: "Computer Graphics", credits: 3, description: "2D/3D graphics.", units: ["Pipeline", "Transforms", "Clipping", "3D", "Animation"] },
        ],
      },
      {
        num: 6, label: "BCA VI Semester",
        subjects: [
          { code: "CACS351", title: "Distributed System", credits: 3, description: "Distribution, RPC, consistency.", units: ["Intro", "Communication", "Sync", "Consistency", "Fault tolerance"] },
          { code: "CACS352", title: "Advance Java Programming", credits: 3, description: "Enterprise Java.", units: ["Collections", "JDBC", "Servlets/JSP", "Frameworks", "Project"] },
          { code: "CACS353", title: "Mobile Programming", credits: 3, description: "Android/Flutter apps with lab.", units: ["Mobile intro", "UI design", "Storage & APIs", "Sensors", "Publish"] },
          { code: "CACS354", title: "Network Programming", credits: 3, description: "Sockets, client-server.", units: ["Sockets", "TCP/UDP", "Multithreading", "HTTP", "Security"] },
          { code: "CAPJ355", title: "Project II / Minor Project", credits: 3, description: "Guided minor project.", units: ["Proposal", "Design", "Build", "Test", "Report"] },
        ],
      },
      {
        num: 7, label: "BCA VII Semester",
        subjects: [
          { code: "CACS401", title: "Cyber Law and Professional Ethics", credits: 3, description: "Nepal cyber law + ethics.", units: ["Cyber law Nepal", "IP rights", "Privacy", "Ethics", "Cases"] },
          { code: "CACS402", title: "Artificial Intelligence", credits: 3, description: "Search, ML, NLP.", units: ["Agents", "Search", "Knowledge", "ML", "Apps"] },
          { code: "CACS403", title: "Cloud Computing", credits: 3, description: "IaaS/PaaS/SaaS, AWS intro.", units: ["Cloud models", "Virtualization", "Storage", "AWS/GCP", "DevOps intro"] },
          { code: "CACS404", title: "Internship / Elective", credits: 3, description: "Internship report or elective (DBA / E-Governance / SPM / Network Admin).", units: ["Placement/report or elective units"] },
          { code: "CAMG405", title: "Software Project Management / Elective", credits: 3, description: "PM or elective like Database Administration.", units: ["PM basics or elective units"] },
        ],
      },
      {
        num: 8, label: "BCA VIII Semester",
        subjects: [
          { code: "CACS451", title: "Information Security", credits: 3, description: "Security principles + crypto.", units: ["CIA", "Crypto", "Network sec", "Web sec", "Forensics intro"] },
          { code: "CACS452", title: "Database Programming", credits: 3, description: "PL/SQL, triggers, admin.", units: ["Advanced SQL", "PL/SQL", "Triggers", "Tuning", "NoSQL intro"] },
          { code: "CACS453", title: "Geographical Information System", credits: 3, description: "GIS concepts + tools.", units: ["GIS intro", "Data models", "Analysis", "QGIS", "Apps"] },
          { code: "CACS454", title: "Operational Research", credits: 3, description: "Optimization methods.", units: ["LP", "Transportation", "Queuing", "Games", "Simulation"] },
          { code: "CAPJ455", title: "Project III (Final Year Project)", credits: 6, description: "Capstone project + defense.", units: ["Proposal", "Build", "Test", "Docs", "Defense"] },
        ],
      },
    ],
  },
];

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function allSubjects(): { program: string; semester: number; subject: Subject }[] {
  const out: { program: string; semester: number; subject: Subject }[] = [];
  for (const p of programs)
    for (const s of p.semesters)
      for (const sub of s.subjects) out.push({ program: p.short, semester: s.num, subject: sub });
  return out;
}
