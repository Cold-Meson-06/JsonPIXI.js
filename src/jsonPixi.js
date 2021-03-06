PIXI.DisplayObject.prototype.SetData = function (jsonTag) {
    if (Array.isArray(jsonTag.pos)) {
        this.position
            .set(jsonTag.pos[0], jsonTag.pos[1])
    }
    if (Array.isArray(jsonTag.skew)) {
        this.skew
            .set(jsonTag.skew[0], jsonTag.skew[1])
    }
    if (Array.isArray(jsonTag.scale)) {
        this.scale
            .set(jsonTag.scale[0], jsonTag.scale[1])
    }
    if (Array.isArray(jsonTag.size)) {
        this.width = jsonTag.size[0]
        this.width = jsonTag.size[1]
    }
    if (Array.isArray(jsonTag.anchor)) {
        this.anchor
            .set(jsonTag.anchor[0], jsonTag.anchor[1])
    }
    if (Array.isArray(jsonTag.pivot)) {
        this.pivot
            .set(jsonTag.pivot[0], jsonTag.pivot[1])
    }
    if (jsonTag.hasOwnProperty("tint")) {
        this.tint = jsonTag.tint
    }
    if (jsonTag.hasOwnProperty("visible")) {
        this.visible = jsonTag.visible
    }
    if (jsonTag.hasOwnProperty("rotation")) {
        this.rotation = jsonTag.rotation
    }
    if (jsonTag.hasOwnProperty("alpha")) {
        this.alpha = jsonTag.alpha
    }
}
PIXI.DisplayObject.prototype.ResetData = function () {
    this.position
    .set(this.dataTag.pos[0], this.dataTag.pos[1])
    this.skew.set(0, 0)
    this.scale.set(1, 1)
    this.alpha = 1
    this.rotation = 0
    this.tint = 0xFFFFFF
}
const JsonPIXI = (function () {
    const JSONs = {}
    const itemsToLoad = []
    let loaded = false
    const InterfaceLayer = new PIXI.Container()
    const MainLayer = new PIXI.Container()
        .addChild(InterfaceLayer)
    let TextStyles = {
        standard: {
            fill: '#000000',
            fontFamily: 'Yukarimobile',
            fontSize: '36px',
            stroke: '#FFFFFF',
            strokeThickness: 4,
            wordWrap: true,
            wordWrapWidth: 440
        }
    }
    const GetJSON = function (url, callback, forceCallback = false) {
           fetch(url).then(r => r.json().then(e => callback && callback(e)))        
    };
    var getTexture = function (texture) {
        if (!PIXI.utils.TextureCache[texture]) {
            console.warn("TEXTURE " + texture + " NOT FOUND")
        } else {
            return PIXI.utils.TextureCache[texture]
        }
    }
    var Interfaces = (function () {
        var values = {}
        var currentUI;
        var list = []
        var names = []
        var Historic = [];
        var getCurrentUI = function () {
            if (!currentUI) {
                console.error("The interface system in not initialized.")
            } else {
                return Interfaces[currentUI]
            }
        }
        var Open = function (ui, update) {
            if (Interfaces.hasOwnProperty(ui)) {
                if (!update)
                    Historic.push(currentUI);
                getCurrentUI().onClose && getCurrentUI().onClose()
                InterfaceLayer.removeChild(getCurrentUI().stage)
                currentUI = ui
                getCurrentUI().onOpen && getCurrentUI().onOpen()
                InterfaceLayer.addChild(getCurrentUI().stage)
                getCurrentUI().updateBackground()
            } else {
                console.warn("Interface " + ui + " not found")
            }
        };
        var Back = function () {
            if (Historic.length > 0) {
                Interfaces.Open(Historic[Historic.length - 1], true)
                Historic.pop()
            }
        }
        var Init = function (ui) {
            if (Interfaces.hasOwnProperty(ui)) {
                currentUI = ui
                InterfaceLayer.addChild(getCurrentUI().stage)
                getCurrentUI().updateBackground()
            } else {
                console.log("interface " + ui + " no found")
            }

        }
        return {
            Back: Back,
            getCurrentUI: getCurrentUI,
            Historic: Historic,
            Init: Init,
            list: list,
            names: names,
            Open: Open,
            values: values
        }
    })()

    function Interface(name, jsonTag) {
        var obj = this
        this.name = name
        this.elements = {}
        this.stage = new PIXI.Container()
        if (jsonTag.Backgrounds) {
            obj.Backgrounds = []
            for (let b in jsonTag.Backgrounds) {
                obj
                    .Backgrounds
                    .push(new GameImage(jsonTag.Backgrounds[b], false, true))
            }
        }
        if (jsonTag.Images) {
            obj.Images = {}
            for (let i in jsonTag.Images) {
                obj.Images[i] = {}
                obj.elements[i] = obj.Images[i] = new GameImage(jsonTag.Images[i], this.stage)
            }
        }
        if (jsonTag.Texts) {
            obj.Texts = {}
            for (let t in jsonTag.Texts) {
                obj.elements[t] = obj.Texts[t] = new GameText(jsonTag.Texts[t], this.stage)
            }
        }
        if (jsonTag.Buttons) {
            obj.Buttons = {}
            for (let b in jsonTag.Buttons) {
                obj.elements[b] = obj.Buttons[b] = new GameButton(jsonTag.Buttons[b], this.stage)
            }
        }
        if (jsonTag.onOpen)
            this.onOpen = new Command(jsonTag.onOpen);
        if (jsonTag.onClose)
            this.onClose = new Command(jsonTag.onClose);
        if (jsonTag.onCreate)
            Command(jsonTag.onCreate)()
        Interfaces[name] = this
    }
    Interface.prototype.updateBackground = function () {
        if (this.hasOwnProperty("Backgrounds")) {
            this.stage
                .addChildAt(this.Backgrounds[Math.floor(Math.random() * ((this.Backgrounds.length - 1) - 0 + 1)) + 0].pixiElement, 0)
            if (this.stage.children[1].isBg) {
                this.stage
                    .removeChildAt(1)
            }
        }
    }
    //WORK IN PROGRESS!!!!
    function Command(command) {
        console.log(command)
        return function () {
            command.forEach((cmd) => {
                ButtonsFunctions[cmd[0]](cmd[1])
            })
        }
    }
    function GameText(jsonTag = {}, stage) {
        this.type = "text"
        this.dataTag = jsonTag
        this.pixiElement = new PIXI.Text(jsonTag.text || "undefined", jsonTag.style || TextStyles.standard)
        this.pixiElement.SetData(jsonTag)
        if (stage) {
            stage.addChild(this.pixiElement)
        }
    }
    function GameImage(jsonTag = {}, stage, isBg = false) {
        this.type = "image"
        this.dataTag = jsonTag
        this.pixiElement = new PIXI.Sprite(getTexture(jsonTag.texture))
        this.pixiElement.SetData(jsonTag)
        this.pixiElement.isBg = isBg
        if (stage) {
            stage.addChild(this.pixiElement)
        }
    }
    function GameButton(jsonTag = {}, stage) {
        this.type = "button"
        this.dataTag = jsonTag
        this.pixiElement = new PIXI.Sprite(getTexture(jsonTag.image.texture))
        stage.addChild(this.pixiElement)
        this.pixiElement
            .SetData(jsonTag.image)
        this.pixiElement.buttonMode = true
        this.pixiElement.interactive = true
        if (jsonTag.hasOwnProperty("toolTip")) {
            this.toolTip = new ToolTip(jsonTag.toolTip)
        }
        if (jsonTag.hasOwnProperty("onMouseOut")) {
            this.MouseOut = new Command(jsonTag.onMouseOut)
            this.pixiElement
                .on('mouseout', () => {
                    this.MouseOut()
                    if (this.toolTip)
                        this.toolTip.hide()
                })
        }
        if (jsonTag.hasOwnProperty("onMouseIn")) {
            this.MouseIn = new Command(jsonTag.onMouseIn)
            this.pixiElement
                .on('mouseover', () => {
                    this.MouseIn()
                    if (this.toolTip)
                        this.toolTip.show()
                })
        }
        if (jsonTag.hasOwnProperty("onClickStart")) {
            this.onClickStart = new Command(jsonTag.onClickStart)
            this.pixiElement
                .on("mousedown", () => {
                    this.onClickStart()
                })
        }
        if (jsonTag.hasOwnProperty("onClickEnd")) {
            this.onClickEnd = new Command(jsonTag.onClickEnd)
            this.pixiElement
                .on("mouseup", () => {
                    this.onClickEnd()
                })
        }
    }
    GameButton.prototype.Glow = function () {
        this.pixiElement.tint = 0x0061ff
        this.pixiElement.scale
            .set(1.2, 1.2)
    }
    GameButton.prototype.Unglow = function () {
        this.pixiElement.tint = 0xFFFFFF
        this.pixiElement.scale
            .set(1, 1)
    }
    var ButtonsFunctions = {
        Back: function () {
            Interfaces.Back()
        },
        DecrementValue: function (obj) {
            if (Interfaces.values.hasOwnProperty(obj.key)) {
                Interfaces.values[obj.key]--
            }
        },
        If: function (obj) {
            if (Interfaces.values.hasOwnProperty(obj.condiction[0])) {
                switch (obj.condiction[1]) {
                    case "==":
                        if (Interfaces.values[obj.condiction[0]] == Interfaces.values[obj.condiction[2]]) {
                            obj.True.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        } else {
                            obj.False.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        }
                        break;
                    case "!=":
                        if (Interfaces.values[obj.condiction[0]] != Interfaces.values[obj.condiction[2]]) {
                            obj.True.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        } else {
                            obj.False.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        }
                        break;
                    case "isTrue":
                        if (Interfaces.values[obj.condiction[0]]) {
                            obj.True.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        } else {
                            obj.False.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        }
                        break;
                    case "isFalse":
                        if (!Interfaces.values[obj.condiction[0]]) {
                            obj.True.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        } else {
                            obj.False.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        }
                        break;
                    case ">":
                        if (Interfaces.values[obj.condiction[0]] > Interfaces.values[obj.condiction[2]]) {
                            obj.True.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        } else {
                            obj.False.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        }
                        break;
                    case "<":
                        if (Interfaces.values[obj.condiction[0]] < Interfaces.values[obj.condiction[2]]) {
                            obj.True.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        } else {
                            obj.False.forEach((cmd) => {
                                ButtonsFunctions[cmd[0]](cmd[1])
                            })
                        }
                        break;
                    default:
                        console.warn("Please insert a valid condiction: 'NOT','==','!=','isTrue','isFalse','>','<'")
                        break;
                }
            }
        },
        IncrementValue: function (obj) {
            if (Interfaces.values.hasOwnProperty(obj.key)) {
                Interfaces.values[obj.key]++
            }
        },
        Open: function (obj) {
            Interfaces.Open(obj.target)
        },
        SetData: function (obj) {
            Interfaces[obj.target].elements[obj.element]
                .pixiElement
                .SetData(obj.data)
            switch (Interfaces[obj.target].elements[obj.element].type) {
                case "button" || "image":
                    if (obj.data.hasOwnProperty("texture")) {
                        Interfaces[obj.target].elements[obj.element].pixiElement.texture = getTexture(obj.data.texture)
                    }
                    break;
                case "text":
                    if (obj.data.hasOwnProperty("text")) {
                        Interfaces[obj.target].elements[obj.element].pixiElement.text = obj.data.text
                    }
                    if (obj.data.hasOwnProperty("style")) {
                        Interfaces[obj.target].elements[obj.element].pixiElement.style = obj.data.style
                    }
                    break;
                default:
                    console.error(Interfaces[obj.target].elements[obj.element].type + " Is not a valid element")
                    break;
            }
        },
        SetValue: function (obj) {
            Interfaces.values[obj.key] = obj.value
        },
        ToogleValue: function (obj) {
            if (Interfaces.values.hasOwnProperty(obj.key) && typeof Interfaces.values[obj.key] === "boolean") {
                Interfaces.values[obj.key] = !Interfaces.values[obj.key]
            } else {
                console.warn(obj.key + " is not a boolean, is " + Interfaces.values[obj.key])
            }
        }
    }
    return {
        ButtonsFunctions: ButtonsFunctions,
        Interface: Interface,
        Interfaces: Interfaces,
        JSONs: JSONs,
        LoadJSON: GetJSON,
        MainLayer: MainLayer,
        Start: function (dir = "json", callback, loadHandler) {
            var Loader,
                interfacesData,
                jsonToParse = []
            var secondLoad = function (noParse = false) {
                for (var i in interfacesData.data) {
                    Interfaces[i] = new Interface(i, interfacesData.data[i])
                    Interfaces.list.push(Interfaces[i])
                    Interfaces.names.push(i)
                }
                jsonToParse.forEach((file) => {
                    JSONs[file] = PIXI.loader.resources[file].data
                });
                if (Interfaces.names.length === 0) {
                    console.log("No interface to load")
                } else {
                    Interfaces.Init(Interfaces.names[0])
                }
                callback && callback();
            }
            var firstLoad = function () {
                Loader.data.INCLUDE_TEXTURES.forEach((texture) => {
                    itemsToLoad.push(texture)
                })
                Loader.data.INCLUDE_JSON.forEach((file) => {
                    itemsToLoad.push(file)
                    jsonToParse.push(file)
                })
                PIXI.loader.add(itemsToLoad)
                    .on("progress", (loader, resource) => {
                        if (loadHandler) {
                            loadHandler(loader, resource)
                        }
                    })
                    .load(secondLoad);
            }

            if (loaded) {
                console.warn("This function if called again generate duplicates in PIXI.loader.resources, that" +
                    " give an error")
                console.info("Also if you are trying to load interfaces generated in your code you can use Jso" +
                    "n PIXI.Init('yourInterface') that they will go to Json PIXI.MainLayer normally")
            } else {
                Loader = GetJSON(dir + '/include.json', () => {
                    interfacesData = GetJSON(dir + '/Interfaces.json', firstLoad)
                })
                loaded = true
            }
        }
    }
})()
