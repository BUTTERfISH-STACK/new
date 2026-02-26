# NOIR & AUREUM - Luxury Clothing Brand Website

## 1. Project Overview

**Project Name:** NOIR & AUREUM (Latin for "Black & Gold")
**Project Type:** Single-page luxury fashion brand website
**Core Functionality:** Showcase high-end clothing collection with immersive visual experience
**Target Users:** Affluent fashion-conscious individuals seeking premium designer wear

---

## 2. UI/UX Specification

### Layout Structure

**Page Sections:**
1. **Navigation Bar** - Fixed, transparent on top, solid black on scroll
2. **Hero Section** - Full viewport cinematic opening with brand statement
3. **Brand Philosophy** - Split layout with imagery and text
4. **Collection Showcase** - Grid of featured pieces with hover effects
5. **Craftsmanship** - Parallax section highlighting artisan details
6. **Newsletter/Contact** - Minimalist signup with gold accents
7. **Footer** - Luxury brand footer with social links

**Responsive Breakpoints:**
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

### Visual Design

**Color Palette:**
- Primary Black: `#0a0a0a` (deepest black)
- Secondary Black: `#141414` (card backgrounds)
- Accent Black: `#1a1a1a` (subtle surfaces)
- Gold Primary: `#c9a962` (luxurious gold)
- Gold Light: `#e8d5a3` (hover states)
- Gold Dark: `#9a7b3a` (borders/shadows)
- Text White: `#ffffff`
- Text Gray: `#888888`
- Text Light Gray: `#555555`

**Typography:**
- Logo/Headlines: `Playfair Display` (serif, elegant)
- Body/UI: `Montserrat` (sans-serif, modern)
- Accent Text: `Cinzel` (classic, luxury feel)

**Font Sizes:**
- Hero Title: 80px (desktop), 48px (mobile)
- Section Titles: 48px (desktop), 32px (mobile)
- Subheadings: 24px
- Body: 16px
- Small/Labels: 12px (uppercase, letter-spacing: 3px)

**Spacing System:**
- Section Padding: 120px vertical (desktop), 60px (mobile)
- Container Max Width: 1400px
- Grid Gap: 30px
- Component Padding: 40px

**Visual Effects:**
- Gold gradient overlays on hover
- Subtle grain texture overlay (CSS noise)
- Smooth parallax scrolling
- Box shadows with gold tint: `0 20px 60px rgba(201, 169, 98, 0.1)`
- Border accents in gold: 1px solid rgba(201, 169, 98, 0.3)

### Components

**Navigation:**
- Logo left-aligned (NOIR & AUREUM in Cinzel)
- Menu items: COLLECTION, ATELIER, JOURNAL, CONTACT
- Gold underline animation on hover
- Hamburger menu on mobile

**Hero Section:**
- Full-screen background with slow-zoom effect
- Video or high-res image of model in black/gold
- Centered text: "Elegance Redefined"
- Scroll indicator with animated arrow

**Collection Cards:**
- Aspect ratio 3:4
- Image with dark overlay on hover
- Gold "VIEW" button appears on hover
- Product name and price in gold text

**Buttons:**
- Primary: Black background, gold border, gold text
- Hover: Gold background, black text
- Transition: 0.4s ease

**Input Fields:**
- Transparent background
- Gold bottom border only
- White text
- Focus: Full gold border with glow

---

## 3. Functionality Specification

### Core Features

1. **Smooth Scroll Navigation** - Click nav items to scroll to sections
2. **Parallax Effects** - Background images move at different speeds
3. **Scroll-triggered Animations** - Elements fade/slide in on scroll
4. **Navigation State Change** - Transparent to solid black on scroll
5. **Image Hover Effects** - Zoom and overlay reveal
6. **Mobile Menu** - Slide-in navigation for mobile
7. **Newsletter Form** - Email validation with success state

### User Interactions

- Scroll to reveal content with staggered animations
- Hover on collection items for interactive preview
- Click navigation for smooth scroll to sections
- Form submission shows success message

### Edge Cases

- Images have fallback background color
- Form validates email format
- Mobile menu closes on link click
- Smooth degradation if animations not supported

---

## 4. Acceptance Criteria

- [ ] Page loads with smooth fade-in animation
- [ ] Navigation becomes solid black after 100px scroll
- [ ] All sections visible with proper black/gold theming
- [ ] Collection grid displays 6 products with hover effects
- [ ] Parallax sections move smoothly on scroll
- [ ] Mobile menu works correctly
- [ ] All text uses specified fonts
- [ ] Gold accents appear on buttons, links, and borders
- [ ] Page feels luxurious and premium
