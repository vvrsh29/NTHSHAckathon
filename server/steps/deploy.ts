import type { PhaseDefinition } from './types.js'

export function getDeployPhase(): PhaseDefinition {
  return {
    id: 'deploy',
    title: 'Deploy',
    description: 'Share your site with the world',
    steps: [
      {
        id: 'deploy-explain',
        phase: 'deploy',
        title: 'Going Live!',
        explanation:
          'Your website is finished and looks great — but right now it only lives on your computer. To share it with anyone in the world, you need to "deploy" it, which means uploading your files to a server that\'s always connected to the internet. The most beginner-friendly option is Netlify Drop — no account needed!',
      },
      {
        id: 'deploy-list-files',
        phase: 'deploy',
        title: 'Review What You Built',
        command: 'ls -lh',
        explanation:
          '`ls -lh` lists your files with details: file size (in human-readable format like KB), permissions, and last modified time. These three files — `index.html`, `style.css`, and `script.js` — are everything you need to deploy a real website.',
        expectedOutputPattern: 'index\\.html',
        errorPatterns: [],
      },
      {
        id: 'deploy-instructions',
        phase: 'deploy',
        title: 'Deploy to the Web',
        explanation:
          'To deploy: open **netlify.com/drop** in your browser, then drag your entire project folder onto the page. Netlify will give you a live URL in seconds — completely free. You can share that link with anyone in the world right now.',
      },
      {
        id: 'deploy-celebrate',
        phase: 'deploy',
        title: 'Congratulations — You\'re a Builder!',
        explanation:
          'You just built a real website from scratch using the terminal. You learned `mkdir`, `cd`, `pwd`, `touch`, `ls`, `cat`, `wc`, and `open` — these are commands professional developers use every single day. More importantly, you learned how HTML, CSS, and JavaScript work together. Keep building!',
      },
    ],
  }
}
