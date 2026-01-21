import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // 获取所有文章
    const articlesResponse = await fetch(`${baseUrl}/api/articles?limit=1000`);
    const articlesData = await articlesResponse.json();
    const articles = articlesData.articles || [];

    // 获取分类
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.categories || [];

    // 获取标签
    const tagsResponse = await fetch(`${baseUrl}/api/tags`);
    const tagsData = await tagsResponse.json();
    const tags = tagsData.tags || [];

    // 构建 sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/tags</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${articles
    .filter((article: any) => article.isPublic && article.status === 'published')
    .map(
      (article: any) => `
  <url>
    <loc>${baseUrl}/articles/${article.id}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('')}
  ${categories
    .map(
      (category: any) => `
  <url>
    <loc>${baseUrl}/categories/${category.id}</loc>
    <lastmod>${new Date(category.updatedAt || category.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
  ${tags
    .map(
      (tag: any) => `
  <url>
    <loc>${baseUrl}/tags/${tag.id}</loc>
    <lastmod>${new Date(tag.updatedAt || tag.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
