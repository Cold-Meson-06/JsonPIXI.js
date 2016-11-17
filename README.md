# JsonPIXI.js
The JsonPIXI.js allows you to create container with pixi things and add to another container called ```JsonPIXI.Layers.MainLayer```.
Also add functions to switch between containers (```JsonPIXI.Interfaces.Open(ui)```), and back to the last opened (```JsonPIXI.Interfaces.Back(ui)```), Good for create games with simple or complex interfaces systems.

And for load assets and other json files you can create an include.json file and add things like this:
```json
{
  "INCLUDE_TEXTURES":[
    "assets/images/spriteSheet1.json",
    "assets/images/box.png",
    "assets/images/button1.png"
  ],
  "INCLUDE_JSON":[
    "tiledMap.json",
    "objectsPositions.json",
    "src/config/defaultConfig.json"
  ]
 }
```
Now all textures still available on pixi texture cache, all json files added to ```INCLUDE_JSON``` go to ```JsonPIXI.JSONs[jsonFileUrl]``` without and in ```PIXI.loader.resources[jsonFileUrl].data```

Also you can load an json file after the loading phase by ```var jsonFile = JsonPIXI.LoadJSON(url,callback)``` and then go to ```jsonFile.data``` when loading is complete.
#Creating stuff
The main json file pattern must be like this:
```json
{
  "interfaceName":{
    "Backgrounds":{
    },
    "Images":{
    },
    "Buttons":{
    },
    "Texts":{
    }
  }
}
```
**Note: all entries  is always are optional**
# PIXI Sprite pattern
The Buttons, Images and Backgrounds have the same pattern to add an pixi sprite, is like this example:
```json
  "spriteName":{
    "texture":"img/sprite_texture.png",
    "pos":[500,100],
    "skew":[1.2,1.5],
    "scale":[2,0.5],
    "anchor":[0.5,1],
    "pivot":[200,10],
    "size":[10,100],
    "visible":true,
    "rotation":47,
    "alpha":0.5,
    "tint":241496
  }
```
If you want to add more containers, add more objects to the root object:
```json
{
  "interface_0":{
      "Backgrounds":{}
  },
  "interface_1":{
      "Backgrounds":{}
  },
  "interface_2":{
      "Backgrounds":{}
  },
}
```
**Note: if you have 2 interfaces with the same name the first is overwritten**

# Backgrounds
In the Backgrounds object you can add 1 or more, if an interface have up to 2 backgrounds the interface is able to use the the ```JsonPIXI.Interfaces[interfaceName].updateBackground(bg)``` to set the background to an random background or an provided in the bg paramter.

Example:
```json
{
  "someSpriteName":{
    "background1":{
      "texture":"img/blueTexture.png"
    },
    "background2":{
      "texture":"img/redTexture.png",
      "size":[1000,980],
      "anchor":[0.5,0.5],
      "pos":[500,490],
      "scale":[-1,-1]
    }
  }
}
```
In this example at every update the background is changed to a random between *background1* and *background2*
The background sprite is always in the last layer.

#Images
For add an image to the container is the same method for add an background.
Exept for that these sprites are added in order of declaration. 

#Buttons & Text
//Buttons and text are incomplete at the moment.
