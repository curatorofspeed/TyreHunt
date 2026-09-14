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

---

# Distill pass — 2026-09-13
**Scope:** same file. **Method:** inventory each screen at phone width (sections, controls, visible words measured with `checkVisibility()`), cut what repeats, fold long walls behind their own heading, then prove nothing was lost.

## Findings → changes
**Most Wanted list repeated every car's story.** Each list card showed a 132-character excerpt of a story the lead sheet already shows in full. → **Removed** from the list card; the lead sheet still shows the full 315-character story.

**Long walls buried the essentials.** Hunts carried a 42-chip Sets wall; Map stacked 29 calendar events and 16 hunting grounds under the map; the profile sheet put 27 titles and 23 badges between identity and settings. → **Folded** behind each section's existing heading as a native `<details>`: same heading text and translations, a chevron that turns when open, native keyboard and screen-reader expanded state, and open state kept across re-renders (`foldAttr()` + a capture-phase `toggle` listener).

**Duplicate keyboard handlers.** The streak button, Registry pill, verdict photo and full-screen photo kept their own Enter/Space (and Escape) handlers after the shared handler and dialog manager took over. → **Removed**; behavior identical, verified below.

## Measured
Visible words at 375px:

| Screen | Before | After, folds closed | All folds open |
|---|---|---|---|
| Hunts | 640 | 341 | 479 |
| Map | 577 | 37 | 577 |
| Profile, with a tag | 520 | 263 | 520 |

Map and Profile lose nothing when opened. Hunts is 161 words lower when fully open only because of the removed excerpts.

## Verified
- Every fold starts closed; the Most Wanted list renders no excerpts; the lead sheet shows the full story.
- Opened Sets and Titles folds stay open through a real re-render (a new DOM node confirmed each time); Badges stays closed.
- A calendar entry inside the opened fold still sets the active event.
- Enter on the streak button opens the profile with focus inside; Escape closes it and focus returns to the button.
- Enter on the Registry pill opens Garage.
- Enter on the verdict photo opens the full-screen photo; Escape closes only that layer and focus returns to the photo.
- A real Tab lands on a fold heading with the 2px ring; clicking the heading toggles open and closed.
- No console errors in any run; all inline scripts parse after the edit.

**Preview-pane quirks, not product bugs.** A word counter based on element size counts text inside closed `<details>`, because Chrome hides that content with content-visibility while keeping sizes — measure with `checkVisibility()`. The pane's Enter key sends a keydown only: a plain native button received 0 clicks from it, so native heading toggling by Enter and Space is browser behavior this pass didn't touch, proven here by click.

## Recommended (not done)
- **Three "wanted" ideas share the Hunts screen:** Wanted this week, the Bounty board and Most Wanted. Merging them is a product decision, not a polish change.
- **Car of the Day appears on camera, Hunts and Feed.** Each copy does a different job, so all three stay.
- **46 selectors are declared in more than one CSS rule.** Most are responsive overrides or the dark-scope list; a few are true duplicates such as `body`, `.vhead` and `#vcard .vph`. Merging them changes nothing a user sees, so they were left alone.

---

# Delight pass — 2026-09-13
**Scope:** same file. **Method:** inventory every animation, sound and haptic call and every moment users earn; add small rewards only where a meaningful moment lacked one; make every animation honor reduced motion.

## Findings → changes

### 🟡 Medium
**Reduced motion had holes.** Sixteen animations ignored it: the double-tap heart burst, the slide-in on ten sheets (plan, hunts, bounty, inbox, lead, comments, operator, event, hunter, documenting a car), the moderation box, the coach bubble, the camera signal chip, the one-time-code box and the feed badge. → **Fixed:** one reduced-motion block at the very end of the stylesheet, so it outranks every animation declared above it. The heart burst shows briefly as a still heart instead of scaling, so those users still get feedback.

### 🟢 Low — delight
**Liking from the button felt flat.** Only a double-tap got a heart burst. → **Added:** the heart pops when you like from the button; unliking stays quiet.

**Car of the Day looked like every other verdict row.** → **Added:** gold with a star, matching Rank Up. Text measures 10.09:1 in dark and 5.21:1 in light on its tint over the verdict sheet. Its 45% border is 3.22:1 in dark and 1.98:1 in light; it's decorative and exempt, the same treatment Rank Up already has.

**Folds snapped open.** → **Added:** opening a fold by hand eases its content in. A re-render that restores an open fold stays still, and closing doesn't animate.

**Switching appearance snapped.** → **Added:** a chosen switch crossfades through a view transition where the browser supports one. Startup, following the phone's setting, and reduced motion stay instant.

## Verified
- A walk of the live stylesheet found 38 animated selectors, and every one has a reduced-motion rule setting it to none.
- With the reduced-motion rules applied outside their media query, the plan sheet, coach, moderation box, like pop and heart burst compute to no animation; the heart burst computes opacity 1 at scale 1.
- The like pop computes the `likepop` animation on an inline-block heart.
- The gold row computes `#FFC24B` on an 8% gold tint in dark and `#8A5C00` on an 8% tint in light.
- Clicking a closed Sets fold opens it, adds the easing class, its content computes `foldIn`, and the class is gone 650ms later.
- Re-rendering Hunts restores the open fold with no easing class and no animation; closing adds no easing.
- The browser supports view transitions; with a spy in place, choosing Light and then Dark each ran exactly one transition, and the attribute and browser theme color flipped both ways.
- No console errors in any run; all inline scripts parse after the edit.

**Preview-pane quirks, not product bugs.** The pane can't emulate reduced motion, so the media block's rules were loaded unconditionally to read what they compute. The crossfade itself wasn't watched, because a hidden pane doesn't render frames; the spy proves a chosen switch routes through it.

## Recommended (not done)
- **Confirming a Star Car sighting** plays a sound but has no visual moment. A brief glow on the confirmed row would fit, but that row only renders for a signed-in owner with a Star Car, so it couldn't be verified here.
- **The like pop and the gold verdict row** are gated behind signing in and capturing a car in real use; they were verified by computed style and code path, not by a live like or capture.
- **Reduced motion inside the store apps** depends on the web view honoring the phone's Reduce Motion setting; worth one check on a device.

---

# Overdrive pass — 2026-09-13
**Scope:** same file. **Method:** pick the one moment that earns ambition, build it transform-only at most once per frame, then prove it never breaks tapping, scrolling or reduced motion.

## What was built
**The verdict card became a holographic trading card.** The verdict photo is the payoff of every capture. It already flipped in and, on rare and legendary finds, ran a foil sweep on a loop. Now:
- A finger or pointer tilts the card up to 10° toward the contact point, and a soft glare follows it.
- On rare and legendary finds the foil stops looping and tracks the finger instead, then resumes its sweep on release.
- On phones that expose the gyroscope without a permission prompt, tilting the phone moves the card while the verdict is open, relative to how the phone was held when it opened and clamped at 20° of phone tilt. iOS is never prompted.
- The card springs back flat on release, when the pointer leaves, and when the verdict closes.

**Guardrails.** Painting is batched to one frame, and only `transform` and a gradient position change. `will-change` applies only while tilting. `touch-action: pan-y` keeps vertical scrolling in the sheet, and a tap still opens the full-screen photo. Reduced motion turns it off in both script and CSS: no tilt, no glare, a flat card.

## Verified
- A touch at 80% across and 20% down sets exactly 6° of tilt on each axis, centers the glare at 80% / 20%, and moves the foil under the finger with its loop paused.
- With transitions switched off for the reading, the tilted card computes a real 3D rotation (`matrix3d`) and the glare computes opacity 1.
- Releasing a touch settles the card: 0° tilt, a flat transform, the glare hidden, and the foil loop resumed.
- A tap still opens the full-screen photo, and the card keeps `touch-action: pan-y`.
- A mouse tilts on move (−4° at 30% across), keeps tilting after the button comes up, and settles when it leaves.
- Gyroscope, run from the shipped script source: the first reading sets a 0° baseline; a 10° phone tilt gives 5° of card tilt with the glare at 75% / 25%; an extreme tilt clamps at 10°; closing the verdict settles it.
- With reduced motion reported, neither touch nor gyroscope tilts the card, and the reduced-motion CSS computes a flat card with the glare hidden.
- A walk of the live stylesheet still finds all 38 animated selectors covered by reduced motion.
- No console errors in any run; all inline scripts parse after the edit.

**Preview-pane quirks, not product bugs.** A hidden pane freezes CSS transitions at their starting value, so the card read flat mid-tilt until transitions were disabled for the reading. It pauses animation frames, so painting was checked with a synchronous frame stand-in. It exposes the iOS-style orientation permission without a real sensor, so the prompt-free gyroscope gate stays closed there; to test the math, only that permission check was hidden and the shipped source re-run.

## Recommended (not done)
- **Feel it on real phones.** Tilt strength, glare intensity and the gyroscope's range are tuned on paper; one pass on an iPhone and an Android phone should confirm they feel right.
- **iOS gyroscope** would need a permission prompt. Asking only after a legendary find would make the prompt feel earned, but that's a product decision.
- **Share cards** are exported images and stay still by design.

---

# Animate pass — 2026-09-13
**Scope:** same file. **Method:** inventory every transition and keyframe animation with the properties it moves, plus the duration and easing spread; move motion that forces layout onto transform or opacity, remove blanket transitions, animate state that jumped, and keep reduced motion complete.

## Findings → changes

### 🟡 Medium
**The toast transitioned every property.** Its rule said `transition:.3s` with no property, which means all of them, so theme colors or any layout change on it would animate along with the intended fade and slide. → **Fixed:** `opacity` and `transform` only. Under reduced motion it fades without sliding.

**The reel progress bar forced layout on every frame of the app's heaviest task.** Its width was rewritten on each tick while a reel renders. → **Fixed:** the fill stays full width and scales horizontally, anchored left, and right in Arabic so it still fills in reading order. The fill has no rounded ends, so the change is pixel-identical.

**Pull-to-refresh resized on every touch-move and snapped away on release.** → **Fixed:** the indicator follows the finger on a transform with no lag, fades in over the first 60px of pull (the refresh threshold), clamps at 96px, and eases away on release. Reduced motion keeps direct finger tracking and drops the ease.

### 🟢 Low
**The streak ring's progress arc jumped between values.** → **Added:** it eases to its new length over 0.7s. Paint-only, and off under reduced motion.

### Measured and left alone (correctly)
- Every keyframe animation already moves only transform, opacity or cheap paint properties: `filter` on the capture bracket glow and `background-position` on the loading shimmer.
- The motion vocabulary is already coherent: one enter curve, `cubic-bezier(.2,.8,.3,1)`, used 14 times; one overshoot curve for pops; `ease` for fades; `linear` for loops; 0.22s for sheets. A few one-off durations (0.24s verdict, 0.25s feed badge, 0.28s coach) aren't worth churning.
- The rank progress bar declares a width transition that never runs, because the bar is rebuilt and sized in the same step, so there's nothing to animate.

## Verified
- The toast computes `transition-property: opacity, transform` at 0.3s each.
- The streak arc computes a 0.7s `stroke-dashoffset` transition.
- The reel bar at half progress computes `matrix(0.5, 0, 0, 1, 0, 0)` with its width equal to the 320px track and its origin at the left edge; with `dir="rtl"` the origin moves to the right edge at 320px.
- Pull-to-refresh at rest computes `translateY(-96px)` at opacity 0, with transform and opacity transitions.
- A 70px pull sets `translateY(-26px)` at full opacity with no transition while dragging; a 30px pull sets `translateY(-66px)` at opacity 0.5; an over-pull clamps at `translateY(0px)`.
- Release removes the dragging class, clears the inline values, and hands the return to the 0.28s transform and 0.2s opacity ease.
- With the reduced-motion rules applied outside their media query, the toast computes an opacity-only transition with no slide offset, and the streak arc, reel bar and pull indicator compute 0s transitions.
- A walk of the live stylesheet still finds all 38 animated selectors covered by reduced motion.
- No console errors in any run; all inline scripts parse after the edit.

**Preview-pane quirks, not product bugs.** Transitions are frozen in a hidden pane, so values were read as targets and transition properties rather than watched. Touch was driven with real `Touch` and `TouchEvent` objects at phone size.

## Recommended (not done)
- **The camera tab's ring morph** animates width, height and margin when switching to and from the camera. It's one small element and only runs on a tab switch, and a transform rewrite would change how its border thins, so it was left.
- **Sheets animate in but vanish instantly on close.** Exit animations mean delaying each sheet's hide across fifteen layers and the dialog manager's focus return; worth doing deliberately, not as a polish edit.
- **The one-off durations** could fold into the 0.22s and 0.3s vocabulary if a motion token set is ever introduced.

---

# Harden pass — 2026-09-14
**Scope:** same file. **Method:** scan every `innerHTML` sink for unescaped user or model text, every click handler that writes to the server for re-entrancy, and every screen at 320px wide in all nine languages for text running off the edge; fix, then prove each fix in the browser.

## Findings → changes

### 🟠 High
**The model-returned car name reached the page unescaped.** The verdict's quest rows built `'<span>' + q.label + ' · ' + q.name.toUpperCase() + '</span>'` with `innerHTML`. The name comes from the identification model, so a crafted plate or badge in a photo could inject markup. Every other sink scanned was a static constant or already escaped. → **Fixed:** both values go through `esc()`.

**Eleven server actions could fire twice.** A double tap on a slow connection sent a second request before the first returned: send lead, create hunt, post bounty, mark owned, join event, report/block, send comment, claim tag, email me a code, verify code, add crew. The result was duplicate bounties, comments and hunts, or two OTP emails. → **Fixed:** a `busyGuard` wrapper ignores taps while the action runs, sets `aria-busy="true"` so it reads busy to screen readers and dims to 62% with a progress cursor, and always clears afterward, including when the request fails. `verifyOtpCode` and `addCrew` are also wrapped in `singleFlight`, so a call from the keyboard path or code joins the in-flight request instead of starting a second.

### 🟡 Medium
**Long translations ran off a 320px screen.** Measured overflow past the right edge before the fix:

| Element | de | fr | it | pt | es |
|---|---|---|---|---|---|
| Plan my hunt button | +37 | +64 | +52 | +90 | – |
| Quest status ("AT LARGE") | +6 | – | – | – | +83 |
| Map legend | +12 | +9 | +2 | – | – |

ja, th and ar were already clean. → **Fixed:**
- The header title now shrinks, and the Plan button keeps its natural width up to half the row, wrapping only past that.
- The quest status column is capped at 44% and wraps between words.
- The legend wraps onto a second row.
- es "AT LARGE" is now "PRÓFUGO" and de is "FLÜCHTIG", shorter and more natural than the literal translations.

### Caught during verification
The first version of the wrap fix let both elements shrink freely and broke text anywhere. At 320px in English that turned "PLAN MY HUNT" into three lines and split "TODAY" and "OPEN" mid-word. → Switched to natural width with a cap, and `break-word` in place of `anywhere`, before shipping.

## Verified
- **Guard, rapid taps.** Three rapid clicks on a guarded button ran the handler once. During the work the button had `data-busy` and `aria-busy="true"` and computed opacity 0.62 with a progress cursor. Afterward both attributes were gone and opacity was back to 1, and a later tap ran the handler again.
- **Guard, failed request.** An action that throws still clears the busy state.
- **Single flight.** Three concurrent calls returned the same promise and ran the body once, and a call after it settled ran it again. The live `verifyOtpCode` and `addCrew` are the wrapped versions.
- **Static checks.** All 11 wrapped registrations are present in the served script, and the verdict row uses `esc(q.name.toUpperCase())` with no unescaped form left.
- **320px sweep of Hunts and Map** in en, de, fr, es, it, pt and ar found zero elements past the screen edge and zero words split mid-word.
  - The Plan button takes 1 line in en, es and ar, and 2 lines in de, fr, it and pt.
  - Only fr "DANS LA NATURE" wraps its status, onto two lines between words.
- No console errors in any run; all inline scripts parse after the edit.

## Recommended (not done)
- **Read-only fetches** (inbox bell, operator list, comment list, share link) are left unguarded: a repeat is harmless and just refreshes.
- **Server-side idempotency** is the real backstop for double submits from two devices or a retry after a timeout. Unique constraints or idempotency keys on bounties, comments and hunts would cover what a client guard can't.
- **Screens not swept at 320px:** Garage, Feed and the sheets. Hunts and Map carry the longest strings and had every measured failure, but a full sweep would close it out.
