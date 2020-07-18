local gameCore = require("gameCore/GameCore")
local CharacterSheet = require("common/CharacterSheet")

gameCore.run();

function CharacterSheet_init(arg)
    CharacterSheet.init(arg)
end
function CharacterSheet_removeButtons(arg)
    CharacterSheet.removeButtons(arg)
end

function noop()
end