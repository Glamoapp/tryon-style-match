# Interactive Lifestyle Try-On Page

## What will change
- Restyle the full Virtual Try-On journey with a bright white and soft-gray base, supported by NEXTLOOK purple accents.
- Add an Apple Music connection option so visitors can open Apple Music and use their own account and library.
- Replace the fixed Bible quote with a daily rotating affirmation and scripture.
- Make the voice assistant listen for simple spoken requests such as opening Virtual Try-On, Beauty, Apparel, music, time, and weather.
- Show the visitor’s live local time and request location permission for current local weather, with clear fallback states.
- Keep the existing Beauty and Apparel journeys, permission screens, Back, Continue, and Skip controls.

## Technical details
- Use browser speech recognition when supported and provide visible status plus a graceful unsupported-browser message.
- Use browser location permission and a public weather service that requires no account key.
- Open Apple Music’s account/library experience in a new tab; Apple controls sign-in and playback permissions.
- Apply the white, gray, and purple styling only to the full Try-On experience and its embedded demonstration.

## Verification
- Confirm the daily affirmation, live clock, Apple Music action, voice states, and weather permission flow render correctly.
- Confirm Beauty and Apparel navigation still works on desktop and mobile.
- Confirm the preview builds without errors.
