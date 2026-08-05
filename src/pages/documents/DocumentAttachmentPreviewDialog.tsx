import { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { FileViewerItem, FileViewerPanel } from '../../components/file-viewer';
import { getS3AttachmentUrl } from '../../services/storageS3Api';
import { ManagedDocumentRecord } from './types';

type Props = {
  doc: ManagedDocumentRecord | null;
  onClose: () => void;
};

export default function DocumentAttachmentPreviewDialog({ doc, onClose }: Props) {
  const viewerFiles = useMemo<FileViewerItem[]>(
    () =>
      (doc?.attachments ?? [])
        .map((item: any): FileViewerItem | null => {
          const fileName = typeof item === 'string' ? item : item?.originalFileName || item?.ORIGINAL_FILE_NAME || item?.name || '';
          const objectKey = typeof item === 'string' ? item : item?.objectKey || item?.OBJECT_KEY || fileName;
          const fileSize = typeof item === 'object' ? item?.FILE_SIZE ?? item?.fileSize ?? item?.size : undefined;
          if (!fileName && !objectKey) return null;
          const url = getS3AttachmentUrl(objectKey || fileName);
          return url ? { name: fileName, url, size: fileSize } : null;
        })
        .filter((item): item is FileViewerItem => item !== null),
    [doc]
  );

  return (
    <Dialog open={Boolean(doc)} onClose={onClose} fullWidth maxWidth="xl">
      {doc && (
        <>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h6">File đính kèm — {doc.code}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {doc.subject}
                </Typography>
              </Box>
              <Chip label={`${doc.attachments?.length || 0} tệp`} size="small" variant="outlined" />
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2, p: 1.5 }}>
            <FileViewerPanel files={viewerFiles} height={650} showFileList embedded />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Đóng</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
