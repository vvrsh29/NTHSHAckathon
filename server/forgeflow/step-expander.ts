import type { Step, Phase } from '../../shared/types.js'
import type { ParsedPlan } from '../../shared/types.js'

interface TomlPhase { id: string; steps: string[] }
export interface LaunchToml {
  project: { name: string; description: string; type: string }
  phases: TomlPhase[]
}

type StepContext = { projectName: string; phase: Phase }
type StepTemplate = (ctx: StepContext) => Omit<Step, 'id' | 'phase'>

const STEP_TEMPLATES: Record<string, StepTemplate> = {
  'mkdir': ({ projectName }) => ({
    title: 'Create Your Project Folder',
    command: `mkdir ${projectName}`,
    explanation: `First, we'll create a folder for your project. Think of it like right-clicking on your desktop and selecting "New Folder" — but with typing instead of clicking.`,
    expectedOutputPattern: `\\$\\s*$`,
    errorPatterns: ['File exists', 'Permission denied'],
  }),
  'cd': ({ projectName }) => ({
    title: 'Go Into Your Folder',
    command: `cd ${projectName}`,
    explanation: `\`cd\` stands for "change directory" — it's how you move into a folder in the terminal, like double-clicking a folder to open it.`,
    expectedOutputPattern: projectName,
    errorPatterns: ['No such file or directory'],
  }),
  'pwd': () => ({
    title: 'Confirm Your Location',
    command: 'pwd',
    explanation: `\`pwd\` prints your current location in the filesystem. You should see a path ending with your project name — confirming you're in the right place.`,
    expectedOutputPattern: '/',
    errorPatterns: [],
  }),
  'touch-html': () => ({
    title: 'Create index.html',
    command: 'touch index.html',
    explanation: `\`touch\` creates an empty file. \`index.html\` is a special name — web servers look for "index" as the homepage. It's the front door of your website.`,
    expectedOutputPattern: `\\$\\s*$`,
    errorPatterns: ['Permission denied'],
  }),
  'touch-css': () => ({
    title: 'Create style.css',
    command: 'touch style.css',
    explanation: `CSS is your website's wardrobe — it controls colors, fonts, and layout. We'll fill it in with beautiful styles soon.`,
    expectedOutputPattern: `\\$\\s*$`,
    errorPatterns: ['Permission denied'],
  }),
  'touch-js': () => ({
    title: 'Create script.js',
    command: 'touch script.js',
    explanation: `JavaScript is your website's brain — it makes things interactive and responds to clicks. Empty for now, but we'll bring it to life.`,
    expectedOutputPattern: `\\$\\s*$`,
    errorPatterns: ['Permission denied'],
  }),
  'ls': () => ({
    title: 'See Your Files',
    command: 'ls',
    explanation: `\`ls\` lists all files in your current folder — like opening a folder window. You should see index.html, style.css, and script.js.`,
    expectedOutputPattern: 'index.html',
    errorPatterns: [],
  }),
  'ai-generate': () => ({
    title: 'AI Writes Your Site',
    command: '',
    explanation: `Now the magic happens! Your AI mentor is generating starter code based on your project description. Watch the files fill up with real HTML, CSS, and JavaScript.`,
    expectedOutputPattern: '',
    errorPatterns: [],
  }),
  'view-html': () => ({
    title: 'Inspect Your HTML',
    command: 'cat index.html',
    explanation: `\`cat\` prints a file's contents in the terminal. Notice the structure: \`<head>\` holds metadata, \`<body>\` holds what's visible on the page.`,
    expectedOutputPattern: '</html>',
    errorPatterns: ['No such file or directory'],
  }),
  'view-css': () => ({
    title: 'Inspect Your CSS',
    command: 'cat style.css',
    explanation: `Look at the CSS your mentor generated. See the custom properties (variables) at the top? They let you change colors across the whole site by editing one line.`,
    expectedOutputPattern: '}',
    errorPatterns: ['No such file or directory'],
  }),
  'ai-enhance': () => ({
    title: 'AI Enhances Your Style',
    command: '',
    explanation: `Your AI mentor is adding polished styling — responsive layout, smooth animations, and a professional look. This is the "make it shine" phase.`,
    expectedOutputPattern: '',
    errorPatterns: [],
  }),
  'view-result': () => ({
    title: 'Preview Your Site',
    command: 'open index.html',
    explanation: `\`open\` launches the file in your browser. You're about to see your website for the first time! On Linux, use \`xdg-open index.html\`.`,
    expectedOutputPattern: `\\$\\s*$`,
    errorPatterns: ['No application', 'not found'],
  }),
  'open-browser': () => ({
    title: 'Open in Browser',
    command: 'open index.html',
    explanation: `Let's see your finished site! This runs everything locally — your files, your computer, no internet required.`,
    expectedOutputPattern: `\\$\\s*$`,
    errorPatterns: ['No application'],
  }),
  'celebrate': () => ({
    title: 'You Did It!',
    command: '',
    explanation: `🎉 You built a website from scratch using the terminal! You created files, wrote code, and opened it in a browser — all with keyboard commands. That's what real developers do every day.`,
    expectedOutputPattern: '',
    errorPatterns: [],
  }),
}

export class StepExpander {
  expand(toml: LaunchToml, plan: ParsedPlan): Step[] {
    const steps: Step[] = []
    for (const phase of toml.phases) {
      const phaseId = phase.id as Phase
      for (const stepId of phase.steps) {
        const templateFn = STEP_TEMPLATES[stepId]
        if (!templateFn) { console.warn('[FORGEFLOW] Unknown step template:', stepId); continue }
        steps.push({ id: stepId, phase: phaseId, ...templateFn({ projectName: plan.name, phase: phaseId }) })
      }
    }
    console.log('[FORGEFLOW] Expanded', steps.length, 'steps from launch.toml')
    return steps
  }

  toPhaseDefinitions(steps: Step[]): Array<{ id: Phase; steps: Step[] }> {
    const phaseMap = new Map<Phase, Step[]>()
    for (const step of steps) {
      if (!phaseMap.has(step.phase)) phaseMap.set(step.phase, [])
      phaseMap.get(step.phase)!.push(step)
    }
    return Array.from(phaseMap.entries()).map(([id, steps]) => ({ id, steps }))
  }
}
