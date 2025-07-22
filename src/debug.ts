import { AddressConverterScraper } from './scraper';
import { readInputData, writeOutputData, validateInputData } from './utils';

/**
 * Debug script to understand the page structure after conversion
 */

async function debugScraper(): Promise<void> {
  console.log('🔍 Debug Address Converter Scraper');
  console.log('━'.repeat(50));

  const scraper = new AddressConverterScraper({
    headless: false, // Keep visible for debugging
    operationDelay: 3000, // 3 second delays
    timeout: 30000
  });

  try {
    console.log('\n🚀 Initializing browser...');
    await scraper.initialize();

    console.log('\n🌐 Navigating to website...');
    await scraper.navigateToSite();

    console.log('\n🏙️ Selecting Hà Nội...');
    await scraper.selectCity('Hà Nội');

    console.log('\n🏘️ Selecting Quận Ba Đình...');
    await scraper.selectPrefecture('Quận Ba Đình');

    console.log('\n🏠 Selecting first ward...');
    await scraper.selectWard();

    console.log('\n🔄 Converting...');
    await scraper.clickConvert();

    console.log('\n📸 Taking screenshot...');
    // @ts-ignore - accessing private page property for debugging
    await scraper['page'].screenshot({ path: 'debug-result.png', fullPage: true });

    console.log('\n📋 Getting all text content...');
    // @ts-ignore
    const allText = await scraper['page'].textContent('body');
    console.log('\n--- PAGE CONTENT ---');
    console.log(allText);

    console.log('\n🔍 Looking for result sections...');
    // @ts-ignore
    const resultSections = await scraper['page'].locator('text=🎯 Kết quả chuyển đổi').all();
    console.log(`Found ${resultSections.length} result sections`);

    for (let i = 0; i < resultSections.length; i++) {
      const section = resultSections[i];
      const sectionText = await section.textContent();
      console.log(`\nSection ${i + 1}: ${sectionText}`);
    }

    console.log('\n🔍 Looking for all paragraphs...');
    // @ts-ignore
    const allParagraphs = await scraper['page'].locator('p').all();
    console.log(`Found ${allParagraphs.length} paragraphs`);

    for (let i = 0; i < allParagraphs.length; i++) {
      const para = allParagraphs[i];
      const paraText = await para.textContent();
      if (paraText && paraText.includes('Phường')) {
        console.log(`\nParagraph ${i + 1} (contains Phường): ${paraText}`);
      }
    }

    console.log('\n⏸️  Waiting 30 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('\n❌ Debug failed:', error);

  } finally {
    await scraper.cleanup();
  }
}

// Run debug if this file is executed directly
if (require.main === module) {
  debugScraper()
    .then(() => {
      console.log('\n🎉 Debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Debug failed:', error);
      process.exit(1);
    });
}
