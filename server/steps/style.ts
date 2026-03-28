import type { PhaseDefinition } from './types.js'

export function getStylePhase(): PhaseDefinition {
  return {
    id: 'style',
    title: 'Style',
    description: 'Polish the visual design',
    steps: [
      {
        id: 'style-explain',
        phase: 'style',
        title: 'Making It Beautiful',
        explanation:
          'Your website works, but let\'s make it look professional. We\'ll refine the CSS to add smooth animations, better typography, and a cohesive color scheme. Good design makes people trust your site.',
      },
      {
        id: 'style-enhance',
        phase: 'style',
        title: 'Enhanced Styling',
        explanation:
          'Your AI mentor is improving the CSS with modern techniques like flexbox for layout, CSS variables for consistent colors, and smooth transitions for a polished feel.',
      },
      {
        id: 'style-preview',
        phase: 'style',
        title: 'Preview Your Site',
        command: 'open index.html',
        explanation:
          'The `open` command opens a file with the default application — for HTML files, that\'s your web browser! You should see your finished website.',
        expectedOutputPattern: '\\$',
        errorPatterns: ['command not found'],
      },
    ],
  }
}
