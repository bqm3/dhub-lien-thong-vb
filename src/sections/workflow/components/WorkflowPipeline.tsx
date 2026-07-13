import {
  Box,
  Chip,
  Stack,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Iconify from '../../../components/iconify';
import { WorkflowStep } from '../workflowTypes';

const Connector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 14 },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.divider,
    borderRadius: 1,
  },
}));

const phaseColor: Record<string, string> = {
  INTERNAL: '#1976d2',
  FINAL: '#9c27b0',
  EXTERNAL: '#2e7d32',
};

const statusIcon: Record<string, string> = {
  pending: 'solar:clock-circle-bold',
  active: 'solar:play-circle-bold',
  approved: 'solar:check-circle-bold',
  rejected: 'solar:close-circle-bold',
  skipped: 'solar:minus-circle-bold',
};

type Props = {
  steps: WorkflowStep[];
  compact?: boolean;
};

export default function WorkflowPipeline({ steps, compact }: Props) {
  const activeIndex = steps.findIndex((s) => s.status === 'active');
  const currentIdx = activeIndex >= 0 ? activeIndex : steps.length - 1;

  if (compact) {
    return (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
        {steps.map((step) => (
          <Chip
            key={step.id}
            size="small"
            label={`L${step.level}`}
            color={step.status === 'approved' ? 'success' : step.status === 'active' ? 'warning' : 'default'}
            variant={step.status === 'active' ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Stepper activeStep={currentIdx} alternativeLabel connector={<Connector />} sx={{ minWidth: 900 }}>
        {steps.map((step) => (
          <Step key={step.id} completed={step.status === 'approved'}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: step.status === 'active' ? 'warning.main' : step.status === 'approved' ? 'success.main' : 'grey.300',
                    color: step.status === 'pending' ? 'text.secondary' : 'common.white',
                  }}
                >
                  <Iconify icon={statusIcon[step.status]} width={18} />
                </Box>
              )}
            >
              <Typography variant="caption" sx={{ color: phaseColor[step.phase], fontWeight: 700 }}>
                {step.phase}
              </Typography>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                {step.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {step.assignee}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
