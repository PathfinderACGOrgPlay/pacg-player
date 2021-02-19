import fs from "fs";

fs.writeFileSync(
  "./tts/gameCore/config.lua",
  `return {
    functionsBaseUrl = "${process.env.FUNCTIONS_BASE_URL}"
}`
);
