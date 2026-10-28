# Architecture rules

- Keep try-on purchase selection and catalog matching in the shared hairProductMatching module so all hair purchase entry points use the same compatibility rules.
- Keep desktop and mobile navigation in the shared Navbar, with the existing drawer exposing all destinations, so navigation stays consistent across pages.
- Keep brand image placements and browser/native icons derived from the same refined logo; use a transparent derivative in navigation so menus do not show an image background.
- Keep the shop page as the home route and the former homepage on its own route, with booking entry points pointing at that former-homepage route, so the booking experience stays reachable after a home-screen swap.