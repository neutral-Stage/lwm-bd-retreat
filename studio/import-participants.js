const fs = require("fs");
const path = require("path");

// Read the CSV file
const csvPath = path.join(
  __dirname,
  "October-Retreat-perticepant-Registration-list.xlsx - New Guest List.csv"
);
const csvContent = fs.readFileSync(csvPath, "utf-8");

// Parse CSV
const lines = csvContent.split("\n");
const participants = [];
const fellowshipCounts = {}; // Track count per fellowship for unique IDs

// Helper function to generate fellowship code
function generateFellowshipCode(fellowship) {
  if (!fellowship || fellowship === "N/A") {
    return "OTH"; // Other
  }

  // Extract first 3 characters and convert to uppercase
  const code = fellowship
    .trim()
    .replace(/[^a-zA-Z]/g, "") // Remove non-alphabetic chars
    .substring(0, 3)
    .toUpperCase();

  return code || "OTH";
}

// Helper function to parse age
function parseAge(ageStr) {
  if (!ageStr) return null;
  const match = ageStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Helper function to determine department
function determineDepartment(genderStr, age) {
  if (!genderStr) return "adult";

  const gender = genderStr.toLowerCase().trim();

  if (gender === "children" || gender === "child") {
    return "child";
  }

  // Check age for senior
  if (age && age >= 65) {
    return "senior";
  }

  // Check age for youth (13-25)
  if (age && age >= 13 && age <= 25) {
    return "youth";
  }

  return "adult";
}

// Helper function to normalize gender
function normalizeGender(genderStr) {
  if (!genderStr) return null;

  const gender = genderStr.toLowerCase().trim();

  if (gender === "male") return "male";
  if (gender === "female") return "female";
  if (gender === "children" || gender === "child") {
    // For children, we'll need to look at the name or default to male
    return null; // Will be handled separately
  }

  return null;
}

// Process each line
let currentDivision = "";
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Skip empty lines
  if (!line) continue;

  // Check if it's a division header
  if (line.includes("Division") && !line.includes("SL.")) {
    currentDivision = line.split(",")[0];
    continue;
  }

  // Skip header rows
  if (line.includes("SL.,Name,Gender") || line.includes("October Retreat")) {
    continue;
  }

  // Skip summary/total rows
  if (
    line.includes("Total") ||
    line.includes("Female.") ||
    line.includes("Male.")
  ) {
    continue;
  }

  // Parse data rows
  const parts = line.split(",");

  // Check if it's a valid data row (should have number as first field)
  if (parts.length >= 6 && /^\d+$/.test(parts[0].trim())) {
    const sl = parts[0].trim();
    const name = parts[1].trim();
    const genderStr = parts[2].trim();
    const ageStr = parts[3].trim();
    const area = parts[4].trim();
    const fellowship = parts[5].trim();
    const invitedBy = parts[6] ? parts[6].trim() : "";

    // Skip if no name
    if (!name) continue;

    // Parse data
    const age = parseAge(ageStr);
    const gender = normalizeGender(genderStr);
    const department = determineDepartment(genderStr, age);

    // Generate fellowship code
    const fellowshipCode = generateFellowshipCode(fellowship);

    // Increment count for this fellowship
    if (!fellowshipCounts[fellowshipCode]) {
      fellowshipCounts[fellowshipCode] = 0;
    }
    fellowshipCounts[fellowshipCode]++;

    // Generate RegNo
    const regNo = `${fellowshipCode}-${fellowshipCounts[fellowshipCode].toString().padStart(3, "0")}`;

    // Create participant object
    const participant = {
      _type: "participant",
      regNo: regNo,
      name: name,
      isSaved: false,
      invitedBy: invitedBy || null,
      age: age,
      fellowshipName: fellowship || "N/A",
      gender: gender,
      department: department,
      present: "present",
      feePaid: false,
      division: currentDivision,
      area: area,
      // Additional info for review
      _original: {
        sl: sl,
        genderStr: genderStr,
        ageStr: ageStr,
      },
    };

    participants.push(participant);
  }
}

// Display summary
console.log(
  "\n═══════════════════════════════════════════════════════════════"
);
console.log("              PARTICIPANT IMPORT PROCESSING SUMMARY");
console.log(
  "═══════════════════════════════════════════════════════════════\n"
);

console.log(`Total Participants to Import: ${participants.length}\n`);

// Group by division
const byDivision = {};
participants.forEach((p) => {
  if (!byDivision[p.division]) {
    byDivision[p.division] = [];
  }
  byDivision[p.division].push(p);
});

// Display by division
Object.keys(byDivision).forEach((division) => {
  console.log(`\n${"─".repeat(70)}`);
  console.log(`📍 ${division}`);
  console.log(`${"─".repeat(70)}`);

  const divParticipants = byDivision[division];

  // Count by department
  const deptCounts = {
    adult: 0,
    child: 0,
    youth: 0,
    senior: 0,
  };

  const genderCounts = {
    male: 0,
    female: 0,
    unknown: 0,
  };

  divParticipants.forEach((p) => {
    deptCounts[p.department]++;
    if (p.gender === "male") genderCounts.male++;
    else if (p.gender === "female") genderCounts.female++;
    else genderCounts.unknown++;
  });

  console.log(`\nTotal: ${divParticipants.length} participants`);
  console.log(
    `  Adults: ${deptCounts.adult} | Youth: ${deptCounts.youth} | Children: ${deptCounts.child} | Seniors: ${deptCounts.senior}`
  );
  console.log(
    `  Male: ${genderCounts.male} | Female: ${genderCounts.female} | Unknown: ${genderCounts.unknown}`
  );

  console.log(`\nParticipants:`);
  divParticipants.forEach((p, idx) => {
    const ageDisplay = p.age ? `${p.age}y` : "N/A";
    const genderDisplay = p.gender ? p.gender[0].toUpperCase() : "?";
    const invitedDisplay = p.invitedBy ? `by ${p.invitedBy}` : "";

    console.log(
      `  ${(idx + 1).toString().padStart(3)}. [${p.regNo}] ${p.name.padEnd(30)} | ${genderDisplay} | ${ageDisplay.padEnd(5)} | ${p.department.padEnd(8)} | ${p.fellowshipName.padEnd(20)} ${invitedDisplay}`
    );
  });
});

// Issues to review
console.log(
  "\n\n═══════════════════════════════════════════════════════════════"
);
console.log("                    ITEMS REQUIRING ATTENTION");
console.log(
  "═══════════════════════════════════════════════════════════════\n"
);

const noAge = participants.filter((p) => !p.age);
const noGender = participants.filter((p) => !p.gender);
const noFellowship = participants.filter(
  (p) => !p.fellowshipName || p.fellowshipName === "N/A"
);

if (noAge.length > 0) {
  console.log(`⚠️  ${noAge.length} participants without age:`);
  noAge.slice(0, 10).forEach((p) => {
    console.log(`   - ${p.regNo}: ${p.name}`);
  });
  if (noAge.length > 10) {
    console.log(`   ... and ${noAge.length - 10} more`);
  }
  console.log("");
}

if (noGender.length > 0) {
  console.log(
    `⚠️  ${noGender.length} participants without gender (marked as "Children" in CSV):`
  );
  noGender.slice(0, 10).forEach((p) => {
    console.log(`   - ${p.regNo}: ${p.name} [${p._original.genderStr}]`);
  });
  if (noGender.length > 10) {
    console.log(`   ... and ${noGender.length - 10} more`);
  }
  console.log("");
}

if (noFellowship.length > 0) {
  console.log(`⚠️  ${noFellowship.length} participants without fellowship:`);
  noFellowship.slice(0, 10).forEach((p) => {
    console.log(`   - ${p.regNo}: ${p.name}`);
  });
  if (noFellowship.length > 10) {
    console.log(`   ... and ${noFellowship.length - 10} more`);
  }
  console.log("");
}

// Save processed data to JSON
const outputPath = path.join(__dirname, "processed-participants.json");
fs.writeFileSync(outputPath, JSON.stringify(participants, null, 2));

console.log(
  "\n═══════════════════════════════════════════════════════════════"
);
console.log(`✅ Processed data saved to: processed-participants.json`);
console.log(
  "═══════════════════════════════════════════════════════════════\n"
);

console.log("\n📋 NEXT STEPS:");
console.log("1. Review the processed data above");
console.log("2. Check the processed-participants.json file");
console.log(
  "3. If everything looks good, run the import script to insert into Sanity"
);
console.log(
  "4. Address any warnings (missing age, gender, fellowship) if needed\n"
);
