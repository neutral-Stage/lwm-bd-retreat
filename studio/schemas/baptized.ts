import { BsDropletFill } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "baptized",
  title: "Baptized",
  type: "document",
  icon: BsDropletFill,
  fields: [
    defineField({
      name: "participant",
      title: "Participant",
      type: "reference",
      to: [{ type: "participant" }],
      validation: (Rule) => Rule.required(),
      description: "The participant to be baptized",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Done", value: "done" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "baptismDate",
      title: "Baptism Date",
      type: "date",
      options: {
        dateFormat: "DD-MM-YYYY",
      },
      description:
        "Date when the baptism was performed (for completed baptisms)",
    }),
    defineField({
      name: "baptizedBy",
      title: "Baptized By",
      type: "string",
      description: "Name of the person who performed the baptism",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Location where the baptism was performed",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
      description: "Additional notes about the baptism",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      participantName: "participant.name",
      status: "status",
      baptismDate: "baptismDate",
    },
    prepare(selection) {
      const { participantName, status, baptismDate } = selection;
      const statusIcon = status === "done" ? "✅" : "⏳";
      const subtitle =
        status === "done" && baptismDate
          ? `Baptized on ${baptismDate}`
          : `Status: ${status}`;

      return {
        title: `${statusIcon} ${participantName || "Unknown Participant"}`,
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
    {
      title: "Created Date",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});
