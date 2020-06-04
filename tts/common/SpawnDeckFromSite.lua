local Decker = require("common/Decker")

local running = false

function SpawnDeckFromSite(url)
    if(running) then
        return
    end
    running = true
    self.setColorTint({1, 0, 0})
    WebRequest.get(url, self, "SpawnDeckFromSiteBuildDeck")
end

function getData(cards, deckName)
    if #cards == 0 then
        return nil
    elseif #cards == 1 then
        return cards[1].data
    else
        return Decker.Deck(cards, { name = deckName }).data
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
                pos.z = pos.z + 3;

                for box in pairs(data.boxes) do
                    boxes[box] = toCards(data.boxes[box])
                end

                local results = {}
                local playerDeck = {}
                for i, v in ipairs(data.cards) do
                    local box = data.cards[i].box
                    local card = data.cards[i].card
                    local deck = data.cards[i].deck
                    table.insert(playerDeck, boxes[box][deck][card])
                    if(data.boxes[box].Decks[deck][card] ~= nil and data.boxes[box].Decks[deck][card].count ~= nil and data.boxes[box].Decks[deck][card].count > 1) then
                        data.boxes[box].Decks[deck][card].count = data.boxes[box].Decks[deck][card].count - 1
                    else
                        boxes[box][deck][card] = nil
                    end
                end

                for box in pairs(boxes) do
                    local boxResults = {}
                    for deck in pairs(boxes[box]) do
                        local cards = {}
                        for card in pairs(boxes[box][deck]) do
                            if(data.boxes[box].Decks[deck][card].count ~= nil) then
                                for i=1,data.boxes[box].Decks[deck][card].count,1 do
                                    table.insert(cards, boxes[box][deck][card])
                                end
                            else
                                table.insert(cards, boxes[box][deck][card])
                            end
                        end
                        table.insert(boxResults, getData(cards, deck))
                    end
                    table.insert(results, {
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
                        Nickname = box,
                        Description = "",
                        GMNotes = "",
                        ColorDiffuse = {
                            r = 1,
                            g = 1,
                            b = 1
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
                        ContainedObjects = boxResults,
                        GUID = "deadbf"
                    })
                end

                table.insert(results, getData(playerDeck, "Character Deck"))
                table.insert(results, {
                    Autoraise = true,
                    ColorDiffuse = {
                        r = 1,
                        g = 1,
                        b = 1
                    },
                    CustomMesh = {
                        CastShadows = false,
                        ColliderURL = "",
                        Convex = true,
                        CustomShader = {
                            FresnelStrength = 0,
                            SpecularColor = {
                                r = 1,
                                g = 1,
                                b = 1
                            },
                            SpecularIntensity = 0.05,
                            SpecularSharpness = 2
                        },
                        DiffuseURL = "",
                        MaterialIndex = 1,
                        MeshURL = "http://pastebin.com/raw.php?i=Jwhwpv7B",
                        NormalURL = "",
                        TypeIndex = 4
                    },
                    Description = data.characterDeck,
                    GMNotes = "",
                    Grid = false,
                    GridProjection = false,
                    Guid = "deadbf",
                    Hands = false,
                    HideWhenFaceDown = false,
                    IgnoreFoW = false,
                    Locked = false,
                    Name = "Custom_Model",
                    Nickname = data.characterName,
                    Snap = false,
                    Sticky = true,
                    Tooltip = false,
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
                    LuaScript = [========[
----#include NewestCharacterSheet
data = {}
characterData = {}
spawnedWindows = {}
bigMesh="http://pastebin.com/raw.php?i=Jwhwpv7B"
smallMesh="https://gist.githubusercontent.com/waterfoul/5aeb5e6db9825639d7b1cd1e24448cab/raw/57e8b5af4dd0627a6d96b456752f695879c5b1e9/model"

hr = { tag="Image", attributes={ minHeight=5, minWidth=5, color="#AAAAAA" } }

isBig = true
function Panel(children, attributes)
  return { tag="Panel", attributes=attributes or {}, children=children }
end

function halfWhenBig(big)
  if isBig then
    return big
  end
  return big / 2.75
end

function bigSwitch(big, small)
  if isBig then
    return big
  end
  return small
end

function Text(attributes)
  if(attributes.fontSize == nil) then
    attributes.fontSize=halfWhenBig(30)
  end
  return { tag="Text", attributes=attributes }
end

function Button(attributes)
  attributes = attributes or {}
  if(attributes.fontSize == nil) then
    attributes.fontSize=halfWhenBig(30)
  end
  return { tag="Button", attributes=attributes }
end

function HorizontalLayout(children, attributes)
  return { tag="HorizontalLayout", attributes=attributes or {}, children=children }
end

function VerticalLayout(children, attributes)
  return { tag="VerticalLayout", attributes=attributes or {}, children=children }
end

function ToggleButton(attributes)
  attributes = attributes or {}
  if(attributes.fontSize == nil) then
    attributes.fontSize=halfWhenBig(30)
  end
  return { tag="ToggleButton", attributes=attributes }
end
function Pad(width)
  return Text({ minWidth = halfWhenBig(width) })
end

function Checkbox(attributes)
  local size = halfWhenBig(40, 20)
  attributes = attributes or {}
  if(attributes.width == nil) then
    attributes.width = size
  end
  if(attributes.height == nil) then
    attributes.height = size
  end
  return Panel({ ToggleButton(attributes) }, { minWidth=bigSwitch(50, 20), childForceExpandHeight=false })
end

function traits()
  return Text({ text=table.concat(characterData.traits or {}, ", ") })
end

function characterTitle()
  return HorizontalLayout({
    Text({ text=self.getName() }),
    Text({ text=self.getDescription() })
  })
end

function checkboxes(count, prefix, start, pad, handler, id)
  local result = {}
  for i=start,(count + start - 1) do
    table.insert(result, Pad(pad))
    table.insert(result, Checkbox({ onClick=self.getGUID() .. '/' .. handler, id=(i - start + 1) .. '-' .. id}))
    table.insert(result, Pad(pad))
    table.insert(result, Text({ text=(prefix .. i) }))
  end
  return result
end

function concat(t1, t2)
  for i=1,#t2 do
      t1[#t1+1] = t2[i]
  end
  return t1
end

function deckList()
  local children = { Panel({ HorizontalLayout(
    {
      Text({ text="Favored Card Type", minWidth=bigSwitch(170, 70), alignment="MiddleLeft" }),
      Text({ text=characterData.cardsList.favoredCardType, alignment="MiddleLeft" })
    }) }, { minHeight=halfWhenBig(50) }), hr }

  for v in pairs(characterData.cardsList) do
    if(v ~= "favoredCardType" and v ~= "special" and v ~= "cohort") then
      local base = characterData.cardsList[v].base;
      if(base == 0) then
        base = "-"
      end
      table.insert(children, Panel({ HorizontalLayout(concat(
        {
          Text({ text=v, minWidth=bigSwitch(170, 70), alignment="MiddleLeft" }),
          Text({ text=base, minWidth=bigSwitch(50, 20), alignment="MiddleLeft" })
        },
        checkboxes(characterData.cardsList[v].add, "", characterData.cardsList[v].base + 1, 20, "decklistCheck", v .. "-deckList")
      ), { childForceExpandWidth=false }) }, { minHeight=halfWhenBig(50) }))
      table.insert(children, hr)
    end
  end

  if(characterData.cardsList.special ~= nil and characterData.cardsList.special ~= "") then
    table.insert(children, Panel({ HorizontalLayout(
      {
        Text({ text="Special", minWidth=bigSwitch(170, 70), alignment="MiddleLeft" }),
        Text({ text=characterData.cardsList.special, alignment="MiddleLeft" })
      }) }, { minHeight=halfWhenBig(50) }))
    table.insert(hr)
  end

  if(characterData.cardsList.cohort ~= nil and characterData.cardsList.cohort ~= "") then
    table.insert(children, Panel({ HorizontalLayout(
      {
        Text({ text="Cohort", minWidth=bigSwitch(170, 70), alignment="MiddleLeft" }),
        Text({ text=characterData.cardsList.cohort, alignment="MiddleLeft" })
      }) }, { minHeight=halfWhenBig(50) }))
    table.insert(hr)
  end

  return VerticalLayout(children)
end

function skills()
  local children = { }

  for v in pairs(characterData.skills) do
    table.insert(children, Panel({ HorizontalLayout(concat(
      {
        Text({ text=v, minWidth=bigSwitch(170, 70), alignment="MiddleLeft" }),
        Text({ text=characterData.skills[v].die, minWidth=bigSwitch(50, 20), alignment="MiddleLeft" })
      },
      checkboxes(characterData.skills[v].feats, "+", 1, 5, "skillsCheck", v .. "-skills")
    ), { childForceExpandWidth=false }) }, { minHeight=halfWhenBig(50) }))
    for w in pairs(characterData.skills[v].skills) do
      table.insert(children, Panel({ Text({ text="      " .. w .. ": " .. v .. " +" .. characterData.skills[v].skills[w], alignment="MiddleLeft" }) }, { minHeight=halfWhenBig(50) }))
    end
    table.insert(children, hr)
  end

  return VerticalLayout(children)
end

function splitOnSpace(text, split)
  local testText = text:sub(0, split):reverse()
  local match = string.match(testText, "^%a*")
  return {text:sub(0, split - #match), text:sub(split + 1 - #match)}
end

function wrap(powerResults, results, remainingLength, maxLength, text)
  if(#text < remainingLength) then
    table.insert(powerResults, Text({text = text, minHeight=halfWhenBig(50), alignment="MiddleLeft"}))
    remainingLength = remainingLength - (#text)
    return { powerResults, results, remainingLength }
  end

  local split = splitOnSpace(text, remainingLength)
  table.insert(powerResults, Text({text = split[1], minHeight=halfWhenBig(50), alignment="MiddleLeft"}))
  table.insert(results, HorizontalLayout(powerResults, {childForceExpandWidth=false}))
  powerResults = {}
  return wrap(powerResults, results, maxLength, maxLength, split[2])
end

function powers(powers, id)
  local results = {
    Panel({ HorizontalLayout(concat(
      {
        Text({ text="Hand Size", minWidth=bigSwitch(170, 70), alignment="MiddleLeft" }),
        Text({ text=powers.handSize.base, minWidth=bigSwitch(50, 20), alignment="MiddleLeft" })
      },
      checkboxes(powers.handSize.add, "", powers.handSize.base + 1, 5, "handSizeCheck", id .. "-handSize")
    ), { childForceExpandWidth=false }) }, { minHeight=halfWhenBig(50) })
  }

  local profResults = { Text({ text="Proficiencies", minWidth=170, alignment="MiddleLeft" }) }

  if(powers.proficiencies) then
    for i, v in pairs(powers.proficiencies) do
      if(v.optional) then
        table.insert(profResults, Pad(10))
        table.insert(profResults, Checkbox({ onClick=self.getGUID() .. "/profCheck", id=v.name .. "-" .. id .. "-prof" }))
      end
      table.insert(profResults, Pad(10))
      table.insert(profResults, Text({ text=v.name }))
    end
  end

  table.insert(results, Panel({ HorizontalLayout(profResults, { childForceExpandWidth=false }) }, { minHeight=halfWhenBig(50) }))
  table.insert(results, Text({ minHeight=halfWhenBig(50) }))

  for v in pairs(powers.powers) do
    local characterWidth = bigSwitch(14, 16)
    local power = powers.powers[v]
    local powerResults = {}
    local maxLength = 1500 / characterWidth
    local remainingLength = maxLength
    for i, w in pairs(power) do
      if(i ~= 1) then
        table.insert(powerResults, Checkbox({ onClick=self.getGUID() .. "/roleCheck", id=v .. "-" .. i .. "-" .. id .. "-powers" }))
        remainingLength = remainingLength - 50 / characterWidth
        w = " " .. w
      end
      if(remainingLength < #w) then
        local temp = wrap(powerResults, results, remainingLength, maxLength, w);
        powerResults = temp[1]
        results = temp[2]
        remainingLength = temp[3]
      else
        table.insert(powerResults, Text({text = w, minHeight=halfWhenBig(50), alignment="MiddleLeft"}))
        remainingLength = remainingLength - #w
      end
    end
    table.insert(results, HorizontalLayout(powerResults, {childForceExpandWidth=false}))
    table.insert(results, Text({ minHeight=halfWhenBig(50) }))
  end

  return VerticalLayout(results)
end

function getUI(size)
  isBig = size == "big"

  local props = {
    childForceExpandHeight=false,
    width=halfWhenBig(1500),
    height=halfWhenBig(2350)
  }

  if(size == "big") then
    props.position="0 0 -10"
  else
    props.position="0 -25 -10"
  end

  local roleData = Panel()
  if(characterData.roles[data.role + 1] ~= nil) then
    roleData = Panel({ powers(characterData.roles[data.role + 1].powers, "role") }, { minHeight=halfWhenBig(500) })
  end

  return VerticalLayout(
    {
      Panel({ HorizontalLayout({
        Panel({ characterTitle() }),
        Panel({ traits() })
      }) }, { minHeight=halfWhenBig(100) }),
      Panel({ HorizontalLayout({
        skills(),
        deckList()
      }, { height=0, rectAlignment="UpperCenter" }) }, { minHeight=bigSwitch(500, 200) }),
      Panel({ powers(characterData.powers, "base") }, { minHeight=halfWhenBig(500) }),
      Panel({ HorizontalLayout({
        ToggleButton({ minHeight = halfWhenBig(75), text=characterData.roles[1].name, onClick=self.getGUID() .. '/changeRole', id="0-role-select" }),
        ToggleButton({ minHeight = halfWhenBig(75), text=characterData.roles[2].name, onClick=self.getGUID() .. '/changeRole', id="1-role-select" })
      }, { height=0, rectAlignment="UpperCenter" }) }, { minHeight=halfWhenBig(75) }),
      roleData
    },
    props
  )
end

function appendId(contents, id)
  if(contents.attributes.id ~= nil) then
    contents.attributes.id = contents.attributes.id .. '-' .. id
  end
  if(contents.children) then
    for i,v in pairs(contents.children) do
      contents.children[i] = appendId(v, id)
    end
  end
  return contents
end

function smallSwitch(isSmall, big, small)
  if(isSmall) then
    return small
  else
    return big
  end
end

function build()
  local result = {}
  local isSmall = self.getCustomObject().mesh == smallMesh

  if(Global.getVar("supportsPopout")) then
    table.insert(result, Button({
      text="\u{261d}",
      minHeight = 75,
      fontSize=60,
      position=smallSwitch(isSmall, "-750 1150 -10", "-60 0 -10"),
      width=80,
      height=80,
      onClick="popout"
    }))
    table.insert(result, Button({
      text=smallSwitch(isSmall, "-", "\u{25A1}"),
      minHeight = 75,
      fontSize=60,
      position=smallSwitch(isSmall, "750 1150 -10", "60 0 -10"),
      width=80,
      height=80,
      onClick="minimize"
    }))
  end

  if(not isSmall) then
    table.insert(result, getUI("big"))
  end

  self.UI.setXmlTable(result)
end

function minimize()
  local obj = self.getCustomObject();
  local pos = self.getPosition();
  pos.y = pos.y + 2
  if(obj.mesh == bigMesh) then
    obj.mesh = smallMesh
    self.tooltip = true
    pos.z = pos.z + 11.5
    pos.x = pos.x + 7
  else
    obj.mesh = bigMesh
    self.tooltip = false
    pos.z = pos.z - 11.5
    pos.x = pos.x - 7
  end
  self.setCustomObject(obj)
  self.setPosition(pos)
  self.script_state = onSave()
  self.reload()
end

function onLoad(save_state)
  local saveData = JSON.decode(save_state)
  data = saveData.characterData
  characterData = saveData.character
  build()
  setTimeout(loadSettings, nil, 10)
end

function onSave()
  return JSON.encode({
    characterData = data,
    character = characterData
  })
end

function buildWindow(color)
  local contents = getUI("small");
  contents.attributes.id = "Contents"

  return Panel({
    Panel({
      Text({ text=self.getName() .. '/' .. self.getDescription(), class="WindowTitle", offsetXY="0 -5" }),
      Button({
        class="topButtons",
        textColor="#000000",
        text="-",
        offsetXY="-40 -10",
        onClick="minimize",
        id="Minimize-" .. color
      }),
      Button({
          class="topButtons",
          color="#990000",
          textColor="#FFFFFF",
          text="X",
          offsetXY="-5 -10",
          onClick="close",
          id="Close-" .. color
      })
    }, {
      class="TopBar",
      id="TopBar-" .. color
    }),
    appendId(contents, color)
  }, {
    visibility=color,
    fromSheet=self.getGUID(),
    class="Window",
    id="Window-" .. color
  })
end

function rebuildWindows()
  local globalTable = UI.getXmlTable()

  for i, v in pairs(spawnedWindows) do
    table.insert(globalTable, buildWindow(v))
  end

  UI.setXmlTable(globalTable, {})
end

function popout(player)
  local globalTable = UI.getXmlTable()

  local exists = false

  for i, v in pairs(globalTable) do
    if(v.attributes.visibility == player.color and v.attributes.fromSheet == self.getGUID()) then
      return
    end
  end

  table.insert(globalTable, buildWindow(player.color))
  UI.setXmlTable(globalTable, {})
  table.insert(spawnedWindows, player.color)
  setTimeout(loadSettings, nil, 10)
end

function setChk(id, v)
  local value = "false"
  if(v) then
    value = "true"
  end
  self.UI.setAttribute(id, "isOn", value)

  for i, window in pairs(spawnedWindows) do
    UI.setAttribute(id .. '-' .. window, "isOn", value)
  end
end

function loadSettings()
  for i, stat in pairs({"Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"}) do
    if(data[stat] ~= nil) then
      for i, v in pairs(data[stat]) do
        setChk(i .. "-" .. stat .. "-skills", v)
      end
    end
  end
  for i, stat in pairs({"Armor", "Spell", "Blessing", "Ally", "Weapon", "Item"}) do
    if(data.deckList[stat] ~= nil) then
      for i, v in pairs(data.deckList[stat]) do
        setChk(i + 1 .. "-" .. stat .. "-deckList", v)
      end
    end
  end
  if(data.handSize ~= nil) then
    for i, v in pairs(data.handSize) do
      setChk(i + 1 .. "-base-handSize", v)
    end
  end
  if(data.roleHandSize ~= nil) then
    for i, v in pairs(data.roleHandSize) do
      setChk(i + 1 .. "-role-handSize", v)
    end
  end
  if(data.powers ~= nil) then
    for i, v in pairs(data.powers) do
      for j, w in pairs(v) do
        setChk(i + 1 .. "-" .. j + 2 .. "-base-powers", w)
      end
    end
  end
  if(data.rolePowers ~= nil) then
    for i, v in pairs(data.rolePowers) do
      for j, w in pairs(v) do
        setChk(i + 1 .. "-" .. j + 2 .. "-role-powers", w)
      end
    end
  end
  if(data.proficiencies ~= nil) then
    for i, v in pairs(data.proficiencies) do
      setChk(i .. "-base-prof", v)
    end
  end
  if(data.roleProficiencies ~= nil) then
    for i, v in pairs(data.roleProficiencies) do
      setChk(i .. "-role-prof", v)
    end
  end
  if(data.role ~= nil) then
    setChk("0-role-select", false)
    setChk("1-role-select", false)
    setChk(data.role .. "-role-select", true)
  end
end

function handSizeCheck(player, value, id)
  local split = split(id, "-")
  local idx = tostring(tonumber(split[1]) - 1)
  local prop = "handSize"
  if(split[2] == "role") then
    prop = "roleHandSize"
  end
  data[prop][idx] = not data[prop][idx]
  setTimeout(loadSettings, nil, 10)
end

function skillsCheck(player, value, id)
  local split = split(id, "-")
  data[split[2]][tonumber(split[1])] = not data[split[2]][tonumber(split[1])]
  setTimeout(loadSettings, nil, 10)
end

function decklistCheck(player, value, id)
  local split = split(id, "-")
  local idx = tostring(tonumber(split[1]) - 1)
  data.deckList[split[2]][idx] = not data.deckList[split[2]][idx]
  setTimeout(loadSettings, nil, 10)
end

function roleCheck(player, value, id)
  local split = split(id, "-")
  local idx1 = tostring(tonumber(split[1]) - 1)
  local idx2 = tostring(tonumber(split[2]) - 2)
  local prop = "powers"
  if(split[3] == "role") then
    prop = "rolePowers"
  end
  data[prop][idx1][idx2] = not data[prop][idx1][idx2]
  setTimeout(loadSettings, nil, 10)
end

function profCheck(player, value, id)
  local split = split(id, "-")
  local prop = "proficiencies"
  if(split[2] == "role") then
    prop = "roleProficiencies"
  end
  data[prop][split[1]] = not data[prop][split[1]]
  setTimeout(loadSettings, nil, 10)
end

function changeRole(player, value, id)
  local split = split(id, "-")
  data.role = tonumber(split[1])
  data.roleHandSize = {}
  data.roleProficiencies = {}
  data.rolePowers = {}
  build()
  rebuildWindows()
  setTimeout(loadSettings, nil, 10)
end

--[[
  This is a library of useful lua functions for table top simulator

  To use this library you will need to have the atom editor installed with the
  TTS plugin. Once that is complete open Settings, Click Packages, Under
  tabletopsimulator-lua click settings, check the "Experimental: insert other
  files specified in source code", and set the path for the includes (I used
  Documents/My Games/Tabletop Simulator. You will need to go there in windows
  explorer and copy the path over). Finally you will need to save this file in
  that folder as "Little Lua Library.ttslua". Once all that is complete you can
  drop "#include Little Lua Library" anywhere in your file (recommended: at the
  top or bottom) to get access to these functions

  Note: This will need to overwrite the update method. If you need this
  functionality put your code in a baseUpdate method instead
]]

--[[
  This will trim any pattern from the front/end of a string. Defaults to
  trimming whitespace
]]
function trim(s, patternToTrim)
  local trimPattern = patternToTrim or "%s"
  return s:match("^" .. trimPattern .. "*(.*)$"):match("^(.*)" .. trimPattern .. "*$")
end

--[[
  This splits a string using a delimeter. It will also trim the items by default
]]
function split(value, delim, dontTrim)
  local realDelim = delim or ','
  local result = {}
  local i = 1
  local currentValue = value or ''

  local idx = currentValue:find(realDelim)

  while idx do
    local s = currentValue:sub(1, idx - 1)
		if dontTrim then
      result[i] = s
    else
      result[i] = trim(s)
    end
    i = i + 1

    currentValue = currentValue:sub(idx + 1)
    idx = currentValue:find(realDelim)
  end

	if dontTrim then
    result[i] = currentValue
  else
    result[i] = trim(currentValue)
  end

  return result
end

--[[
  This will check to see if a list has an item
]]
function hasItem(value, target, delim, dontTrim)
	local items = split(value, delim, dontTrim)

	for i, s in pairs(items) do
		if(s == target) then
			return true
		end
	end

	return false
end

--[[
  This is a noop method for use in label buttons
]]
function noop() end

--[[
  This will print the position of an object, useful for figuring out initial
  positions of things while building scripts
]]
function printPosition(label, object)
  local position = object.getPosition()
  print(label .. ' ' .. position.x .. ',' .. position.y .. ',' .. position.z)
end

luaLibraryTimeoutQueue = {}
luaLibraryTimeoutStart = 1
luaLibraryTimeoutNext = 1

--[[
  This acts similar to the setTimeout function in js, the primary difference is
  that this one will run your method so many frames later instead of being
  time based
]]
function setTimeout(fn, params, frameCount)
  luaLibraryTimeoutQueue[luaLibraryTimeoutNext] = {
    fn = fn,
    params = params,
    frameCount = frameCount
  }
  luaLibraryTimeoutNext = luaLibraryTimeoutNext + 1
end

function update()
  if luaLibraryTimeoutQueue[luaLibraryTimeoutStart] then
    for i=luaLibraryTimeoutStart,(luaLibraryTimeoutNext - 1) do
      if luaLibraryTimeoutQueue[i] then
        luaLibraryTimeoutQueue[i].frameCount = luaLibraryTimeoutQueue[i].frameCount - 1

        if luaLibraryTimeoutQueue[i].frameCount <= 0 then
          local fn = luaLibraryTimeoutQueue[i].fn
        local params = luaLibraryTimeoutQueue[i].params
          luaLibraryTimeoutQueue[i] = nil
          fn(params)
        end
      end

      if not luaLibraryTimeoutQueue[i] and luaLibraryTimeoutStart == i then
        luaLibraryTimeoutStart = luaLibraryTimeoutStart + 1
      end
    end
  end

  if baseUpdate then
    baseUpdate()
  end
end

----#include NewestCharacterSheet
          ]========],
                    LuaScriptState = JSON.encode({
                        character = data.character,
                        characterData = data.characterData
                    })
                })

                if(data.character.image) then
                    table.insert(results, {
                        Autoraise = true,
                        ColorDiffuse = {
                            r = 1,
                            g = 1,
                            b = 1
                        },
                        CustomImage = {
                            ImageScalar = 1,
                            ImageURL = data.character.image,
                            ImageSecondaryURL = data.character.image,
                            WidthScale = 0
                        },
                        Description = data.characterDeck,
                        GMNotes = "",
                        Grid = false,
                        GridProjection = false,
                        Guid = "deadbf",
                        Hands = false,
                        HideWhenFaceDown = false,
                        IgnoreFoW = false,
                        Locked = false,
                        Name = "Figurine_Custom",
                        Nickname = data.characterName,
                        Snap = false,
                        Sticky = true,
                        Tooltip = false,
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