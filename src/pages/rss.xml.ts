import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection, render } from 'astro:content';
import { url, sortUpdates } from '../lib/site';

export async function GET(context: APIContext) {
  const updates = sortUpdates(await getCollection('updates'));
  const items = await Promise.all(
    updates.map(async (entry) => {
      await render(entry);
      return {
        title: `${entry.data.version}: ${entry.data.title}`,
        pubDate: entry.data.date,
        link: url(`updates/${entry.data.version}/`),
        content: entry.rendered?.html ?? entry.body,
        categories: [entry.data.kind],
      };
    }),
  );
  return rss({
    title: 'RealView updates',
    description: 'New releases of the RealView Chrome extension for YouTube Studio.',
    site: new URL(url(), context.site),
    items,
  });
}
