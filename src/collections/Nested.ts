import type {
  ArrayField,
  BlockField,
  CollectionConfig,
} from "payload/types";

const NestedArrayField: ArrayField = {
  name: 'nested',
  type: 'array',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
  required: true,
}
const NestedBlockField: BlockField = {
  name: 'nested',
  type: 'blocks',
  blocks: [
    {
      slug: 'just-text',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
    },
  ],
  required: true,
}

export const Nested: CollectionConfig = {
  slug: 'nested',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'nested-block',
          fields: [
            NestedBlockField,
          ],
        },
        {
          slug: 'nested-array',
          fields: [
            NestedArrayField,
          ],
        },
      ],
    },
    {
      name: 'nestedArrayBlocks',
      type: 'array',
      fields: [
        NestedBlockField,
      ],
    },
    {
      name: 'nestedArrayArray',
      type: 'array',
      fields: [
        NestedArrayField,
      ],
    },
  ],
}