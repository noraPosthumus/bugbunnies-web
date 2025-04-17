function normalizePath(path) {
    path = path.replace(/\.[^/.]+$/, ''); // Removes file extensions
  
    // Remove trailing slash (to ensure "page" and "page/" are the same)
    return path.replace(/\/$/, '');
}

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