import { enqueueSnackbar } from "notistack";

const enqueueErrorSnackbar = (message: string) =>
  enqueueSnackbar({ message, variant: "error" });

const enqueueSuccessSnackbar = (message: string) =>
  enqueueSnackbar({ message, variant: "success" });

export { enqueueSuccessSnackbar, enqueueErrorSnackbar };
