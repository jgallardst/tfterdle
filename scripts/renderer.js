import {getCookie, setCookie} from "./utils.js";
import {getPokemonFromId} from "./pokedex.js";

function getTitle(streak) {
    if (streak < 3){
        return "Iron"
    }
    if (streak < 7){
        return "Bronze"
    }
    if (streak < 10){
        return "Silver"
    }
    if (streak < 15){
        return "Gold"
    }
    if (streak < 25){
        return "Platinum"
    }
    if (streak < 35){
        return "Diamond"
    }
    if (streak < 45){
        return "Master"
    }
    if (streak < 60){
        return "Grandmaster"
    }
    if (streak < 75){
        return "Challenger"
    }
    return "Little Legend"
}

export function showState(daily) {
    let enabled = getCookie("hintsenabled", false)
    document.getElementById("toggleinfo").innerHTML = "📋 Champion Info " + (enabled == "0" ? "OFF" : "ON");

    let guesses = getCookie("guessesv2", daily)
    let attempts = getCookie("t_attempts", daily)

    guesses = guesses == "" ? [] : JSON.parse(guesses)
    let guessesCont = document.getElementById("guesses")
    let hintTitles = document.getElementById("hinttitles")

    if (guesses.length > 0) {
        if (guessesCont.style.display == "none") {
            guessesCont.style.display = "block";
            window.getComputedStyle(hintTitles).opacity;
            hintTitles.className += ' in';
        }
    } else {
        guessesCont.style.display = "none"
        hintTitles.className = 'row';
    }
    let lastAttempt = ""

    for (const [index, guess] of guesses.entries()) {
        if (!(document.getElementById('guess' + index) || false)) {
            lastAttempt = getPokemonFromId(guess.name)

            var rowElement = createElement({ Tag: "div", id: 'guess' + index, classList: 'row' })

            for (const hint of guess.hints) {
                var img = createElement({ Tag: "img", classList: 'emoji', src: hint })
                var colElement = createElement({ Tag: "div", classList: 'column', childNodes: [img] })
                rowElement.appendChild(colElement)
            }
            var pokename = createElement({ Tag: "p", classList: 'guess', innerHTML: lastAttempt })
            var pokeinfo = createElement({ Tag: "span", classList: 'tooltiptext', innerHTML: guess.info })
            var tooltip = createElement({ Tag: "div", classList: 'tooltip', childNodes: [pokename, pokeinfo] })
            var colElement = createElement({ Tag: "div", classList: 'column', childNodes: [tooltip] })

            rowElement.appendChild(colElement)

            guessesCont.appendChild(rowElement);
            window.getComputedStyle(rowElement).opacity;
            rowElement.className += ' in';


        }
    }

    let secret_name = getPokemonFromId(getCookie("secret_poke", daily).replace(/"/g, ''));
    if (secret_name == lastAttempt) {
        document.getElementById("secretpoke").innerHTML = secret_name
        document.getElementById("guessform").style.display = "none";
        document.getElementById("results").style.display = "block";
        document.getElementById("won").style.display = "block";
        if (daily) {
            let streak = parseInt(getCookie("streak", false))
            let title = getTitle(streak)
            document.getElementById("streak").innerHTML = "You've guessed <b>"+streak+" Champion</b> in a row!<br><b>Division: </b>"+title
        }
    }
    else if (guesses.length == attempts) {
        document.getElementById("secretpoke").innerHTML = secret_name
        document.getElementById("guessform").style.display = "none";
        document.getElementById("results").style.display = "block";
        document.getElementById("lost").style.display = "block";
        if (daily) {
            setCookie("streak", 0, 300, false)
            document.getElementById("streak").innerHTML = "Streak Reset!<br><b>Demoted to Iron</b>"
        }
    }
    document.getElementById("attempts").innerHTML = attempts - guesses.length
}

function createElement(initObj) {
    let element = document.createElement(initObj.Tag);
    for (let prop in initObj) {
        if (prop === "childNodes") {
            initObj.childNodes.forEach(function (node) { element.appendChild(node); });
        }
        else if (prop === "attributes") {
            initObj.attributes.forEach(function (attr) { element.setAttribute(attr.key, attr.value) });
        }
        else element[prop] = initObj[prop];
    }
    return element;
}