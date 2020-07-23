require("common/Decker")
local SpawnDeckFromSite = require("common/SpawnDeckFromSite")
local config = require("gameCore/config")
local id = ""
local loaded = false

function onload()
    self.createInput({
        input_function = "updateId",
        function_owner = self,
        label = "Deck ID",
        tooltip = "Deck ID",
        position = {0, 0.1, -1.6},
        scale = {0.5, 0.5, 0.5},
        width = 3400,
        height = 400,
        font_size = 300,
        colodwr = {1,1,1,1},
        font_color = {0,0,0,1},
        validation = 1,
        alignment = 1
    })
    self.createButton({
        click_function = "Go",
        function_owner = self,
        label = "Go",
        position = {0, 0.1, -1.1},
        scale = {0.5, 0.5, 0.5},
        width = 3400,
        height = 400,
        font_size = 300,
        color = {1,1,1,1},
        font_color = {0,0,0,1},
        validation = 1,
        alignment = 1
    })
    loaded = true

    id = "rWW0hTGYq0iFHkE5qu47"
    Go()
end

function updateId(object, color, value, selected)
    id = value
end

function Go()
    SpawnDeckFromSite(config.functionsBaseUrl .. "/getTTSDeck/" .. id)
end

function noop()
end
