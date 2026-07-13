import { useSnackbar } from 'notistack';
import { PageShell } from '../../sections/interoperability/components';
import SignatureStudio from '../../sections/workflow/components/SignatureStudio';

export default function SignatureStudioPage() {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <PageShell
      title="Studio ký số"
      subtitle="Upload file PDF/DOCX/ảnh, kéo thả chữ ký nháy / ký chính / đóng dấu vào đúng vị trí trên văn bản."
    >
      <SignatureStudio
        onSignComplete={(sigs) =>
          enqueueSnackbar(`Đã xác nhận ${sigs.length} vị trí ký (demo)`, { variant: 'success' })
        }
      />
    </PageShell>
  );
}
