import {
  AlignFeature,
  BlockQuoteFeature,
  BoldTextFeature,
  CheckListFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeTextFeature,
  ItalicTextFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughTextFeature,
  SubscriptTextFeature,
  SuperscriptTextFeature,
  UnderlineTextFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { CollectionConfig } from 'payload/types'
import { TableFeature } from '../lexical/features/TableFeature'

export const RichText: CollectionConfig = {
  slug: 'richTexts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'text',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          BoldTextFeature(),
          ItalicTextFeature(),
          UnderlineTextFeature(),
          StrikethroughTextFeature(),
          SubscriptTextFeature(),
          SuperscriptTextFeature(),
          InlineCodeTextFeature(),
          ParagraphFeature(),
          HeadingFeature({}),
          AlignFeature(),
          IndentFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          CheckListFeature(),
          // ADD: Deleted because this is not floating toolbar.
          // LinkFeature({}),
          // END: Deleted because this is not floating toolbar.
          RelationshipFeature(),
          BlockQuoteFeature(),
          UploadFeature(),
          HorizontalRuleFeature(),
          TableFeature(),
        ]
      })
    }
  ],
}
