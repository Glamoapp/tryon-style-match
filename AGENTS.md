# Architecture rules

- Keep try-on purchase selection and catalog matching in the shared hairProductMatching module so all hair purchase entry points use the same compatibility rules.
- Keep desktop and mobile navigation in the shared Navbar, with the existing drawer exposing all destinations, so navigation stays consistent across pages.