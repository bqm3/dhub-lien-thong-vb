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
import { FileViewerPanel } from '../../components/file-viewer';
import { getAttachmentDisplayName, getDemoAttachmentUrl } from './documentHelpers';
import { ManagedDocumentRecord } from './types';

type Props = {
  doc: ManagedDocumentRecord | null;
  onClose: () => void;
};

export default function DocumentAttachmentPreviewDialog({ doc, onClose }: Props) {
  const viewerFiles = useMemo(
    () =>
      (doc?.attachments ?? [])
        .map((item) => {
          const url = getDemoAttachmentUrl(doc!.code, item);
          return url ? { name: getAttachmentDisplayName(item), url } : null;
        })
        .filter((item): item is { name: string; url: string } => Boolean(item)),
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
                  {doc.title}
                </Typography>
              </Box>
              <Chip label={`${doc.attachments.length} tệp`} size="small" variant="outlined" />
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <FileViewerPanel files={viewerFiles} height={620} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Đóng</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
