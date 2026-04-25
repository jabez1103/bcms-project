import fs from "fs";

const files = [
  "app/api/signatory/student-status/[id]/route.ts",
  "app/api/users/[id]/route.ts",
  "app/api/push/subscribe/route.ts",
  "app/api/signatory/submissions/review/route.ts",
  "app/api/student/activity-logs/system-history/route.ts",
  "app/api/student/clearance-status/[id]/route.ts",
  "app/api/signatory/submissions/route.ts",
  "app/api/admin/clearance-periods/[id]/route.ts",
  "app/api/users/change-password/route.ts",
  "app/api/signatory/requirements/route.ts",
  "app/api/signatory/student-status/route.ts",
  "app/api/student/submit/route.ts",
  "app/api/signatory/requirements/[id]/route.ts",
  "app/api/student/clearance-status/route.ts",
  "app/api/student/activity-logs/recent-logs/route.ts",
  "app/api/admin/clearance-progress/route.ts",
  "app/api/admin/clearance-progress/student/[studentId]/route.ts",
  "app/api/admin/clearance-periods/route.ts",
  "app/api/push/test/route.ts",
];

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  if (!s.includes("verifyToken")) continue;

  if (!s.includes("verifySessionFromCookies")) {
    s =
      `import { verifySessionFromCookies } from "@/lib/requestSession";\n` +
      s.replace(/^import \{([^}]+)\} from "@\/lib\/auth";/m, (m, inner) => {
        const parts = inner
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x && x !== "verifyToken");
        return parts.length ? `import { ${parts.join(", ")} } from "@/lib/auth";` : "";
      });
  }

  s = s.replace(/\bverifyToken\b/g, "verifySessionFromCookies");
  s = s.replace(/verifySessionFromCookies\(token\)/g, "verifySessionFromCookies(request)");

  // Remove cookie token guard when followed by session verify (common pattern)
  s = s.replace(
    /const token = request\.cookies\.get\((?:AUTH_COOKIE_NAME|"token")\)\?\.value;\s*if \(!token\) \{\s*return[^\}]+\}\s*/g,
    ""
  );
  s = s.replace(
    /const token = request\.cookies\.get\("token"\)\?\.value;\s*if \(!token\)\s*return[^\n]+\n\s*/g,
    ""
  );

  // Fix double request param if any
  s = s.replace(/verifySessionFromCookies\(request, request\)/g, "verifySessionFromCookies(request)");

  fs.writeFileSync(f, s);
  console.log("patched", f);
}
