import { useState, useContext } from "react"; 
import { Grid, Button, TextField, LinearProgress } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import Axios from "axios";
import { SetPopupContext } from "../App";

const FileUploadInput = (props) => {
  const setPopup = useContext(SetPopupContext);
  const { uploadTo, identifier, handleInput } = props;

  const [file, setFile] = useState(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setPopup({
        open: true,
        severity: "warning",
        message: "No file selected",
      });
      return;
    }

    const data = new FormData();
    data.append("file", file);

    try {
      setIsUploading(true);
      const response = await Axios.post(uploadTo, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      });

      console.log("Upload response:", response.data);
      handleInput(identifier, response.data.url);
      setPopup({
        open: true,
        severity: "success",
        message: response.data.message || "File uploaded successfully!",
      });

    } catch (err) {
      console.error("Upload error:", err);
      setPopup({
        open: true,
        severity: "error",
        message: err.response ? err.response.statusText : "Upload failed. Server may be down.",
      });

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Grid container item xs={12} direction="column" className={props.className}>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="primary"
            component="label"
            fullWidth
            disabled={isUploading}
          >
            {props.icon}
            <input
              type="file"
              hidden
              onChange={(event) => {
                setUploadPercentage(0);
                setFile(event.target.files[0] || null);
              }}
            />
          </Button>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label={props.label}
            value={file ? file.name : ""}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            <CloudUpload />
          </Button>
        </Grid>
      </Grid>
      {uploadPercentage > 0 && (
        <Grid item xs={12} style={{ marginTop: "10px" }}>
          <LinearProgress variant="determinate" value={uploadPercentage} />
        </Grid>
      )}
    </Grid>
  );
};

export default FileUploadInput;
