import type { PhaseDefinition } from './types.js'

export function getDeployPhase(): PhaseDefinition {
  return {
    id: 'deploy',
    title: 'Deploy',
    description: 'Put your site on the internet (stretch goal)',
    steps: [
      {
        id: 'deploy-explain',
        phase: 'deploy',
        title: 'Going Live!',
        explanation:
          'Your website is done! Right now it only exists on your computer. To share it with the world, you need to "deploy" it — which means uploading it to a server that\'s always connected to the internet.',
      },
      {
        id: 'deploy-celebrate',
        phase: 'deploy',
        title: 'Congratulations!',
        explanation:
          'You just built a website from scratch using the terminal! You learned about HTML, CSS, JavaScript, and the command line. These are real skills that professional developers use every day. Keep building!',
      },
    ],
  }
}
