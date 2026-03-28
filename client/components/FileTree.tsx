import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FolderOpen, FileText, ChevronRight } from 'lucide-react'
import type { FileTreeNode } from '../../shared/types'

interface Props {
  nodes: FileTreeNode[]
  newPaths: Set<string>
  depth?: number
}

function TreeNode({ node, newPaths, depth = 0 }: { node: FileTreeNode; newPaths: Set<string>; depth: number }) {
  const [open, setOpen] = useState(depth < 2)
  const isNew = newPaths.has(node.path)

  return (
    <div>
      <motion.div
        initial={isNew ? { opacity: 0, x: -8 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => node.type === 'directory' && setOpen((o) => !o)}
        className={`flex items-center gap-1.5 py-0.5 px-2 rounded cursor-pointer select-none
          hover:bg-white/5 transition-colors text-sm
          ${isNew ? 'text-emerald-300' : 'text-gray-300'}
        `}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {node.type === 'directory' ? (
          <>
            <ChevronRight
              className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-90' : ''}`}
            />
            {open ? (
              <FolderOpen className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isNew ? 'text-emerald-400' : 'text-gray-500'}`} />
          </>
        )}

        <span className="truncate">{node.name}</span>

        {isNew && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex-shrink-0"
          >
            new
          </motion.span>
        )}
      </motion.div>

      {node.type === 'directory' && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
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

export default function FileTree({ nodes, newPaths, depth = 0 }: Props) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <Folder className="w-8 h-8 text-gray-600 mb-2" />
        <p className="text-xs text-gray-500">Files will appear here</p>
        <p className="text-xs text-gray-600 mt-1">as you build your project</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeNode key={node.path} node={node} newPaths={newPaths} depth={depth} />
      ))}
    </div>
  )
}
