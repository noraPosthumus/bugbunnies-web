
    /**
 * UI Management System
 * Handles draggable UI elements, security radar, alerts and their visualization
 */

// Get saved UI state from storage
let localUIState = getUIState();

// Global references
let securityRadarSvg, securityLog;
let securityRadar, draggableSecurityRadar;
let infoCard, draggableInfoCard;
let cards, draggableCards;
let blips = [];
let nextLogId = 1;
let cardColors = []; // Store card background colors

/**
 * Initialize all UI components and start security monitoring
 */
function initializeUI() {
    // Set up main UI components

    // Set initial opacity to 0 (will be revealed by radar)
    if(!localUIState?.animationState?.cardPositions) {
        Array.from(document.getElementsByClassName('card')).forEach(card => {
            card.style.opacity = 0;
        })
    }

    radarHTMLString = `    <div id="js_security-radar" class="security-radar">
        <h3>
            Security Radar
        </h3>
        <svg id="radar" viewBox="0 0 200 200" width="200" height="200" stroke="#fff" filter="url(#red-glow)">
            <!-- Background Grid Circles -->
            <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" stroke-width="2" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" stroke-width="2" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="#fff" stroke-width="2" />

            <!-- Crosshairs -->
            <line x1="100" y1="0" x2="100" y2="200" stroke="#fff" stroke-width="2" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#fff" stroke-width="2" />

            <!-- Rotating Sweep Group -->
            <g id="sweep">
                <path d="M100 100 L100 190 A90 90 0 0 1 10 100 Z" fill="url(#sweepGradient)" />
            </g>

            <!-- Gradient for sweep effect -->
            <defs>
                <radialGradient id="sweepGradient" cx="100" cy="100" r="90" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#fff" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#fff" stop-opacity="0" />
                </radialGradient>

                <filter id="red-glow" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
                    <!-- blur the text at different levels-->
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur5" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur10" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur20" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur30" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blur50" />
                    <!-- merge all the blurs except for the first one -->
                    <feMerge result="blur-merged">
                        <feMergeNode in="blur10" />
                        <feMergeNode in="blur20" />
                        <feMergeNode in="blur30" />
                        <feMergeNode in="blur50" />
                    </feMerge>
                    <feMerge>
                        <feMergeNode in="blur-merged" /> <!-- largest blurs coloured red -->
                        <feMergeNode in="blur5" /> <!-- smallest blur left white -->
                        <feMergeNode in="SourceGraphic" /> <!-- original white text -->
                    </feMerge>
                </filter>
            </defs>
        </svg>
        <style>
            #sweep {
                transform-origin: center;
                animation: spin 4s linear infinite;
            }

            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }

                to {
                    transform: rotate(360deg);
                }
            }
        </style>
        <p id="js_security-radar__log" class="security-radar__log"></p>
    </div>`
    const securityRadarTemplate = document.createElement('template');
    securityRadarTemplate.innerHTML = radarHTMLString.trim();
    document.getElementById("team-member-list").appendChild(securityRadarTemplate.content.firstChild);
    securityRadarSvg = document.getElementById('radar');
    securityLog = document.getElementById('js_security-radar__log');
    
    const radarElements = initializeSecurityRadar();
    securityRadar = radarElements.securityRadar;
    draggableSecurityRadar = radarElements.draggableSecurityRadar;

    const infoCardElements = initializeInfoCard();
    infoCard = infoCardElements.infoCard;
    draggableInfoCard = infoCardElements.draggableInfoCard;
    
    const alertElements = initializeAlerts(localUIState?.animationState?.cardPositions);
    cards = alertElements.cards;
    draggableCards = alertElements.draggableCards;
    
    // Extract card background colors for matching blips
    extractCardColors();
    
    // Configure z-index management for all windows
    const allWindows = [draggableSecurityRadar, draggableInfoCard, ...draggableCards];
    allWindows.forEach(window => {
        window.onDragStart = () => reorderZIndex(window, allWindows);
    });
    
    // Start the radar scanning sequence
    startRadarMonitoring();
}

/**
 * Extract background colors from all cards for blip matching
 */
function extractCardColors() {
    cardColors = cards.map(card => {
        // Get computed style to extract actual background color
        const cardStyle = window.getComputedStyle(card);
        const bgColor = cardStyle.backgroundColor || '#ffffff';
        return bgColor;
    });
}

/**
 * Start monitoring for threats with periodic quadrant scans
 */
function startRadarMonitoring() {
    const quadrants = [0, 90, 180, 270];
    
    // Initial scan for each quadrant with staggered timing
    quadrants.forEach((quadrant, i) => {
        setTimeout(() => {
            scanQuadrant(quadrant);
            
            // Set up recurring scan for this quadrant
            setInterval(() => {
                scanQuadrant(quadrant);
            }, 4000);
        }, i * 1000 + 1000);
    });
}

/**
 * Generate a formatted timestamp for the security log
 * @return {String} Formatted timestamp [HH:MM:SS]
 */
function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `[${hours}:${minutes}]`;
}

/**
 * Add a threat detection entry to the security log
 */
function logThreatDetection() {
    const timestamp = getTimestamp();
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    logEntry.id = `log-${nextLogId++}`;
    logEntry.textContent = `${timestamp} Threat Detected!`;
    
    // Add to log with newest entries at the top
    if (securityLog.firstChild) {
        securityLog.insertBefore(logEntry, securityLog.firstChild);
    } else {
        securityLog.appendChild(logEntry);
    }
    
    // Limit log entries to prevent overflow
    const maxEntries = 10;
    while (securityLog.childElementCount > maxEntries) {
        securityLog.removeChild(securityLog.lastChild);
    }
}

/**
 * Scan a specific quadrant for threats and update radar display
 * @param {Number} quadrant - Quadrant angle (0, 90, 180, 270)
 */
function scanQuadrant(quadrant) {
    const targetPositions = getCardPositions();
    const detectedThreats = [];
    
    // Process targets in this quadrant
    targetPositions.forEach((targetPosition, i) => {
        const targetAngle = Math.atan2(
            (targetPosition.y - window.innerHeight / 2), 
            (targetPosition.x - window.innerWidth / 2)
        );
        
        // Convert to degrees and normalize to 0-360 range
        let angleInDegrees = targetAngle * (180/Math.PI);
        angleInDegrees = (angleInDegrees + 360) % 360;
        
        // Determine if target belongs to current quadrant
        const quadrantAngle = Math.abs(Math.ceil(angleInDegrees / 90) * 90) % 360;
        
        if (quadrantAngle === quadrant) {
            // Track detected threats for logging
            detectedThreats.push({
                position: targetPosition,
                angle: targetAngle,
                cardIndex: i
            });
            
            // Find existing blip for this card
            const existingBlipIndex = blips.findIndex(blip => 
                blip.cardIndex === i
            );
            
            // Calculate position on radar relative to center
            const x = 100 + (Math.abs(targetPosition.x - window.innerWidth * 0.5) / 
                     (window.innerWidth * 0.5)) * 90 * Math.cos(targetAngle);
                     
            const y = 100 + (Math.abs(targetPosition.y - window.innerHeight * 0.5) / 
                     (window.innerHeight * 0.5)) * 90 * Math.sin(targetAngle);
            
            if (existingBlipIndex >= 0) {
                // Update existing blip position
                const blip = blips[existingBlipIndex].blip;
                blip.setAttribute("cx", x);
                blip.setAttribute("cy", y);
                blips[existingBlipIndex].angle = angleInDegrees;
            } else {
                // First detection of this card - create new blip
                blips.push({
                    ...createBlip(x, y, angleInDegrees, i),
                    cardIndex: i
                });
                
                // Reveal the card in sync with detection
                revealCard(i);
                
                // Log the new threat
                logThreatDetection();
            }
        }
    });
}

/**
 * Reveal a card after detection by the radar
 * @param {Number} cardIndex - Index of the card to reveal
 */
function revealCard(cardIndex) {
    const card = draggableCards[cardIndex];

    card.element.style.opacity = 1;
}

/**
 * Gets current positions of all alert cards
 * @return {Array} Positions of all cards 
 */
function getCardPositions() {
    return cards.map(card => ({
        x: card.getBoundingClientRect().x, 
        y: card.getBoundingClientRect().y,
        z: card.style.zIndex
    }));
}

/**
 * Make any DOM element draggable with constraints
 * @param {HTMLElement} element - Element to make draggable
 * @return {Object} Draggable element object
 */
function makeDraggable(element) {
    const draggableElement = new PlainDraggable(element);
    draggableElement.containment = { 
        left: 0, 
        top: '10%', 
        width: '100%', 
        height: '85%' 
    };
    draggableElement.zIndex = false;
    return draggableElement;
}

/**
 * Initialize the security radar component
 * @return {Object} References to the radar element and its draggable wrapper
 */
function initializeSecurityRadar() {
    const securityRadar = document.getElementById('js_security-radar');
    const draggableSecurityRadar = makeDraggable(securityRadar);
    
    // Position from saved state or centered default
    draggableSecurityRadar.left = 
        localUIState?.animationState?.securityRadarPosition?.left || 
        (window.innerWidth - 350) / 2;
    
    draggableSecurityRadar.top = 
        localUIState?.animationState?.securityRadarPosition?.top || 
        (window.innerHeight - 410) / 2;
    
    securityRadar.style.zIndex = 
        localUIState?.animationState?.securityRadarPosition?.zIndex || 0;

    return {securityRadar, draggableSecurityRadar};
}

function initializeInfoCard() {
    const infoCard = document.getElementById('js_info-card');
    const draggableInfoCard = makeDraggable(infoCard);

    draggableInfoCard.left = 
    localUIState?.animationState?.infoCardPosition?.left || 
    250;

    draggableInfoCard.top = 
    localUIState?.animationState?.infoCardPosition?.top || 
    250;

    infoCard.style.zIndex = 
    localUIState?.animationState?.infoCardPosition?.zIndex || 1;

    return {infoCard, draggableInfoCard};
}

/**
 * Manage z-index when elements are clicked/dragged to bring to front
 * @param {Object} newActive - Element being activated
 * @param {Array} windows - All draggable window elements
 */
function reorderZIndex(newActive, windows) {
    // Decrement z-index of windows that are above the activated window
    windows.forEach(window => {
        if (parseInt(newActive.element.style.zIndex) < parseInt(window.element.style.zIndex)) {
            window.element.style.zIndex = parseInt(window.element.style.zIndex) - 1;
        }
    });
    
    // Move activated window to top
    newActive.element.style.zIndex = windows.length - 1;
}

/**
 * Calculate position for an alert based on its index and desired layout
 * @param {Number} i - Index of the alert
 * @param {Number} maxI - Total number of alerts
 * @param {Object} center - Center point coordinates
 * @param {Number} radius - Radius of the circular layout
 * @param {Number} maxJitter - Maximum random position variation
 * @return {Object} Calculated x,y coordinates
 */
function calculateAlertLocation(i, maxI, center, radius, maxJitter) {
    const angle = (2 * Math.PI / maxI) * i;

    // Base position on a circle
    let x = center.x + radius * Math.cos(angle);
    let y = center.y + radius * Math.sin(angle);

    // Constrain vertical position
    y = Math.max(y, window.innerHeight * 0.2);
    y = Math.min(y, window.innerHeight * 0.85);

    // Add random variation
    x += (Math.random() - 0.5) * maxJitter * 2;
    y += (Math.random() - 0.5) * maxJitter * 2;

    return { x, y };
}

/**
 * Initialize alert cards with positions and animations
 * @param {Array} positions - Saved positions or 0 to calculate new positions
 * @return {Object} References to cards and their draggable wrappers
 */
function initializeAlerts(positions = []) {
    const cards = Array.from(document.getElementsByClassName('card'));
    const draggableCards = cards.map(makeDraggable);
    
    const screenCenter = { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
    };
    const radius = 500;
    const maxJitter = 80;

    draggableCards.forEach((card, i) => {
        if (!positions[i]) { 

            // Calculate new positions if not saved
            const { x, y } = calculateAlertLocation(
                i, 
                cards.length, 
                screenCenter, 
                radius, 
                maxJitter
            );

            // Center card on position
            card.left = x - (card.offsetWidth || 215) / 2;
            card.top = y - (card.offsetHeight || 85) / 2;
            card.element.style.zIndex = i + 2;
        } else {
            // Use saved positions
            card.left = positions[i].x;
            card.top = positions[i].y;
            card.element.style.zIndex = positions[i].zIndex;
        }
    });

    return {cards, draggableCards};
}

/**
 * Create a radar blip at specified coordinates with matching card color
 * @param {Number} x - X coordinate on SVG
 * @param {Number} y - Y coordinate on SVG
 * @param {Number} angle - Angle of the blip
 * @param {Number} cardIndex - Index of the associated card
 * @return {Object} Blip object with reference and angle
 */
function createBlip(x, y, angle, cardIndex) {
    let blip = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    // Use the card's background color for the blip
    const blipColor = cardColors[cardIndex] || "#ffffff";

    blip.setAttribute("cx", x);
    blip.setAttribute("cy", y);
    blip.setAttribute("r", 5);
    blip.setAttribute("fill", blipColor);
    blip.classList.add("blip");
    blip.setAttribute("opacity", "1");
    
    securityRadarSvg.appendChild(blip);

    return { blip: blip, angle: angle };
}

// Initialize the UI system when the script loads
if (window.innerWidth > 600) {
    initializeUI();
}


window.addEventListener('beforeunload', () => {
    // Save card positions
    updateUIState("animationState", { 
        "cardPositions": getCardPositions().map(card => ({ 
            x: card.x, 
            y: card.y, 
            zIndex: parseInt(card.z) || 0 
        }))
    });
    
    // Save radar position in the same state object
    updateUIState("animationState", { 
        "securityRadarPosition": { 
            top: draggableSecurityRadar.top, 
            left: draggableSecurityRadar.left, 
            zIndex: parseInt(securityRadar.style.zIndex) || 0 
        }
    });

    updateUIState("animationState", { 
        "infoCardPosition": { 
            top: infoCard.top, 
            left: draggableInfoCard.left, 
            zIndex: parseInt(infoCard.style.zIndex) || 1 
        }
    });
});

