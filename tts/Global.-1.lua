local gameCore = require("gameCore/GameCore")
local CharacterSheet = require("common/CharacterSheet")

gameCore.run();

function initCharacterSheet(arg)
    CharacterSheet.init(arg)
end

function noop()
end