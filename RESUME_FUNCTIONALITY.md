# Resume Functionality Documentation

## Overview

The scraper now supports resume functionality, allowing you to continue scraping from where you left off instead of starting from the beginning every time.

## Usage Options

### 1. Resume from Progress File (`--resume`)

Automatically continues from the last processed item in `progress.json`:

```bash
# Using ts-node (development)
npm run dev:resume
# OR
ts-node src/index.ts --resume

# Using compiled version (production)
node dist/index.js --resume
```

### 2. Start from Specific ID (`--start-from=ID`)

Start processing from a specific `pref_old_id`:

```bash
# Start from pref_old_id 340
ts-node src/index.ts --start-from=340

# Or you can use the npm script (need to complete the ID manually)
# npm run dev:start-from340  (need to edit package.json script first)
```

### 3. Combined with Other Modes

You can combine resume functionality with speed/debug modes:

```bash
# Resume in speed mode
ts-node src/index.ts --resume --speed

# Start from ID 340 in debug mode
ts-node src/index.ts --start-from=340 --debug
```

## How It Works

### Progress Tracking
- Every 10 items processed, the scraper saves progress to `progress.json`
- The progress file contains all successfully processed items with their results
- Each item includes `pref_old_id` which is used to determine the resume point

### Resume Logic
1. **`--resume` flag**: 
   - Reads `progress.json` to find the last processed `pref_old_id`
   - Starts from the next ID (`last_processed_id + 1`)
   - If no progress file exists, starts from the beginning

2. **`--start-from=ID` flag**:
   - Filters input data to only include items with `pref_old_id >= specified_ID`
   - Ignores any existing progress file

### File Structure
- `city_pref_names.json` - Input data (unchanged)
- `progress.json` - Intermediate progress (updated every 10 items)
- `converted_addresses.json` - Final results (created at completion)

## Examples

### Scenario 1: Interrupted Scraping
```bash
# Start scraping
ts-node src/index.ts

# Process stops at pref_old_id 150 due to network error
# progress.json shows last successful item was pref_old_id 149

# Resume from where it left off
ts-node src/index.ts --resume
# Will start from pref_old_id 150
```

### Scenario 2: Manual Starting Point
```bash
# You know you want to start from a specific prefecture
ts-node src/index.ts --start-from=500

# This will skip all items with pref_old_id < 500
```

### Scenario 3: Testing/Debugging Specific Range
```bash
# Test a small range in debug mode
ts-node src/index.ts --start-from=100 --debug

# Process might stop at pref_old_id 110, then continue
ts-node src/index.ts --resume --debug
```

## Benefits

1. **Time Saving**: No need to re-process already completed items
2. **Network Efficiency**: Reduces unnecessary requests to the target website
3. **Error Recovery**: Easy to recover from interruptions or failures
4. **Flexibility**: Can start from any specific point for testing or partial processing
5. **Progress Visibility**: Clear logging shows how many items are skipped vs processed

## Console Output

The enhanced scraper provides clear feedback:

```
🎯 Vietnamese Address Converter Scraper
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Running in BALANCED MODE

📋 Step 1: Reading input data...
📖 Reading input data from: ./city_pref_names.json
✅ Successfully loaded 2064 records
✅ Validated 2064 out of 2064 records

📖 Reading progress from: ./progress.json
✅ Last processed pref_old_id: 340 (340 total records)
🔄 Resuming from progress: starting from pref_old_id 341
📊 Filtered data: 1724 items remaining (skipped 340 items)
```

## Error Handling

- If `progress.json` is corrupted, the scraper will show an error and exit
- If `--start-from` ID is invalid (not a number), the scraper will show an error and exit  
- If the specified starting ID doesn't exist in the data, the scraper will simply process no items (safe behavior)

## Notes

- The `--resume` and `--start-from` flags are mutually exclusive in logic (if both provided, `--start-from` takes precedence)
- Progress is saved every 10 items to balance between progress safety and performance
- Memory optimization (browser context refresh) still occurs every 20 items as before
