// Content Script: ページコンテキストにスクリプトを注入
const api = typeof browser !== "undefined" ? browser : chrome;
const script = document.createElement("script");
script.src = api.runtime.getURL("inject.js");
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);
