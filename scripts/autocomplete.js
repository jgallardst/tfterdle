import {getCookie} from "./utils.js";
import {getPkmnName} from "./i18n.js";

export function autocomplete(inp, arr) {
    let currentFocus;
    let hintsenabled = getCookie("hintsenabled", false)
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {

            let pkmnname = getPkmnName(arr[i][0])
            let matches = pkmnname.substr(0, val.length).toUpperCase() == val.toUpperCase() ? 1 : 0
            let words = pkmnname.split(" ")
            let highlight = true
            for (let j = 0; j < words.length; j++) {
                matches += words[j].substr(0, val.length).toUpperCase() == val.toUpperCase() ? 1 : 0
            }
            if (matches == 0) {
                highlight = false
                let filters = val.split(" ")
                let fvalues = []
                for (let f = 0; f < filters.length; f++) {
                    let filter = filters[f].toLowerCase()
                    if (filter.includes("set:")) {
                        fvalues.push(arr[i][1][0].toString() == filter.split(":")[1] ? 1 : 0)
                    } else if (filter.includes("set!")) {
                        fvalues.push(arr[i][1][0].toString() != filter.split("!")[1] ? 1 : 0)
                    } else if (filter.includes("set>")) {
                        fvalues.push(arr[i][1][0] > parseInt(filter.split(">")[1]) ? 1 : 0)
                    } else if (filter.includes("set<")) {
                        fvalues.push(arr[i][1][0] < parseInt(filter.split("<")[1]) ? 1 : 0)
                    } else if (filter.includes("trait:")) {
                        let t1 = filter.split(":")[1].toLowerCase()
                        let t2 = t1 == "" ? "-" : t1
                        t2 = t2 == "none" ? "" : t2
                        fvalues.push(arr[i][1][1].toLowerCase() == t1 || arr[i][1][2].toLowerCase() == t2 ? 1 : 0)
                    } else if (filter.includes("trait!")) {
                        let t1 = filter.split("!")[1].toLowerCase()
                        let t2 = t1 == "" ? "-" : t1
                        t2 = t2 == "none" ? "" : t2
                        fvalues.push(arr[i][1][1].toLowerCase() != t1 && arr[i][1][2].toLowerCase() != t2 ? 1 : 0)
                    } else if (filter.includes("cost:")) {
                        fvalues.push(arr[i][1][4].toString() == filter.split(":")[1] ? 1 : 0)
                    }
                }
                matches = fvalues.length > 0 ? Math.min(...fvalues) : 0
            }
            if (matches > 0) {
                b = document.createElement("DIV");
                let index = pkmnname.toLowerCase().indexOf(val.toLowerCase())
                if (highlight) {
                    b.innerHTML = pkmnname.substr(0, index)
                    b.innerHTML += "<strong>" + pkmnname.substr(index, val.length) + "</strong>";
                    b.innerHTML += pkmnname.substr(index + val.length);
                } else {
                    b.innerHTML = pkmnname
                }
                if (hintsenabled == "1" | hintsenabled == "") {
                    let trait1 = arr[i][1][1]
                    let trait2 = arr[i][1][2]
                    let trait3 = arr[i][1][3]
                    let set = arr[i][1][0]
                    let cost = arr[i][1][4]
                    b.innerHTML += "<br><span class=\"dropinfo\"> Set " + set + "," + "Cost " + cost + "," +  trait1 + "," + (trait2 == "" ? "None" : trait2) + "," + (trait3 == "" ? "None" : trait3) + "</span>";
                }
                let value = pkmnname.replace("'", "&#39;")
                b.innerHTML += "<input type='hidden' value='" + value + "'>";
                b.addEventListener("click", function (e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}