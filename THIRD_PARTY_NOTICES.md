# Third-party gallery dependencies

Gallery authentication uses jose (MIT); source and exact version are recorded in package-lock.json: https://github.com/panva/jose .

Automatic HEIC decoding uses heic-to 1.6.6, package-declared LGPL-3.0, with libheif 1.23.6. Its supplied license is retained in docs/licenses/heic-to-LICENSE.txt. Source/build instructions: https://github.com/hoppergee/heic-to and https://github.com/strukturag/libheif . The package's CSP build is unmodified before bundling; no proprietary changes to the decoder were made. The complete application source and lockfile allow rebuilding/replacing this lazy dependency. Preserve the notices and corresponding upstream source availability when redistributing/transferring the site. The lazy browser decoder is only requested when the owner chooses a HEIC file that native decoding cannot read.

Fonts and other existing dependency licenses remain in their respective packages. No third-party project photographs are seeded or represented as the site's completed work.

## Decap CMS 3.17.1 / Lithuanian locale

MIT, Decap/Netlify contributors; https://github.com/decaporg/decap-cms . The pinned admin-only jsDelivr distribution is checked with SRI. Lithuanian locale is included locally; license in docs/licenses/decap-cms-LICENSE.txt. The existing heic-to 1.6.6 CSP distribution is used for optional admin-only HEIC conversion; its existing LGPL notice/license and upstream source link remain applicable. No Decap dependencies are added to visitor bundles.
