import React, { useState, forwardRef } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { fellowships } from "../data/fellowship";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import Slide from "@mui/material/Slide";
import { client } from "../service/sanityClient";
function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Life Word Mission Bangladesh
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function Index() {
  const convertDate = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };
  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  const id = uuidv4();

  const initialValues = {
    name: "",
    email: "",
    contact: "",
    address: "",
    fellowshipName: "Dhaka Church",
    birthDate: convertDate(new Date()),
    guestOrSaved: "guest",
    image: null,
  };
  const [values, setValues] = useState(initialValues);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setDate(new Date());
    setDataUri("");
    setImage(null);
    setValues(initialValues);
    setOpen(false);
  };
  const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  const [date, setDate] = useState(new Date());
  const [dataUri, setDataUri] = useState("");
  const [image, setImage] = useState(null);
  const handleDate = (newValue) => {
    const format = convertDate(newValue);
    setValues({
      ...values,
      birthDate: format,
    });
    setDate(newValue);
  };
  const onChange = (file) => {
    if (!file) {
      setDataUri("");
      return;
    }
    setImage(file);
    fileToDataUri(file).then((dataUri) => {
      setDataUri(dataUri);
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    handleClickOpen();
    const data = new FormData(event.currentTarget);
    const form = {
      _id: id,
      _type: "participant",
      name: data.get("name"),
      email: data.get("email"),
      contact: data.get("contact"),
      address: data.get("address"),
      fellowshipName: data.get("fellowshipName"),
      birthDate: values.birthDate,
      guestOrSaved: data.get("guestOrSaved"),
    };

    await client.create(form).then((res) => {
      console.log(`Participant was created, document ID is ${res._id}`);
    });
    if (image) {
      await client.assets
        .upload("image", image, {
          filename: data.get("name"),
        })
        .then((imageAsset) => {
          // Here you can decide what to do with the returned asset document.
          // If you want to set a specific asset field you can to the following:
          return client
            .patch(id)
            .set({
              image: {
                _type: "image",
                asset: {
                  _type: "reference",
                  _ref: imageAsset._id,
                },
              },
            })
            .commit();
        })
        .then(() => {
          console.log("Done!");
        });

      // console.log(form);
    }
    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="20vh"
              width={200}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <DialogTitle sx={{ textAlign: "center" }}>
                {"Thank you for completing this form"}
              </DialogTitle>
              <DialogContent sx={{ textAlign: "center" }}>
                <DialogContentText id="alert-dialog-slide-description">
                  We will let you know soon
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <GroupAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5" align="center">
              Life Word Mission Bangladesh Retreat Form
            </Typography>
            <Typography component="h1" variant="overline" align="center">
              October 21-23, 2022
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    autoComplete="given-name"
                    required
                    fullWidth
                    id="fullName"
                    label="Full Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => handleInputChange(e)}
                    autoFocus
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="off"
                    onChange={(e) => handleInputChange(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="phone"
                    label="Phone"
                    name="contact"
                    autoComplete="off"
                    value={values.contact}
                    onChange={(e) => handleInputChange(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="address"
                    label="Address"
                    name="address"
                    autoComplete="off"
                    value={values.address}
                    onChange={(e) => handleInputChange(e)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-helper-label">
                      Fellowship Name
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-helper-label"
                      id="demo-simple-select-helper"
                      // value={fellowship}
                      label="Fellowship Name"
                      name="fellowshipName"
                      onChange={(e) => handleInputChange(e)}
                      value={values.fellowshipName ?? "Dhaka Church"}
                    >
                      {fellowships.map((fellowship, i) => {
                        return (
                          <MenuItem key={i} value={fellowship}>
                            {fellowship}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <MobileDatePicker
                    label="Birth Date"
                    name="birthDate"
                    inputFormat="DD/MM/yyyy"
                    value={date}
                    onChange={(newValue) => handleDate(newValue._d)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RadioGroup
                    row
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="guest"
                    value={values.guestOrSaved}
                    onChange={(e) => handleInputChange(e)}
                    name="guestOrSaved"
                  >
                    <FormControlLabel
                      value="guest"
                      control={<Radio />}
                      label="Guest"
                    />
                    <FormControlLabel
                      value="saved"
                      control={<Radio />}
                      label="Saved"
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button variant="contained" component="label">
                    Upload Photo
                    <input
                      hidden
                      onChange={(event) =>
                        onChange(event.target.files[0] || null)
                      }
                      accept="image/*"
                      type="file"
                    />
                  </Button>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                  >
                    <input
                      hidden
                      onChange={(event) =>
                        onChange(event.target.files[0] || null)
                      }
                      accept="image/*"
                      type="file"
                    />
                    <PhotoCamera />
                  </IconButton>
                </Stack>
              </Grid>
              {dataUri && (
                <Grid
                  container
                  justifyContent="center"
                  alignContent="center"
                  style={{ marginTop: "1rem" }}
                >
                  <Card sx={{ maxWidth: 345 }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={dataUri}
                      alt="green iguana"
                    />
                  </Card>
                </Grid>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Submit
              </Button>
            </Box>
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Container>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
