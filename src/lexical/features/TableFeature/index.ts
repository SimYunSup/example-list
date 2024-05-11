import type {
  SerializedTableCellNode,
  SerializedTableNode,
} from '@lexical/table';
import type {
  FeatureProvider,
  HTMLConverter,
} from '@payloadcms/richtext-lexical';
import type { SerializedElementNode } from 'lexical';

import {
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import {
  SlashMenuOption,
  convertLexicalNodesToHTML,
} from '@payloadcms/richtext-lexical';
import { TOGGLE_INSERT_TABLE_MODAL_COMMAND } from "../../command/modal";

export const HTMLTableNodeConverter: HTMLConverter<SerializedTableNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: {
        ...node,
        parent,
      },
    });

    return `<table><tbody>${childrenText}</tbody></table>`;
  },
  nodeTypes: [TableNode.getType()],
};

export const HTMLTableCellNodeConverter: HTMLConverter<SerializedTableCellNode> = {
  converter: async ({ converters, node, parent }) => {
    const { colSpan, rowSpan, headerState } = node;
    const headerTag = headerState ? 'th' : 'td';
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: {
        ...node,
        parent,
      },
    });

    return `<${headerTag} colspan="${colSpan}" rowSpan="${rowSpan}">${childrenText}</${headerTag}>`;
  },
  nodeTypes: [TableCellNode.getType()],
};

export const HTMLTableRowNodeConverter: HTMLConverter<SerializedElementNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: {
        ...node,
        parent,
      },
    });

    return `<tr>${childrenText}</tr>`;
  },
  nodeTypes: [TableRowNode.getType()],
};

export const TableFeature = (): FeatureProvider => ({
  feature: () => ({
    nodes: [
      {
        converters: {
          html: HTMLTableNodeConverter as HTMLConverter,
        },
        node: TableNode,
        type: TableNode.getType(),
      },
      {
        converters: {
          html: HTMLTableCellNodeConverter as HTMLConverter,
        },
        node: TableCellNode,
        type: TableCellNode.getType(),
      },
      {
        converters: {
          html: HTMLTableRowNodeConverter as HTMLConverter,
        },
        node: TableRowNode,
        type: TableRowNode.getType(),
      },
    ],
    plugins: [
      {
        Component: () => (import('../../plugins/TablePlugin'))
          .then((module) => module.default),
        position: 'normal',
      },
      {
        Component: () => (import('../../plugins/TableActionMenuPlugin'))
          .then((module) => module.default),
        position: 'normal',
      },
      {
        Component: () => (import('../../plugins/TableCellResizerPlugin'))
          .then((module) => module.default),
        position: 'normal',
      },
    ],
    props: null,
    slashMenu: {
      options: [
        {
          options: [
            new SlashMenuOption('Table', {
              Icon: () => (import('./Icon'))
                .then((module) => module.TableIcon),
              keywords: ['table'],
              onSelect: ({ editor }) => {
                editor.dispatchCommand(TOGGLE_INSERT_TABLE_MODAL_COMMAND, {
                  defaultColumns: 3,
                  defaultRows: 3,
                });
              },
            }),
          ],
          displayName: '표',
          key: 'table',
        },
      ],
    },
  }),
  key: 'lexical-plugin-table',
});
