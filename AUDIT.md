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

---

# Onboard pass — 2026-09-14
**Scope:** same file. **Method:** walk a clean install on a fresh origin (no local storage, no IndexedDB) from the intro to the first shutter tip, then into every signed-out wall; read the coach, camera-fallback and sign-in code behind what showed up; repeat the walk in German and with an existing tag.

## Findings → changes

### 🟠 High
**Signed-out actions ended at a toast.** Twelve taps a new user reaches early only toasted "Sign in to…" and stopped. Nothing opened, and nothing said sign-in lives behind the streak ring:
- plan my hunt, schedule a hunt, join a hunt, join
- post a bounty, report a bounty, file a lead
- see a hunter, add to crew, crews, activity, upgrade

The Feed's CLAIM TAG button was the only signed-out path that opened the tag sheet. Three notes also sat as dead text: scheduled hunts and the bounty board in Hunts, and Rankings.

→ **Fixed:**
- **Toasts.** The same toast now also opens the tag sheet, at the right step: claim a handle, or the email step for someone who already has one.
- **Stacking.** The sheet rises above whatever sheet sent the user there. The upgrade sheet sits at 28, so the tag sheet goes to 29, still under the toast at 30. Closing it returns focus to the button that was tapped.
- **Notes.** The three notes gain a button: CLAIM TAG, or SECURE YOUR TAG when a handle exists. Both labels reuse strings that were already translated.

**The first-run tips were English in all eight other languages.** The three coach tips are a new user's only guidance, and none of their strings were in the dictionary. German showed "Point at any car" under a translated intro and camera screen. → **Fixed:** five entries per language, using each language's existing terms for Registry, Garage, Car of the Day and the tu/du/tú register. The numbered tip uses the dictionary's digit key, so "That's entry No. 1" renders as "Das ist Eintrag Nr. 1".

### 🟡 Medium
**The intro wasn't a dialog.** It covers the whole app, but it had no dialog role and no label, and focus stayed on the page body, so Tab reached the camera, tabs and HUD hidden behind it. → **Fixed:**
- It is a labeled modal dialog in the dialog manager, so focus moves in and Tab is held on START HUNTING.
- Escape starts the hunt, the only way out.
- A keyboard or screen-reader start lands focus on the shutter, not on a button that just disappeared.

**The coach tip was silent, keyboard-dead, and lost to its own timer.**
- **Silent.** The bubble had no live region.
- **Keyboard-dead.** Only a tap dismissed it.
- **Lost to its timer.** The 9-second auto-hide recorded the tip as seen, so a new user who looked away from the phone never got "Point at any car" again.

→ **Fixed:**
- The tip is announced through the app's existing announce channel, read back after translation so it matches the screen.
- Escape dismisses it, but only when no sheet claimed the key first.
- The first-shutter tip's timer now only hides it, so it returns each launch until the first capture. The later tips stay one-offs, since they're tied to capture No. 1 and No. 3.

### Measured and left alone (correctly)
- **Intro.** It already does onboarding right: one screen, a real result card, one rule (the Registry), one button, and the camera and location promise before the permission prompt. No carousel was added.
- **Camera off.** With the camera denied or unavailable, the viewfinder says so and the shutter falls back to the phone's own camera, so the copy is true and the path works.
- **Empty states.** Garage, Feed, Map and the leaderboard each say what goes there and how to fill it.

## Verified
- **Clean install.** The intro opens with `role="dialog"`, `aria-modal="true"`, and a label reading "Tyre Hunt", with focus on the dialog.
  - Real Tab, Tab, and Shift+Tab all stay on START HUNTING.
  - Real Escape starts the hunt: the intro closes, the intro is recorded as seen, and focus lands on the shutter button.
- **Coach, first tip.** It appears about 3 seconds later, and the live region reads "Point at any car. Tap here. It doesn't have to be exotic — the app names whatever you find."
  - Real Escape hides it and records it.
  - Re-shown and left alone, it hid after 9.5 seconds with nothing recorded.
- **Signed-out tap.** Tapping SCHEDULE A HUNT toasts "Sign in to schedule a hunt" and opens the tag sheet at the claim step, at z-index 29 with focus inside.
  - Real Escape closes the sheet and returns focus to SCHEDULE A HUNT.
  - The Hunts notes show two CLAIM TAG buttons, computed uppercase. The first opens the tag sheet at its normal z-index of 24, with the raise cleared.
- **Existing tag.** The same buttons read SECURE YOUR TAG.
  - With the upgrade sheet open at 28, the tag sheet opens at 29, and the element at the sheet's center belongs to the tag sheet.
  - Real Escape closes the tag sheet first and leaves the upgrade sheet open.
- **German.**
  - The Garage tip renders "Das ist Eintrag Nr. 1" with the translated body, and the live region carries the German text.
  - The Today's target tip renders "Heutiges Ziel" and "Erwisch das Auto des Tages…".
  - The note buttons read TAG SICHERN.
- **Static checks.**
  - All eight languages have all five coach entries.
  - The numbered key keeps its digit placeholder.
  - The dictionary still parses.
  - No "Sign in" toast remains on a tap path. The two left are background notices, the push prompt and the offline queue, with nothing to tap.
- No console errors in any run; all inline scripts parse after the edit.

**Preview-pane quirk, not a product bug.** The key tool's Enter doesn't activate native buttons, so the SCHEDULE A HUNT check was re-run with a real click; Escape and Tab were real key presses.

## Recommended (not done)
- **Resume the interrupted action after sign-in.** Adding someone to your crew already does this (`pendingCrew`). Doing the same for scheduling, posting a bounty and filing a lead would drop the user back where they were.
- **The two-step account** (claim a handle, then add an email) is the product's design, and the copy explains it. A single email-first step would be a product decision, not polish.
- **The signed-out map meta line** ("Sign in to see the world map") is a status line inside the map header, so it was left as text.

---

# Optimize pass — 2026-09-14
**Scope:** same file plus its static assets. **Method:** measure production delivery with curl (compression, cache headers, ETag revalidation), take the page apart by weight, read the browser's resource timing on a clean install and on a returning launch, time script compile, and fix only what the numbers justify.

## Findings → changes

### 🟠 High
**The 3.9 MB splash video downloaded on every launch that can't play it.** `logo-anim.mp4` sat in the page with `preload="auto"`, so the browser began fetching it about 100ms after navigation: 3,845 KB in resource timing. That happened for returning hunters, and for Reduce Motion users whose splash code exits immediately, yet only the first START HUNTING tap ever plays it. Production serves it with `max-age=0` and an ETag. Where a phone's media cache keeps the file, a relaunch costs a 304 revalidation (tested: plain and ranged conditional requests both return 304). A fresh install, a cleared cache or an evicted entry pays the full 3.9 MB on cellular. → **Fixed:** the video element ships with no source and `preload="none"`. The splash script hands boot a loader only when motion is allowed, and boot calls it only when the intro is actually shown. First-run users start the download the moment the intro appears, as before.

### 🟡 Medium
**Every download of the page carried a photo only first-run users see.** The intro card's Porsche was a 38.5 KB base64 JPEG inlined in the CSS, and base64 barely compresses, so every new deploy's HTML shipped it to every user. → **Fixed:** it's now `intro-911.jpg` (28.9 KB, 420×226). Browsers don't fetch backgrounds of hidden elements, so returning users never request it. The HTML went from 857.4 KB to 819.2 KB raw, and from 204.8 KB to 177.2 KB with Brotli at quality 11, 13.5% smaller.

### Measured and left alone (correctly)
- **HTML delivery.** Brotli 262 KB from Vercel, ETag revalidation returns 304 with no body, and the service worker is network-first, so deploys land and unchanged launches cost a round trip.
- **Runtime weight.** About 600 DOM nodes and a 5 MB JS heap after boot. Main script compile is 10.8 ms and the translation dictionary compiles and runs in 6.6 ms cold on the desktop pane (4 cores).
- **Feed images.** Captures upload at 360×640 and weigh 73–83 KB, and they load lazily with a 400px margin. Supabase's resize endpoint works on this project and would halve them, but each transformed origin image is billed, so it isn't worth it at this size.
- **Fonts.** Preconnected, `display=swap`, and only the faces the page renders were fetched (Archivo, JetBrains Mono, Racing Sans One). Making the stylesheet non-blocking would flash fallback type on the intro and HUD, a brand trade not worth a few hundred ms on a cold start.
- **Deferred assets.** The Supabase client loads after first paint, and the world map data and QR library load on demand.

## Verified
- **Clean install, 375×812.** The intro shows and resource timing lists `logo-anim.mp4` (3,845 KB) and `intro-911.jpg` (29 KB).
  - The video gets its source with `preload="auto"` and reaches readyState 4.
  - The intro photo box computes `url(intro-911.jpg)` at 325×139, and the file loads at 420×226. A screenshot shows the card unchanged.
- **First tap.** START HUNTING with the video ready turns the splash on at the tap, and the intro is recorded as seen.
- **Returning launch, same origin.** No request for either file, the video has no source, and networkState is 0 (empty).
- **Returning launch, second origin with existing state.** No request for either file, the video has no source, the loader hook is defined, and the page decodes to 800 KB.
- **Production.** The video ETag is stable; conditional and ranged conditional requests return 304 with 0 bytes, and the HTML conditional request returns 304.
- No console errors in any run; all inline scripts parse after the edit.

**Not driven in the pane.** Reduce Motion can't be emulated there. The loader is defined after the reduced-motion early return, so under Reduce Motion nothing loads, but that is from reading the code.

## Recommended (not done)
- **Re-export the splash video.** It is 720×1280, 4.48 s, H.264 at about 7 Mbps, with an AAC audio track the app always mutes. Exported without audio at 1–1.5 Mbps it would be roughly 0.6–0.9 MB, so first-run users on cellular would more often have it ready by their tap; the splash is skipped if it isn't. macOS `avconvert` offers only fixed presets with no bitrate control, and ffmpeg isn't installed, so this is best done from the source file.
- **Split the translation dictionary.** It is 317 KB raw, about 38% of the compressed page, needed only by non-English users. Per-language files would save English users about 100 KB per deploy, but non-English first paint would need a fetch and an offline copy, a real architecture change.
- **Cache capture photos longer.** They serve `cache-control: no-cache`, so each feed view revalidates each image. Uploads use `upsert` on reused paths, so a long lifetime could show a replaced photo stale; a modest `cacheControl` on upload would need that trade decided first.
- **Crush the store icons.** `icon-1024.png` is 708 KB and `icon-512.png` 222 KB. The OS fetches them only at install, and 512 is the share-preview image, so compressing them would speed link previews slightly.

---

# Critique pass — 2026-09-14
**Scope:** same file, both themes. **Method:** the bundled scan (pattern counts and parse check), then a live sweep of every text element on all five views and the tag sheet in dark and light, measuring computed foreground against the surface it sits on; a live inventory of every interactive element for names, hit size and keyboard reach; the dialog manager's ARIA read back from the DOM; a real Tab keypress for the ring.

## Findings → changes

### 🟠 High
**Light mode erased text inside the dark-scoped areas.** The camera, HUD, intro, verifying overlay, reel progress and toast deliberately keep dark tokens in light mode, but `body` resolves `color:var(--ink)` once, at the light value, and that resolved color is what descendants inherit. Anything in those areas that didn't set its own color drew light-mode ink on a dark surface:
- The intro's car name "Porsche 911 Targa" and the headline "The Registry is the score." measured 1.04:1 on the card, so a new user whose phone is in light mode (the iOS shell follows the phone) met an intro with two blank lines.
- The Registry count "0" in the HUD pill, "Verifying…" on the capture overlay, and "CUTTING YOUR REEL" in the reel box were equally invisible.

→ **Fixed:** the light-mode scope rule now also sets `color:var(--ink)`, so inherited color re-resolves inside those containers along with the tokens. Dark mode is unchanged, since there the body value and the scoped value are the same. Screenshots before and after show the intro card blank, then legible.

### 🟡 Medium
**Feed actions were 16px tall.** The like, comment and @handle buttons on every feed card had no padding, so their hit areas were 15.5–17px high, against the app's own 44px convention and the 24px accessibility minimum. → **Fixed:** 6px of padding with matching negative margins, so each button is now 28–29px tall and nothing on the card moved; the row measures the same 37px.

**Buttons that switched themselves off didn't look off.** Nine actions set `disabled` on themselves while they work or once they're done, such as sign-out sync, delete account, add to crew, sighting confirm, the email-code and sign-in buttons, and the star-car button, and only the shutter and two others had a disabled style. → **Fixed:** disabled buttons and selects dim to 55% with a default cursor. The shutter keeps its own 50%, and a button that is busy through `busyGuard` keeps the 62% busy look rather than stacking both.

**Segmented controls had no state.** Ten `.seg` groups (garage, sort, map, board, lane and more) mark the active segment with a class only, so a screen reader heard five equal buttons. → **Fixed:** every segment button carries `aria-pressed` mirrored from the class, kept in sync by one observer, including groups rendered later such as the lane picker in the tag sheet.

### 🟢 Low
**The feed badge read as a bare number.** The tab announced "FEED 3". → **Fixed:** the badge labels itself "3 new".

### Measured and left alone (correctly)
- **Dark theme.** Zero contrast failures across all five views and the tag sheet.
- **Light theme.** Outside the scoped areas, zero failures. The tag sheet's secure-your-tag card sits on a 13% accent tint over white and passes for its eyebrow and copy.
- **Floor items already in place from the clarify pass.** Focus ring with a forced-colors variant, sixteen labeled modal dialogs with focus, Escape and trap handling, `role="status"` on the toast and the announcer, reduced motion, 16px inputs, safe-area insets, `::selection`, busy state. The scan found no click-handling `div`s and no `user-scalable=no`.
- **The full-photo lightbox** is a single labeled button that closes on tap or Escape, which is the right shape for it.
- **The coach bubble** has no button semantics, and that's fine: it's announced when it appears and Escape puts it away.

## Verified
- **Light mode.** The intro name, headline, HUD count, verifying title, reel title and toast all compute `rgb(242,243,246)`, and a sweep of every text node inside the scoped containers finds zero at light-mode ink or muted. Screenshot: the intro card is legible.
- **Dark mode.** The same elements compute the same values as before; body ink, scoped ink and muted are unchanged. The dossier hero's back and star buttons keep explicit dark ink on their glass.
- **Feed buttons.** Like 29×28, comment 34×28, handle 132×29; the action row is 37px tall; a screenshot matches the pre-change card.
- **Disabled.** A `.btn` computes opacity 1 enabled, 0.55 and `cursor:default` disabled, 0.62 when disabled and busy; the shutter stays at 0.5.
- **Segments.** Garage starts SPOTS=true; clicking STABLE flips to STABLE=true and SPOTS=false; the lane picker rendered inside the tag sheet comes up VEHICLES=false, BIKES=false, BOTH=true.
- **Badge.** With three unseen posts the badge shows "3", labels "3 new" and is on.
- **Focus ring.** A real Tab keypress lands on the feed's CAR OF THE DAY segment with `:focus-visible` and a 2px solid ring; screenshot taken.
- **Dialogs.** All sixteen layers read back `role="dialog"`, `aria-modal="true"` and a label.
- No console errors in any run; all inline scripts parse after the edit.

## Recommended (not done)
- **Hunter sheet handle button** sets `padding:0` inline, so the new hit-area rule doesn't reach it; it's one button at the top of the sheet with nothing near it.
- **A skip link** isn't needed for a tab-bar app with one `main`, but if the feed ever grows a long header it would earn one.

---

# Registry lore moved server-side — 2026-09-15
**Scope:** `index.html` plus a new `registry_lore` table. **Method:** trace the field-guide call path, prove it fails in production, replace per-user generation with one curated table.

## The bug
**The field guide never loaded for anyone.** `loreFor()` called `api.anthropic.com` directly on every Registry entry open. The key only exists server-side, so in production the request went out with no credentials, died at CORS preflight, and the `catch` swallowed it. Every entry open cost one doomed cross-origin request and two console errors, and the text never appeared. It failed silently, which is why it went unnoticed. Confirmed live with an empty `CONFIG.apiKey`: request sent, preflight blocked, `loreFor` returned null, nothing cached.

## The fix
Lore is identical for every hunter, so per-user generation was waste even when it worked.
- **`registry_lore` table**, keyed by lane and name, holding `matters`, `numbers` and `note`. RLS: read granted to anon and authenticated, no write policy at all, so only the service role can change it.
- **132 rows written once** — 60 base cars, 42 season-volume cars, 30 bikes — covering every Registry entry including volumes that unlock in later seasons.
- **The app reads the table** and caches into `state.lore`, so a second open is instant and works offline. Non-Registry captures and missing rows are marked in a `loreMissed` set, so a card with nothing on file shows no block instead of a spinner that never resolves, and never re-requests.
- **Keyed by name, not by `cxKeyOf`**, because `n1..nN` is positional and shifts when a season appends a volume.

## Verified
- A real tap on the Ferrari F40 tile opens the sheet with all three sections rendered: 0 requests to Anthropic, 1 read of `registry_lore`, no console errors on a tab that never ran the old code.
- Signed out, lore still loads (anon policy), first read about 260 ms, second read 0 ms from cache.
- An anon write is refused: `42501 new row violates row-level security policy`.
- A non-Registry key shows no lore block, no spinner, and issues no request.
- All 132 app entry names match a row exactly, both directions, accents included.
- Copy scan across all rows: no doubled words, no double spaces, no lowercase sentence starts. One typo found and fixed in the Stratos note ("Wraparound wrapround").

## Recommended (not done)
- **New Registry entries need a lore row**, or they show no field guide. Worth a check when a season volume is added.
- **The same table pattern fits Car of the Day** — generate once, approve, serve to everyone.

---

# Animate pass II — 2026-09-15
**Scope:** same file. **Method:** diff the six commits since the first animate pass for new animatable surfaces, then take on the exit animation that pass deferred; drive every change live and read computed styles back rather than watching motion.

## Findings → changes

### 🟡 Medium
**Sheets flew in and blinked out.** Fourteen layers animate on open — thirteen with `sheetIn`, the verdict with a fade — and every one of them vanished instantly on close, because `.on` is removed in 45 different places and `display:none` takes effect on the same frame. → **Fixed:** the dialog floor already observes every open and close in one place, so the exit lives there: it adds `.closing`, CSS runs `sheetOut` (0.18s, opacity and transform only) or `fadeOutLayer` for the verdict, and the class is dropped on `animationend`. A 400ms timer runs alongside as a safety net, so a sheet can never be stranded on screen if the event is missed. No call site changed, and the enter animation is untouched.
- **Why not `@starting-style` / `allow-discrete`:** this browser supports both, but converting the sheets to a transition model would have traded a reliable enter animation on older iOS for an exit on newer iOS. The `.closing` class works everywhere CSS animations do.
- **`pointer-events:none` while closing**, so a sheet on its way out can't be tapped.

**State added since the last pass jumped.** Four surfaces introduced by the harden, onboard, critique and lore work had no transition at all:
- the busy state (`aria-busy`, opacity 0.62) and the disabled state (opacity 0.55) snapped between values,
- segment buttons changed background and colour instantly,
- lore blocks appeared about 260ms after the sheet opened, popping in with no entrance.
→ **Fixed:** 0.16s opacity easing on busy and disabled, 0.16s background and colour on segments, and the existing `foldIn` keyframes reused for lore so it rises the same way folded sections do.

### Measured and left alone (correctly)
- **`modSheet`, `photoFull` and the intro** get no exit, because none of them has an enter animation either — adding one to the exit alone would be inconsistent.
- **The first animate pass's other deferral, the camera tab ring morph**, still animates width and height; it runs once per tab switch and a transform rewrite would change how its border thins.

## Verified
- **Real Escape on the tag sheet:** `.on` gone, `.closing` present, still `display:flex`, `animation-name: sheetOut`, `0.18s`, `fill-mode: both`, `pointer-events: none`.
- **Focus contract intact:** focus was already back on the trigger *during* the exit, and still there after it — a closing sheet never holds focus, and the floor doesn't count it as open.
- **After the exit:** `.closing` cleared, `display: none`, no animation left running.
- **Re-opened mid-exit:** `.closing` dropped, `.on` restored, `animation-name: sheetIn`, and it settles to `display:none` afterwards — no half-dead sheet.
- **New easing computes:** disabled `opacity 0.16s`, segments `background-color 0.16s, color 0.16s`, lore `foldIn 0.24s`.
- **Reduced motion:** with the same declarations applied outside the media query, closing sheets compute `display:none` / `animation:none`, lore's animation is none, and busy, disabled and segment transitions are all `none 0s`.
- **Coverage:** 14 layers have an exit, 3 deliberately don't; `animationend` was confirmed to fire in the hidden preview pane, and the timer covers the case where it doesn't.
- No console errors; all inline scripts parse after the edit.

## Recommended (not done)
- **`viewIn` on tab switches** has no exit either, but views swap instantly by design — an exit there would delay every tab tap.
- **The 400ms safety timer** could be derived from the computed animation duration if the exit timing is ever tuned per layer.

---

# Colorize pass — 2026-09-15
**Scope:** same file, both themes. **Method:** inventory every colour token and raw literal, measure the rarity ladder for contrast and for colour-vision separability, then trace every surface that paints rarity — CSS, inline styles and canvas — and check each one against the theme it actually sits on.

## Findings → changes

### 🟡 Medium
**The feed painted rarity in the wrong colours.** `RCHIP`, used for every feed card chip, mapped classic to `--ember` (the cyan accent) and rare to `--pulse-hi`, while chips everywhere else use `--r-classic` (orange) and `--r-rare`. The same car read as one rarity colour in the Feed and another in the Registry, and "classic" collided with the app's primary accent, blunting what the accent means. → **Fixed:** the feed uses the rarity tokens, with borders derived from the same token via `color-mix`.

**The map ignored the theme it sits on.** `#mapc` takes `background:var(--panel)`, so the map is white in light mode, and its legend dots are CSS-driven and switch palettes correctly — but the spots painted into the canvas came from a hardcoded dark palette. Measured with a seeded legendary spot in light mode: **542 pixels of `255,194,75`** (dark gold) on a white map while the legend dot beside it computed `rgb(138,92,0)`. The key and the map disagreed. → **Fixed:** `renderMap` reads the live `--r-*` tokens at paint time, falling back to the dark constant. The appearance switch already calls a repaint hook, so a toggle re-paints without leaving the view.

### 🟢 Low
**Chip borders were frozen in the dark palette.** `.chip.everyday` and `.chip.classic` hardcoded `rgba(139,147,161,.45)` and `rgba(255,138,30,.5)`, so in light mode their text switched palette but their borders did not. (`.chip.legendary` and `.chip.rare` already derived theirs from tokens.) → **Fixed:** both derive from their own token with `color-mix`, which resolves correctly inside the dark-scoped areas too — the reason for not adding separate rgb tokens, which those scopes would not have re-declared.

**The rarity palette was written out five times.** Identical literals in `makeReel`, `shareTop8`, `shareWrapped`, `shareCard` and `renderMap`; a change in CSS would have left five canvases disagreeing. → **Fixed:** one `RARITY_DARK` constant. The four share surfaces reference it deliberately — they paint their own `#0A0B0E` card and must stay dark whatever the app's appearance — and `renderMap` uses it only as a fallback.

### Measured and left alone (correctly)
- **Classic and legendary sit close together for red-green colour blindness in light mode.** Simulated channel distance is 17 (protanopia) and 23 (deuteranopia) between `#B93F0B` and `#8A5C00`; dark mode's worst pair is the same two at 115 and 114. A palette search for a separable replacement returned only muddy browns (`#5a3c37`, `#6e6955`) — that is not legendary gold, and this pass does not redesign the identity. It is not a WCAG 1.4.1 failure either: **rarity is never colour-only** — registry tiles print the tier word, every chip carries its rarity label, and each legend dot sits beside its name. Left as measured, with the shape of a future fix noted below.
- **All eight rarity colours clear AA.** Dark on panel: everyday 5.90, classic 7.74, rare 6.38, legendary 11.36. Light on white: 5.89, 5.56, 6.70, 5.81.
- **198 raw hex literals, none theme-breaking.** Every one sits inside a dark-scoped block or is a deliberate constant (`#000` photo wells, `#04222a` on-fill).

## Verified
- **Light map:** 542 pixels of the light gold `138,92,0`, zero pixels of the dark gold; legend dot matches at `rgb(138,92,0)`.
- **Toggled to dark while still on the map:** 536 pixels of `255,194,75`, legend matches — the repaint hook fires without leaving the view.
- **Feed chips:** CLASSIC computes `rgb(255,138,30)` with a matching derived border; nothing in the feed still paints rarity with the accent.
- **Chip borders differ per theme:** classic `srgb 1 0.541 0.118 / 0.5` dark versus `srgb 0.725 0.247 0.043 / 0.5` light; everyday likewise.
- **Structure:** `RARITY_DARK` defined once at line 2806 before all five uses; four share painters reference it; one palette literal remains in the file, the constant itself.
- `color-mix` support confirmed in-browser, including with `var()`.
- Probe data removed — 0 spots after reload; no console errors in any run; all inline scripts parse.

## Recommended (not done)
- **Canvas can't read CSS tokens cheaply**, so the four always-dark share surfaces still need a manual edit if the dark palette ever changes. The single constant makes that one edit instead of four.
- **Separating classic from legendary for colour-blind hunters** wants a non-colour channel rather than a hue change — a ring or fill treatment on legendary, which is a design decision, not polish.

---

# Typeset pass — 2026-09-15
**Scope:** same file. **Method:** inventory the type scale, the font request and every fallback stack; measure wrapped copy line by line at phone width with range rectangles; measure numeral jitter directly rather than assuming it.

## Findings → changes

### 🟡 Medium
**A whole font family was requested that nothing renders.** The Google Fonts URL asked for Outfit at three weights. Measured: the stylesheet is **19,177 bytes with Outfit and 16,651 without — 2,526 bytes (13%) of a render-blocking request**, and 6 of its 44 `@font-face` blocks. → **Fixed:** Outfit is out of the request, and so is the dead `--brand` token that named it.
- **The near miss worth recording:** my first guard aborted the patch because Outfit appeared twice, not once. The second occurrence was `--brand:'Outfit','Archivo',…` — a family reachable through a token rather than a `font-family` declaration. `var(--brand)` turned out to be used zero times and, unlike every live token, was never re-declared in the light or dark-scope blocks. Removing the request while leaving the token would have been worse than doing nothing: the next use of `var(--brand)` would have fallen back to Archivo silently.

**Wrapped copy was leaving orphans.** Measuring every visible text block at 375px by its line boxes, **nine blocks ended on a line under a third of the width of the line above, the worst at 9%** — quest descriptions, the "Bounty board · owners want to be found" heading, two Most Wanted trace lines, and the feed's claim-a-tag copy. → **Fixed:** `text-wrap: pretty` on prose and `balance` on short headings. After: **six blocks, worst case 14%**, the quest descriptors moved from 16–19% to 27%, and the heading and one Most Wanted line left the list entirely. `pretty` improves the last line; it cannot rescue a block that ends in one long unbreakable token, which is why six remain.

### 🟢 Low
**One descriptor had no leading.** `.qd` sets 11.5px text that routinely wraps to two lines, with no `line-height`, while every sibling descriptor has 1.5–1.55. → **Fixed:** 1.5, computing to 17.25px. Verified it doesn't push quest cards into overflow at 320px.

### Measured and rejected
- **Tabular numerals.** The premise was that counters, streaks and prices jitter as digits change. Measured: Archivo's proportional figures differ by **0.04px** between `000000` and `111111` — imperceptible — and almost every numeric display in the app (`.amt`, `.num`, `.qpay .v`, `.rk`, `.cno`) is already set in JetBrains Mono, which is monospaced and therefore tabular by construction. The only Archivo-set numeral is a leaderboard position, which doesn't tick in place. Applying `font-variant-numeric` would have been a no-op shipped on a theory.

### Measured and left alone (correctly)
- **The type scale is wide** — about 25 distinct sizes including half-pixel neighbours (8/8.5, 11/11.5, 12/12.5, 14/14.5). Consolidating them into a ratio-based scale would move type on nearly every screen; that is a redesign, not a polish pass.
- **Ten micro-labels at 8–8.5px** (`.qpay .u`, `.ctl .cs`, `.chip`, `.cxcard .cno` and similar) are tracked uppercase labels sitting beside a larger value that carries the meaning — consistent with the product's design language, and nothing measured says they fail.
- **Fallback stacks are sound:** `--disp` falls back to system-ui, `--mono` to ui-monospace/SF Mono, and the one Racing Sans One use falls back to `--disp`.

## Verified
- **Fonts still load and apply:** three families resolve (Archivo, JetBrains Mono, Racing Sans One), 38 faces instead of 44, Outfit absent. Display elements compute `Archivo, system-ui…`, mono elements `"JetBrains Mono", ui-monospace…`, and the wordmark `"Racing Sans One", Archivo…` — no unexpected fallback anywhere.
- **The request in the file resolves:** HTTP 200, 16,651 bytes, 38 `@font-face` blocks, exactly three families, `display=swap` intact.
- **Wrap rules compute:** `.qd` and `.pfnote` return `pretty`, `.sechead` returns `balance`.
- **Leading:** `.qd` computes 17.25px at 11.5px — 1.5 — and a 320px sweep of the Hunts view finds zero elements past the screen edge.
- **Orphan count 9 → 6** at 375px, measured the same way before and after.
- Leftovers at zero: no `Outfit`, no `--brand`. No console errors; all inline scripts parse.

## Recommended (not done)
- **Archivo is requested at six weights** (400–900). A count of which weights the CSS actually selects would likely let two go, but each is only fetched when used, so the saving is CSS bytes rather than font downloads.
- **A type scale** would be worth defining if the app ever gets a design refresh — the half-pixel neighbours suggest sizes were chosen per component rather than from a ramp.

---

# Onboard pass II — 2026-09-15
**Scope:** same file. **Method:** re-walk a genuinely clean install (storage and IndexedDB wiped) against the six passes that landed since the first onboard pass, then take on the item that pass deferred — resuming what a signed-out tap was actually trying to do.

## Findings → changes

### 🟡 Medium
**Signing in forgot what you were doing.** The first onboard pass made twelve signed-out taps open the tag sheet instead of dying in a toast. But only one of them — add to crew — remembered the intent (`state.pendingCrew`) and finished the job afterwards. The other eleven dropped it: you tap Schedule a Hunt, claim a handle, wait for an email code, and land back on the Hunts list with nothing open and no hint of what you were mid-way through. Reproduced on a clean install: the toast reads "Sign in to schedule a hunt", the tag sheet rises, **and the hunt sheet never opens** — before or after signing in.

→ **Fixed:** `needTag(msg, resume)` now takes what to do afterwards, and `restoreProfile` runs it once on the same sign-in funnel that already resumes a pending crew add. Six taps now finish their own job:
- **Plan my hunt** → re-plans.
- **Activity inbox** → opens the inbox.
- **A shared hunt link** → replays the link. This is the one that mattered most: `routeDeepLink` wipes the query string *before* prompting, so a friend's link was gone for good. The parameters are now captured at tap time and replayed, so the hunt still opens after sign-in.
- **A shared hunter link** (`@handle`) → replays the same way.
- **Schedule a hunt** → opens the sheet.
- **RSVP** → completes the RSVP for the hunt you tapped, via a closure over its id.

**Deliberately not resumed**, which matters as much as what is:
- **The Hunter's Edition upgrade** starts a Stripe checkout. Auto-resuming would drop someone on a payment page they didn't ask for after an unrelated sign-in. Excluded on purpose.
- **File a lead, post a bounty, report a bounty** submit a form that is still on screen behind the tag sheet — closing it reveals their typed work, so a resume would risk double-posting to solve a problem that doesn't exist.
- **Dispute a bounty** captures a button element that is stale after a re-render.
- **Add to crew** keeps its existing persisted path.

**The intent is memory-only and self-cancelling.** It is a module-level binding, never written into `state`, so `Store.save()` cannot carry it across a relaunch — a stale intent firing days later would be worse than none. Closing the tag sheet while still signed out discards it, and the runner clears it before running so it cannot fire twice.

### Measured and left alone (correctly)
- **The clean-install walk found no regressions** from the optimize, critique, lore, animate, colorize and typeset passes.

## Verified
- **Clean install (storage and IndexedDB wiped):** intro opens as a labelled dialog with focus inside, the externalised `intro-911.jpg` loads, the splash video is fetched only now (`preload` auto, readyState 4) and **plays on the START tap**, the intro closes, the coach tip appears and is announced to the screen reader.
- **Intent recorded:** a signed-out Schedule a Hunt tap stores the intent with its reason, and raises the tag sheet with focus inside.
- **Abandon:** closing the sheet without signing in clears it; tapping again sets it afresh.
- **Resume:** running exactly what `restoreProfile` runs clears the intent first (so it cannot double-fire) and **opens the Schedule a Hunt sheet**, date prefilled, focus inside.
- **Deep-link replay:** a saved parameters object drives the hunt branch with no URL present — the quests view opens and the hunt is looked up.
- **Structure:** the runner sits inside `restoreProfile` immediately after the pending-crew block; `pendingIntent` appears nowhere in the persisted state.
- No console errors in any run; all inline scripts parse.

**Simulated, not driven.** A real sign-in needs an email round trip against production auth, which this pass would not drive. The resume was exercised by invoking it exactly as `restoreProfile` does, with an in-memory session stub that was reverted immediately afterwards.

## Recommended (not done)
- **A visible cue in the tag sheet** naming what is waiting ("Claim your tag to schedule your hunt") would make the resume feel intentional rather than surprising. That is copy plus nine translations, so it belongs in its own pass.
- **Form-submit resumes** would need a draft model rather than a replayed tap, to avoid double-posting.

# Layout pass — 2026-09-16

**Scope:** `index.html`, every tab (with every Garage, Map and Feed segment), the camera screen and 14 sheets, at 375×812 and 320×568, plus 375×667 and 390×844 for the verdict. **Method:** a scripted scan of the rendered screens, then measurements and screenshots of the things a scan can't judge.
- **What the scan checks:** nested or short scroll panes, anything spilling past the screen edge, text clipped by its container, text drawn over other text, content under the tab bar at full scroll, 1–3px alignment misses, uneven gaps in lists, and empty boxes that take space.
- **Test data:** six spots loaded into memory, including a 55-character model name, a for-sale price and a long event name.
- **Scanner checked first:** before its results were trusted, it caught every problem planted in a test fixture.

## Findings → changes

### 🔴 Critical
**The verdict card could run off the top of the screen, with no way to reach it.** `#verdict` is a bottom sheet with no height cap, and `#vcard` never scrolled, so a card taller than the screen lost its top: the photo, then the car's name. This is the screen after every capture.

| Screen | Ordinary capture | Long name + for-sale sign |
|---|---|---|
| 375×667 (iPhone SE, 8) | 96px hidden | 308px hidden |
| 390×844 | fits | 150px hidden |
| 320×568 | 169px hidden | 422px hidden |

This predates the pass: the card measured the same 990px tall and 422px above the screen with this pass's rules switched off.
→ **Fixed:**
- The card is capped at the screen height and scrolls.
- The Hunt again / Document / Share row is pinned to the bottom while it scrolls.
- A new verdict always opens at its photo.
- When the card fits, nothing moves: button and photo positions measured identical with the new rules on and off.

### 🟠 High
**Sheet headers stretched CLOSE across the header.** A global `.btn{flex:1}` (meant for rows of equal buttons) made CLOSE 195–271px wide on all eight `.sheethead` sheets, squeezing titles to as little as 72px ("Activity"). → **Fixed:** `.sheethead>.btn{flex:0 0 auto}`, and CLOSE is now 69px everywhere.

**Four sheets used the verdict card's styles but never got them.** `.vmk`, `.vyr`, `.vrow` and `.vbtns` were styled only inside `#vcard`, but the same markup is reused in the dossier, the Registry entry, the bounty sheet and the document-the-car sheet.
- The Registry entry's car name rendered at 16px regular weight instead of 21px/900.
- The dossier's meta line flowed inline, so a line began with a stray "·" and the FOR SALE chip split across lines.
- Button rows had no layout.

→ **Fixed:**
- The four rules are unscoped, with the same values.
- The meta text wraps in its own column beside the chip, and `.salechip` never breaks.
- The dossier's four actions sit two to a row (168px each).

**Two of the Feed's five tabs were off screen with no sign they existed.** The tab pill scrolls sideways; "The Lot" was cut to "TH" and "Rankings" was invisible. → **Fixed:**
- The edge with more tabs behind it fades (`data-more` start/end/both, mirrored for right-to-left).
- Choosing a tab scrolls it fully into view.

**The Registry entry's back button was nearly invisible.** It inherited the hero's placeholder colour (`--ghost-10`, 10% white). → **Fixed:** `#ceHero .back{color:var(--ink)}`. It is now #F2F3F6 on the dark pill, in both themes.

### 🟡 Medium
**Grid card footers drifted.** In the Spots grid a long name pushed one card's chip row 77px below its neighbour's. Registry status lines were off by up to 6px in 5 of 23 rows. → **Fixed:** card bodies are flex columns with the footer pinned to the bottom; offsets now measure 0px in both grids.

**The Schedule-a-hunt form was cramped and misaligned.**
- The intro note was centred above a left-aligned form, with 0px before the first label.
- The date and time row left 0px before the next field, where every other field gets 11px.

→ **Fixed:** the note is left-aligned with 14px below it, and `.whenrow` gets the same 11px.

### 🟢 Low
**Header controls ended 2px short of the cards.** Headers used 18px side padding and bodies 16px, so the right edges sat at 357px versus 359px. → **Fixed:** `.vhead` uses 16px, and both measure 359px.

**Empty status lines left dead space.** `#mapinfo` (12px) and `#lbNote` (10px) took space while empty. → **Fixed:** they are hidden while empty.

**One-day expeditions read "SEP 16–16".** → **Fixed:** `fmtRange` returns "SEP 16" when start and end match. Multi-day ranges within a month and across months are unchanged, and were checked.

## Verified
- **Scanner sweep:**
  - Before the fixes, it reported no clipping, overlap, spills, nested scrolls or content under the tab bar on any tab at either width. The problems above came from measurement and screenshots.
  - After the fixes, at 320×568, it reported only three things, none a new problem:
    - the pre-existing verdict overflow, now fixed
    - the 2px inset that section headers use everywhere by design
    - a content-width pill

  No script errors.
- **CLOSE buttons:** 69px on premSheet, huntSheet, bountySheet, inboxSheet, opSheet, cmtSheet, eventSheet and hunterSheet.
- **Registry entry:** title computes to 21px/900, meta row to flex, and the back label to rgb(242,243,246), with a light-mode check too.
- **Dossier:** meta row is flex; the sale chip sits on one line beside the LEGENDARY chip; buttons form 2 rows of 168px.
- **Grids:** Spots chip rows and Registry status lines both measure 0px offset per row.
- **Schedule a hunt:** note is left-aligned with a 14px gap; the date row is followed by an 11px gap.
- **Header edges and empty lines:** header and card right edges both measure 359px; the empty `#mapinfo` computes `display:none`.
- **Feed tabs:**
  - At load, only the end edge fades.
  - Choosing Rankings requests a +180px scroll that brings it fully into view, and the fade flips to the start edge.
  - Car of the Day in the middle fades both edges; Latest resets.
  - In right-to-left, scrollLeft reaches −159 and the fade gradient flips direction.
  - Smooth scrolling was proven by capturing the `scrollBy` request, because the hidden preview pane doesn't animate scrolls.
- **Verdict at 375×667 (heavy card):**
  - The card top sits at 10px and the photo is fully visible.
  - Hunt again is visible and hit-testable at scroll 0.
  - At full scroll the last block ends 4px above the pinned row.
  - A swipe down mid-scroll leaves it open; a swipe from the top closes it, driven with touch events.
  - Reopening after scrolling to 300px starts at 0.
- **Verdict at 390×844 (ordinary card):** positions identical with and without the new rules.
- **Dates:** "SEP 16", "SEP 16–18" and "SEP 30 – OCT 2".

## Recommended (not done)
- **Feed "↻ REFRESH" row:** a full-width button takes the first 56px of the feed. An icon beside the inbox bell would reclaim it, but it moves a control people already use, so that's a product call.
- **Segment pills:** they hug their content (`width:max-content`), so Garage, Map and leaderboard pills end at different widths. That looks intentional and was left alone. Equal full-width segments would be a design change.
- **Verdict content:** it is long by design (a 4:3 photo up to 16:10, the payline, quest hits and the for-sale block), so it now scrolls on most phones for the heaviest captures. Trimming it would be a distill-style decision.
- **Sheets that need a signed-in account with real data:** hunterSheet, cmtSheet and inbox content were only scanned in their signed-out or empty states.

# Adapt pass — 2026-09-16

**Scope:** `index.html` across screens, orientations, inputs and contexts. **Method:**
- **Scanner sweeps:** every tab and 11 sheets at nine sizes: 320×568, 375×667, 375×812, 390×844, 667×375, 812×375 and 932×430, plus desktop 1280×800, which renders the same 480px column as a tablet.
- **New checks:** content that no scroll can reach, and tap targets under 24px and 44px. The unreachable check was validated by switching off today's verdict fix: it found 3 hits, and 0 with the fix back on.
- **Measured:**
  - header and tab-bar share of the screen
  - hover rules on touch
  - WCAG 1.4.12 text spacing
  - landscape safe areas
  - behaviour with JavaScript off

## Findings → changes

### 🟠 High
**In landscape the tab bar floated across the middle of the screen.** The landscape rules make the camera controls (`#huntfoot`) absolutely positioned, which removed the element that pushed `#tabs` to the bottom of the flex column. At 667×375 the bar sat at y 97, over the camera's top bar and over every tab's list. Views measured −14% visible content. → **Fixed:** `#tabs{margin-top:auto}` in the landscape query. The bar now sits at y 314–375, and no camera control reaches under it.

### 🟡 Medium
**Landscape headers used 40% of the screen.** Garage, Map and Feed headers were 150px of a 375px-tall screen, leaving content 44%. → **Fixed:**
- In landscape the segment control sits beside the title (CSS grid), so headers are 88px and content gets 60%.
- The Feed's control stops before the refresh and bell icons (right edge 551 vs icons at 559).
- In right-to-left the control reserves the streak ring's space; before that it overlapped the ring (16–287 vs 14–66).

**Landscape content ran under the notch.** The page sets `viewport-fit=cover`, and landscape lets `#app` fill the full width, but only the camera controls honoured `safe-area-inset-right`. There was no left inset anywhere. → **Fixed:**
- In landscape `#app` takes left and right margins from the safe-area insets, and the camera controls' own inset is dropped so it doesn't double up.
- With a simulated 47px inset, the app spans 47–765 at 812×375 and no element crosses the edges.
- Without a notch both margins compute to 0px.

**Small tap targets on the most-used controls.** Nothing measured under 24px (WCAG 2.5.8 passes), but frequent controls were well under 44px:

| Control | Size |
|---|---|
| Like | 29×28 |
| Comment | 34×28 |
| Feed card handle | 132×29 |
| Plan my hunt | 121×33 |
| Profile close | 76×32 |
| Camera activity bar | 347×29 |
| ‹ Registry / ‹ Back | 109×32 / 77×32 |
| Profile fold headers | 36 tall |

→ **Fixed:**
- **Buttons:** an invisible `::before` extends each hit area to at least 44×44 without moving anything. A tap 6px above each button now hits it.
- **Fold headers:** already use `::after` for the chevron, so they got padding with an equal negative margin: 44px to tap, same position on screen.
- **"‹ Back":** its inline `position:static` is overridden, so the extension anchors to the button itself.
- **Feed card handle:** the card's rounded clipping limits the extension to the card, so it's 41px effective and never steals taps from outside the card.

### 🟢 Low
**No message with JavaScript off.** The page rendered black. → **Fixed:** a full-screen `<noscript>` explanation. Proven by loading the page into a sandboxed iframe without script permission: the message rendered at 375×600 and no app script ran.

## Verified
- **Unreachable content:** none at any of the nine sizes after the fixes, and no page-level sideways scroll.
- **Landscape at 667×375, 812×375 and 932×430:** the tab bar is at the bottom; headers are 88px; no overlaps in the header scan.
- **Right-to-left landscape:** the segment control clears the ring.
- **Desktop 1280×800:** a centred 480px column (x 400–880).
- **Remaining scanner hits:** only text scrolling beneath the verdict's pinned action row, which is intended.
- **Hover:** the stylesheet has **zero** `:hover` rules, so nothing gets stuck in a hovered state on touch. Interaction feedback uses `:active`.
- **Text spacing (WCAG 1.4.12):** line-height 1.5, letter-spacing .12em, word-spacing .16em and 2em paragraph spacing on every screen and sheet at 375×812.
  - No clipped text, no overlaps, and nothing unreachable.
  - No button, chip, tab or segment label spilling outside its box.
  - The only other hits: a textarea's own scroll and the verdict's pinned row.
- **Hit areas:** each `::before` computes to 44px tall. The fold header measures 43px with a −4px margin. The two back pills kept their positions (12,10 and 16,18).
- **Platform floor, re-confirmed:** `interactive-widget=resizes-content` plus the visualViewport keyboard handler; `orientation:any` in the manifest; pinch zoom allowed (no `user-scalable=no`); 100dvh app height.

## Recommended (not done)
- **Short desktop windows:** a desktop or laptop window under 520px tall matches the phone-landscape query, so the app spreads to full width. Adding `(pointer:coarse)` to both landscape queries would keep desktops in the column, but touch laptops are the edge case to check first.
- **Tablets:** the app is a phone-width column with black sides. A tablet layout (two columns, or a wider feed) is a design project, not a polish fix.
- **Dates and numbers:** they format with the device locale, not the app language. A German UI on an en-US phone shows "9/16/2026". Passing the chosen language to `toLocaleDateString` and `toLocaleString` would fix that, but it touches every date site.
- **System font scaling:** not testable here. Android Chrome's text-scaling setting and iOS Dynamic Type (in the Capacitor shell) need a device check at 130% and 200%. Most sizes are in px.
- **On-screen keyboard:** covering inputs in sheets can't be emulated in the preview pane. The existing visualViewport handler should cover it; worth a device check on the dossier and schedule forms.

# Clarify pass — 2026-09-16

**Scope:** `index.html` messaging: all 144 toasts, the 12 sign-in prompts, empty-state and error copy, plus the toast component that displays them. **Method:**
- Extracted every toast and prompt with its line number.
- Read each error in context.
- Sorted the raw errors the app surfaced into kinds the hunter can act on.
- Drove every changed path in the preview with stubbed failures.
- Checked German and Japanese rendering, and swept all 128 distinct toast strings for overflow at 375px (English) and 320px (German).

## Findings → changes

### 🟠 High
**Seven failures showed the raw system error.** Plan my hunt, schedule a hunt, delete account, sending the sign-in code, checking the code, verifying queued shots, and naming a Star Car all appended `e.message`. People saw strings like "plan 502 · planner upstream 529", "Email rate limit exceeded", "hunt plan timed out" or "duplicate key value violates unique constraint". None of these are translatable, and none say what to do. → **Fixed:**
- **One sorting step** (`errorKind`/`plainError`) turns an error into one of five actionable sentences:
  - no connection
  - too many tries
  - check the email address
  - wrong or expired code
  - server busy
- **Anything else** gets a fallback written for that screen ("Couldn't schedule the hunt — try again").
- **Raw errors** now go to the console only.
- **The verify queue** says whether shots will retry when you're back online.
- **The Star Car trigger's own sentence** ("Only a car in your Stable can be a Star Car.") is kept, because it was written for people.

**Toasts ran off both sides of the screen.** `#toast` was `white-space:nowrap`. 11 of 128 English messages overflowed the pill at 375px (by up to 177px), and translations are longer. Toasts also vanished after a fixed 2.6s, whatever their length. → **Fixed:**
- Toasts wrap: at most 88% wide, centred, lines balanced.
- They stay up about 55ms per character, between 2.6s and 7s.

### 🟡 Medium
**Sign-in prompts that led nowhere, or used a different word.**

| Before | After |
|---|---|
| "Sign in first" (notifications) | "Sign in to turn on notifications", opens sign-in, then turns them on afterwards |
| "Duels need an account" | "Sign in to start a duel", opens sign-in |
| "Lobby codes need an account — host by name instead" | "Sign in to join a lobby by code — or host one by name" |
| "You're not signed in on this copy of the app" | "Sign in on this phone to delete your account", with no resume, because it's destructive |
| "Claim a tag to join in" (like/comment on the public feed) | "Sign in to like, comment and add hunters to your crew" |
| "Sign in first — tap the streak ring…", on every launch and reconnect | On its own: "Your shots are saved — sign in to verify them", with no sheet. A tap on the queue pill opens sign-in and verifies afterwards. |

**Messages that didn't say what or why.**

| Before | After |
|---|---|
| "Sign-in unavailable — library blocked" (×2) and "…right now" | "Sign-in couldn't load — check your connection or content blocker, then reopen the app" |
| "That date didn't parse" | "Pick a date and a start time" (an existing, already translated sentence) |
| "Couldn't add" (×2) | "Couldn't add them to your crew — try again" |
| "Couldn't update that" (×2) | "Couldn't save your RSVP — try again" / "Couldn't update that sighting — try again" |
| "Export failed" | "Couldn't export your garage — try again" |
| "Storage is full — new spots may not survive a reload" | "…export your garage from Your Tag › Account so nothing is lost" |
| Feed with sign-in not loaded: "Sign in (tap the streak ring)…", which is impossible in that state | "The community feed couldn't load — check your connection, then reopen the app" |

All 28 new sentences are translated into French, Spanish, German, Italian, Portuguese, Japanese, Thai and Arabic.

## Verified
- **Error sorting:** `Failed to fetch` and Safari's `Load failed` → no connection; a 429 or "Email rate limit exceeded" → too many tries; "Token has expired or is invalid" → code; "invalid format" → email; "upstream 529" and "timed out" → busy; a duplicate-key error → fallback.
- **Plan my hunt, driven:** a rejected fetch gives the no-connection sentence; a 502 with "planner upstream 529" gives the busy sentence; a malformed 200 gives the fallback.
- **Sign-in code, driven:** a stubbed rate-limit error shows "Too many tries — wait a minute, then try again".
- **Sign-in prompts, each opening the sign-in sheet with its sentence:**
  - notifications (resume set)
  - duel
  - lobby code
  - delete account: the button resets to DELETE ACCOUNT and no resume is set
  - like on the public feed

  The queue opens nothing when it runs on its own, and opens sign-in with a resume on a tap.
- **Leftovers:** none of the old phrasings and no `toast(...message...)` remain; all 28 new keys are used in code.
- **Translations:** German showed the no-connection, storage, saved-shots and sign-in-load sentences; Japanese showed too-many-tries, duel and Star Car.
- **Toast sweep, English, 375px:** 128 strings, 0 overflow, at most 2 lines.
- **Toast sweep, German, 320px:** 0 overflow, at most 4 lines (the sign-in-load message), and the toast sits above the tab bar (top 411 vs 507).
- **Durations:** 2600ms for "Dossier saved", 4675ms for the longest English message.

## Recommended (not done)
- **Game labels that can read as buttons:** "OPEN" on Hunts cards, "AT LARGE · BADGE" on Wanted, "×1". They're product voice, but "OPEN" in the accent colour at a card's right edge can read as a button. Worth a copy decision ("TO FIND"?) before changing, since it ripples through 8 languages.
- **Same number, two names:** the AI confidence reads "88% MATCH" in the dossier and "VERIFIED · 88%" on the verdict. Pick one.
- **Untranslated toasts, pre-existing:** "Enter the review code" is store-reviewer only. "Sign in and we'll add … to your crew" and "Sign in to see @…" have a name joined on, so no dictionary key matches them; they'd need a placeholder-aware lookup.

# Polish pass — 2026-09-16

**Scope:**
- **App:** `index.html`, focusing on what shipped after the Sept 13 floor: Car of the Day header and share button, morning-push toggle, Feed refresh icon, Feed tab fade, the verdict's pinned actions, and the MATCH label.
- **Website:** today's two new pages, `today.html` and `lost.html`.

**Method:**
- `scan.sh` on all three, plus `car.html` as the reference.
- Contrast computed from each element's resolved text colour and composited background, in dark and light app themes and on the website. Gradients were checked with `contrast.py` at their stops.
- Detail sweep: console errors and failed requests on a fresh load, debug logging, theme-color, internal links and the OG image.
- Read the app's own telemetry table.

## Findings → changes

### 🟠 High
**Light theme: two text colours and the focus ring were below the bar.** `--pulse-hi` (#6FA5FF) is a blue meant for dark surfaces:
- **"88% MATCH" on the verdict:** 2.47:1 on the white card.
- **Condition chips ("GOLDEN HOUR"):** 2.47:1.
- **Keyboard focus ring on every control:** 2.47:1 against white, where a focus indicator needs 3:1.

→ **Fixed:** in light mode those two components and the ring use the theme's accent `--ember` (#1D4FE0, 6.47:1). Surfaces that stay dark inside light mode (camera, HUD) re-declare `--ember` as #18B7DC, so their ring stays light. Dark theme unchanged.

**"Copied" was shown whether or not the copy happened.** `copyText` (COPY CODE on your tag, and the crew invite copy) didn't wait for `clipboard.writeText`. A failed write, for example with the document unfocused, still said "Copied" and escaped as an unhandled rejection. It shows up once in field telemetry. → **Fixed:** it waits for the write; on failure the toast shows the code itself so it can be copied by hand, which is how the three other copy actions already behaved.

### 🟢 Low
**Telemetry was mostly noise.** 73 of 74 `client_errors` rows in 14 days were "camera: Permission denied". That's a person declining the camera, or a device without one, and most came from local preview sessions. Real errors would have been hard to spot. → **Fixed:** declined camera, missing camera and security errors aren't reported, and nothing is sent from localhost or loopback. A camera that's in use (`NotReadableError`) and every other error still report.

## Verified
- **Floor scan:** `today.html` and `lost.html` carry the same floor as `car.html`:
  - `:focus-visible` rule plus a forced-colors variant
  - reduced-motion rule
  - `::selection`
  - status regions with `role="status"`

  No `outline:none` and no clickable divs. The app's inline scripts parse.
- **Website contrast:**
  - `today.html`: lowest 6.66:1 (muted text on the gold-tinted story box, #98A0AC on #1B1912). "Start hunting" measures 9.88 and 6.98:1 at its gradient stops.
  - `lost.html`: lowest 6.98:1.
- **App contrast, dark:**
  - Car of the Day eyebrow and headline: 12.25:1
  - status line: 7.46
  - share button: 16.45
  - refresh and bell icons: 6.92
  - toast: 15.68
  - MATCH: 7.58
- **App contrast, light:**
  - gold headline on the worst point of its tint (#8A5C00 on #E7E4DC): 4.58:1
  - status line: 5.86
  - icons: 6.34
  - MATCH after the fix: #1D4FE0 on white, 6.47
- **Light-theme fix:** MATCH label and condition chip compute to rgb(29,79,224); in dark theme both remain rgb(111,165,255). The light focus rule is present and `--ember` resolves to #1D4FE0 on app surfaces and #18B7DC inside `#hud`.
- **Focus ring coverage:** the global `button:focus-visible` rule covers today's new buttons (share, refresh, push toggle, Feed tabs). A real Tab press couldn't show a ring, because the pane was hidden (`document.hidden` true, no focus), so the proof is the rule plus its resolved colour.
- **copyText:** with `writeText` rejecting ("Document is not focused"), the toast shows "TH-ABCD-EFGH" and no unhandled rejection fires; resolving shows "Copied".
- **Telemetry:** the shipped function was re-run with a production hostname and a fetch spy. Permission-denied and device-not-found camera errors send nothing; "Could not start video source" and a real verify error are sent. On localhost nothing is sent.
- **Detail sweep:**
  - A fresh load has no console errors and no failed resources; its only request is the telemetry row now filtered.
  - Zero `console.log` calls.
  - theme-color follows the appearance (#F4F6FA / #0A0B0E).
  - Every internal link on the two new pages resolves; `og.png` returns 200 live.

## Recommended (not done)
- **Clear the test noise:** delete the existing camera-denial rows (`delete from client_errors where message = 'camera: Permission denied'`) so the table starts clean. It's a data change, so it's left for you.
- **Light focus ring on a real device:** the pane can't render it, so glance at a Tab press in light mode on a laptop.

# Normalize pass — 2026-09-16

**Scope:** `index.html` design scale: font sizes, border radii, repeated inline styles and a duplicated component. **Method:**
- Inventory every font-size (property and `font:` shorthand), radius, letter-spacing, z-index, hex literal and inline `style=""`.
- Before patching, simulate the type change in the live stylesheet at 320×568: count text blocks whose line count changes across garage, Registry, hunts, feed, camera, profile and dossier (438 blocks), and scan for overflow. Rounding down, up, split and two mixed variants were compared.
- After patching, re-inventory, read computed values back, and re-run the layout/adapt sweep at 375 (English) and 320 (German), plus the 128-string toast sweep.

## Findings → changes

### 🟡 Medium
**The type scale had eight half-pixel sizes beside their whole neighbours.** 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5 and 16.5px appeared 79 times across chips, tab labels, eyebrows, field labels, notes, card names and toasts, giving 30 distinct CSS sizes. → **Fixed:** rounded to whole pixels by role:
- 8.5→9 and 9.5→10: the smallest labels round up for legibility.
- 10.5→10.
- 11.5 and 12.5 both → 12: one body size where there were two.
- 13.5→13, 14.5→14, 16.5→16.

22 CSS sizes remain and none are half-pixel. Chosen because it moved the fewest lines: 5 of 438 blocks changed, all losing a line (two-line Registry names and a hunts line fitting on one); no block gained a line and nothing overflowed. The "round up" variant made Registry names wrap to 3 lines.

**Radii drifted off the token scale.**
- **Verdict card:** asymmetric top corners (`var(--r-lg) 24px 0 0`: 18px left, 24px right).
- **Pills:** `99px` beside `999px`.
- **Literal duplicates of token values:** `14px` ×2 (= `--r-md`) and `10px` ×2 (= `--r-sm`).
- **Near-misses:** `12px` ×2 and `16px`.
- **Scattered 8px:** focus ring, tap chips, viewfinder corners.

→ **Fixed:**
- The verdict card is 18px on both top corners.
- Pills are all `999px`.
- Literals use their tokens.
- 12px thumbnails take `--r-sm` (10px); the intro's sample verdict card takes `--r-lg` (18px), matching the real card.
- A new `--r-xs: 8px` names the 8px family.

The remaining radius values are tokens, pills, circles and 2–3px progress-bar ends.

### 🟢 Low
**Eight identical inline styles.** Every `.sheethead` CLOSE button carried `style="padding:8px 14px;font-size:10px"`. → **Fixed:** one `.sheethead>.btn` rule; the attributes are gone. The buttons compute exactly as before (8px 14px, 10px, 69×44).

**The same back pill came in two sizes.** The dossier's "‹ GARAGE" pill was 44px tall; the Registry entry's identical "‹ REGISTRY" pill was 32px. → **Fixed:** the Registry pill matches at 44px.

## Verified
- **Re-inventory:** 0 half-pixel sizes in CSS or inline styles; 22 CSS font sizes; 14 radius values, all tokens, pills, circles or bar ends.
- **Computed readback:**
  - chip 9px; tab label 10px; eyebrow 10px; note 12px; toast 12px
  - verdict card corners 18px / 18px / 0
  - Registry and dossier back pills both 44px
  - schedule-sheet CLOSE: padding 8px 14px, 10px, 69×44, no inline style
  - `--r-xs` resolves to 8px
- **Sweeps:**
  - Adapt sweep at 375×812 (English) and 320×568 (German): no spills, clipping or unreachable content. The only hits are verdict text scrolling beneath its pinned action row, which is intended.
  - Toast sweep, German, 320px: 128 strings, 0 overflow, at most 3 lines (was 4 at 12.5px).
- **Screenshots:** Registry grid and Hunts at 375 unchanged in layout.

## Recommended (not done)
- **Near-duplicate whole sizes:** 16/17, 19/20, 21/22 and 24/25/26px. Merging them is a visible 1px change to headings and needs a type-scale decision.
- **Letter-spacing:** 21 values between .01em and .34em on uppercase labels. Tracking is tuned per size, so snapping it is a design decision.
- **Two CLOSE styles:** sheet headers use a rounded-rectangle `.btn`; the Your Tag sheet uses a pill. Pick one.
- **Spacing:** inline margins use 2/3/9/10/12/14px. A spacing token scale would come before converting them.
- **z-index:** it already falls into bands (1–8 local, 20–30 sheets, 40–60 overlays), but as literals. Tokens would stop future collisions.
- **Colour literals:** most hex literals are the always-dark surface re-declarations, which the colorize pass deliberately kept. Not a normalize target.

# Design calls — 2026-09-16

**Scope:** the four decisions the normalize pass left open, made on Drew's behalf. **Method:**
- Map every value to the elements that use it and decide by role.
- Simulate size and tracking changes together in the live stylesheet and inline styles in German at 320×568 (611 text blocks across 13 screens and sheets): line-count diffs plus overflow and label-spill scans against a baseline.
- Patch, read computed values back, and re-sweep at 375 (English) and 320 (German).

## Decisions → changes

**1. Near-duplicate heading sizes → two heading steps.** The 1px pairs were the same roles at different sizes. → **Decided:**
- **Car titles, 20px** (was 19 and 21): Car of the Day name, verdict and Registry title, bounty and document car names, stat values, plan price.
- **Hero titles and handles, 24px** (was 22, 25 and 26): Hunter's Edition hero, tag-card title, profile handle, angle-slot glyph, next to the existing 24px view titles.
- **16px** for the camera wordmark and badge titles (was 17).

CSS sizes go from 22 to 16. The profile handle is fluid within the two steps (`clamp(20px,7vw,24px)`), and the Your Tag title's clamp floor moves from 19 to 20. A fixed 24px handle made 14-character handles like "@curatorofspeed" truncate at 320px, where they had fit at 22px. The fluid size keeps them fitting (22.4px at 320, 24px at 375).

**2. Letter-spacing → seven steps by role** (was 21 values from .01em to .46em):

| Step | Role |
|---|---|
| −.01em | tight display |
| .02em | titles and handles |
| .05em | mono numbers and body |
| .1em | buttons and pills |
| .16em | chips, tab and segment labels |
| .22em | small-caps labels |
| .32em | eyebrows and section heads |

Every value moved by at most .02em, except the intro's one-off .46em subtitle, which joins the eyebrow step.

**3. Two close-button styles → the pill.** Every other header control is a pill (back buttons, Plan my hunt, segments, round icons); the eight rectangular sheet CLOSE buttons were the exception. → **Decided:** one rule gives all nine CLOSE buttons Your Tag's pill: 9px 14px, 11px/800, .1em, panel fill, hairline border, 32px tall, with an invisible 44×44 hit area. Your Tag's inline styling moved into the rule.

**4. Spacing and layering.**
- **Layering → named tokens, values unchanged.** The z-index values already formed bands. They're now named `--z-*` tokens in `:root`, listed bottom to top: `--z-view`, `--z-tabs`, `--z-verdict`, `--z-entry`, the sheet layers, `--z-toast`, `--z-flash`, `--z-photo`, `--z-intro` and `--z-busy`. The camera's internal 1–8 stay local.
- **Spacing → left as tuned, deliberately.** 192 of 681 spacing values are odd pixels (3/5/7/9/11/13/15), spread through nearly every component: chip padding, card insets, row gaps. Snapping to an even grid would move almost everything by 1px, with nothing a person could see, and it risks rewraps in tight chips. It's per-component tuning, not drift.

## Verified
- **Simulation** (German, 320×568, sizes and tracking together): 72 rule changes; 0 of 611 text blocks changed line count; no new spills or clipping. The only differences were the verdict's intended pinned-row overlaps shifting a few pixels because titles went from 21 to 20px.
- **Inventory after patch:** tracking values are exactly [−.01, .02, .05, .1, .16, .22, .32]em; 16 CSS font sizes.
- **Layering:** all 22 layered elements keep their exact computed z-index (verdict 20, entry 21, dossier and coach 22, angles 23, profile 24, social sheets 25, hunt 26, moderation 27, premium 28, operator 29, profile-over 29, toast 30, flash 40, photo 46, intro 50, reel 60, tabs 8, views 6).
- **Close buttons:** schedule-sheet CLOSE and Your Tag CLOSE compute identically (9px 14px, 11px, 800, 1.1px tracking, 999px radius, 32px tall, panel fill), each with a 44px `::before` hit area.
- **Computed readback:** verdict title 20px; eyebrow tracking 3.2px (.32em at 10px); chip tracking 1.44px (.16em at 9px).
- **Sweeps:** adapt sweep at 375×812 (English) is completely clean; at 320×568 (German), only the intended verdict pinned-row overlaps.
- **Handle fit at 320px:** 12, 13 and 14 characters fit at 22.4px (14 had truncated at a fixed 24px); at 375px the handle is 24px and fits.
- **Screenshots:** schedule-sheet and Your Tag headers show the same CLOSE pill.

---

# Bug bash before the beta round (Sep 17 2026)
**Scope:** app, website, database, edge functions · **Method:** server logs and cron history, security advisors, a fresh-origin walk of the app with the layout scanner, asset checks on both domains, and the first real tester's rows.

## Findings
### 🟠 High
**Registry matching used substrings.** A model token could match inside another word or number, and the judge's bracketed hedges ("(M340i/M3-styled)") counted as the model. The first beta tester's BMW 3 Series was credited as an M3. → **Fixed** (32faed2): tokens must stand alone (`tokenIn`), bracket hedges are stripped before matching (`HEDGE`, `spotStr`), and the Ferrari 512 BB tokens were tightened. The tester's capture row (id 100) was corrected in the database to `x:bmw 3 series`.

### 🟡 Medium
**Make lists used the same substring test.** → **Fixed** (d248d17): `inSet` and the JDM model test use `tokenIn`. Practical changes: a make of exactly "MG" now counts as British; "Ramsey" no longer counts as American.
**Four Car of the Day SQL functions had a mutable `search_path`.** → **Fixed** in migration `bugbash_search_path_and_miscredited_capture`.

### 🟢 Low / noted
- `/.well-known/apple-app-site-association` is 404 on the app domain. Only matters for iOS universal links.
- Advisor items left as they are: security-definer views (safe columns only), pg_net in `public`, leaked-password protection off (email-link sign-in), RLS-enabled tables with no policy (service-role only by design).
- `client_errors` in the last day: 5 rows, all "camera: Permission denied" from the preview pane on the build before the filter. None from testers.

## Verified
- 8 cron jobs, 0 failed runs; no failed `pg_net` calls; no edge-function errors.
- Every admin RPC checks `is_admin()`; trigger functions are not callable by clients.
- Fresh-origin walk (intro, all tabs, signed-out capture, queue pill to sign-in): no scanner findings, no script errors.
- Website and app assets all 200 apart from the item above.
- Both app fixes confirmed live by byte-compare against the repo.

## Recommended (not done)
- Tell the judge not to put guesses or "X-styled" notes in make/model. The app now strips them, so this is tidiness; it needs a full redeploy of `verify` and was not worth the risk on beta day.

---

# Dossier hero and the missed for-sale sign — 2026-09-19
**Trigger:** a Studebaker Lark at Cars & Coffee. Portrait photo, car in the upper third: the 16:10 hero cropped the middle of the photo, so the roof was cut and the clock sat on the car. It also had a plain FOR SALE sheet in the window that the judge did not flag, and the app only offered the sign slot when the judge had.

**Hero → Fixed.** `verify` returns `subject_norm` (the vehicle's box). `frameHero()` centres that box in the hero space below the safe-area inset, zooming up to 1.5× when the car is small. Hero height is 16:10 plus the inset; a scrim sits under the status bar; `#dFull` opens the whole photo. Spots without a box call `verify` mode `frame` once (`findSubject`). Garage tiles use `focusPos()`.
**For sale → Fixed.** `anglesFor()` always offers the sign slot. `verify` returns `sign_seen`; the verdict card asks "is it for sale?" when a sheet was seen but not read. The for-sale rule now counts store-bought FOR SALE signs even when the handwriting is unreadable. A failed sign close-up says so in a toast. Make/model are now names only (no bracketed guesses).

**Verified:** in the preview with the real photo at 375×812, with and without a simulated 59px inset (car centred between the buttons, below the clock); verdict card prompt renders and its button exists; six slots on a non-for-sale car; tile focus `49% 40%`; scripts parse; function boots and rejects bad tokens.
**Not verified:** the new judge fields against a live photo — that needs a signed-in capture.

---

# Star Car page — 2026-09-24
**Trigger:** Drew: "Does the Stable feel like a hero feature? Make it feel like CarDomain used to — the HERO profile for your car." Live numbers agreed: one owned car, no Star Car named, no sightings. **Method:** four readers mapped the Star Car, shell, website and database paths; three independent designs were scored by a judge (plumbing-first rails, hero-first poster grafted on, owner-loop hooks kept); built as guarded patches; driven live in the preview; a four-lens review with adversarial verification found 12 real defects, all fixed before shipping.

## What changed
- **The car page** (`#carPage`, z `--z-car` tied to the profile on purpose, later in the DOM). Hero framed on the car (`frameHeroIn`, shared with the dossier), the given name on a bottom scrim, make · year · rarity, then SIGHTINGS / HUNTERS / FIRST TO FIND, a gold **Needs you** card of pending sightings (THAT'S MINE ✓ / NOT IT), the naming card, SHARE CARD / BOUNTY / EDIT DETAILS / COPY LINK, the public **story** editor, the local **gallery** (angle photos), **The paparazzi**, and the owner/since foot. Visitors (`/?car=<id>`, or a car that is not mine) get the same layout read-only from the anon-safe `star_car` RPC. The page paints from local state first and enriches from the server.
- **The Stable moved to the profile:** one wide tile per owned car (`stableTileHtml`), name on the photo, fame line under it, a real 44px bounty button once the dossier is full. The Garage's STABLE segment, `#segStable`, `renderStable` and the `#stableGrid` listener were retired together. The dossier keeps THIS ONE'S MINE and gains an OPEN ITS PAGE launcher; its back button reads ‹ ITS PAGE after a hand-off.
- **Routes:** the `/?car=` boot redirect to www is gone; the deep link (which the sighting push already sends) opens the page in the app. Inbox sighting rows read REVIEW IT → and open the page. `carLink()` beside the other link builders.
- **Website `car.html`:** poster hero (name on the photo), fame sentence, story / mods / gallery slots (mods and gallery render only when the RPC sends them), no coordinates on a public page, `encodeURI` for storage paths, "Open in the app". Nav and footer link Star Cars.
- **Database (`star_car_page_lockdown_story`):** `star_cars.story` (≤600); authenticated may INSERT (capture_id, name) and UPDATE (name, hidden, story) only, with a BEFORE UPDATE pin trigger; `sightings` UPDATE (status) only; `star_car()` returns story and capture_id. Proven in a rolled-back transaction: the app's insert/update/curation still work; re-pointing a car, rewriting a sighting's hunter and deleting are refused; anon RPC returns the story.
- **Rule kept:** owned cars stay out of Registry, rank and odometer (nothing in `hunterStats`, `codexAgg`, `odoCount` or `recompute_hunter_stats` changed).

## Review findings fixed before shipping
- 🔴 A failed request (offline, expired token, 5xx) was read as "no Star Car" and written to local storage; the page then offered to name a car that already had a row. → both fetches read `error` and throw into the catch that keeps the cache.
- 🟠 The server repaint reset the hero crop to centre; every curation tap did the same. → `paintCarPage` re-frames after every paint.
- 🟠 A repaint wiped a half-typed story and the scroll position. → `paintCarPage(keep)` carries drafts, focus and scroll across server repaints.
- 🟠 Before the rows landed the stats showed zeros. → cached `s.star` counts stand in, with "Loading…".
- 🟡 Naming while another car's page had opened touched the wrong page. → guarded on `cpSpot === s`.
- 🟡 The dossier's launcher, tapped in a dossier opened from the page, opened a second copy. → routes through ‹ ITS PAGE.
- 🟡 Swipe-dismissing the dossier, deleting the spot, or un-owning it left a stale return. → swipe = back; delete and un-own clear it.
- 🟡 Sign-in resume left the tag sheet stacked above the page. → the resume drops the sheet first.
- 🟡 Swipe-dismiss did not see `#cpBody` (or `#dBody`) as the scroller. → `scrollableIn` covers both.
- 🟢 The nameplate painted over the full-photo button; the rarity chip lost its palette in light theme; sighting rows squeezed the handle at 320px. → plate z removed, `#cpPlate` in the dark-scope list, rows wrap with an ellipsised handle.

## Verified (preview, 375×812, simulated 59px notch)
Profile tile → page (‹ STABLE) → EDIT DETAILS → dossier (‹ ITS PAGE) → back → page → close → profile re-rendered; dossier launcher → page (‹ BACK); Escape closes; owner mode with a stubbed client: Needs you → THAT'S MINE ✓ moves the row and the counts, story saves, naming flips the page to STAR CAR with COPY LINK and the editor; visitor mode read-only; a missing car toasts and stays closed; deep link by public id lands the owner on their own page; inbox sighting → page; light theme keeps the hero pills dark over the photo; Garage segment taps clean; failed fetch keeps the cached car; draft and scroll survive a repaint; the full-photo button is hit-testable; the website page at phone and desktop widths with a stubbed RPC.

## Recommended (not done)
- Step two: `star_cars.mods` and a `star_car_photos` table with upload from the page (slots are reserved on both pages); likes/comments on the car; rename/unpublish; a hunter-facing "your sighting was confirmed" notification; XP for naming and for confirmed sightings (amounts undecided).
- Per-car share previews need a prerender step; `car.html`'s `<title>`/og tags stay static.
- The live DB still has no Star Car; the first real one is the true test of the sighting trigger → Needs you → confirm loop.

---

# Star Car page, step two — 2026-09-24
**Trigger:** Drew: "do the remaining pieces." **Scope:** mods, a public gallery, likes and comments on the car, owner tools, XP for naming and confirmed sightings, the hunter's "sighting confirmed" notice. **Method:** DB first (proven in a rolled-back transaction), then guarded app patches driven live in the preview with a stubbed client, a four-lens review with adversarial verification (11 confirmed, fixed), then ship.

## What changed
- **Database (`star_car_step_two`):** `star_cars.mods` jsonb (≤40 entries, part ≤60, note ≤240, checked by `star_mods_ok`); table `star_car_photos` (owner INSERT of (car_id, path, caption) through `star_car_photos_fill`, which forces the owner from the car, requires the path to start `<uid>/car-`, and stops at twelve; owner DELETE; public read of non-hidden cars); notifications kind `sighting_ok`; XP `star_car_named` 15 (once per car, hanging off the owner's capture) and `sighting_confirmed` 10 to the hunter (five a day, reversed if the owner hides it, never paid twice); `sightings_after` writes the hunter's notice on confirm; `star_car()` returns mods, gallery, likes, comments and the last 20 comment rows.
- **App:** ♥ and 💬 on the page, keyed on the car's hero capture so the Feed and the page agree; a mods editor (owner) and list (visitors); a gallery of uploaded photos with ADD PHOTO, PUBLISH on this phone's angle shots, and a two-tap ✕; Owner tools: SAVE NAME, HIDE / SHOW ON MOST WANTED, two-tap REMOVE STAR CAR; "+15 XP" on the naming card; the inbox understands `sighting_ok` ("confirmed your sighting of … · SEE ITS PAGE →") and the owner's confirm also pushes the hunter.
- **Website:** likes/comments line, comments list, mods and gallery render from the RPC. **Admin:** XP labels for the new events.

## Review findings fixed before shipping
- 🔴 A write made while the page was still loading was overwritten by the older server row (mods vanished after "saved", HIDE stuck). → every owner write goes through `cpPatch`, and a load that overlapped a write keeps the page's newer values.
- 🔴 Opening a car by its public id fetched it without `mods`, so ADD MOD could replace the server list with one entry. → the select carries mods.
- 🟠 Two mod edits in flight lost one. → all mod controls lock during a write.
- 🟠 REMOVE STAR CAR raced a load in flight and the deleted car came back. → a generation token voids older loads; a forced refresh waits for the one in flight.
- 🟠 A late likes reply for the previous car painted on the current one. → replies are dropped when the page has moved on.
- 🟠 The like button never read the result. → failures roll the button back; a duplicate insert counts as success.
- 🟠 PUBLISH / ADD PHOTO had no in-flight guard and a repaint re-enabled them. → one upload at a time, painted as busy.
- 🟠 A photo path went unescaped into `url('…')` on an inline style, on the app and the site. → `thumbUrl` and the site's `img()` encode quotes, parentheses, spaces and backslashes.
- 🟡 Storage removals were unchecked and REMOVE used a cache that never held the gallery. → object first, checked, then the row; the car's photo list comes from the server. Uploads insert the row first so the twelve-cap answers before bytes move.
- 🟡 PUBLISH uploaded the 480px thumbnail. → the original file is used when this session still has it.
- 🟢 ✕ and PUBLISH hit areas were under 44px; German PUBLISH ("VERÖFFENTLICHEN") clipped. → sizes fixed; "POSTEN" and an ellipsis guard.
- 🟢 The inbox line was one glued text node, so its verbs could never translate (pre-existing, all kinds). → split into spans; the verbs, "SEE THE SPOT →", the empty-state sentence and the example name now have keys.

## Verified (preview, stubbed client)
Like toggle and rollback on a failed insert; add and delete a mod with the controls locked; rename updates the page, the tile cache and the row; hide/show flips the eyebrow and the note; comments sheet opens on the hero capture with the car's name; publishing a local angle uploads a fresh `<uid>/car-<id>-<ts>.jpg`, inserts the row and drops the local cell; a failed upload leaves no row; two-tap photo delete removes the object then the row; two-tap remove deletes the car and a load in flight cannot bring it back; a write during a load survives the load; visitor sees mods and gallery read-only with no controls; signed-out ♥ asks to sign in; the hunter's inbox row renders with its verb translated; the site renders the social line, mods, a captioned gallery and escaped comments; a hostile photo path cannot escape `url()`.
**Database (rolled back):** naming pays 15 once; rename does not double-pay; a confirmed sighting pays the hunter 10 and writes the notice; hidden reverses, re-confirm does not re-pay; a bad mod is refused; photos outside the owner's folder, with the wrong prefix, or from a stranger are refused; the anon RPC returns the new keys.

## Recommended (not done)
- Comments posted from the car page do not push the owner (the inbox row is written by the server trigger, as for likes).
- A hunter's confirmed sighting that is later hidden keeps its XP reversed even if re-confirmed (deliberate: it blocks flip-flop farming).
- Amounts (15 / 10, five a day) are placeholders for Drew to confirm.

---

# The Paddock: race cars, and a judge that learns — 2026-09-25
**Trigger:** two Barber Motorsports Park captures: a BMW M4 GT4 judged "Toyota GR86 race car", and another judged "BMW M2 GT4" (no such car). The Registry held no race cars at all, so even a correct call filed as a loose "x:" entry. **Method:** judge prompt first, then the Registry, then a correction loop; parity of the Car of the Day rotation proven by SHA-256 over 194 days per lane, app against SQL.

## What changed
- **Judge (`verify` v36):** a RACE CARS ladder beside the semis one: identify by silhouette and class stickers, name the homologated model from the GT4 / GT3 / TCR-cup / prototype / stock-car lists, "M2 GT4" is named as a non-car, never write "race car" into the model, GT4/GT3/TCR/cup are rare and prototypes/open-wheel/NASCAR/historic works cars are legendary. The judge now also reads `judge_confusions` (the most repeated hunter corrections, cached ten minutes per instance) and is told "X was really Y".
- **Registry:** a 33-car Paddock appended to the season-0 volume (n96–n128): ten GT4, ten GT3, six cup/TCR, seven prototypes, stock and historic cars, each with lore in `registry_lore`. Entries carry `race:1` (a race-tagged capture files here first; an untagged one never does, so a road 911 GT3 keeps its entry), `late:1` (out of the pre-cutover formula) and `since: 2026-10-04` (out of every day already computed and headlined). `cotd_rotation` honours `since`; rows from Oct 4 without a headline were regenerated: race cars take 95 of the remaining days.
- **Corrections:** SAVE DOSSIER now writes a corrected make/model/year to the capture row, recomputes the Registry key, and upserts `judge_corrections` (owner forced from the capture by trigger; one per capture). The dossier says "Wrong call? Fix the make and model and the judge learns from it." The admin console has a Judge tab: the lessons the judge is shown, and every correction with its photo.
- **Data:** captures 145 and 146 corrected to BMW M4 GT4 (n96) and seeded as the first two lessons.

## Verified
- Rolled back on the live DB: a hunter's row update and correction upsert succeed; a correction on someone else's capture and an update of someone else's rows are refused.
- Preview: race-tagged M4 GT4 → n96; road "BMW M4" → nothing (no road entry); road 911 GT3 → n19; race-tagged 911 GT3 R → GT3 R; 911 GT3 Cup → Cup; race-tagged GR Supra GT4 → the GT4, road Supra → n23; untagged "M4 GT4" → nothing; SAVE DOSSIER on the GR86 row sends the update and the upsert and toasts "the judge takes note".
- Rotation parity: moto lane and the pre-cutover car lane identical to SQL; the car lane identical on every day the app can name (the only blanks are picks from volumes not yet unlocked, which the server supplies, as before).

## Recommended (not done)
- An event roster for race weekends (car number → entry) would beat silhouette guessing at a track; the judge already reads numbers.
- The 1000-day review page (`cotd-1000-days.html`) predates the Paddock; regenerate it if you want to read the rotation again.
