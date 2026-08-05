import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { StatusChip } from '../../sections/interoperability/components';
import SignatureStudio from '../../components/file-viewer/SignatureStudio';
import { getS3AttachmentUrl } from '../../services/storageS3Api';
import { ManagedDocumentRecord } from './types';

type Props = {
  open: boolean;
  formValues: ManagedDocumentRecord;
  formAttachmentPreviewUrls: Record<string, string>;
  onClose: () => void;
  onSignComplete: (signaturesCount: number) => void;
};

export default function DocumentSignDialog({
  open,
  formValues,
  formAttachmentPreviewUrls,
  onClose,
  onSignComplete,
}: Props) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const firstFile = formValues?.attachments?.[0];
  const firstFileName = typeof firstFile === 'string' ? firstFile : firstFile?.originalFileName || firstFile?.name || '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={isSmDown ? 'lg' : 'xl'} fullScreen={isSmDown}>
      <DialogTitle>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
          <Box>
            <Typography variant="h6">Giao diện ký số văn bản</Typography>
            <Typography variant="body2" color="text.secondary">
              {formValues?.code || ''} · {firstFileName || 'Chưa có file'}
            </Typography>
          </Box>
          <StatusChip status={(formValues as any)?.signStatus || 'Chưa ký'} />
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: isSmDown ? 1.5 : undefined }}>
        <SignatureStudio
          files={(formValues?.attachments || []).map((item: any) => {
            const fileName = typeof item === 'string' ? item : item?.originalFileName || item?.name || '';
            const objectKey = typeof item === 'string' ? item : item?.objectKey || item?.OBJECT_KEY || fileName;
            return {
              fileName,
              fileUrl: (fileName && formAttachmentPreviewUrls?.[fileName]) ?? getS3AttachmentUrl(objectKey || fileName) ?? '',
            };
          })}
          onSignComplete={(signatures) => onSignComplete(signatures.length)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
