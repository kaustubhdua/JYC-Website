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
Replace `public/models/1780947277181-w2z6yhqv.glb` with the supplied model bytes, keeping the public URL stable so existing runtime code and browser QA continue to work. Then update any exact-byte-size assertion in `scripts/qa-v45-social-bot.mjs` (currently hard-coded to the previous 876,764-byte asset) to assert a sensible maximum size and valid asset presence rather than a brittle exact size. Check for other hard-coded size assertions before changing them.

## UX contract
1. Keep the launcher small and non-intrusive across routes.
2. Use the model in the launcher and optionally in the expanded assistant panel only if the performance budget allows.
3. Add only subtle procedural idle/hover/think motion; never imply that the model has facial or skeletal animation.
4. Keep chat controls and text as ordinary accessible DOM, independent of WebGL.
5. Respect `prefers-reduced-motion`, data-saver, mobile/lite mode, keyboard use, and model load errors.
6. Use the existing JYC palette (cream, charcoal, oxblood, champagne) rather than unrelated neon gradients.
7. Verify desktop and mobile screenshots, model framing, material/texture fidelity, build output, browser QA, and Lighthouse before release.

## Current blocker
The repository connector can edit text files but does not provide a binary upload operation for this conversation's local GLB attachment. The uploaded 2,660,588-byte binary has therefore **not** been copied into `public/models/1780947277181-w2z6yhqv.glb` by this change. Do not claim the new model is live until the binary is actually replaced and the build/QA checks pass.
