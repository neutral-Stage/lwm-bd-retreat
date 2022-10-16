import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SearchBar from "material-ui-search-bar";

const SearchableTable = ({ participants }) => {
  const [rows, setRows] = useState(participants);
  const [searched, setSearched] = useState("");

  const requestSearch = (searchedVal) => {
    const filteredRows = participants.filter((row) => {
      return (
        row.name.toLowerCase().includes(searchedVal.toLowerCase()) ||
        row.contact.includes(searchedVal)
      );
    });
    setRows(filteredRows);
  };

  const cancelSearch = () => {
    setSearched("");
    requestSearch(searched);
  };
  const zeroPad = (num, places) => String(num).padStart(places, "0");

  return (
    <>
      <Paper>
        <SearchBar
          value={searched}
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
        />
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Registration No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Phone</TableCell>
                <TableCell align="right">Invited By</TableCell>
                <TableCell align="right">Male/Female</TableCell>
                <TableCell align="right">Guest/Saved</TableCell>
                <TableCell align="right">Present/Absent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const felName = row.fellowshipName.slice(0, 3).toUpperCase();
                const serial = index + 1;
                const serialNo = zeroPad(serial, 3);
                const regNo = felName + "-" + serialNo;
                return (
                  <TableRow key={row._id}>
                    <TableCell>{regNo}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.contact}</TableCell>
                    <TableCell align="right">{row.invitedBy}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {row.gender}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {row.guestOrSaved}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {row.present}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default SearchableTable;
