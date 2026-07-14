import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Card,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { useSettingsContext } from '../../components/settings';

type ShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

type MetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: string;
};

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

type TableColumn<T> = {
  key: keyof T;
  label: string;
  align?: 'left' | 'right' | 'center';
};

type DataTableProps<T extends Record<string, ReactNode>> = {
  columns: TableColumn<T>[];
  rows: T[];
};

export function PageShell({ title, subtitle, children }: ShellProps) {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>{title} | GOVS Interop</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Stack spacing={3}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              color: 'common.white',
              textAlign: 'center',
              background:
                'linear-gradient(135deg, rgba(12,52,87,1) 0%, rgba(24,97,140,1) 55%, rgba(59,154,191,1) 100%)',
              boxShadow: (theme) => theme.shadows[12],
            }}
          >
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              TRỤC LIÊN THÔNG VĂN BẢN
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 860, mx: 'auto', opacity: 0.88 }}>
              {subtitle}
            </Typography>
          </Box>

          {children}
        </Stack>
      </Container>
    </>
  );
}

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <Iconify icon={icon} width={22} />
          </Box>
        </Stack>

        <Typography variant="h3">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      </Stack>
    </Card>
  );
}

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Box>
            <Typography variant="h5">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>

        <Divider />
        {children}
      </Stack>
    </Card>
  );
}

export function StatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';

  if (['active', 'received', 'ack', 'đã nhận'].includes(normalized)) color = 'success';
  if (['pending', 'retrying', 'waiting', 'đang xử lý'].includes(normalized)) color = 'warning';
  if (['failed', 'nack'].includes(normalized)) color = 'error';
  if (['sent', 'đã phát hành', 'đang lưu trữ'].includes(normalized)) color = 'info';

  return <Chip label={status} color={color} size="small" variant={color === 'default' ? 'outlined' : 'filled'} />;
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <Stack spacing={1.2}>
      {items.map((item) => (
        <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
          <Iconify icon="solar:check-circle-bold" width={18} sx={{ mt: 0.25, color: 'primary.main' }} />
          <Typography variant="body2">{item}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function ProgressList({ items }: { items: { label: string; value: number }[] }) {
  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.value}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={item.value}
            sx={{ height: 10, borderRadius: 99, bgcolor: 'grey.300' }}
          />
        </Box>
      ))}
    </Stack>
  );
}

export function DataTable<T extends Record<string, ReactNode>>({ columns, rows }: DataTableProps<T>) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={String(column.key)} align={column.align || 'left'}>
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={String(column.key)} align={column.align || 'left'}>
                {row[column.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        overflow: 'auto',
        borderRadius: 2,
        bgcolor: 'grey.900',
        color: 'grey.100',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      {code}
    </Box>
  );
}
