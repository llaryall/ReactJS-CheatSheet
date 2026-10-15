import type { CollectionConfig } from 'payload'

export const DecisionTrees: CollectionConfig = {
  slug: 'decision-trees',
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
      name: 'rootQuestion',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'nodes',
      type: 'json',
      required: true,
    },
    {
      name: 'relatedTopic',
      type: 'relationship',
      relationTo: 'topics',
    },
  ],
}
