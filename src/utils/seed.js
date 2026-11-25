import bcrypt from "bcryptjs";
import { hashPassword } from "better-auth/crypto";
import { ObjectId } from "mongodb";

const DEMO_PASSWORD = "Password123!";
const ADMIN_PASSWORD = "Admin12345!";

const admin = {
  name: "MentorLagbe Admin",
  email: "admin@mentorlagbe.com",
  role: "admin",
  plan: "free",
  phone: "+8801700000000",
  bio: "Platform administrator for MentorLagbe.",
  image: "",
};

const tutors = [
  {
    name: "Rahim Hasan",
    email: "rahim.tutor@example.com",
    role: "tutor",
    plan: "pro",
    phone: "+8801711000001",
    bio: "Mathematics and physics mentor with eight years of classroom experience.",
    image: "https://ui-avatars.com/api/?name=Rahim+Hasan&background=1f4d3a&color=ffffff",
  },
  {
    name: "Nusrat Jahan",
    email: "nusrat.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000002",
    bio: "IELTS and English communication coach for school and adult learners.",
    image: "https://ui-avatars.com/api/?name=Nusrat+Jahan&background=1f4d3a&color=ffffff",
  },
  {
    name: "Tanvir Ahmed",
    email: "tanvir.tutor@example.com",
    role: "tutor",
    plan: "pro",
    phone: "+8801711000003",
    bio: "Full-stack developer teaching JavaScript, React, and Python through projects.",
    image: "https://ui-avatars.com/api/?name=Tanvir+Ahmed&background=1f4d3a&color=ffffff",
  },
  {
    name: "Farhana Islam",
    email: "farhana.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000004",
    bio: "Chemistry and biology mentor focused on HSC and admission preparation.",
    image: "https://ui-avatars.com/api/?name=Farhana+Islam&background=1f4d3a&color=ffffff",
  },
  {
    name: "Imran Kabir",
    email: "imran.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000005",
    bio: "Accounting and business studies tutor for Class 9–12 learners.",
    image: "https://ui-avatars.com/api/?name=Imran+Kabir&background=1f4d3a&color=ffffff",
  },
  {
    name: "Sadia Rahman",
    email: "sadia.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000006",
    bio: "Bangla literature and general science mentor for young learners.",
    image: "https://ui-avatars.com/api/?name=Sadia+Rahman&background=1f4d3a&color=ffffff",
  },
  {
    name: "Mehedi Hasan",
    email: "mehedi.tutor@example.com",
    role: "tutor",
    plan: "pro",
    phone: "+8801711000007",
    bio: "Physics and admission math mentor who turns hard problems into simple steps.",
    image: "https://ui-avatars.com/api/?name=Mehedi+Hasan&background=1f4d3a&color=ffffff",
  },
  {
    name: "Nadia Sultana",
    email: "nadia.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000008",
    bio: "English and IELTS coach focused on confident speaking and clear writing.",
    image: "https://ui-avatars.com/api/?name=Nadia+Sultana&background=1f4d3a&color=ffffff",
  },
  {
    name: "Sajid Karim",
    email: "sajid.tutor@example.com",
    role: "tutor",
    plan: "pro",
    phone: "+8801711000009",
    bio: "Python and data mentor helping beginners build real projects with confidence.",
    image: "https://ui-avatars.com/api/?name=Sajid+Karim&background=1f4d3a&color=ffffff",
  },
  {
    name: "Tania Islam",
    email: "tania.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000010",
    bio: "Chemistry and biology tutor with a calm, diagram-first teaching style.",
    image: "https://ui-avatars.com/api/?name=Tania+Islam&background=1f4d3a&color=ffffff",
  },
  {
    name: "Omar Faruk",
    email: "omar.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000011",
    bio: "Admission physics specialist who teaches speed, accuracy, and exam strategy.",
    image: "https://ui-avatars.com/api/?name=Omar+Faruk&background=1f4d3a&color=ffffff",
  },
  {
    name: "Maliha Noor",
    email: "maliha.tutor@example.com",
    role: "tutor",
    plan: "free",
    phone: "+8801711000012",
    bio: "Creative writing mentor for young readers who want to write with confidence.",
    image: "https://ui-avatars.com/api/?name=Maliha+Noor&background=1f4d3a&color=ffffff",
  },
];

const students = [
  {
    name: "Ayesha Siddika",
    email: "ayesha.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000001",
    bio: "SSC candidate working on mathematics and science.",
  },
  {
    name: "Mahin Chowdhury",
    email: "mahin.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000002",
    bio: "University student learning web development.",
  },
  {
    name: "Tasnim Akter",
    email: "tasnim.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000003",
    bio: "IELTS candidate preparing for a university application.",
  },
  {
    name: "Rafiul Islam",
    email: "rafiul.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000004",
    bio: "HSC science student looking for regular physics support.",
  },
  {
    name: "Sumaiya Islam",
    email: "sumaiya.student@example.com",
    role: "student",
    plan: "pro",
    phone: "+8801811000005",
    bio: "HSC biology student preparing for the final exam.",
  },
  {
    name: "Nabil Hasan",
    email: "nabil.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000006",
    bio: "Beginner programmer exploring Python.",
  },
  {
    name: "Jannatul Ferdous",
    email: "jannatul.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000007",
    bio: "Class 8 student building stronger English grammar.",
  },
  {
    name: "Fahim Rahman",
    email: "fahim.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000008",
    bio: "SAT candidate preparing for the December exam.",
  },
  {
    name: "Ayesha Rahman",
    email: "ayesha.rahman@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000009",
    bio: "Class 10 student looking for regular math and science support.",
  },
  {
    name: "Rafi Ahmed",
    email: "rafi.ahmed@example.com",
    role: "student",
    plan: "pro",
    phone: "+8801811000010",
    bio: "Self-taught developer building a portfolio for university applications.",
  },
  {
    name: "Nabila Sultana",
    email: "nabila.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000011",
    bio: "HSC biology student preparing for medical admission.",
  },
  {
    name: "Shakib Mahmud",
    email: "shakib.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000012",
    bio: "Class 9 student improving accounting and mathematics.",
  },
  {
    name: "Mim Akter",
    email: "mim.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000013",
    bio: "Class 8 learner who enjoys reading stories and writing poems.",
  },
  {
    name: "Hasibul Hasan",
    email: "hasib.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000014",
    bio: "HSC science student looking for physics and chemistry revision.",
  },
  {
    name: "Samia Kabir",
    email: "samia.student@example.com",
    role: "student",
    plan: "free",
    phone: "+8801811000015",
    bio: "Adult learner working on spoken English for the workplace.",
  },
  {
    name: "Arif Chowdhury",
    email: "arif.student@example.com",
    role: "student",
    plan: "pro",
    phone: "+8801811000016",
    bio: "University student building React projects and preparing for internships.",
  },
];

const tuitions = [
  {
    title: "Higher Math Mastery for SSC",
    subject: "Mathematics",
    classLevel: "SSC",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 4000,
    daysPerWeek: 4,
    tutorEmail: "rahim.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    description:
      "A structured SSC mathematics batch covering algebra, geometry, and exam-style problem solving. Every week includes a short quiz and personal feedback.",
  },
  {
    title: "Physics Problem Solving for HSC",
    subject: "Physics",
    classLevel: "HSC",
    mode: "Offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 5000,
    daysPerWeek: 3,
    tutorEmail: "rahim.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Focused physics coaching for HSC students who want to master mechanics, electricity, and numerical problems. Small groups keep every learner involved.",
  },
  {
    title: "JavaScript & React Bootcamp",
    subject: "Programming",
    classLevel: "University",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 7000,
    daysPerWeek: 3,
    tutorEmail: "tanvir.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    description:
      "Learn modern JavaScript, React, and project workflows by building real applications. Each learner ships a portfolio project and receives code reviews.",
  },
  {
    title: "IELTS Speaking & Writing",
    subject: "IELTS",
    classLevel: "Adult",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 6000,
    daysPerWeek: 4,
    tutorEmail: "nusrat.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Targeted IELTS preparation with weekly speaking simulations, writing feedback, and band-score tracking. Ideal for learners aiming for band 7 or above.",
  },
  {
    title: "Organic Chemistry Made Simple",
    subject: "Chemistry",
    classLevel: "HSC",
    mode: "Offline",
    location: "Mirpur, Dhaka",
    monthlyFee: 4500,
    daysPerWeek: 3,
    tutorEmail: "farhana.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Break down organic chemistry reactions with clear notes, diagrams, and guided practice. The batch is designed for HSC and admission candidates.",
  },
  {
    title: "English Grammar Foundation",
    subject: "English",
    classLevel: "Class 8",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 3000,
    daysPerWeek: 3,
    tutorEmail: "nusrat.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    description:
      "A friendly grammar course for school learners covering tenses, sentence structure, and confident writing. Weekly worksheets keep progress visible.",
  },
  {
    title: "Accounting for Class 9",
    subject: "Accounting",
    classLevel: "Class 9",
    mode: "Offline",
    location: "Uttara, Dhaka",
    monthlyFee: 3500,
    daysPerWeek: 3,
    tutorEmail: "imran.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Understand the accounting cycle, journals, ledgers, and final accounts with practical examples. Regular class tests prepare students for school exams.",
  },
  {
    title: "Bangla Literature Appreciation",
    subject: "Bangla",
    classLevel: "SSC",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 2500,
    daysPerWeek: 2,
    tutorEmail: "sadia.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    description:
      "Explore stories, poems, and essays with guided discussion and exam-focused notes. Learners build both comprehension and writing confidence.",
  },
  {
    title: "Biology Revision for HSC",
    subject: "Biology",
    classLevel: "HSC",
    mode: "Offline",
    location: "Mohammadpur, Dhaka",
    monthlyFee: 4200,
    daysPerWeek: 3,
    tutorEmail: "farhana.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    description:
      "A revision-focused biology batch with diagrams, short notes, and past-paper practice. Perfect for HSC students who want a clear final revision plan.",
  },
  {
    title: "Python for Absolute Beginners",
    subject: "Programming",
    classLevel: "Class 12",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 5000,
    daysPerWeek: 2,
    tutorEmail: "tanvir.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
    description:
      "Start programming from zero with Python. Learn variables, loops, functions, and small projects through friendly, step-by-step lessons.",
  },
  {
    title: "General Science for Class 7",
    subject: "Science",
    classLevel: "Class 7",
    mode: "Offline",
    location: "Bashundhara, Dhaka",
    monthlyFee: 2800,
    daysPerWeek: 3,
    tutorEmail: "sadia.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80",
    description:
      "A hands-on general science class for younger learners. Simple experiments, clear explanations, and regular revision make science feel approachable.",
  },
  {
    title: "SAT Math Intensive",
    subject: "Mathematics",
    classLevel: "SAT",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 8000,
    daysPerWeek: 4,
    tutorEmail: "rahim.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    description:
      "An intensive SAT math program with strategy lessons, timed practice, and personalized error analysis. Built for students targeting a top score.",
  },
  {
    title: "Admission Physics Crash Course",
    subject: "Physics",
    classLevel: "Admission",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 7500,
    daysPerWeek: 4,
    tutorEmail: "omar.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80",
    description:
      "A fast-paced admission physics course with concept refreshers, timed problem sets, and exam-day strategy. Ideal for engineering aspirants.",
  },
  {
    title: "Chemistry Problem Solving Circle",
    subject: "Chemistry",
    classLevel: "Class 9",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 4200,
    daysPerWeek: 2,
    tutorEmail: "tania.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1200&q=80",
    description:
      "Work through tricky chemistry problems together in a small group. Each week focuses on one topic with guided practice and clear notes.",
  },
  {
    title: "Python & Data Thinking for Beginners",
    subject: "Programming",
    classLevel: "University",
    mode: "Offline",
    location: "Banani, Dhaka",
    monthlyFee: 8500,
    daysPerWeek: 2,
    tutorEmail: "sajid.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    description:
      "Learn Python fundamentals through small experiments, practical exercises, and a first data project. No prior programming experience needed.",
  },
  {
    title: "Creative Writing & Reading Circle",
    subject: "English",
    classLevel: "Class 8",
    mode: "Offline",
    location: "Mohammadpur, Dhaka",
    monthlyFee: 4000,
    daysPerWeek: 2,
    tutorEmail: "maliha.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    description:
      "Small, encouraging sessions to help young learners read widely and write with confidence. Includes story prompts and gentle feedback.",
  },
  {
    title: "IELTS Band 7 Writing Lab",
    subject: "IELTS",
    classLevel: "Adult",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 6500,
    daysPerWeek: 3,
    tutorEmail: "nadia.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Focused IELTS writing practice with task-by-task feedback, vocabulary upgrades, and full mock essays under exam timing.",
  },
  {
    title: "HSC Physics Final Revision",
    subject: "Physics",
    classLevel: "HSC",
    mode: "Offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 5500,
    daysPerWeek: 3,
    tutorEmail: "mehedi.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    description:
      "A structured final revision batch covering the HSC physics syllabus with board-style questions and weekly assessments.",
  },
  {
    title: "React Portfolio Project Lab",
    subject: "Programming",
    classLevel: "University",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 9000,
    daysPerWeek: 2,
    tutorEmail: "sajid.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    description:
      "Build three polished React projects with code reviews, deployment guidance, and a portfolio review at the end of the batch.",
  },
  {
    title: "Spoken English Confidence Club",
    subject: "English",
    classLevel: "Adult",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 4800,
    daysPerWeek: 2,
    tutorEmail: "nadia.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    description:
      "Low-pressure conversation practice for adults who want to speak English more confidently at work and in daily life.",
    approvalStatus: "pending",
  },
  {
    title: "Biology Admission Preparation",
    subject: "Biology",
    classLevel: "Admission",
    mode: "Offline",
    location: "Mirpur, Dhaka",
    monthlyFee: 6000,
    daysPerWeek: 3,
    tutorEmail: "tania.tutor@example.com",
    bannerImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    description:
      "Medical admission biology preparation with chapter-wise revision, diagram practice, and timed model tests.",
    approvalStatus: "pending",
  },
];

const applications = [
  {
    tuitionTitle: "Higher Math Mastery for SSC",
    studentEmail: "ayesha.student@example.com",
    status: "accepted",
    preferredSchedule: "Sunday–Tuesday, 6–8 PM",
    studentNote: "I want to strengthen algebra and geometry before the SSC exam.",
    review: { rating: 5, comment: "Rahim sir explains every step clearly. My math confidence has improved a lot." },
  },
  {
    tuitionTitle: "JavaScript & React Bootcamp",
    studentEmail: "mahin.student@example.com",
    status: "accepted",
    preferredSchedule: "Weekends, 10 AM–12 PM",
    studentNote: "I know basic HTML/CSS and want to build projects with React.",
    review: { rating: 5, comment: "The project-based classes made React finally click for me." },
  },
  {
    tuitionTitle: "IELTS Speaking & Writing",
    studentEmail: "tasnim.student@example.com",
    status: "pending",
    preferredSchedule: "Weekday evenings",
    studentNote: "Targeting band 7.5 for a university application.",
  },
  {
    tuitionTitle: "Physics Problem Solving for HSC",
    studentEmail: "rafiul.student@example.com",
    status: "pending",
    preferredSchedule: "Friday and Saturday mornings",
    studentNote: "I need help with mechanics and electricity numericals.",
  },
  {
    tuitionTitle: "Biology Revision for HSC",
    studentEmail: "sumaiya.student@example.com",
    status: "accepted",
    preferredSchedule: "Sunday, Tuesday, Thursday",
    studentNote: "Focused revision for the HSC final exam.",
    review: { rating: 5, comment: "The diagrams and revision notes are excellent." },
  },
  {
    tuitionTitle: "Python for Absolute Beginners",
    studentEmail: "nabil.student@example.com",
    status: "rejected",
    preferredSchedule: "Weeknights after 8 PM",
    studentNote: "I am completely new to programming.",
  },
  {
    tuitionTitle: "English Grammar Foundation",
    studentEmail: "jannatul.student@example.com",
    status: "accepted",
    preferredSchedule: "Monday and Wednesday, 5–6 PM",
    studentNote: "I want to improve my writing and grammar basics.",
    review: { rating: 4, comment: "Very patient and easy to follow." },
  },
  {
    tuitionTitle: "SAT Math Intensive",
    studentEmail: "fahim.student@example.com",
    status: "pending",
    preferredSchedule: "Weekends, 4–6 PM",
    studentNote: "Preparing for the SAT in December.",
  },
  {
    tuitionTitle: "Organic Chemistry Made Simple",
    studentEmail: "ayesha.student@example.com",
    status: "pending",
    preferredSchedule: "Tuesday and Thursday, 7–9 PM",
    studentNote: "Organic chemistry reactions are confusing for me.",
  },
  {
    tuitionTitle: "Accounting for Class 9",
    studentEmail: "mahin.student@example.com",
    status: "rejected",
    preferredSchedule: "Saturday, 9–11 AM",
    studentNote: "I need help with the accounting cycle.",
  },
  {
    tuitionTitle: "Bangla Literature Appreciation",
    studentEmail: "tasnim.student@example.com",
    status: "accepted",
    preferredSchedule: "Sunday, 4–6 PM",
    studentNote: "I want to enjoy the stories and poems more deeply.",
    review: { rating: 5, comment: "Sadia apu makes literature feel alive." },
  },
  {
    tuitionTitle: "General Science for Class 7",
    studentEmail: "rafiul.student@example.com",
    status: "pending",
    preferredSchedule: "Friday, 10 AM–12 PM",
    studentNote: "My younger brother needs science support.",
  },
  {
    tuitionTitle: "Admission Physics Crash Course",
    studentEmail: "ayesha.rahman@example.com",
    status: "accepted",
    preferredSchedule: "Weekday evenings, 7–9 PM",
    studentNote: "I am preparing for the engineering admission test.",
    review: { rating: 5, comment: "Omar sir's timed problem sets made a huge difference." },
  },
  {
    tuitionTitle: "Python & Data Thinking for Beginners",
    studentEmail: "rafi.ahmed@example.com",
    status: "accepted",
    preferredSchedule: "Saturday and Sunday, 10 AM–12 PM",
    studentNote: "I want to build a first data project for my portfolio.",
    review: { rating: 5, comment: "Sajid sir explains programming without making it scary." },
  },
  {
    tuitionTitle: "IELTS Band 7 Writing Lab",
    studentEmail: "nabila.student@example.com",
    status: "pending",
    preferredSchedule: "Weeknights after 8 PM",
    studentNote: "I need writing feedback before my IELTS test next month.",
  },
  {
    tuitionTitle: "SAT Math Intensive",
    studentEmail: "shakib.student@example.com",
    status: "pending",
    preferredSchedule: "Weekends, 4–6 PM",
    studentNote: "I want to improve my SAT math score by at least 100 points.",
  },
  {
    tuitionTitle: "Creative Writing & Reading Circle",
    studentEmail: "mim.student@example.com",
    status: "accepted",
    preferredSchedule: "Monday and Wednesday, 5–6 PM",
    studentNote: "I love writing stories and want honest feedback.",
    review: { rating: 5, comment: "Maliha apu makes every story feel worth telling." },
  },
  {
    tuitionTitle: "Chemistry Problem Solving Circle",
    studentEmail: "hasib.student@example.com",
    status: "pending",
    preferredSchedule: "Tuesday and Thursday, 6–7 PM",
    studentNote: "I need help with chemical equations and numerical problems.",
  },
  {
    tuitionTitle: "HSC Physics Final Revision",
    studentEmail: "samia.student@example.com",
    status: "rejected",
    preferredSchedule: "Friday, 9–11 AM",
    studentNote: "I am looking for a fast revision before the final exam.",
  },
  {
    tuitionTitle: "React Portfolio Project Lab",
    studentEmail: "arif.student@example.com",
    status: "accepted",
    preferredSchedule: "Weekends, 2–4 PM",
    studentNote: "I want to finish a portfolio before internship applications.",
    review: { rating: 5, comment: "The code reviews were detailed and genuinely useful." },
  },
  {
    tuitionTitle: "English Grammar Foundation",
    studentEmail: "ayesha.rahman@example.com",
    status: "pending",
    preferredSchedule: "Sunday and Tuesday, 5–6 PM",
    studentNote: "I want to improve my grammar for school exams.",
  },
  {
    tuitionTitle: "JavaScript & React Bootcamp",
    studentEmail: "rafi.ahmed@example.com",
    status: "accepted",
    preferredSchedule: "Saturday, 10 AM–12 PM",
    studentNote: "I know the basics and want to build a full project.",
    review: { rating: 4, comment: "Great project-based classes with clear explanations." },
  },
  {
    tuitionTitle: "Biology Revision for HSC",
    studentEmail: "nabila.student@example.com",
    status: "pending",
    preferredSchedule: "Sunday, Tuesday, Thursday",
    studentNote: "I want a structured revision plan for HSC biology.",
  },
  {
    tuitionTitle: "Accounting for Class 9",
    studentEmail: "shakib.student@example.com",
    status: "rejected",
    preferredSchedule: "Saturday, 9–11 AM",
    studentNote: "I am struggling with journals and ledgers.",
  },
  {
    tuitionTitle: "Physics Problem Solving for HSC",
    studentEmail: "hasib.student@example.com",
    status: "accepted",
    preferredSchedule: "Friday and Saturday, 8–10 AM",
    studentNote: "I need help with mechanics and electricity numericals.",
    review: { rating: 5, comment: "Rahim sir's worked examples are incredibly clear." },
  },
  {
    tuitionTitle: "Bangla Literature Appreciation",
    studentEmail: "samia.student@example.com",
    status: "pending",
    preferredSchedule: "Sunday, 4–6 PM",
    studentNote: "I want to enjoy the stories and poems more deeply.",
  },
  {
    tuitionTitle: "Python for Absolute Beginners",
    studentEmail: "arif.student@example.com",
    status: "accepted",
    preferredSchedule: "Weeknights after 8 PM",
    studentNote: "I want a gentle introduction before building bigger projects.",
    review: { rating: 4, comment: "A friendly start to programming with useful exercises." },
  },
];

const payments = [
  {
    userEmail: "rahim.tutor@example.com",
    userRole: "tutor",
    planName: "Pro Tutor",
    amount: 15,
    stripeSessionId: "seed_session_tutor_rahim",
    transactionId: "seed_txn_tutor_rahim",
    paidAt: new Date(Date.now() - 20 * 86400000),
  },
  {
    userEmail: "tanvir.tutor@example.com",
    userRole: "tutor",
    planName: "Pro Tutor",
    amount: 15,
    stripeSessionId: "seed_session_tutor_tanvir",
    transactionId: "seed_txn_tutor_tanvir",
    paidAt: new Date(Date.now() - 14 * 86400000),
  },
  {
    userEmail: "sumaiya.student@example.com",
    userRole: "student",
    planName: "Pro Student",
    amount: 10,
    stripeSessionId: "seed_session_student_sumaiya",
    transactionId: "seed_txn_student_sumaiya",
    paidAt: new Date(Date.now() - 7 * 86400000),
  },
  {
    userEmail: "mehedi.tutor@example.com",
    userRole: "tutor",
    planName: "Pro Tutor",
    amount: 15,
    stripeSessionId: "seed_session_tutor_mehedi",
    transactionId: "seed_txn_tutor_mehedi",
    paidAt: new Date(Date.now() - 11 * 86400000),
  },
  {
    userEmail: "sajid.tutor@example.com",
    userRole: "tutor",
    planName: "Pro Tutor",
    amount: 15,
    stripeSessionId: "seed_session_tutor_sajid",
    transactionId: "seed_txn_tutor_sajid",
    paidAt: new Date(Date.now() - 6 * 86400000),
  },
  {
    userEmail: "rafi.ahmed@example.com",
    userRole: "student",
    planName: "Pro Student",
    amount: 10,
    stripeSessionId: "seed_session_student_rafi",
    transactionId: "seed_txn_student_rafi",
    paidAt: new Date(Date.now() - 4 * 86400000),
  },
  {
    userEmail: "arif.student@example.com",
    userRole: "student",
    planName: "Pro Student",
    amount: 10,
    stripeSessionId: "seed_session_student_arif",
    transactionId: "seed_txn_student_arif",
    paidAt: new Date(Date.now() - 2 * 86400000),
  },
];

const bookmarks = {
  "ayesha.rahman@example.com": [
    "Higher Math Mastery for SSC",
    "Physics Problem Solving for HSC",
    "IELTS Speaking & Writing",
  ],
  "rafi.ahmed@example.com": [
    "JavaScript & React Bootcamp",
    "Python for Absolute Beginners",
    "SAT Math Intensive",
    "React Portfolio Project Lab",
    "Admission Physics Crash Course",
  ],
  "nabila.student@example.com": [
    "Biology Revision for HSC",
    "Organic Chemistry Made Simple",
  ],
  "mim.student@example.com": [
    "Creative Writing & Reading Circle",
    "English Grammar Foundation",
  ],
  "hasib.student@example.com": [
    "Physics Problem Solving for HSC",
    "Chemistry Problem Solving Circle",
  ],
};

async function upsertAuthUser(authUsers, authAccounts, authSessions, person, passwordHash) {
  let existing = await authUsers.findOne({ email: person.email });
  const now = new Date();

  // Earlier seeds stored Better Auth ids as strings. The MongoDB adapter
  // converts id references to ObjectId, so migrate those demo records once.
  if (existing && !(existing._id instanceof ObjectId)) {
    await Promise.all([
      authAccounts.deleteMany({ userId: existing._id }),
      authSessions.deleteMany({ userId: existing._id }),
    ]);
    await authUsers.deleteOne({ _id: existing._id });
    existing = null;
  }

  let userId = existing?._id;

  if (!existing) {
    userId = new ObjectId();
    await authUsers.insertOne({
      _id: userId,
      name: person.name,
      email: person.email,
      emailVerified: true,
      image: person.image || "",
      createdAt: now,
      updatedAt: now,
      role: person.role,
      plan: person.plan,
      savedTuitions: [],
    });
  } else {
    await authUsers.updateOne(
      { _id: userId },
      {
        $set: {
          name: person.name,
          role: person.role,
          plan: person.plan,
          image: person.image || "",
          updatedAt: now,
        },
      },
    );
  }

  const account = await authAccounts.findOne({ userId, providerId: "credential" });
  if (!account) {
    await authAccounts.insertOne({
      _id: new ObjectId(),
      accountId: userId.toString(),
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await authAccounts.updateOne(
      { _id: account._id },
      {
        $set: {
          accountId: userId.toString(),
          password: passwordHash,
          updatedAt: now,
        },
      },
    );
  }

  return userId;
}

async function upsertExpressUser(users, person, passwordHash) {
  const existing = await users.findOne({ email: person.email });
  const update = {
    name: person.name,
    role: person.role,
    plan: person.plan,
    phone: person.phone || "",
    bio: person.bio || "",
    image: person.image || "",
    updatedAt: new Date(),
  };
  if (!existing) update.password = passwordHash;

  await users.updateOne(
    { email: person.email },
    {
      $set: update,
      $setOnInsert: {
        email: person.email,
        savedTuitions: [],
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export async function seedDemoData(db, collections) {
  const authUsers = db.collection("user");
  const authAccounts = db.collection("account");
  const authSessions = db.collection("session");
  const demoAuthHash = await hashPassword(DEMO_PASSWORD);
  const demoBcryptHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const adminAuthHash = await hashPassword(ADMIN_PASSWORD);
  const adminBcryptHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const people = [admin, ...tutors, ...students];
  for (const person of people) {
    const isAdmin = person.role === "admin";
    await upsertAuthUser(
      authUsers,
      authAccounts,
      authSessions,
      person,
      isAdmin ? adminAuthHash : demoAuthHash,
    );
    await upsertExpressUser(collections.users, person, isAdmin ? adminBcryptHash : demoBcryptHash);
  }

  await collections.users.updateOne(
    { email: admin.email },
    { $set: { password: adminBcryptHash, role: "admin", plan: "free" } },
  );

  const tuitionIds = new Map();
  for (const [index, tuition] of tuitions.entries()) {
    const tutor = tutors.find((person) => person.email === tuition.tutorEmail);
    const doc = {
      ...tuition,
      tutorName: tutor?.name || tuition.tutorEmail,
      approvalStatus: tuition.approvalStatus || "approved",
      isActive: tuition.isActive ?? true,
      createdAt: new Date(Date.now() - index * 86400000),
      reviews: [],
    };
    await collections.tuitions.updateOne(
      { title: tuition.title, tutorEmail: tuition.tutorEmail },
      { $setOnInsert: doc },
      { upsert: true },
    );
    const saved = await collections.tuitions.findOne({
      title: tuition.title,
      tutorEmail: tuition.tutorEmail,
    });
    if (saved) tuitionIds.set(tuition.title, saved._id);
  }

  for (const [email, titles] of Object.entries(bookmarks)) {
    const savedIds = titles
      .map((title) => tuitionIds.get(title))
      .filter(Boolean)
      .map(String);
    if (!savedIds.length) continue;
    await Promise.all([
      collections.users.updateOne(
        { email },
        { $addToSet: { savedTuitions: { $each: savedIds } } },
      ),
      authUsers.updateOne(
        { email },
        { $addToSet: { savedTuitions: { $each: savedIds } } },
      ),
    ]);
  }

  for (const [index, application] of applications.entries()) {
    const tuitionId = tuitionIds.get(application.tuitionTitle);
    const tuition = tuitions.find((item) => item.title === application.tuitionTitle);
    const student = students.find((item) => item.email === application.studentEmail);
    if (!tuitionId || !tuition || !student) continue;
    const doc = {
      tuitionId: tuitionId.toString(),
      tuitionTitle: tuition.title,
      subject: tuition.subject,
      monthlyFee: tuition.monthlyFee,
      tutorEmail: tuition.tutorEmail,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      preferredSchedule: application.preferredSchedule,
      studentNote: application.studentNote,
      status: application.status,
      appliedAt: new Date(Date.now() - index * 2 * 86400000),
    };
    await collections.applications.updateOne(
      { tuitionId: doc.tuitionId, studentEmail: doc.studentEmail },
      { $setOnInsert: doc },
      { upsert: true },
    );

    if (application.review) {
      await collections.tuitions.updateOne(
        { _id: tuitionId, "reviews.studentEmail": { $ne: student.email } },
        {
          $push: {
            reviews: {
              studentName: student.name,
              studentEmail: student.email,
              rating: application.review.rating,
              comment: application.review.comment,
              createdAt: new Date(),
            },
          },
        },
      );
    }
  }

  for (const payment of payments) {
    const person = people.find((item) => item.email === payment.userEmail);
    await collections.payments.updateOne(
      { stripeSessionId: payment.stripeSessionId },
      {
        $setOnInsert: {
          userEmail: payment.userEmail,
          userName: person?.name || payment.userEmail,
          userRole: payment.userRole,
          planName: payment.planName,
          amount: payment.amount,
          currency: "USD",
          transactionId: payment.transactionId,
          stripeSessionId: payment.stripeSessionId,
          paymentStatus: "paid",
          paidAt: payment.paidAt,
        },
      },
      { upsert: true },
    );
  }

  return {
    message: "Demo data seeded.",
    users: people.length,
    students: students.length,
    tutors: tutors.length,
    admins: 1,
    tuitions: tuitions.length,
    applications: applications.length,
    payments: payments.length,
    bookmarkedStudents: Object.keys(bookmarks).length,
  };
}
