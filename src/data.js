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
import birthdayImage from "../assets/card image/birthday.webp";
import certifiedImage from "../assets/card image/certified.webp";
import collaborationImage from "../assets/card image/collab-meet.webp";
import workshopImage from "../assets/card image/workshop.webp";

export const mission = "We bring curious students together to learn practical skills, share brave ideas, and create projects that make campus life more connected.";

export const counters = [
  { value: 60, suffix: "+", label: "active members" },
  { value: 15, suffix: "+", label: "workshops delivered" },
  { value: 100, suffix: "+", label: "certificats" },
  { value: 2, suffix: "+", label: "collaborations" },
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
  { initials: "CK", name: "Chaima Khalfallah", role: "Design Manager", color: "#ea4335", image: chaimaKhalfallah, department: "marketing-design" },
  { initials: "MO", name: "Maryem Omri", role: "Media Manager", color: "#ea4335", image: maryemOmri, department: "marketing-design" },
  { initials: "ES", name: "Emna Souelmi", role: "Media Assistant", color: "#ea4335", image: emnaSouelmi, department: "marketing-design" },

  { initials: "HA", name: "Haithem Abid", role: "Communication Manager", color: "#fbbc05", image: haithemAbid, department: "communication" },
  { initials: "SG", name: "Sirine Ghodhben", role: "Communication Assistant", color: "#fbbc05", image: sirineGhodhben, department: "communication" },
  { initials: "MA", name: "Mohamed Amine Bziouech", role: "Communication Assistant", color: "#fbbc05", image: mohamedAmineBziouech, department: "communication" },

  { initials: "SG", name: "Salma Gunenna", role: "Event Manager", color: "#34a853", image: salmaGunenna, department: "events-organisation" },
  { initials: "TB", name: "Tasnim Ben Trad", role: "Organisation Manager", color: "#34a853", image: tasnimBenTrad, department: "events-organisation" },
];

export const events = [
  { type: "upcoming", title: "Open Day", tag: "Community", desc: "Team building activities and meetups", art: "HI", color: "#a8c7fa" },
  { type: "upcoming", title: "Interview", tag: "Communication", desc: "Enhance your public speaking and debate skills", art: "//", color: "#ffb4ab" },
  { type: "upcoming", title: "Workshops", tag: "Workshop", desc: "AI / WEB / IOT / Video editing / graphic designing", art: "WORK", color: "#a8dab5" },
  { type: "past", title: "Birthday Party", tag: "Community", desc: "It's our birthday. Come celebrate with us.", art: "BIRTHDAY", color: "#ffe083" },
  { type: "past", title: "Football tournement", tag: "Workshop", desc: "Come and enjoy the tournament with your friends.", art: "</>", color: "#a8c7fa" },
  { type: "past", title: "Hackathon Participation", tag: "hackathon", desc: "We participated in the hackathon and we are proud of ourselves.", art: "//", color: "#ffe083" },
];

export const gallery = [
  { label: "Birthday celebration", image: birthdayImage, alt: "Club members celebrating together" },
  { label: "Certified achievement", image: certifiedImage, alt: "Club members holding their participation certificates" },
  { label: "Collaboration meetup", image: collaborationImage, alt: "Club members meeting together" },
  { label: "Workshop moments", image: workshopImage, alt: "Students attending a club workshop" },
];
