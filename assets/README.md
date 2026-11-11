# Profile artwork — Full Stop

Matches the current Full Stop portfolio (niamat.dev), not the superseded Route Board design.

## Palette

- Paper #EEEAE2; ink #1A1917; night #141311; vermilion #E8552C.
- The Bit cameo echoes the original SVG proportions. These SVGs use portable system sans-serif lettering rather than bundling or downloading fonts.

## Files

- header.svg and header-mobile.svg are responsive profile banners.
- footer.svg is the dark signature.
- activity*.svg are custom light/dark, desktop/mobile GitHub contribution and profile panels.
- Older product screenshots and the earlier font licence are kept for historical compatibility but are not displayed in the main README.

## Maintenance

- Run: node scripts/build-artwork.cjs (no dependencies) to recreate the header and footer.
- Run: node scripts/update-activity.mjs (Node.js 24+) to refresh the four activity panels.
- Existing GitHub Actions workflow refreshes activity artwork daily at 02:35 UTC, using the built-in GITHUB_TOKEN.
- The activity widget is a snapshot. GitHub controls whether private contributions count. API errors retain previously generated artwork.
- Content should be checked against the portfolio's src/content/site.ts, src/content/services.ts, docs/art-direction.md, and src/app/globals.css.
- Preserve the mobile and dark variants. No remote widget services or visitor trackers are necessary.
