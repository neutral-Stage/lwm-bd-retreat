'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  CircularProgress,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { createRoom, updateRoom, deleteRoom, getAllRooms } from '../../lib/data-fetching';
import { Room, useAppContext, actions } from '../../contexts/AppContext';

interface EditRoomClientProps {
  initialRooms: Room[];
}

const EditRoomClient: React.FC<EditRoomClientProps> = ({ initialRooms }) => {
  const { state, dispatch } = useAppContext();

  // Use context state or fallback to initial data
  const rooms = state.rooms.length > 0 ? state.rooms : initialRooms;
  const [formValues, setFormValues] = useState({
    roomNo: '',
    capacity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Function to refresh room list from server
  const refreshRoomList = async () => {
    try {
      const freshRooms = await getAllRooms();
      dispatch(actions.setRooms(freshRooms));
    } catch (error) {
      console.error('Failed to refresh room list:', error);
    }
  };

  // Refresh room list on component mount to ensure fresh data
  useEffect(() => {
    refreshRoomList();
  }, []);

  // Calculate totals
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalBooked = rooms.reduce((sum, room) => sum + (room.booked || 0), 0);
  const totalAvailable = totalCapacity - totalBooked;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCapacityChange = (roomId: string, newCapacity: number) => {
    const targetRoom = rooms.find(room => room._id === roomId);
    if (targetRoom) {
      dispatch(actions.updateRoom({ ...targetRoom, capacity: newCapacity }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const roomNo = parseInt(formValues.roomNo);
      const capacity = parseInt(formValues.capacity);

      if (isNaN(roomNo) || isNaN(capacity)) {
        throw new Error('Please enter valid numbers for room number and capacity');
      }

      // Check if room number already exists
      if (rooms.some(room => room.roomNo === roomNo.toString())) {
        throw new Error('Room number already exists');
      }

      const newRoom = await createRoom({ roomNo, capacity });
      setFormValues({ roomNo: '', capacity: '' });
      setSuccess('Room created successfully!');
      await refreshRoomList(); // Refresh to get latest data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string, capacity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateRoom(roomId, { capacity });
      setSuccess('Room updated successfully!');
      await refreshRoomList(); // Refresh to get latest data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room');
      // Revert the change
      const originalRoom = initialRooms.find(room => room._id === roomId);
      if (originalRoom) {
        dispatch(actions.updateRoom(originalRoom));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDeleteDialogOpen(false);

    try {
      await deleteRoom(roomToDelete._id);
      setSuccess(`Room ${roomToDelete.roomNo} deleted successfully!`);
      setRoomToDelete(null);
      await refreshRoomList(); // Refresh to get latest data
    } catch (err) {
      console.error('Delete room error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Rooms
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Loading Modal */}
        <Modal open={loading}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Processing...</Typography>
          </Box>
        </Modal>

        {/* Create New Room Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Room
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  name="roomNo"
                  type="number"
                  value={formValues.roomNo}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formValues.capacity}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Create Room
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Rooms Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room Number</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Available Rooms</TableCell>
                <TableCell>Booked Rooms</TableCell>
                <TableCell>Update</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => {
                const available = room.capacity - (room.booked || 0);
                return (
                  <TableRow key={room._id}>
                    <TableCell>{room.roomNo}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={room.capacity}
                        onChange={(e) => handleCapacityChange(room._id, parseInt(e.target.value) || 0)}
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>{available}</TableCell>
                    <TableCell>{room.booked || 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdateRoom(room._id, room.capacity)}
                        disabled={loading}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(room)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Total Row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{totalCapacity}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{totalAvailable}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{totalBooked}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Confirm Room Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete Room {roomToDelete?.roomNo}?
              {roomToDelete && roomToDelete.booked > 0 && (
                <>
                  <br />
                  <strong>Warning:</strong> This room has {roomToDelete.booked} participant(s) currently assigned.
                  Deleting this room will unassign these participants.
                </>
              )}
              <br />
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete Room
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default EditRoomClient;