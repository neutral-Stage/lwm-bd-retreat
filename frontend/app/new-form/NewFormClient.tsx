"use client";

import React, { useState, forwardRef } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { fellowships } from "../../data/fellowship";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
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
import { createParticipant } from "../../lib/data-fetching";
import { useAppContext, actions } from "../../contexts/AppContext";

function Copyright(props: any) {
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

const Transition = forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function NewFormClient() {
  const { dispatch } = useAppContext();

  const convertDate = (date: any) => {
    return moment(date).format("YYYY-MM-DD");
  };

  const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
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
    gender: "",
    invitedBy: "",
    image: null as File | null,
  };

  const [values, setValues] = useState(initialValues);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dataUri, setDataUri] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

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

  const handleDate = (newValue: any) => {
    const format = convertDate(newValue);
    setValues({
      ...values,
      birthDate: format,
    });
    setDate(newValue);
  };

  const onChange = (file: File | null) => {
    if (!file) {
      setDataUri("");
      return;
    }
    setImage(file);
    fileToDataUri(file).then((dataUri) => {
      setDataUri(dataUri);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    handleClickOpen();

    const data = new FormData(event.currentTarget);
    const fellowshipName = data.get("fellowshipName") as string;
    const felName = fellowshipName.slice(0, 3).toUpperCase();
    const serNo = Math.floor(1000 + Math.random() * 9000);
    const regNo = felName + "-" + serNo;

    const participantData = {
      _type: "participant" as const,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      regNo: regNo,
      name: data.get("name") as string,
      contact: data.get("contact") as string,
      fellowshipName: fellowshipName,
      gender: data.get("gender") as "male" | "female",
      present: "present" as const,
      guestOrSaved: data.get("guestOrSaved") as "guest" | "saved",
      birthYear: new Date(values.birthDate).getFullYear(),
    };

    try {
      const newParticipant = await createParticipant(participantData);

      // Add the new participant to global context
      if (newParticipant) {
        dispatch(actions.addParticipant(newParticipant));
      }

      // Handle image upload if present
      if (image) {
        // Note: Image upload functionality would need to be implemented
        // in the data-fetching utility or handled separately
        // TODO: Implement image upload functionality
      }
    } catch (error) {
      console.error("Error creating participant:", error);
    }

    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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
          <div>
            <Image
              src="/lwmb.png"
              height={120}
              width={140}
              alt="LWM Bangladesh Logo"
            />
          </div>
          <Typography component="h1" variant="h5" align="center">
            Bangladesh Life Word Mission Retreat Form
          </Typography>
          <Typography component="h1" variant="overline" align="center">
            October 17-18, 2025
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="invitedBy"
                  label="Invited By"
                  name="invitedBy"
                  autoComplete="off"
                  value={values.invitedBy}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="fellowship-select-label">
                    Fellowship Name
                  </InputLabel>
                  <Select
                    labelId="fellowship-select-label"
                    id="fellowship-select"
                    label="Fellowship Name"
                    name="fellowshipName"
                    onChange={handleSelectChange}
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
                  value={date}
                  onChange={(newValue) => handleDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      name: "birthDate",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <RadioGroup
                  row
                  aria-labelledby="gender-radio-group-label"
                  value={values.gender}
                  onChange={handleInputChange}
                  name="gender"
                >
                  <FormControlLabel
                    value="male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="female"
                    control={<Radio />}
                    label="Female"
                  />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <RadioGroup
                  row
                  aria-labelledby="guest-saved-radio-group-label"
                  defaultValue="guest"
                  value={values.guestOrSaved}
                  onChange={handleInputChange}
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
                      onChange(event.target.files?.[0] || null)
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
                      onChange(event.target.files?.[0] || null)
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
                    alt="Uploaded photo"
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
    </LocalizationProvider>
  );
}