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
      name: "isSaved",
      title: "Is Saved?",
      type: "boolean",
    },
    {
      name: "birthYear",
      title: "Birth year",
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
      name: "department",
      title: "Department",
      type: "string",
      options: {
        list: [
          { title: "Adult", value: "adult" },
          { title: "Child", value: "child" },
          { title: "Youth", value: "youth" },
          { title: "Volunteer", value: "volunteer" },
          { title: "Senior (Older than 65 yrs)", value: "senior" },
        ],
      },
    },
    {
      name: "guardianName",
      title: "Guardian Name",
      type: "string",
    },
    {
      name: "guardianContact",
      title: "Guardian Contact",
      type: "string",
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
      title: "Room No",
      name: "roomNo",
      type: "reference",
      to: [{ type: "roomNo" }],
    },
    {
      title: "Fee Paid",
      name: "feePaid",
      type: "boolean",
      initialValue: false,
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
