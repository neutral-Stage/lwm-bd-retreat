import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { client } from "../service/sanityClient";
import { fellowships } from "../data/fellowship";
import { Divider } from "@mui/material";

// const columns = [
//   { id: "name", label: "Name", minWidth: 170 },
//   { id: "regNo", label: "Registration No.", minWidth: 100 },
//   {
//     id: "contact",
//     label: "Contact",
//     minWidth: 170,
//     align: "right",
//   },
//   {
//     id: "email",
//     label: "Email",
//     minWidth: 170,
//     align: "center",
//   },
//   {
//     id: "fellowshipName",
//     label: "Fellowship Name",
//     minWidth: 170,
//     align: "center",
//   },
//   {
//     id: "guestOrSaved",
//     label: "Guest/Saved",
//     minWidth: 170,
//     align: "center",
//   },
// ];

export default function StickyHeadTable(props) {
  const { participant } = props;
  const guest = participant.filter((p) => p.guestOrSaved === "guest");
  const saved = participant.filter((p) => p.guestOrSaved === "saved");
  const getFellowship = fellowships.map((fel) => {
    const getCount = participant.filter((p) => p.fellowshipName === fel);
    const getSaved = participant.filter(
      (p) => p.fellowshipName === fel && p.guestOrSaved === "saved"
    );
    const getGuest = participant.filter(
      (p) => p.fellowshipName === fel && p.guestOrSaved === "guest"
    );
    return {
      fellowshipName: fel,
      count: getCount.length,
      saved: getSaved.length,
      guest: getGuest.length,
    };
  });
  const total = participant.length;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer component={Paper} sx={{ maxHeight: "100vh" }}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fellowship Name</TableCell>
              <TableCell align="right">Guest</TableCell>
              <TableCell align="right">Saved</TableCell>
              <TableCell align="right">Participants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFellowship.map((row) => (
              <TableRow
                key={row.fellowshipName}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.fellowshipName}
                </TableCell>
                <TableCell align="right">{row.guest}</TableCell>
                <TableCell align="right">{row.saved}</TableCell>
                <TableCell align="right">{row.count}</TableCell>
              </TableRow>
            ))}

            <TableRow
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
                align="right"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {guest.length}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {saved.length}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

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
