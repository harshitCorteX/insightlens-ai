# Design system

Editorial intelligence and calm futurism: warm paper background, restrained violet accents, offset serif emphasis, precise rules, generous spacing, a geometric aperture mark, and product previews made from accessible native elements.

Fonts are self-hosted npm assets: variable DM Sans for the interface and Instrument Serif for editorial moments. No font network call is required at build or runtime. The logo is original inline SVG; no stock/third-party brand assets are included.

Semantic tokens in `src/app/globals.css`: background, three surfaces, foreground, muted/subtle, border, primary/hover, accent-soft/text, success, amber and danger. Dark mode sets its own palette. Forest/Ocean/Amber override just the accent family with separate dark values. Avoid hard-coded text colors outside deliberate static accent swatches.

`src/components/ui` contains source-owned shadcn-style Button/Modal primitives with CVA, Radix Slot/Dialog, and Tailwind utilities. Dialogs provide focus management, description, Escape handling and focus restoration. Native details/summary implements keyboard-accessible claim expansion. Buttons and links have visible focus rings. Application section selectors use button groups with pressed state; inputs have actual labels.

Appearance is controlled by next-themes with system default and no hydration flash. Font/width/spacing/surface preferences live in a versioned validated local store. Both themes and small screens use the same semantic components. Focus Mode's paper/low-glare surfaces are scoped and explicit, never automatic inversion.

The layout adapts at 1200, 1024, 767 and 380 pixels. On mobile, navigation moves to a menu, sidebars disappear, input controls wrap safely, cards become a single column, and analysis sections remain horizontally scrollable without overflowing the document. Motion respects reduced-motion preferences; animation does not delay reading.

Visual inspiration reviewed: [Linear](https://linear.app), [Raycast](https://www.raycast.com), [shadcn/ui](https://ui.shadcn.com). The interface uses original composition rather than copied product assets or invented testimonials.
