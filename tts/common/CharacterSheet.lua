local CharacterSheet = {}
local urls = require("common/urls")

function CharacterSheet.init(data)
    local saveData = JSON.decode(data.save_state)
    local obj = getObjectFromGUID(data.guid)

    if(saveData.characterData == nil) then
        saveData.characterData = {}
    end

    local cust = obj.getCustomObject()
    local imageUrl = urls.createCharacterImage(saveData.characterData.systemId, saveData.characterData.deckId, saveData.characterData.characterId, saveData.characterData.role)
    if(cust.image != imageUrl) then
        cust.image = imageUrl
        cust.image_bottom = imageUrl
        cust.image_secondary = imageUrl
        local state = obj.script_state
        obj.setCustomObject(cust)
        WebRequest.get(config.functionsBaseUrl .. "/createCharacterData/" .. saveData.characterData.systemId .. "/" .. saveData.characterData.deckId .. "/" .. saveData.characterData.characterId .. "/" .. role .. "/", function(result)
            if(result.is_done) then
                local oldState = JSON.decode(state)
                local newData = JSON.decode(result.text)
                oldState.checkboxes = newData.checkboxes
                oldState.roles = newData.roles
                local newState = JSON.encode(oldState)

                obj.call("setStateRaw", newState)

                Wait.frames(function()
                    obj = obj.reload()
                end, 10)
            end
        end)
        return
    end

    addCheckboxes(data.guid, saveData.checkboxes, saveData.characterData, {})

    for i, v in pairs(saveData.roles) do
        local fn = data.guid .. '_CharacterSheet_role_click_'..v.value
        _G[fn] = function(obj, player_color, alt)
            setValue(obj, {"role"}, saveData.characterData, v.value)
        end
        obj.createButton({
            click_function = fn,
            position = {
                x = ((v.x / 1280) * 2) - 1,
                z = ((v.y / 1280) * 2) - 1,
                y = 0.1
            },
            width = 800,
            height = 200,
            scale = {
                x = 0.1,
                y = 0.1,
                z = 0.1,
            },
            label = v.label
        })
    end
end

function CharacterSheet.removeButtons(data)
    local obj = getObjectFromGUID(data.guid)
    local buttons = obj.getButtons()
    -- iterate from end to front
    for k = #buttons, 1, -1 do
        -- stop when amount of buttons leq 8
        if #buttons <= 8 then
            break
        end
        -- remove the button and pop from the table
        obj.removeButton(buttons[k].index)
        table.remove(buttons)
    end
end

function shallowCopy(t)
  local t2 = {}
  for k,v in ipairs(t) do
    t2[k] = v
  end
  return t2
end

local check = "✓"
function getCheckboxCheckLabel(val, cmpVal)
    if (val == nil) then
        return ""
    end
    if (val >= tonumber(cmpVal)) then
        return check
    end
    return ""
end

function getCheckLabel(path, characterData)
    if (path[1] == "skill") then
        return getCheckboxCheckLabel(characterData.skills[path[2]], path[3])
    elseif (path[1] == "Cards") then
        return getCheckboxCheckLabel(characterData.cards[path[2]], path[3])
    elseif (path[1] == "handSize") then
        return getCheckboxCheckLabel(characterData.handSize, path[2])
    elseif (path[1] == "power" and characterData.powers[path[2]] == true) then
        return check
    end
    return ""
end

function setValue(obj, path, characterData, newRole)
    if (path[1] == "skill") then
        local skillValue = characterData.skills[path[2]]
        local checkbox = tonumber(path[3])
        if (skillValue == nil or skillValue < checkbox) then
            characterData.skills[path[2]] = checkbox
        else
            characterData.skills[path[2]] = checkbox - 1
        end
    elseif (path[1] == "Cards") then
        local skillValue = characterData.cards[path[2]]
        local checkbox = tonumber(path[3])
        if (skillValue == nil or skillValue < checkbox) then
            characterData.cards[path[2]] = checkbox
        else
            characterData.cards[path[2]] = checkbox - 1
        end
    elseif (path[1] == "handSize") then
        local skillValue = characterData.handSize
        local checkbox = tonumber(path[2])
        if (skillValue == nil or skillValue < checkbox) then
            characterData.handSize = checkbox
        else
            characterData.handSize = checkbox - 1
        end
    elseif (path[1] == "power") then
        characterData.powers[path[2]] = not characterData.powers[path[2]]
    elseif (path[1] == "role") then
        characterData.role = newRole
    end

    local newData = JSON.decode(obj.script_state)
    newData.characterData = characterData
    obj.call("setState", JSON.encode(newData))
end

function addCheckboxes(guid, data, characterData, path)
    if(characterData == nil) then
        characterData = {}
    end
    if(characterData.skills == nil) then
        characterData.skills = {}
    end
    if(characterData.cards == nil) then
        characterData.cards = {}
    end
    if(characterData.powers == nil) then
        characterData.powers = {}
    end
    local obj = getObjectFromGUID(guid)
    for i, v in pairs(data) do
        local newPath = shallowCopy(path)
        newPath[#newPath + 1] = i
        if (v.x == nil) then
            addCheckboxes(guid, v, characterData, newPath)
        else
            local fn = guid .. '_CharacterSheet_checkbox_click_'..table.concat(newPath, ",")
            local label = getCheckLabel(newPath, characterData);
            _G[fn] = function(obj, player_color, alt)
                setValue(obj, newPath, characterData)
            end
            obj.createButton({
                click_function = fn,
                position = {
                    x = ((v.x / 1280) * 2) - 1,
                    z = ((v.y / 1280) * 2) - 1,
                    y = 0.1
                },
                scale = {
                    x = 0.2,
                    y = 0.2,
                    z = 0.2,
                },
                label = label
            })
        end
    end
end

return CharacterSheet