'use client';

import React, { useState } from 'react';
import {
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import * as XLSX from 'xlsx';
import { Participant } from '../types';

interface SearchableTableProps {
  data: Participant[];
  fellowship: string;
}

interface ExcelData {
  'Registration No.': string;
  Name: string;
  Phone: string;
  'Male/Female': string;
  Department: string;
  Present: string;
  RoomNo: string;
  'Guardian Name': string;
  'Guardian Contact': string;
}

const zeroPad = (num: number, places: number): string => {
  return String(num).padStart(places, '0');
};

export const SearchableTable: React.FC<SearchableTableProps> = ({ data = [], fellowship }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Participant[]>(data || []);

  React.useEffect(() => {
    setFilteredData(data || []);
  }, [data]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    const safeData = data || [];
    if (value === '') {
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
    setSearchTerm('');
    setFilteredData(data || []);
  };

  const downloadExcel = (): void => {
    const newData: ExcelData[] = filteredData.map((p, index) => {
      const felName = fellowship.slice(0, 3).toUpperCase();
      const serial = index + 1;
      const serialNo = zeroPad(serial, 3);
      const regNo = felName + '-' + serialNo;
      
      return {
        'Registration No.': regNo,
        Name: p.name,
        Phone: p.contact || p.phone || '',
        'Male/Female': p.gender,
        Department: p.department || '',
        Present: p.present || 'No',
        RoomNo: typeof p.roomNo === 'object' ? p.roomNo?.roomNo || '' : p.roomNo || '',
        'Guardian Name': p.guardianName || '',
        'Guardian Contact': p.guardianContact || '',
      };
    });
    
    const workSheet = XLSX.utils.json_to_sheet(newData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'participants');
    XLSX.writeFile(workBook, `${fellowship}.xlsx`);
  };



  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h3" sx={{ marginY: '1rem', textAlign: 'center' }}>
        {fellowship}
      </Typography>
      
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          gap: '1rem',
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ flexGrow: 1, maxWidth: '400px' }}
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

      <TableContainer sx={{ maxHeight: '70vh' }}>
        <Table stickyHeader aria-label="participant table">
          <TableHead>
            <TableRow>
              <TableCell>Registration No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Phone</TableCell>
              <TableCell align="right">Gender</TableCell>
              <TableCell align="right">Department</TableCell>
              <TableCell align="right">Present</TableCell>
              <TableCell align="right">Guardian Name</TableCell>
              <TableCell align="right">Guardian Contact</TableCell>
              <TableCell align="right">Room No.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => {
              const felName = fellowship.slice(0, 3).toUpperCase();
              const serial = index + 1;
              const serialNo = zeroPad(serial, 3);
              const regNo = felName + '-' + serialNo;
              
              return (
                <TableRow key={row._id} hover>
                  <TableCell>{regNo}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.contact || row.phone || '-'}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.gender}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.department || '-'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.present || 'No'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.guardianName || '-'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.guardianContact || '-'}
                  </TableCell>
                  <TableCell align="center">
                    {typeof row.roomNo === 'object' ? row.roomNo?.roomNo || '-' : row.roomNo || '-'}
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
            textAlign: 'center', 
            padding: '2rem',
            color: 'text.secondary'
          }}
        >
          No participants found.
        </Typography>
      )}
    </Paper>
  );
};

export default SearchableTable;