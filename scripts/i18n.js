import {setCookie} from "./utils.js";
import {handleLoad} from "./game.js";

var lang_map = ""
var rev_map = ""

export function getPkmnName(name){
    if (lang_map == "") return name;
    return lang_map[name]
}

export function getRevPkmnName(name){
    if (rev_map == "") return name;
    return rev_map[name]
}

export function setLanguage(lang, isDaily){
    setCookie("lang", lang, 100, false)
    for (let x in [0, 1, 2, 3, 4, 5, 6, 7]) {
        const elem = document.getElementById('guess' + x) || false
        elem ? elem.remove() : false
    }
    lang_map = ""
    rev_map = ""
    document.getElementById("guess").placeholder = "Who's that Champion?"
    handleLoad(isDaily)
}

