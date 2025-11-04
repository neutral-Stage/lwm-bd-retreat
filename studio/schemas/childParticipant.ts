import { BsFillPeopleFill } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "childParticipant",
  title: "Child Participant",
  type: "document",
  icon: BsFillPeopleFill,
  fields: [
    defineField({
      name: "participant",
      title: "Participant",
      type: "reference",
      to: [{ type: "participant" }],
      validation: (Rule) => Rule.required(),
      description: "The participant to add child-specific information to",
    }),
    defineField({
      name: "isSaved",
      title: "Is Saved?",
      type: "string",
      options: {
        list: [
          { title: "Saved", value: "saved" },
          { title: "Born Again", value: "bornAgain" },
          { title: "Confused", value: "confused" },
          { title: "Not Saved", value: "notSaved" },
        ],
        layout: "radio",
      },
      initialValue: "confused",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "baptism",
      title: "Baptism",
      type: "boolean",
      initialValue: false,
      description: "Whether the child has been baptized",
    }),
    defineField({
      name: "comments",
      title: "Comments",
      type: "text",
      rows: 4,
      description: "Additional comments about the child participant",
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
      isSaved: "isSaved",
      baptism: "baptism",
    },
    prepare(selection) {
      const { participantName, isSaved, baptism } = selection;
      const savedIcon =
        isSaved === "saved" ? "✅" : isSaved === "bornAgain" ? "🎆" : "❓";
      const baptismIcon = baptism ? "💧" : "🚫";
      const subtitle = `${savedIcon} ${isSaved} | ${baptismIcon} Baptized`;

      return {
        title: participantName || "Unknown Participant",
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Is Saved Status",
      name: "isSavedAsc",
      by: [{ field: "isSaved", direction: "asc" }],
    },
    {
      title: "Baptism Status",
      name: "baptismDesc",
      by: [{ field: "baptism", direction: "desc" }],
    },
    {
      title: "Created Date",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});
