# Vietnamese Address Converter Scraper

A TypeScript-based web scraper using Playwright to automate the conversion of Vietnamese administrative division names from old to new format using [address-converter.io.vn](https://address-converter.io.vn/).

## 🎯 Purpose

This tool processes a JSON file containing old Vietnamese city and prefecture/district names and converts them to the new administrative division format by automating interactions with the address converter website.

## 🛠️ Technology Stack

- **TypeScript** - Type-safe JavaScript for better code quality
- **Playwright** - Modern web automation library for browser control
- **Node.js** - JavaScript runtime environment

## 📚 Learning Resources

- [Playwright Documentation](https://playwright.dev/docs/intro) - Learn web automation basics
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Master TypeScript fundamentals
- [Node.js File System](https://nodejs.org/docs/latest/api/fs.html) - File operations in Node.js

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run install-playwright
   ```

3. **Ensure your input data file exists:**
   Make sure `city_pref_names.json` is in the root directory with the required format:
   ```json
   [
     {
       "city_name": "Hà Nội",
       "pref_old_id": 1,
       "pref_name": "Quận Ba Đình"
     }
   ]
   ```

### Running the Scraper

#### Performance Modes

**🏃‍♂️ Speed Mode** (Recommended for production):
```bash
npm run dev -- --speed
```
- Headless browser with performance optimizations
- Faster delays (1.5s operations, 0.8s between items)
- Resource blocking for speed
- ~20 seconds per item average

**⚖️ Balanced Mode** (Default):
```bash
npm run dev
```
- Headless browser with standard performance
- Balanced delays (1.5s operations, 1s between items) 
- Good for most use cases
- ~25 seconds per item average

**🐛 Debug Mode** (For troubleshooting):
```bash
npm run dev -- --debug
```
- Visible browser window for observation
- Slower execution (3s operations, 2s between items)
- Great for understanding website behavior
- ~35 seconds per item average

#### Other Commands

**Test with sample data:**
```bash
npm run test-scraper    # Test with 3 sample records
```

**Production mode (compile first):**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
playwright/
├── src/
│   ├── index.ts          # Main application entry point
│   ├── scraper.ts        # Core scraping logic
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # File I/O and utility functions
├── dist/                 # Compiled JavaScript output
├── city_pref_names.json  # Input data file
├── converted_addresses.json # Output results
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Configuration

The scraper can be configured in `src/index.ts`:

```typescript
this.scraper = new AddressConverterScraper({
  headless: false,        // Set to true for production
  operationDelay: 3000,   // Delay between operations (ms)
  maxRetries: 3,          # Number of retry attempts
  timeout: 30000          # Element wait timeout (ms)
});
```

## 📊 Input/Output Format

### Input Format (`city_pref_names.json`)
```json
[
  {
    "city_name": "Hà Nội",
    "pref_old_id": 1,
    "pref_name": "Quận Ba Đình"
  }
]
```

### Output Format (`converted_addresses.json`)
```json
[
  {
    "pref_old_id": 1,
    "pref_old_name": "Quận Ba Đình",
    "pref_new_name": "Phường Phúc Xá"
  }
]
```

## 🔄 How It Works

1. **Data Loading**: Reads and validates the input JSON file
2. **Browser Automation**: For each address entry:
   - Opens the address converter website
   - Selects the city from the first dropdown
   - Selects the prefecture from the second dropdown  
   - Selects any option from the third dropdown
   - Clicks the convert button
   - Extracts the conversion result
3. **Data Saving**: Saves all results to the output JSON file

## 🛡️ Error Handling

- **Validation**: Skips invalid input records
- **Retries**: Automatically retries failed operations
- **Partial Results**: Saves progress periodically and on failures
- **Backups**: Creates backups of existing output files

## 🐛 Troubleshooting

### Common Issues

1. **Browser not found error:**
   ```bash
   npm run install-playwright
   ```

2. **Timeout errors:**
   - Increase the `timeout` value in configuration
   - Check your internet connection
   - Verify the website is accessible

3. **Element not found:**
   - The website structure may have changed
   - Update the XPath selectors in `src/scraper.ts`

4. **Rate limiting:**
   - Increase `operationDelay` in configuration
   - The scraper already includes delays between requests

## 🎨 Customization

### Modifying Selectors

If the website structure changes, update the XPath selectors in `src/scraper.ts`:

```typescript
this.selectors = {
  cityDropdown: '/html/body/div[4]/div/main/div/div[2]/section/div/div[2]/div[1]/button',
  prefDropdown: '/html/body/div[4]/div/main/div/div[2]/section/div/div[2]/div[2]/button',
  // ... other selectors
};
```

### Adding Progress Tracking

The scraper automatically saves progress every 10 items and creates backups before overwriting results.

## 📈 Performance Tips

### Speed Optimization
- **Use Speed Mode**: `npm run dev -- --speed` for fastest execution
- **Headless Browser**: Always run headless in production (`headless: true`)
- **Resource Blocking**: Speed mode blocks unnecessary images and media
- **Optimal Delays**: Balanced between speed and reliability

### Performance Comparison
| Mode | Headless | Avg Time/Item | Best For |
|------|----------|---------------|----------|
| Speed | Yes | ~20s | Large production datasets |
| Balanced | Yes | ~25s | Regular usage |
| Debug | No | ~35s | Development/troubleshooting |

### Additional Tips
- Process data in batches for very large datasets
- Monitor memory usage for extended runs
- Adjust delays based on your internet connection
- Keep browser resource usage minimal

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add JSDoc comments for new functions
3. Include error handling for all operations
4. Test changes with a small dataset first

## ⚠️ Important Notes

- Always respect the website's terms of service
- Be mindful of rate limiting and server load
- Test thoroughly with a small dataset before full runs
- Keep backups of your data
- The website structure may change over time

## 📄 License

MIT License - feel free to modify and distribute as needed.
