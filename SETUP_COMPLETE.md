# ✅ Project Setup Complete!

Bạn đã có một tool hoàn chỉnh để scrape dữ liệu chuyển đổi địa chỉ từ website https://address-converter.io.vn/

## 🎯 Tính năng chính

Tool sẽ đọc file `city_pref_names.json` và chuyển đổi tất cả các địa chỉ từ định dạng cũ sang định dạng mới:

**Input:** 
```json
{
  "city_name": "Hà Nội",
  "pref_old_id": 1,
  "pref_name": "Quận Ba Đình"
}
```

**Output:**
```json
{
  "pref_old_id": 1,
  "pref_old_name": "Quận Ba Đình",
  "pref_new_name": "Phường Ngọc Hà"
}
```

## 🚀 Cách sử dụng

### 1. Test với dữ liệu nhỏ (khuyên dùng trước)
```bash
npm run test-scraper    # Test với 1 record từ test_data.json
```

### 2. Chạy với toàn bộ dữ liệu
```bash
npm run dev             # Chạy với file city_pref_names.json đầy đủ
```

### 3. Chạy production (compile trước)
```bash
npm run build           # Compile TypeScript
npm start              # Chạy JavaScript đã compile
```

## ⚙️ Cấu hình

Trong file `src/index.ts`, bạn có thể điều chỉnh:

```typescript
this.scraper = new AddressConverterScraper({
  headless: false,        // true = chạy ẩn, false = hiện browser
  operationDelay: 3000,   // Thời gian chờ giữa các thao tác (ms)
  maxRetries: 3,          // Số lần retry khi lỗi
  timeout: 30000          // Timeout chờ element (ms)
});
```

## 📊 Kết quả

- File output: `converted_addresses.json`
- File backup: `converted_addresses.json.backup.[timestamp]`
- File progress: `progress.json` (lưu tiến độ mỗi 10 items)

## 🔧 Debug

Nếu có vấn đề, sử dụng:
```bash
npm run debug          # Chạy debug mode với screenshot và log chi tiết
```

## ⚠️ Lưu ý quan trọng

1. **Tốc độ**: Website có rate limiting, tool đã set delay 3s giữa các request
2. **Dữ liệu**: Một số địa chỉ có thể không chuyển đổi được (sẽ được đánh dấu ERROR)
3. **Backup**: Tool tự động tạo backup trước khi ghi đè file kết quả
4. **Progress**: Tool lưu progress mỗi 10 items, nếu bị gián đoạn có thể resume
5. **Browser**: Cần cài đặt browser dependencies (đã cài trong setup)

## 📚 Học thêm về Playwright

- **Playwright Docs**: https://playwright.dev/docs/intro
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Node.js File System**: https://nodejs.org/docs/latest/api/fs.html

## 🎉 Kết quả thử nghiệm

Tool đã test thành công:
- ✅ "Quận Ba Đình" → "Phường Ngọc Hà, Thành phố Hà Nội"
- ✅ Xử lý dialog notification tự động
- ✅ Error handling và retry logic
- ✅ Progress saving và backup
- ✅ Clean TypeScript code với full typing

**Chúc bạn scraping thành công! 🚀**

### 🔄 **Cập nhật mới nhất:**
- ✅ Chỉ trích xuất tên phường/xã/thị trấn, không bao gồm tên thành phố
- ✅ Hỗ trợ đầy đủ "Phường", "Xã", "Thị trấn" 
- ✅ Kết quả ngắn gọn và chính xác hơn

**Ví dụ cụ thể:**
- Input: "Quận Ba Đình" 
- Output: "Phường Ngọc Hà" (không phải "Phường Ngọc Hà, Thành phố Hà Nội")
