const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Placement = require('../models/Placement');
const Announcement = require('../models/Announcement');
const Club = require('../models/Club');

require('dotenv').config();

const seedAllData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('[CampusRadar Seed] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Placement.deleteMany({}),
      Announcement.deleteMany({}),
      Club.deleteMany({})
    ]);

    // 1. Seed Demo Users
    console.log('[CampusRadar Seed] Seeding demo users...');
    const commonPasswordHash = await bcrypt.hash('demo123', 10);

    const users = await User.insertMany([
      {
        name: 'Aarav Sharma (Student)',
        email: 'student@demo.campusradar.local',
        passwordHash: commonPasswordHash,
        role: 'Student',
        department: 'Computer Science & Engineering'
      },
      {
        name: 'Rohan Verma (Club President)',
        email: 'club@demo.campusradar.local',
        passwordHash: commonPasswordHash,
        role: 'ClubPresident',
        clubAffiliation: 'Coding Club'
      },
      {
        name: 'Dr. Vikram Malhotra (Placement Head)',
        email: 'placement@demo.campusradar.local',
        passwordHash: commonPasswordHash,
        role: 'PlacementHead',
        department: 'Career & Placement Cell'
      },
      {
        name: 'Prof. Ananya Roy (Faculty In-Charge)',
        email: 'faculty@demo.campusradar.local',
        passwordHash: commonPasswordHash,
        role: 'Faculty',
        department: 'Academic & Exam Cell'
      },
      {
        name: 'System Administrator',
        email: 'admin@demo.campusradar.local',
        passwordHash: commonPasswordHash,
        role: 'Admin',
        department: 'Campus Administration'
      }
    ]);

    const adminUser = users.find(u => u.role === 'Admin');
    const clubUser = users.find(u => u.role === 'ClubPresident');
    const placementUser = users.find(u => u.role === 'PlacementHead');
    const facultyUser = users.find(u => u.role === 'Faculty');

    // 2. Seed Clubs
    console.log('[CampusRadar Seed] Seeding campus clubs...');
    const clubs = await Club.insertMany([
      {
        name: 'AI Society',
        category: 'Technical',
        presidentName: 'Priya Sundaram',
        facultyInCharge: 'Dr. K. R. Nambiar',
        description: 'Fostering research, projects, and hands-on workshops in Machine Learning, Deep Learning, and Artificial Intelligence.',
        contactEmail: 'aisociety@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        socialLinks: { website: 'https://aisociety.campus.edu', instagram: '@aisociety_campus' }
      },
      {
        name: 'Coding Club',
        category: 'Technical',
        presidentName: 'Rohan Verma',
        facultyInCharge: 'Prof. S. Chakrabarti',
        description: 'The epicenter of Competitive Programming, Open Source contributions, and algorithmic problem-solving on campus.',
        contactEmail: 'codingclub@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
        socialLinks: { website: 'https://codingclub.campus.edu', github: 'https://github.com/codingclub-campus' }
      },
      {
        name: 'Cyber Security Club',
        category: 'Technical',
        presidentName: 'Aditya Raj',
        facultyInCharge: 'Dr. Meera Iyer',
        description: 'Dedicated to CTF competitions, ethical hacking, network defense, and cybersecurity awareness.',
        contactEmail: 'cybersec@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Robotics Club',
        category: 'Technical',
        presidentName: 'Karan Patel',
        facultyInCharge: 'Dr. R. V. Joshi',
        description: 'Building autonomous rovers, drone swarms, and competing in national RoboWars events.',
        contactEmail: 'robotics@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Music Club',
        category: 'Cultural',
        presidentName: 'Sneha Kapoor',
        facultyInCharge: 'Prof. Varun Saxena',
        description: 'Uniting vocalists, instrumentalists, and sound producers for acoustic jams and annual musical fests.',
        contactEmail: 'music@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Dramatics Club',
        category: 'Cultural',
        presidentName: 'Kabir Mehta',
        facultyInCharge: 'Prof. Shalini Varma',
        description: 'Stage plays, street theatre (Nukkad Natak), monologues, and expressive performing arts.',
        contactEmail: 'dramatics@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Literature Club',
        category: 'Cultural',
        presidentName: 'Ananya Gupta',
        facultyInCharge: 'Dr. Elizabeth Thomas',
        description: 'Debates, poetry slams, creative writing sessions, and monthly book discussions.',
        contactEmail: 'litclub@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Sports Guild',
        category: 'Sports',
        presidentName: 'Vikram Singh',
        facultyInCharge: 'Coach Rajesh Kumar',
        description: 'Managing inter-departmental tournaments, athletics, football, basketball, and indoor games.',
        contactEmail: 'sports@campusradar.edu',
        logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80'
      }
    ]);

    // Calculate dates for demo (today + X days)
    const getFutureDate = (daysAhead) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    const getPastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    // 3. Seed Events
    console.log('[CampusRadar Seed] Seeding campus events...');
    await Event.insertMany([
      {
        title: 'Campus HackFest 2026',
        categories: ['Technical', 'Hackathon', 'Competition'],
        description: '36-hour annual flagship hackathon featuring real-world challenges in AI, Web3, GreenTech, and FinTech with ₹2,50,000 in cash prizes!',
        date: getFutureDate(3),
        startTime: '09:00 AM',
        endTime: '09:00 PM',
        venue: 'Main Auditorium & Innovation Lab',
        organizer: 'Coding Club & AI Society',
        clubAffiliation: 'Coding Club',
        clubType: 'Technical',
        registrationDeadline: getFutureDate(2),
        registrationUrl: 'https://forms.gle/kGVHFA7nobcfqemA6',
        posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
        eligibility: 'All B.Tech / M.Tech / MCA students of all batches.',
        rules: 'Team size 2-4 members. Original codebase created during the event.',
        contact: 'hackfest@campusradar.edu',
        isHighlight: true,
        highlightStatus: 'Approved',
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'National Tech Summit & AI Conclave',
        categories: ['Technical', 'Seminar', 'Workshop'],
        description: 'Keynotes by industry leaders from Google, Microsoft, and OpenAI covering Generative AI systems, LLM Fine-tuning, and Cloud Architecture.',
        date: getFutureDate(5),
        startTime: '10:00 AM',
        endTime: '04:30 PM',
        venue: 'CS Seminar Hall B',
        organizer: 'AI Society',
        clubAffiliation: 'AI Society',
        clubType: 'Technical',
        registrationDeadline: getFutureDate(4),
        registrationUrl: 'https://forms.gle/A7KuhmLatesq8Qou7',
        posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Open to all students & faculty members.',
        rules: 'Mandatory registration badge at entrance.',
        contact: 'aisociety@campusradar.edu',
        isHighlight: true,
        highlightStatus: 'Approved',
        status: 'Published',
        createdBy: adminUser._id
      },
      {
        title: 'Annual Cultural Night - Resonance 2026',
        categories: ['Cultural', 'Competition', 'Club Event'],
        description: 'An enchanting evening of live battle of the bands, classical fusion dance performances, nukkad natak, and fashion showcase.',
        date: getFutureDate(8),
        startTime: '05:30 PM',
        endTime: '10:00 PM',
        venue: 'Open Air Theatre (OAT)',
        organizer: 'Music & Dramatics Club',
        clubAffiliation: 'Music Club',
        clubType: 'Cultural',
        registrationDeadline: getFutureDate(7),
        registrationUrl: 'https://forms.gle/6PicBjBENtcutDYi8',
        posterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Open to all students and staff with valid Campus ID.',
        rules: 'Passes required for external guests.',
        contact: 'cultural@campusradar.edu',
        isHighlight: true,
        highlightStatus: 'Approved',
        status: 'Published',
        createdBy: adminUser._id
      },
      {
        title: 'CyberDefend: CTF Ethical Hacking League',
        categories: ['Technical', 'Competition'],
        description: 'Jeopardy-style Capture The Flag competition covering cryptography, reverse engineering, web exploitation, and forensics.',
        date: getFutureDate(4),
        startTime: '02:00 PM',
        endTime: '07:00 PM',
        venue: 'Cyber Security Lab (Room 304)',
        organizer: 'Cyber Security Club',
        clubAffiliation: 'Cyber Security Club',
        clubType: 'Technical',
        registrationDeadline: getFutureDate(3),
        registrationUrl: 'https://forms.gle/ZAvf95DhqWmrhc528',
        posterUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Individual or teams of 2.',
        rules: 'Strict no-DDoS policy on scoring infrastructure.',
        contact: 'cybersec@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'RoboWars & Autonomous Rover Challenge',
        categories: ['Technical', 'Competition', 'Sports'],
        description: 'Custom-built bots compete in destructive arena battles and autonomous obstacle course navigation.',
        date: getFutureDate(12),
        startTime: '10:00 AM',
        endTime: '05:00 PM',
        venue: 'Mechanical Workshop Arena',
        organizer: 'Robotics Club',
        clubAffiliation: 'Robotics Club',
        clubType: 'Technical',
        registrationDeadline: getFutureDate(10),
        registrationUrl: 'https://forms.gle/7uB8co9o6sNi4rbr7',
        posterUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Weight limit 15kg bot category.',
        rules: 'Safety kill-switch mandatory for active weapons.',
        contact: 'robotics@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'Inter-Departmental Football League',
        categories: ['Sports', 'Competition'],
        description: 'Annual 11-a-side football tournament between CSE, ECE, MECH, CIVIL, and EEE departments.',
        date: getFutureDate(6),
        startTime: '04:00 PM',
        endTime: '07:00 PM',
        venue: 'Main Sports Complex Ground',
        organizer: 'Sports Guild',
        clubAffiliation: 'Sports Guild',
        clubType: 'Sports',
        registrationDeadline: getFutureDate(4),
        registrationUrl: 'https://forms.gle/JjRxV3d5K4ZoWCA9A',
        posterUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Department squad roster submitted by captain.',
        rules: 'FIFA standard tournament rules.',
        contact: 'sports@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: adminUser._id
      },
      {
        title: 'Web Dev & Cloud Deployment Workshop',
        categories: ['Technical', 'Workshop'],
        description: 'Hands-on practical session building Node.js REST APIs and deploying on Vercel & AWS Elastic Beanstalk.',
        date: getFutureDate(2),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Computer Lab 2',
        organizer: 'Coding Club',
        clubAffiliation: 'Coding Club',
        clubType: 'Technical',
        registrationDeadline: getFutureDate(1),
        registrationUrl: 'https://forms.gle/SDBNqbaMG21Y37PM7',
        posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Bring laptop with Node.js pre-installed.',
        rules: 'Limited to 60 seats on first-come-first-serve basis.',
        contact: 'codingclub@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'Acoustic Unplugged Evening',
        categories: ['Cultural', 'Club Event'],
        description: 'Cozy evening of open mic acoustic covers, original indie songs, and poetry sessions under stars.',
        date: getFutureDate(15),
        startTime: '06:00 PM',
        endTime: '08:30 PM',
        venue: 'Central Lawns',
        organizer: 'Music & Literature Club',
        clubAffiliation: 'Music Club',
        clubType: 'Cultural',
        registrationDeadline: getFutureDate(14),
        registrationUrl: 'https://forms.gle/69gpMrJ3ByoUBi6q9',
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Open to all musicians and literature enthusiasts.',
        rules: 'Slot duration 7 mins per performer.',
        contact: 'music@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'National Youth Parliamentary Debate',
        categories: ['Cultural', 'Competition', 'Seminar'],
        description: 'Multi-round Oxford style debate on contemporary technology ethics, governance, and AI regulations.',
        date: getFutureDate(9),
        startTime: '09:30 AM',
        endTime: '04:00 PM',
        venue: 'Mini Auditorium',
        organizer: 'Literature Club',
        clubAffiliation: 'Literature Club',
        clubType: 'Cultural',
        registrationDeadline: getFutureDate(7),
        registrationUrl: 'https://forms.gle/i9Q2v2sQtydWTEf16',
        posterUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Team of 3 speakers.',
        rules: 'Cross-examination rules provided upon registration.',
        contact: 'litclub@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'Quantum Computing Fundamentals Seminar',
        categories: ['Technical', 'Seminar'],
        description: 'Introduction to Qubits, Quantum Gates, and Qiskit SDK hosted by visiting professor Dr. S. N. Raman.',
        date: getFutureDate(14),
        startTime: '11:00 AM',
        endTime: '01:00 PM',
        venue: 'Physics Lecture Hall 1',
        organizer: 'Academic Cell',
        clubAffiliation: 'AI Society',
        clubType: 'Technical',
        registrationDeadline: getFutureDate(13),
        registrationUrl: 'https://forms.gle/2CKz6bwJobvb9FeF7',
        posterUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
        eligibility: '3rd & 4th year B.Tech students.',
        rules: 'Prior knowledge of linear algebra recommended.',
        contact: 'academics@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: facultyUser._id
      },
      // Past Event (Completed)
      {
        title: 'Algorithmic Coding Contest 2026 (Round 1)',
        categories: ['Technical', 'Competition'],
        description: 'Archived competition held last month with over 450 participants solving 6 hard competitive programming problems.',
        date: getPastDate(15),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Online Arena / HackerRank',
        organizer: 'Coding Club',
        clubAffiliation: 'Coding Club',
        clubType: 'Technical',
        registrationDeadline: getPastDate(16),
        registrationUrl: 'https://hackerrank.com/contests/campusradar-coding-2026',
        posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Archived Past Event',
        rules: 'Completed event',
        contact: 'codingclub@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: clubUser._id
      },
      {
        title: 'Freshers Orientation & Campus Expo 2026',
        categories: ['Cultural', 'Club Event'],
        description: 'Archived campus welcome orientation featuring club stalls, departmental tours, and interactive games.',
        date: getPastDate(30),
        startTime: '09:00 AM',
        endTime: '03:00 PM',
        venue: 'Main Campus Quadrangle',
        organizer: 'Student Affairs Cell',
        clubAffiliation: 'Dramatics Club',
        clubType: 'Cultural',
        registrationDeadline: getPastDate(32),
        registrationUrl: 'https://campusradar.edu/orientation-archive',
        posterUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
        eligibility: 'Archived Past Event',
        rules: 'Completed event',
        contact: 'studentaffairs@campusradar.edu',
        isHighlight: false,
        status: 'Published',
        createdBy: adminUser._id
      }
    ]);

    // 4. Seed Placement Opportunities
    console.log('[CampusRadar Seed] Seeding placement & internship opportunities...');
    await Placement.insertMany([
      {
        company: 'Google',
        role: 'Software Engineer - University Graduate (2026)',
        type: 'Full-Time',
        eligibleBranches: ['CSE', 'ECE', 'EEE', 'IT'],
        eligibleYear: '2026 Passouts',
        minCGPA: 7.5,
        backlogRule: 'Zero active backlogs at time of drive',
        location: 'Bengaluru / Hyderabad (Hybrid)',
        compensation: '28.5 LPA (Fixed + Stocks + Bonus)',
        deadline: getFutureDate(4),
        driveDate: getFutureDate(10),
        applicationUrl: 'https://careers.google.com/jobs/results/campus-radar-2026',
        description: 'Google is hiring entry-level Software Engineers to work on distributed systems, cloud infrastructure, AI models, and Android ecosystem applications.',
        selectionProcess: '1. Online Coding Assessment (2 Qs, 90 mins) -> 2. Technical Interview Round 1 (Data Structures & Algorithms) -> 3. Technical Interview Round 2 (System Design Basics) -> 4. Googliness & Leadership Round',
        createdBy: placementUser._id
      },
      {
        title: 'Microsoft',
        company: 'Microsoft',
        role: 'SWE Intern (Summer 2027 / 3rd Year)',
        type: 'Internship',
        eligibleBranches: ['CSE', 'ECE', 'IT', 'DS & AI'],
        eligibleYear: '2027 Passouts (3rd Year)',
        minCGPA: 7.0,
        backlogRule: 'Maximum 1 backlog permitted',
        location: 'Noida / Bengaluru',
        compensation: '₹1,25,000 / month stipend + Housing',
        deadline: getFutureDate(6),
        driveDate: getFutureDate(12),
        applicationUrl: 'https://careers.microsoft.com/internships-2026',
        description: '2-month summer internship working directly with Azure Cloud, Developer Tools, and Microsoft 365 Core Engineering teams.',
        selectionProcess: '1. Resume Screening -> 2. Online HackerRank Challenge -> 3. Two rounds of Technical Interviews',
        createdBy: placementUser._id
      },
      {
        company: 'Deloitte USI',
        role: 'Analyst - Technology Consulting',
        type: 'Full-Time',
        eligibleBranches: ['All Branches', 'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'],
        eligibleYear: '2026 Passouts',
        minCGPA: 6.5,
        backlogRule: 'No active backlogs',
        location: 'Hyderabad / Bengaluru / Gurugram',
        compensation: '9.6 LPA + Joining Bonus',
        deadline: getFutureDate(8),
        driveDate: getFutureDate(14),
        applicationUrl: 'https://jobs.deloitte.com/campus-hiring-2026',
        description: 'Role involves enterprise cloud migration, SAP/Oracle implementation, cybersecurity auditing, and tech consulting for Fortune 500 clients.',
        selectionProcess: '1. Cognitive & Technical Assessment -> 2. Group Discussion -> 3. HR & Partner Interview',
        createdBy: placementUser._id
      },
      {
        company: 'Cred',
        role: 'Backend Engineer - Node.js / Go',
        type: 'FTE + Internship',
        eligibleBranches: ['CSE', 'ECE', 'IT'],
        eligibleYear: '2026 Passouts',
        minCGPA: 8.0,
        backlogRule: 'No history of backlogs',
        location: 'Bengaluru (Onsite)',
        compensation: '22 LPA (CTC) + 6 Months Internship @ ₹60k/mo',
        deadline: getFutureDate(3),
        driveDate: getFutureDate(7),
        applicationUrl: 'https://cred.club/careers/campus-2026',
        description: 'High-scale fintech backend engineering position working on microservices handling millions of credit card transactions per second.',
        selectionProcess: '1. Machine Coding Round (Low Level Design) -> 2. Deep Dive Data Structures Round -> 3. Culture Fit with Founder/VP',
        createdBy: placementUser._id
      },
      {
        company: 'Razorpay',
        role: 'Product Management Intern',
        type: 'Internship',
        eligibleBranches: ['All Branches'],
        eligibleYear: '2026 & 2027 Passouts',
        minCGPA: 6.8,
        backlogRule: 'Up to 2 active backlogs allowed',
        location: 'Bengaluru / Remote',
        compensation: '₹45,000 / month stipend',
        deadline: getFutureDate(11),
        driveDate: getFutureDate(18),
        applicationUrl: 'https://razorpay.com/jobs/pm-intern-2026',
        description: 'Work alongside Senior Product Managers on merchant onboarding, payout APIs, and checkout conversion optimization.',
        selectionProcess: '1. Product Teardown Assignment -> 2. Case Study Defense -> 3. Product Manager Interview',
        createdBy: placementUser._id
      },
      {
        company: 'TCS Digital',
        role: 'Digital Software Developer',
        type: 'Full-Time',
        eligibleBranches: ['All Branches'],
        eligibleYear: '2026 Passouts',
        minCGPA: 6.0,
        backlogRule: 'No active backlogs at joining',
        location: 'Pan India',
        compensation: '7.2 LPA',
        deadline: getFutureDate(15),
        driveDate: getFutureDate(22),
        applicationUrl: 'https://nextstep.tcs.com/campus/digital-drive-2026',
        description: 'TCS Digital hiring drive through NQT assessment for full-stack, cloud computing, IoT, and AI positions.',
        selectionProcess: '1. TCS NQT Online Test -> 2. Combined Technical & HR Interview',
        createdBy: placementUser._id
      }
    ]);

    // 5. Seed Announcements
    console.log('[CampusRadar Seed] Seeding institutional announcements...');
    await Announcement.insertMany([
      {
        title: 'URGENT: Mid-Term Examination Schedule & Seating Arrangement (Autumn 2026)',
        content: 'The official timetable for Mid-Term Examinations is released on the exam portal. Students must check their assigned hall ticket and seating hall before 9:00 AM. Carrying college ID card is strictly mandatory.',
        source: 'Exam Cell',
        badge: 'URGENT',
        postedAt: getPastDate(1),
        deadline: getFutureDate(5),
        sourceUrl: 'https://examcell.campusradar.edu/notices/midterm-autumn2026',
        createdBy: facultyUser._id
      },
      {
        title: 'VTOP Course Registration & Credit Audit Deadline for Spring Semester',
        content: 'Course allocation and slot selection for upcoming Spring Semester closes on Friday midnight. Students with pending fee dues must clear them before accessing course selection.',
        source: 'VTOP / Academic Cell',
        badge: 'DEADLINE',
        postedAt: getPastDate(2),
        deadline: getFutureDate(3),
        sourceUrl: 'https://vtop.campusradar.edu/course-reg-2026',
        createdBy: facultyUser._id
      },
      {
        title: 'Placement Registration Mandatory Document Verification Drive',
        content: 'All 2026 batch students registered for upcoming campus placement drives must upload their verified semester marksheets and updated resume on the Career Portal.',
        source: 'Placement Cell',
        badge: 'DEADLINE',
        postedAt: getPastDate(3),
        deadline: getFutureDate(4),
        sourceUrl: 'https://placement.campusradar.edu/doc-verify',
        createdBy: placementUser._id
      },
      {
        title: 'Hostel Hostel Room Re-Allocation & Maintenance Clearance Notice',
        content: 'All resident students are requested to complete room inventory checks and submit maintenance requests via the Warden office desk before 5:00 PM.',
        source: 'Hostel Administration',
        badge: 'HOSTEL',
        postedAt: getPastDate(4),
        deadline: getFutureDate(7),
        sourceUrl: 'https://hostel.campusradar.edu/notices',
        createdBy: facultyUser._id
      },
      {
        title: 'Academic Scholarship & Fee Concession Applications Open',
        content: 'Applications are invited for Merit-cum-Means scholarships for the current academic session. Eligible students with CGPA > 8.5 can apply through the financial aid portal.',
        source: 'Academic Cell',
        badge: 'ACADEMIC',
        postedAt: getPastDate(5),
        deadline: getFutureDate(14),
        sourceUrl: 'https://academics.campusradar.edu/scholarships-2026',
        createdBy: facultyUser._id
      },
      {
        title: 'Revised Guidelines for Project Submissions & Plagiarism Check',
        content: 'All capstone project reports must be submitted along with Turnitin similarity reports (under 15% threshold) signed by respective faculty project guides.',
        source: 'Academic Cell',
        badge: 'ACADEMIC',
        postedAt: getPastDate(6),
        deadline: getFutureDate(10),
        sourceUrl: 'https://academics.campusradar.edu/project-rules',
        createdBy: facultyUser._id
      },
      {
        title: 'Library Extended Hours During Examination Week',
        content: 'Central Library reading halls will remain open 24/7 starting this Monday until the end of mid-term examinations.',
        source: 'Academic Cell',
        badge: 'GENERAL',
        postedAt: getPastDate(7),
        deadline: getFutureDate(12),
        sourceUrl: 'https://library.campusradar.edu/hours',
        createdBy: facultyUser._id
      },
      {
        title: 'Campus Wi-Fi Infrastructure Upgrade & Scheduled Maintenance',
        content: 'Wi-Fi services in Block C & D will undergo scheduled bandwidth maintenance between 1:00 AM and 5:00 AM on Sunday.',
        source: 'IT Support Cell',
        badge: 'GENERAL',
        postedAt: getPastDate(8),
        deadline: getFutureDate(2),
        sourceUrl: 'https://it.campusradar.edu/maintenance',
        createdBy: adminUser._id
      }
    ]);

    console.log('[CampusRadar Seed] SUCCESS! Seeded database with complete realistic exhibition dataset.');
  } catch (error) {
    console.error('[CampusRadar Seed] Error seeding database:', error);
  }
};

if (require.main === module) {
  seedAllData().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = seedAllData;
