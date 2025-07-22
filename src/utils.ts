import * as fs from 'fs/promises';
import * as path from 'path';
import { InputAddressData, OutputAddressData } from './types';

/**
 * Utility functions for handling data input/output operations
 * 
 * Learn more about Node.js File System operations:
 * https://nodejs.org/docs/latest/api/fs.html
 */

/**
 * Read and parse the input JSON file containing address data
 */
export async function readInputData(filePath: string): Promise<InputAddressData[]> {
  try {
    console.log(`📖 Reading input data from: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: InputAddressData[] = JSON.parse(fileContent);
    
    console.log(`✅ Successfully loaded ${data.length} records`);
    return data;
    
  } catch (error) {
    console.error(`❌ Failed to read input data from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Write the converted address data to a JSON file
 */
export async function writeOutputData(
  data: OutputAddressData[], 
  filePath: string
): Promise<void> {
  try {
    console.log(`💾 Writing output data to: ${filePath}`);
    
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write the data as formatted JSON
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');
    
    console.log(`✅ Successfully saved ${data.length} converted records`);
    
  } catch (error) {
    console.error(`❌ Failed to write output data to ${filePath}:`, error);
    throw error;
  }
}

/**
 * Filter out entries that don't have required fields
 */
export function validateInputData(data: InputAddressData[]): InputAddressData[] {
  const validData = data.filter((item, index) => {
    // Check if all required fields are present
    if (!item.city_name || !item.pref_name || typeof item.pref_old_id !== 'number') {
      console.warn(`⚠️  Skipping invalid record at index ${index}:`, item);
      return false;
    }
    return true;
  });
  
  console.log(`✅ Validated ${validData.length} out of ${data.length} records`);
  return validData;
}

/**
 * Create a backup of existing output file if it exists
 */
export async function createBackup(filePath: string): Promise<void> {
  try {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
    console.log(`🔄 Created backup at: ${backupPath}`);
  } catch (error) {
    // File doesn't exist, no backup needed
    if ((error as any).code !== 'ENOENT') {
      console.warn('⚠️  Could not create backup:', error);
    }
  }
}
