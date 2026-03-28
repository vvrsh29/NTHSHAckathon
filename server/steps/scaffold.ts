import type { PhaseDefinition } from './types.js'

export function getScaffoldPhase(projectName: string): PhaseDefinition {
  return {
    id: 'scaffold',
    title: 'Scaffold',
    description: 'Create the basic files your website needs',
    steps: [
      {
        id: 'scaffold-explain',
        phase: 'scaffold',
        title: 'What Is a Website Made Of?',
        explanation:
          'Every website is made of three types of files: **HTML** (the content and structure — like the walls and rooms of a house), **CSS** (the visual design — the paint, furniture, and decorations), and **JavaScript** (the interactive behaviour — the lights and appliances). We\'re about to create all three!',
      },
      {
        id: 'scaffold-create-html',
        phase: 'scaffold',
        title: 'Create the HTML File',
        command: 'touch index.html',
        explanation:
          '`touch` creates a new empty file. We\'re naming it `index.html` because that\'s the file web browsers look for first — it\'s the front door of your website. Right now it\'s blank, but the AI will fill it with real content in the next phase.',
        expectedOutputPattern: '\\$\\s*$',
        errorPatterns: ['Permission denied', 'cannot touch'],
      },
      {
        id: 'scaffold-create-css',
        phase: 'scaffold',
        title: 'Create the CSS File',
        command: 'touch style.css',
        explanation:
          'CSS stands for Cascading Style Sheets. This file will control everything that makes your site look good — colours, fonts, spacing, and layout. Without CSS a website is just plain black text on a white background.',
        expectedOutputPattern: '\\$\\s*$',
        errorPatterns: ['Permission denied', 'cannot touch'],
      },
      {
        id: 'scaffold-create-js',
        phase: 'scaffold',
        title: 'Create the JavaScript File',
        command: 'touch script.js',
        explanation:
          'JavaScript is the programming language of the web. It makes your page interactive — things like buttons that respond to clicks, animations, and live updates. Even experienced developers started with a blank `script.js` file just like this one.',
        expectedOutputPattern: '\\$\\s*$',
        errorPatterns: ['Permission denied', 'cannot touch'],
      },
      {
        id: 'scaffold-verify',
        phase: 'scaffold',
        title: 'Check Your Files',
        command: 'ls -1',
        explanation:
          'Let\'s confirm all three files were created successfully. `ls` lists the files in your current folder, and the `-1` flag shows them one per line. You should see `index.html`, `script.js`, and `style.css`.',
        expectedOutputPattern: 'index\\.html',
        errorPatterns: [],
      },
    ],
  }
}
