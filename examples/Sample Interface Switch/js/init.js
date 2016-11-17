function MainLoop() {
  requestAnimationFrame(MainLoop);
  JsonPIXI.Render()
}
//JsonPIXI.MakeRendererPrefab()
JsonPIXI.Start("json",MainLoop)
//JsonPIXI.Start("json directory", callback )

//If you want to create your own PIXI wiewport use [ -your renderer- ].render(JsonPIXI.Layers.MainLayer)