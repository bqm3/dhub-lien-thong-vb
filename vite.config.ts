import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';

function sanitizeFileName(name: string) {
  // Prevent path traversal + invalid filename characters on Windows.
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\.+$/g, '') // trim trailing dots/spaces
    .trim();
}

const DEMO_STORAGE_DIR = path.resolve(process.cwd(), 'demo_storage');
const DEMO_DOCUMENTS_DIR = path.join(DEMO_STORAGE_DIR, 'documents');
const DEMO_TMP_DIR = path.join(DEMO_STORAGE_DIR, 'tmp');

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.doc') return 'application/msword';
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
}

const demoDocumentsSavePlugin = {
  name: 'demo-documents-save',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (!req?.url) return next();

      const urlPath = String(req.url).split('?')[0];
      if (urlPath === '/api/demo-documents' && req.method === 'GET') {
        try {
          if (!fs.existsSync(DEMO_DOCUMENTS_DIR)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, documents: [] }));
            return;
          }

          const folders = fs
            .readdirSync(DEMO_DOCUMENTS_DIR, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);

          const docs = folders
            .map((folderName) => {
              const folderPath = path.join(DEMO_DOCUMENTS_DIR, folderName);
              const jsonPath = path.join(folderPath, 'document.json');
              if (!fs.existsSync(jsonPath)) return null;

              const raw = fs.readFileSync(jsonPath, 'utf-8');
              const parsed = JSON.parse(raw);

              const attachmentsFolder = path.join(folderPath, 'attachments');
              const attachmentNames = fs.existsSync(attachmentsFolder)
                ? fs
                    .readdirSync(attachmentsFolder, { withFileTypes: true })
                    .filter((entry) => entry.isFile())
                    .map((entry) => entry.name)
                : [];

              return {
                ...parsed,
                attachments: attachmentNames.length > 0 ? attachmentNames : Array.isArray(parsed.attachments) ? parsed.attachments : [],
              };
            })
            .filter(Boolean);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, documents: docs }));
          return;
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: e?.message ?? 'Cannot read demo documents' }));
          return;
        }
      }

      if (urlPath === '/api/demo-documents/file' && req.method === 'GET') {
        try {
          const requestUrl = new URL(req.url, 'http://localhost');
          const code = sanitizeFileName(requestUrl.searchParams.get('code') ?? '');
          const fileName = sanitizeFileName(requestUrl.searchParams.get('fileName') ?? '');

          if (!code || !fileName) {
            res.statusCode = 400;
            res.end('Missing code or fileName');
            return;
          }

          const filePath = path.join(DEMO_DOCUMENTS_DIR, code, 'attachments', fileName);
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', getContentType(fileName));
          res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
          fs.createReadStream(filePath).pipe(res);
          return;
        } catch (e: any) {
          res.statusCode = 500;
          res.end(e?.message ?? 'Cannot read file');
          return;
        }
      }

      if (urlPath !== '/api/demo-documents/save') return next();

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      let raw = '';
      let size = 0;
      const MAX_BYTES = 25 * 1024 * 1024; // 25MB demo limit

      req.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) {
          res.statusCode = 413;
          res.end('Payload too large');
          req.destroy();
          return;
        }
        raw += chunk.toString('utf-8');
      });

      req.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          const document = parsed?.document;
          const attachments = Array.isArray(parsed?.attachments) ? parsed.attachments : [];

          if (!document?.code) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: 'Missing document.code' }));
            return;
          }

          const code = String(document.code);
          const safeCode = sanitizeFileName(code) || `doc_${Date.now()}`;

          fs.mkdirSync(DEMO_STORAGE_DIR, { recursive: true });
          fs.mkdirSync(DEMO_TMP_DIR, { recursive: true });
          fs.mkdirSync(DEMO_DOCUMENTS_DIR, { recursive: true });

          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const tmpJsonPath = path.join(DEMO_TMP_DIR, `${safeCode}-${timestamp}.json`);
          fs.writeFileSync(tmpJsonPath, JSON.stringify(document, null, 2), 'utf-8');

          const docFolder = path.join(DEMO_DOCUMENTS_DIR, safeCode);
          const docJsonPath = path.join(docFolder, 'document.json');
          const attachmentsFolder = path.join(docFolder, 'attachments');

          fs.mkdirSync(docFolder, { recursive: true });
          fs.mkdirSync(attachmentsFolder, { recursive: true });

          fs.writeFileSync(docJsonPath, JSON.stringify(document, null, 2), 'utf-8');

          for (const att of attachments) {
            const fileName = typeof att?.fileName === 'string' ? att.fileName : '';
            const base64 = typeof att?.base64 === 'string' ? att.base64 : '';
            if (!fileName || !base64) continue;

            const safeName = sanitizeFileName(fileName);
            const outPath = path.join(attachmentsFolder, safeName);
            const buffer = Buffer.from(base64, 'base64');
            fs.writeFileSync(outPath, buffer);
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              ok: true,
              savedTo: path.join('demo_storage', 'documents', safeCode),
              tmpJson: path.join('demo_storage', 'tmp', path.basename(tmpJsonPath)),
            })
          );
        } catch (e: any) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: e?.message ?? 'Invalid payload' }));
        }
      });
    });
  },
};

export default defineConfig({
  plugins: [react(), demoDocumentsSavePlugin],
  // Keep legacy env prefix for BE-provided configs (.env / runtime)
  envPrefix: 'REACT_APP_',
  server: {
    port: 5173,
    // On some Windows setups Vite can bind only to IPv6 loopback (::1),
    // making http://localhost:5173 unreachable from 127.0.0.1 / LAN.
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});

