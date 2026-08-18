/**
 * Helper xuất file DOCX Hướng dẫn kết nối API Trục liên thông cho Đơn vị ngoài
 */
export interface ExportDocxParams {
  unitCode: string;
  unitName: string;
  clientId: string;
  apiKey: string;
  tokenExpiryType: 'PERPETUAL' | '1_YEAR' | '2_YEARS' | 'CUSTOM';
  tokenExpiryDate?: string;
  baseUrl?: string;
}

export function exportUnitIntegrationDocx({
  unitCode,
  unitName,
  clientId,
  apiKey,
  tokenExpiryType,
  tokenExpiryDate,
  baseUrl = 'https://gateway.domain.vn/api',
}: ExportDocxParams) {
  const expiryDisplay =
    tokenExpiryType === 'PERPETUAL'
      ? 'Vĩnh viễn (Vô thời hạn)'
      : tokenExpiryType === '1_YEAR'
      ? '01 Năm (Cấp lại hàng năm)'
      : tokenExpiryType === '2_YEARS'
      ? '02 Năm'
      : `Có thời hạn đến ${tokenExpiryDate || 'N/A'}`;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Tai lieu Huong dan Ket noi API - ${unitName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #111; margin: 30px; }
        h1 { font-size: 17pt; font-weight: bold; text-align: center; color: #003366; text-transform: uppercase; margin-bottom: 5px; }
        h2 { font-size: 14pt; font-weight: bold; color: #004080; border-bottom: 2px solid #004080; padding-bottom: 4px; margin-top: 25px; }
        h3 { font-size: 13pt; font-weight: bold; color: #222; margin-top: 15px; }
        p, li { text-align: justify; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        table, th, td { border: 1px solid #777; }
        th { background-color: #f2f4f7; padding: 8px; text-align: left; font-weight: bold; }
        td { padding: 8px; vertical-align: top; }
        .code-box { background-color: #f8f9fa; border: 1px solid #dcdcdc; padding: 10px; font-family: 'Courier New', monospace; font-size: 10pt; white-space: pre-wrap; word-break: break-all; margin: 8px 0; }
        .badge { background-color: #e6f0ff; color: #004080; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace; }
        .footer { margin-top: 40px; font-style: italic; text-align: right; color: #555; }
      </style>
    </head>
    <body>
      <h1>TÀI LIỆU KẾT NỐI TÍCH HỢP TRỤC LIÊN THÔNG VĂN BẢN (DIP HUB)</h1>
      <p style="text-align: center; font-style: italic; font-size: 11pt;">Ban hành kèm theo Quyết định cấp tài liệu kết nối cho đơn vị thành viên</p>
      <hr/>

      <h2>I. THÔNG TIN KHỞI TẠO VÀ XÁC THỰC KẾT NỐI</h2>
      <p>Hệ thống Trục liên thông văn bản điện tử (DIP Hub) xin thông báo thông tin kết nối cấp riêng cho đơn vị như sau:</p>
      <table>
        <tr>
          <th width="30%">Tên Đơn vị</th>
          <td><strong>${unitName}</strong></td>
        </tr>
        <tr>
          <th>Mã Đơn vị (SENDER_CODE)</th>
          <td><span class="badge">${unitCode}</span></td>
        </tr>
        <tr>
          <th>Client ID</th>
          <td><span class="badge">${clientId}</span></td>
        </tr>
        <tr>
          <th>API Token / Secret Key</th>
          <td><span class="badge">${apiKey}</span></td>
        </tr>
        <tr>
          <th>Chế độ Token / Thời hạn</th>
          <td><strong>${expiryDisplay}</strong></td>
        </tr>
        <tr>
          <th>Base URL Môi trường Test</th>
          <td><code>${baseUrl.replace('/api', '')}/test-api</code></td>
        </tr>
        <tr>
          <th>Base URL Môi trường Production</th>
          <td><code>${baseUrl}</code></td>
        </tr>
        <tr>
          <th>Phương thức xác thực</th>
          <td>Mọi Request gửi lên Trục phải kèm Header: <code>Authorization: Bearer &lt;API_Token&gt;</code></td>
        </tr>
      </table>

      <h2>II. LUỒNG NGHIỆP VỤ VÀ QUY TRÌNH TÍCH HỢP KHÉP KÍN</h2>
      <p>Luồng trao đổi văn bản điện tử giữa đơn vị ngoài và Trục liên thông diễn ra qua 4 bước cơ bản:</p>

      <h3>Bước 1: Khởi tạo Văn bản & Upload Tệp (Create Bundle)</h3>
      <p>Đơn vị gọi API <code>POST /DOCUMENTS/CreateBundle</code> với định dạng <code>multipart/form-data</code> để tải các tệp PDF/Docx đính kèm và tạo thông tin văn bản gốc trên hệ thống.</p>
      <div class="code-box">POST ${baseUrl}/DOCUMENTS/CreateBundle
Headers:
  Authorization: Bearer ${apiKey}
  Content-Type: multipart/form-data

Form-Data Parameters:
  DOCUMENT_NO   : "123/UBND-VP"       (Bắt buộc: Số ký hiệu văn bản)
  DOCUMENT_TYPE : "CV"                (Bắt buộc: Mã loại văn bản: QĐ, TB, CV, BC)
  SUBJECT       : "V/v phối hợp..."   (Bắt buộc: Trích yếu nội dung)
  SENDER_CODE   : "${unitCode}"       (Bắt buộc: Mã đơn vị gửi)
  SENDER_NAME   : "${unitName}"       (Bắt buộc: Tên đơn vị gửi)
  STATUS        : "1"                 (Trạng thái khởi tạo)
  Files         : [binary_file_1.pdf, binary_file_2.docx] (Tệp đính kèm)</div>

      <p><strong>Response thành công (200 OK):</strong></p>
      <div class="code-box">{
  "StatusCode": 200,
  "Message": "Tạo văn bản thành công",
  "Data": {
    "ID": 1052,
    "DOCUMENT_NO": "123/UBND-VP",
    "MESSAGE_ID": "MSG-20260814-1052",
    "ATTACHMENTS": [
      {
        "FILE_NAME": "van_ban_chinh.pdf",
        "OBJECT_KEY": "2026/08/14/van_ban_chinh_uuid.pdf",
        "FILE_URL": "https://storage.domain.vn/files/van_ban_chinh.pdf"
      }
    ]
  }
}</div>

      <h3>Bước 2: Phát hành & Gửi văn bản liên thông (Send Document)</h3>
      <p>Sau khi đã khởi tạo văn bản thành công ở Bước 1, đơn vị phát lệnh gửi văn bản liên thông sang một hoặc nhiều đơn vị nhận bằng API <code>POST /IN_DIP_Hub/Send</code>.</p>
      <div class="code-box">POST ${baseUrl}/IN_DIP_Hub/Send
Headers:
  Authorization: Bearer ${apiKey}
  Content-Type: application/json

Request Body:
{
  "Header": {
    "Document_Id": "1052",
    "Document_No": "123/UBND-VP",
    "Document_Type": "CV",
    "Subject": "V/v phối hợp triển khai kết nối dữ liệu liên thông",
    "Sender_Code": "${unitCode}",
    "Receiver_Code": ["DV_SO_THONG_TIN", "DV_UBND_TINH"],
    "Priority": "URGENT",
    "Send_Time": "2026-08-14 11:30:00"
  },
  "Body": [
    {
      "File_Name": "van_ban_chinh.pdf",
      "Data_Type": "PDF",
      "Content_Type": "application/pdf",
      "File_URL": "https://storage.domain.vn/files/van_ban_chinh.pdf"
    }
  ]
}</div>

      <h3>Bước 3: Phản hồi Biên nhận Trạng thái (ACK / NACK)</h3>
      <p>Đơn vị nhận văn bản sẽ phản hồi biên nhận về Trục thông qua API <code>POST /IN_DIP_Hub/Ack</code> để cập nhật tiến độ cho đơn vị gửi.</p>
      <div class="code-box">POST ${baseUrl}/IN_DIP_Hub/Ack
Headers:
  Authorization: Bearer ${apiKey}
  Content-Type: application/json

Request Body:
{
  "Document_Id": "1052",
  "Receiver_Code": "DV_SO_THONG_TIN",
  "Status": "200",
  "Message": "Đã tiếp nhận vào sổ văn bản đến số 456/S-VB",
  "Ack_Time": "2026-08-14 11:45:00"
}</div>

      <p><strong>Danh mục mã trạng thái ACK (Status):</strong></p>
      <table>
        <tr>
          <th width="15%">Mã ACK</th>
          <th width="30%">Tên trạng thái</th>
          <th>Diễn giải chi tiết</th>
        </tr>
        <tr>
          <td><code>100</code></td>
          <td>Đã nhận thông điệp</td>
          <td>Trục DIP Hub đã nhận gói tin và đưa vào hàng đợi truyền nhận.</td>
        </tr>
        <tr>
          <td><code>200</code></td>
          <td>Đã tiếp nhận vào sổ</td>
          <td>Cơ quan nhận đã kiểm tra hợp lệ và vào sổ văn bản đến.</td>
        </tr>
        <tr>
          <td><code>300</code></td>
          <td>Đang xử lý</td>
          <td>Văn bản đang được phân công chuyên viên/lãnh đạo xử lý.</td>
        </tr>
        <tr>
          <td><code>400</code></td>
          <td>Hoàn thành xử lý</td>
          <td>Đã ban hành văn bản phúc đáp hoặc kết thúc xử lý.</td>
        </tr>
        <tr>
          <td><code>500</code></td>
          <td>Từ chối tiếp nhận</td>
          <td>Văn bản bị trả lại (thiếu file, sai định dạng, sai đơn vị nhận).</td>
        </tr>
      </table>

      <h3>Bước 4: Tra cứu Văn bản đến & Kiểm tra Tiến độ (Get Routes)</h3>
      <p>Đơn vị có thể chủ động kéo danh sách văn bản gửi đến cho đơn vị mình hoặc tra cứu lịch sử gửi bằng API <code>POST /DOCUMENT_ROUTE/GetList</code>.</p>
      <div class="code-box">POST ${baseUrl}/DOCUMENT_ROUTE/GetList
Headers:
  Authorization: Bearer ${apiKey}
  Content-Type: application/json

Request Body:
{
  "PageIndex": 1,
  "PageSize": 20,
  "SearchField": {
    "RECEIVER_CODE": "${unitCode}"
  }
}</div>

      <h2>III. HỖ TRỢ KỸ THUẬT VÀ SỰ CỐ</h2>
      <p>Nếu gặp vướng mắc trong quá trình tích hợp kết nối, bộ phận kỹ thuật đơn vị vui lòng liên hệ Trung tâm Quản trị Trục Liên thông DIP Hub để được hỗ trợ 24/7.</p>
      <div class="footer">
        <p>Hệ thống Trục Liên Thông Văn Bản (DIP Hub)<br/>Thời gian xuất tài liệu: ${new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    </body>
    </html>
  `;

  // Tạo blob docx/doc tương thích Microsoft Word
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Huong_Dan_Ket_Noi_API_${unitCode}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
