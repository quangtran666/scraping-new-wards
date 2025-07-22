/**
 * Enhanced Speed Test with 10 items to simulate timeout issue
 */

import fs from 'fs/promises';
import { readInputData, writeOutputData } from './utils';
import { AddressConverterApp } from './index';

async function testEnhancedSpeed(): Promise<void> {
  console.log('🧪 Enhanced Speed Test - 10 Items');
  console.log('━'.repeat(50));
  
  try {
    // Read original data and take first 10 items
    const originalData = await readInputData('./city_pref_names.json');
    const testData = originalData.slice(0, 10); // Test with 10 items
    
    console.log(`📋 Testing with ${testData.length} items from full dataset`);
    
    // Write test data to JSON file
    await fs.writeFile('./enhanced_test_input.json', JSON.stringify(testData, null, 2));
    
    // Override process.argv to simulate speed mode
    process.argv = [...process.argv.filter(arg => !arg.includes('--')), '--speed'];
    
    const startTime = Date.now();
    
    const config = {
      headless: true,
      operationDelay: 1500,
      itemDelay: 1500,       // Updated delay
      timeout: 30000         // Updated timeout
    };

    console.log('🚀 Testing enhanced speed mode...');
    console.log(`⚙️  Config: timeout=${config.timeout}ms, itemDelay=${config.itemDelay}ms`);
    
    const app = new AddressConverterApp(config);
    
    // Override file paths for testing
    (app as any).inputFilePath = './enhanced_test_input.json';
    (app as any).outputFilePath = './enhanced_test_result.json';
    
    await app.processAllAddresses();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('🎉 Enhanced speed test completed!');
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
    console.log(`🚀 Average per item: ${(duration / testData.length).toFixed(2)} seconds`);
    
    // Read and display results
    const results = await readInputData('./enhanced_test_result.json');
    const successful = results.filter((r: any) => !r.pref_new_name.startsWith('ERROR')).length;
    
    console.log(`✅ Successful: ${successful}/${testData.length}`);
    console.log(`❌ Failed: ${testData.length - successful}/${testData.length}`);
    
  } catch (error) {
    console.error('❌ Enhanced speed test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testEnhancedSpeed();
}
