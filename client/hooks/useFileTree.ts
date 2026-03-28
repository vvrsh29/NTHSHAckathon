import { useState, useEffect, useRef } from 'react'
import type { FileTreeNode } from '../../shared/types'

export function useFileTree(projectName?: string) {
  const [tree, setTree] = useState<FileTreeNode[]>([])
  const [newPaths, setNewPaths] = useState<Set<string>>(new Set())
  const prevPathsRef = useRef<Set<string>>(new Set())

  // Also accept tree pushes from WS (passed via callback)
  const updateTree = (nodes: FileTreeNode[]) => {
    const currentPaths = collectPaths(nodes)
    const added = new Set<string>()
    currentPaths.forEach((p) => {
      if (!prevPathsRef.current.has(p)) added.add(p)
    })
    if (added.size > 0) {
      setNewPaths(added)
      setTimeout(() => setNewPaths(new Set()), 3000)
    }
    prevPathsRef.current = currentPaths
    setTree(nodes)
  }

  // Poll REST endpoint as fallback / initial load
  useEffect(() => {
    const url = projectName ? `/api/file-tree?project=${encodeURIComponent(projectName)}` : '/api/file-tree'
    const poll = async () => {
      try {
        const res = await fetch(url)
        const data: FileTreeNode[] = await res.json()
        updateTree(data)
      } catch {}
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [projectName])

  return { tree, newPaths, updateTree }
}

function collectPaths(nodes: FileTreeNode[]): Set<string> {
  const paths = new Set<string>()
  const walk = (ns: FileTreeNode[]) => {
    ns.forEach((n) => {
      paths.add(n.path)
      if (n.children) walk(n.children)
    })
  }
  walk(nodes)
  return paths
}
