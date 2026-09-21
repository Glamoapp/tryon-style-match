# Virtual Try-On Walkthrough Update

## What will change
- Reorder the walkthrough to begin with the purple metallic NEXTLOOK screen.
- Add a short “Welcome to NEXTLOOK Virtual Try-On” splash.
- Show the smart-mirror home with Apple Music, time, voice control, and Bible inspiration.
- Add an “Open Virtual Try-On” action at the bottom of that screen.
- Add a choice between Beauty and Apparel.
- Show the Beauty path: face scan, hair try-on, then choose to book a stylist, buy hair, or do both.
- Show the Apparel path: body scan, body-type matching, and clothing-style selection.
- Keep the existing product browsing, stylist services, appointment, checkout, confirmation, and arrival sequence after the Beauty path.

## Technical details
- Update only the animated homepage mirror walkthrough in `MirrorExperience`.
- Use the existing NEXTLOOK colors, typography, icons, and motion system.
- Keep all imagery static; only interface elements and transitions will animate.
- Make each stage readable inside the existing phone-shaped preview on mobile and desktop.

## Verification
- Confirm the app builds without errors.
- Review the full sequence in the homepage preview and check that labels and controls fit the mirror frame.
