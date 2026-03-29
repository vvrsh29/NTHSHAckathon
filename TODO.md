# LaunchPad — TODO

## Done

The project has been pivoted from ForgeFlow (AI code generator) to a **Claude Code teaching platform**. The core architecture is in place:

- [x] Express + WebSocket server with PTY/SSH terminal
- [x] Shared type system (`shared/types.ts`)
- [x] Course system: beginner, intermediate, advanced — all with full phase/step content
- [x] Step engine (watches terminal output, advances steps)
- [x] Mentor engine (Gemini-powered explanations, error help, Q&A)
- [x] Environment detection (git, node, python, claude code, vscode, xcode CLT)
- [x] 6-stage onboarding flow (name, role, experience level, API key, build idea, confirmation)
- [x] Landing page with animated terminal demo
- [x] HomeScreen dashboard (progress ring, stats, phase breakdown, resources)
- [x] Dashboard: resizable terminal + mentor panels
- [x] Interface guide overlay for first-time users
- [x] shadcn/ui integration (zinc theme, resizable panels, tabs, badges)
- [x] ModeSwitch (auto/tutor toggle)
- [x] SSH access (connect via `ssh localhost -p 2222`)

## Remaining

- [ ] End-to-end flow testing — walk through a full beginner course start to finish
- [ ] Error handling: wrong commands, typos, failed installs
- [ ] Polish transitions between phases (celebration moments, confetti?)
- [ ] Demo prep: test full flow 3x, ensure it completes in under 10 minutes
- [ ] Deploy step (stretch goal — currently ends at localhost)

## Quick Reference

**Start dev:** `npm run dev`
**Server port:** 3001
**Frontend dev:** Vite on port 3000
**Claude model:** Gemini (via mentor engine)
