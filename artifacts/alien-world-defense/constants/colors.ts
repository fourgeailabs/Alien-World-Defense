/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#E6F7F4',
    tint: '#2CE0C6',

    // Core surfaces
    background: '#07151F',
    foreground: '#E6F7F4',

    // Cards / elevated surfaces
    card: '#102735',
    cardForeground: '#E6F7F4',

    // Primary action color (buttons, links, active states)
    primary: '#2CE0C6',
    primaryForeground: '#041117',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#194252',
    secondaryForeground: '#D9FFF8',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#173340',
    mutedForeground: '#8FB2B5',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FF8A5B',
    accentForeground: '#211109',

    // Destructive actions (delete, error states)
    destructive: '#FF6B6B',
    destructiveForeground: '#240B0B',

    // Borders and input outlines
    border: '#275260',
    input: '#275260',
  },
  dark: {
    text: '#E6F7F4',
    tint: '#2CE0C6',
    background: '#07151F',
    foreground: '#E6F7F4',
    card: '#102735',
    cardForeground: '#E6F7F4',
    primary: '#2CE0C6',
    primaryForeground: '#041117',
    secondary: '#194252',
    secondaryForeground: '#D9FFF8',
    muted: '#173340',
    mutedForeground: '#8FB2B5',
    accent: '#FF8A5B',
    accentForeground: '#211109',
    destructive: '#FF6B6B',
    destructiveForeground: '#240B0B',
    border: '#275260',
    input: '#275260',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
