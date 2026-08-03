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
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';
import { getAttachmentDisplayName, getDemoAttachmentUrl } from './documentHelpers';
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={isSmDown ? 'lg' : 'xl'} fullScreen={isSmDown}>
      <DialogTitle>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
          <Box>
            <Typography variant="h6">Giao diện ký số văn bản</Typography>
            <Typography variant="body2" color="text.secondary">
              {formValues.code} · {formValues.attachments[0] ? getAttachmentDisplayName(formValues.attachments[0]) : 'Chưa có file'}
            </Typography>
          </Box>
          <StatusChip status={formValues.signStatus} />
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: isSmDown ? 1.5 : undefined }}>
        <SignatureStudio
          files={formValues.attachments.map((item) => ({
            fileName: getAttachmentDisplayName(item),
            fileUrl: formAttachmentPreviewUrls[item] ?? getDemoAttachmentUrl(formValues.code, item),
          }))}
          onSignComplete={(signatures) => onSignComplete(signatures.length)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
