import { useCallback, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from '../../../components/iconify';
import {
  PlacedSignature,
  SIGNATURE_PRESETS,
  SignatureType,
} from '../workflowTypes';

const CANVAS_WIDTH = 595;
const CANVAS_HEIGHT = 842;

type DragItem = {
  type: SignatureType;
  label: string;
};

export default function SignatureStudio({
  fileName,
  onSignComplete,
}: {
  fileName?: string;
  onSignComplete?: (signatures: PlacedSignature[]) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [uploadedName, setUploadedName] = useState(fileName ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<PlacedSignature[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedName(file.name);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleCanvasDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/signature');
    if (!raw || !canvasRef.current) return;

    const item: DragItem = JSON.parse(raw);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left - 60, CANVAS_WIDTH - 120));
    const y = Math.max(0, Math.min(event.clientY - rect.top - 20, CANVAS_HEIGHT - 50));

    setSignatures((prev) => [
      ...prev,
      {
        id: `sig-${Date.now()}`,
        type: item.type,
        label: item.label,
        x,
        y,
        width: item.type === 'stamp' ? 100 : 120,
        height: item.type === 'stamp' ? 100 : 50,
        page: 1,
      },
    ]);
  };

  const handlePaletteDragStart = (event: React.DragEvent, item: DragItem) => {
    event.dataTransfer.setData('application/signature', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleSigMouseDown = (event: React.MouseEvent, sig: PlacedSignature) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingId(sig.id);
    dragOffset.current = {
      x: event.clientX - rect.left - sig.x,
      y: event.clientY - rect.top - sig.y,
    };
  };

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const sig = signatures.find((s) => s.id === draggingId);
      if (!sig) return;
      const newX = Math.max(
        0,
        Math.min(event.clientX - rect.left - dragOffset.current.x, CANVAS_WIDTH - sig.width)
      );
      const newY = Math.max(
        0,
        Math.min(event.clientY - rect.top - dragOffset.current.y, CANVAS_HEIGHT - sig.height)
      );
      setSignatures((prev) =>
        prev.map((s) => (s.id === draggingId ? { ...s, x: newX, y: newY } : s))
      );
    },
    [draggingId, signatures]
  );

  const handleMouseUp = () => setDraggingId(null);

  const removeSignature = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  const presetColor = (type: SignatureType) =>
    SIGNATURE_PRESETS.find((p) => p.type === type)?.color ?? '#666';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Upload & Chữ ký
          </Typography>

          <Button variant="outlined" component="label" fullWidth startIcon={<Iconify icon="solar:upload-bold" />}>
            Chọn file PDF/DOCX/Ảnh
            <input hidden type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileUpload} />
          </Button>

          {uploadedName && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {uploadedName}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Kéo thả chữ ký vào văn bản
          </Typography>
          <Stack spacing={1}>
            {SIGNATURE_PRESETS.map((preset) => (
              <Box
                key={preset.type}
                draggable
                onDragStart={(e) => handlePaletteDragStart(e, { type: preset.type, label: preset.label })}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '2px dashed',
                  borderColor: preset.color,
                  bgcolor: `${preset.color}14`,
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <Iconify icon="solar:pen-new-square-bold" sx={{ color: preset.color }} />
                <Typography variant="body2" fontWeight={600}>
                  {preset.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Vị trí đã đặt ({signatures.length})
          </Typography>
          <List dense disablePadding>
            {signatures.map((sig) => (
              <ListItem
                key={sig.id}
                secondaryAction={
                  <Button size="small" color="error" onClick={() => removeSignature(sig.id)}>
                    Xóa
                  </Button>
                }
              >
                <ListItemText
                  primary={sig.label}
                  secondary={`Trang ${sig.page} · (${Math.round(sig.x)}, ${Math.round(sig.y)})`}
                />
              </ListItem>
            ))}
            {signatures.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Chưa có chữ ký nào trên file
              </Typography>
            )}
          </List>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!uploadedName || signatures.length === 0}
            onClick={() => onSignComplete?.(signatures)}
            startIcon={<Iconify icon="solar:shield-check-bold" />}
          >
            Xác nhận ký số
          </Button>
        </Card>
      </Grid>

      <Grid item xs={12} md={9}>
        <Card sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Vùng ký — kéo chữ ký vào đúng vị trí</Typography>
            <Chip label="Trang 1/1" size="small" />
          </Stack>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'grey.200',
              p: 2,
              borderRadius: 2,
              overflow: 'auto',
            }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Box
              ref={canvasRef}
              onDrop={handleCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
              onMouseMove={handleCanvasMouseMove}
              sx={{
                position: 'relative',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                bgcolor: 'common.white',
                boxShadow: 6,
                backgroundImage: previewUrl ? `url(${previewUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!previewUrl && (
                <Box sx={{ p: 4, pointerEvents: 'none' }}>
                  <Typography variant="h6" align="center" sx={{ mb: 3, mt: 2 }}>
                    {uploadedName || 'TÀI LIỆU MẪU — A4'}
                  </Typography>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((line) => (
                    <Box
                      key={line}
                      sx={{
                        height: 12,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        mb: 1.5,
                        width: line % 3 === 0 ? '60%' : '100%',
                      }}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
                    Upload file ảnh để xem preview thật · PDF hiển thị khung A4 demo
                  </Typography>
                </Box>
              )}

              {signatures.map((sig) => (
                <Box
                  key={sig.id}
                  onMouseDown={(e) => handleSigMouseDown(e, sig)}
                  sx={{
                    position: 'absolute',
                    left: sig.x,
                    top: sig.y,
                    width: sig.width,
                    height: sig.height,
                    border: '2px solid',
                    borderColor: presetColor(sig.type),
                    borderRadius: 1,
                    bgcolor: `${presetColor(sig.type)}22`,
                    cursor: draggingId === sig.id ? 'grabbing' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    userSelect: 'none',
                    zIndex: draggingId === sig.id ? 10 : 1,
                  }}
                >
                  <Iconify icon="solar:pen-bold" width={16} sx={{ color: presetColor(sig.type) }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: presetColor(sig.type) }}>
                    {sig.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
