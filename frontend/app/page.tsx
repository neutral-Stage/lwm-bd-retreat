'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import Image from 'next/image';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { dhakaRetreatFellowships as fellowships } from '../data/fellowship';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import { useAppContext, actions } from '../contexts/AppContext';
import { createParticipant } from '../lib/data-fetching';
import FormLabel from '@mui/material/FormLabel';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

interface FormValues {
  name: string;
  contact: string;
  guardianName: string;
  guardianContact: string;
  gender: 'male' | 'female';
  fellowshipName: string;
  department: string;
  isSaved: string;
  salvationDate: string;
  birthYear: string;
  image: File | null;
}

interface DepartmentItem {
  title: string;
  value: string;
}

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Life Word Mission Bangladesh
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const Transition = forwardRef<unknown, TransitionProps & { children: React.ReactElement }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);

export default function HomePage() {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [birthYear, setBirthYear] = useState<string>('');
  
  // Extract values from context for easier access
  const {
    formData: {
      name,
      phone,
      gender,
      fellowshipName,
      salvationDate,
      present,
      age
    },
    selectedDate: date,
    selectedYear: year,
    isModalOpen
  } = state;

  // Local state for fields not in FormData
  const [contact, setContact] = useState<string>('');
  const [guardianName, setGuardianName] = useState<string>('');
  const [guardianContact, setGuardianContact] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [isSaved, setIsSaved] = useState<string>('no');

  const convertDate = (date: Date): string => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  const convertYear = (date: Date): string => {
    return dayjs(date).format('YYYY');
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

  const values = {
    name,
    contact,
    guardianName,
    guardianContact,
    gender,
    fellowshipName,
    department,
    isSaved,
    salvationDate,
    birthYear,
    image
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle FormData fields
    if (['name', 'phone', 'fellowshipName', 'salvationDate', 'present', 'gender'].includes(name)) {
      dispatch(actions.setFormData({
        [name]: value,
      }));
    }
    
    // Handle local state fields
    switch (name) {
      case 'contact':
        setContact(value);
        break;
      case 'guardianName':
        setGuardianName(value);
        break;
      case 'guardianContact':
        setGuardianContact(value);
        break;
      case 'department':
        setDepartment(value);
        break;
      case 'isSaved':
        setIsSaved(value);
        break;
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    // Handle FormData fields
    if (['fellowshipName', 'gender', 'present'].includes(name)) {
      dispatch(actions.setFormData({
        [name]: value,
      }));
    }
    
    // Handle local state fields
    switch (name) {
      case 'department':
        setDepartment(value);
        break;
      case 'isSaved':
        setIsSaved(value);
        break;
    }
  };

  const handleClickOpen = () => {
    dispatch(actions.setModalOpen(true));
  };

  const handleClose = () => {
    dispatch(actions.setModalOpen(false));
  };

  const handleDate = (newValue: any) => {
    const format = convertDate(newValue.toDate());
    dispatch(actions.setFormData({
      salvationDate: format,
    }));
    dispatch(actions.setSelectedDate(newValue));
  };

  const handleYear = (newValue: any) => {
    const format = convertYear(newValue.toDate());
    setBirthYear(format);
    dispatch(actions.setSelectedYear(newValue));
  };

  const onChange = (file: File | null) => {
    if (!file) {
      setImage(null);
      return;
    }
    setImage(file);
    fileToDataUri(file).then((dataUri) => {
      // Handle data URI if needed
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    handleClickOpen();
    
    try {
      const data = new FormData(event.currentTarget);
      const fellowshipName = data.get('fellowshipName') as string;
      const felName = fellowshipName.slice(0, 3).toUpperCase();
      const serNo = Math.floor(1000 + Math.random() * 9000);
      const regNo = felName + '-' + serNo;
      
      const participantData = {
        _id: id,
        _type: 'participant' as const,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        regNo: regNo,
        name: name,
        contact: contact,
        guardianName: guardianName || '',
        guardianContact: guardianContact || '',
        gender: gender as 'male' | 'female',
        department: department,
        fellowshipName: fellowshipName,
        present: 'present' as const,
        guestOrSaved: isSaved === 'yes' ? 'saved' as const : 'guest' as const,
        salvationDate: salvationDate,
        birthYear: parseInt(birthYear) || new Date().getFullYear() - 18
      };

      await createParticipant(participantData);
      
      // Reset form after successful submission
      dispatch(actions.resetFormData());
      
      console.log('Participant created successfully!');
    } catch (error) {
      console.error('Error creating participant:', error);
    } finally {
      setLoading(false);
    }
  };

  const departmentList: DepartmentItem[] = [
    { title: 'Adult', value: 'adult' },
    { title: 'Child', value: 'child' },
    { title: 'Youth', value: 'youth' },
    { title: 'Volunteer', value: 'volunteer' },
    { title: 'Senior (Older than 65 yrs)', value: 'senior' },
  ];

  return (
    <>
      <Dialog
          open={isModalOpen}
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
              <DialogTitle sx={{ textAlign: 'center' }}>
                {'Thank you for completing this form'}
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center' }}>
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div>
              <Image src="/lwmb.png" height={120} width={140} alt="LWMB Logo" />
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
                    value={name}
                    onChange={handleInputChange}
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
                    value={contact}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="guardianName"
                    label="Guardian Name (Optional)"
                    name="guardianName"
                    autoComplete="off"
                    value={guardianName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="guardianContact"
                    label="Guardian Contact (Optional)"
                    name="guardianContact"
                    autoComplete="off"
                    value={guardianContact}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormLabel id="gender">Gender</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="gender"
                    value={gender}
                    onChange={handleInputChange}
                    name="gender"
                  >
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="fellowship-label">Fellowship</InputLabel>
                    <Select
                      labelId="fellowship-label"
                      id="fellowship"
                      value={fellowshipName}
                      label="Fellowship"
                      name="fellowshipName"
                      onChange={handleSelectChange}
                    >
                      {fellowships.map((fellowship) => (
                        <MenuItem key={fellowship} value={fellowship}>
                          {fellowship}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      id="department"
                      value={department}
                      label="Department"
                      name="department"
                      onChange={handleSelectChange}
                    >
                      {departmentList.map((department) => (
                        <MenuItem key={department.value} value={department.value}>
                          {department.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <MobileDatePicker
                    label="Birth Year"
                    name="birthYear"
                    format="yyyy"
                    views={['year']}
                    value={year}
                    onChange={(newValue) => handleYear(newValue)}
                    slotProps={{ textField: {} }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormLabel id="salvation">Salvation</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="salvation"
                    value={isSaved}
                    onChange={handleInputChange}
                    name="isSaved"
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </Grid>
                {isSaved === 'yes' && (
                  <Grid item xs={12}>
                    <MobileDatePicker
                      label="Salvation Date"
                      name="salvationDate"
                      format="DD/MM/yyyy"
                      value={date}
                      onChange={(newValue) => handleDate(newValue)}
                      slotProps={{ textField: {} }}
                    />
                  </Grid>
                )}
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
                {image && (
                  <Grid
                    container
                    justifyContent="center"
                    alignContent="center"
                    style={{ marginTop: '1rem' }}
                  >
                    <Card sx={{ maxWidth: 345 }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={image ? URL.createObjectURL(image) : ''}
                        alt="Uploaded photo"
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
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Container>
    </>
  );
}