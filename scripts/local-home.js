// Link "⌂ Overview" to the local overview page (index.html in the main folder) on every page of the project
// (user, 4 November 2026). It appears only when the page is opened over file://, so the published pages in the public
// repository "math" never show it. The path to the main folder is taken from the address of this script itself, so a
// page only needs one line, with the relative path to this file:
//   <script src="../../scripts/local-home.js"></script>
// Optional attribute on the script tag: data-position="top-right" (default), "top-left", "bottom-right" or
// "bottom-left", for pages whose own controls sit in the default corner.
(function () {
  if (location.protocol !== "file:") return;
  var me = document.currentScript;
  if (!me || !me.src) return;
  var target = new URL("../index.html", me.src).href;
  var corner = (me.getAttribute("data-position") || "top-right").split("-");
  function add() {
    if (document.getElementById("local-home-link")) return;
    var a = document.createElement("a");
    a.id = "local-home-link";
    a.href = target;
    a.title = "Local overview of all pages of the project";
    a.textContent = "⌂ Overview";
    var s = a.style;
    s.position = "fixed"; s[corner[0]] = "8px"; s[corner[1]] = "8px"; s.zIndex = "2147483000";
    s.font = "13px/1.2 Georgia, serif"; s.color = "#3b3328"; s.background = "rgba(251, 247, 238, .93)";
    s.border = "1px solid #b9ad9a"; s.borderRadius = "6px"; s.padding = "3px 8px"; s.textDecoration = "none";
    s.boxShadow = "0 1px 3px rgba(0, 0, 0, .15)";
    document.body.appendChild(a);
  }
  if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);
})();
