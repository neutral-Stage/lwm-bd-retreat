import { useState, forwardRef, useEffect } from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { client } from "../service/sanityClient";
import { v4 as uuidv4 } from "uuid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";

export default function EditRoom(props) {
  const { room } = props;
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const initialValues = {
    roomNo: "",
    capacity: "",
  };

  const [values, setValues] = useState(initialValues);
  const [roomState, setRoomState] = useState(room);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setValues(initialValues);
    setOpen(false);
  };

  const handleRoom = (data) => {
    setRoomState(data);
  };

  const totalCapacity = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.capacity,
    0
  );
  const totalBooked = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.booked,
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleCapacityChange = (e, index) => {
    const updateRoom = roomState;
    updateRoom[index].capacity = Number(e.target.value);
  };

  const fetchRoom = async () => {
    await client
      .fetch(
        '*[_type == "roomNo" ]{_id,capacity,roomNo, "booked": count(*[_type == "participant" && roomNo._ref == ^._id]) }| order(roomNo desc)'
      )
      .then(() => {
        handleClose();
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClickOpen();
    const form = {
      _id: uuidv4(),
      _type: "roomNo",
      roomNo: values.roomNo,
      capacity: Number(values.capacity),
    };
    const updateRoom = roomState;
    updateRoom.push({
      _id: form._id,
      roomNo: form.roomNo,
      capacity: form.capacity,
      booked: 0,
    });
    setRoomState(updateRoom);
    await client
      .create(form)
      .then(async () => {
        await fetchRoom();
        console.log("Room created");
      })
      .catch((err) => {
        console.error("creation failed: ", err.message);
      });
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    handleClickOpen();
    const updateRoom = roomState?.filter((room) => room._id !== id);
    setRoomState(updateRoom);
    await client
      .delete(id)
      .then(async () => {
        await fetchRoom();
        console.log("Room deleted");
      })
      .catch((err) => {
        console.error("Delete failed: ", err.message);
      });
  };
  const handleUpdate = async (e, id) => {
    e.preventDefault();
    handleClickOpen();
    const findCapacity = roomState.find((r) => r._id === id);

    await client
      .patch(id)
      .set({ capacity: findCapacity.capacity })
      .commit()
      .then(async () => {
        await fetchRoom();
        console.log("Room deleted");
      })
      .catch((err) => {
        console.error("Delete failed: ", err.message);
      });
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack p={1} spacing={2}>
            <Typography textAlign="center">
              "Please wait while updating..."
            </Typography>

            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          </Stack>
        </Box>
      </Modal>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
            <Typography component="h1" variant="h5" align="center">
              Create New Room
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="text"
                    id="roomNo"
                    label="Room No."
                    name="roomNo"
                    value={values.roomNo}
                    onChange={(e) => handleInputChange(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="capacity"
                    label="Capacity"
                    name="capacity"
                    type="number"
                    value={values.capacity}
                    onChange={(e) => handleInputChange(e)}
                  />
                </Grid>
              </Grid>

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
        </Container>
        <Divider sx={{ mt: "2rem" }} />
        {roomState && roomState?.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{
              p: 4,
              maxWidth: "60rem",
              my: 4,
              mx: "auto",
              boxShadow: "0px 0px 8px 8px rgba(0, 0, 0,0.2)",
            }}
          >
            <Table aria-label="sticky table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Room No</TableCell>
                  <TableCell align="center">Capacity</TableCell>
                  <TableCell align="center">Available Room</TableCell>
                  <TableCell align="center">Participants</TableCell>
                  <TableCell align="center">Update</TableCell>
                  <TableCell align="center">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomState.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.roomNo}
                    </TableCell>
                    <TableCell align="center">
                      <Box margin="auto" maxWidth="80px">
                        <TextField
                          sx={{ textAlign: "center" }}
                          size="small"
                          label="Capacity"
                          defaultValue={row.capacity}
                          onChange={(e) => handleCapacityChange(e, index)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {row.capacity - row.booked}
                    </TableCell>
                    <TableCell align="center">{row.booked}</TableCell>
                    <TableCell align="center">
                      <Button
                        sx={{ textTransform: "capitalize" }}
                        type="button"
                        color="primary"
                        variant="contained"
                        onClick={(e) => handleUpdate(e, row._id)}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        sx={{ textTransform: "capitalize" }}
                        type="button"
                        color="error"
                        variant="contained"
                        onClick={(e) => handleDelete(e, row._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow
                  key="akjsdhnaksdnla-aslkjdjalsd"
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    fontWeight: "bold",
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
                  >
                    {totalCapacity}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
                  >
                    {totalCapacity - totalBooked}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
                  >
                    {totalBooked}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export async function getStaticProps() {
  const room = await client.fetch(
    '*[_type == "roomNo" ]{_id,capacity,roomNo, "booked": count(*[_type == "participant" && roomNo._ref == ^._id]) }| order(roomNo desc)'
  );
  return {
    props: {
      room,
    },
    revalidate: 10,
  };
}
