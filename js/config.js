// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION — EDIT THESE VALUES
// ═══════════════════════════════════════════════════════════════
const GOOGLE_CLIENT_ID = "625959608817-at3c77puu0vh34hcvi5dsl1j02ddq960.apps.googleusercontent.com";
const DRIVE_FOLDER_ID = "";
const CASE_CATEGORIES = [
  "Cadastral and Land Registration",
  "Civil Case",
  "Commercial and Corporate Case",
  "Criminal Cases",
  "Environmental Case",
  "Family Court Case",
  "Others",
  "Special Civil Action",
  "Special Proceedings"
];

// Party label helper: returns { left, right } labels based on category
function getPartyLabels(category) {
  const cat = (category || "").toLowerCase();
  if (cat === "criminal cases") {
    return { left: "Private Complainant", right: "Accused" };
  } else if (cat === "civil case") {
    return { left: "Plaintiff", right: "Defendant" };
  } else {
    return { left: "Petitioner", right: "Respondent" };
  }
}
const STATUS_OPTIONS = ["On-going","Completed","Pending","Dismissed","Settled"];
const VENUES         = [
  // — Naga City, Camarines Sur —
  "RTC Branch 19, Naga City",
  "RTC Branch 20, Naga City",
  "RTC Branch 21, Naga City",
  "RTC Branch 22, Naga City",
  "RTC Branch 23, Naga City",
  "RTC Branch 24, Naga City",
  "RTC Branch 25, Naga City",
  "RTC Branch 26, Naga City",
  "RTC Branch 27, Naga City",
  "RTC Branch 28, Naga City",
  "RTC Branch 61, Naga City",
  "RTC Branch 62, Naga City",
  "RTC Branch 6-FC, Naga City",
  "MTCC Branch 1, Naga City",
  "MTCC Branch 2, Naga City",
  "MTCC Branch 3, Naga City",
  // — Other / Higher Courts —
  "Court of Appeals",
  "Supreme Court",
  "Sandiganbayan",
  "Court of Tax Appeals",
  "NLRC — Regional Arbitration Branch V",
  "DOLE Regional Office V",
  // — Manual —
  "Other (specify)"
];
const AVATAR_COLORS  = ["#c9a84c","#6366f1","#22c55e","#ef4444","#f59e0b","#06b6d4","#a855f7","#ec4899"];
