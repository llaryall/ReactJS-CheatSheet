import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

// Load .env.local before anything else
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equalsIdx = trimmed.indexOf('=')
    if (equalsIdx > 0) {
      const key = trimmed.slice(0, equalsIdx).trim()
      let val = trimmed.slice(equalsIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  }
}

// Convert HTML to Lexical RichText AST
function htmlToLexical(html: string): any {
  if (!html || !html.trim()) {
    return {
      root: {
        type: 'root',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`)
  const body = dom.window.document.body

  const children: any[] = []

  function processInlineChildren(element: Element | ChildNode): any[] {
    const inlineNodes: any[] = []

    function traverse(node: ChildNode, currentFormat: number = 0) {
      if (node.nodeType === 3) {
        const text = node.textContent || ''
        if (text) {
          inlineNodes.push({
            type: 'text',
            text: text,
            format: currentFormat,
            mode: 'normal',
            style: '',
            detail: 0,
            version: 1,
          })
        }
        return
      }

      if (node.nodeType === 1) {
        const el = node as Element
        const tag = el.tagName.toLowerCase()

        if (tag === 'br') {
          inlineNodes.push({ type: 'linebreak', version: 1 })
          return
        }

        if (tag === 'a') {
          const href = el.getAttribute('href') || '#'
          const linkChildren: any[] = []
          for (const child of Array.from(el.childNodes)) {
            if (child.nodeType === 3 && child.textContent) {
              linkChildren.push({
                type: 'text',
                text: child.textContent,
                format: currentFormat,
                mode: 'normal',
                style: '',
                detail: 0,
                version: 1,
              })
            }
          }
          inlineNodes.push({
            type: 'link',
            fields: { url: href, newTab: true },
            children: linkChildren.length ? linkChildren : [{ type: 'text', text: href, format: 0, version: 1 }],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          })
          return
        }

        let newFormat = currentFormat
        if (tag === 'strong' || tag === 'b') newFormat |= 1
        if (tag === 'em' || tag === 'i') newFormat |= 2
        if (tag === 's' || tag === 'strike' || tag === 'del') newFormat |= 4
        if (tag === 'u') newFormat |= 8
        if (tag === 'code') newFormat |= 16

        for (const child of Array.from(el.childNodes)) {
          traverse(child, newFormat)
        }
      }
    }

    for (const child of Array.from(element.childNodes)) {
      traverse(child, 0)
    }

    return inlineNodes
  }

  function processBlockNode(node: ChildNode) {
    if (node.nodeType === 3) {
      const text = (node.textContent || '').trim()
      if (text) {
        children.push({
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: node.textContent || '',
              format: 0,
              mode: 'normal',
              style: '',
              detail: 0,
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        })
      }
      return
    }

    if (node.nodeType === 1) {
      const el = node as Element
      const tag = el.tagName.toLowerCase()

      // 1. Headings
      if (/^h[1-6]$/.test(tag)) {
        const inline = processInlineChildren(el)
        children.push({
          type: 'heading',
          tag: tag,
          children: inline.length ? inline : [{ type: 'text', text: el.textContent || '', format: 0, version: 1 }],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        })
        return
      }

      // 2. Pre / Code blocks
      if (tag === 'pre' || (tag === 'div' && el.querySelector('pre'))) {
        const preEl = tag === 'pre' ? el : el.querySelector('pre')!
        const codeEl = preEl.querySelector('code')
        const classAttr = (codeEl ? codeEl.getAttribute('class') : preEl.getAttribute('class')) || ''
        const langMatch = classAttr.match(/language-(\w+)/)
        const language = langMatch ? langMatch[1] : 'javascript'
        const codeText = (codeEl ? codeEl.textContent : preEl.textContent) || ''

        children.push({
          type: 'code',
          language: language,
          children: [
            {
              type: 'text',
              text: codeText,
              format: 0,
              mode: 'normal',
              style: '',
              detail: 0,
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        })
        return
      }

      // 3. Lists
      if (tag === 'ul' || tag === 'ol') {
        const listItems: any[] = []
        let value = 1
        for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
          const inline = processInlineChildren(li)
          listItems.push({
            type: 'listitem',
            value: value++,
            children: inline.length ? inline : [{ type: 'text', text: li.textContent || '', format: 0, version: 1 }],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          })
        }
        children.push({
          type: 'list',
          tag: tag,
          listType: tag === 'ol' ? 'number' : 'bullet',
          start: 1,
          children: listItems,
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        })
        return
      }

      // 4. Blockquote
      if (tag === 'blockquote') {
        const inline = processInlineChildren(el)
        children.push({
          type: 'quote',
          children: inline,
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        })
        return
      }

      // 5. Horizontal rule
      if (tag === 'hr') {
        children.push({
          type: 'horizontalrule',
          version: 1,
        })
        return
      }

      // 6. Generic Paragraph or Div container
      const hasBlockChildren = Array.from(el.children).some(child =>
        ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'ul', 'ol', 'blockquote'].includes(child.tagName.toLowerCase())
      )

      if (hasBlockChildren) {
        for (const child of Array.from(el.childNodes)) {
          processBlockNode(child)
        }
        return
      }

      const inline = processInlineChildren(el)
      if (inline.length > 0) {
        children.push({
          type: 'paragraph',
          children: inline,
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        })
      }
    }
  }

  for (const child of Array.from(body.childNodes)) {
    processBlockNode(child)
  }

  return {
    root: {
      type: 'root',
      children: children,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function runMigration() {
  console.log('--- Starting Migration from PocketBase to Payload CMS ---')

  const dumpPath = path.join(process.cwd(), 'scripts', 'pocketbase-dump.json')
  if (!fs.existsSync(dumpPath)) {
    console.error(`Error: PocketBase dump not found at ${dumpPath}`)
    process.exit(1)
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'))
  console.log(`Loaded ${dump.categories.length} categories and ${dump.topics.length} topics from dump.\n`)

  const { default: config } = await import('../payload.config')
  const { getPayload } = await import('payload')

  const payload = await getPayload({ config })
  console.log('Payload CMS initialized and connected to PostgreSQL.\n')

  // Map PocketBase category IDs to Payload Category IDs
  const pbCatToPayloadCat: Record<string, number | string> = {}

  // 1. Migrate Categories
  console.log('Migrating Categories...')
  for (const cat of dump.categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: {
        name: {
          equals: cat.name,
        },
      },
    })

    let payloadCatId: number | string
    if (existing.docs.length > 0) {
      payloadCatId = existing.docs[0].id
      console.log(`  ↻ Category "${cat.name}" already exists with ID: ${payloadCatId}`)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: {
          name: cat.name,
          display_order: cat.display_order ?? 0,
        },
      })
      payloadCatId = created.id
      console.log(`  ✓ Created Category "${cat.name}" with ID: ${payloadCatId}`)
    }
    pbCatToPayloadCat[cat.id] = payloadCatId
  }

  console.log('\nCategories migration finished.\n')

  // 2. Migrate Topics
  console.log('Migrating Topics...')
  let migratedTopics = 0
  let skippedTopics = 0

  for (const topic of dump.topics) {
    const targetCatId = pbCatToPayloadCat[topic.category]
    if (!targetCatId) {
      console.warn(`  ⚠ Warning: Category ID ${topic.category} not found for topic "${topic.title}"`)
      continue
    }

    const lexicalDescription = htmlToLexical(topic.description || '')

    // Check if topic exists by slug
    const existing = await payload.find({
      collection: 'topics',
      where: {
        slug: {
          equals: topic.slug,
        },
      },
    })

    if (existing.docs.length > 0) {
      // Update existing
      await payload.update({
        collection: 'topics',
        id: existing.docs[0].id,
        data: {
          title: topic.title,
          slug: topic.slug,
          tier: topic.tier,
          category: targetCatId as any,
          description: lexicalDescription,
          display_order: topic.display_order ?? 0,
        },
      })
      skippedTopics++
      console.log(`  ↻ Updated Topic "${topic.title}" (slug: ${topic.slug})`)
    } else {
      // Create new
      await payload.create({
        collection: 'topics',
        data: {
          title: topic.title,
          slug: topic.slug,
          tier: topic.tier,
          category: targetCatId as any,
          description: lexicalDescription,
          display_order: topic.display_order ?? 0,
        },
      })
      migratedTopics++
      console.log(`  ✓ Created Topic "${topic.title}" (slug: ${topic.slug})`)
    }
  }

  console.log(`\nTopics migration finished. Created: ${migratedTopics}, Updated: ${skippedTopics}, Total: ${migratedTopics + skippedTopics}\n`)

  // 3. Verify database totals
  const totalCategories = await payload.count({ collection: 'categories' })
  const totalTopics = await payload.count({ collection: 'topics' })

  console.log('=== Migration Verification ===')
  console.log(`Total Categories in Payload DB: ${totalCategories.totalDocs}`)
  console.log(`Total Topics in Payload DB: ${totalTopics.totalDocs}`)
  console.log('=== Migration Completed Successfully! ===\n')

  process.exit(0)
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err)
  process.exit(1)
})
