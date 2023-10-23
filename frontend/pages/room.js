import { useState, useRef, useEffect, useMemo } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { client } from '../service/sanityClient'
import { dhakaRetreatFellowships as fellowships } from '../data/fellowship'
import { Divider, Typography } from '@mui/material'
import RoomSelection from '../components/RoomSelection'

export default function Room(props) {
  const { participant, room } = props
  const [participantState, setParticipantState] = useState(participant)
  const [roomState, setRoomState] = useState(room)
  const totalCapacity = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.capacity,
    0
  )
  const totalBooked = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.booked,
    0
  )

  const updateParticipant = (target, id) => {
    const findRoom = roomState.find((obj) => obj._id === target)
    const upd_parti = participantState.map((obj) => {
      if (obj._id === id) {
        obj.room = findRoom.roomNo
        obj.roomNo = {
          _ref: findRoom._id,
          _type: 'reference',
        }
      }
      return obj
    })

    setParticipantState(upd_parti)
  }
  const updateRoom = (id) => {
    const upd_room = roomState.map((obj) => {
      if (obj._id === id) {
        obj.booked += 1
      }
      return obj
    })
    setRoomState(upd_room)
  }

  const diselection = (value, id) => {
    const upd_room = roomState.map((obj) => {
      if (obj._id === value && obj.booked > 0) {
        obj.booked -= 1
      }
      return obj
    })
    setRoomState(upd_room)

    const upd_parti = participantState.map((obj) => {
      if (obj._id === id) {
        obj.room = null
        obj.roomNo = null
      }
      return obj
    })

    setParticipantState(upd_parti)
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer
        component={Paper}
        sx={{
          p: 4,
          maxWidth: '60rem',
          my: 4,
          mx: 'auto',
          boxShadow: '0px 0px 8px 8px rgba(0, 0, 0,0.2)',
        }}
      >
        <Table aria-label='sticky table' size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Room No</TableCell>
              <TableCell align='center'>Capacity</TableCell>
              <TableCell align='center'>Available Room</TableCell>
              <TableCell align='center'>Participants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomState.map((row) => (
              <TableRow
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {row.roomNo}
                </TableCell>
                <TableCell align='center'>{row.capacity}</TableCell>
                <TableCell align='center'>
                  {row.capacity - row.booked}
                </TableCell>
                <TableCell align='center'>{row.booked}</TableCell>
              </TableRow>
            ))}

            <TableRow
              key='akjsdhnaksdnla-aslkjdjalsd'
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                fontWeight: 'bold',
              }}
            >
              <TableCell
                component='th'
                scope='row'
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                Total
              </TableCell>
              <TableCell
                align='center'
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {totalCapacity}
              </TableCell>
              <TableCell
                align='center'
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {totalCapacity - totalBooked}
              </TableCell>
              <TableCell
                align='center'
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {totalBooked}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: '2rem' }} />
      {fellowships.map((fel) => {
        const participantsByFel = participantState.filter(
          (p) => p.fellowshipName === fel
        )
        if (participantsByFel.length === 0) {
          return
        }
        var now = new Date()
        var current_year = now.getFullYear()
        return (
          <TableContainer
            key={fel}
            component={Paper}
            sx={{
              p: 4,
              maxWidth: '70rem',
              my: 4,
              mx: 'auto',
              boxShadow: '0px 0px 8px 8px rgba(0, 0, 0,0.2)',
            }}
          >
            <Typography variant='h6' sx={{ textDecoration: 'underline' }}>
              {fel}
            </Typography>
            <Table aria-label='sticky table' size='small' sx={{ p: 4 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align='right'>Contact</TableCell>
                  <TableCell align='right'>Gender</TableCell>
                  <TableCell align='right'>Department</TableCell>
                  <TableCell align='right'>Age</TableCell>
                  <TableCell align='right'>Present</TableCell>
                  <TableCell align='right'>Room</TableCell>
                  <TableCell align='right'>Select Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantsByFel.map((row) => (
                  <TableRow
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component='th' scope='row'>
                      {row.name}
                    </TableCell>
                    <TableCell align='right'>{row.contact}</TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: row.department === 'child' && 800,
                      }}
                    >
                      {row.gender}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: row.department === 'child' && 800,
                      }}
                    >
                      {row.department}
                    </TableCell>
                    <TableCell align='right'>
                      {' '}
                      {current_year - row.birthYear}
                    </TableCell>
                    <TableCell align='right'> {row.present}</TableCell>
                    <TableCell align='right'>{row.room ?? ''}</TableCell>
                    <TableCell align='right'>
                      <RoomSelection
                        value={row?.roomNo?._ref}
                        room={roomState}
                        id={row._id}
                        updateParticipant={updateParticipant}
                        updateRoom={updateRoom}
                        diselection={diselection}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      })}
    </Paper>
  )
}

export async function getStaticProps() {
  const participant = await client.fetch(
    '*[_type == "participant" && (gender == "female" || department == "child") ]{...,"room":roomNo->roomNo}| order(_createdAt desc)'
  )
  const room = await client.fetch(
    '*[_type == "roomNo" ]{_id,capacity,roomNo, "booked": count(*[_type == "participant" && roomNo._ref == ^._id]) }| order(roomNo desc)'
  )
  return {
    props: {
      participant,
      room,
    },
    revalidate: 10,
  }
}
