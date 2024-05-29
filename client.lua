local callback
local active = false

local function start_game(game_data, game_callback)
    if active then return end
    active = true
    callback = game_callback
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'startGame',
        gameData = {
            time = game_data.time,
            rows = game_data.rows,
            cols = game_data.cols,
            header = game_data.header and game_data.header or nil,
            instructions = game_data.instructions and game_data.instructions or nil,
        }
    })
end

RegisterNUICallback('getOutcome', function(data, cb)
    SetNuiFocus(false, false)
    active = false
    callback(data)
    cb('ok')
end)

exports('startGame', start_game)

RegisterCommand('test_skill_bar', function()
    exports['RoofRunning']:startGame({
        time = 25,
        rows = 6,
        cols = 6,
        header = 'REMOVE BLOCKS',
        instructions = nil,
    }, function(callbackData) -- Game callback
        print(json.encode(callbackData))
    end)
end, true)