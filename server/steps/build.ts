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
          'Now the fun part begins. Your AI mentor will generate the HTML, CSS, and JavaScript for your project. Every line will be commented so you understand what it does — no magic, just real code you can read, understand, and change yourself.',
      },
      {
        id: 'build-generate',
        phase: 'build',
        title: 'AI Is Writing Your Website',
        explanation:
          'Your AI mentor is writing the complete HTML, CSS, and JavaScript for your site right now. It\'ll create a proper structure with a header, main content area, and footer — all styled and ready to view in a browser.',
      },
      {
        id: 'build-verify-html',
        phase: 'build',
        title: 'Inspect the HTML',
        command: 'cat index.html',
        explanation:
          '`cat` prints the contents of a file directly in the terminal. Let\'s take a look at the HTML that was just generated. You\'ll see tags like `<header>`, `<main>`, and `<section>` — these are the building blocks of every webpage on the internet.',
        expectedOutputPattern: '<!DOCTYPE html>',
        errorPatterns: ['No such file or directory', 'cat:'],
      },
      {
        id: 'build-verify-css',
        phase: 'build',
        title: 'Inspect the CSS',
        command: 'cat style.css',
        explanation:
          'Now let\'s look at the CSS. You\'ll see "selectors" (like `body` or `.hero`) that target HTML elements, and "properties" (like `color` or `font-size`) that change how those elements look. CSS is very readable once you know the pattern.',
        expectedOutputPattern: '\\{',
        errorPatterns: ['No such file or directory', 'cat:'],
      },
      {
        id: 'build-count-lines',
        phase: 'build',
        title: 'How Much Did We Write?',
        command: 'wc -l index.html style.css script.js',
        explanation:
          '`wc -l` counts the number of lines in a file. This is a fun way to see how much code was generated. Professional websites can have thousands of lines — yours is already off to a great start!',
        expectedOutputPattern: 'total',
        errorPatterns: ['No such file or directory'],
      },
    ],
  }
}
