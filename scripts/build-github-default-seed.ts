import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { defaultSiteContent } from "../shared/siteContent";

const outputPath = process.argv[2] ?? "cloudflare/backup/github-default-content.json";
const content = {
  ...defaultSiteContent,
  projects: defaultSiteContent.projects.map((project) => ({
    ...project,
    coverUrl: "",
  })),
};

const seed = {
  briefSubmissions: [],
  siteInquiries: [],
  siteContent: content,
  mediaAssets: [],
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
console.log(`GitHub default seed written to ${outputPath}`);
