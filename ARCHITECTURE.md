# Architecture notes

## Boundaries

- `src/ui.tsx`: route-level pages and accessible UI feedback.
- `src/api.ts`: shared Axios transport.
- `src/mocks.ts`: REST contracts, shared fixture state and MSW WebSocket scenario.
- `src/realtime.ts`: Socket.IO client lifecycle and event version guard.
- `src/types.ts`: transport and UI resource shapes.
- `src/worker.ts`: browser MSW worker.

TanStack Router owns route matching/direct entry. TanStack Query owns remote requests, cancellation, cache identity and invalidation. The query key for catalog results includes every URL search parameter. The browser URL is the source of discovery state, so refresh/history restore search and filters.

## State and recovery

The MSW fixture state persists selected resources in local storage for refresh. Authentication state is isolated in the query cache by clearing that cache on logout. The mocked order endpoint returns an existing order for a repeated idempotency key, preventing a second order during client retry, and rejects the same key with a different cart/coupon fingerprint. Terminal order receipts are snapshots.

ETH values cross the API as decimal strings; mock price/quote arithmetic uses fixed-scale integer math. Checkout quotes are revision-bound, client submission checks for stale quotes, and the mock order endpoint checks the cart/coupon fingerprint before creating an idempotent order. A rejected order retains the cart.

## Cache policy and real time

Reads remain fresh for 20 seconds and are garbage-collected after five minutes. Query retries are capped at one; mutations are not retried implicitly. Favorite toggles update the cache optimistically and roll back on failure. Socket messages carry resource version; messages at or below the last seen version are ignored. A market update patches active listing/detail cache and invalidates cart quotes. Socket.IO reconnects automatically; component listeners are released with their React lifecycle. `WebSocketInterceptor` and `@mswjs/socket.io-binding` simulate local Socket.IO text events in the default namespace; acknowledgements/rooms/binary data are outside the mock transport.

## Visual/accessibility decisions

The ZIP has a composite PNG board and navigation SVGs but no artwork crops or fonts. Artwork is selected by normalized NFT title family, so matching names with different IDs share the same image. Moss Traveler, Solar Dream, Cosmic Bloom, Jungle Echo, Amber Nomad, Quiet Orbit and Lilac Voyager select among the four supplied NFT photos using a stable name-based pseudo-random hash; IDs in a family therefore stay consistent. Local SVG illustrations fill remaining artwork slots. The UI uses locally bundled Roboto Mono Regular (400), follows the dark espresso canvas and amber highlights, and provides profile navigation tabs for profile data, wallets, activity, interests, offers, downloads and support; CSS breakpoints adapt the catalog, account and checkout to narrow screens. Reduced motion is respected for shimmer, transitions and scrolling. Inputs use labels, controls have visible focus, dynamic feedback uses a live status region, and missing resources/errors have explicit states.

## Known gaps

The API, accounts and payments are browser-only fixtures and must be replaced by authenticated server services before production use. Avatar selection currently provides local UI feedback without uploading an image. The realtime fixture exercises NFT market changes; order status events and a broader deterministic network-failure matrix are not implemented. E2E covers the core discovery, account, cart, checkout, profile/wallet, socket and four-page visual flows at desktop, tablet and mobile widths; it is not exhaustive. Lighthouse reports are collected in `reports/lighthouse`. Public hosting and a remote Git repository remain unconfigured because no destination or account access was supplied. The source ZIP provided a composite design board and navigation icons, but no separate artwork files or fonts; four additional NFT images were supplied later and are included in the catalog.
