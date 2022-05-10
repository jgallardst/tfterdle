import {getPkmnName} from "./i18n.js";
window.pokedex = ""
export function getPokemonFromId(id) {
    return isNaN(id) ? id : getPkmnName(Object.keys(pokedex)[parseInt(id)]);
}

export function getIdFromPokemon(pokemon) {
    return Object.keys(pokedex).indexOf(pokemon);
}

export function getPokemon() {
    let filtered = []
    for (const [name, info] of Object.entries(pokedex)) {
            filtered.push([name, info])
    }
    let chosen = filtered[filtered.length * Math.random() | 0][0];
    return [getIdFromPokemon(chosen), filtered]
}