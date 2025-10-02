import { BsPeopleFill } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "participant",
  title: "Participant",
  type: "document",
  icon: BsPeopleFill,
  initialValue: {
    present: "present",
  },
  fields: [
    defineField({
      name: "regNo",
      title: "Registration Number",
      type: "string",
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "isSaved",
      title: "Is Saved?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "invitedBy",
      title: "Invited By",
      type: "string",
      hidden: ({ document }) => document?.isSaved === true,
    }),
    defineField({
      name: "age",
      title: "Age",
      type: "number",
    }),
    defineField({
      name: "salvationDate",
      title: "Salvation Date",
      type: "date",
      options: {
        dateFormat: "DD-MM-YYYY",
      },
      hidden: ({ document }) => document?.isSaved === false,
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "string",
    }),
    defineField({
      name: "fellowshipName",
      title: "Fellowship Name",
      type: "string",
    }),
    defineField({
      name: "area",
      title: "Area",
      type: "string",
      description: "Geographic area or region",
    }),
    defineField({
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
    }),
    defineField({
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
    }),
    defineField({
      name: "guardianName",
      title: "Guardian Name",
      type: "string",
    }),
    defineField({
      name: "guardianContact",
      title: "Guardian Contact",
      type: "string",
    }),
    defineField({
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
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "remarks",
      title: "Remarks",
      type: "blockContent",
    }),
    defineField({
      title: "Room No",
      name: "roomNo",
      type: "reference",
      to: [{ type: "roomNo" }],
    }),
    defineField({
      title: "Fee Paid",
      name: "feePaid",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "contact",
      media: "image",
    },
  },
});
