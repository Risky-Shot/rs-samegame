# rs-samegame
 Click on matching groups of blocks to eliminate within given time.

## Usage
```
    exports['rs-samegame']:startGame({
        time = 25, -- Time Span to complete game
        rows = 6, -- No of block in row
        cols = 6, -- No of block in column
        header = 'REMOVE BLOCKS', -- Custom Header
        instructions = nil, -- Custom Instruction below header
    }, function(callbackData) -- Game callback
        print(json.encode(callbackData))
    end)
```

## Callback Data
`Outome , RedBlock Left, WhiteBlock Left, YellowBlock Left`

Showcase : 

![image](https://github.com/Risky-Shot/rs-samegame/assets/52458646/67fa9b75-fb49-4725-a4d8-feaaba894a55)


Credits : [@MaximilianAdF](https://github.com/MaximilianAdF)
