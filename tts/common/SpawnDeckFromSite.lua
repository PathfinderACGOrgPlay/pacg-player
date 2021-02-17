local Decker = require("common/Decker")
local config = require("gameCore/config")

local running = false

function SpawnDeckFromSite(url)
    if(running) then
        return
    end
    running = true
    self.setColorTint({1, 0, 0})
    WebRequest.get(url, self, "SpawnDeckFromSiteBuildDeck")
end

local charset = {}

-- qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890
for i = 48,  57 do table.insert(charset, string.char(i)) end
for i = 65,  90 do table.insert(charset, string.char(i)) end
for i = 97, 122 do table.insert(charset, string.char(i)) end

function getData(cards, deckName)
    if #cards == 0 then
        return nil
    elseif #cards == 1 then
        return cards[1].data
    else
        return Decker.Deck(cards, { name = deckName }).data
    end
end

function random(length)
  math.randomseed(os.time())

  if length > 0 then
    return random(length - 1) .. charset[math.random(1, #charset)]
  else
    return ""
  end
end

function SpawnDeckFromSiteBuildDeck(result)
    if(result.is_done) then
        self.setColorTint({1, 1, 1})
        if(result.is_error) then
            print("Error while loading deck: " .. result.error)
            running = false
        else
            data = JSON.decode(result.text)
            if(data.error) then
                print("Error while loading deck: " .. data.error)
                running = false
            else
                local boxes = {}
                local pos = self.getPosition()
                pos.y = pos.y + 5;
                pos.z = pos.z - 2;
                pos.x = pos.x + 0;

                local results = {}

                if(data.wikiCharacter and data.wikiCharacter.image) then
                    table.insert(results, {
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
                    })
                end

                if(data.characterData and data.characterData.systemId and data.characterData.deckId and data.characterData.characterId) then
                    local role = data.characterData.role
                    if(role == nil or role == -1) then
                        role = "-1"
                    end
                    local imageUrl = config.functionsBaseUrl .. "/createCharacterImage/" .. data.characterData.systemId .. "/" .. data.characterData.deckId .. "/" .. data.characterData.characterId .. "/" .. role .. "/"
                    table.insert(results, {
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
                    })
                end

                spawnObjectJSON({
                    json = JSON.encode({
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
                        Nickname = "",
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
                        ContainedObjects = results,
                        GUID = "deadbf"
                    }),
                    position = pos,
                    rotation = {0, 0, 0},
                    scale = {1, 1, 1},
                    sound = false,
                    snap_to_grid = false
                })
                running = false
            end
        end
    end
end

----#include toCards
function toCards(boxObj)
    local images = {}
    local cards = {}

    for image in pairs(boxObj.DeckImages) do
        images[image] = Decker.Asset(
            boxObj.DeckImages[image].url,
            "http://cloud-3.steamusercontent.com/ugc/1021699804504901512/B0CCF926C6D9A53A30E1713DB7AD8738859E3E86/",
            {
                width = boxObj.DeckImages[image].width,
                height = boxObj.DeckImages[image].height
            })
    end

    for deck in pairs(boxObj.Decks) do
        local deckObj = boxObj.Decks[deck];
        cards[deck] = {}
        for card in pairs(deckObj) do
            local cardObj = deckObj[card]
            cards[deck][card] = Decker.Card(images[cardObj.deck], cardObj.x + 1, cardObj.y + 1, { name = card, desc = cardObj.Description })
        end
    end

    return cards
end

----#include toCards

return SpawnDeckFromSite