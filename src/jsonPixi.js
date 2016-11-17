//Add SetData method to PIXI.DisplayObject for change the properties by a json object
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
//And this for reset 
PIXI.DisplayObject.prototype.ResetData = function () {
  this.position.set(this.dataTag.pos[0], this.dataTag.pos[1])
  this.skew.set(1, 1)
  this.scale.set(1, 1)
  this.alpha = 1
  this.rotation = 0
  this.tint = 0xFFFFFF
}
// The Main Object
var JsonPIXI = (function () {
  //To store JSON data from files from include.json/INCLUDE_JSON
  var JSONs = {}
  //Used to load all files by an array
  var itemsToLoad = []
  //Examples
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
  //Uset to make cross-origin requests without starting the loader
  var GetJSON = function (url, callback) {
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
    xobj.send(null);
    return buffer
  };
  //To make sure that no invalid texture is requested
  var getTexture = function (texture) {
    if (!PIXI.utils.TextureCache[texture]) {
      alert("TEXTURE " + texture + " NOT FOUND")
    } else {
      return PIXI.utils.TextureCache[texture]
    }
  }
  //To start PIXI renderer and add some convenience methods
  var GetRenderer = function () {
    renderer = PIXI.autoDetectRenderer(982, 632, null, false, false)
    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
    document.body.appendChild(renderer.view);
    renderer.view.style.position = 'absolute';
    renderer.view.style.left = (window.innerWidth - renderer.width) / 2 + 'px';
    renderer.view.style.top = (window.innerHeight - renderer.height) / 2 + 'px';
    return {
      renderer: renderer,
      resize: function (fixBorders, y) {
        renderer.view.style.position = 'absolute';
        renderer.view.style.left = (window.innerWidth - renderer.width) / 2 + 'px';
        renderer.view.style.top = (window.innerHeight - renderer.height) / 2 + 'px';
        if (typeof fixBorders === "bolean" && fixBorders) {
          renderer.resize(window.innerWidth, window.innerHeight)
          return [window.innerWidth, window.innerHeight]
        } else if (typeof fixBorders === "number") {
          renderer.resize(fixBorders, y)
          return [fixBorders, y]
        }
      },
      getSize: function () {
        return [renderer.width, renderer.height]
      }
    }
  }
  //To separe from interface layer and other layers
  var Layers = (function () {
    var BattleCam = new PIXI.Container()
    var InterfaceLayer1 = new PIXI.Container()
    var InterfaceLayer2 = new PIXI.Container()
    var GameBackground = new PIXI.Container()
    var MainLayer = new PIXI.Container()
    var all = [BattleCam, InterfaceLayer1, InterfaceLayer2, GameBackground, MainLayer]
    MainLayer.addChild(InterfaceLayer1)
    return {
      BattleCam: BattleCam,
      getAll: all,
      InterfaceLayer1: InterfaceLayer1,
      InterfaceLayer2: InterfaceLayer2,
      GameBackground: GameBackground,
      MainLayer: MainLayer,
      addLayer: function (layer) {
        Layers[layer] = new PIXI.Container()
        Layers[layer].visible = false
        all.push(Layers[layer])
        MainLayer.addChildAt(Layers[layer])
      },
      showLayer: function (layer) {
        if (Layers.hasOwnProperty(layer)) {
          Layers[layer].visible = true
        }
      },
      hideLayer: function (layer) {
        if (Layers.hasOwnProperty(layer)) {
          Layers[layer].visible = false
        }
      },
      setLayerIndex: function (layer, index = 0) {
        if (Layers.hasOwnProperty(layer)) {
          MainLayer.setChildIndex(layer, index)
        }
      }
    }
  })()
  //To manage interfaces
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
      Layers.InterfaceLayer1.removeChild(getCurrentUI().stage)
      currentUI = ui
      getCurrentUI().onOpen && getCurrentUI().onOpen()
      Layers.InterfaceLayer1.addChild(getCurrentUI().stage)
    }
    var Back = function () {
      if (Historic.length > 0) {
        Interfaces.Open(Historic[Historic.length - 1], true)
        Historic.pop()
      }
    }
    var Init = function (ui) {
      currentUI = ui
      Layers.InterfaceLayer1.addChild(getCurrentUI().stage)
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
  //Interface constructor
  function Interface(name, jsonTag) {
    var obj = this
    this.name = name
    this.stage = new PIXI.Container()
    if (jsonTag.Backgrounds) {
      obj.Backgrounds = []
      for (let b in jsonTag.Backgrounds) {
        obj.Backgrounds.push(GameImage(jsonTag.Backgrounds[b], this.stage, false))
      }
    }
    if (jsonTag.Images) {
      obj.Images = {}
      for (var i in jsonTag.Images) {
        obj.Images[i] = {}
        obj.Images[i] = GameImage(jsonTag.Images[i], this.stage, true)
      }
    }
    if (jsonTag.Texts) {
      obj.Texts = {}
      for (var t in jsonTag.Texts) {
        obj.Texts[t] = GameText(jsonTag.Texts[t], this.stage, true)
      }
    }
    if (jsonTag.Buttons) {
      obj.Buttons = {}
      for (var b in jsonTag.Buttons) {
        obj.Buttons[b] = new GameButton(jsonTag.Buttons[b], this.stage, true)
      }
    }
    if (jsonTag.onOpen) this.onOpen = new Command(jsonTag.onOpen);
    if (jsonTag.onClose) this.onClose = new Command(jsonTag.onClose);
  }
  Interface.prototype.updateBackground = function () {
    this.stage.removeChildAt(0)
    this.stage.addChildAt(this.Backgrounds[Math.randomInt(0, obj.Backgrounds.length - 1)], 0)
  }
  //WORK IN PROGRESS!!!!
  function Command(command) {
    return function () {
      command.forEach((cmd) => {
        console.log(cmd[0] + cmd[1])
      })
    }
  }
  //For automatically set data texture and add to the stage
  function GameImage(jsonTag = {}, stage) {
    var obj = new PIXI.Sprite(getTexture(jsonTag.texture))
    obj.dataTag = jsonTag
    obj.SetData(jsonTag)
    if (stage) {
      stage.addChild(obj)
    }
    return obj
  }
  //Default button
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
  // For interfaces
  function GameText(jsonTag = {}, stage) {
    var obj = new PIXI.Text(jsonTag.text || "undefined", jsonTag.style || TextStyles.standard)
    obj.SetData(jsonTag)
    if (stage) {
      stage.addChild(obj)
    }
    return obj
  }
  return {
    MakeRendererPrefab: function () {
      GetRenderer()
    },
    renderer: GetRenderer,
    JSONsLoaded: JSONs,
    LoadJSON: GetJSON,
    Layers: Layers,
    Interfaces: Interfaces,
    Interface: Interface,
    //To start things in order
    Start: function (dir = "json", callback, loadHandler) {
      var Loader = GetJSON(dir + '/include.json', () => {
        var jsonToParse = []
        Loader.data.INCLUDE_TEXTURES.forEach((texture) => {
          itemsToLoad.push(texture)
        })
        Loader.data.INCLUDE_JSON.forEach((file) => {
          itemsToLoad.push(file)
          jsonToParse.push(file)
        })
        PIXI.loader.add(itemsToLoad).on("progress", (loader, resource) => {
          console.log("Loading " + resource.name)
          if (loadHandler) {
            loadHandler(loader, resource)
          }
        }).load(() => {
          var interfacesData = GetJSON(dir + '/Interfaces.json', () => {
            for (var i in interfacesData.data) {
              Interfaces[i] = new Interface(i, interfacesData.data[i])
              Interfaces.list.push(Interfaces[i])
              Interfaces.names.push(i)
            }
            jsonToParse.forEach((file) => {
              JSONs[file] = PIXI.loader.resources[file].data
            })
            Interfaces.Init(Interfaces.names[0])
            callback();
          })
        }
          );
      })
    },
    Render: function () {
      if (renderer) {
        renderer.render(Layers.MainLayer)
      }
    }
  }
})()