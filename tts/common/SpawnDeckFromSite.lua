local Decker = require("common/Decker")
local urls = require("common/urls")

local running = false

function SpawnDeckFromSite(url)
    if (running) then
        return
    end
    running = true
    self.setColorTint({ 1, 0, 0 })
    WebRequest.get(url, self, "SpawnDeckFromSiteBuildDeck")
end

local charset = {}

-- qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890
for i = 48, 57 do
    table.insert(charset, string.char(i))
end
for i = 65, 90 do
    table.insert(charset, string.char(i))
end
for i = 97, 122 do
    table.insert(charset, string.char(i))
end

function random(length)
    math.randomseed(os.time())

    if length > 0 then
        return random(length - 1) .. charset[math.random(1, #charset)]
    else
        return ""
    end
end

function getCharacterSheet(data)
    local imageUrl = urls.createCharacterImage(data.characterData.systemId, data.characterData.deckId, data.characterData.characterId, data.characterData.role)
    return {
        Autoraise = true,
        ColorDiffuse = {
            r = 1,
            g = 1,
            b = 1
        },
        CustomImage = {
            ImageScalar = 1,
            ImageURL = imageUrl,
            ImageSecondaryURL = imageUrl,
            WidthScale = 0,
            CustomTile = {
                Type = 0,
                Thickness = 0.1,
                Stackable = false,
                Stretch = true
            }
        },
        Description = data.deck.name,
        GMNotes = "",
        Grid = false,
        GridProjection = false,
        Guid = random(5),
        Hands = false,
        HideWhenFaceDown = false,
        IgnoreFoW = false,
        Locked = false,
        Name = "Custom_Tile",
        Nickname = data.wikiCharacter.name,
        Snap = false,
        Sticky = true,
        Tooltip = true,
        Transform = {
            posX = 1,
            posY = 1,
            posZ = 1,
            rotX = 0,
            rotY = 180,
            rotZ = 0,
            scaleX = 12,
            scaleY = 1,
            scaleZ = 12,
        },
        XmlUI = "",
        LuaScript = [[
                            local state = ""
                            function onLoad(save_state)
                                state = save_state
                                Wait.frames(function()
                                    Global.call("CharacterSheet_init", {
                                        guid = self.guid,
                                        save_state = save_state
                                    })
                                end, 10)
                            end
                            function setState(newState)
                                state = newState
                                self.script_state = newState
                                Global.call("CharacterSheet_removeButtons", {
                                    guid = self.guid
                                })
                                Global.call("CharacterSheet_init", {
                                    guid = self.guid,
                                    save_state = newState
                                })
                            end
                            function setStateRaw(newState)
                                state = newState
                                self.script_state = newState
                            end
                            function onSave()
                                return state
                            end
                        ]],
        LuaScriptState = JSON.encode(data)
    }
end

function getCharacterToken(data)
    return {
        Autoraise = true,
        ColorDiffuse = {
            r = 1,
            g = 1,
            b = 1
        },
        CustomImage = {
            ImageScalar = 1,
            ImageURL = data.wikiCharacter.image,
            ImageSecondaryURL = data.wikiCharacter.image,
            WidthScale = 0
        },
        Description = data.deck.name,
        GMNotes = "",
        Grid = false,
        GridProjection = false,
        Guid = "deadbf",
        Hands = false,
        HideWhenFaceDown = false,
        IgnoreFoW = false,
        Locked = false,
        Name = "Figurine_Custom",
        Nickname = data.wikiCharacter.name,
        Snap = false,
        Sticky = true,
        Tooltip = true,
        Transform = {
            posX = 1,
            posY = 1,
            posZ = 1,
            rotX = 0,
            rotY = 0,
            rotZ = 0,
            scaleX = 1,
            scaleY = 1,
            scaleZ = 1,
        },
        XmlUI = "",
    }
end

local function hasAndRemoveValue (tab, val)
    for index, value in ipairs(tab) do
        if value == val then
            table.remove(tab, index)
            return true
        end
    end

    return false
end

function getDeck(systemId, deckInfo, playerDeck)
    local cards = {}
    for i, v in ipairs(deckInfo.cards) do
        local asset = Decker.Asset(
                urls.createDeckImage(systemId, deckInfo.deck.id, i - 1),
                "http://cloud-3.steamusercontent.com/ugc/1021699804504901512/B0CCF926C6D9A53A30E1713DB7AD8738859E3E86/",
                {
                    width = v.width,
                    height = v.height,
                    uniqueBack = false,
                    hiddenBack = false
                }
        )
        for j, w in ipairs(v.info) do
            local y = math.floor((j - 1) / v.width) + 1;
            local x = ((j - 1) % v.width) + 1;
            for k = 1, w.count, 1 do
                local card = Decker.Card(asset, y, x, {
                    name = w.name,
                    desc = w.type .. ", " .. deckInfo.deck.name .. ", " .. w.subDeck .. ", " .. table.concat(w.traits, ", "),
                    scriptState = JSON.encode({
                        systemId = systemId,
                        deckId = deckInfo.deck.id,
                        cardId = w.id,
                        deckName = deckInfo.deck.name,
                        subDeck = w.subDeck,
                        traits = w.traits,
                        type = w.type
                    })
                });
                if (hasAndRemoveValue(deckInfo.selected, w.id)) then
                    table.insert(playerDeck, card)
                else
                    if (cards[w.subDeck] == nil) then
                        cards[w.subDeck] = {}
                    end
                    table.insert(cards[w.subDeck], card)
                end
            end
        end
    end
    local decks = {}
    for k, v in pairs(cards) do
        print(k, #v)
        if(#v > 0) then
            if(#v == 1) then
                table.insert(decks, v[1].data)
            else
                table.insert(decks, Decker.Deck(v, {
                    name = k
                }).data)
            end
        end
    end
    return makeBag(deckInfo.deck.name, decks)
end

function makeBag(name, contents)
    return {
        Name = "Bag",
        Transform = {
            posX = 1,
            posY = 1,
            posZ = 1,
            rotX = 0,
            rotY = 0,
            rotZ = 0,
            scaleX = 1,
            scaleY = 1,
            scaleZ = 1,
        },
        Nickname = name,
        Description = "",
        GMNotes = "",
        ColorDiffuse = {
            r = 0,
            g = 0,
            b = 0
        },
        Locked = false,
        Grid = true,
        Snap = true,
        IgnoreFoW = false,
        Autoraise = true,
        Sticky = true,
        Tooltip = true,
        GridProjection = false,
        HideWhenFaceDown = false,
        Hands = false,
        MaterialIndex = -1,
        MeshIndex = -1,
        XmlUI = "",
        LuaScript = "",
        LuaScriptState = "",
        ContainedObjects = contents,
        GUID = "deadbf"
    }
end

-- TODO: Handle substitutions
function SpawnDeckFromSiteBuildDeck(result)
    if (result.is_done) then
        self.setColorTint({ 1, 1, 1 })
        if (result.is_error) then
            print("Error while loading deck: " .. result.error)
            running = false
        else
            data = JSON.decode(result.text)
            if (data.error) then
                print("Error while loading deck: " .. data.error)
                running = false
            else
                local boxes = {}
                local pos = self.getPosition()
                pos.y = pos.y + 5;
                pos.z = pos.z - 2;
                pos.x = pos.x + 0;

                local results = {}

                if (data.wikiCharacter and data.wikiCharacter.image) then
                    table.insert(results, getCharacterToken(data))
                end

                if (data.characterData and data.characterData.systemId and data.characterData.deckId and data.characterData.characterId) then
                    table.insert(results, getCharacterSheet(data))
                end

                local playerDeck = {}
                if (data.cards.one.deck.name) then
                    table.insert(results, getDeck(data.characterData.systemId, data.cards.one, playerDeck))
                end

                if (data.cards.two.deck.name) then
                    table.insert(results, getDeck(data.characterData.systemId, data.cards.two, playerDeck))
                end

                if (data.cards.three.deck.name) then
                    table.insert(results, getDeck(data.characterData.systemId, data.cards.three, playerDeck))
                end

                table.insert(results, Decker.Deck(playerDeck, {
                    name = ""
                }).data)

                spawnObjectJSON({
                    json = JSON.encode(makeBag("", results)),
                    position = pos,
                    rotation = { 0, 0, 0 },
                    scale = { 1, 1, 1 },
                    sound = false,
                    snap_to_grid = false
                })
                running = false
            end
        end
    end
end

return SpawnDeckFromSite