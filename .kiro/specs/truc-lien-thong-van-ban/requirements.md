# Requirements Document

> **Trục Liên Thông Văn Bản — Document Interoperability Platform**

## Introduction

Trục Liên Thông Văn Bản (TLTVB) là nền tảng trao đổi văn bản điện tử liên cơ quan nhà nước, cho phép các đơn vị hành chính (Bộ, Sở, UBND tỉnh/thành phố, cơ quan trực thuộc) gửi, nhận, theo dõi và lưu trữ văn bản điện tử một cách an toàn, có kiểm soát và có thể kiểm tra lại (audit).

Nền tảng gồm 4 module chính:
1. **Quản lý kết nối liên thông (Integration Management)** – quản lý các đơn vị tham gia và thông tin xác thực.
2. **Quản lý văn bản (Document Management)** – quản lý toàn bộ vòng đời văn bản điện tử.
3. **Trao đổi văn bản (Document Exchange)** – điều phối gửi, định tuyến, giao nhận và xác nhận văn bản.
4. **Báo cáo thống kê (Reporting)** – cung cấp số liệu tổng quan, báo cáo vận hành và khả năng xuất dữ liệu.

---

## Glossary

- **Trục_Liên_Thông (TLTVB)**: Hệ thống trung tâm điều phối trao đổi văn bản điện tử liên cơ quan.
- **Đơn_Vị**: Tổ chức hành chính nhà nước tham gia trục (ví dụ: UBND_HANOI, SO_NOI_VU, BO_TTTT).
- **Agency_Manager**: Module quản lý kết nối, đăng ký và xác thực đơn vị.
- **Document_Manager**: Module quản lý metadata, vòng đời, bảo mật và lưu trữ văn bản.
- **Exchange_Engine**: Module điều phối gửi, định tuyến, giao nhận và xử lý lỗi.
- **Report_Engine**: Module tổng hợp số liệu và xuất báo cáo.
- **Client_ID**: Mã định danh duy nhất được cấp cho mỗi Đơn_Vị khi đăng ký tham gia trục.
- **API_Key**: Khóa bí mật được cấp cho Đơn_Vị để xác thực các lời gọi API.
- **Credential**: Tổ hợp thông tin xác thực bao gồm Client_ID, API_Key và phương thức xác thực (OAUTH2_MTLS, API_KEY, BASIC).
- **Endpoint**: URL dịch vụ của Đơn_Vị dùng để nhận văn bản từ trục.
- **Văn_Bản**: Văn bản hành chính điện tử có mã số, siêu dữ liệu, file đính kèm và chữ ký số.
- **Document_Code**: Mã định danh duy nhất của một Văn_Bản trong hệ thống (ví dụ: VB-2026-000145).
- **Document_Type**: Loại văn bản hành chính: QUYET_DINH, CONG_VAN, BAO_CAO, THONG_BAO, KE_HOACH.
- **Classification**: Mức độ bảo mật của Văn_Bản: THUONG, NOI_BO, MAT, TOI_MAT.
- **Lifecycle_State**: Trạng thái vòng đời: DRAFT, REGISTERED, SIGNED, ISSUED, SUBMITTED, RECEIVED, PROCESSING, ARCHIVED, CANCELLED.
- **Transaction**: Một lần giao dịch trao đổi Văn_Bản từ Đơn_Vị gửi đến Đơn_Vị nhận qua trục.
- **Transaction_ID**: Mã định danh duy nhất của một Transaction.
- **ACK**: Xác nhận nhận thành công (Acknowledgement).
- **NACK**: Xác nhận nhận thất bại (Negative Acknowledgement).
- **Retry**: Cơ chế tự động thử lại gửi văn bản khi giao dịch thất bại.
- **Route**: Đường đi của Văn_Bản từ Đơn_Vị gửi qua Trục_Liên_Thông đến Đơn_Vị nhận.
- **Audit_Trail**: Nhật ký đầy đủ mọi thao tác trên Văn_Bản (ai làm, lúc nào, thay đổi gì).
- **Retention_Policy**: Chính sách lưu trữ xác định thời hạn và phương thức archive Văn_Bản.
- **SLA**: Service Level Agreement – tỷ lệ giao nhận thành công và thời gian xử lý cam kết.
- **Pretty_Printer**: Thành phần định dạng đối tượng dữ liệu thành chuỗi JSON/XML chuẩn để in và truyền tải.

---

## Requirements

### Requirement 1: Đăng ký Đơn Vị tham gia trục

**User Story:** Là quản trị viên trục, tôi muốn đăng ký các Đơn_Vị mới tham gia hệ thống, để các đơn vị đó có thể gửi và nhận văn bản qua trục liên thông.

#### Acceptance Criteria

1. WHEN quản trị viên gửi yêu cầu đăng ký Đơn_Vị với mã đơn vị, tên, danh mục, email liên hệ và endpoint, THE Agency_Manager SHALL tạo bản ghi Đơn_Vị với trạng thái PENDING.
2. WHEN yêu cầu đăng ký Đơn_Vị thiếu trường bắt buộc (mã đơn vị, tên, endpoint), THE Agency_Manager SHALL trả về lỗi mô tả rõ trường bị thiếu.
3. WHEN mã Đơn_Vị đã tồn tại trong hệ thống, THE Agency_Manager SHALL từ chối đăng ký và trả về lỗi DUPLICATE_AGENCY_CODE.
4. THE Agency_Manager SHALL đảm bảo mã Đơn_Vị là duy nhất trong toàn hệ thống tại mọi thời điểm.

---

### Requirement 2: Cấp và quản lý Credential

**User Story:** Là quản trị viên trục, tôi muốn cấp Client_ID, API_Key và cấu hình Credential cho Đơn_Vị, để Đơn_Vị đó có thể xác thực khi gọi API trục.

#### Acceptance Criteria

1. WHEN quản trị viên phê duyệt Đơn_Vị có trạng thái PENDING, THE Agency_Manager SHALL cấp một Client_ID duy nhất và một API_Key được sinh ngẫu nhiên an toàn cho Đơn_Vị đó.
2. THE Agency_Manager SHALL lưu trữ API_Key ở dạng băm (hash) và không bao giờ trả về giá trị gốc sau lần cấp đầu tiên.
3. WHEN Đơn_Vị yêu cầu làm mới API_Key, THE Agency_Manager SHALL vô hiệu hóa API_Key cũ và cấp API_Key mới trong cùng một thao tác nguyên tử.
4. WHEN quản trị viên cập nhật Endpoint của Đơn_Vị, THE Agency_Manager SHALL ghi nhận endpoint mới và áp dụng cho mọi giao dịch tiếp theo.
5. WHEN Đơn_Vị bị vô hiệu hóa, THE Agency_Manager SHALL từ chối mọi lời gọi API sử dụng Credential của Đơn_Vị đó và trả về lỗi AGENCY_DISABLED.
6. THE Agency_Manager SHALL hỗ trợ các phương thức xác thực: OAUTH2_MTLS, API_KEY và BASIC.

---

### Requirement 3: Quản lý Endpoint và kiểm tra kết nối

**User Story:** Là quản trị viên trục, tôi muốn quản lý và kiểm tra Endpoint của các Đơn_Vị, để đảm bảo trục có thể kết nối và giao nhận văn bản thành công.

#### Acceptance Criteria

1. THE Agency_Manager SHALL lưu trữ Endpoint của mỗi Đơn_Vị và cho phép cập nhật bởi quản trị viên.
2. WHEN quản trị viên yêu cầu kiểm tra kết nối đến Endpoint của một Đơn_Vị, THE Agency_Manager SHALL thực hiện health-check và trả về kết quả trong vòng 10 giây.
3. IF Endpoint của Đơn_Vị không phản hồi trong vòng 10 giây, THEN THE Agency_Manager SHALL đánh dấu trạng thái kết nối là WARNING và ghi nhật ký cảnh báo.
4. THE Agency_Manager SHALL duy trì lịch sử tối thiểu 30 lần kiểm tra kết nối gần nhất cho mỗi Đơn_Vị.

---

### Requirement 4: Đăng ký luồng văn bản (Document Registry)

**User Story:** Là quản trị viên trục, tôi muốn cấu hình Đơn_Vị A được phép gửi loại Văn_Bản nào đến Đơn_Vị B, để kiểm soát luồng trao đổi văn bản giữa các đơn vị.

#### Acceptance Criteria

1. WHEN quản trị viên đăng ký quy tắc luồng văn bản (sender, receiver, document_types), THE Agency_Manager SHALL lưu quy tắc và áp dụng cho mọi lần gửi tiếp theo.
2. WHEN Exchange_Engine nhận lệnh gửi văn bản, THE Exchange_Engine SHALL kiểm tra quy tắc luồng trước khi thực hiện giao dịch.
3. IF Đơn_Vị gửi không được phép gửi loại Văn_Bản đó đến Đơn_Vị nhận theo quy tắc luồng, THEN THE Exchange_Engine SHALL từ chối giao dịch và trả về lỗi ROUTING_POLICY_VIOLATION.

---

### Requirement 5: Quản lý Metadata Văn bản

**User Story:** Là cán bộ văn thư, tôi muốn tạo và quản lý metadata của Văn_Bản (đi, đến, nội bộ), để theo dõi và tra cứu văn bản trong suốt vòng đời.

#### Acceptance Criteria

1. WHEN cán bộ tạo mới Văn_Bản với đầy đủ thông tin bắt buộc (tiêu đề, loại, đơn vị gửi, đơn vị nhận, phân loại bảo mật), THE Document_Manager SHALL tạo bản ghi với Document_Code duy nhất và trạng thái DRAFT.
2. THE Document_Manager SHALL đảm bảo Document_Code là duy nhất trong toàn hệ thống tại mọi thời điểm.
3. WHEN cán bộ tạo Văn_Bản thiếu trường bắt buộc, THE Document_Manager SHALL trả về lỗi mô tả rõ từng trường bị thiếu.
4. WHEN cán bộ cập nhật metadata Văn_Bản ở trạng thái DRAFT hoặc REGISTERED, THE Document_Manager SHALL lưu thay đổi và ghi một bản ghi vào Audit_Trail.
5. THE Document_Manager SHALL hỗ trợ tìm kiếm Văn_Bản theo Document_Code, tiêu đề, Document_Type, đơn vị gửi, đơn vị nhận, Classification và khoảng thời gian tạo.
6. WHEN cán bộ xem chi tiết Văn_Bản, THE Document_Manager SHALL trả về đầy đủ metadata, danh sách file đính kèm, Lifecycle_State hiện tại và Audit_Trail.

---

### Requirement 6: Quản lý File đính kèm

**User Story:** Là cán bộ văn thư, tôi muốn đính kèm nhiều file vào một Văn_Bản, để đảm bảo đầy đủ hồ sơ khi trao đổi liên cơ quan.

#### Acceptance Criteria

1. THE Document_Manager SHALL cho phép một Văn_Bản có tối thiểu 1 và tối đa 20 file đính kèm.
2. WHEN cán bộ tải lên file đính kèm, THE Document_Manager SHALL lưu trữ file cùng metadata gồm tên file, loại MIME, kích thước (bytes) và checksum SHA-256.
3. IF kích thước file đính kèm vượt quá 50 MB, THEN THE Document_Manager SHALL từ chối tải lên và trả về lỗi ATTACHMENT_SIZE_EXCEEDED.
4. IF định dạng file không thuộc danh sách cho phép (PDF, DOCX, XLSX, JPG, PNG, ZIP), THEN THE Document_Manager SHALL từ chối và trả về lỗi ATTACHMENT_TYPE_NOT_ALLOWED.
5. WHEN cán bộ xóa file đính kèm khỏi Văn_Bản ở trạng thái DRAFT hoặc REGISTERED, THE Document_Manager SHALL xóa file và ghi nhận vào Audit_Trail.
6. WHEN Văn_Bản đã ở trạng thái SIGNED hoặc sau đó trong vòng đời, THE Document_Manager SHALL từ chối mọi thay đổi về file đính kèm và trả về lỗi DOCUMENT_IMMUTABLE.

---

### Requirement 7: Quản lý Phiên bản Văn bản

**User Story:** Là cán bộ văn thư, tôi muốn theo dõi lịch sử các phiên bản của Văn_Bản, để biết nội dung đã thay đổi như thế nào qua thời gian.

#### Acceptance Criteria

1. WHEN cán bộ lưu thay đổi metadata Văn_Bản ở trạng thái cho phép chỉnh sửa, THE Document_Manager SHALL tạo bản ghi phiên bản mới với số hiệu tăng dần và thời điểm tạo.
2. THE Document_Manager SHALL lưu trữ tối thiểu 10 phiên bản gần nhất của mỗi Văn_Bản.
3. WHEN cán bộ yêu cầu xem phiên bản cụ thể, THE Document_Manager SHALL trả về snapshot đầy đủ của metadata và danh sách file đính kèm tại thời điểm tạo phiên bản đó.
4. THE Document_Manager SHALL cho phép so sánh metadata giữa hai phiên bản bất kỳ của cùng một Văn_Bản.

---

### Requirement 8: Quản lý Vòng đời Văn bản

**User Story:** Là cán bộ văn thư và lãnh đạo, tôi muốn Văn_Bản tuân theo vòng đời định sẵn, để đảm bảo quy trình hành chính được kiểm soát chặt chẽ.

#### Acceptance Criteria

1. THE Document_Manager SHALL quản lý vòng đời Văn_Bản theo thứ tự trạng thái: DRAFT, REGISTERED, SIGNED, ISSUED, SUBMITTED, RECEIVED, PROCESSING, ARCHIVED, CANCELLED.
2. WHEN Văn_Bản chuyển sang trạng thái SIGNED, THE Document_Manager SHALL yêu cầu có ít nhất một chữ ký số hợp lệ được đính kèm.
3. WHEN Văn_Bản chuyển sang trạng thái ISSUED, THE Document_Manager SHALL gán số hiệu phát hành chính thức và ghi nhận thời điểm phát hành.
4. IF Văn_Bản ở trạng thái SIGNED hoặc sau đó trong vòng đời, THEN THE Document_Manager SHALL từ chối mọi thay đổi metadata và trả về lỗi DOCUMENT_IMMUTABLE.
5. WHEN Văn_Bản bị CANCELLED, THE Document_Manager SHALL yêu cầu lý do hủy và ghi nhận vào Audit_Trail.
6. THE Document_Manager SHALL ghi nhận mọi chuyển trạng thái vào Audit_Trail bao gồm: trạng thái cũ, trạng thái mới, người thực hiện và thời điểm.

---

### Requirement 9: Bảo mật và phân loại Văn bản

**User Story:** Là quản trị viên, tôi muốn phân loại mức độ bảo mật của Văn_Bản, để kiểm soát quyền truy cập phù hợp với quy định nhà nước.

#### Acceptance Criteria

1. THE Document_Manager SHALL phân loại Văn_Bản theo 4 mức Classification: THUONG, NOI_BO, MAT, TOI_MAT.
2. WHILE Văn_Bản có Classification là MAT hoặc TOI_MAT, THE Document_Manager SHALL yêu cầu quyền truy cập đặc biệt (MAT_ACCESS hoặc TOI_MAT_ACCESS) để xem nội dung.
3. IF người dùng không có quyền truy cập tương ứng với Classification của Văn_Bản, THEN THE Document_Manager SHALL từ chối trả về nội dung và trả về lỗi ACCESS_DENIED.
4. THE Document_Manager SHALL ghi nhận mọi lần truy cập Văn_Bản có Classification MAT hoặc TOI_MAT vào Audit_Trail.
5. WHEN Classification của Văn_Bản được thay đổi, THE Document_Manager SHALL ghi nhận giá trị cũ, giá trị mới, người thực hiện và thời điểm vào Audit_Trail.

---

### Requirement 10: Chính sách Lưu trữ và Archive

**User Story:** Là quản trị viên, tôi muốn cấu hình chính sách lưu trữ theo loại văn bản, để đảm bảo Văn_Bản được giữ lại đủ thời hạn quy định và tự động chuyển sang archive.

#### Acceptance Criteria

1. THE Document_Manager SHALL cho phép cấu hình Retention_Policy theo Document_Type với thời hạn lưu trữ tính bằng ngày.
2. WHEN Văn_Bản đến hạn theo Retention_Policy, THE Document_Manager SHALL tự động chuyển Lifecycle_State sang ARCHIVED và ghi nhật ký.
3. WHILE Văn_Bản ở trạng thái ARCHIVED, THE Document_Manager SHALL giữ nguyên nội dung và từ chối mọi thao tác chỉnh sửa.
4. THE Document_Manager SHALL cho phép quản trị viên tra cứu Văn_Bản đã ARCHIVED và xuất ra file theo định dạng PDF hoặc JSON.
5. WHEN quản trị viên yêu cầu xóa vĩnh viễn Văn_Bản đã quá thời hạn lưu trữ, THE Document_Manager SHALL yêu cầu xác nhận 2 bước trước khi thực hiện xóa.

---

### Requirement 11: Audit Trail Văn bản

**User Story:** Là kiểm toán viên, tôi muốn xem lịch sử đầy đủ mọi thao tác trên Văn_Bản, để phục vụ kiểm tra, thanh tra và truy vết sự cố.

#### Acceptance Criteria

1. THE Document_Manager SHALL ghi nhận vào Audit_Trail mọi sự kiện: tạo, xem, chỉnh sửa, chuyển trạng thái, thêm hoặc xóa file đính kèm, thay đổi Classification.
2. THE Document_Manager SHALL lưu trữ mỗi bản ghi Audit_Trail với các trường: Document_Code, loại sự kiện, người thực hiện, thời điểm theo chuẩn ISO 8601 có múi giờ, dữ liệu trước và sau thay đổi.
3. WHEN kiểm toán viên truy vấn Audit_Trail của một Văn_Bản, THE Document_Manager SHALL trả về toàn bộ lịch sử theo thứ tự thời gian tăng dần.
4. THE Document_Manager SHALL đảm bảo bản ghi Audit_Trail không thể bị chỉnh sửa hoặc xóa bởi bất kỳ người dùng nào.
5. THE Document_Manager SHALL lưu trữ Audit_Trail tối thiểu 5 năm kể từ ngày tạo bản ghi.

---

### Requirement 12: Tiếp nhận và Gửi Văn bản (Document Submission)

**User Story:** Là Đơn_Vị gửi, tôi muốn gửi Văn_Bản vào trục liên thông, để văn bản được chuyển đến đúng Đơn_Vị nhận một cách an toàn và có xác nhận.

#### Acceptance Criteria

1. WHEN Đơn_Vị gửi gọi API submit với Document_Code hợp lệ, danh sách Đơn_Vị nhận, chữ ký số và Credential hợp lệ, THE Exchange_Engine SHALL tạo Transaction với Transaction_ID duy nhất và Lifecycle_State PENDING.
2. WHEN Exchange_Engine tiếp nhận lệnh gửi, THE Exchange_Engine SHALL kiểm tra quy tắc luồng (Document Registry) trước khi tạo giao dịch.
3. IF chữ ký số đính kèm không hợp lệ hoặc đã hết hạn, THEN THE Exchange_Engine SHALL từ chối giao dịch và trả về lỗi INVALID_SIGNATURE.
4. IF Đơn_Vị gửi không có Credential hợp lệ, THEN THE Exchange_Engine SHALL từ chối và trả về lỗi AUTH_FAILED.
5. THE Exchange_Engine SHALL đảm bảo Transaction_ID là duy nhất trong toàn hệ thống.
6. WHEN Transaction được tạo, THE Exchange_Engine SHALL trả về Transaction_ID ngay lập tức để Đơn_Vị gửi theo dõi tiến trình.

---

### Requirement 13: Định tuyến và Giao nhận Văn bản

**User Story:** Là vận hành hệ thống, tôi muốn trục tự động định tuyến và giao Văn_Bản đến Đơn_Vị nhận theo cấu hình, để đảm bảo văn bản đến đúng nơi và đúng thời gian.

#### Acceptance Criteria

1. WHEN Exchange_Engine xử lý Transaction, THE Exchange_Engine SHALL xác định Route từ Đơn_Vị gửi đến từng Đơn_Vị nhận dựa trên cấu hình Routing Management.
2. THE Exchange_Engine SHALL gửi Văn_Bản đến Endpoint của Đơn_Vị nhận qua giao thức HTTPS với xác thực Credential.
3. WHEN Đơn_Vị nhận xác nhận tiếp nhận thành công, THE Exchange_Engine SHALL cập nhật trạng thái Transaction thành RECEIVED và ghi nhận thời điểm giao nhận.
4. THE Exchange_Engine SHALL ghi lại Route đầy đủ bao gồm danh sách các node trung gian vào bản ghi Transaction.
5. WHEN Văn_Bản được giao đến nhiều Đơn_Vị nhận, THE Exchange_Engine SHALL xử lý từng giao nhận độc lập và theo dõi trạng thái riêng cho từng Đơn_Vị.

---

### Requirement 14: Quản lý xác nhận ACK/NACK

**User Story:** Là Đơn_Vị gửi, tôi muốn nhận xác nhận ACK hoặc NACK từ Đơn_Vị nhận, để biết Văn_Bản đã được tiếp nhận hay chưa.

#### Acceptance Criteria

1. WHEN Đơn_Vị nhận gọi API ack với Transaction_ID và kết quả ACK, THE Exchange_Engine SHALL cập nhật trạng thái ack của Transaction thành ACK và ghi nhận thời điểm xác nhận.
2. WHEN Đơn_Vị nhận gọi API ack với Transaction_ID và kết quả NACK kèm mã lỗi, THE Exchange_Engine SHALL cập nhật trạng thái ack thành NACK và kích hoạt cơ chế Retry.
3. WHILE trạng thái ack của Transaction là WAITING và chưa quá thời hạn timeout 300 giây, THE Exchange_Engine SHALL duy trì trạng thái WAITING và ghi nhận thời gian chờ.
4. IF Transaction không nhận được ACK hoặc NACK trong vòng 300 giây kể từ lúc gửi, THEN THE Exchange_Engine SHALL tự động chuyển sang cơ chế Retry.
5. THE Exchange_Engine SHALL cho phép Đơn_Vị gửi tra cứu trạng thái ack của Transaction theo Transaction_ID.

---

### Requirement 15: Retry và Xử lý lỗi tự động

**User Story:** Là vận hành hệ thống, tôi muốn Exchange_Engine tự động thử lại khi giao dịch thất bại, để giảm thiểu can thiệp thủ công và đảm bảo văn bản được giao đến đích.

#### Acceptance Criteria

1. IF giao dịch gửi văn bản thất bại do lỗi kết nối hoặc timeout, THEN THE Exchange_Engine SHALL tự động thử lại tối đa 4 lần với khoảng cách tăng lũy tiến: 30 giây, 60 giây, 120 giây, 240 giây.
2. WHEN Exchange_Engine thực hiện thử lại, THE Exchange_Engine SHALL ghi nhận số lần thử hiện tại, thời điểm thử và lỗi xảy ra vào bản ghi Transaction.
3. IF giao dịch vẫn thất bại sau 4 lần thử lại, THEN THE Exchange_Engine SHALL cập nhật trạng thái Transaction thành FAILED và gửi cảnh báo đến quản trị viên.
4. THE Exchange_Engine SHALL phân biệt lỗi có thể retry (API_TIMEOUT, lỗi kết nối mạng) và lỗi không retry (SIGNATURE_ERROR, AUTH_FAILED, ROUTING_ERROR).
5. IF lỗi thuộc loại không retry (SIGNATURE_ERROR, AUTH_FAILED, ROUTING_ERROR), THEN THE Exchange_Engine SHALL cập nhật trạng thái Transaction thành FAILED ngay lập tức mà không thực hiện retry.
6. THE Exchange_Engine SHALL ghi nhận phân loại lỗi (API_TIMEOUT, SIGNATURE_ERROR, ROUTING_ERROR, STORAGE_ERROR, AUTH_FAILED) vào bản ghi Transaction.

---

### Requirement 16: Theo dõi trạng thái giao dịch

**User Story:** Là cán bộ vận hành, tôi muốn theo dõi trạng thái của mọi giao dịch theo thời gian thực, để phát hiện và xử lý sự cố kịp thời.

#### Acceptance Criteria

1. THE Exchange_Engine SHALL duy trì trạng thái giao dịch qua các giá trị: PENDING, SENT, RECEIVED, RETRYING, FAILED.
2. WHEN trạng thái Transaction thay đổi, THE Exchange_Engine SHALL ghi nhận trạng thái mới, thời điểm thay đổi và nguyên nhân vào lịch sử giao dịch.
3. WHEN cán bộ truy vấn trạng thái theo Transaction_ID, THE Exchange_Engine SHALL trả về trạng thái hiện tại, Route, thông tin ack và lịch sử thay đổi trạng thái.
4. THE Exchange_Engine SHALL cho phép lọc giao dịch theo trạng thái, Đơn_Vị gửi, Đơn_Vị nhận và khoảng thời gian.
5. WHEN Transaction ở trạng thái RETRYING, THE Exchange_Engine SHALL hiển thị số lần thử hiện tại và thời điểm dự kiến thử tiếp theo.

---

### Requirement 17: Chính sách trao đổi và kiểm soát

**User Story:** Là quản trị viên, tôi muốn cấu hình chính sách trao đổi văn bản giữa các đơn vị, để đảm bảo giao dịch tuân thủ quy định và kiểm soát tải hệ thống.

#### Acceptance Criteria

1. THE Exchange_Engine SHALL cho phép cấu hình Exchange_Policy bao gồm: giới hạn số lượng văn bản gửi mỗi giờ theo Đơn_Vị, kích thước tối đa một lần gửi và các Document_Type được phép trao đổi.
2. WHILE Đơn_Vị vượt quá giới hạn số lượng gửi mỗi giờ, THE Exchange_Engine SHALL từ chối giao dịch mới và trả về lỗi RATE_LIMIT_EXCEEDED kèm thời gian chờ tiếp theo.
3. THE Exchange_Engine SHALL ghi nhận mọi vi phạm Exchange_Policy vào nhật ký Exchange Audit bao gồm: Đơn_Vị vi phạm, loại vi phạm và thời điểm.
4. WHEN quản trị viên cập nhật Exchange_Policy, THE Exchange_Engine SHALL áp dụng chính sách mới cho mọi giao dịch tiếp theo trong vòng 60 giây.

---

### Requirement 18: Báo cáo Tổng quan hệ thống

**User Story:** Là lãnh đạo và quản trị viên, tôi muốn xem tổng quan trạng thái hệ thống, để nắm được hiệu suất vận hành và đưa ra quyết định kịp thời.

#### Acceptance Criteria

1. THE Report_Engine SHALL cung cấp báo cáo tổng quan gồm: tổng số Văn_Bản, tổng số Transaction, tổng số file đính kèm, số Đơn_Vị tham gia, tỷ lệ giao nhận thành công (%) và tỷ lệ lỗi (%).
2. WHEN người dùng truy cập báo cáo tổng quan, THE Report_Engine SHALL trả về dữ liệu cập nhật không quá 5 phút so với thời điểm truy cập.
3. THE Report_Engine SHALL tính tỷ lệ thành công là số Transaction có trạng thái RECEIVED hoặc SENT chia tổng số Transaction nhân 100, làm tròn đến 1 chữ số thập phân.
4. THE Report_Engine SHALL tính tỷ lệ lỗi là số Transaction có trạng thái FAILED chia tổng số Transaction nhân 100, làm tròn đến 1 chữ số thập phân.

---

### Requirement 19: Báo cáo Văn bản và Giao nhận

**User Story:** Là cán bộ vận hành, tôi muốn xem thống kê văn bản gửi đi và nhận vào theo ngày và đơn vị, để theo dõi lưu lượng và phát hiện bất thường.

#### Acceptance Criteria

1. THE Report_Engine SHALL cung cấp báo cáo thống kê Văn_Bản gửi đi theo ngày và Đơn_Vị gửi trong khoảng thời gian do người dùng chỉ định.
2. THE Report_Engine SHALL cung cấp báo cáo thống kê Văn_Bản nhận vào theo Đơn_Vị nhận trong khoảng thời gian do người dùng chỉ định.
3. THE Report_Engine SHALL cung cấp báo cáo theo Document_Type gồm: QUYET_DINH, CONG_VAN, BAO_CAO, THONG_BAO, KE_HOACH với số lượng và tỷ trọng phần trăm.
4. THE Report_Engine SHALL cung cấp Delivery Report thống kê số Transaction theo trạng thái: SENT, RECEIVED, RETRYING, FAILED.
5. WHEN người dùng lọc báo cáo theo khoảng thời gian, THE Report_Engine SHALL trả về dữ liệu chính xác trong khoảng từ ngày bắt đầu đến ngày kết thúc theo múi giờ UTC+7.

---

### Requirement 20: Báo cáo Lỗi và Retry

**User Story:** Là cán bộ vận hành, tôi muốn xem chi tiết lỗi và thống kê retry, để phân tích nguyên nhân và cải thiện độ tin cậy hệ thống.

#### Acceptance Criteria

1. THE Report_Engine SHALL cung cấp Error Report thống kê số lượng lỗi theo phân loại: API_TIMEOUT, SIGNATURE_ERROR, ROUTING_ERROR, STORAGE_ERROR, AUTH_FAILED.
2. THE Report_Engine SHALL cung cấp Retry Report thống kê số Transaction theo số lần retry: lần 1, lần 2, lần 3, lần 4 trở lên.
3. WHEN cán bộ xem chi tiết lỗi của một Transaction, THE Report_Engine SHALL hiển thị phân loại lỗi, thông điệp lỗi, thời điểm xảy ra và số lần retry đã thực hiện.

---

### Requirement 21: Báo cáo theo Đơn vị và SLA

**User Story:** Là lãnh đạo, tôi muốn xem báo cáo hiệu suất theo từng đơn vị và so sánh với SLA cam kết, để đánh giá mức độ tuân thủ của các đơn vị tham gia.

#### Acceptance Criteria

1. THE Report_Engine SHALL cung cấp Agency Report liệt kê Top 5 Đơn_Vị gửi nhiều Văn_Bản nhất và Top 5 Đơn_Vị nhận nhiều Văn_Bản nhất trong khoảng thời gian chỉ định.
2. THE Report_Engine SHALL cung cấp Agency SLA Report cho từng Đơn_Vị gồm: tỷ lệ nhận thành công (%) và thời gian giao nhận trung bình tính bằng giây.
3. THE Report_Engine SHALL cung cấp Daily Operation Report tổng hợp số liệu vận hành trong ngày: tổng gửi, tổng nhận, tỷ lệ thành công, số lỗi và SLA đạt được.

---

### Requirement 22: Xuất báo cáo (Export Report)

**User Story:** Là cán bộ vận hành và lãnh đạo, tôi muốn xuất báo cáo ra các định dạng khác nhau, để chia sẻ và tích hợp với hệ thống phân tích bên ngoài.

#### Acceptance Criteria

1. THE Report_Engine SHALL cho phép xuất mọi loại báo cáo ra định dạng Excel (XLSX) và PDF.
2. THE Report_Engine SHALL cung cấp API export trả về dữ liệu báo cáo ở định dạng JSON để tích hợp với hệ thống BI bên ngoài.
3. WHEN người dùng yêu cầu xuất báo cáo, THE Report_Engine SHALL tạo file và trả về trong vòng 30 giây với dữ liệu đầy đủ theo bộ lọc đã chọn.
4. IF dữ liệu báo cáo vượt quá 100.000 bản ghi, THEN THE Report_Engine SHALL phân trang kết quả và thông báo cho người dùng số trang và cách tải từng trang.

---

### Requirement 23: Tính nhất quán dữ liệu qua serialize/deserialize (Round-trip)

**User Story:** Là nhà phát triển tích hợp, tôi muốn dữ liệu văn bản và giao dịch được serialize/deserialize nhất quán, để đảm bảo không mất mát thông tin khi truyền qua API.

#### Acceptance Criteria

1. THE Trục_Liên_Thông SHALL serialize metadata Văn_Bản thành JSON theo schema chuẩn định nghĩa trong tài liệu API.
2. THE Pretty_Printer SHALL định dạng đối tượng Văn_Bản thành chuỗi JSON có thể đọc được (pretty-printed) với thụt lề 2 khoảng trắng.
3. FOR ALL đối tượng Văn_Bản hợp lệ, thực hiện serialize rồi deserialize rồi serialize lại SHALL tạo ra chuỗi JSON giống hệt chuỗi ban đầu (round-trip property).
4. FOR ALL đối tượng Transaction hợp lệ, thực hiện serialize rồi deserialize rồi serialize lại SHALL tạo ra chuỗi JSON giống hệt chuỗi ban đầu (round-trip property).
5. WHEN Trục_Liên_Thông nhận dữ liệu JSON không đúng schema, THE Trục_Liên_Thông SHALL trả về lỗi mô tả rõ trường sai và kiểu dữ liệu mong đợi.

---
