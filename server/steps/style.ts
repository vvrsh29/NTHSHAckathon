import type { PhaseDefinition } from './types.js'

export function getStylePhase(): PhaseDefinition {
  return {
    id: 'style',
    title: 'Style',
    description: 'Polish the visual design and preview your site',
    steps: [
      {
        id: 'style-explain',
        phase: 'style',
        title: 'Making It Beautiful',
        explanation:
          'Your website is functional — now let\'s make it look professional. Good design isn\'t just about looks; it\'s about making visitors feel welcome and making your content easy to read. We\'ll use modern CSS techniques like flexbox, smooth transitions, and a clean colour palette.',
      },
      {
        id: 'style-enhance',
        phase: 'style',
        title: 'AI Is Polishing Your Design',
        explanation:
          'Your AI mentor is enhancing the CSS with a refined colour scheme, improved typography, hover effects, and responsive layout rules so your site looks great on any screen size. These are the same techniques used on professional websites.',
      },
      {
        id: 'style-verify-css',
        phase: 'style',
        title: 'Review the Updated CSS',
        command: 'cat style.css',
        explanation:
          'Let\'s check the updated styles. Look for CSS variables (lines that start with `--`), which let you control the whole colour scheme from one place. Also notice `@media` rules — these make the layout adapt to phone and tablet screens.',
        expectedOutputPattern: '\\{',
        errorPatterns: ['No such file or directory', 'cat:'],
      },
      {
        id: 'style-preview',
        phase: 'style',
        title: 'Open Your Website in a Browser',
        command: 'open index.html',
        explanation:
          'The `open` command launches a file with the default application — for `.html` files, that\'s your web browser. You\'re about to see the website you built from scratch! On Linux, use `xdg-open index.html` instead.',
        expectedOutputPattern: '\\$\\s*$',
        errorPatterns: ['command not found', 'No application'],
      },
    ],
  }
}
