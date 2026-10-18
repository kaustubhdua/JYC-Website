# JYC Assistant — Uploaded GLB Integration

## Goal
Use the newly supplied GLB as the visual avatar for the existing JYC Assistant, preserving the existing contextual search, route navigation, focus management, and reduced-motion behavior.

## Verified properties of the uploaded asset
- Format: glTF 2.0 binary (.glb)
- File size: 2,660,588 bytes (about 2.54 MiB)
- Meshes: 1
- Materials: 1
- Nodes: 1
- Skins/skeletons: 0
- Animation clips: 0
- Textures/images: embedded in the GLB

The model is static. It can be displayed and gently transformed with CSS, but native waving, blinking, facial expressions, and lip-sync cannot be played from this file because it contains no rig or animation clips.

## Existing integration
- `src/jyc-bot.jsx` is the lazy-loaded floating assistant launcher.
- `src/jyc-assistant.jsx` is the accessible contextual assistant panel.
- The current runtime asset URL is `/models/1780947277181-w2z6yhqv.glb`.
- The launcher uses Google's `model-viewer`, disables camera controls and auto-rotation, respects reduced-motion/save-data/lite mode, and has a logo fallback.
- The chat panel searches published JYC content and navigates to the corresponding site routes.

## Required asset swap
The supplied model is now present at `public/models/1780947277181-w2z6yhqv.glb` on `fix/release-qa-mobile-type` (2,660,588 bytes). Both assistant QA contracts parse GLB chunk framing and the glTF JSON, verify drawable meshes and material references, require embedded image buffer views, check binary buffer-view bounds, and enforce GLB magic/version/declared length plus a 3 MiB maximum instead of relying on exact file size. The previous `jyc-spatial.glb` remains in place for rollback.

## UX contract
1. Keep the launcher small and non-intrusive across routes.
2. Use the model in the launcher and optionally in the expanded assistant panel only if the performance budget allows.
3. Add only subtle procedural idle/hover/think motion; never imply that the model has facial or skeletal animation.
4. Keep chat controls and text as ordinary accessible DOM, independent of WebGL.
5. Respect `prefers-reduced-motion`, data-saver, mobile/lite mode, keyboard use, and model load errors.
6. Use the existing JYC palette (cream, charcoal, oxblood, champagne) rather than unrelated neon gradients.
7. Verify desktop and mobile screenshots, model framing, material/texture fidelity, build output, browser QA, and Lighthouse before release.

## Verification status
- [x] The supplied model path is present on the candidate branch; its Git blob is reused from the same repository's verified `main` asset.
- [x] Assistant QA scripts structurally inspect the GLB container, glTF JSON, mesh primitives, material indices, embedded image buffer views, and buffer bounds; the 3 MiB ceiling and GLB header/version/declared length are checked.
- [x] Declare and lock the official Khronos `gltf-validator` development dependency so a clean `npm ci` can run the formal asset validator.
- [x] Give the immutable GLB path explicit `model/gltf-binary` and cache headers; add a browser contract that checks served bytes and headers.
- [x] Use the assistant's logo fallback if the model reports an error or WebGL context is lost.
- [ ] Confirm CI completes the production build and the two assistant QA contracts on the latest candidate SHA.
- [ ] Run the Khronos glTF Validator and inspect the actual GLB render in browser (desktop model framing/materials, mobile fallback, reduced motion, save-data, model/CDN failure, and WebGL context loss).
- [ ] Obtain a successful preview and verify the exact candidate SHA; Vercel previously reported a build-rate-limit failure.
- [ ] Complete visual sign-off and production smoke test before describing the model as released.
