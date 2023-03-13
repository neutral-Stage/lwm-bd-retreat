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
import { Box, Divider, Typography } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

export default function StickyHeadTable(props) {
  const { participant } = props;
  const male = participant.filter((p) => p.gender === "male");
  const female = participant.filter((p) => p.gender === "female");
  const present = participant.filter((p) => p.present === "present");
  const absent = participant.filter((p) => p.present === "absent");
  const getFellowship = fellowships.map((fel) => {
    const getCount = participant.filter((p) => p.fellowshipName === fel);

    const getMale = participant.filter(
      (p) => p.fellowshipName === fel && p.gender === "male"
    );
    const getFemale = participant.filter(
      (p) => p.fellowshipName === fel && p.gender === "female"
    );
    // const getPresent = participant.filter(
    //   (p) => p.fellowshipName === fel && p.present === "present"
    // );
    // const getAbsent = participant.filter(
    //   (p) => p.fellowshipName === fel && p.present === "absent"
    // );
    return {
      fellowshipName: fel,
      count: getCount.length,
      male: getMale.length,
      female: getFemale.length,
      // present: getPresent.length,
      // absent: getAbsent.length,
    };
  });
  // const totalReg = participant.length;
  const total = participant.length;

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
              <TableCell>Fellowship Name</TableCell>
              <TableCell align="center">Male</TableCell>
              <TableCell align="center">Female</TableCell>
              {/* <TableCell align="center">Present</TableCell>
              <TableCell align="center">Absent</TableCell> */}
              <TableCell align="center">Participants</TableCell>
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
                {/* <TableCell align="center">{row.present}</TableCell>
                <TableCell align="center">{row.absent}</TableCell> */}
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
              {/* <TableCell
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
              </TableCell> */}

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
              padding="4"
            >
              <TableHead>
                <TableRow>
                  <TableCell> Name</TableCell>
                  {/* <TableCell align="right">Fellowship Name</TableCell> */}
                  <TableCell align="right">Contact</TableCell>
                  <TableCell align="right">Invited By</TableCell>
                  <TableCell align="right">Gender</TableCell>
                  {/* <TableCell align="center">Present/Absent</TableCell> */}
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
                    {/* <TableCell align="right">{row.fellowshipName}</TableCell> */}
                    <TableCell align="right">{row.contact}</TableCell>
                    <TableCell align="right">
                      {row.invitedBy ?? "N/A"}
                    </TableCell>
                    <TableCell align="right">{row.gender}</TableCell>
                    {/* <TableCell align="center">
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
                    </TableCell> */}
                    {/* <TableCell align="center">
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
                    </TableCell> */}
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
