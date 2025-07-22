import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { InputAddressData, OutputAddressData, ScraperConfig, ElementSelectors } from './types';

/**
 * AddressConverterScraper - A Playwright-based scraper for converting Vietnamese address data
 * 
 * This class handles the automation of the address converter website to transform
 * old administrative division names to new ones.
 * 
 * Learn more about Playwright:
 * - Basic concepts: https://playwright.dev/docs/intro
 * - Page interactions: https://playwright.dev/docs/api/class-page
 * - Best practices: https://playwright.dev/docs/best-practices
 */
export class AddressConverterScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  
  private readonly config: ScraperConfig;
  private readonly selectors: ElementSelectors;

  constructor(config?: Partial<ScraperConfig>) {
    // Default configuration
    this.config = {
      baseUrl: 'https://address-converter.io.vn/',
      timeout: 10000, // 10 seconds
      operationDelay: 2000, // 2 seconds between operations
      maxRetries: 1,
      headless: false, // Set to true for production
      ...config
    };

    // XPath selectors as specified in requirements
    this.selectors = {
      cityDropdown: '/html/body/div[4]/div/main/div/div[2]/section/div/div[2]/div[1]/button',
      prefDropdown: '/html/body/div[4]/div/main/div/div[2]/section/div/div[2]/div[2]/button',
      wardDropdown: '/html/body/div[4]/div/main/div/div[2]/section/div/div[2]/div[3]/button',
      convertButton: '/html/body/div[4]/div/main/div/div[2]/section/div/div[2]/div[7]/button[1]',
      resultContainer: '/html/body/div[4]/div/main/div/div[2]/section/div[2]/div[2]/div[3]/div[2]/div[2]'
    };
  }

  /**
   * Initialize the browser and create a new page
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing browser...');
    
    this.browser = await chromium.launch({
      headless: this.config.headless,
      slowMo: this.config.headless ? 0 : 50,  // No slowMo in headless for speed
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-plugins',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
        // Don't disable images/js as website needs them to function
      ]
    });

    this.context = await this.browser.newContext({
      // Optimized viewport for speed
      viewport: { width: 1280, height: 720 },
      // Keep user agent for better compatibility
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    // Only block heavy resources, not critical ones
    if (this.config.headless) {
      await this.context.route('**/*', (route, request) => {
        const resourceType = request.resourceType();
        if (['image', 'media'].includes(resourceType)) {
          // Only block images and media, keep CSS and fonts
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    this.page = await this.context.newPage();
    
    // Set optimized timeout
    this.page.setDefaultTimeout(this.config.timeout);
    
    console.log('✅ Browser initialized successfully');
  }

  /**
   * Navigate to the address converter website
   */
  async navigateToSite(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log(`🌐 Navigating to ${this.config.baseUrl}`);
    await this.page.goto(this.config.baseUrl);
    
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
  }

  /**
   * Select city from the first dropdown
   */
  async selectCity(cityName: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log(`🏙️  Selecting city: ${cityName}`);
    
    // Handle notification dialog if present - but don't fail if it's not there
    try {
      const closeButton = this.page.getByRole('button', { name: 'Close' });
      if (await closeButton.isVisible({ timeout: 3000 })) {
        await closeButton.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Closed notification dialog');
      }
    } catch (error) {
      // Dialog not present or already closed, continue
      console.log('ℹ️  No dialog to close');
    }
    
    // Click to open city dropdown
    await this.page.getByText('-- Chọn tỉnh/thành phố --').click();
    await this.page.waitForTimeout(this.config.operationDelay);
    
    // Look for the city option and click it
    await this.page.getByRole('option', { name: cityName }).click();
    
    await this.page.waitForTimeout(this.config.operationDelay);
    console.log(`✅ City selected: ${cityName}`);
  }

  /**
   * Select prefecture/district from the second dropdown
   * Returns the actual prefecture name used (original or fallback)
   */
  async selectPrefecture(prefName: string): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log(`🏘️  Selecting prefecture: ${prefName}`);
    
    // Click to open prefecture dropdown
    await this.page.getByText('-- Chọn quận/huyện --').click();
    await this.page.waitForTimeout(this.config.operationDelay);
    
    // Try to select with original name first
    try {
      await this.page.getByRole('option', { name: prefName }).click();
      await this.page.waitForTimeout(this.config.operationDelay);
      console.log(`✅ Prefecture selected (original): ${prefName}`);
      return prefName;
    } catch (error) {
      console.log(`⚠️  Original prefecture name not found: ${prefName}, trying fallback...`);
      
      // Create fallback name by replacing administrative divisions
      let fallbackName = prefName;
      fallbackName = fallbackName.replace(/^Huyện\s/, 'Thị xã ');
      fallbackName = fallbackName.replace(/^Thành phố\s/, 'Thị xã ');
      fallbackName = fallbackName.replace(/^Quận\s/, 'Thị xã ');
      
      if (fallbackName !== prefName) {
        try {
          await this.page.getByRole('option', { name: fallbackName }).click();
          await this.page.waitForTimeout(this.config.operationDelay);
          console.log(`✅ Prefecture selected (fallback): ${fallbackName}`);
          return fallbackName;
        } catch (fallbackError) {
          console.error(`❌ Both original and fallback prefecture names failed: ${prefName} -> ${fallbackName}`);
          throw new Error(`Prefecture not found: ${prefName} (tried fallback: ${fallbackName})`);
        }
      } else {
        console.error(`❌ No fallback available for: ${prefName}`);
        throw error;
      }
    }
  }

  /**
   * Select any option from the third dropdown (ward/commune)
   */
  async selectWard(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log('🏠 Selecting ward/commune (first available option)');
    
    // Click to open ward dropdown
    await this.page.getByText('-- Chọn phường/xã --').click();
    await this.page.waitForTimeout(this.config.operationDelay);
    
    // Select the first available option
    const firstOption = this.page.getByRole('option').first();
    await firstOption.click();
    
    await this.page.waitForTimeout(this.config.operationDelay);
    console.log('✅ Ward/commune selected');
  }

  /**
   * Click the convert button and wait for results
   */
  async clickConvert(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log('🔄 Clicking convert button...');
    
    await this.page.getByRole('button', { name: '🔄 Chuyển đổi địa chỉ' }).click();
    
    // Wait for the result section to appear
    await this.page.waitForSelector('text=🎯 Kết quả chuyển đổi', { 
      state: 'visible',
      timeout: this.config.timeout 
    });
    
    // Additional wait to ensure content is fully loaded
    await this.page.waitForTimeout(this.config.operationDelay);
    console.log('✅ Conversion completed');
  }

  /**
   * Extract the converted name from the result container
   */
  async extractResult(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    
    console.log('📝 Extracting conversion result...');
    
    // Wait for the result section to be visible
    await this.page.waitForSelector('text=🎯 Kết quả chuyển đổi', { timeout: this.config.timeout });
    
    // Method 1: Try to find the result using exact structure matching
    try {
      const result = await this.page.evaluate(() => {
        // Look for the "📍 Địa chỉ mới:" section structure
        const resultSections = Array.from(document.querySelectorAll('div'));
        
        for (const section of resultSections) {
          if (section.textContent && section.textContent.trim() === '📍 Địa chỉ mới:') {
            const parent = section.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children);
              for (const sibling of siblings) {
                const p = sibling.querySelector('p');
                if (p && p.textContent && !p.textContent.includes('📍') && !p.textContent.includes('Sao chép')) {
                  return p.textContent.trim();
                }
              }
            }
          }
        }
        return null;
      });
      
      if (result) {
        console.log(`✅ Extracted result using exact structure: ${result}`);
        return result.split(',')[0].trim(); // Return only ward/commune name
      }
    } catch (error) {
      console.log('⚠️ Exact structure method failed, trying fallback...');
    }
    
    // Method 2: Fallback to pattern matching in result container
    try {
      const result = await this.page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('div'));
        for (const container of containers) {
          if (container.textContent && container.textContent.includes('🎯 Kết quả chuyển đổi')) {
            const allP = Array.from(container.querySelectorAll('p'));
            for (const p of allP) {
              const text = p.textContent?.trim() || '';
              // Match Vietnamese address patterns - broader pattern
              if (text.match(/^(Phường|Xã|Thị trấn)\s+.+,\s*.+/)) {
                return text;
              }
            }
          }
        }
        return null;
      });
      
      if (result) {
        console.log(`✅ Extracted result using pattern match: ${result}`);
        return result.split(',')[0].trim(); // Return only ward/commune name
      }
    } catch (error) {
      console.log('⚠️ Pattern matching method failed, trying legacy method...');
    }
    
    // Method 3: Legacy approach for backwards compatibility
    const allParagraphs = this.page.locator('p');
    const count = await allParagraphs.count();
    
    for (let i = 0; i < count; i++) {
      const para = allParagraphs.nth(i);
      const text = await para.textContent();
      
      // Broader pattern matching - removed requirement for "Thành phố"
      if (text && 
          (text.includes('Phường') || text.includes('Xã') || text.includes('Thị trấn')) && 
          !text.includes('Phường/Xã:') &&
          !text.includes('📍') &&
          !text.includes('Sao chép') &&
          text.includes(',') &&
          text.trim().length > 10) {
        
        const fullResult = text.trim();
        const wardName = fullResult.split(',')[0].trim();
        
        console.log(`✅ Extracted result using legacy method: ${fullResult}`);
        console.log(`✅ Ward/commune name: ${wardName}`);
        return wardName;
      }
    }
    
    throw new Error('Failed to extract result text - no matching paragraph found');
  }

  /**
   * Refresh browser context to prevent memory leaks during long runs
   */
  async refreshBrowserContext(): Promise<void> {
    console.log('🔄 Refreshing browser context to prevent memory leaks...');
    
    // Close existing context and page
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    
    // Create new context with same settings
    this.context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    // Reapply resource blocking
    if (this.config.headless) {
      await this.context.route('**/*', (route, request) => {
        const resourceType = request.resourceType();
        if (['image', 'media'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.config.timeout);
    
    console.log('✅ Browser context refreshed');
  }

  /**
   * Process a single address conversion with enhanced retry logic
   */
  async convertSingleAddress(inputData: InputAddressData): Promise<OutputAddressData> {
    console.log(`\n🔍 Processing: ${inputData.city_name} - ${inputData.pref_name}`);
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.navigateToSite();
        await this.selectCity(inputData.city_name);
        const actualPrefName = await this.selectPrefecture(inputData.pref_name);
        await this.selectWard();
        await this.clickConvert();
        
        const newName = await this.extractResult();
        
        // Check if fallback was used
        const usedFallback = actualPrefName !== inputData.pref_name;
        
        const result: OutputAddressData = {
          city_name: inputData.city_name,
          pref_old_id: inputData.pref_old_id,
          pref_old_name: inputData.pref_name,
          pref_new_name: newName
        };
        
        // Add fallback field if fallback was used
        if (usedFallback) {
          result.pref_new_fallback = newName;
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${attempt}/${this.config.maxRetries} failed for ${inputData.pref_name}:`, error);
        
        if (attempt < this.config.maxRetries) {
          // Exponential backoff: 2s, 4s, 8s
          const backoffDelay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${backoffDelay/1000}s before retry...`);
          await this.page?.waitForTimeout(backoffDelay);
          
          // Refresh browser context every 2 failed attempts to clear any issues
          if (attempt % 2 === 0) {
            await this.refreshBrowserContext();
          }
        }
      }
    }
    
    throw lastError || new Error(`Failed to process ${inputData.pref_name} after ${this.config.maxRetries} attempts`);
  }

  /**
   * Clean up and close the browser
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up resources...');
    
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    
    console.log('✅ Cleanup completed');
  }
}
