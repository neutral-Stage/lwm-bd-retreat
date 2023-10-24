import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import SearchBar from 'material-ui-search-bar'
import Typography from '@material-ui/core/Typography'
import * as XLSX from 'xlsx'
import Button from '@material-ui/core/Button'

const SearchableTable = ({ participants, fellowship }) => {
  const [rows, setRows] = useState(participants)
  const [searched, setSearched] = useState('')

  const requestSearch = (searchedVal) => {
    const filteredRows = participants.filter((row) => {
      return (
        row.name.toLowerCase().includes(searchedVal.toLowerCase()) ||
        row.contact.includes(searchedVal) ||
        row.gender === searchedVal.toLowerCase() ||
        row.present === searchedVal.toLowerCase() ||
        row.guestOrSaved === searchedVal.toLowerCase()
      )
    })
    setRows(filteredRows)
  }

  const cancelSearch = () => {
    setSearched('')
    requestSearch(searched)
  }
  const zeroPad = (num, places) => String(num).padStart(places, '0')

  const downloadExcel = () => {
    const newData = rows.map((p, index) => {
      const felName = p.fellowshipName.slice(0, 3).toUpperCase()
      const serial = index + 1
      const serialNo = zeroPad(serial, 3)
      const regNo = felName + '-' + serialNo
      var now = new Date()
      var current_year = now.getFullYear()
      return {
        'Registration No.': regNo,
        Name: p.name,
        Phone: p.contact,
        Age: current_year - p.birthYear,
        Gender: p.gender,
        Present: p.present,
        RoomNo: p.roomNo,
        'Guardian Name': p.guardianName,
        'Guardian Contact': p.guardianContact,
      }
    })
    const workSheet = XLSX.utils.json_to_sheet(newData)
    const workBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workBook, workSheet, 'participants')
    //Buffer
    // let buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
    //Binary string
    XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' })
    //Download
    XLSX.writeFile(workBook, `${fellowship}.xlsx`)
  }

  return (
    <>
      <Paper>
        <Typography variant='h3' sx={{ marginY: '1rem' }}>
          {fellowship}
        </Typography>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem',
          }}
        >
          <Button variant='outlined' onClick={downloadExcel} color='primary'>
            Export to Excel
          </Button>
        </div>

        <SearchBar
          value={searched}
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
        />
        <TableContainer>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>Registration No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align='right'>Phone</TableCell>
                <TableCell align='right'>Male/Female</TableCell>
                <TableCell align='right'>Department</TableCell>
                <TableCell align='right'>Present</TableCell>
                <TableCell align='right'>Guardian Name</TableCell>
                <TableCell align='right'>Guardian Contact</TableCell>
                <TableCell align='right'>Room No.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const felName = row.fellowshipName.slice(0, 3).toUpperCase()
                const serial = index + 1
                const serialNo = zeroPad(serial, 3)
                const regNo = felName + '-' + serialNo
                return (
                  <TableRow key={row._id}>
                    <TableCell>{regNo}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align='right'>{row.contact}</TableCell>
                    <TableCell
                      align='right'
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {row.gender}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {row.department}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {row.present}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {row.guardianName}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {row.guardianContact}
                    </TableCell>
                    <TableCell align='center'>{row.roomNo}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  )
}

export default SearchableTable
