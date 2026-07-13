import { ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

type CrudEditorModalProps = {
  open: boolean;
  isEditing: boolean;
  createTitle: string;
  editTitle: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

type CrudDeleteModalProps = {
  open: boolean;
  entityLabel: string;
  entityId: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function CrudEditorModal({
  open,
  isEditing,
  createTitle,
  editTitle,
  onClose,
  onSubmit,
  children,
}: CrudEditorModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? editTitle : createTitle}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CrudDeleteModal({
  open,
  entityLabel,
  entityId,
  onClose,
  onConfirm,
}: CrudDeleteModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        Bạn có chắc muốn xóa {entityLabel} <strong>{entityId}</strong> không?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
