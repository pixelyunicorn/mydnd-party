const map = {};
function addToLookupTable(event, starti, endi, key) {
    key = key || "default";
    if (!map[key]) {
        map[key] = [];
    }
    for (let i = starti; i <= endi; i++) {
        map[key][i] = event;
    }
}

function pullFromLookupTable(length, key) {
    let random = Math.ceil(Math.random() * length);
    key = key || "default";
    let response = map[key][random];
    return {index: random, value: response};
}