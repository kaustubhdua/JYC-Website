# Open-source UI and engineering reference decisions

Reviewed: 2026-10-16

This note records how the requested open-source repositories inform JYC without importing unrelated frameworks or adding unnecessary runtime weight.

## UI and interaction references

| Reference | Useful patterns | JYC decision |
| --- | --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Accessible form primitives, clear error states, keyboard focus, restrained surface hierarchy | Apply the interaction contract to existing React/CSS components. Do not add a parallel component runtime or assume Tailwind is configured. |
| [Magic UI](https://github.com/magicuidesign/magicui) | Small, purposeful motion and visual emphasis | Keep the existing JYC Dither Veil hero and Magic Bento discovery cards. Motion must remain optional for reduced-motion users and must not obscure content or block navigation. |
| [Tremor](https://github.com/tremorlabs/tremor) | Data visualization and dashboard patterns | Do not add chart/dashboard dependencies to the public editorial site; they do not solve a current public-site need. Revisit only for a clearly scoped internal analytics dashboard. |
| [Corsair](https://github.com/corsairdev/corsair) | Scoped integrations and credential boundaries for agents | Treat as a backend integration reference only. Do not introduce a new integration platform or expose credentials to the browser without a concrete, approved integration requirement. |
| [GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents) | Evaluation, orchestration, and human-in-the-loop workflow ideas | Use as learning material, not a production dependency. Its repository license is non-commercial, so do not copy or adapt its code into the JYC site without written permission and license review. The public JYC site intentionally does not add an unrequested public AI assistant. |

## Applied change in this follow-up

The contact form used noValidate, while its submit handler silently returned when required fields were empty. That meant the user could press “Send message” without receiving any explanation.

The fix adds:
- explicit name, email and message validation;
- malformed-email feedback before any network request;
- per-field aria-invalid and aria-describedby links;
- focus to the first invalid control;
- clearing a field's error when that field is edited;
- restrained inline error styling that works with the existing design system;
- Playwright coverage that exercises validation without sending a real message.

No new runtime dependency is introduced.

## Verification boundary

A green static contract is not proof of visual polish. The browser test must run in CI, and the resulting preview should be inspected at mobile, tablet and desktop widths. Production sign-off still requires owner-side verification of live integrations, data correctness, media rights/provenance and the external security settings recorded in the release roadmap.
