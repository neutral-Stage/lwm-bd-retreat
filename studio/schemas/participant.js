import { BsPeopleFill } from "react-icons/bs";

export default {
  name: "participant",
  title: "Participant",
  type: "document",
  icon: BsPeopleFill,

  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "birthDate",
      title: "Birth Date",
      type: "date",
      options: {
        dateFormat: "DD-MM-YYYY",
        calendarTodayLabel: "Today",
      },
    },
    {
      name: "address",
      title: "Address",
      description: "Region / Location",

      type: "string",
    },
    {
      name: "email",
      title: "Email",

      type: "string",
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
      name: "guestOrSaved",
      title: "Guest or Saved",
      type: "string",
      options: {
        list: [
          { title: "Guest", value: "guest" },
          { title: "Saved", value: "saved" },
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
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "contact",
      media: "image",
    },
  },
};
