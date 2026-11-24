import {coreRoutes, toolRegistry, isIndexableTool} from './catalog.mjs';

export const PRODUCTION_ORIGIN = 'https://threemelo.com';

export function canonicalUrl(path) {
  // Fail a build on malformed registry paths instead of publishing URL variants.
  if (typeof path !== 'string' || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/.test(path)) {
    throw new Error(`Invalid canonical route: ${path}`);
  }
  return PRODUCTION_ORIGIN + path;
}

export function sitemapEntries(registry = toolRegistry) {
  const paths = [...coreRoutes, ...registry.filter(isIndexableTool).map(tool => `/${tool.slug}/`)];
  if (new Set(paths).size !== paths.length) throw new Error('Duplicate sitemap route');
  // No reliable editorial timestamps exist yet. Omit lastModified rather than use build time.
  return paths.map(path => ({url: canonicalUrl(path)}));
}

export function pageMetadata(path, metadata) {
  const url = canonicalUrl(path);
  const tool = toolRegistry.find(item => `/${item.slug}/` === path);
  const indexable = tool ? isIndexableTool(tool) : coreRoutes.includes(path);
  return {
    ...metadata,
    alternates: {...metadata.alternates, canonical: url},
    robots: {...metadata.robots, index: indexable && metadata.robots?.index !== false, follow: metadata.robots?.follow !== false},
    openGraph: {
      title: typeof metadata.title === 'string' ? metadata.title : metadata.title?.absolute,
      description: metadata.description,
      type: 'website',
      images: [{url: tool ? `/social/${tool.slug}.png` : '/studio-social.png', width: 1200, height: 630, alt: tool?.name || 'ThreeMelo browser-based 3D studio'}],
      ...metadata.openGraph,
      url,
    },
  };
}
