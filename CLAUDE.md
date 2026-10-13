# repurpos.us (REFRAMEdb frontend)

Angular 6 app. `npm start` serves it; the API proxy is in `src/proxy.conf.js`.
Run tests with `npx ng test --watch=false --browsers=ChromeHeadless`.

## UI work

Before changing how any page looks, read `DESIGN.md`. The site is being
redesigned page by page, and redesigned pages must follow that design language:

- Take colours, fonts and radii from `src/_tokens.scss` through the names in
  `src/_design.scss`; never write raw hex values or font stacks in component styles.
- Reuse the mixins in `src/_design.scss` (buttons, arrow links, eyebrow labels,
  segmented controls, page shell) instead of restyling them per component.
- Check visually at 1440 and 390 wide before reporting a page as done.
