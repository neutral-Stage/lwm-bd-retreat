'use client';

import { useState, useRef } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { dhakaRetreatFellowships as fellowships } from '../../data/fellowship';
import { Divider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import * as XLSX from 'xlsx';
import { updateParticipant } from '../../lib/data-fetching';
import { Participant, useAppContext, actions } from '../../contexts/AppContext';

interface RadioPaidProps {
  id: string;
  feePaid: boolean;
  onUpdate: (id: string, feePaid: boolean) => void;
}

const RadioPaid = ({ id, feePaid, onUpdate }: RadioPaidProps) => {
  const [currentFeePaid, setCurrentFeePaid] = useState(feePaid);
  
  const handlePaid = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const isPaid = e.target.value === 'paid';
    setCurrentFeePaid(isPaid);
    
    try {
      await updateParticipant(id, { feePaid: isPaid });
      onUpdate(id, isPaid);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      // Revert on error
      setCurrentFeePaid(feePaid);
    }
  };
  
  return (
    <RadioGroup
      row
      aria-labelledby="feePaid"
      value={currentFeePaid ? 'paid' : 'unpaid'}
      onChange={(e) => handlePaid(e, id)}
      name="feePaid"
    >
      <FormControlLabel value="paid" control={<Radio />} label="Paid" />
      <FormControlLabel value="unpaid" control={<Radio />} label="Unpaid" />
    </RadioGroup>
  );
};

interface PaidListClientProps {
  participants: Participant[];
}

export default function PaidListClient({ participants: initialParticipants }: PaidListClientProps) {
  const { state, dispatch } = useAppContext();
  
  // Use context state or fallback to initial data
  const participantState = state.participants.length > 0 ? state.participants : initialParticipants;
  
  const tableRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Participant | null>(null);

  const isPresent = (p: Participant) =>
    p.present === 'present' || p.present === null || p.present === undefined;

  const handlePaymentUpdate = (id: string, feePaid: boolean) => {
    const targetParticipant = participantState.find(p => p._id === id);
    if (targetParticipant) {
      dispatch(actions.updateParticipant({ ...targetParticipant, feePaid }));
    }
  };

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

  const totalPaid = participantState.filter(
    (p) => isPresent(p) && p.feePaid
  ).length;
  const totalUnpaid = participantState.filter(
    (p) => isPresent(p) && !p.feePaid
  ).length;

  const handleDialog = (participant: Participant) => {
    setSelected(participant);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selected) return;
    
    try {
      await updateParticipant(selected._id, { present: 'absent' });
      
      const updatedParticipants = participantState.map((obj) => {
        if (selected._id === obj._id) {
          return { ...obj, present: 'absent' as const };
        }
        return obj;
      });
      
      updatedParticipants.forEach(participant => {
        if (participant._id === selected._id) {
          dispatch(actions.updateParticipant(participant));
        }
      });
      setOpen(false);
      setSelected(null);
    } catch (error) {
      console.error('Failed to update participant status:', error);
    }
  };

  const downloadExcel = () => {
    const newData = getFellowship.map((p) => {
      return {
        'Fellowship Name': p.fellowshipName,
        paid: p.paid,
        unpaid: p.unpaid,
      };
    });

    const totalList = [
      ...newData,
      {
        'Fellowship Name': 'Total',
        paid: totalPaid,
        unpaid: totalUnpaid,
      },
    ];
    
    const workSheet = XLSX.utils.json_to_sheet(totalList);
    const workBook = XLSX.utils.book_new();

    const arrayOfFel = fellowships.map((fel) => {
      const participantsByFel = participantState.filter(
        (p) =>
          p.fellowshipName === fel &&
          (p.present === 'present' ||
            p.present === null ||
            p.present === undefined)
      );
      if (participantsByFel.length === 0) {
        return null;
      }
      return participantsByFel.map((row) => {
        return {
          name: row.name,
          contact: row.contact,
          paid: row.feePaid,
          fellowshipName: row.fellowshipName,
        };
      });
    });
    
    const ws = arrayOfFel.filter((item) => item);
    ws.forEach((fellowship, index) => {
      if (fellowship) {
        const newLst = fellowship.map((p) => {
          return {
            'Fellowship Name': p.fellowshipName,
            name: p.name,
            contact: p.contact,
            paid: p.paid ? 'Paid' : 'Unpaid',
          };
        });
        const xl = XLSX.utils.json_to_sheet(newLst);
        XLSX.utils.book_append_sheet(workBook, xl, `participants-${1 + index}`);
      }
    });

    XLSX.utils.book_append_sheet(workBook, workSheet, 'fellowships');
    XLSX.writeFile(workBook, `paid-list.xlsx`);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to mark as absent?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected?.name} from {selected?.fellowshipName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            autoFocus
          >
            Mark Absent
          </Button>
        </DialogActions>
      </Dialog>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem',
        }}
      >
        <Button variant="outlined" onClick={downloadExcel} color="primary">
          Export to Excel
        </Button>
      </div>
      
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
              if (row.fellowshipName === 'Korean Mission Team') {
                return null;
              }
              return (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
              key="total-row"
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                fontWeight: 'bold',
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                Total
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {totalPaid}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              >
                {totalUnpaid}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Divider sx={{ mt: '2rem' }} />
      
      {fellowships.map((fel) => {
        const participantsByFel = participantState.filter(
          (p) =>
            p.fellowshipName === fel &&
            (p.present === 'present' ||
              p.present === null ||
              p.present === undefined)
        );
        
        if (participantsByFel.length === 0) {
          return null;
        }
        
        return (
          <TableContainer
            key={fel}
            component={Paper}
            sx={{
              p: 4,
              maxWidth: '40rem',
              my: 4,
              mx: 'auto',
              boxShadow: '0px 0px 8px 8px rgba(0, 0, 0,0.2)',
            }}
          >
            <Typography variant="h6" sx={{ textDecoration: 'underline' }}>
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
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.contact}</TableCell>
                    <TableCell align="right">
                      <RadioPaid 
                        id={row._id} 
                        feePaid={row.feePaid || false} 
                        onUpdate={handlePaymentUpdate}
                      />
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