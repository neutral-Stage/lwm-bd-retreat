import { useState, useRef } from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { client } from '../service/sanityClient'
import { dhakaRetreatFellowships } from '../data/fellowship'
import { Divider, Typography } from '@mui/material'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import EditModalForm from '../components/EditModalForm'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'

export default function StickyHeadTable(props) {
  const { participant } = props
  const [participantState, setParticipantState] = useState(participant)

  const isPresent = (p) => p.present === 'present'
  const male = participantState.filter(
    (p) => p.gender === 'male' && isPresent(p)
  )
  const female = participantState.filter(
    (p) => p.gender === 'female' && isPresent(p)
  )
  const getFellowship = dhakaRetreatFellowships.map((fel) => {
    const getCount = participantState.filter(
      (p) => p.fellowshipName === fel && isPresent(p)
    )

    const getMale = participantState.filter(
      (p) => p.fellowshipName === fel && p.gender === 'male' && isPresent(p)
    )
    const getFemale = participantState.filter(
      (p) => p.fellowshipName === fel && p.gender === 'female' && isPresent(p)
    )
    return {
      fellowshipName: fel,
      count: getCount.length,
      male: getMale.length,
      female: getFemale.length,
    }
  })
  // const total = participantState.length;
  const total = participantState.filter((p) => isPresent(p)).length

  const tableRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState('')

  const handleDialog = (value) => {
    setSelected(value)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  const handleEditDialog = (value) => {
    setSelected(value)
    setEditOpen(true)
  }

  const handleEditClose = () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const upd_parti = participantState.map((obj) => {
      if (selected._id === obj._id) {
        obj.present = 'absent'
      }
      return obj
    })
    setOpen(false)
    setParticipantState(upd_parti)
    await client
      .delete(selected._id)
      .then((updatedBike) => {
        setSelected('')
        console.log('Hurray, the participant is updated! New document:')
        console.log(updatedBike)
      })
      .catch((err) => {
        console.error('Oh no, the update failed: ', err.message)
      })
  }

  const handleChangePresent = async (e, id) => {
    await client
      .patch(id) // Document ID to patch
      .set({ present: e.target.value }) // Increment field by count
      .commit() // Perform the patch and return a promise
      .then((updatedBike) => {
        console.log('Hurray, the participant is updated! New document:')
        console.log(updatedBike)
      })
      .catch((err) => {
        console.error('Oh no, the update failed: ', err.message)
      })
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Dialog
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby='edit-participant'
      >
        <DialogTitle id='edit-participant'>
          {`Edit ${selected?.name} from ${selected?.fellowshipName}`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <EditModalForm
              selected={selected}
              setSelected={setSelected}
              handleClose={handleEditClose}
              participantState={participantState}
              setParticipantState={setParticipantState}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={handleEditClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='delete-participant'
      >
        <DialogTitle id='delete-participant'>
          {`Are you sure you want to delete  ?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected?.name} from {selected?.fellowshipName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={handleClose}>
            Close
          </Button>
          <Button
            variant='contained'
            color='error'
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
          maxWidth: '70rem',
          my: 4,
          mx: 'auto',
          boxShadow: '0px 0px 8px 8px rgba(0, 0, 0,0.2)',
        }}
      >
        <Table aria-label='sticky table' size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Fellowship Name</TableCell>
              <TableCell align='center'>Male</TableCell>
              <TableCell align='center'>Female</TableCell>
              <TableCell align='center'>Participants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFellowship.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {row.fellowshipName}
                </TableCell>
                <TableCell align='center'>{row.male}</TableCell>
                <TableCell align='center'>{row.female}</TableCell>
                <TableCell align='center'>{row.count}</TableCell>
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
                {male.length}
              </TableCell>
              <TableCell
                align='center'
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {female.length}
              </TableCell>
              <TableCell
                align='center'
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ mt: '2rem' }} />
      {dhakaRetreatFellowships.map((fel) => {
        const participantsByFel = participantState.filter(
          (p) =>
            p.fellowshipName === fel &&
            (p.present === 'present' ||
              p.present === null ||
              p.present === undefined)
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
              maxWidth: '74rem',
              my: 4,
              mx: 'auto',
              boxShadow: '0px 0px 8px 8px rgba(0, 0, 0,0.2)',
            }}
          >
            <Typography variant='h6' sx={{ textDecoration: 'underline' }}>
              {fel}
            </Typography>
            <Table
              aria-label='sticky table'
              size='small'
              ref={tableRef}
              sx={{ p: 4 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell> Name</TableCell>
                  <TableCell align='right'>Contact</TableCell>
                  <TableCell align='right'>Gender</TableCell>
                  <TableCell align='right'>Department</TableCell>
                  <TableCell align='right'>Age</TableCell>
                  <TableCell align='right'>Saved/Unsaved</TableCell>
                  <TableCell align='center'>Present/Absent</TableCell>
                  <TableCell align='right'>Edit</TableCell>
                  <TableCell align='right'>Delete</TableCell>
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
                    <TableCell align='right'>{row.gender}</TableCell>
                    <TableCell align='right'>{row.department}</TableCell>
                    <TableCell align='right'>
                      {current_year - row.birthYear}
                    </TableCell>
                    <TableCell align='center'>
                      {row.isSaved ? 'Saved' : 'Unsaved'}
                    </TableCell>
                    <TableCell align='right'>
                      <FormControl>
                        <RadioGroup
                          aria-labelledby='demo-radio-buttons-group-label'
                          defaultValue={row.present}
                          onChange={(e) => handleChangePresent(e, row._id)}
                          name='radio-buttons-group'
                          row
                        >
                          <FormControlLabel
                            value='present'
                            fontSize='1rem'
                            control={<Radio />}
                            label='Present'
                          />
                          <FormControlLabel
                            value='absent'
                            control={<Radio />}
                            label='Absent'
                            fontSize='1rem'
                          />
                        </RadioGroup>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label='edit'
                        onClick={() => handleEditDialog(row)}
                      >
                        <EditIcon color='primary' />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label='delete'
                        onClick={() => handleDialog(row)}
                      >
                        <DeleteForeverOutlinedIcon color='error' />
                      </IconButton>
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
  // It's important to default the slug so that it doesn't return "undefined"
  // const { slug = "" } = context.params
  const participant = await client.fetch(
    '*[_type == "participant" && !(fellowshipName in ["Bandarban Fellowship", "Hativanga fellowship", "Muladoli Fellowship", "Ruma Fellowship", "Sinaipara Fellowship","Vaggomonipara fellowship"]) ]| order(_createdAt desc){..., "imgUrl": image.asset->url}'
  )
  return {
    props: {
      participant,
    },
    revalidate: 10,
  }
}
