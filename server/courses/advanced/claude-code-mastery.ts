import type { PhaseDefinition } from '../../../shared/types.js'

export function getAdvancedCoursePhases(): PhaseDefinition[] {
  return [
    {
      id: 'claude-md',
      title: 'CLAUDE.md Best Practices',
      description: 'Learn how to configure Claude Code with a CLAUDE.md file',
      steps: [
        {
          id: 'explain-claude-md',
          phase: 'claude-md',
          title: 'What is CLAUDE.md?',
          explanation:
            'CLAUDE.md is a file Claude Code reads automatically. Put project rules, architecture notes, and coding style preferences in it. Think of it as instructions for your AI pair programmer.',
        },
        {
          id: 'create-claude-md',
          phase: 'claude-md',
          title: 'Create a CLAUDE.md',
          explanation:
            'Create a CLAUDE.md file with some project rules. Claude Code will follow these automatically whenever it works in this directory.',
          command: 'echo "# My Project\n\n## Rules\n- Use TypeScript\n- Write tests for all new functions" > CLAUDE.md',
          expectedOutputPattern: '\\$',
        },
        {
          id: 'test-claude-md',
          phase: 'claude-md',
          title: 'Test It with Claude',
          explanation:
            'Ask Claude Code to read your CLAUDE.md. It should recognize the rules you set and confirm them back to you.',
          command: 'claude "read the CLAUDE.md and tell me what rules are set"',
          expectedOutputPattern: '(rules|Rules|CLAUDE)',
        },
        {
          id: 'tip-sections',
          phase: 'claude-md',
          title: 'Organize Your CLAUDE.md',
          explanation:
            'Organize your CLAUDE.md with sections: ## Architecture, ## Code Style, ## Testing, ## Don\'ts. Claude Code follows these automatically. The more specific you are, the better the output.',
        },
      ],
    },
    {
      id: 'power-features',
      title: 'Power User Features',
      description: 'Master slash commands and advanced Claude Code features',
      steps: [
        {
          id: 'slash-commands',
          phase: 'power-features',
          title: 'Slash Commands',
          explanation:
            'Key slash commands: `/plan` to design before coding, `/compact` to compress context, `/model` to switch models, `/clear` to start fresh.',
        },
        {
          id: 'plan-mode',
          phase: 'power-features',
          title: 'Plan Before You Code',
          explanation:
            'Use `/plan` to have Claude Code think through a design before writing code. This prevents wasted effort and keeps architecture clean.',
          command: 'claude /plan',
          expectedOutputPattern: '(plan|Plan)',
        },
        {
          id: 'model-selection',
          phase: 'power-features',
          title: 'Choosing the Right Model',
          explanation:
            'Use `/model` to switch between Opus (most capable), Sonnet (balanced), and Haiku (fastest). Pick based on task complexity.',
        },
        {
          id: 'compact',
          phase: 'power-features',
          title: 'Compact Your Context',
          explanation:
            'When conversations get long, use `/compact` to summarize and free up context. Claude Code keeps working but with a compressed history.',
        },
      ],
    },
    {
      id: 'mcp-tools',
      title: 'MCP & Integrations',
      description: 'Connect Claude Code to external tools and services',
      steps: [
        {
          id: 'explain-mcp',
          phase: 'mcp-tools',
          title: 'What is MCP?',
          explanation:
            'MCP (Model Context Protocol) lets Claude Code connect to external tools — databases, APIs, file systems, and more. Think of it as plugins for your AI assistant.',
        },
        {
          id: 'list-mcp',
          phase: 'mcp-tools',
          title: 'Popular MCP Servers',
          explanation:
            'Popular MCP servers: filesystem (read/write files), GitHub (PRs, issues), PostgreSQL (database queries), Puppeteer (browser automation). Install them in your settings.',
        },
        {
          id: 'hooks-overview',
          phase: 'mcp-tools',
          title: 'Hooks',
          explanation:
            'Hooks let you run shell commands automatically before or after Claude Code actions. Use them for linting, testing, or custom workflows.',
        },
      ],
    },
    {
      id: 'workflows',
      title: 'Advanced Workflows',
      description: 'Master autonomous agent mode and team workflows',
      steps: [
        {
          id: 'agent-mode',
          phase: 'workflows',
          title: 'Agent Mode',
          explanation:
            'Claude Code can work autonomously on complex tasks. Give it a high-level goal and let it plan, implement, test, and iterate. Use `/plan` first to align on approach.',
        },
        {
          id: 'git-integration',
          phase: 'workflows',
          title: 'Git Integration',
          explanation:
            'Claude Code can stage, commit, and create PRs. After making changes, ask it to "commit this with a good message" or "create a PR for this feature".',
        },
        {
          id: 'keep-building',
          phase: 'workflows',
          title: 'Keep Building',
          explanation:
            'You now know the advanced features. The key to mastery: use Claude Code every day. The more you use it, the better you get at prompting, reviewing, and iterating.',
        },
      ],
    },
  ]
}
