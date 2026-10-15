import type { CollectionConfig } from 'payload'

export const Sources: CollectionConfig = {
  slug: 'sources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publisher', 'sourceType', 'lastVerifiedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'publisher',
      type: 'text',
      required: true,
      defaultValue: 'Official React Documentation (react.dev)',
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'publishedDate',
      type: 'date',
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'sourceType',
      type: 'select',
      defaultValue: 'official-react-dev',
      options: [
        { label: 'Official React Docs (react.dev)', value: 'official-react-dev' },
        { label: 'Official React RFC / GitHub Discussion', value: 'official-rfc' },
        { label: 'Framework Documentation (Next.js / Remix)', value: 'framework-docs' },
        { label: 'Authoritative Library Documentation', value: 'library-docs' },
        { label: 'Verified Engineering Practitioner Analysis', value: 'practitioner-post' },
      ],
    },
    {
      name: 'supportedClaim',
      type: 'textarea',
    },
    {
      name: 'versionCaveats',
      type: 'text',
    },
  ],
}
