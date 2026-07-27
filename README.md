# Trục liên thông văn bản (TLTVB) — Frontend demo

Ứng dụng React/Vite trình diễn UI quản lý văn bản điện tử liên thông.

## Chạy dự án

```bash
npm install
npm run dev
```

Hoặc: `yarn install` rồi `yarn start`.

## Cấu trúc thư mục (phần đang dùng)

```
src/
  pages/
    admin/           # Người dùng, đơn vị, vai trò, danh mục
    documents/       # Danh sách văn bản (Document Management)
    exchange/        # Trao đổi / giao nhận văn bản
    integration/     # Kết nối liên thông
    reporting/       # Báo cáo thống kê
    _legacy/         # Page demo cũ, không còn route
  sections/
    interoperability/  # PageShell, DataTable, mockData TLTVB
    workflow/          # SignatureStudio (ký số trong form văn bản)
  routes/            # paths.ts + index.tsx (router chính)
  layouts/dashboard/nav/config.tsx  # Menu sidebar
docs/
  requirements/      # Tài liệu nghiệp vụ / chức năng TLTVB
  diagrams/          # Sơ đồ UI
demo_storage/        # File demo lưu local qua Vite middleware
```

## Menu ↔ màn hình chính

| Menu | Path |
|------|------|
| Tổng quan hệ thống | `/dashboard/operations/reporting/executive` |
| Kết nối liên thông | `/dashboard/integration-management` |
| Danh sách văn bản | `/dashboard/document-management` |
| Trao đổi văn bản | `/dashboard/operations/document-exchange` |
| Báo cáo văn bản / vận hành | `/dashboard/operations/reporting/...` |
| Quản trị nền tảng | `/dashboard/admin/...` |

## Bắt đầu sửa code

1. **Menu / quyền**: `src/layouts/dashboard/nav/config.tsx`, `src/auth/permissions.ts`
2. **Route**: `src/routes/paths.ts`, `src/routes/index.tsx`
3. **Data báo cáo**: `src/pages/reporting/reportingData.ts`
4. **Mock nghiệp vụ**: `src/sections/interoperability/mockData.ts`
5. **Ký số PDF**: `src/sections/workflow/components/SignatureStudio.tsx`

## Ghi chú

- Đây là demo UI; số liệu báo cáo là mock.
- Page trong `src/pages/_legacy` giữ để tham chiếu, không gắn menu.
