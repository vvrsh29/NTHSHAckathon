import type { PhaseDefinition } from '../../../shared/types.js'

export function getTipsPhase(): PhaseDefinition {
  return {
    id: 'tips',
    title: 'Pro Tips',
    description: 'Get the most out of Claude Code',
    steps: [
      {
        id: 'claude-md',
        phase: 'tips',
        title: 'CLAUDE.md Files',
        explanation:
          "**Pro tip: CLAUDE.md files.** Create a `CLAUDE.md` file in your project root. Claude Code reads it automatically and follows the instructions inside. Use it to set coding style, architecture rules, and project context.\n\nFor example, you might write:\n- \"Use TypeScript with strict mode\"\n- \"Follow the existing pattern for API routes\"\n- \"Never modify the database schema directly\"\n\nThis is one of the most powerful features — it turns Claude Code from a general assistant into a teammate who knows your project's rules.",
      },
      {
        id: 'slash-commands',
        phase: 'tips',
        title: 'Slash Commands',
        explanation:
          "**Slash commands** give you quick access to useful features. In Claude Code, try these:\n\n- `/help` — see all available commands\n- `/clear` — start a fresh conversation\n- `/compact` — compress context when conversations get long (saves tokens and keeps Claude focused)\n- `/model` — switch between Claude models\n- `/cost` — see how much you've spent in the current session\n\nThink of these as keyboard shortcuts for your AI pair programmer.",
      },
      {
        id: 'plan-mode',
        phase: 'tips',
        title: 'Plan Before You Build',
        explanation:
          "**Plan before you build.** For complex features, start by asking Claude Code to plan first. Say something like: \"Plan how you would add user authentication to this app — don't write any code yet.\"\n\nClaude Code will design the implementation, list the files it would change, and explain its approach. Review the plan, give feedback, then tell it to execute. This two-step approach leads to much better results for complex changes.",
      },
      {
        id: 'keep-going',
        phase: 'tips',
        title: 'Keep Exploring',
        explanation:
          "You've got the basics down. Here's what to explore next:\n\n- **MCP servers** — connect Claude Code to databases, APIs, and external tools for even more capability\n- **Agent mode** — let Claude Code handle complex, multi-step tasks autonomously\n- **Git integration** — Claude Code can create commits and pull requests for you\n- **Custom slash commands** — create your own shortcuts for common workflows\n\nThe more you use it, the more powerful it becomes. Happy building!",
      },
    ],
  }
}
