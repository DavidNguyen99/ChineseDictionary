# 📖 Hướng Dẫn Thêm Từ Mới (Cơ Sở Dữ Liệu)

> **Lưu ý quan trọng**: Mọi dữ liệu bạn nhập vào Google Sheet sẽ được ứng dụng tự động cập nhật sau khoảng **5-10 phút**. Vui lòng không thay đổi cấu trúc các cột (Header) để tránh gây lỗi hệ thống.

---

## 🔗 Truy Cập Nhanh

| Tài nguyên | Liên kết | Ghi chú |
| :--- | :--- | :--- |
| **Cơ sở dữ liệu (Google Sheet)** | [Mở Google Sheet ↗](https://docs.google.com/spreadsheets/d/1qTwcWdQY2YxELXoKUE4jaj9bpImpnfKGE3gAEQIqR_g/edit?usp=sharing) | Nơi chỉnh sửa chính |
| **Kinh Thánh (Tiếng Trung)** | [Mở Recovery Version ↗](https://www.recoveryversion.com.tw/gb/bible_menu.php) | Nguồn tham khảo chuẩn |

---

## 🏗️ Cấu Trúc Dữ Liệu

Mỗi từ vựng được lưu trữ trên một hàng ngang. Dưới đây là giải thích chi tiết từng trường dữ liệu:

### 1. Thông Tin Cơ Bản (Bắt buộc)
Những trường này là tối thiểu để từ vựng có thể hiển thị.

| Tên Cột (Header) | Ý nghĩa | Ví dụ Nhập liệu |
| :--- | :--- | :--- |
| **English** | Từ vựng tiếng Anh | `Grace` |
| **Simplified** | Chữ Hán (Giản thể) | `恩典` |
| **Traditional** | Chữ Hán (Phồn thể) - *Tùy chọn* | `恩典` |
| **Vietnamese** | Nghĩa tiếng Việt | `Ân điển` |

### 2. Thông Tin Chi Tiết (Khuyên dùng)
Giúp từ điển trở nên phong phú và hữu ích hơn cho việc học tập.

| Tên Cột (Header) | Ý nghĩa | Ví dụ Nhập liệu |
| :--- | :--- | :--- |
| **Part_Of_Speech** | Loại từ (Danh từ, Động từ...) | `Noun` |
| **Pinyin** | Phiên âm (nên có dấu thanh điệu) | `ēn diǎn` |

### 3. Kinh Thánh Tham Khảo (Trilingual)
Mỗi từ nên đi kèm một câu Kinh Thánh minh họa ở cả 3 ngôn ngữ để đối chiếu sâu sắc.

| Tên Cột | Mô tả | Ví dụ Chuẩn |
| :--- | :--- | :--- |
| **Verse** | Địa chỉ câu (Viết tắt chuẩn) | `Gi. 1:16` |
| **Verse_EN** | Nội dung Tiếng Anh | `For of His fullness we have all received, and grace upon grace.` |
| **Verse_CN** | Nội dung Tiếng Trung | `从祂的丰满里我们都领受了，而且恩上加恩` |
| **Verse_VN** | Nội dung Tiếng Việt | `Bởi từ sự đầy đủ của Ngài mà tất cả chúng ta đều đã nhận lãnh, và ân điển gia trên ân điển.` |

---

## 📝 Quy Trình Thêm Từ Mới

Thực hiện theo 4 bước chuẩn để đảm bảo dữ liệu chính xác:

### Bước 1: Chuẩn bị dữ liệu
- Xác định từ cần thêm.
- Tìm câu Kinh Thánh chứa từ đó (ưu tiên bản Khôi Phục). Bạn có thể dùng [nguồn này](https://www.recoveryversion.com.tw/gb/bible_menu.php) để lấy bản tiếng Trung và tiếng Anh chuẩn.

### Bước 2: Nhập liệu vào Google Sheet
1. Mở [Google Sheet](https://docs.google.com/spreadsheets/d/1qTwcWdQY2YxELXoKUE4jaj9bpImpnfKGE3gAEQIqR_g/edit?usp=sharing).
2. Cuộn xuống dòng trống cuối cùng của bảng.
3. Điền thông tin vào các ô tương ứng.

> **💡 Mẹo:** Bạn có thể copy một hàng có sẵn ở trên và paste xuống dưới, sau đó sửa lại nội dung để giữ đúng định dạng.

### Bước 3: Kiểm tra lại (Review)
Trước khi đóng tab, hãy lướt qua một lượt:
- [ ] Chính tả tiếng Việt và tiếng Anh đã đúng chưa?
- [ ] Pinyin có hiển thị đúng dấu thanh điệu không? (Ví dụ: `wǒ` thay vì `wo3`)
- [ ] Các câu Kinh Thánh có khớp nhau về ý nghĩa không?

### Bước 4: Kiểm tra trên Ứng dụng
- Đợi khoảng **5-10 phút** để Google cập nhật dữ liệu.
- Mở ứng dụng từ điển và tìm kiếm từ vừa thêm.
- Nếu thấy hiển thị đẹp mắt → **Hoàn tất!** 🎉

---

## ❓ Câu Hỏi Thường Gặp

<details>
<summary><strong>Tôi lỡ xóa mất một cột tiêu đề thì sao?</strong></summary>
Hãy dùng chức năng "Undo" (Ctrl+Z) ngay lập tức. Nếu không được, hãy xem lại bảng trong tài liệu này để điền lại tên cột chính xác tuyệt đối (phân biệt hoa thường).
</details>

<details>
<summary><strong>Pinyin nên nhập số hay dấu thanh?</strong></summary>
Nên nhập <strong>dấu thanh</strong> (v.d. ā, á, ǎ, à) để hiển thị chuyên nghiệp nhất. Ứng dụng có hỗ trợ hiển thị cả hai nhưng dấu thanh sẽ dễ đọc hơn cho người học.
</details>
