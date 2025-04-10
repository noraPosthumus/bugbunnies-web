const searchInput = document.getElementById('js_writeup-search');
const accordionElements = document.querySelectorAll('.accordion__element');

function normalizePath(path) {
    path = path.replace(/\.[^/.]+$/, ''); // Removes file extensions
  
    // Remove trailing slash (to ensure "page" and "page/" are the same)
    return path.replace(/\/$/, '');
}

function handleAccordionToggle(event) {
    updateUIState("accordionState", {[event.target.id]: event.newState})
}

Array.from(accordionElements).forEach(accordionToggle => {
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

    // apply searchState
    if(searchInput) {
        searchInput.value = localUIState?.searchState?.searchTerm || '';
        handleSearch()
    }

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
    if(searchInput && searchInput.value != 'undefined') {
        updateUIState("searchState", {"searchTerm": searchInput.value})
    }
});

window.addEventListener('load', handleLoad);


/**
 * Search functionality (on the writeup listing):
 */

// Get the search input and all searchable elements
if(searchInput) {
    const searchableElements = document.querySelectorAll('.js_searchable');
    
    // Function to handle search filtering
    function handleSearch() {
      const searchTerm = searchInput.value.toLowerCase().trim();
      let visibleAccordions = new Set();
    
      // If search is empty, show all elements
      if (searchTerm === '') {
        searchableElements.forEach(element => {
          element.style.display = '';
        });
        
        accordionElements.forEach(accordion => {
          accordion.style.display = '';
        });
        
        return;
      }
      
      // Loop through each searchable element
      searchableElements.forEach(element => {
        // Get the text content of the element
        const textContent = element.textContent.toLowerCase();
        
        // Check if the element is an accordion header or a row
        if (element.tagName === 'DETAILS') {
          const accordionId = element.id;
          const accordionTitle = element.querySelector('.accordion__toggle').textContent.toLowerCase().trim();
          
          if (accordionTitle.includes(searchTerm)) {
            // If the accordion title matches, show all its children
            element.style.display = '';
            const rows = element.querySelectorAll('tr.js_searchable');
            rows.forEach(row => {
              row.style.display = '';
            });
            visibleAccordions.add(accordionId);
          } else {
            // If the accordion title doesn't match, check its children
            let hasVisibleChildren = false;
            const rows = element.querySelectorAll('tr.js_searchable');
            
            rows.forEach(row => {
              const rowContent = row.textContent.toLowerCase();
              if (rowContent.includes(searchTerm)) {
                row.style.display = '';
                hasVisibleChildren = true;
              } else {
                row.style.display = 'none';
              }
            });
            
            // Show/hide the accordion based on its children
            if (hasVisibleChildren) {
              element.style.display = '';
              element.open = true; // Open the accordion details
              visibleAccordions.add(accordionId);
            } else {
              element.style.display = 'none';
            }
          }
        } else if (element.tagName === 'TR') {
          const parentAccordion = element.closest('.accordion__element');
          const accordionId = parentAccordion ? parentAccordion.id : null;
          
          if (textContent.includes(searchTerm)) {
            element.style.display = '';
            if (accordionId) {
              visibleAccordions.add(accordionId);
              parentAccordion.style.display = '';
              parentAccordion.open = true; // Open the accordion details
            }
          } else if (!visibleAccordions.has(accordionId)) {
            element.style.display = 'none';
          }
        }
      });
    }
    
    searchInput.addEventListener('input', handleSearch);    
}
