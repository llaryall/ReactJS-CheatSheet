import type { CollectionConfig } from 'payload'

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
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
      defaultValue: 'Find the bug in this code.',
    },
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'codeSnippet',
      type: 'textarea',
      required: true,
    },
    {
      name: 'options',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'isCorrect',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'explanation',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'relatedTopic',
      type: 'relationship',
      relationTo: 'topics',
    },
  ],
}
