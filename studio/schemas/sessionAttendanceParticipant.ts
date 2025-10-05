import { BsCalendarCheck } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "sessionAttendanceParticipant",
  title: "Session Attendance Participant",
  type: "object",
  icon: BsCalendarCheck,
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
      description: "The participant whose attendance is being tracked",
    }),
    defineField({
      name: "session1",
      title: "Session 1",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
      initialValue: "absent",
      validation: (Rule) => Rule.required(),
      description: "Attendance status for Session 1",
    }),
    defineField({
      name: "session2",
      title: "Session 2",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
      initialValue: "absent",
      validation: (Rule) => Rule.required(),
      description: "Attendance status for Session 2",
    }),
    defineField({
      name: "session3",
      title: "Session 3",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
      initialValue: "absent",
      validation: (Rule) => Rule.required(),
      description: "Attendance status for Session 3",
    }),
    defineField({
      name: "session4",
      title: "Session 4",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
      initialValue: "absent",
      validation: (Rule) => Rule.required(),
      description: "Attendance status for Session 4",
    }),
    defineField({
      name: "session5",
      title: "Session 5",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
      initialValue: "absent",
      validation: (Rule) => Rule.required(),
      description: "Attendance status for Session 5",
    }),
    defineField({
      name: "session6",
      title: "Session 6",
      type: "string",
      options: {
        list: [
          { title: "Present", value: "present" },
          { title: "Absent", value: "absent" },
        ],
        layout: "radio",
      },
      initialValue: "absent",
      validation: (Rule) => Rule.required(),
      description: "Attendance status for Session 6",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(1000),
      description: "Additional notes about this participant's attendance",
    }),
  ],
  preview: {
    select: {
      participantName: "participant.name",
      session1: "session1",
      session2: "session2",
      session3: "session3",
      session4: "session4",
      session5: "session5",
      session6: "session6",
      notes: "notes",
    },
    prepare(selection) {
      const { participantName, session1, session2, session3, session4, session5, session6, notes } = selection;

      // Count present sessions
      const sessions = [session1, session2, session3, session4, session5, session6];
      const presentCount = sessions.filter(session => session === "present").length;
      const totalSessions = 6;

      // Create attendance summary
      const attendanceEmojis = sessions.map(session => session === "present" ? "✅" : "❌").join("");
      const shortNotes = notes && notes.length > 30
        ? notes.substring(0, 30) + "..."
        : notes;

      return {
        title: participantName || "Unknown Participant",
        subtitle: `${presentCount}/${totalSessions} sessions ${attendanceEmojis} ${shortNotes ? `• ${shortNotes}` : ""}`,
      };
    },
  },
});