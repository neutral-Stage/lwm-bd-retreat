import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { client } from "../service/sanityClient";
import { fellowships } from "../data/fellowship";
import { Divider, Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function Room(props) {
  const { participant, room } = props;

  const totalCapacity = room.reduce(
    (previousValue, currentValue) => previousValue + currentValue.capacity,
    0
  );
  const totalBooked = room.reduce(
    (previousValue, currentValue) => previousValue + currentValue.booked,
    0
  );

  const handleChangeRoom = async (e, id) => {
    const value = e.target.value;
    if (value && value !== "none")
      await client
        .patch(id) // Document ID to patch
        .set({ roomNo: { _ref: e.target.value, _type: "reference" } }) // Increment field by count
        .commit() // Perform the patch and return a promise
        .then((updatedBike) => {
          console.log("Hurray, the participant is updated! New document:");
          console.log(updatedBike);
        })
        .catch((err) => {
          console.error("Oh no, the update failed: ", err.message);
        });
  };

  const tableRef = React.useRef(null);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {room.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.roomNo}
                </TableCell>
                <TableCell align="center">{row.capacity}</TableCell>
                <TableCell align="center">
                  {row.capacity - row.booked}
                </TableCell>
                <TableCell align="center">{row.booked}</TableCell>
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
      <Divider sx={{ mt: "2rem" }} />
      {fellowships.map((fel) => {
        const participantsByFel = participant.filter(
          (p) => p.fellowshipName === fel
        );
        if (participantsByFel.length === 0) {
          return;
        }
        return (
          <TableContainer
            key={fel}
            component={Paper}
            sx={{
              p: 4,
              maxWidth: "60rem",
              my: 4,
              mx: "auto",
              boxShadow: "0px 0px 8px 8px rgba(0, 0, 0,0.2)",
            }}
          >
            <Typography variant="h6" sx={{ textDecoration: "underline" }}>
              {fel}
            </Typography>
            <Table
              aria-label="sticky table"
              size="small"
              ref={tableRef}
              sx={{ p: 4 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell> Name</TableCell>
                  <TableCell align="right">Contact</TableCell>
                  <TableCell align="right">Gender</TableCell>
                  <TableCell align="right">Room</TableCell>
                  <TableCell align="right">Select Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantsByFel.map((row) => (
                  <TableRow
                    key={row._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.contact}</TableCell>
                    <TableCell align="right">{row.gender}</TableCell>
                    <TableCell align="right">{row.roomNo ?? ""}</TableCell>
                    <TableCell align="right">
                      <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        label="Fellowship Name"
                        name="fellowshipName"
                        value={row.roomNo ?? "none"}
                        onChange={(e) => handleChangeRoom(e, row._id)}
                      >
                        <MenuItem value="none">No Room Selected </MenuItem>
                        {room.map((r) => {
                          return (
                            <MenuItem
                              key={r._id}
                              value={r.roomNo}
                              disabled={r.capacity === r.booked}
                            >
                              Room No: {r.roomNo} , Capacity: {r.capacity} ,
                              Available: {r.capacity - r.booked}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      })}
    </Paper>
  );
}

export async function getStaticProps() {
  // It's important to default the slug so that it doesn't return "undefined"
  // const { slug = "" } = context.params
  const participant = await client.fetch(
    '*[_type == "participant" && gender == "female"]{...,"roomNo":roomNo->roomNo}| order(_createdAt desc)'
  );
  const room = await client.fetch(
    '*[_type == "roomNo" ]{_id,capacity,roomNo, "booked": count(*[_type == "participant" && roomNo._ref == ^._id]) }| order(roomNo desc)'
  );
  return {
    props: {
      participant,
      room,
    },
  };
}
