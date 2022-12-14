import { BsPeopleFill } from "react-icons/bs";

export default {
  name: "participant",
  title: "Participant",
  type: "document",
  icon: BsPeopleFill,
  initialValue: {
    present: "present",
  },
  fields: [
    {
      name: "regNo",
      title: "Regetration Number",
      type: "string",
    },
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "salvationDate",
      title: "Salvation Date",
      type: "date",
      options: {
        dateFormat: "DD-MM-YYYY",
        calendarTodayLabel: "Today",
      },
    },
    {
      name: "contact",
      title: "Contact",
      type: "string",
    },
    {
      name: "fellowshipName",
      title: "Fellowship Name",
      type: "string",
    },
    {
      name: "gender",
      title: "Male/Female",
      type: "string",
      options: {
        list: [
          { title: "Male", value: "male" },
          { title: "Female", value: "female" },
        ],
        layout: "radio",
      },
    },
    {
      name: "present",
      title: "Present/Absent",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },

    {
      name: "remarks",
      title: "Remarks",
      type: "blockContent",
    },
    {
      name: "roomNo",
      title: "Room No",
      type: "number",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "contact",
      media: "image",
    },
  },
};
