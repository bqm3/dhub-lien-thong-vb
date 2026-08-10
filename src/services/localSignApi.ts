import axios from 'axios';
import axiosInstance from '../utils/axios';

export interface PdfAppearance {
  page: number;
  marginLeft: number;
  marginBottom: number;
  width: number;
  height: number;
  imagePath?: string;
  imageBase64?: string;
}

export interface LocalSignRequest {
  certFileName?: string;
  certPassword?: string;
  alias?: string;
  keyPassword?: string;
  inputPath: string;
  outputPath?: string;
  fileType?: string;
  reason?: string;
  location?: string;
  contactName?: string;
  pdfAppearance?: PdfAppearance;
}

export interface LocalSignResponse {
  success?: boolean;
  message?: string;
  outputPath?: string;
  [key: string]: any;
}

const LOCAL_SIGN_URL = 'http://localhost:7979/api/sign/local-cert';

export async function signLocalCert(req: LocalSignRequest): Promise<LocalSignResponse> {
  const payload = {
    certFileName: req.certFileName || 'CMC_IVAN.pfx',
    certPassword: req.certPassword || 'cmcsoft@2016##',
    alias: req.alias || '',
    keyPassword: req.keyPassword || 'cmcsoft@2016##',
    inputPath: req.inputPath,
    outputPath: req.outputPath || req.inputPath.replace(/\.pdf$/i, '_sign.pdf'),
    fileType: req.fileType || 'PDF',
    reason: req.reason || 'Ký văn bản',
    location: req.location || 'Hà Nội',
    contactName: req.contactName || 'Người Ký Local',
    pdfAppearance: req.pdfAppearance || {
      page: 1,
      marginLeft: 100,
      marginBottom: 100,
      width: 200,
      height: 60,
    },
  };

  const basicAuthToken = btoa('admin:admin123');

  const response = await axios.post(LOCAL_SIGN_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuthToken}`,
    },
    auth: {
      username: 'admin',
      password: 'admin123',
    },
    timeout: 15000,
  });

  return response.data;
}

export interface UpdateSignedFilePayload {
  Attachment_Code?: string;
  Input_Object_Key?: string;
  Signed_Object_Key?: string;
  Original_File_Name?: string;
  Sign_Status?: string;
  ERROR?:string
}

export async function updateSignedFileBackend(payload: UpdateSignedFilePayload) {
  try {
    const res = await axiosInstance.post('/DOCUMENTS/UpdateSignedFile', payload);
    return res.data;
  } catch (err) {
    console.error('Update signed file backend failed:', err);
    return null;
  }
}
