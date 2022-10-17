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
import { Divider } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

export default function StickyHeadTable(props) {
  const { participant } = props;
  const guest = participant.filter(
    (p) => p.guestOrSaved === "guest" && p.present == "present"
  );
  const saved = participant.filter(
    (p) => p.guestOrSaved === "saved" && p.present == "present"
  );
  const male = participant.filter(
    (p) => p.gender === "male" && p.present == "present"
  );
  const female = participant.filter(
    (p) => p.gender === "female" && p.present == "present"
  );
  const present = participant.filter((p) => p.present === "present");
  const absent = participant.filter((p) => p.present === "absent");
  const getFellowship = fellowships.map((fel) => {
    const getCount = participant.filter(
      (p) => p.fellowshipName === fel && p.present == "present"
    );
    const getSaved = participant.filter(
      (p) =>
        p.fellowshipName === fel &&
        p.guestOrSaved === "saved" &&
        p.present == "present"
    );
    const getGuest = participant.filter(
      (p) =>
        p.fellowshipName === fel &&
        p.guestOrSaved === "guest" &&
        p.present == "present"
    );
    const getMale = participant.filter(
      (p) =>
        p.fellowshipName === fel &&
        p.gender === "male" &&
        p.present == "present"
    );
    const getFemale = participant.filter(
      (p) =>
        p.fellowshipName === fel &&
        p.gender === "female" &&
        p.present == "present"
    );
    const getPresent = participant.filter(
      (p) => p.fellowshipName === fel && p.present == "present"
    );
    const getAbsent = participant.filter(
      (p) => p.fellowshipName === fel && p.present == "absent"
    );
    return {
      fellowshipName: fel,
      count: getCount.length,
      saved: getSaved.length,
      guest: getGuest.length,
      female: getFemale.length,
      male: getMale.length,
      present: getPresent.length,
      absent: getAbsent.length,
    };
  });
  const total = participant.filter((p) => p.present == "present").length;

  const tableRef = React.useRef(null);

  const handleChangeGender = async (e, id) => {
    await client
      .patch(id) // Document ID to patch
      .set({ gender: e.target.value }) // Increment field by count
      .commit() // Perform the patch and return a promise
      .then((updatedBike) => {
        console.log("Hurray, the participant is updated! New document:");
        console.log(updatedBike);
      })
      .catch((err) => {
        console.error("Oh no, the update failed: ", err.message);
      });
  };
  const handleChangeStatus = async (e, id) => {
    await client
      .patch(id) // Document ID to patch
      .set({ guestOrSaved: e.target.value }) // Increment field by count
      .commit() // Perform the patch and return a promise
      .then((updatedBike) => {
        console.log("Hurray, the participant is updated! New document:");
        console.log(updatedBike);
      })
      .catch((err) => {
        console.error("Oh no, the update failed: ", err.message);
      });
  };
  const handleChangePresent = async (e, id) => {
    await client
      .patch(id) // Document ID to patch
      .set({ present: e.target.value }) // Increment field by count
      .commit() // Perform the patch and return a promise
      .then((updatedBike) => {
        console.log("Hurray, the participant is updated! New document:");
        console.log(updatedBike);
      })
      .catch((err) => {
        console.error("Oh no, the update failed: ", err.message);
      });
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer component={Paper}>
        <Table aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Fellowship Name</TableCell>
              <TableCell align="center">Male (Present)</TableCell>
              <TableCell align="center">Female (Present)</TableCell>
              <TableCell align="center">Present</TableCell>
              <TableCell align="center">Absent</TableCell>
              <TableCell align="center">Guest (Present)</TableCell>
              <TableCell align="center">Saved (Present)</TableCell>
              <TableCell align="center">Participants (Present)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFellowship.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.fellowshipName}
                </TableCell>
                <TableCell align="center">{row.male}</TableCell>
                <TableCell align="center">{row.female}</TableCell>
                <TableCell align="center">{row.present}</TableCell>
                <TableCell align="center">{row.absent}</TableCell>
                <TableCell align="center">{row.guest}</TableCell>
                <TableCell align="center">{row.saved}</TableCell>
                <TableCell align="center">{row.count}</TableCell>
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
                {male.length}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {female.length}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {present.length}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {absent.length}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {guest.length}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {saved.length}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: "2rem" }} />
      {fellowships.map((fel) => {
        return (
          <TableContainer key={fel} component={Paper}>
            <h2>{fel}</h2>
            <Table aria-label="sticky table" size="small" ref={tableRef}>
              <TableHead>
                <TableRow>
                  <TableCell> Name</TableCell>
                  <TableCell align="right">Fellowship Name</TableCell>
                  <TableCell align="right">Contact</TableCell>
                  <TableCell align="right">Invited By</TableCell>
                  <TableCell align="center">Gender</TableCell>
                  <TableCell align="center">Guest/Saved</TableCell>
                  <TableCell align="center">Present/Absent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participant
                  .filter((p) => p.fellowshipName === fel)
                  .map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.fellowshipName}</TableCell>
                      <TableCell align="right">{row.contact}</TableCell>
                      <TableCell align="right">{row.invitedBy}</TableCell>
                      <TableCell align="left">
                        <FormControl>
                          <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            onChange={(e) => handleChangeGender(e, row._id)}
                            defaultValue={row.gender}
                            name="radio-buttons-group"
                            row
                          >
                            <FormControlLabel
                              value="female"
                              fontSize="1rem"
                              control={<Radio />}
                              label="Female"
                            />
                            <FormControlLabel
                              value="male"
                              control={<Radio />}
                              label="Male"
                              fontSize="1rem"
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <FormControl>
                          <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue={row.guestOrSaved}
                            onChange={(e) => handleChangeStatus(e, row._id)}
                            name="radio-buttons-group"
                            row
                          >
                            <FormControlLabel
                              value="guest"
                              fontSize="1rem"
                              control={<Radio />}
                              label="Guest"
                            />
                            <FormControlLabel
                              value="saved"
                              control={<Radio />}
                              label="Saved"
                              fontSize="1rem"
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <FormControl>
                          <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue={row.present}
                            onChange={(e) => handleChangePresent(e, row._id)}
                            name="radio-buttons-group"
                            row
                          >
                            <FormControlLabel
                              value="present"
                              fontSize="1rem"
                              control={<Radio />}
                              label="Present"
                            />
                            <FormControlLabel
                              value="absent"
                              control={<Radio />}
                              label="Absent"
                              fontSize="1rem"
                            />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      })}

      {/* <Divider sx={{ marginY: "2rem" }} /> */}
      {/* <TableContainer sx={{ maxHeight: "100vh" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {participant.map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row._key}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === "number"
                          ? column.format(value)
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer> */}
    </Paper>
  );
}

export async function getStaticProps() {
  // It's important to default the slug so that it doesn't return "undefined"
  // const { slug = "" } = context.params
  const participant = await client.fetch(
    '*[_type == "participant"]| order(_createdAt desc)'
  );
  return {
    props: {
      participant,
    },
  };
}
