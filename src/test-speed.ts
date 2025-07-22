/**
 * Speed Test Script for Address Converter Scraper
 * 
 * This script tests the speed mode with a small dataset to ensure
 * performance optimizations are working correctly.
 */

import { AddressConverterApp } from './index';

async function testSpeedMode(): Promise<void> {
  console.log('⚡ Testing Speed Mode');
  console.log('━'.repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Override process.argv to simulate speed mode
    process.argv = [...process.argv, '--speed'];
    
    const config = {
      headless: true,
      operationDelay: 1500,
      itemDelay: 800,
      timeout: 20000
    };

    console.log('🚀 Initializing speed mode test...');
    const app = new AddressConverterApp(config);
    
    // Test with test_data.json (3 items)
    console.log('📋 Using test_data.json for speed testing');
    
    const originalInputPath = app['inputFilePath'];
    const originalOutputPath = app['outputFilePath'];
    
    // Override file paths for testing
    (app as any).inputFilePath = './test_data.json';
    (app as any).outputFilePath = './speed_test_result.json';
    
    await app.processAllAddresses();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('🎉 Speed test completed!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log(`🚀 Average per item: ${(duration / 3).toFixed(2)} seconds`);
    
  } catch (error) {
    console.error('❌ Speed test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testSpeedMode();
}
