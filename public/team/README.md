# Team portraits

Place team photos in this folder, preferably as optimized `.webp` or `.jpg` files with a portrait aspect ratio.

Then set the corresponding `image` value in `src/data.js`, for example:

```js
{
  initials: "AM",
  name: "Amina Mansour",
  role: "President",
  color: "#4285f4",
  image: "/team/amina-mansour.webp",
  department: "executive",
  featured: true
}
```

Available department values are `executive`, `technical`, `marketing-design`,
`communication`, and `events-organisation`. Use `featured: true` only when a
card should receive the larger leadership treatment.
