// Test script to verify sitemap functionality
import { generateSitemapXML } from './src/services/sitemapService.js';

async function testSitemap() {
  console.log('Testing sitemap generation...');
  
  try {
    const sitemap = await generateSitemapXML();
    console.log('Sitemap generated successfully:');
    console.log(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

testSitemap();