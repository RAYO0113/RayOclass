
/* v51：一鍵關閉目前已開啟的藍色浮框；不改變藍字本身，點藍字仍可再次開關。 */
function closeAllBlueFloatingNotes(){
  document.querySelectorAll('.tp-g.show, .tp-z.show').forEach(function(el){
    el.classList.remove('show');
  });
}
window.closeAllBlueFloatingNotes = closeAllBlueFloatingNotes;
