# UI and UX Standards

Visual and interaction standards for the customer storefront, with focus on the **Mehfil-e-Shereen** theme (`mehfil_shereen`).

## Theme system

**Activation:** `NEXT_PUBLIC_STORE_THEME=mehfil_shereen` → read by `frontend/lib/store-theme.ts` → applied as `data-store-theme` on `<html>` in `frontend/app/layout.tsx`.

**Token files:**

| File | Role |
|------|------|
| `frontend/styles/store-themes.css` | Per-theme CSS variables |
| `frontend/app/globals.css` | Component styles, mehfil header overrides, mega menu |

Other built-in theme ids: `default`, `ocean`, `ember` (see `store-theme.ts`).

## Color palette (mehfil_shereen)

### Navbar (burgundy)

```css
--navbar-background: linear-gradient(165deg, #3d121c 0%, #5c1f2e 28%, #6b2838 55%, #5a2230 100%);
--navbar-foreground: rgba(255, 248, 250, 0.96);
--navbar-muted-foreground: rgba(255, 248, 250, 0.78);
--navbar-border: color-mix(in srgb, var(--primary) 45%, rgba(255, 240, 245, 0.2));
```

The header uses class `site-header` with `--navbar-background` for a maroon/burgundy bar.

### Brand accents

| Token | Light value | Usage |
|-------|-------------|--------|
| `--primary` | `#b8944a` | Gold CTAs, mega menu column headings, focus ring base |
| `--primary-foreground` | `#161015` | Text on gold buttons |
| `--secondary` | `#141c2c` | Navy anchors |
| `--secondary-foreground` | `#f2ebe0` | Text on navy |
| `--ring` | `#c4a052` | Focus rings |

### Page canvas

| Token | Value |
|-------|--------|
| `--background` | `#ffffff` |
| `--foreground` | `#2a1218` (warm dark text) |

### Dark mode

`prefers-color-scheme: dark` overrides in `store-themes.css` shift to wine-charcoal backgrounds and brighter gold primary (`#c4a052`).

## Typography

**Fonts:** Geist Sans and Geist Mono loaded in `frontend/app/layout.tsx` via `next/font/google`, exposed as `--font-geist-sans` and `--font-geist-mono`.

**Scale (typical):**

| Element | Size / weight |
|---------|----------------|
| Header nav links | `text-sm font-medium` |
| Mega menu column heading | `0.875rem`, `font-weight: 700` |
| Mega menu L2 links | `0.875rem`, `font-weight: 500` |
| Mega menu L3 links | `0.8125rem`, `font-weight: 400` |

## Layout shell (mehfil)

When `mehfil_shereen` is active, the root layout wraps content in `.mehfil-store-shell`:

- Logo-grid pattern in left/right gutters (`/themes/mehfil-shereen/logo-grid-pattern.svg`)
- Solid white `80rem` center band for readable content
- Header remains full-width burgundy above the shell

## Header layout

**Component:** `frontend/components/layout/header.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]     [  Search bar (center, flex-1)  ]    Nav User Cart│
└─────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|--------|
| Position | `sticky top-0 z-[60]` |
| Max width | `max-w-[100rem]` inner container |
| Desktop nav | `hidden lg:flex`, `self-stretch` for vertical alignment |

### Icon order (desktop)

1. Navigation links (including Products / Categories mega trigger)
2. **User menu** (`UserMenuDropdown`)
3. **Cart** (shopping bag icon)

User appears **before** cart by design.

## User profile dropdown

**Component:** `frontend/components/layout/user-menu-dropdown.tsx`  
**Icon:** `frontend/components/icons/user-icon.tsx` — Lucide `UserCircle`, `h-6 w-6`

| Property | Behavior |
|----------|----------|
| Visibility | Desktop only (`hidden lg:flex`) |
| Trigger | Icon button, hover opens panel |
| Panel | `absolute right-0 top-full z-[120]`, class `header-user-menu` |
| Close delay | 160ms on mouse leave |
| Authenticated | "My Profile" → `/account`, "Logout" |
| Guest | "Log in", emphasized "Sign up" |

Mobile auth uses plain links inside the hamburger drawer, not this dropdown.

## Cart icon

**Component:** `frontend/components/icons/shopping-bag-icon.tsx` — Lucide `ShoppingBag`

| Property | Value |
|----------|--------|
| Size | `h-6 w-6` |
| Badge | Red circle `-right-1 -top-1`, `ring-2 ring-background` |
| Badge text | Count up to `99+` |

Cart is detected by href (`/cart`) in `header.tsx`, not by label text.

## Mega menu panel

**Component:** `frontend/components/layout/store-mega-menu.tsx`  
**Styles:** `frontend/app/globals.css` (`.store-mega-menu-panel`, `.mega-menu-nav-*`)

| Property | Value |
|----------|--------|
| Position | Fixed below header (portaled to `document.body`) |
| Max height | `min(68vh, 26rem)` with inner scroll |
| Columns | CSS grid, up to 4 equal columns + optional 252px banner |
| Column headings | Gold: `color: var(--primary)` |
| Child links (L2/L3) | White: `#ffffff` |
| Child hover | White text, `rgba(255,255,255,0.1)` background |
| Active child | White text, gold left border (`inset 3px 0 0 var(--primary)`) |
| Banner image | `object-fit: contain` inside framed box |

### Category badges

Optional "Hot" / "New" pills on category links when slug matches `CATEGORY_NAV_BADGES` in `mega-menu-config.ts`.

## Mehfil header overrides

`globals.css` selectors under `html[data-store-theme="mehfil_shereen"]`:

- Light text on maroon for `header nav` links and `.header-nav-trigger`
- Mobile menu button: light background for contrast on burgundy bar
- Search input border tuned for maroon context

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Mega menu | `aria-expanded`, `aria-haspopup` on Categories button |
| User menu | `role="menu"`, `role="menuitem"`, `aria-haspopup="menu"` |
| Mobile drawer | `role="dialog"`, `aria-modal`, Escape to close |
| Cart | `aria-label` includes item count when non-zero |
| Active nav | `aria-current="page"` on matching links |

## Lucide React usage

Lucide is used for **header icons** (`lucide-react`):

- `UserCircle` — user menu
- `ShoppingBag` — cart

Other UI may use inline SVGs (e.g. mega menu chevron, mobile menu icons).

## Customization

| Goal | How |
|------|-----|
| Switch theme | `NEXT_PUBLIC_STORE_THEME` |
| Store name / logo | `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_LOGO` |
| Currency display | `NEXT_PUBLIC_CURRENCY` |
| Navbar tokens | Edit `store-themes.css` or add a new `[data-store-theme="..."]` block |

## Related docs

- [Navigation-Logic.md](./Navigation-Logic.md) — mega menu behavior
- [Technical-Setup.md](./Technical-Setup.md) — env vars for theme
