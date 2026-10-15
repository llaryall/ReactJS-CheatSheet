import type { CollectionConfig } from 'payload'

export const Topics: CollectionConfig = {
  slug: 'topics',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tier', 'category', 'translationStatus'],
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
      name: 'tier',
      type: 'select',
      required: true,
      options: [
        { label: 'Beginner (🟢)', value: '🟢' },
        { label: 'Common Use (🔵)', value: '🔵' },
        { label: 'Advanced (🟣)', value: '🟣' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'mentalModel',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'goldenRule',
      type: 'text',
      localized: true,
    },
    {
      name: 'whenToUse',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'whenNotToUse',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'codeSnippetTs',
      type: 'textarea',
    },
    {
      name: 'codeSnippetJs',
      type: 'textarea',
    },
    {
      name: 'codeExplanation',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'reactVersion',
      type: 'select',
      defaultValue: 'react-18-19',
      options: [
        { label: 'React 18 & 19 Compatible', value: 'react-18-19' },
        { label: 'React 19+ Only', value: 'react-19-only' },
        { label: 'Legacy / React 18 Only', value: 'legacy-compatible' },
      ],
    },
    {
      name: 'sources',
      type: 'relationship',
      relationTo: 'sources',
      hasMany: true,
    },
    {
      name: 'translationStatus',
      type: 'select',
      defaultValue: 'en-only',
      options: [
        { label: 'English Only', value: 'en-only' },
        { label: 'Persian Draft', value: 'fa-draft' },
        { label: 'Verified Bilingual Parity', value: 'verified-parity' },
        { label: 'Out of Sync / Needs Review', value: 'needs-sync' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isArchived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'display_order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
