// PurgeCSS config for the bundled legacy theme CSS (see build-legacy-css.mjs).
// Content is the live source only: the old src/components/site/views/* pages
// are not routed anywhere, and rendered pages add no extra selectors.
const css = ["bootstrap", "animate.min", "swiper-bundle.min", "sib-styles", "styles"];

module.exports = {
  content: [
    "src/**/*.{ts,tsx}",
    "!src/components/site/views/**",
    "!src/**/*.test.{ts,tsx}",
  ],
  css: css.map((name) => `public/assets/css/${name}.css`),
  safelist: {
    // Classes added at runtime by Swiper and by open/close state toggles.
    standard: [/^swiper/, /^show$/, /^showing$/, /^fade$/, /^collapse/, /^collapsing$/,
      /^active$/, /^open$/, /^is-/, /^has-/, /^disabled$/, /^modal/, /^offcanvas/, /^dropdown/],
    greedy: [/swiper/],
  },
  keyframes: true,
  fontFace: true,
  variables: true,
};
