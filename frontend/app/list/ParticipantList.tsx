'use client';

import { useState, useRef } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { dhakaRetreatFellowships } from "../../data/fellowship";
import { Divider, Typography } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import EditModalForm from "../../components/EditModalForm.js";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useAppContext, actions } from '../../contexts/AppContext';
import { Participant } from '../../types';
import { deleteParticipant, updateParticipant } from '../../lib/data-fetching';

interface ParticipantListProps {
  participants: Participant[];
}

export default function ParticipantList({ participants: initialParticipants }: ParticipantListProps) {
  const { state, dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [filterValue, setFilterValue] = useState("all");
  const componentRef = useRef<HTMLDivElement>(null);

  // Use context participants or fallback to initial participants
  const participantState = state.participants.length > 0 ? state.participants : initialParticipants;

  const isPresent = (p: Participant) => p.present === "present";
  
  const male = participantState.filter(
    (p) => p.gender === "male" && isPresent(p)
  );
  const female = participantState.filter(
    (p) => p.gender === "female" && isPresent(p)
  );
  
  const getFellowship = dhakaRetreatFellowships.map((fel) => {
    const getCount = participantState.filter(
      (p) => p.fellowshipName === fel && isPresent(p)
    );

    const getMale = participantState.filter(
      (p) => p.fellowshipName === fel && p.gender === "male" && isPresent(p)
    );
    const getFemale = participantState.filter(
      (p) => p.fellowshipName === fel && p.gender === "female" && isPresent(p)
    );
    
    return {
      fellowshipName: fel,
      count: getCount.length,
      male: getMale.length,
      female: getFemale.length,
    };
  });

  const handleClickOpen = (participant: Participant) => {
    setSelectedParticipant(participant);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedParticipant(null);
  };

  const handleEditOpen = (participant: Participant) => {
    setSelectedParticipant(participant);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedParticipant(null);
  };

  const handleDelete = async () => {
    if (selectedParticipant) {
      try {
        await deleteParticipant(selectedParticipant._id);
        dispatch(actions.deleteParticipant(selectedParticipant._id));
        handleClose();
      } catch (error) {
        console.error('Error deleting participant:', error);
      }
    }
  };

  const handleUpdate = async (updatedData: Partial<Participant>) => {
    if (selectedParticipant) {
      try {
        const updated = await updateParticipant(selectedParticipant._id, updatedData);
        dispatch(actions.updateParticipant({ ...selectedParticipant, ...updated }));
        handleEditClose();
      } catch (error) {
        console.error('Error updating participant:', error);
      }
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  const filteredParticipants = participantState.filter((participant) => {
    if (filterValue === "all") return true;
    if (filterValue === "present") return participant.present === "present";
    if (filterValue === "absent") return participant.present === "absent";
    return participant.fellowshipName === filterValue;
  });

  return (
    <div ref={componentRef}>
      <Typography variant="h4" gutterBottom>
        Participant Management
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <RadioGroup
          row
          value={filterValue}
          onChange={handleFilterChange}
        >
          <FormControlLabel value="all" control={<Radio />} label="All" />
          <FormControlLabel value="present" control={<Radio />} label="Present" />
          <FormControlLabel value="absent" control={<Radio />} label="Absent" />
          {dhakaRetreatFellowships.map((fellowship) => (
            <FormControlLabel
              key={fellowship}
              value={fellowship}
              control={<Radio />}
              label={fellowship}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Reg No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Fellowship</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant._id}>
                  <TableCell>{participant._id}</TableCell>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.contact}</TableCell>
                  <TableCell>{participant.gender}</TableCell>
                  <TableCell>{participant.fellowshipName}</TableCell>
                  <TableCell>{participant.department}</TableCell>
                  <TableCell>
                    {typeof participant.roomNo === 'object' ? participant.roomNo?.roomNo || 'N/A' : participant.roomNo || 'N/A'}
                  </TableCell>
                  <TableCell>{participant.present}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditOpen(participant)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleClickOpen(participant)}
                      color="error"
                    >
                      <DeleteForeverOutlinedIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Statistics */}
      <Typography variant="h5" gutterBottom>
        Statistics
      </Typography>
      <Typography>Total Present: {participantState.filter(isPresent).length}</Typography>
      <Typography>Male: {male.length}</Typography>
      <Typography>Female: {female.length}</Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Fellowship Breakdown
      </Typography>
      {getFellowship.map((fellowship) => (
        <Typography key={fellowship.fellowshipName}>
          {fellowship.fellowshipName}: {fellowship.count} (M: {fellowship.male}, F: {fellowship.female})
        </Typography>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedParticipant?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      {selectedParticipant && (
        <EditModalForm
          selected={selectedParticipant}
          setSelected={setSelectedParticipant}
          handleClose={handleEditClose}
          participantState={participantState}
          setParticipantState={() => {}}
        />
      )}
    </div>
  );
}