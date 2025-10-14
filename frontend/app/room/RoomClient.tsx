"use client";

import { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Divider, Typography, TextField, Box } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/navigation";
// Removed static fellowship import - now using dynamic grouping
import { updateParticipantRoom } from "../../lib/data-fetching";
import { Participant, Room } from "../../types/index";
import { useAppContext, actions } from "../../contexts/AppContext";

interface RoomSelectionProps {
  value?: string;
  room: Room[];
  id: string;
  participantId: string;
  onRoomUpdate: () => void;
}

const RoomSelection = ({
  value,
  room,
  id,
  participantId,
  onRoomUpdate,
}: RoomSelectionProps) => {
  const [loading, setLoading] = useState(false);

  // Find the selected room or set to null
  const selectedRoom = value ? room.find((r) => r._id === value) : null;

  const handleChangeRoom = async (event: any, newValue: Room | null) => {
    const previousValue = selectedRoom;
    setLoading(true);

    try {
      if (!newValue) {
        // Remove room assignment
        await updateParticipantRoom(participantId, null);
      } else {
        // Assign to new room using the room ID as reference
        await updateParticipantRoom(participantId, newValue._id);
      }

      // Trigger refresh to get updated data from server
      onRoomUpdate();
    } catch (error) {
      console.error("Failed to update room assignment:", error);
      alert("Failed to update room assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      size="small"
      value={selectedRoom}
      onChange={handleChangeRoom}
      options={room}
      getOptionLabel={(option) =>
        `Room ${option.roomNo} - Capacity: ${option.capacity}, Available: ${
          option.capacity - option.booked
        }`
      }
      getOptionDisabled={(option) => option.capacity === option.booked}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Room"
          placeholder="Search room..."
        />
      )}
      disabled={loading}
      isOptionEqualToValue={(option, value) =>
        value ? option._id === value._id : false
      }
      sx={{ minWidth: 250 }}
    />
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
  const router = useRouter();

  // Use server data directly (no context needed for room management)
  const participantState = initialParticipants;
  const roomState = initialRooms;

  const totalCapacity = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.capacity,
    0
  );

  const totalBooked = roomState?.reduce(
    (previousValue, currentValue) => previousValue + currentValue.booked,
    0
  );

  // Handle room update by refreshing the page data
  const handleRoomUpdate = () => {
    router.refresh();
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
                    <TableCell align="right">
                      {typeof row.roomNo === "string"
                        ? row.roomNo
                        : typeof row.roomNo === "object" && row.roomNo?.roomNo
                        ? row.roomNo.roomNo
                        : ""}
                    </TableCell>
                    <TableCell align="right">
                      <RoomSelection
                        value={row.roomRef || undefined}
                        room={roomState}
                        id={row._id}
                        participantId={row._id}
                        onRoomUpdate={handleRoomUpdate}
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
