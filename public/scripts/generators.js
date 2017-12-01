/* [G]et a [r]andom element from list */
function gr(list) {
    return list[Math.floor(Math.random()*list.length)];
}

/* [G]et a [r]andom index from list */
function gri(list) {
    return Math.floor(Math.random()*list.length);
}

function release(element, index) {
    $(element).parent().remove();
    already_added_items.pop(already_added_items.indexOf(index));
}

function refresh(element, key) {
    $(element).html(gr(map[key]));   
}

function refreshRange(element, key, min, max) {
    $(element).html(Math.floor(Math.random()* max - min));
}

already_added_items = [];
function additem() {
    index = gri(lines);
    if(already_added_items.length > mapSize()) {
        alert("Sorry, no more backstory items exist right now!");
        return;
        //TODO Hide add button
        //TODO Remove spans
    }
    if(already_added_items.indexOf(index) > -1) {
        additem();
        return;
    }   
    already_added_items.push(index);
    $('#backstory_list').append(`<span class='dynamic_item'><span class='dynamic_tag_remove' onclick='release(this, ${index}'>X</span>${lines[index]}</span>`);   
}

function mapSize() {
    var inp = 0;
    for(i in map) {
        inp++;   
    }
    return inp;
}

function gen(key) {
    return `<span class='dynamic_tag' onclick='refresh(this, \"${key}\")'>${gr(map[key])}</span>`;   
}

function genNumber(keyRange, key) {
    return `<span class='dynamic_tag' onclick='refreshRange(this, \"${key || "number"}\", ${keyRange[0]}, ${keyRange[1]})'>${Math.floor(Math.random()*keyRange[1]-keyRange[0])}</span>`;
}

function title(str) {
    return `${str.substr(0, 1).toUpperCase()}${str.substr(1)}`;
}