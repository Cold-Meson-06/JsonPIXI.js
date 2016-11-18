PIXI.DisplayObject.prototype.SetData = function (jsonTag) {
  if (Array.isArray(jsonTag.pos)) {
    this.position.set(jsonTag.pos[0], jsonTag.pos[1])
  }
  if (Array.isArray(jsonTag.skew)) {
    this.skew.set(jsonTag.skew[0], jsonTag.skew[1])
  }
  if (Array.isArray(jsonTag.scale)) {
    this.scale.set(jsonTag.scale[0], jsonTag.scale[1])
  }
  if (Array.isArray(jsonTag.size)) {
    this.width = jsonTag.size[0]
    this.width = jsonTag.size[1]
  }
  if (Array.isArray(jsonTag.anchor)) {
    this.anchor.set(jsonTag.anchor[0], jsonTag.anchor[1])
  }
  if (Array.isArray(jsonTag.pivot)) {
    this.pivot.set(jsonTag.pivot[0], jsonTag.pivot[1])
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
  this.position.set(this.dataTag.pos[0], this.dataTag.pos[1])
  this.skew.set(0, 0)
  this.scale.set(1, 1)
  this.alpha = 1
  this.rotation = 0
  this.tint = 0xFFFFFF
}
var JsonPIXI = (function () {
  var JSONs = {}
  var itemsToLoad = []
  var loaded = false
  var InterfaceLayer = new PIXI.Container()
  var MainLayer = new PIXI.Container().addChild(InterfaceLayer)
  var TextStyles = {
    standard: {
      fontFamily: 'Yukarimobile',
      fontSize: '36px',
      fill: '#000000',
      stroke: '#FFFFFF',
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: 440
    }
  }
  var GetJSON = function (url, callback, forceCallback = false) {
    var buffer = {}
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == '200') {
          buffer.data = JSON.parse(xobj.responseText);
          callback && callback()
      };
    };
    xobj.send(null)
    return buffer
  };
  var getTexture = function (texture) {
    if (!PIXI.utils.TextureCache[texture]) {
      console.warn("TEXTURE " + texture + " NOT FOUND")
    } else {
      return PIXI.utils.TextureCache[texture]
    }
  }
  var Interfaces = (function () {
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
      if (!update) Historic.push(currentUI);
      getCurrentUI().onClose && getCurrentUI().onClose()
      InterfaceLayer.removeChild(getCurrentUI().stage)
      currentUI = ui
      getCurrentUI().onOpen && getCurrentUI().onOpen()
      InterfaceLayer.addChild(getCurrentUI().stage)
      getCurrentUI().updateBackground()
    }
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
      list: list,
      names: names,
      Historic: Historic,
      Open: Open,
      getCurrentUI: getCurrentUI,
      Back: Back,
      Init: Init
    }
  })()
  function Interface(name, jsonTag) {
    var obj = this
    this.name = name
    this.stage = new PIXI.Container()
    if (jsonTag.Backgrounds) {
      obj.Backgrounds = []
      for (let b in jsonTag.Backgrounds) {
        obj.Backgrounds.push(GameImage(jsonTag.Backgrounds[b], false, true))
      }
    }
    if (jsonTag.Images) {
      obj.Images = {}
      for (let i in jsonTag.Images) {
        obj.Images[i] = {}
        obj.Images[i] = GameImage(jsonTag.Images[i], this.stage)
      }
    }
    if (jsonTag.Texts) {
      obj.Texts = {}
      for (let t in jsonTag.Texts) {
        obj.Texts[t] = GameText(jsonTag.Texts[t], this.stage)
      }
    }
    if (jsonTag.Buttons) {
      obj.Buttons = {}
      for (let b in jsonTag.Buttons) {
        obj.Buttons[b] = new GameButton(jsonTag.Buttons[b], this.stage)
      }
    }
    if (jsonTag.onOpen) this.onOpen = new Command(jsonTag.onOpen);
    if (jsonTag.onClose) this.onClose = new Command(jsonTag.onClose);
    Interfaces[name] = this
  }
  Interface.prototype.updateBackground = function () {
    if (this.hasOwnProperty("Backgrounds")) {
      this.stage.addChildAt(this.Backgrounds[Math.floor(Math.random() * ((this.Backgrounds.length - 1) - 0 + 1)) + 0], 0)
      if (this.stage.children[1].isBg) {
        this.stage.removeChildAt(1)
      }
    }
  }
  //WORK IN PROGRESS!!!!
  function Command(command) {
    return function () {
      command.forEach((cmd) => {
        console.log(cmd[0] + cmd[1])
      })
    }
  }
  function GameImage(jsonTag = {}, stage, isBg = false) {
    var obj = new PIXI.Sprite(getTexture(jsonTag.texture))
    obj.dataTag = jsonTag
    obj.SetData(jsonTag)
    if (stage) {
      stage.addChild(obj)
    }
    obj.isBg = isBg
    return obj
  }
  function GameButton(jsonTag = {}, stage) {
    this.image = GameImage(jsonTag.image, stage)
    this.image.buttonMode = true
    this.image.interactive = true
    if (jsonTag.hasOwnProperty("toolTip")) {
      this.toolTip = new ToolTip(jsonTag.toolTip)
    }
    if (jsonTag.hasOwnProperty("onMouseOut")) {
      this.MouseOut = new Command(jsonTag.onMouseOut)
      this.image.on('mouseout', () => {
        this.MouseOut()
        if (this.toolTip) this.toolTip.hide()
      }
      )
    }
    if (jsonTag.hasOwnProperty("onMouseIn")) {
      this.MouseIn = new Command(jsonTag.onMouseIn)
      this.image.on('mouseover', () => {
        this.MouseIn()
        if (this.toolTip) this.toolTip.show()
      })
    }
    if (jsonTag.hasOwnProperty("onClickStart")) {
      this.onClickStart = new Command(jsonTag.onClickStart)
      this.image.on("mousedown", () => {
        this.onClickStart()
      })
    }
    if (jsonTag.hasOwnProperty("onClickEnd")) {
      this.onClickEnd = new Command(jsonTag.onClickEnd)
      this.image.on("mouseup", () => {
        this.onClickEnd()
      })
    }
  }
  GameButton.prototype.Glow = function () {
    this.image.tint = 0x0061ff
    this.image.scale.set(1.2, 1.2)
  }
  GameButton.prototype.Unglow = function () {
    this.image.tint = 0xFFFFFF
    this.image.scale.set(1, 1)
  }
  function GameText(jsonTag = {}, stage) {
    var obj = new PIXI.Text(jsonTag.text || "undefined", jsonTag.style || TextStyles.standard)
    obj.SetData(jsonTag)
    if (stage) {
      stage.addChild(obj)
    }
    return obj
  }
  return {
    JSONs: JSONs,
    LoadJSON: GetJSON,
    MainLayer: MainLayer,
    Interfaces: Interfaces,
    Interface: Interface,
    Start: function (dir = "json", callback, loadHandler) {
      var Loader, interfacesData, jsonToParse = []
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
        PIXI.loader.add(itemsToLoad).on("progress", (loader, resource) => {
          if (loadHandler) {
            loadHandler(loader, resource)
          }
        }).load(secondLoad);
      }

      if (loaded) {
        console.warn("This function if called again generate duplicates in PIXI.loader.resources, that give an error")
        console.info("Also if you are trying to load interfaces generated in your code you can use Json PIXI.Init('yourInterface') that they will go to Json PIXI.MainLayer normally")
      } else {
        Loader = GetJSON(dir + '/include.json',
          () => { interfacesData = GetJSON(dir + '/Interfaces.json', firstLoad) }
        )
        loaded = true
      }
    }
  }
})()