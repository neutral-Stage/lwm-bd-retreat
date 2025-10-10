import * as XLSX from "xlsx";
import { Group, Counselling, Participant, Baptized } from "../types";

/**
 * Export groups data to Excel with separate worksheets for each group
 */
export function exportGroupsToExcel(groups: Group[]): void {
  if (groups.length === 0) {
    alert("No groups to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Create a summary worksheet with all groups
  const summaryData = groups.map((group, index) => ({
    "Group Name": group.name,
    Description: group.description || "",
    "Participants Count": group.participants?.length || 0,
    "Volunteers Count": group.volunteers?.length || 0,
    "Total Members":
      (group.participants?.length || 0) + (group.volunteers?.length || 0),
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Groups Summary");

  // Create individual worksheets for each group
  groups.forEach((group) => {
    const groupData = [];

    // Add group header information
    groupData.push(["Group Information"]);
    groupData.push(["Group Name:", group.name]);
    groupData.push(["Description:", group.description || ""]);
    groupData.push([""]); // Empty row

    // Add participants section
    if (group.participants && group.participants.length > 0) {
      groupData.push(["PARTICIPANTS"]);
      groupData.push([
        "Registration No",
        "Name",
        "Contact",
        "Age",
        "Gender",
        "Fellowship",
        "Area",
        "Department",
        "Session 1",
        "Session 2",
        "Session 3",
        "Session 4",
        "Session 5",
        "Session 6",
        "Notes",
      ]);

      group.participants.forEach((participant) => {
        // Find session attendance data for this participant
        const sessionData = group.sessionAttendanceParticipants?.find(
          (sp) => sp.participant._id === participant._id
        );

        groupData.push([
          participant.regNo || "",
          participant.name,
          participant.contact || "",
          participant.age || "",
          participant.gender,
          participant.fellowshipName || "",
          participant.area || "",
          participant.department || "",
          sessionData?.session1 || "unmarked",
          sessionData?.session2 || "unmarked",
          sessionData?.session3 || "unmarked",
          sessionData?.session4 || "unmarked",
          sessionData?.session5 || "unmarked",
          sessionData?.session6 || "unmarked",
          sessionData?.notes || "",
        ]);
      });

      groupData.push([""]); // Empty row
    }

    // Add volunteers section
    if (group.volunteers && group.volunteers.length > 0) {
      groupData.push(["VOLUNTEERS"]);
      groupData.push([
        "Registration No",
        "Name",
        "Contact",
        "Age",
        "Gender",
        "Fellowship",
        "Area",
        "Department",
        "Session 1",
        "Session 2",
        "Session 3",
        "Session 4",
        "Session 5",
        "Session 6",
        "Notes",
      ]);

      group.volunteers.forEach((volunteer) => {
        // Find session attendance data for this volunteer
        const sessionData = group.sessionAttendanceParticipants?.find(
          (sp) => sp.participant._id === volunteer._id
        );

        groupData.push([
          volunteer.regNo || "",
          volunteer.name,
          volunteer.contact || "",
          volunteer.age || "",
          volunteer.gender,
          volunteer.fellowshipName || "",
          volunteer.area || "",
          volunteer.department || "",
          sessionData?.session1 || "unmarked",
          sessionData?.session2 || "unmarked",
          sessionData?.session3 || "unmarked",
          sessionData?.session4 || "unmarked",
          sessionData?.session5 || "unmarked",
          sessionData?.session6 || "unmarked",
          sessionData?.notes || "",
        ]);
      });
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(groupData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Registration No
      { wch: 25 }, // Name
      { wch: 15 }, // Contact
      { wch: 8 }, // Age
      { wch: 10 }, // Gender
      { wch: 20 }, // Fellowship
      { wch: 15 }, // Area
      { wch: 15 }, // Department
      { wch: 12 }, // Session 1
      { wch: 12 }, // Session 2
      { wch: 12 }, // Session 3
      { wch: 12 }, // Session 4
      { wch: 12 }, // Session 5
      { wch: 12 }, // Session 6
      { wch: 30 }, // Notes
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    const sheetName = group.name.replace(/[^\w\s]/gi, "").substring(0, 31); // Excel sheet name limit
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate filename with current date
  const currentDate = new Date().toISOString().split("T")[0];
  const filename = `Groups_Export_${currentDate}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export counselling data to Excel with separate worksheets for each counselling team
 */
export function exportCounsellingToExcel(counsellings: Counselling[]): void {
  if (counsellings.length === 0) {
    alert("No counselling teams to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Create a summary worksheet with all counselling teams
  const summaryData = counsellings.map((counselling) => ({
    "Team Name": counselling.name,
    Counsellor: counselling.counsellor?.name || "",
    "Participants Count": counselling.participants?.length || 0,
    Status: counselling.status,
    "Meeting Schedule": counselling.meetingSchedule || "",
    Location: counselling.location || "",
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Counselling Summary");

  // Create individual worksheets for each counselling team
  counsellings.forEach((counselling) => {
    const teamData = [];

    // Add team header information
    teamData.push(["Counselling Team Information"]);
    teamData.push(["Team Name:", counselling.name]);
    teamData.push(["Counsellor:", counselling.counsellor?.name || ""]);
    teamData.push(["Description:", counselling.description || ""]);
    teamData.push(["Status:", counselling.status]);
    teamData.push(["Meeting Schedule:", counselling.meetingSchedule || ""]);
    teamData.push(["Location:", counselling.location || ""]);
    teamData.push(["Notes:", counselling.notes || ""]);
    teamData.push([""]); // Empty row

    // Add participants section
    if (counselling.participants && counselling.participants.length > 0) {
      teamData.push(["PARTICIPANTS"]);
      teamData.push([
        "Registration No",
        "Name",
        "Contact",
        "Age",
        "Gender",
        "Fellowship",
        "Status",
        "Comments",
      ]);

      counselling.participants.forEach((counsellingParticipant) => {
        const participant = counsellingParticipant.participant;
        teamData.push([
          participant.regNo || "",
          participant.name,
          participant.contact || "",
          participant.age || "",
          participant.gender,
          participant.fellowshipName || "",
          counsellingParticipant.status,
          counsellingParticipant.comments || "",
        ]);
      });
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(teamData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Registration No
      { wch: 25 }, // Name
      { wch: 15 }, // Contact
      { wch: 8 }, // Age
      { wch: 10 }, // Gender
      { wch: 20 }, // Fellowship
      { wch: 12 }, // Status
      { wch: 30 }, // Comments
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    const sheetName = counselling.name
      .replace(/[^\w\s]/gi, "")
      .substring(0, 31); // Excel sheet name limit
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate filename with current date
  const currentDate = new Date().toISOString().split("T")[0];
  const filename = `Counselling_Export_${currentDate}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export both groups and counselling data to a single Excel file
 */
export function exportAllTeamsToExcel(
  groups: Group[],
  counsellings: Counselling[]
): void {
  if (groups.length === 0 && counsellings.length === 0) {
    alert("No data to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Create groups summary if there are groups
  if (groups.length > 0) {
    const groupsSummaryData = groups.map((group, index) => ({
      "Group Name": group.name,
      Description: group.description || "",
      "Participants Count": group.participants?.length || 0,
      "Volunteers Count": group.volunteers?.length || 0,
      "Total Members":
        (group.participants?.length || 0) + (group.volunteers?.length || 0),
    }));

    const groupsSummarySheet = XLSX.utils.json_to_sheet(groupsSummaryData);
    XLSX.utils.book_append_sheet(
      workbook,
      groupsSummarySheet,
      "Groups Summary"
    );

    // Add individual group worksheets
    groups.forEach((group) => {
      const groupData = [];

      groupData.push(["Group Information"]);
      groupData.push(["Group Name:", group.name]);
      groupData.push(["Description:", group.description || ""]);
      groupData.push([""]);

      if (group.participants && group.participants.length > 0) {
        groupData.push(["PARTICIPANTS"]);
        groupData.push([
          "Registration No",
          "Name",
          "Contact",
          "Age",
          "Gender",
          "Fellowship",
          "Area",
          "Department",
          "Session 1",
          "Session 2",
          "Session 3",
          "Session 4",
          "Session 5",
          "Session 6",
          "Notes",
        ]);

        group.participants.forEach((participant) => {
          // Find session attendance data for this participant
          const sessionData = group.sessionAttendanceParticipants?.find(
            (sp) => sp.participant._id === participant._id
          );

          groupData.push([
            participant.regNo || "",
            participant.name,
            participant.contact || "",
            participant.age || "",
            participant.gender,
            participant.fellowshipName || "",
            participant.area || "",
            participant.department || "",
            sessionData?.session1 || "unmarked",
            sessionData?.session2 || "unmarked",
            sessionData?.session3 || "unmarked",
            sessionData?.session4 || "unmarked",
            sessionData?.session5 || "unmarked",
            sessionData?.session6 || "unmarked",
            sessionData?.notes || "",
          ]);
        });

        groupData.push([""]);
      }

      if (group.volunteers && group.volunteers.length > 0) {
        groupData.push(["VOLUNTEERS"]);
        groupData.push([
          "Registration No",
          "Name",
          "Contact",
          "Age",
          "Gender",
          "Fellowship",
          "Area",
          "Department",
          "Session 1",
          "Session 2",
          "Session 3",
          "Session 4",
          "Session 5",
          "Session 6",
          "Notes",
        ]);

        group.volunteers.forEach((volunteer) => {
          // Find session attendance data for this volunteer
          const sessionData = group.sessionAttendanceParticipants?.find(
            (sp) => sp.participant._id === volunteer._id
          );

          groupData.push([
            volunteer.regNo || "",
            volunteer.name,
            volunteer.contact || "",
            volunteer.age || "",
            volunteer.gender,
            volunteer.fellowshipName || "",
            volunteer.area || "",
            volunteer.department || "",
            sessionData?.session1 || "unmarked",
            sessionData?.session2 || "unmarked",
            sessionData?.session3 || "unmarked",
            sessionData?.session4 || "unmarked",
            sessionData?.session5 || "unmarked",
            sessionData?.session6 || "unmarked",
            sessionData?.notes || "",
          ]);
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(groupData);
      worksheet["!cols"] = [
        { wch: 15 }, // Registration No
        { wch: 25 }, // Name
        { wch: 15 }, // Contact
        { wch: 8 }, // Age
        { wch: 10 }, // Gender
        { wch: 20 }, // Fellowship
        { wch: 15 }, // Area
        { wch: 15 }, // Department
        { wch: 12 }, // Session 1
        { wch: 12 }, // Session 2
        { wch: 12 }, // Session 3
        { wch: 12 }, // Session 4
        { wch: 12 }, // Session 5
        { wch: 12 }, // Session 6
        { wch: 30 }, // Notes
      ];

      const sheetName = `Group_${group.name
        .replace(/[^\w\s]/gi, "")
        .substring(0, 25)}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  }

  // Create counselling summary if there are counselling teams
  if (counsellings.length > 0) {
    const counsellingSummaryData = counsellings.map((counselling) => ({
      "Team Name": counselling.name,
      Counsellor: counselling.counsellor?.name || "",
      "Participants Count": counselling.participants?.length || 0,
      Status: counselling.status,
      "Meeting Schedule": counselling.meetingSchedule || "",
      Location: counselling.location || "",
    }));

    const counsellingSummarySheet = XLSX.utils.json_to_sheet(
      counsellingSummaryData
    );
    XLSX.utils.book_append_sheet(
      workbook,
      counsellingSummarySheet,
      "Counselling Summary"
    );

    // Add individual counselling team worksheets
    counsellings.forEach((counselling) => {
      const teamData = [];

      teamData.push(["Counselling Team Information"]);
      teamData.push(["Team Name:", counselling.name]);
      teamData.push(["Counsellor:", counselling.counsellor?.name || ""]);
      teamData.push(["Description:", counselling.description || ""]);
      teamData.push(["Status:", counselling.status]);
      teamData.push(["Meeting Schedule:", counselling.meetingSchedule || ""]);
      teamData.push(["Location:", counselling.location || ""]);
      teamData.push(["Notes:", counselling.notes || ""]);
      teamData.push([""]);

      if (counselling.participants && counselling.participants.length > 0) {
        teamData.push(["PARTICIPANTS"]);
        teamData.push([
          "Registration No",
          "Name",
          "Contact",
          "Age",
          "Gender",
          "Fellowship",
          "Status",
          "Comments",
        ]);

        counselling.participants.forEach((counsellingParticipant) => {
          const participant = counsellingParticipant.participant;
          teamData.push([
            participant.regNo || "",
            participant.name,
            participant.contact || "",
            participant.age || "",
            participant.gender,
            participant.fellowshipName || "",
            counsellingParticipant.status,
            counsellingParticipant.comments || "",
          ]);
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(teamData);
      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 8 },
        { wch: 10 },
        { wch: 20 },
        { wch: 12 },
        { wch: 30 },
      ];

      const sheetName = `Counselling_${counselling.name
        .replace(/[^\w\s]/gi, "")
        .substring(0, 20)}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  }

  // Generate filename with current date
  const currentDate = new Date().toISOString().split("T")[0];
  const filename = `All_Teams_Export_${currentDate}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export baptized data to Excel
 */
export function exportBaptizedToExcel(baptized: Baptized[]): void {
  if (baptized.length === 0) {
    alert("No baptized records to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Create summary data
  const summaryData = [
    {
      "Total Records": baptized.length,
      "Pending": baptized.filter((b) => b.status === "pending").length,
      "Completed": baptized.filter((b) => b.status === "done").length,
    },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Create detailed data
  const detailedData = baptized.map((record) => ({
    "Registration No": record.participant.regNo || "",
    Name: record.participant.name,
    Contact: record.participant.contact || "",
    Fellowship: record.participant.fellowshipName || "",
    Gender: record.participant.gender,
    Department: record.participant.department || "",
    Status: record.status,
    "Baptism Date": record.baptismDate
      ? new Date(record.baptismDate).toLocaleDateString()
      : "",
    "Baptized By": record.baptizedBy || "",
    Location: record.location || "",
    Notes: record.notes || "",
    "Created Date": new Date(record._createdAt).toLocaleDateString(),
  }));

  const detailedSheet = XLSX.utils.json_to_sheet(detailedData);

  // Set column widths
  detailedSheet["!cols"] = [
    { wch: 15 }, // Registration No
    { wch: 25 }, // Name
    { wch: 15 }, // Contact
    { wch: 20 }, // Fellowship
    { wch: 10 }, // Gender
    { wch: 15 }, // Department
    { wch: 12 }, // Status
    { wch: 15 }, // Baptism Date
    { wch: 20 }, // Baptized By
    { wch: 20 }, // Location
    { wch: 30 }, // Notes
    { wch: 15 }, // Created Date
  ];

  XLSX.utils.book_append_sheet(workbook, detailedSheet, "Baptized List");

  // Create separate sheets for pending and completed
  const pendingRecords = baptized.filter((b) => b.status === "pending");
  const completedRecords = baptized.filter((b) => b.status === "done");

  if (pendingRecords.length > 0) {
    const pendingData = pendingRecords.map((record) => ({
      "Registration No": record.participant.regNo || "",
      Name: record.participant.name,
      Contact: record.participant.contact || "",
      Fellowship: record.participant.fellowshipName || "",
      Gender: record.participant.gender,
      Department: record.participant.department || "",
      Notes: record.notes || "",
      "Added Date": new Date(record._createdAt).toLocaleDateString(),
    }));

    const pendingSheet = XLSX.utils.json_to_sheet(pendingData);
    pendingSheet["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, pendingSheet, "Pending");
  }

  if (completedRecords.length > 0) {
    const completedData = completedRecords.map((record) => ({
      "Registration No": record.participant.regNo || "",
      Name: record.participant.name,
      Contact: record.participant.contact || "",
      Fellowship: record.participant.fellowshipName || "",
      Gender: record.participant.gender,
      Department: record.participant.department || "",
      "Baptism Date": record.baptismDate
        ? new Date(record.baptismDate).toLocaleDateString()
        : "",
      "Baptized By": record.baptizedBy || "",
      Location: record.location || "",
      Notes: record.notes || "",
    }));

    const completedSheet = XLSX.utils.json_to_sheet(completedData);
    completedSheet["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, completedSheet, "Completed");
  }

  // Generate filename with current date
  const currentDate = new Date().toISOString().split("T")[0];
  const filename = `Baptized_Export_${currentDate}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);
}
