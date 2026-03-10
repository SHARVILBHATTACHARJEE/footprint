# Footprint Website Design & Documentation

## Project Vision
Footprint is a futuristic, interactive digital art experience masquerading as a high-end footwear brand. The website is designed to be immersive, cinematic, and technically ambitious, moving away from traditional e-commerce layouts towards an experimental "product lab" aesthetic.

---

## Technical Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: GSAP (GreenSock Animation Platform), Framer Motion
- **Interactive Elements**: Three.js / React Three Fiber (planned for 3D elements)
- **Typography**: Inter & IBM Plex Sans

---

## Core Aesthetics
### Color Palette
- **Deep Slate**: `#0a0a0a` (Main background)
- **Electric Emerald**: `rgba(0, 255, 136, 0.8)` (Accents & Highlights)
- **Glass White**: `rgba(255, 255, 255, 0.05)` (Cards & Containers)
- **Cyber Gray**: `#333333` (Secondary text & borders)

### Typography Scale
- **Display**: `7rem` (Hero section, ultralight/bold mix)
- **Header**: `3.5rem` (Section titles)
- **Body**: `1.125rem` (18px for readability)
- **Mono**: `0.875rem` (Technical data, labels)

---

## Site Structure & Motion Design

### 1. Hero: Kinetic Entrance
- **Interactive Background**: Particle system or noise shader.
- **Motion**: Cinematic reveal of the "Footprint" logo with staggered letter animations.
- **Scroll Hook**: As the user scrolls, the hero content scales down and fades into the background.

### 2. Product Showcase: Orbital Display
- **Concept**: Shoes aren't just displayed in a grid; they orbit the viewer.
- **Interaction**: GSAP-driven horizontal scroll that rotates footwear in 3D space.
- **Hover**: Magnifying glass effect with high-res texture reveal.

### 3. Features: Futuristic Core Visual
- **Visual**: A central "Energy Core" with orbiting geometric rings and pulsing fields.
- **Interaction**: Features list with staggered entrance and number counters. Hovering over list items highlights the central core and shifts the typography.
- **Background**: Dynamic marquee text scrolls across the section with varying speeds and directions, creating layers of cinematic depth.
- **Code**: Framer Motion for SVG path animations, rotation loops, and scroll-triggered reveals.

### 4. FootHealth: The Lab
- **Concept**: Interactive data visualization of foot pressure points.
- **Interaction**: A cursor-following heatmap that simulates step impact.

---

## Global Motion System
### Marquee Animations
- Used for high-energy background textures.
- Speed and direction are varied to create an "industrial lab" atmosphere.
- Fonts are oversized and semi-transparent.

### Parallax & Smoothing
- GSAP's ScrollTrigger is used for complex pinning and progress-driven animations.
- All containers use smooth transition durations (400ms - 800ms) to maintain a premium feel.

---

## Component Guidelines
### Custom Cursor
- A multi-layered cursor that reacts to interactive elements.
- Uses `mix-blend-mode: difference` for high visibility across dark/light sections.

### Grain Overlay
- A subtle, animated noise overlay covering the entire site to give it a cinematic, film-like texture.

### Cinematic Transitions
- Page transitions involve "wiping" the screen with a light-leak effect or a high-contrast geometric mask.

---

## Implementation Status
- [x] Hero Section (Framer Motion + GSAP)
- [x] Custom Cursor (React State + CSS)
- [x] Features Section (Initial structure)
- [x] Grain Overlay (CSS Keyframes)
- [ ] Product 3D Interaction (React Three Fiber)
- [ ] Advanced ScrollTrigger Parallax
- [ ] Responsive Optimization (Mobile-first refactor)

---

## Branding & Tone
- **Keywords**: Precise, Minimalist, Ethereal, Technical.
- **Copywriting**: Should feel like a research paper from the year 2077.
- **Avoid**: Standard "Buy Now" buttons; use "Initialize Acquisition" or "Analyze Fit".
