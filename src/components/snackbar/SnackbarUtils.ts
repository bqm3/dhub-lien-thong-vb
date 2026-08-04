import { useSnackbar, OptionsObject, SnackbarKey } from 'notistack';

let snackbarRef: {
  enqueueSnackbar: (message: string, options?: OptionsObject) => SnackbarKey;
} | null = null;

export const SnackbarUtilsConfigurator = () => {
  const { enqueueSnackbar } = useSnackbar();
  snackbarRef = { enqueueSnackbar };
  return null;
};

export const enqueueSnackbar = (message: string, options?: OptionsObject) => {
  if (snackbarRef && snackbarRef.enqueueSnackbar) {
    return snackbarRef.enqueueSnackbar(message, options);
  }
};
