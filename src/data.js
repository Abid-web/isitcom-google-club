import ayoubRouatbi from "../assets/Team IGC/Ayoub Rouatbi.webp";
import chaimaKhalfallah from "../assets/Team IGC/Chaima Khalfallah.webp";
import danaChebbi from "../assets/Team IGC/Dana Chebbi.webp";
import emnaSouelmi from "../assets/Team IGC/Emna Souelmi.webp";
import haithemAbid from "../assets/Team IGC/Haithem Abid.webp";
import khaireddineLaadhari from "../assets/Team IGC/Khaireddine Laadhari.webp";
import mariemBaccouche from "../assets/Team IGC/Mariem Baccouche.webp";
import maryemOmri from "../assets/Team IGC/Maryem Omri.webp";
import mohamedAmineBziouech from "../assets/Team IGC/Mohamed Amine Bziouech.webp";
import mohamedKhalilAyadhi from "../assets/Team IGC/Mohamed Khalil Ayadhi.webp";
import safaHmida from "../assets/Team IGC/Safa Hmida.webp";
import salmaGunenna from "../assets/Team IGC/Salma Gunenna.webp";
import sirineGhodhben from "../assets/Team IGC/Sirine Ghodhben.webp";
import tasnimBenTrad from "../assets/Team IGC/Tasnim Ben Trad.webp";
import yosriMeftah from "../assets/Team IGC/Yosri Meftah.webp";

export const mission = "We bring curious students together to learn practical skills, share brave ideas, and create projects that make campus life more connected.";

export const counters = [
  { value: 120, suffix: "+", label: "active members" },
  { value: 18, suffix: "+", label: "workshops delivered" },
  { value: 12, suffix: "+", label: "events each year" },
  { value: 9, suffix: "+", label: "student projects" },
];

export const departments = [
  { act: "Act II · Grow", title: "Technical", color: "#dce9ff", accent: "#4285f4", copy: "Turn questions into working products. Learn by shipping, debugging and sharing what you discover.", chips: ["Web Dev", "Mobile Dev", "AI", "IoT"], visual: "technical" },
  { act: "Act III · Create", title: "Marketing", color: "#ffe1dd", accent: "#ea4335", copy: "Give great ideas a voice and a visual world. Shape stories people want to see, feel and share.", chips: ["UI / UX", "Graphic Design", "Video Editing", "3D"], visual: "marketing" },
  { act: "Act I · Inspire", title: "Communication", color: "#fff0b5", accent: "#fbbc05", copy: "Build the confidence to connect. Speak with clarity, listen with purpose and open doors for others.", chips: ["Soft Skills", "CV / LinkedIn / Portfolio", "Debates"], visual: "communication" },
];

export const team = [
  { initials: "MK", name: "Mohamed Khalil Ayadhi", role: "President", color: "#4285f4", image: mohamedKhalilAyadhi, department: "executive", featured: true },
  { initials: "MB", name: "Mariem Baccouche", role: "Vice President", color: "#34a853", image: mariemBaccouche, department: "executive", featured: true },
  { initials: "DC", name: "Dana Chebbi", role: "HR Manager", color: "#ea4335", image: danaChebbi, department: "executive" },

  { initials: "YM", name: "Yosri Meftah", role: "Tech Manager", color: "#4285f4", image: yosriMeftah, department: "technical" },
  { initials: "AR", name: "Ayoub Rouatbi", role: "Tech Assistant", color: "#4285f4", image: ayoubRouatbi, department: "technical" },
  { initials: "SH", name: "Safa Hmida", role: "Tech Assistant", color: "#4285f4", image: safaHmida, department: "technical" },

  { initials: "KL", name: "Khaireddine Laadhari", role: "Marketing Manager", color: "#ea4335", image: khaireddineLaadhari, department: "marketing-design" },
  { initials: "CK", name: "Chaima Khalfallah", role: "Design Manager", color: "#fbbc05", image: chaimaKhalfallah, department: "marketing-design" },
  { initials: "MO", name: "Maryem Omri", role: "Media Manager", color: "#ea4335", image: maryemOmri, department: "marketing-design" },
  { initials: "ES", name: "Emna Souelmi", role: "Media Assistant", color: "#ea4335", image: emnaSouelmi, department: "marketing-design" },

  { initials: "HA", name: "Haithem Abid", role: "Communication Manager", color: "#fbbc05", image: haithemAbid, department: "communication" },
  { initials: "SG", name: "Sirine Ghodhben", role: "Communication Assistant", color: "#fbbc05", image: sirineGhodhben, department: "communication" },
  { initials: "MA", name: "Mohamed Amine Bziouech", role: "Communication Assistant", color: "#fbbc05", image: mohamedAmineBziouech, department: "communication" },

  { initials: "SG", name: "Salma Gunenna", role: "Event Manager", color: "#34a853", image: salmaGunenna, department: "events-organisation" },
  { initials: "TB", name: "Tasnim Ben Trad", role: "Organisation Manager", color: "#34a853", image: tasnimBenTrad, department: "events-organisation" },
];

export const events = [
  { type: "upcoming", date: "08 Nov · 10:00", title: "Build Your First AI Agent", tag: "Workshop", desc: "A practical, beginner-friendly sprint from prompt to prototype.", art: "AI", color: "#a8c7fa" },
  { type: "upcoming", date: "22 Nov · 14:00", title: "Design Systems Jam", tag: "Studio", desc: "Turn scattered screens into a flexible visual language as a team.", art: "UI", color: "#ffb4ab" },
  { type: "upcoming", date: "06 Dec · 09:00", title: "Campus Build Day", tag: "Hackathon", desc: "One day, mixed teams and one goal: make student life better.", art: "01", color: "#a8dab5" },
  { type: "past", date: "18 Sep", title: "Welcome Day 2026", tag: "Community", desc: "New faces, new ideas and the first sparks of this year’s journey.", art: "HI", color: "#ffe083" },
  { type: "past", date: "04 Oct", title: "Git & GitHub Essentials", tag: "Workshop", desc: "Our hands-on introduction to collaborative development workflows.", art: "</>", color: "#a8c7fa" },
  { type: "past", date: "12 Oct", title: "Speak So Ideas Travel", tag: "Talk", desc: "A communication lab built around confidence, clarity and feedback.", art: "//", color: "#ffe083" },
];

export const gallery = [
  ["Build night", "linear-gradient(135deg,#4285f4,#102f68)"], ["Workshop energy", "linear-gradient(135deg,#ea4335,#7a1710)"], ["Ideas in motion", "linear-gradient(135deg,#fbbc05,#9b7200)"], ["Team moments", "linear-gradient(135deg,#34a853,#0b5520)"], ["On the stage", "linear-gradient(135deg,#8b5cf6,#33205e)"], ["Ship together", "linear-gradient(135deg,#14b8a6,#064e47)"],
];
