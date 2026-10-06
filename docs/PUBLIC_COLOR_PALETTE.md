# Public palette: Phase 1

This pass changes color declarations only. Public content, geometry, imagery, routes,
referral attribution, and navigation behavior remain unchanged.

## Audit before consolidation

Shared tokens: background #F7F7F5, surface #FFFFFF, foreground #181817,
muted #686864, subtle #8B8B85, border #DEDED9, strong border #C8C8C1,
accent #184F3B, soft accent #E9F0EC.

The existing accent was already deep green. The inconsistency came from multiple
independent green families: focus #26745A, CTA hover #123D2E, availability #398061,
Care positive text #25612F / #245D2D / #345A3A, software status #2F5D49,
and editorial markers #144735. Pale colors included #EAF5EB,
#F3FAF3, #EDF8EE, #DCEEDE, #CDE2CF, #B9DABB, #EDF2EF, #C9D3CC,
#EEF4F0, #CBD9D0, and #B9C9BF. Home Care used #FAFBF8.

Most eyebrows, selected filters, active navigation, and links already consume
accent/soft-accent tokens. Some green CTAs also consumed accent, mixing text and
solid-action roles. Neutral primary CTAs remain intentionally neutral.

## Semantic tokens

| Token | Before | After | Role |
| --- | --- | --- | --- |
| --accent | #184F3B | #426B54 | Leaf-green text, active states, editorial accents |
| --accent-strong | New | #1D503B | Green CTA and authority fills |
| --accent-hover | Repeated #123D2E / color mixes | #163F2E | Green CTA hover |
| --accent-pressed | New | #123325 | Green CTA pressed |
| --accent-soft | #E9F0EC | #EDF3EE | Mist tint on existing subtle surfaces |
| --accent-border | Repeated pale borders | #DCE8DF | Sage decorative border / subtle fill |
| --accent-surface | Home Care #FAFBF8 / Care #F3FAF3 | #F6F8F5 | Very light Care information surface |
| --positive | Independent status greens | var(--accent) | Positive text and dots |
| --focus-ring | Repeated #26745A / translucent mixtures | var(--accent) | Opaque focus indicator |

All neutral tokens retain their values. No parallel numbered color system was added.

## Surfaces affected

Shared public accent consumers: nav/submenu active text and pale hover state,
eyebrows (Decision Studio, Care, Desktop), inventory filters, links, and supporting
information. The shared NavigationSubmenu component and its positioning CSS are
unchanged.

Green actions: mobile contact, public Machine detail/sticky contact, policy contact,
Care lookup and Care detail/support actions, homepage Desktop download, and software
split-download controls. Hover/pressed colors use their own authority tokens.
Existing disabled rules and control dimensions are unchanged; Care button hover
and pressed rules exclude disabled controls.

Positive indicators: inventory dot, verification mark, Care active warranty and
success states, and software checker mark. Home Care uses a very light organic
surface and sage border; existing Care positive information surfaces use mist/sage.

## Intentional exceptions

- Home hero primary CTA, desktop nav contact CTA, generic neutral primary actions,
  and white inverse CTAs keep their black/white roles.
- #173F32 remains on the existing homepage guidance panel/inverse text and sales
  context-return surface: these are intentionally dark component-specific surfaces.
- #53645C remains on understated Machine policy notes/mobile detail eyebrows;
  #607168 remains on inactive mobile nav icons, preserving secondary hierarchy.
- Warm handover/story/Care timeline styling remains brown/cream. Care expired,
  warning and error reds/ambers are unchanged (including #9B3830, #8B2D20,
  #FFF0ED and #FFF1DC).
- Deferred Machine detail/policy-specific colors in globals.css retain their existing
  roles: secondary audience notes/icons (#647068, #71847A, #717A74, #7B8981,
  #606B64), verification/spec accents (#435F50, #43554C, #52645C), price/strong
  fact text (#143F31, #263B33), muted policy labels (#758078, #667069), existing
  policy metadata (#315347), information borders (#D4DDD5), policy note accent
  (#8CA598), and existing dark support/policy surfaces (#173D31 with #CBD8D2).
  Their small greenish neutral surfaces (#F5F7F5, #F5F6F4, #E7EEE8, #F1F3EE)
  remain unchanged. This pass does not redesign these detailed component palettes.
- Diagnostic display evidence/swatches and images are untouched; they encode
  evidence rather than brand color. No blanket replacement across other CSS files.

## Contrast and checks

WCAG relative-luminance ratios against fully opaque colors:

| Pair | Ratio |
| --- | --- |
| White / authority CTA | 9.28:1 |
| White / hover CTA | 11.77:1 |
| White / pressed CTA | 13.76:1 |
| Leaf / white | 6.06:1 |
| Leaf / mist | 5.39:1 |
| Leaf / sage | 4.81:1 |
| Leaf / existing page background | 5.65:1 |

Opaque leaf focus outlines retain at least 3:1 against tested white, page, mist,
and sage surfaces. Tests read actual shared token values rather than a duplicate
palette and require 4.5:1 for normal text. Contrast checks do not estimate contrast
against image pixels. Existing image composition and neutral body text are preserved.

Regression coverage: public-palette.test.mjs, navigation.test.mjs, and public
inventory regressions. Required TypeScript, scoped ESLint, production build,
and git diff --check are also run for this pass.

Validation completed: 164 focused palette/navigation/public tests passed; TypeScript,
scoped ESLint and production build passed; git diff --check passed. The build
retained existing public inventory/story data-query warnings. A comparison against
HEAD confirmed unchanged geometry/typography declarations in all seven CSS files.
The local production browser confirmed near-black Care heading, leaf eyebrow,
very light Care surface/sage border, and authority-green lookup CTA.

## Olive-sage retune (supersedes Phase 1 token values above)

| Token | Phase 1 before | Olive after |
| --- | --- | --- |
| --accent-strong | #1D503B | #556B4D |
| --accent | #426B54 | #6A7C5A |
| --accent-hover | #163F2E | #4A5E43 |
| --accent-pressed | #123325 | #3F5038 |
| --accent-soft | #EDF3EE | #EFF1E8 |
| --accent-border | #DCE8DF | #D8DDCF |
| --accent-surface | #F6F8F5 | #F6F6F0 |
| --accent-text | Previously --accent | #4A5E43 |

All small accent-colored text now uses accent-text, including shared nav, eyebrows,
links and status text. Positive aliases accent-text; focus-ring still aliases accent.
The exact lighter accent passes normal text on white (4.52:1) but fails on mist
(3.97:1), so it is reserved for non-text accents and focus rather than pale-surface
small text. Text companion ratios: white 7.06:1, mist 6.19:1, sage 5.10:1.
CTA white text: normal 5.84:1, hover 7.06:1, pressed 8.69:1.
Focus on mist 3.97:1 and sage 3.27:1 passes non-text contrast.

The homepage hero primary CTA now uses the same olive authority/hover/pressed
colors as existing green actions, with no geometry changes. Desktop header contact
remains neutral black; white inverse actions remain white. No structural changes.

Visually checked local production homepage hero CTA, Care search surface/action,
section eyebrows, active software nav, download CTA and pale Care/highlight surfaces.
These read dry olive/cream-sage. Unchanged #173F32/#173D31 guidance/support/policy
panels remain cooler forest-green exceptions. Hero foliage is unchanged imagery.

Validation: 165 focused tests, TypeScript, scoped ESLint, production build and
 git diff --check pass. Build/preview required approved unsandboxed execution after
Windows workspace canonicalization returned Access denied inside the sandbox.

## Botanical retune (current; supersedes olive values above)

| Token | Olive before | Botanical after |
| --- | --- | --- |
| --accent-strong | #556B4D | #405B46 |
| --accent | #6A7C5A | #58705C |
| --accent-hover | #4A5E43 | #354D3B |
| --accent-pressed | #3F5038 | #2D4032 |
| --accent-soft | #EFF1E8 | #E9EEE8 |
| --accent-border | #D8DDCF | #CDD7CE |
| --accent-surface | #F6F6F0 | #F2F4F0 |
| --accent-text | #4A5E43 | #405B46 |

All target values used exactly. Shared consumers update through tokens. The homepage
Bắt đầu từ nhu cầu decision/support panel now uses accent-strong instead of #173F32;
its inverse white CTA text also uses accent-strong. Existing 70% white paragraph
remains readable at approximately 4.66:1 after compositing on the new background.
No layout, typography, spacing, routes, markup or imagery changes.

Contrast: white CTA 7.49:1; hover 9.23:1; pressed 11.11:1. Accent text on
white 7.49:1, mist 6.37:1, sage 5.07:1. Focus on mist 4.59:1, sage 3.65:1.
The regular accent now also exceeds 4.5:1 on mist; text retains its authority token.

Visual validation in the production localhost build: hero CTA, Care search button,
Care pale surface, Desktop download, eyebrow, active software navigation and
homepage decision/support panel. The support panel now shares the botanical hue
family rather than retaining the old cool forest family. Existing policy/sales
context surface exceptions elsewhere remain outside this specific correction.

Checks: 166 focused palette/navigation/public tests, TypeScript, scoped ESLint,
production build, and git diff --check pass. No commit, push or deploy.

## Final botanical retune (current values)

| Token | Previous botanical | Final |
| --- | --- | --- |
| --accent-strong | #405B46 | #34543D |
| --accent | #58705C | #4E6B55 |
| --accent-hover | #354D3B | #2B4633 |
| --accent-pressed | #2D4032 | #233A2B |
| --accent-soft | #E9EEE8 | #E5ECE6 |
| --accent-border | #CDD7CE | #C5D2C7 |
| --accent-surface | #F2F4F0 | #EEF2EE |
| --accent-text | #405B46 | #34543D |

All preferred values used exactly; same Phase 1 consumers and token aliases.
The homepage decision/support block already consumes accent-strong and updates
with the CTAs. This final pass changes tokens only, plus tests and documentation.
Layout, typography, spacing, content, routes and component structure are unchanged.

Relative-luminance contrast ratios (rounded to four decimals):
white on normal CTA 8.4625:1, hover 10.3623:1, pressed 12.2694:1;
text on white 8.4625:1, mist 7.0410:1, sage 5.4069:1, surface 7.4837:1;
regular accent on white 5.9019:1;
focus on mist 4.9105:1, sage 3.7708:1, surface 5.2192:1.
Support block 70% white paragraph composites to approximately #C2CCC5,
with contrast 5.1328:1 (8-bit rounded composition).

Validation: 166 focused regressions, TypeScript, scoped ESLint, production build,
and git diff --check. No commit, push or deploy.

## Final application refinement

Botanical accent tokens remain unchanged. Homepage hero primary action returns to
near-black foreground with white text, neutral #2A2A2A hover and #111111 pressed
colors. Existing geometry, hover elevation/transform and inverse secondary action
remain unchanged. No green token is consumed by the hero primary action.

Home Care container now uses dedicated --care-surface #F0F2EC and --care-border
#D3D8CE in place of accent-surface/accent-border. The lookup button remains botanical
green, along with eyebrows, focus, links and existing shared accent consumers.
No input/layout/content/route changes. The homepage support panel stays botanical.

Focused regressions assert neutral hero states, isolated Care tint, unchanged
botanical authority/surface tokens and readable Care accent text/focus.
Validation: 167 tests, TypeScript, scoped ESLint, production build and diff check.
