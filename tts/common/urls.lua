local config = require("gameCore/config")

local urls = {}

---@param character CharacterData
function urls.createCharacterImage(character)
    local role = character.role
    if role == nil then
        role = -1
    end
    local hash = character.roleHashes[role + 1]
    if role == -1 then
        hash = character.baseHash
    end
    local dark = ""
    if character.dark then
        dark = "?dark=1"
    end
    return config.functionsBaseUrl .. "/createCharacterImage/" .. character.systemId .. "/" .. character.deckId .. "/" .. character.characterId .. "/" .. role .. "/" .. hash .. dark
end

---@param systemId string
---@param deckId string
---@param page number
function urls.createDeckImage(systemId, deckId, page, hash)
    return config.functionsBaseUrl .. "/createDeckImage/" .. systemId .. "/" .. deckId .. "/" .. page .. "/" .. hash
end

---@param systemId string
---@param deckId string
---@param page number
function urls.getDeckInfo(systemId, deckId, page)
    return config.functionsBaseUrl .. "/getDeckInfo/" .. systemId .. "/" .. deckId .. "/" .. page .. "/"
end

---@param character CharacterData
function urls.createCharacterData(character)
    local role = character.role
    if role == nil then
        role = -1
    end
    return config.functionsBaseUrl .. "/createCharacterData/" .. character.systemId .. "/" .. character.deckId .. "/" .. character.characterId .. "/" .. role .. "/"
end

return urls