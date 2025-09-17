'use client';

import { useState } from "react";

import { client } from "../service/sanityClient";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function RoomSelection(props) {
  const { value, room, id, updateRoom, updateParticipant, diselection } = props;

  const [selected, setSelected] = useState(value ?? "none");
  const handleChangeRoom = async (e, id) => {
    const targetValue = e.target.value;
    setSelected(targetValue);
    if (targetValue && targetValue === "none") {
      if (value) {
        diselection(value, id);
      }
      await client
        .patch(id) // Document ID to patch
        .set({ roomNo: null }) // Increment field by count
        .commit() // Perform the patch and return a promise
        .then((updatedBike) => {
          console.log("Hurray, the participant is updated! New document:");
          console.log(updatedBike);
        })
        .catch((err) => {
          console.error("Oh no, the update failed: ", err.message);
        });
    }
    if (targetValue && targetValue !== "none") {
      updateRoom(targetValue);
      updateParticipant(targetValue, id);

      await client
        .patch(id) // Document ID to patch
        .set({ roomNo: { _ref: targetValue, _type: "reference" } }) // Increment field by count
        .commit() // Perform the patch and return a promise
        .then((updatedBike) => {
          console.log("Hurray, the participant is updated! New document:");
          console.log(updatedBike);
        })
        .catch((err) => {
          console.error("Oh no, the update failed: ", err.message);
        });
    }
  };

  return (
    <Select
      labelId="demo-simple-select-helper-label"
      id="demo-simple-select-helper"
      label="Fellowship Name"
      name="fellowshipName"
      value={selected}
      onChange={(e) => handleChangeRoom(e, id)}
    >
      <MenuItem value="none">No Room Selected </MenuItem>
      {room.map((r) => {
        return (
          <MenuItem
            key={r._id}
            value={r._id}
            disabled={r.capacity === r.booked}
          >
            Room No: {r.roomNo} , Capacity: {r.capacity} , Available:{" "}
            {r.capacity - r.booked}
          </MenuItem>
        );
      })}
    </Select>
  );
}
