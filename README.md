<div align="center">

<img src="./assets/logo.png" alt="ISITCOM Google Club logo" width="180" />

# ISITCOM GOOGLE CLUB

### Inspire. Grow. Create.

An immersive, scroll-driven website for the ISITCom student tech club.

[Live Demo](#) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## About the project

**ISITCOM Google Club** is a student club at the Higher Institute of Computer Science and Communication Technologies (ISITCom), Hammam Sousse, Tunisia.

This website presents the club, its departments and its team, and invites new students to join. The experience is told as a three-act journey that follows our slogan:

| Act | Theme | Department | Color |
|-----|-------|------------|-------|
| 01 | **Inspire** | Communication | 🟡 Yellow |
| 02 | **Grow** | Technical | 🔵 Blue |
| 03 | **Create** | Marketing | 🔴 Red |

## Features

- Cinematic loader and hero with animated typography
- Smooth scrolling powered by **Lenis**
- Scroll-triggered animations powered by **GSAP + ScrollTrigger**
- Horizontal-scroll departments section (stacked cards on mobile)
- Office team showcase with a hierarchical layout
- Events timeline with upcoming and past filters
- Gallery with a scroll-reactive marquee
- "Join us" form with live validation
- Light / dark theme toggle
- Custom cursor, magnetic buttons and micro-interactions
- Mobile-first, responsive, and `prefers-reduced-motion` friendly

## Departments

**Technical**: Web Development, Mobile Development, AI, IoT

**Marketing**: UI/UX, Graphic Design, Video Editing, 3D

**Communication**: Soft Skills, CV / LinkedIn / Portfolio workshops, Debates

## Tech stack

- HTML5, CSS3, Vanilla JavaScript
- [GSAP](https://gsap.com/) and ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering/)
- Google Fonts

## Getting started

### Option 1: open directly
```bash
git clone https://github.com/<your-username>/isitcom-google-club.git
cd isitcom-google-club
```
Open `index.html` in your browser, or use the **Live Server** extension in VS Code.

### Option 2: with a package manager (if the project has a `package.json`)
```bash
pnpm install
pnpm dev
```
or with npm:
```bash
npm install
npm run dev
```

## Project structure
```
isitcom-google-club/
├── index.html
├── assets/
│   ├── logo.png
│   ├── team/          # office member photos
│   └── gallery/       # event photos
└── README.md
```

## Customization

All editable content lives in the `CONFIG` object at the top of the script:

```js
CONFIG.team        // names, roles, photos, social links
CONFIG.events      // upcoming and past events
CONFIG.departments // descriptions and domains
CONFIG.stats       // counters (members, workshops, events, projects)
```

To add a team photo, put the image in `assets/team/` and set its path in the member's `photo` field.

## Deployment (GitHub Pages)

1. Go to **Settings → Pages**
2. Under **Source**, choose the `main` branch and the `/ (root)` folder
3. Save. Your site will be live at `https://<your-username>.github.io/isitcom-google-club/`

## Brand colors

| Color | Hex |
|-------|-----|
| Blue | `#4285F4` |
| Red | `#EA4335` |
| Yellow | `#FBBC05` |
| Green | `#34A853` |

## Contributing

Contributions from club members are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## Team

Built and maintained by the ISITCOM Google Club office team.

## Disclaimer

This is an independent student club project. It is not officially affiliated with, endorsed by, or sponsored by Google LLC. "Google" and the Google "G" logo are trademarks of Google LLC.

## License

Distributed under the MIT License. See `LICENSE` for details.

## Contact

- Email: your-club-email@example.com
- Instagram: @your_handle
- Facebook: your page
- LinkedIn: your page

<div align="center">

**Inspire. Grow. Create.** 🚀

</div>
