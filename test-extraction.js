/**
 * Unit test for the extraction logic without actually scraping
 */

function extractWardNameFromFullAddress(fullAddress) {
  // Simulate the updated extraction logic from our scraper
  if (fullAddress && 
      (fullAddress.includes('Phường') || fullAddress.includes('Xã') || fullAddress.includes('Thị trấn')) && 
      fullAddress.includes('Thành phố') && 
      !fullAddress.includes('Phường/Xã:') &&
      fullAddress.includes(',')) {
    
    // Extract only the ward/commune name (before the comma)
    const wardName = fullAddress.split(',')[0].trim();
    return wardName;
  }
  throw new Error('Invalid address format');
}

// Test cases
const testCases = [
  {
    input: "Phường Ngọc Hà, Thành phố Hà Nội",
    expected: "Phường Ngọc Hà"
  },
  {
    input: "Phường Cống Vị, Thành phố Hà Nội", 
    expected: "Phường Cống Vị"
  },
  {
    input: "Xã Tân Minh, Thành phố Hà Nội",
    expected: "Xã Tân Minh"
  }
];

console.log('🧪 Testing ward name extraction logic');
console.log('━'.repeat(50));

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  try {
    const result = extractWardNameFromFullAddress(testCase.input);
    if (result === testCase.expected) {
      console.log(`✅ Test ${index + 1}: PASSED`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Output: "${result}"`);
      passedTests++;
    } else {
      console.log(`❌ Test ${index + 1}: FAILED`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Expected: "${testCase.expected}"`);
      console.log(`   Got: "${result}"`);
    }
  } catch (error) {
    console.log(`❌ Test ${index + 1}: ERROR`);
    console.log(`   Error: ${error}`);
  }
  console.log();
});

console.log(`📊 Summary: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! The extraction logic is working correctly.');
  
  // Show what the previous result would become
  console.log('\n🔄 Converting previous test result:');
  console.log('Before: "Phường Ngọc Hà, Thành phố Hà Nội"');
  console.log('After: "Phường Ngọc Hà"');
  
} else {
  console.log('❌ Some tests failed. Please check the logic.');
}
