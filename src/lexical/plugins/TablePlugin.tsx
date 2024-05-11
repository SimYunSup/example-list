import React from 'react'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'

export default function (): JSX.Element {
  return (
    <TablePlugin
      hasCellBackgroundColor
      hasCellMerge
    />
  )
}