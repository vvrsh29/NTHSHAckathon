import type { PhaseDefinition } from './types.js'

export function getScaffoldPhase(projectName: string): PhaseDefinition {
  return {
    id: 'scaffold',
    title: 'Scaffold',
    description: 'Create the basic project files',
    steps: [
      {
        id: 'scaffold-explain',
        phase: 'scaffold',
        title: 'What is a Website?',
        explanation:
          'A website is made of three types of files: **HTML** (the content and structure), **CSS** (the colors and layout), and **JavaScript** (the interactive bits). We\'re going to create all three!',
      },
      {
        id: 'scaffold-create-html',
        phase: 'scaffold',
        title: 'Create the HTML File',
        command: 'touch index.html',
        explanation:
          '`touch` creates an empty file. `index.html` is the main page of every website — browsers look for this file first. Think of HTML as the skeleton of your page.',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'scaffold-create-css',
        phase: 'scaffold',
        title: 'Create the CSS File',
        command: 'touch style.css',
        explanation:
          'CSS (Cascading Style Sheets) controls how your page looks — colors, fonts, spacing, layout. It\'s like choosing paint colors and furniture for a room.',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'scaffold-create-js',
        phase: 'scaffold',
        title: 'Create the JavaScript File',
        command: 'touch script.js',
        explanation:
          'JavaScript makes your page interactive. Want a button that does something when clicked? That\'s JavaScript. It\'s the "brain" of your website.',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'scaffold-verify',
        phase: 'scaffold',
        title: 'Verify Your Files',
        command: 'ls',
        explanation:
          'Let\'s check that all three files were created. You should see `index.html`, `style.css`, and `script.js`.',
        expectedOutputPattern: 'index\\.html',
      },
    ],
  }
}
