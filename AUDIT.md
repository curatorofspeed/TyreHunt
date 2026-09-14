# Tyre Hunt app — Impeccable Audit & Polish Pass
**Scope:** `index.html` (hunt.tyrehunt.app, served inside both store apps), dark and light themes · **Method:** bundled `scan.sh` + `contrast.py` on every text token against every surface in both themes, anchored re-runnable patch from HEAD, then live keyboard drives in a static server with real key events. Date 2026-09-13. Pass focus ("clarify"): every control announces the same name and state a sighted user gets.

## Findings by severity

### 🔴 Critical
**Keyboard-dead controls.** Four things acted as buttons with no keyboard path: event calendar rows (`<div class="place">`), Most Wanted cards (`<div class="wcard">`), inbox rows (`role="button" tabindex="0"` but no key handler), and the Stable bounty pill (a fake `role="button"` span nested inside the card's real `<button>`, which is invalid nested interactive content). → **Fixed:** calendar rows and Most Wanted cards get `role="button" tabindex="0"`; one delegated handler fires Enter and Space on every non-native `role="button"` (skipped when the element's own handler already handled the key); the nested pill is demoted to plain content. Bounties stay keyboard-reachable through the dossier's BOUNTY button.

### 🟠 High
**Locked Registry label failed contrast in both themes.** "UNSPOTTED" was `rgba(152,160,172,.55)`: 2.96:1 on the dark slot, 1.50:1 on the light slot. Not a disabled state — a locked card still opens its entry. → **Fixed:** `var(--muted)`, 7.22:1 dark, 5.26:1 light.

**Like and comment buttons misreported themselves.** "♥ 12" was announced as a glyph plus a bare number, with no pressed state, so a screen reader user couldn't tell whether they'd liked a spot. → **Fixed:** `aria-pressed` rendered and kept in sync on toggle, glyphs `aria-hidden`, a visually hidden "Likes" / "Comments" name before the count. The count stays the first `<span>`, which is what the like handler updates.

**Icon-only buttons had no name.** Both ⋯ menus, the ✕ delete-comment button, and the sighting thumbnails (background image, no text). → **Fixed:** `aria-label` ("More actions", "Delete comment", "View this sighting"), translated in all 8 languages.

### 🟡 Medium
**Fifteen sheets had no dialog behavior.** No dialog semantics, focus never moved in or came back, only the full-screen photo closed on Escape, and Tab wandered behind the sheet into the camera HUD. → **Fixed:** every layer is `role="dialog" aria-modal="true"`, named by its own title via `aria-labelledby` (translation-proof) or by an `aria-label` where it has no title. One manager handles all of them: focus moves in on open and returns to the trigger on close; Escape closes the topmost layer by pressing that sheet's own close control, so each sheet's close side effects still run; Tab wraps in both directions; focus that escapes is pulled back in. The open step uses a timer, not `requestAnimationFrame`, because frames pause in backgrounded web views.

**Brand focus ring covered only buttons and tabindex elements.** Links and selects fell back to the browser default, and there was no Windows High Contrast fallback. → **Fixed:** ring extended to links, selects, inputs, textareas and summaries (dialog containers with `tabindex="-1"` excluded); `forced-colors` variant switches to `CanvasText`. Text fields keep their existing border indicator.

### 🟢 Low
**No brand text selection.** → **Fixed:** `::selection` uses the fill tokens, so it follows the theme.

### Measured and left alone (correctly)
Dark text tokens on page, panel and sheet surfaces all pass AA; lowest is everyday grey on panel at 5.90:1, highest ink at 17.74:1. Light tokens were measured during the light-theme build and all pass on all three light surfaces. Focus ring non-text contrast: 7.97:1 / 7.39:1 dark, 5.42:1 / 5.86:1 light. Input focus border: 4.76:1 dark, 6.47:1 light. Dark on-fill text on the deep cyan end of the button gradient: 4.62:1. Reduced motion (7 blocks), safe-area insets (20) and 16px inputs were already in place. Decorative borders and dividers are WCAG-exempt and unchanged. The two `outline:none` rules are intentional: one on non-interactive dialog containers that receive programmatic focus, one on text fields that keep a colored border indicator.

## Verified
Live on a static server, real key events unless noted.
- Real Tab from the streak button lands on the Registry pill with `:focus-visible` true and a computed 2px `rgb(111,165,255)` ring; screenshot shows it.
- Enter on the streak button opens the profile sheet; focus moves inside; `role="dialog"`, `aria-modal="true"`, named "Your Tag"; 7 focusables, first Close, last Appearance.
- Tab from the last control wraps to the first; Shift+Tab from the first wraps to the last.
- Escape closes the profile sheet and focus returns to the streak button.
- Stacked layers, plan sheet over profile: the first Escape closes only the plan sheet and focus moves to profile; the second closes profile.
- Enter on a Most Wanted card opens the lead sheet with focus inside, named "File a lead"; Escape closes it and focus returns to the card.
- Space on a Most Wanted card opens the lead sheet via a dispatched keydown (see quirks).
- Locked label computes `#98A0AC` in dark and `#566072` in light.
- Like button renders `aria-pressed="false"`, heart `aria-hidden="true"`, reads "Likes 0"; comment button reads "Comments 0".
- `::selection` computes `rgb(24,183,220)` in dark; the `forced-colors` rule is present in the stylesheet.
- All 3 inline scripts parse after every edit; no console errors in any run.

**Preview-pane quirks, not product bugs.** The tool's "Return", "space" and "Space" key names arrive with an empty `key`; only "Enter" arrives correctly, so Space was proven with a dispatched keydown. A hidden pane reports `document.hidden` and pauses animation frames, which is what exposed the original `requestAnimationFrame` focus step. Forced colors can't be emulated in the pane.

## Recommended (not done)
- **Sign-in-gated paths weren't driven live:** the like button's pressed toggle, inbox rows, and the ⋯ moderation sheet. They use the same code paths verified above; drive them once with a test account.
- **Device screen-reader pass:** VoiceOver on the iOS store app and TalkBack on Android. `aria-modal` support varies inside web views.
- **Stable bounty pill** is now pointer-only; keyboard users reach bounties through the dossier. Making it directly reachable means moving it outside the card button, which is a layout change.
- **www landing, lobby, privacy and terms** still lack the floor block from the Sep 4 www pass.
