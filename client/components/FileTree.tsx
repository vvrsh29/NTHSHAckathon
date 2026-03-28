import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FolderOpen, FileText, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileTreeNode } from '../../shared/types'

function TreeNode({ node, newPaths, depth }: { node: FileTreeNode; newPaths: Set<string>; depth: number }) {
  const [open, setOpen] = useState(depth < 2)
  const isNew = newPaths.has(node.path)

  return (
    <div>
      <div
        onClick={() => node.type === 'directory' && setOpen((o) => !o)}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        className={cn(
          'flex items-center gap-1.5 h-6 pr-2 cursor-pointer select-none rounded-sm mx-1 text-xs transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isNew ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
        )}
      >
        {node.type === 'directory' ? (
          <>
            <ChevronRight className={cn('w-3 h-3 flex-shrink-0 transition-transform', open && 'rotate-90')} />
            {open
              ? <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
              : <Folder className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
            }
          </>
        ) : (
          <>
            <span className="w-3 flex-shrink-0" />
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          </>
        )}
        <span className="truncate flex-1">{node.name}</span>
        {isNew && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 rounded"
          >
            new
          </motion.span>
        )}
      </div>

      {node.type === 'directory' && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {node.children?.map((child) => (
                <TreeNode key={child.path} node={child} newPaths={newPaths} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

interface Props {
  nodes: FileTreeNode[]
  newPaths: Set<string>
}

export default function FileTree({ nodes, newPaths }: Props) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
        <Folder className="w-6 h-6 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Files appear here as you build</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeNode key={node.path} node={node} newPaths={newPaths} depth={0} />
      ))}
    </div>
  )
}
