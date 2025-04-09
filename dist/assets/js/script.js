/**
* This function sets the open attribute of the element targeted in the location hash
**/
function openTarget() {
    const hashes = location.hash.substring(1).split('#');
    hashes.forEach(hash => {
        if (hash) {
            const target = document.getElementById(hash);
            console.log(hash)
            if (target) {
                const details = target.closest('details');
                if (details)
                    details.open = true;
            }
        }
    })
}

window.addEventListener('load', openTarget)
window.addEventListener('hashchange', openTarget)

function removeHashFromLocation(value) {
    location.hash = location.hash.replaceAll('#' + value, '');
}

function addHashToLocation(value) {
    removeHashFromLocation(value);
    location.hash += '#' + value;
}

function handleAccordionToggle(event) {
    if (event.newState === "open") {
        addHashToLocation(event.target.id);
    } else {
        removeHashFromLocation(event.target.id);
    }
}

Array.from(document.getElementsByClassName('accordion__element')).forEach(accordionToggle => {
    accordionToggle.addEventListener('toggle', handleAccordionToggle);
})
