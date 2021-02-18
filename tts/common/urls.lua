local config = require("gameCore/config")

local urls = {}

---@param systemId string
---@param deckId string
---@param characterId string
---@param role number
function urls.createCharacterImage(systemId, deckId, characterId, role)
    if(role == nil) then
        role = -1
    end
    return config.functionsBaseUrl .. "/createCharacterImage/" .. systemId .. "/" .. deckId .. "/" .. characterId .. "/" .. role .. "/"
end

---@param systemId string
---@param deckId string
---@param page number
function urls.createDeckImage(systemId, deckId, page)
    return config.functionsBaseUrl .. "/createDeckImage/" .. systemId .. "/" .. deckId .. "/" .. page .. "/"
end

---@param systemId string
---@param deckId string
---@param page number
function urls.getDeckInfo(systemId, deckId, page)
    return config.functionsBaseUrl .. "/getDeckInfo/" .. systemId .. "/" .. deckId .. "/" .. page .. "/"
end

return urls