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
