const BASE = "https://res.cloudinary.com/xgpct4gs/image/upload/v1789964063";

// NOTE: the Cloudinary filenames are swapped relative to their content:
// `icef-logo.jpg` is the accredited badge (opaque off-white bg) and
// `icef-accredited-badge.png` is the ICEF wordmark logo (transparent bg, navy text).
// Both need a light background behind them — never place them directly on dark surfaces.
export const ICEF_BADGE = { src: `${BASE}/icef-logo.jpg`, width: 650, height: 762 };
export const ICEF_LOGO = { src: `${BASE}/icef-accredited-badge.png`, width: 788, height: 264 };
export const ICEF_BADGE_ALT = "ICEF Accredited – Trusted Agency #7002";
