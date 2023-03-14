import { BsPeopleFill } from "react-icons/bs";

export default {
  name: "roomNo",
  title: "Room No",
  type: "document",
  icon: BsPeopleFill,
  fields: [
    {
      name: "roomNo",
      title: "Room No",
      type: "number",
    },
    {
      name: "capacity",
      title: "Capacity",
      type: "number",
    },
  ],
  preview: {
    select: {
      title: "roomNo",
      subtitle: "capacity",
    },
  },
};
