"use client";

import { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Divider, Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
// Removed static fellowship import - now using dynamic grouping
import { updateParticipant } from "../../lib/data-fetching";
import { Participant, Room } from "../../types/index";
import { useAppContext, actions } from "../../contexts/AppContext";

interface RoomSelectionProps {
  value?: string;
  room: Room[];
  id: string;
  updateRoom: (id: string) => void;
  updateParticipant: (targetId: string, participantId: string) => void;
  diselection: (roomId: string, participantId: string) => void;
}

const RoomSelection = ({
  value,
  room,
  id,
  updateRoom,
  updateParticipant: updateParticipantLocal,
  diselection,
}: RoomSelectionProps) => {
  const [selected, setSelected] = useState(value ?? "none");

  const handleChangeRoom = async (
    e: SelectChangeEvent<string>,
    participantId: string
  ) => {
    const targetValue = e.target.value as string;
    setSelected(targetValue);

    if (targetValue && targetValue === "none") {
      if (value) {
        diselection(value, participantId);
      }

      try {
        await updateParticipant(participantId, { roomNo: undefined });
      } catch (error) {
        console.error("Failed to remove room assignment:", error);
        // Revert on error
        setSelected(value ?? "none");
      }
    }

    if (targetValue && targetValue !== "none") {
      updateRoom(targetValue);
      updateParticipantLocal(targetValue, participantId);

      try {
        const targetRoom = room.find((r) => r._id === targetValue);
        await updateParticipant(participantId, {
          roomNo: { roomNo: targetRoom?.roomNo || "" },
        });
      } catch (error) {
        console.error("Failed to update room assignment:", error);
        // Revert on error
        setSelected(value ?? "none");
      }
    }
  };

  return (
    <Select
      labelId="room-select-label"
      id="room-select"
      label="Room Selection"
      name="roomSelection"
      value={selected}
      onChange={(e) => handleChangeRoom(e, id)}
      size="small"
    >
      <MenuItem value="none">No Room Selected</MenuItem>
      {room.map((r) => (
        <MenuItem key={r._id} value={r._id} disabled={r.capacity === r.booked}>
          Room No: {r.roomNo}, Capacity: {r.capacity}, Available:{" "}
          {r.capacity - r.booked}
        </MenuItem>
      ))}
    </Select>
  );
};

interface RoomClientProps {
  participants: Participant[];
  rooms: Room[];
}

export default function RoomClient({
  participants: initialParticipants,
  rooms: initialRooms,
}: RoomClientProps) {
  const { state, dispatch } = useAppContext();

  // Use context state or fallback to initial data
  const participantState =
    state.participants.length > 0 ? state.participants : initialParticipants;
  const roomState = state.rooms.length > 0 ? state.rooms : initialRooms;

  const totalCapacity = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.capacity,
    0
  );

  const totalBooked = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.booked,
    0
  );

  const updateParticipantRoom = (
    targetRoomId: string,
    participantId: string
  ) => {
    const findRoom = roomState.find((obj) => obj._id === targetRoomId);
    if (!findRoom) return;

    const updatedParticipants = participantState.map((obj) => {
      if (obj._id === participantId) {
        return {
          ...obj,
          room: findRoom.roomNo,
          roomNo: {
            roomNo: findRoom.roomNo,
          },
        };
      }
      return obj;
    });

    // Update context state
    updatedParticipants.forEach((participant) => {
      if (participant._id === participantId) {
        dispatch(actions.updateParticipant(participant));
      }
    });
  };

  const updateRoomBooking = (roomId: string) => {
    const updatedRoom = roomState.find((room) => room._id === roomId);
    if (updatedRoom) {
      dispatch(
        actions.updateRoom({ ...updatedRoom, booked: updatedRoom.booked + 1 })
      );
    }
  };

  const diselection = (roomId: string, participantId: string) => {
    // Update room booking count
    const targetRoom = roomState.find((room) => room._id === roomId);
    if (targetRoom && targetRoom.booked > 0) {
      dispatch(
        actions.updateRoom({ ...targetRoom, booked: targetRoom.booked - 1 })
      );
    }

    // Update participant room assignment
    const targetParticipant = participantState.find(
      (p) => p._id === participantId
    );
    if (targetParticipant) {
      dispatch(
        actions.updateParticipant({
          ...targetParticipant,
          room: undefined,
          roomNo: undefined,
        })
      );
    }
  };

  // Filter participants to only include females and children (exclude males)
  const roomEligibleParticipants = participantState.filter(
    (p) => p.gender === "female" || p.department === "child"
  );

  // Get unique fellowship names from room-eligible participants and sort them
  const fellowshipNames = Array.from(
    new Set(roomEligibleParticipants.map((p) => p.fellowshipName))
  )
    .filter((name) => name && name.trim() !== "") // Remove empty/null fellowship names
    .sort();

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        component={Paper}
        sx={{
          p: 4,
          maxWidth: "60rem",
          my: 4,
          mx: "auto",
          boxShadow: "0px 0px 8px 8px rgba(0, 0, 0,0.2)",
        }}
      >
        <Table aria-label="room summary table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Room No</TableCell>
              <TableCell align="center">Capacity</TableCell>
              <TableCell align="center">Available Room</TableCell>
              <TableCell align="center">Participants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomState.map((row) => (
              <TableRow
                key={row._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.roomNo}
                </TableCell>
                <TableCell align="center">{row.capacity}</TableCell>
                <TableCell align="center">
                  {row.capacity - row.booked}
                </TableCell>
                <TableCell align="center">{row.booked}</TableCell>
              </TableRow>
            ))}

            <TableRow
              key="total-row"
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                fontWeight: "bold",
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                Total
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {totalCapacity}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {totalCapacity - totalBooked}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {totalBooked}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ mt: "2rem" }} />

      {fellowshipNames.map((fellowshipName) => {
        const participantsByFel = roomEligibleParticipants.filter(
          (p) => p.fellowshipName === fellowshipName
        );

        if (participantsByFel.length === 0) {
          return null;
        }

        const currentYear = new Date().getFullYear();

        return (
          <TableContainer
            key={fellowshipName}
            component={Paper}
            sx={{
              p: 4,
              maxWidth: "80rem",
              my: 4,
              mx: "auto",
              boxShadow: "0px 0px 8px 8px rgba(0, 0, 0,0.2)",
            }}
          >
            <Typography
              variant="h2"
              sx={{ textDecoration: "underline", mb: 2 }}
            >
              {fellowshipName}
            </Typography>
            <Table
              aria-label="fellowship participants table"
              size="small"
              sx={{ p: 4 }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Gender</TableCell>
                  <TableCell align="right">Department</TableCell>
                  <TableCell align="right">Age</TableCell>
                  <TableCell align="right">Present</TableCell>
                  <TableCell align="right">Room</TableCell>
                  <TableCell align="right">Select Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participantsByFel.map((row) => (
                  <TableRow
                    key={row._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: row.department === "child" ? 800 : "normal",
                      }}
                    >
                      {row.gender}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: row.department === "child" ? 800 : "normal",
                      }}
                    >
                      {row.department}
                    </TableCell>
                    <TableCell align="right">{row.age || "N/A"}</TableCell>
                    <TableCell align="right">{row.present || ""}</TableCell>
                    <TableCell align="right">{row.room || ""}</TableCell>
                    <TableCell align="right">
                      <RoomSelection
                        value={
                          typeof row?.roomNo === "object"
                            ? row?.roomNo?.roomNo
                            : row?.roomNo
                        }
                        room={roomState}
                        id={row._id}
                        updateParticipant={updateParticipantRoom}
                        updateRoom={updateRoomBooking}
                        diselection={diselection}
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
