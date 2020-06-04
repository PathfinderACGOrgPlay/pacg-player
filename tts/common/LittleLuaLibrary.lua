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

return {
    update = update,
    setTimeout = setTimeout,
    printPosition = printPosition,
    noop = noop,
    hasItem = hasItem,
    split = split,
    trim = trim
}