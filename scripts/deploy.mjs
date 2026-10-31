import { execSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve();
const outDir = resolve(root, "out");
const cnameDomain = "precap.ahampriyanshu.com";

function run(command, cwd = root) {
  execSync(command, { cwd, stdio: "inherit" });
}

function getOutput(command, cwd = root) {
  return execSync(command, { cwd, encoding: "utf8" }).trim();
}

console.log("=== Deploying precap to GitHub Pages ===");

// 1. Build project
if (!process.argv.includes("--no-build")) {
  console.log("\n1. Building static export...");
  run("npm run build");
}

// 2. Ensure CNAME and .nojekyll in out/
console.log("\n2. Ensuring CNAME and .nojekyll...");
writeFileSync(resolve(outDir, "CNAME"), `${cnameDomain}\n`, "utf8");
writeFileSync(resolve(outDir, ".nojekyll"), "", "utf8");

if (process.argv.includes("--dry-run")) {
  console.log("\nDry run completed successfully. (Not pushing to remote)");
  process.exit(0);
}

// 3. Obtain git remote and commit info
const remote = getOutput("git config --get remote.origin.url");
if (!remote) {
  console.error("Error: git remote origin not configured.");
  process.exit(1);
}
const currentCommit = getOutput("git rev-parse --short HEAD") || "HEAD";
const userName = getOutput("git config user.name") || "precap deployer";
const userEmail = getOutput("git config user.email") || "deployer@precap";

console.log(`\n3. Deploying to ${remote} (branch: gh-pages)...`);

// 4. Initialize temporary git repo in out/ and push
const gitDir = resolve(outDir, ".git");
if (existsSync(gitDir)) {
  rmSync(gitDir, { recursive: true, force: true });
}

try {
  run("git init", outDir);
  run(`git config user.name "${userName}"`, outDir);
  run(`git config user.email "${userEmail}"`, outDir);
  run("git config http.postBuffer 524288000", outDir);
  run("git checkout -B gh-pages", outDir);
  run("git add -A", outDir);
  run(
    `git commit -m "Deploy to GitHub Pages: ${currentCommit} [skip ci]"`,
    outDir,
  );
  run(`git push -f ${remote} gh-pages`, outDir);
  console.log("\nSuccessfully deployed to gh-pages branch!");
  console.log(`Site available at https://${cnameDomain}`);
} finally {
  if (existsSync(gitDir)) {
    rmSync(gitDir, { recursive: true, force: true });
  }
}
