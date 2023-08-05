import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import moment from "moment";
import { fellowships } from "../data/fellowship";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import FormLabel from "@mui/material/FormLabel";
import CardMedia from "@mui/material/CardMedia";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { client } from "../service/sanityClient";

const EditModalForm = ({
  selected,
  setSelected,
  handleClose,
  participantState,
  setParticipantState,
}) => {
  const [values, setValues] = useState(selected);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "isSaved" && value === "yes") {
      setSelected({
        ...values,
        isSaved: true,
      });
      setValues({
        ...values,
        isSaved: true,
      });
    } else if (name === "isSaved" && value === "no") {
      setSelected({
        ...values,
        isSaved: false,
      });
      setValues({
        ...values,
        isSaved: false,
      });
    } else {
      setSelected({
        ...values,
        [name]: value,
      });
      setValues({
        ...values,
        [name]: value,
      });
    }
  };
  const convertDate = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };
  const convertYear = (date) => {
    return moment(date).format("YYYY");
  };
  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  const [date, setDate] = useState(convertDate(selected.salvationDate));
  const [year, setYear] = useState(convertYear(selected.birthYear));
  const [dataUri, setDataUri] = useState(selected.imgUrl);
  const [image, setImage] = useState(null);
  const handleDate = (newValue) => {
    const format = convertDate(newValue);
    setValues({
      ...values,
      salvationDate: format,
    });
    setDate(newValue);
  };
  const handleYear = (newValue) => {
    const format = convertYear(newValue);
    setValues({
      ...values,
      birthYear: format,
    });
    setYear(newValue);
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
    const upd_parti = participantState.map((obj) => {
      if (values._id === obj._id) {
        obj = values;
      }
      return obj;
    });
    setParticipantState(upd_parti);
    handleClose();
    const data = new FormData(event.currentTarget);

    const fellowshipName = data.get("fellowshipName");
    const felName = fellowshipName.slice(0, 3).toUpperCase();
    var serNo = Math.floor(1000 + Math.random() * 9000);
    const regNo = felName + "-" + serNo;
    const form = {
      _id: values._id,
      _type: "participant",
      regNo: regNo,
      name: data.get("name"),
      contact: data.get("contact"),
      guardianName: data.get("guardianName") ? data.get("guardianName") : "",
      guardianContact: data.get("guardianContact")
        ? data.get("guardianContact")
        : "",
      gender: data.get("gender"),
      department: data.get("department"),
      fellowshipName: fellowshipName,
      isSaved: values.isSaved ? true : false,
      salvationDate: values.salvationDate,
      birthYear: values.birthYear,
    };
    console.log(form);
    setSelected(form);

    await client.createOrReplace(form).then((res) => {
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
            .patch(values._id)
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
    }
  };

  const departmentList = [
    { title: "Adult", value: "adult" },
    { title: "Child", value: "child" },
    { title: "Youth", value: "youth" },
    { title: "Volunteer", value: "volunteer" },
    { title: "Senior (Older than 65 yrs)", value: "senior" },
  ];
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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
            <RadioGroup
              row
              required
              aria-labelledby="demo-radio-buttons-group-label"
              value={values.gender}
              onChange={(e) => handleInputChange(e)}
              name="gender"
            >
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-helper-label">
                Fellowship Name
              </InputLabel>
              <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                label="Fellowship Name"
                name="fellowshipName"
                onChange={(e) => handleInputChange(e)}
                value={values.fellowshipName ?? "Dhaka Church"}
                required
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
            <FormControl fullWidth>
              <InputLabel id="department">Department</InputLabel>
              <Select
                labelId="department"
                id="department"
                label="Department"
                name="department"
                onChange={(e) => handleInputChange(e)}
                value={values.department ?? "adult"}
                required
              >
                {departmentList.map((department, i) => {
                  return (
                    <MenuItem key={i} value={department.value}>
                      {department.title}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          {values.department === "child" ? (
            <>
              <Grid item xs={12}>
                <TextField
                  autoComplete="guardian-name"
                  required={values.department === "child"}
                  fullWidth
                  id="guardianName"
                  label="Guardian Name"
                  name="guardianName"
                  value={values.guardianName}
                  onChange={(e) => handleInputChange(e)}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required={values.department === "child"}
                  id="guardianContact"
                  label="Guardian Phone"
                  name="guardianContact"
                  autoComplete="phone"
                  value={values.guardianContact}
                  onChange={(e) => handleInputChange(e)}
                />
              </Grid>
            </>
          ) : null}

          <Grid item xs={12}>
            <MobileDatePicker
              label="Birth Year"
              name="birthYear"
              inputFormat="yyyy"
              views={["year"]}
              value={year}
              onChange={(newValue) => handleYear(newValue._d)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={12}>
            <FormLabel id="salvation">Salvation</FormLabel>
            <RadioGroup
              row
              required
              aria-labelledby="salvation"
              value={values.isSaved ? "yes" : "no"}
              onChange={(e) => handleInputChange(e)}
              name="isSaved"
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </Grid>
          {values.isSaved ? (
            <Grid item xs={12}>
              <MobileDatePicker
                label="Salvation Date"
                name="salvationDate"
                inputFormat="DD/MM/yyyy"
                value={date}
                onChange={(newValue) => handleDate(newValue._d)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="contained" component="label">
                Upload Photo
                <input
                  hidden
                  onChange={(event) => onChange(event.target.files[0] || null)}
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
                  onChange={(event) => onChange(event.target.files[0] || null)}
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
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1, mb: 2 }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default EditModalForm;
