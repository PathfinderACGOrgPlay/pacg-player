require("common/Decker")
local SpawnDeckFromSite = require("common/SpawnDeckFromSite")
local littleLuaLibrary = require("common/LittleLuaLibrary")
local config = require("config")

value = {}

function onLoad(save_state)
    if(self.UI.getCustomAssets() == nil) then
        self.UI.setCustomAssets({
            {
                name = "Logo",
                url = "https://static2.paizo.com/image/content/PathfinderSociety/PFSACG-LandingLogo.png"
            },
            {
                name = "Paste",
                url = "http://cloud-3.steamusercontent.com/ugc/1021699268804127014/CFF926A940ACCC6B0A2632E12DE5AF296471189C/"
            },
            {
                name = "Spawn",
                url = "http://cloud-3.steamusercontent.com/ugc/1021699521565637250/93B89C218CCA59E15193BFFC6297389F57F54AD7/"
            }
        })
    end

    value = JSON.decode(save_state)

    if(value == nil) then
        value = {}
    end

    littleLuaLibrary.setTimeout(loadValues, nil, 20)
end

function loadValues()
    for k in pairs(value) do
        if(value[k] == "True" or value[k] == "False") then
            self.UI.setAttribute(k, "isOn", value[k])
        else
            self.UI.setAttribute(k, "text", value[k])
        end
    end
end

function onSave()
    return JSON.encode(value)
end

function saveValue(player, newValue, id)
    value[id] = newValue
end

paste = false
function togglePaste()
    paste = not paste

    if paste then
        self.UI.show("pasteView")
        self.UI.hide("editView")
        self.UI.setAttribute("pasteText", "text", buildPasteText())
    else
        self.UI.hide("pasteView")
        self.UI.show("editView")
    end
end

function getValue(key)
    if(value[key] == nil) then
        return ""
    end
    return value[key]
end

function getCheckValue(key)
    if(value[key] == "True") then
        return "☑"
    end
    return "☐"
end

function buildPasteText()
    local nl = "\r\n"
    local hr = rightPad("", 112, "—") .. nl
    local result = "```" .. nl
    result = result .. rightPad("Player Name: " .. getValue("playerName"), 40) .. "Character Name: " .. getValue("characterName") .. nl
    result = result .. rightPad("Organized Play #: " .. getValue("playNumber"), 40) .. "Class: " .. getValue("class") .. nl
    result = result .. nl
    result = result .. hr
    result = result .. rightPad("Scenario: " .. getValue("scenario"), 70) .. rightPad("Tier: " .. getValue("tier"), 10) .. rightPad("XP: " .. getValue("xp"), 10) .. "Date: " .. getValue("date")
    result = result .. hr
    result = result .. rightPad("Event #: " .. getValue("eventNumber"), 40) .. rightPad("Coordinator OP #: " .. getValue("coordinatorOp"), 40) .. "Reported?: " .. getCheckValue("reported") .. nl
    result = result .. hr
    result = result .. "Reward: " .. getCheckValue("reward") .. nl
    local reward = split(getValue("rewardText"), "\n")
    for i, v in ipairs(reward) do
        result = result .. v .. nl
    end
    result = result .. rightPad(getCheckValue("replayed") .. " None - Replayed Scenario", 55) .. getCheckValue("failed") .. " None - Failed Scenario" .. nl
    result = result .. hr
    result = result .. rightPad("Hero Point Spend: ", 20) .. rightPad(getCheckValue("skillFeat") .. " Skill Feat", 14) .. rightPad(getCheckValue("powerFeat") .. " Power Feat", 14) .. rightPad(getCheckValue("cardFeat") .. " Card Feat", 14) .. rightPad(getCheckValue("noSpend") .. " Did Not Spend", 16) .. rightPad("Used: " .. getValue("used"), 15) .. "Remaining: " .. getValue("remaining") .. nl
    result = result .. hr
    result = result .. rightPad("Deck Upgrade: " .. getValue("upgrade") .. ' ', 37) .. rightPad("Bonus Deck Upgrade: " .. getValue("upgrade2") .. ' ', 37) .. "Bonus Deck Upgrade: " .. getValue("upgrade3") .. nl
    result = result .. hr
    result = result .. "Notes:" .. nl
    local notes = split(getValue("notes"), "\n")
    for i, v in ipairs(notes) do
        result = result .. v .. nl
    end
    result = result .. hr
    result = result .. "```"
    return result
end

function rightPad(value, count, char)
    local res = value .. string.rep(char or ' ', count - #value)

    return res, res ~= value
end

function SpawnDeck()
    SpawnDeckFromSite(config.functionsBaseUrl .. "/getTTSDeckByOrgPlayId/" .. getValue("playNumber"))
end
