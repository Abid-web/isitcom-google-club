# Team portraits

The active portraits live in `assets/Team IGC` and are imported at the top of
`src/data.js`. Prefer optimized portrait-oriented `.webp` or `.jpg` files.

Then set the corresponding `image` value in `src/data.js`, for example:

```js
import aminaMansour from "../assets/Team IGC/Amina Mansour.webp";

{
  initials: "AM",
  name: "Amina Mansour",
  role: "President",
  color: "#4285f4",
  image: aminaMansour,
  department: "executive",
  featured: true
}
```

Available department values are `executive`, `technical`, `marketing-design`,
`communication`, and `events-organisation`. Use `featured: true` only when a
card should receive the larger leadership treatment.
