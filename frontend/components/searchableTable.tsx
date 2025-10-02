"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import * as XLSX from "xlsx";
import { Participant } from "../types";

interface SearchableTableProps {
  data: Participant[];
  fellowship: string;
}

interface ExcelData {
  "Registration No.": string;
  Name: string;
  "Male/Female": string;
  Age: string;
  Area: string;
  Department: string;
  Present: string;
  RoomNo: string;
}

const zeroPad = (num: number, places: number): string => {
  return String(num).padStart(places, "0");
};

export const SearchableTable: React.FC<SearchableTableProps> = ({
  data = [],
  fellowship,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<Participant[]>(data || []);

  React.useEffect(() => {
    setFilteredData(data || []);
  }, [data]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    const safeData = data || [];
    if (value === "") {
      setFilteredData(safeData);
    } else {
      const filtered = safeData.filter((participant) =>
        Object.values(participant).some((field) =>
          field?.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  };

  const cancelSearch = (): void => {
    setSearchTerm("");
    setFilteredData(data || []);
  };

  const downloadExcel = (): void => {
    const newData: ExcelData[] = filteredData.map((p, index) => {
      const felName = fellowship.slice(0, 3).toUpperCase();
      const serial = index + 1;
      const serialNo = zeroPad(serial, 3);
      const regNo = felName + "-" + serialNo;

      return {
        "Registration No.": regNo,
        Name: p.name,
        "Male/Female": p.gender,
        Age: p.age?.toString() || "",
        Area: p.area || "",
        Department: p.department || "",
        Present: p.present || "No",
        RoomNo:
          typeof p.roomNo === "object"
            ? p.roomNo?.roomNo || ""
            : p.roomNo || "",
      };
    });

    const workSheet = XLSX.utils.json_to_sheet(newData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "participants");
    XLSX.writeFile(workBook, `${fellowship}.xlsx`);
  };

  return (
    <Box sx={{ width: "100%" }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          gap: "1rem",
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ flexGrow: 1, maxWidth: "400px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={cancelSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button variant="outlined" onClick={downloadExcel} color="primary">
          Export to Excel
        </Button>
      </div>

      <TableContainer sx={{
        maxHeight: "calc(100vh - 300px)",
        minHeight: "400px",
        overflow: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "4px"
      }}>
        <Table stickyHeader aria-label="participant table">
          <TableHead>
            <TableRow>
              <TableCell>Registration No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Gender</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell align="right">Area</TableCell>
              <TableCell align="right">Department</TableCell>
              <TableCell align="right">Present</TableCell>
              <TableCell align="right">Room No.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => {
              const felName = fellowship.slice(0, 3).toUpperCase();
              const serial = index + 1;
              const serialNo = zeroPad(serial, 3);
              const regNo = felName + "-" + serialNo;

              return (
                <TableRow key={row._id} hover>
                  <TableCell>{regNo}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right" sx={{ textTransform: "capitalize" }}>
                    {row.gender}
                  </TableCell>
                  <TableCell align="right">{row.age || "-"}</TableCell>
                  <TableCell align="right" sx={{ textTransform: "capitalize" }}>
                    {row.area || "-"}
                  </TableCell>
                  <TableCell align="right" sx={{ textTransform: "capitalize" }}>
                    {row.department || "-"}
                  </TableCell>
                  <TableCell align="right" sx={{ textTransform: "capitalize" }}>
                    {row.present || "No"}
                  </TableCell>
                  <TableCell align="center">
                    {typeof row.roomNo === "object"
                      ? row.roomNo?.roomNo || "-"
                      : row.roomNo || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredData.length === 0 && (
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            padding: "2rem",
            color: "text.secondary",
          }}
        >
          No participants found.
        </Typography>
      )}
    </Box>
  );
};

export default SearchableTable;
