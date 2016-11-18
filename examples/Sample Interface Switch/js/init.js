var renderer = PIXI.autoDetectRenderer(982, 632, null, false, false)
document.body.appendChild(renderer.view);
renderer.view.style.position = 'absolute';
renderer.view.style.left = (window.innerWidth - renderer.width) / 2 + 'px';
renderer.view.style.top = (window.innerHeight - renderer.height) / 2 + 'px';
JsonPIXI.Start("json", loop)
function loop() {
  requestAnimationFrame(loop)
  renderer.render(JsonPIXI.MainLayer)
}