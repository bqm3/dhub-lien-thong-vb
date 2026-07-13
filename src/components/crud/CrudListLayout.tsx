import { ReactNode } from 'react';
import { Box, Button, Grid, Stack, TextField } from '@mui/material';
import { CrudDeleteModal, CrudEditorModal } from './CrudModals';
import { DataTable, MetricCard, PageShell, SectionCard } from '../../sections/interoperability/components';

type Metric = {
  label: string;
  value: string | number;
  helper: string;
  icon: string;
};

type Column = {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
};

type CrudListLayoutProps = {
  title: string;
  subtitle: string;
  metrics: Metric[];
  listTitle: string;
  listSubtitle: string;
  addLabel: string;
  searchPlaceholder: string;
  deleteEntityLabel: string;
  editorCreateTitle: string;
  editorEditTitle: string;
  columns: Column[];
  tableRows: Record<string, ReactNode>[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  openEditor: boolean;
  editingId: string | null;
  deletingId: string | null;
  onOpenCreate: () => void;
  onCloseEditor: () => void;
  onSubmit: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  formContent: ReactNode;
};

export default function CrudListLayout({
  title,
  subtitle,
  metrics,
  listTitle,
  listSubtitle,
  addLabel,
  searchPlaceholder,
  deleteEntityLabel,
  editorCreateTitle,
  editorEditTitle,
  columns,
  tableRows,
  keyword,
  onKeywordChange,
  openEditor,
  editingId,
  deletingId,
  onOpenCreate,
  onCloseEditor,
  onSubmit,
  onCloseDelete,
  onConfirmDelete,
  formContent,
}: CrudListLayoutProps) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid key={metric.label} item xs={12} sm={6} lg={3}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard
            title={listTitle}
            subtitle={listSubtitle}
            action={
              <Button variant="contained" onClick={onOpenCreate}>
                {addLabel}
              </Button>
            }
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Tìm kiếm"
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                placeholder={searchPlaceholder}
              />
              <Box sx={{ overflowX: 'auto' }}>
                <DataTable columns={columns} rows={tableRows} />
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <CrudEditorModal
        open={openEditor}
        isEditing={Boolean(editingId)}
        createTitle={editorCreateTitle}
        editTitle={editorEditTitle}
        onClose={onCloseEditor}
        onSubmit={onSubmit}
      >
        {formContent}
      </CrudEditorModal>

      <CrudDeleteModal
        open={Boolean(deletingId)}
        entityLabel={deleteEntityLabel}
        entityId={deletingId}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
      />
    </PageShell>
  );
}
