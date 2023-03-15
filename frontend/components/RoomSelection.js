import { useState } from "react";

import { client } from "../service/sanityClient";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function RoomSelection(props) {
  const { value, room, id, handleRoom, handleParticipant } = props;
  const [selected, setSelected] = useState(value ?? "none");
  const handleChangeRoom = async (e, id) => {
    const value = e.target.value;
    setSelected(value);
    if (value && value === "none") {
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
    if (value && value !== "none")
      await client
        .patch(id) // Document ID to patch
        .set({ roomNo: { _ref: value, _type: "reference" } }) // Increment field by count
        .commit() // Perform the patch and return a promise
        .then((updatedBike) => {
          console.log("Hurray, the participant is updated! New document:");
          console.log(updatedBike);
        })
        .catch((err) => {
          console.error("Oh no, the update failed: ", err.message);
        });

    await client
      .fetch(
        '*[_type == "participant" && gender == "female"]{...,"room":roomNo->roomNo}| order(_createdAt desc)'
      )
      .then((data) => handleParticipant(data));
    await client
      .fetch(
        '*[_type == "roomNo" ]{_id,capacity,roomNo, "booked": count(*[_type == "participant" && roomNo._ref == ^._id]) }| order(roomNo desc)'
      )
      .then((data) => handleRoom(data));
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
