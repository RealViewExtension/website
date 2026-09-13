import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One markdown file per released version, in src/content/updates/.
// The file name is the version, e.g. 1.7.4.md. See README.md for the format.
const updates = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/updates',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must look like 1.7.4'),
    date: z.coerce.date(),
    kind: z.enum(['feature', 'fix']),
    title: z.string().min(1),
  }),
});

export const collections = { updates };
