import { AddressConverterScraper } from './scraper';
import { readInputData, writeOutputData, validateInputData } from './utils';
import { OutputAddressData } from './types';

/**
 * Test script for the address converter scraper
 * 
 * This script tests the scraper with a small dataset to ensure everything works correctly
 * before running on the full dataset.
 */

async function testScraper(): Promise<void> {
  console.log('🧪 Testing Address Converter Scraper');
  console.log('━'.repeat(50));

  const scraper = new AddressConverterScraper({
    headless: false, // Keep visible for testing
    operationDelay: 2000, // 2 second delays
    timeout: 30000
  });

  let results: OutputAddressData[] = [];

  try {
    // Read test data
    console.log('\n📖 Reading test data...');
    const rawData = await readInputData('./test_data.json');
    const inputData = validateInputData(rawData);

    console.log(`✅ Loaded ${inputData.length} test records`);

    // Initialize browser
    console.log('\n🚀 Initializing browser...');
    await scraper.initialize();

    // Process first item only for testing
    console.log('\n🔍 Processing first test item...');
    const testItem = inputData[0];
    
    const result = await scraper.convertSingleAddress(testItem);
    results.push(result);

    console.log('\n✅ Test conversion successful!');
    console.log('Result:', result);

    // Save test result
    await writeOutputData(results, './test_result.json');
    console.log('💾 Test result saved to test_result.json');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;

  } finally {
    await scraper.cleanup();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testScraper()
    .then(() => {
      console.log('\n🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}
