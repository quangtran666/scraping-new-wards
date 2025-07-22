import { AddressConverterScraper } from './scraper';
import { readInputData, writeOutputData, validateInputData, createBackup, getLastProcessedId } from './utils';
import { InputAddressData, OutputAddressData } from './types';

/**
 * Main application for scraping Vietnamese address conversion data
 * 
 * This script automates the process of converting old administrative division names
 * to new ones using the address-converter.io.vn website.
 * 
 * Usage:
 *   npm run dev
 *   
 * Learn more about async/await patterns:
 * https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
 */

export class AddressConverterApp {
  private scraper: AddressConverterScraper;
  private readonly inputFilePath = './city_pref_names.json';
  private readonly outputFilePath = './converted_addresses.json';
  private readonly progressFilePath = './progress.json';

  constructor(options?: {
    headless?: boolean;
    operationDelay?: number;
    itemDelay?: number;
    timeout?: number;
  }) {
    // Initialize scraper with optimized configuration for speed
    this.scraper = new AddressConverterScraper({
      headless: options?.headless ?? true,           // Default to headless for speed
      operationDelay: options?.operationDelay ?? 1500, // 1.5s default
      maxRetries: 3,
      timeout: options?.timeout ?? 15000             // 15s timeout
    });
    
    this.itemDelay = options?.itemDelay ?? 1000;     // Delay between items
  }

  private readonly itemDelay: number;

  /**
   * Process all addresses from the input file, optionally starting from a specific pref_old_id
   */
  async processAllAddresses(options?: { startFromId?: number; resumeFromProgress?: boolean }): Promise<void> {
    let results: OutputAddressData[] = [];
    
    try {
      // Step 1: Read and validate input data
      console.log('\n📋 Step 1: Reading input data...');
      const rawData = await readInputData(this.inputFilePath);
      let inputData = validateInputData(rawData);
      
      if (inputData.length === 0) {
        throw new Error('No valid input data found');
      }

      // Step 1.5: Handle resume functionality
      let startFromId: number | null = null;
      
      if (options?.resumeFromProgress) {
        // Get the last processed ID from progress file
        const lastProcessedId = await getLastProcessedId(this.progressFilePath);
        if (lastProcessedId !== null) {
          startFromId = lastProcessedId + 1; // Start from the next ID
          console.log(`🔄 Resuming from progress: starting from pref_old_id ${startFromId}`);
        }
      } else if (options?.startFromId) {
        startFromId = options.startFromId;
        console.log(`🎯 Starting from specified pref_old_id: ${startFromId}`);
      }
      
      // Filter input data if we have a starting point
      if (startFromId !== null) {
        const originalCount = inputData.length;
        inputData = inputData.filter(item => item.pref_old_id >= startFromId!);
        console.log(`📊 Filtered data: ${inputData.length} items remaining (skipped ${originalCount - inputData.length} items)`);
        
        if (inputData.length === 0) {
          console.log(`✅ No items to process - all items before pref_old_id ${startFromId} have been completed`);
          return;
        }
      }

      // Step 2: Initialize browser
      console.log('\n🚀 Step 2: Initializing scraper...');
      await this.scraper.initialize();

      // Step 3: Process each address
      console.log('\n⚡ Step 3: Processing addresses...');
      
      for (let i = 0; i < inputData.length; i++) {
        const item = inputData[i];
        console.log(`\n📍 Progress: ${i + 1}/${inputData.length}`);
        
        // Refresh browser context every 20 items to prevent memory leaks
        if (i > 0 && i % 20 === 0) {
          console.log(`🔄 Refreshing browser context at item ${i + 1} to prevent memory issues...`);
          
          // Log memory usage
          const memUsage = process.memoryUsage();
          console.log(`📊 Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB heap, ${Math.round(memUsage.rss / 1024 / 1024)}MB RSS`);
          
          await this.scraper.refreshBrowserContext();
          
          // Add extra delay after refresh
          await this.delay(2000);
        }
        
        try {
          const result = await this.scraper.convertSingleAddress(item);
          results.push(result);
          
          // Optional: Save progress periodically
          if ((i + 1) % 10 === 0) {
            await this.saveProgress(results);
          }
          
        } catch (error) {
          console.error(`❌ Failed to process ${item.pref_name}:`, error);
          
          // Add failed entry with error marker
          results.push({
            city_name: item.city_name,
            pref_old_id: item.pref_old_id,
            pref_old_name: item.pref_name,
            pref_new_name: `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
            pref_new_fallback: item.pref_name,
          });
        }
        
        // Configurable delay between items for optimal speed vs rate limiting
        await this.delay(this.itemDelay);
      }

      // Step 4: Save final results
      console.log('\n💾 Step 4: Saving results...');
      await createBackup(this.outputFilePath);
      await writeOutputData(results, this.outputFilePath);
      
      // Step 5: Display summary
      this.displaySummary(results);
      
    } catch (error) {
      console.error('\n❌ Application error:', error);
      
      // Save partial results if any were collected
      if (results.length > 0) {
        const partialOutputPath = `./partial_results_${Date.now()}.json`;
        await writeOutputData(results, partialOutputPath);
        console.log(`💾 Saved partial results to: ${partialOutputPath}`);
      }
      
      throw error;
      
    } finally {
      // Always clean up browser resources
      await this.scraper.cleanup();
    }
  }

  /**
   * Save progress to a temporary file
   */
  private async saveProgress(results: OutputAddressData[]): Promise<void> {
    await writeOutputData(results, this.progressFilePath);
    console.log(`💾 Progress saved (${results.length} items)`);
  }

  /**
   * Display processing summary
   */
  private displaySummary(results: OutputAddressData[]): void {
    const successful = results.filter(r => !r.pref_new_name.startsWith('ERROR:')).length;
    const failed = results.length - successful;
    
    console.log('\n📊 PROCESSING SUMMARY');
    console.log('━'.repeat(50));
    console.log(`✅ Successful conversions: ${successful}`);
    console.log(`❌ Failed conversions: ${failed}`);
    console.log(`📄 Total processed: ${results.length}`);
    console.log(`📁 Results saved to: ${this.outputFilePath}`);
    console.log('━'.repeat(50));
  }

  /**
   * Simple delay utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Parse command line arguments for resume functionality
 */
function parseCommandLineArgs(): { startFromId?: number; resumeFromProgress?: boolean; isSpeedMode: boolean; isDebugMode: boolean } {
  const args = process.argv.slice(2);
  let startFromId: number | undefined;
  let resumeFromProgress = false;
  
  // Check for resume flag
  if (args.includes('--resume')) {
    resumeFromProgress = true;
  }
  
  // Check for specific start-from ID
  const startFromIndex = args.findIndex(arg => arg.startsWith('--start-from='));
  if (startFromIndex !== -1) {
    const value = args[startFromIndex].split('=')[1];
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      startFromId = parsedValue;
    } else {
      console.error('❌ Invalid --start-from value. Must be a positive integer.');
      process.exit(1);
    }
  }
  
  const isSpeedMode = process.env.SPEED_MODE === 'true' || args.includes('--speed');
  const isDebugMode = process.env.DEBUG_MODE === 'true' || args.includes('--debug');
  
  return { startFromId, resumeFromProgress, isSpeedMode, isDebugMode };
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  console.log('🎯 Vietnamese Address Converter Scraper');
  console.log('━'.repeat(50));
  
  // Parse command line arguments
  const { startFromId, resumeFromProgress, isSpeedMode, isDebugMode } = parseCommandLineArgs();
  
  let config = {};
  
  if (isSpeedMode) {
    console.log('🚀 Running in SPEED MODE');
    config = {
      headless: true,
      operationDelay: 1500,  // Reasonable delay for headless
      itemDelay: 1500,       // Slower to avoid rate limiting after item 30+
      timeout: 30000         // 30s timeout (was too short at 20s)
    };
  } else if (isDebugMode) {
    console.log('🐛 Running in DEBUG MODE');
    config = {
      headless: false,       // Show browser for debugging
      operationDelay: 3000,  // Slower for observation
      itemDelay: 2000,       // Slower item processing
      timeout: 30000         // Longer timeout
    };
  } else {
    console.log('⚡ Running in BALANCED MODE');
    config = {
      headless: true,
      operationDelay: 1500,
      itemDelay: 1000,
      timeout: 15000
    };
  }
  
  const app = new AddressConverterApp(config);
  
  try {
    await app.processAllAddresses({ startFromId, resumeFromProgress });
    console.log('\n🎉 Application completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Application failed:', error);
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the application
if (require.main === module) {
  main();
}
