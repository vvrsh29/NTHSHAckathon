import type { PhaseDefinition } from './types.js'

export function getBuildPhase(): PhaseDefinition {
  return {
    id: 'build',
    title: 'Build',
    description: 'Write the actual website code with AI assistance',
    steps: [
      {
        id: 'build-explain',
        phase: 'build',
        title: 'Time to Write Code!',
        explanation:
          'Now comes the fun part. Your AI mentor will generate the HTML, CSS, and JavaScript for your project. We\'ll explain every line so you understand what\'s happening. No magic — just code you can read and change.',
      },
      {
        id: 'build-generate-html',
        phase: 'build',
        title: 'Generate HTML',
        explanation:
          'Your AI mentor is writing the HTML for your page. HTML uses "tags" like `<h1>` for headings and `<p>` for paragraphs. Every tag that opens must close: `<h1>Hello</h1>`.',
      },
      {
        id: 'build-generate-css',
        phase: 'build',
        title: 'Generate CSS',
        explanation:
          'Now we\'re adding the styles. CSS uses "selectors" to target HTML elements and "properties" to change how they look. For example: `body { background: #1a1a2e; }` makes the background dark.',
      },
      {
        id: 'build-generate-js',
        phase: 'build',
        title: 'Generate JavaScript',
        explanation:
          'Finally, we\'ll add interactivity. JavaScript responds to user actions like clicks and keypresses. We\'ll keep it simple and explain each function.',
      },
      {
        id: 'build-verify',
        phase: 'build',
        title: 'Check Your Code',
        command: 'cat index.html',
        explanation:
          '`cat` displays the contents of a file in the terminal. Let\'s peek at the HTML we just generated to make sure everything looks right.',
        expectedOutputPattern: '<html',
      },
    ],
  }
}
