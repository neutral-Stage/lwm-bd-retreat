import { BsPersonCheck } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "counsellingParticipant",
  title: "Counselling Participant",
  type: "object",
  icon: BsPersonCheck,
  fields: [
    defineField({
      name: "participant",
      title: "Participant",
      type: "reference",
      to: [{ type: "participant" }],
      validation: (Rule) => Rule.required(),
      options: {
        filter: "department != 'volunteer'",
      },
      description: "The participant in this counselling session",
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
      description: "Current status of the counselling for this participant",
    }),
    defineField({
      name: "comments",
      title: "Comments",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(1000),
      description: "Notes and comments about this participant's counselling progress",
    }),
  ],
  preview: {
    select: {
      participantName: "participant.name",
      status: "status",
      comments: "comments",
    },
    prepare(selection) {
      const { participantName, status, comments } = selection;
      const statusEmoji = status === "done" ? "✅" : "⏳";
      const shortComments = comments && comments.length > 50
        ? comments.substring(0, 50) + "..."
        : comments;

      return {
        title: participantName || "Unknown Participant",
        subtitle: `${statusEmoji} ${status} ${shortComments ? `• ${shortComments}` : ""}`,
      };
    },
  },
});