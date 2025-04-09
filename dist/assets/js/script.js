function normalizePath(path) {
    path = path.replace(/\.[^/.]+$/, ''); // Removes file extensions
  
    // Remove trailing slash (to ensure "page" and "page/" are the same)
    return path.replace(/\/$/, '');
}

function handleAccordionToggle(event) {
    updateUIState("accordionState", {[event.target.id]: event.newState})
}

Array.from(document.getElementsByClassName('accordion__element')).forEach(accordionToggle => {
    accordionToggle.addEventListener('toggle', handleAccordionToggle);
})

function getUIState() {
    const globalUIState = JSON.parse(sessionStorage.getItem('uiState') || '{}');
    return globalUIState[normalizePath(window.location.pathname)] || {};
}

function updateUIState(state, update) {
    const globalUIState = JSON.parse(sessionStorage.getItem('uiState') || '{}');
    let localUIState = getUIState();
    localUIState = {...localUIState, [state]: {...localUIState[state], ...update}};
    sessionStorage.setItem('uiState', JSON.stringify({
        ...globalUIState,
        ...{[normalizePath(window.location.pathname)]: localUIState}
    }));
}

function handleLoad() {
    localUIState = getUIState();

    // apply accordionState
    Object.entries(localUIState.accordionState || {}).forEach(([key, value]) => {
        target = document.getElementById(key);
        if(target) {
            target.open = value == "open";
        }
    })

    // apply scrollState
    scrollPos = localUIState?.scrollState?.scrollY
    if (scrollPos !== null) window.scrollTo(0, scrollPos);

    // automatically show details of element targeted by hash
    const hash = location.hash.substring(1);
    if (hash) {
        const target = document.getElementById(hash);
        if (target) {
            const details = target.closest('details');
            if (details)
                details.open = true;
            target.scrollIntoView();
        }
    }
}

window.addEventListener('beforeunload', () => {
    updateUIState("scrollState", {"scrollY": window.scrollY})
});

window.addEventListener('load', handleLoad);
