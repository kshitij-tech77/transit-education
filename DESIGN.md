---
name: Transit Education
description: Nepal's most trusted study-abroad consultancy — ambitious, modern, empowering.
colors:
  passport-red: "#A93226"
  passport-red-deep: "#7E2219"
  brand-blush: "#F5E8E7"
  brand-petal: "#FEF2F1"
  editorial-black: "#111111"
  pure-white: "#FFFFFF"
  warm-canvas: "#FAFAF8"
  parchment: "#F3F3F1"
  warm-border: "#E5E4E0"
  warm-mid: "#9A9895"
  warm-muted: "#6B6966"
  alert-red: "#EF4444"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "8px"
  base: "10px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  4xl: "26px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  3xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.passport-red}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.base}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.passport-red-deep}"
    textColor: "{colors.pure-white}"
  button-secondary:
    backgroundColor: "{colors.brand-blush}"
    textColor: "{colors.passport-red}"
    rounded: "{rounded.base}"
    padding: "12px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.passport-red}"
    rounded: "{rounded.base}"
    padding: "12px 28px"
  card:
    backgroundColor: "{colors.pure-white}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.editorial-black}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
---

# Design System: Transit Education

## 1. Overview

**Creative North Star: "The Trusted Guide"**

Transit Education's design system is built around one truth: the students who walk in are making a life-changing decision, often for the first time, and they need to feel both inspired and safe. The system is warm but expert — like a knowledgeable friend who has navigated this journey before and walks beside you through every step. It is not a brochure, not a form, and not a corporate portal. It is a guide.

Crimson Passport Red is the system's authority signal. It appears purposefully — on headings, interactive elements, and navigation — never as decoration. White space does the heavy lifting; the palette is deliberately restrained so that when red appears, it carries full weight. The warm neutral scale (off-white canvas, parchment, warm borders) keeps the experience from feeling clinical, grounding it in approachability without softening the brand's confidence.

Typography is set in Poppins — a geometric humanist sans with warmth in the curves and authority in the weight. Headlines are tight, bold, and confident. Body copy breathes at 1.7 line height, comfortable for first-language-Nepali readers working through information-dense destination guides. Motion is choreographed but purposeful: slide-up entrances, fade transitions, and marquee components reinforce energy without creating noise.

**This system explicitly rejects:** generic clipart and stock photo ed-tech aesthetics, rainbow or multi-accent color schemes, cluttered information grids, low-contrast text on busy backgrounds, and any layout that looks like a government form or a 2012 consultancy brochure.

**Key Characteristics:**
- Restrained crimson authority — one primary accent, used with intent
- Warm white canvas — off-white backgrounds, not stark white, for approachability
- Confident Poppins type — tight letter-spacing on headlines, comfortable body leading
- Choreographed motion — slide-up and fade transitions; never gratuitous
- Premium proportions — generous padding, refined radius scale, polished hover states

---

## 2. Colors: The Passport Palette

A warm two-role palette: Passport Red as the single authority accent, layered over a warm neutral scale. No secondary or tertiary accents; the restraint is the point.

### Primary
- **Passport Red** (`#A93226`): The brand's authority signal. Used on primary buttons, active navigation links, section headings, bullet markers, blockquote borders, and interactive focus rings. Never used as a background fill at full opacity on large surfaces.
- **Passport Red Deep** (`#7E2219`): The hover state and pressed state for Passport Red elements. Communicates depth without introducing a new hue.

### Secondary
- **Brand Blush** (`#F5E8E7`): Low-tint background for secondary buttons, tags, and highlighted callout sections. Pairs with Passport Red text to create a branded but soft container.
- **Brand Petal** (`#FEF2F1`): Even lighter tint; used for blockquote backgrounds, icon container backgrounds, and hover surfaces in the CMS admin. Signals "this is branded territory" without visual noise.

### Neutral
- **Editorial Black** (`#111111`): Primary text color. Near-black, not pure black — intentionally warm.
- **Pure White** (`#FFFFFF`): Card surfaces, modal backgrounds, input fields.
- **Warm Canvas** (`#FAFAF8`): Page background. Slightly warmer than white; eliminates the stark clinical feel of a pure-white page.
- **Parchment** (`#F3F3F1`): Dividers, table headers, muted section backgrounds.
- **Warm Border** (`#E5E4E0`): Border and input stroke color. Warm-toned to match the overall palette temperature.
- **Warm Mid** (`#9A9895`): Placeholder text, disabled states, metadata timestamps.
- **Warm Muted** (`#6B6966`): Secondary body text, captions, sub-labels.

### Alert
- **Alert Red** (`#EF4444`): Destructive actions and error states only. Never used decoratively.

### Named Rules
**The One Accent Rule.** Passport Red is the only accent. It appears on ≤15% of any given screen. Its rarity is what makes it feel like authority rather than noise. If everything is red, nothing is.

**The Warm Temperature Rule.** Every neutral — backgrounds, borders, text — pulls slightly warm. `#F3F3F1` not `#F3F3F3`. `#111111` not `#000000`. This is deliberate: the system should feel approachable, not sterile.

---

## 3. Typography: Poppins — The Humanist Authority

**Display / Body Font:** Poppins (Google Fonts), `system-ui, sans-serif` fallback  
**Mono Font:** Geist Mono, `ui-monospace, 'Cascadia Code', monospace` fallback (code blocks only)

**Character:** Poppins combines geometric structure with humanist warmth — assertive at heavy weights, readable at light ones. Headlines are tight and confident. Body text breathes wide. The single-family system creates cohesion; the weight range (400 → 800) provides all the hierarchy needed.

### Hierarchy
- **Display** (800, `clamp(2.5rem, 6vw, 4rem)`, 1.1 line-height, -0.02em): Hero headlines, country destination titles. Maximum 2 lines. Letter-spacing pulled tight to signal editorial confidence.
- **Headline** (700, `clamp(1.75rem, 4vw, 2.5rem)`, 1.2 line-height, -0.02em): Section titles, page h1 on interior pages. The workhorse heading level.
- **Title** (600, `1.25rem`, 1.35 line-height, -0.01em): Card titles, service names, table subheadings, sidebar section labels.
- **Body** (400, `1rem` / `1.0625rem` for blog, 1.7 line-height): All long-form text. Blog content uses 1.0625rem for comfortable reading. Max line length 65–75ch.
- **Label** (500, `0.875rem`, 1.4 line-height, 0.01em): Navigation links, button text, form labels, metadata, tags. Slightly tracked out at small sizes.

### Named Rules
**The No-Uppercase Rule.** Button and navigation labels are sentence case or title case, never ALL-CAPS. This is a study-abroad consultancy, not a luxury fashion brand. All-caps at this scale reads as shouting, not authority.

**The Heading Weight Rule.** Headings use weight (700–800) for hierarchy, not size alone. A 1.25rem Title at 600 weight reads as clearly subordinate to a 2.5rem Headline at 700. Don't compensate for weak hierarchy by inflating sizes.

---

## 4. Elevation

Transit Education uses a **flat-by-default, shadow-on-state** strategy. Resting surfaces are flat — differentiated by background color (white card on warm-canvas page), not by shadow. Shadows appear as a response to interaction (hover lift) or structural need (sticky navigation separation).

This matches the "polished and premium" component feel: shadows are earned by context, not applied uniformly. The warm neutral palette already creates visual layering through tonal contrast; shadows reinforce without doubling.

### Shadow Vocabulary
- **Ambient Lift** (`0 4px 24px rgba(0, 0, 0, 0.08)`): Card hover state. A soft, wide shadow that reads as gentle elevation rather than depth. Used on destination cards, blog post cards on hover.
- **Image Shadow** (`0 4px 24px rgba(0, 0, 0, 0.08)`): Blog content images. Same value as Ambient Lift — visual consistency between images and hovered cards.
- **Navigation Shadow** (subtle bottom border + background blur if sticky): Sticky nav separation from page content. Uses the Warm Border color as a rule rather than a shadow when possible.

### Named Rules
**The Flat-at-Rest Rule.** Surfaces carry no shadow by default. Shadow appears only on hover or when structural separation is required (sticky overlapping). A shadow on a resting card is visual noise, not premium polish.

---

## 5. Components

Polished and premium: refined proportions, deliberate transitions, strong resting state that earns the hover. No gratuitous shadows, no oversized radii, no excessive motion.

### Buttons
- **Shape:** Gently curved corners (10px base radius — `--radius-lg`)
- **Primary:** Passport Red fill (`#A93226`), white label (500 weight, 0.875rem), 12px vertical / 28px horizontal padding. Transition: `background 0.2s ease, transform 0.15s ease`.
- **Hover / Focus:** Deep Passport Red fill (`#7E2219`), no transform by default — lift is reserved for cards, not buttons. Focus-visible: 2px ring in Passport Red at 50% opacity, 2px offset.
- **Secondary:** Brand Blush fill (`#F5E8E7`), Passport Red label. Same geometry. Used for lower-priority actions alongside a Primary.
- **Ghost:** Transparent fill, Passport Red label, 1px Passport Red border. Used in contexts where a background would compete (e.g. hero section on colored background).
- **Disabled:** 50% opacity, pointer-events none. No style overrides needed beyond opacity.

### Cards / Containers
- **Corner Style:** Extra-large curves — `--radius-xl` (14px) for content cards, `--radius-2xl` (18px) for featured/hero cards.
- **Background:** Pure White on Warm Canvas page background. Parchment (`#F3F3F1`) for muted/secondary cards.
- **Shadow Strategy:** Flat at rest. Ambient Lift shadow on hover. See Elevation.
- **Border:** None by default; Warm Border (`#E5E4E0`) stroke (1px) on input containers and table cells only.
- **Internal Padding:** 24px (`--spacing-lg`) standard; 32px for featured cards.

### Inputs / Fields
- **Style:** Pure White fill, 1px Warm Border stroke, 10px base radius, 12px/16px internal padding (vertical/horizontal).
- **Focus:** Passport Red ring — `outline: 2px solid #A93226; outline-offset: 0`. No glow, no box-shadow; clean and direct.
- **Error:** Alert Red (`#EF4444`) border + error message in Alert Red below the field.
- **Disabled:** Parchment fill, Warm Mid text. Communicates clearly without competing with active states.

### Navigation
- **Style:** Poppins label weight (500), 0.875rem. White background (or blur-backdrop on sticky). Logo + primary links + CTA button.
- **Default:** Warm Muted (`#6B6966`) text for secondary links; Editorial Black for active-page link.
- **Hover:** Passport Red text. Transition `color 0.15s ease`.
- **Active/current page:** Passport Red text, or a Passport Red underline (2px, `text-underline-offset: 3px`).
- **Mobile:** Slide-in drawer or stack; same type treatment. Nav links full-width, top-aligned.

### Destination Cards (Signature Component)
The country/destination cards are a signature pattern — they must immediately communicate aspiration and specificity. Each card has: a representative image (rounded-2xl corners), a flag icon, country name in Title weight, a one-line value prop in Body, and a Passport Red CTA link. Cards gain Ambient Lift shadow on hover. The flag icon uses the `flag-icons` package — always rendered at consistent 1.5em height.

### Blog Post Cards
- Thumbnail image (rounded-xl, 16:9 ratio, `object-cover`), publish date in Warm Mid Label, title in Title weight (max 2 lines, line-clamp), excerpt in Warm Muted Body (max 3 lines). Passport Red read-more arrow link at bottom. Hover: Ambient Lift on card, color shift on title to Passport Red.

---

## 6. Do's and Don'ts

### Do:
- **Do** use Passport Red only on interactive and authority elements — buttons, active nav links, heading accents, bullet markers, blockquote borders. Keep it rare; one screen should have at most 15% red coverage.
- **Do** use Warm Canvas (`#FAFAF8`) as the default page background instead of Pure White. The warmth matters.
- **Do** set body copy at 1.7 line-height minimum. Nepali students reading dense destination guides need comfortable leading.
- **Do** use the full radius scale: 10px for interactive elements (buttons, inputs), 14–18px for content cards, 22–26px for featured hero cards.
- **Do** keep button and nav labels in sentence case or title case. Never ALL-CAPS.
- **Do** use Poppins 800 weight for display headlines, pulled tight at -0.02em letter-spacing.
- **Do** apply Ambient Lift shadow only on hover — cards should be flat at rest.
- **Do** cite real specifics in copy: visa approval rates, number of partner universities, destination country names — not generic "we're the best" language.

### Don't:
- **Don't** use generic ed-tech stock photography: diverse students jumping, pointing at laptops, or posed with globes. Use authentic imagery tied to specific destinations.
- **Don't** introduce rainbow or multi-accent color schemes. Passport Red is the only accent. Secondary colors (Brand Blush, Petal) are tints of the primary, not independent hues.
- **Don't** use cluttered information grids, dense bullet-list feature walls, or layouts that feel like a government form or a 2012 consultancy brochure.
- **Don't** use ALL-CAPS for buttons, navigation, or headings. The brand's authority comes from weight and color, not case.
- **Don't** stack shadows — a card with a resting shadow AND a hover shadow is visual noise. Flat at rest, one lift on hover.
- **Don't** use Alert Red (`#EF4444`) decoratively. It is reserved for error states and destructive actions only.
- **Don't** use pure `#000000` black or pure `#FFFFFF` white as backgrounds. The system runs warm: `#111111` for text, `#FAFAF8` for page canvas.
- **Don't** add typefaces beyond Poppins and Geist Mono. Mixing in a serif or a second sans creates visual noise that undermines the "polished and premium" feel.
