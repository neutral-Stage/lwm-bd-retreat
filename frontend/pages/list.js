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

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "regNo", label: "Registration No.", minWidth: 100 },
  {
    id: "contact",
    label: "Contact",
    minWidth: 170,
    align: "right",
  },
  {
    id: "email",
    label: "Email",
    minWidth: 170,
    align: "center",
  },
  {
    id: "fellowshipName",
    label: "Fellowship Name",
    minWidth: 170,
    align: "center",
  },
  {
    id: "guestOrSaved",
    label: "Guest/Saved",
    minWidth: 170,
    align: "center",
  },
];

export default function StickyHeadTable(props) {
  const { participant } = props;
  const total = participant.length;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box>
        <Typography variant="h2" gutterBottom>
          Total Participant: {total}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: "100vh" }}>
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
            {/* {participant
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) */}
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
      </TableContainer>
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
