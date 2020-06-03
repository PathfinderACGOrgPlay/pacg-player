This is the project for the pathfinder card game site.

# Developing
To get started developing with this project you will first need the following:
1. Windows (If someone wants to set things up on linux / macOS feel free to submit a pr)
1. [Node 10](https://nodejs.org/dist/latest-v10.x/)
1. [Yarn](https://yarnpkg.com/)
1. [Lua](https://www.lua.org/) executable somewhere on your path, a prebuilt version can be found (here)[http://luadist.org/]
1. (Optional) [Table Top Simulator](https://store.steampowered.com/app/286160/Tabletop_Simulator/)

Once you have all that installed open a terminal in this project and run `yarn`. When that completes run yarn start to start the web server.

For TTS development you should now have a save file with no title or picture in TTS with the save ID 9999. When you load that save the development server will connect to TTS.

For Web development you only need to open a browser and visit http://localhost:3000/

Both pieces will automatically update/reload when you save changes to the appropriate files

# Project Structure
At the top level of this project there are a few important folders
* build: If this folder exists it will contain build artifacts
* functions: This contains the firebase functions project
* gameCore: This contains the LUA for the core of the game logic which is shared between TTS and the Website
* node_modules: Dependencies
* public: Public files which get included in the website build
* src: The react code for the website (written in typescript)
* tts: The files for TTS. Filenames at the root of this file should be named {Object Name}.{Object GUID}.lua and {Object Name}.{Object GUID}.xml. Additionally there is a save.json which is the base TTS save file without the scripts
* ttsBuild: Files used as part of the TTS build process