import fs from "fs";

fs.writeFileSync(
  "./gameCore/config.lua",
  `return {
    functionsBaseUrl = "${process.env.FUNCTIONS_BASE_URL}"
}`
);
