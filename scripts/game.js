import {getCookie, setCookie} from "./utils.js";
import {autocomplete} from "./autocomplete.js";
import {getRevPkmnName} from "./i18n.js";
import {getIdFromPokemon, getPokemon, getPokemonFromId} from "./pokedex.js";
import {showState} from "./renderer.js"

function replaceAt(str, index, ch) {
  return str.replace(/./g, (c, i) => i == index ? ch : c);
}

export function copyCurrentDay(day, names) {
  let attempts = parseInt(getCookie("t_attempts", day > -1))
  let guesses = JSON.parse(getCookie("guessesv2", day > -1))
  let gnum = guesses.length
  if (document.getElementById('lost').style.display == "block") {
    gnum = "X"
  }
  let dailyinfo = day == -1 ? "" : ("Daily " + day + " - ")

  let text = ""
  for (const guess of guesses) {
    let mosaic = guess.mosaic
    if (day > -1 & (mosaic[0] == "2" | mosaic[0] == "3")) {
      mosaic = replaceAt(mosaic, 0, '6')
    }
    text = text + "\n" + mosaic + (names ? getPokemonFromId(guess.name) : "")
  }

  text = text.replace(/1/g, '🟩');
  text = text.replace(/2/g, '🔼');
  text = text.replace(/3/g, '🔽');
  text = text.replace(/4/g, '🟨');
  text = text.replace(/5/g, '🟥');
  text = text.replace(/6/g, '🟦');

  text = "TFTerdle " + dailyinfo + gnum + "/" + attempts + text

  let success = "Copied mosaic to clipboard!";
  if (window.clipboardData && window.clipboardData.setData) {
    alert(success);
    return clipboardData.setData("Text", text);
  } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    let textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch (ex) {
      console.warn("Copy to clipboard failed. Let Fireblend know!", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
      alert(success);
    }
  }
}

export function handleGuess(daily) {
  const imgs = { '1': "imgs/correct.png", '2': "imgs/up.png", '3': "imgs/down.png", '4': "imgs/wrongpos.png", '5': "imgs/wrong.png" }
  let guess_name = getRevPkmnName(document.getElementById("guess").value)
  let secret_name = getRevPkmnName(getPokemonFromId(getCookie("secret_poke", daily).replace(/"/g, '')));
  let guess = pokedex[guess_name]

  if (guess == null) {
    document.getElementById("error").style.display = "block";
    return
  }
  document.getElementById("error").style.display = "none";
  document.getElementById("guess").value = "";

  let secret = pokedex[secret_name]

  let gen = guess[0] == secret[0] ? "1" : guess[0] < secret[0] ? '2' : '3'
  let t1 = guess[1] == secret[1] ? "1" : guess[1] == secret[2] ? '4' : guess[1] == secret[3] ? '4' : '5'
  let t2 = guess[2] == secret[2] ? "1" : guess[2] == secret[1] ? '4' : guess[2] == secret[3] ? '4' : '5'
  let t3 = guess[3] == secret[3] ? "1" : guess[3] == secret[1] ? '4' : guess[3] == secret[2] ? '4' : '5'
  let cost = guess[4] == secret[4] ? "1" : guess[4] < secret[4] ? '2' : '3'

  let pokeinfo = "<b>Gen:</b> " + guess[0] + "<br><b>Cost:</b> " + guess[4] +  "<br><b>Trait 1:</b> " + guess[1] +
    "<br><b>Trait 2:</b> " + (guess[2] == "" ? "None" : guess[2]) +
    "<br><b>Trait 3:</b> " + (guess[3] == "" ? "None" : guess[3])

  let guess_info = {
    "hints": [imgs[gen], imgs[cost], imgs[t1], imgs[t2], imgs[t3]],
    "name": getIdFromPokemon(guess_name), "info": pokeinfo, "mosaic": gen + cost + t1 + t2 + t3
  }

  let guesses = getCookie("guessesv2", daily)
  guesses = guesses == "" ? [] : JSON.parse(guesses)

  guesses.push(guess_info)

  if(guess_name == secret_name & daily){
    let streak = getCookie("streak", false)
    streak = streak == ""? 1 : parseInt(streak)+1
    setCookie("streak", streak, 300, false, true)
  }

  setCookie("guessesv2", JSON.stringify(guesses), 100, daily)
  showState(daily)
}

export function toggleHints(daily) {
  let enabled = getCookie("hintsenabled", false)

  enabled = enabled == "0" ? "1" : "0"
  setCookie("hintsenabled", enabled)
  document.getElementById("toggleinfo").innerHTML = "📋 Champion Info " + (enabled == "1" ? "ON" : "OFF");

  let filterRes = getPokemon()[1]
  autocomplete(document.getElementById("guess"), filterRes);
}

export function newGame(isDaily) {
  let filterRes = isDaily ? [getIdFromPokemon(window.dailypoke), pokedex] : getPokemon()
  setCookie('guessesv2', "", 30, isDaily)
  setCookie('secret_poke', filterRes[0], 30, isDaily)
  setCookie('t_attempts', '8', 30, isDaily)

  autocomplete(document.getElementById("guess"), filterRes[1]);

  for (let x in [0, 1, 2, 3, 4, 5, 6, 7]) {
    const elem = document.getElementById('guess' + x) || false
    elem ? elem.remove() : false
  }

  document.getElementById("guessform").style.display = "block";
  document.getElementById("results").style.display = "none";
  document.getElementById("lost").style.display = "none";
  document.getElementById("won").style.display = "none";
  document.getElementById("secretpoke").innerHTML = getPokemonFromId(filterRes[0])
  showState(isDaily)
}

export function handleLoad(isDaily) {
  let poke = getCookie("secret_poke", isDaily)
  let mingen = 1
  let maxgen = 8

  if (poke == "") {
    if (!isDaily) {
      document.getElementById("mingen").value = mingen
      document.getElementById("maxgen").value = maxgen
    }
    newGame(isDaily)
  } else {
    mingen = parseInt(getCookie("min_gene", isDaily))
    maxgen = parseInt(getCookie("max_gene", isDaily))
    if (!isDaily) {
      document.getElementById("mingen").value = mingen
      document.getElementById("maxgen").value = maxgen
    }
  }

  autocomplete(document.getElementById("guess"), getPokemon(mingen, maxgen)[1]);
  showState(isDaily)
}