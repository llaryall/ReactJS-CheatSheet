import type { CollectionConfig } from 'payload'

export const CodeComparisons: CollectionConfig = {
  slug: 'code-comparisons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'badLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Common Mistake',
    },
    {
      name: 'badCode',
      type: 'textarea',
      required: true,
    },
    {
      name: 'badGotcha',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'goodLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Best Practice',
    },
    {
      name: 'goodCode',
      type: 'textarea',
      required: true,
    },
    {
      name: 'goodReason',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'footerNote',
      type: 'text',
      localized: true,
    },
    {
      name: 'relatedTopic',
      type: 'relationship',
      relationTo: 'topics',
    },
  ],
}
