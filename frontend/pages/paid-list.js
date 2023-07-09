import { useState, useRef } from "react";
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
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

export default function StickyHeadTable(props) {
  const { participant } = props;
  const [participantState, setParticipantState] = useState(participant);

  const isPresent = (p) =>
    p.present === "present" || p.present === null || p.present === undefined;

  const getFellowship = fellowships.map((fel) => {
    const getPaid = participantState.filter(
      (p) => p.fellowshipName === fel && p.feePaid && isPresent(p)
    );
    const getUnpaid = participantState.filter(
      (p) => p.fellowshipName === fel && !p.feePaid && isPresent(p)
    );
    return {
      fellowshipName: fel,
      paid: getPaid.length,
      unpaid: getUnpaid.length,
    };
  });
  // const total = participantState.length;
  const totalPaid = participantState.filter(
    (p) => isPresent(p) && p.feePaid
  ).length;
  const totalUnpaid = participantState.filter(
    (p) => isPresent(p) && !p.feePaid
  ).length;

  const tableRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const handleDialog = (value) => {
    setSelected(value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    const upd_parti = participantState.map((obj) => {
      if (selected._id === obj._id) {
        obj.present = "absent";
      }
      return obj;
    });

    setParticipantState(upd_parti);
    await client
      .patch(selected._id) // Document ID to patch
      .set({ present: "absent" }) // Increment field by count
      .commit() // Perform the patch and return a promise
      .then((updatedBike) => {
        setOpen(false);
        setSelected("");
        console.log("Hurray, the participant is updated! New document:");
        console.log(updatedBike);
      })
      .catch((err) => {
        console.error("Oh no, the update failed: ", err.message);
      });
  };

  const handlePaid = async (e, id) => {
    await client
      .patch(id) // Document ID to patch
      .set({ feePaid: e.target.value === "paid" ? true : false }) // Increment field by count
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure you want to delete  ?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected?.name} from {selected?.fellowshipName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
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
              <TableCell align="center">Paid</TableCell>
              <TableCell align="center">Unpaid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFellowship.map((row, index) => {
              if (row.fellowshipName === "Korean Mission Team") {
                return null;
              }
              return (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.fellowshipName}
                  </TableCell>
                  <TableCell align="center">{row.paid}</TableCell>
                  <TableCell align="center">{row.unpaid}</TableCell>
                </TableRow>
              );
            })}

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
                {totalPaid}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {totalUnpaid}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: "2rem" }} />
      {fellowships.map((fel) => {
        const participantsByFel = participantState.filter(
          (p) =>
            p.fellowshipName === fel &&
            (p.present === "present" ||
              p.present === null ||
              p.present === undefined)
        );
        if (participantsByFel.length === 0) {
          return;
        }
        var now = new Date();
        var current_year = now.getFullYear();
        return (
          <TableContainer
            key={fel}
            component={Paper}
            sx={{
              p: 4,
              maxWidth: "40rem",
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
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Contact</TableCell>
                  <TableCell align="center">Paid/Unpaid</TableCell>
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
                    <TableCell align="right">
                      <RadioGroup
                        row
                        required
                        aria-labelledby="feePaid"
                        value={row.feePaid ? "paid" : "unpaid"}
                        onChange={(e) => handlePaid(e, row._id)}
                        name="feePaid"
                      >
                        <FormControlLabel
                          value="paid"
                          control={<Radio />}
                          label="Paid"
                        />
                        <FormControlLabel
                          value="unpaid"
                          control={<Radio />}
                          label="Unpaid"
                        />
                      </RadioGroup>
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
    '*[_type == "participant" && (present == "present" || present == null) && fellowshipName != "Korean Mission Team" && isSaved == true  ]| order(_createdAt desc)'
  );
  return {
    props: {
      participant,
    },
    revalidate: 10,
  };
}
