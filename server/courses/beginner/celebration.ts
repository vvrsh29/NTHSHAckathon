import type { PhaseDefinition } from '../../../shared/types.js'

export function getCelebrationPhase(): PhaseDefinition {
  return {
    id: 'celebration',
    title: 'You Did It!',
    description: 'Celebrate your achievement and see what comes next',
    steps: [
      {
        id: 'congrats',
        phase: 'celebration',
        title: 'Congratulations!',
        explanation:
          "You did it! You've learned the terminal, set up your development environment, installed Claude Code, and built your first project. You're no longer a complete beginner — you're a developer who uses AI tools. That's huge.\n\nSeriously, take a moment to appreciate what you just accomplished. Many people never get past the \"I don't know how to start\" phase. You didn't just start — you built something real.",
      },
      {
        id: 'next-steps',
        phase: 'celebration',
        title: "What's Next?",
        explanation:
          "Here's what to do next:\n\n- **Explore Claude Code more** — try building different things. A blog, a game, a tool you wish existed.\n- **Learn Git** — save your code with `git init` and `git commit`. It's like a save button for developers.\n- **Read the Claude Code docs** — there's a lot more it can do (CLAUDE.md files, MCP servers, agent mode).\n- **Join the community** — share what you built!\n\nRemember: every expert was once a beginner. Keep building!",
      },
    ],
  }
}
