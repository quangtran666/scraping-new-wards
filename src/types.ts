/**
 * Type definitions for the address converter scraper
 * 
 * Learn more about TypeScript interfaces:
 * https://www.typescriptlang.org/docs/handbook/2/objects.html
 */

/**
 * Input data structure from city_pref_names.json
 */
export interface InputAddressData {
  city_name: string;
  pref_old_id: number;
  pref_name: string;
}

/**
 * Output data structure after conversion
 */
export interface OutputAddressData {
  city_name: string;
  pref_old_id: number;
  pref_old_name: string;
  pref_new_name: string;
  pref_new_fallback?: string;
}

/**
 * Configuration options for the scraper
 */
export interface ScraperConfig {
  /** Base URL of the address converter website */
  baseUrl: string;
  /** Timeout for page loads and element waits (in milliseconds) */
  timeout: number;
  /** Delay between operations (in milliseconds) */
  operationDelay: number;
  /** Maximum number of retries for failed operations */
  maxRetries: number;
  /** Whether to run in headless mode */
  headless: boolean;
}

/**
 * Selector paths for the website elements
 * XPath selectors as specified in the requirements
 */
export interface ElementSelectors {
  cityDropdown: string;
  prefDropdown: string;
  wardDropdown: string;
  convertButton: string;
  resultContainer: string;
}
