import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios, { AxiosError } from "axios";
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from "~/utils/snackbar";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (!file) return;

    const storageToken = localStorage.getItem("authorization_key") || "";
    const token_header = storageToken ? `Basic ${storageToken}` : "";

    try {
      const response = await axios({
        method: "GET",
        url,
        params: { name: encodeURIComponent(file.name) },
        headers: { Authorization: token_header },
      });
      const result = await fetch(response.data, { method: "PUT", body: file });
      console.log("Result: ", result);
      enqueueSuccessSnackbar("CSV parsing completed successfully!");
    } catch (err) {
      console.log("err", err);
      if ((err as AxiosError)?.response?.status === 401) {
        enqueueErrorSnackbar(
          "Unauthorized: Your session expired or you are not logged in."
        );
      }
      if ((err as AxiosError)?.response?.status === 403) {
        enqueueErrorSnackbar(
          "Forbidden: You don't have permission to access this."
        );
      }
    }

    setFile(undefined);
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
