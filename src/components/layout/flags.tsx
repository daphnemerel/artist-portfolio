/*
 * Small square flag images for the round language switcher (the button crops them to a circle).
 * Drawn as SVG instead of emoji, because flag emoji don't show on Windows.
 */

/** United Kingdom (Union Jack), the centre square of the 2:1 flag. */
export function FlagUK() {
  return (
    <svg viewBox="15 0 30 30" width="100%" height="100%" aria-hidden="true" focusable="false">
      <clipPath id="flag-uk-diagonals">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#flag-uk-diagonals)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

/** The Netherlands: red, white and blue. */
export function FlagNL() {
  return (
    <svg viewBox="0 0 30 30" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect width="30" height="10" fill="#AE1C28" />
      <rect y="10" width="30" height="10" fill="#FFFFFF" />
      <rect y="20" width="30" height="10" fill="#21468B" />
    </svg>
  );
}
