// Speaker database with sample data
const speakerDatabase = {
    "speakers": [
        {
            "id": "jbl-srx835p",
            "manufacturer": "JBL",
            "model": "SRX835P",
            "type": "point-source",
            "power": 2000,
            "maxSPL": 134,
            "sensitivity": 99,
            "horizontalCoverage": 90,
            "verticalCoverage": 50,
            "mountTypes": ["stand", "flying", "wall"],
            "imageUrl": null
        },
        {
            "id": "qsc-k12-2",
            "manufacturer": "QSC",
            "model": "K12.2",
            "type": "point-source",
            "power": 2000,
            "maxSPL": 132,
            "sensitivity": 98,
            "horizontalCoverage": 75,
            "verticalCoverage": 75,
            "mountTypes": ["stand", "wall"],
            "imageUrl": null
        },
        {
            "id": "ev-zlx-15p",
            "manufacturer": "EV",
            "model": "ZLX-15P",
            "type": "point-source",
            "power": 1000,
            "maxSPL": 126,
            "sensitivity": 94,
            "horizontalCoverage": 90,
            "verticalCoverage": 60,
            "mountTypes": ["stand", "wall"],
            "imageUrl": null
        },
        {
            "id": "bose-freespace-ds100se",
            "manufacturer": "Bose",
            "model": "FreeSpace DS100SE",
            "type": "ceiling",
            "power": 70,
            "maxSPL": 110,
            "sensitivity": 89,
            "horizontalCoverage": 360,
            "verticalCoverage": 120,
            "mountTypes": ["ceiling", "in-ceiling"],
            "imageUrl": null
        },
        {
            "id": "yamaha-dxr15",
            "manufacturer": "Yamaha",
            "model": "DXR15",
            "type": "point-source",
            "power": 1100,
            "maxSPL": 135,
            "sensitivity": 99,
            "horizontalCoverage": 90,
            "verticalCoverage": 60,
            "mountTypes": ["stand", "flying", "wall"],
            "imageUrl": null
        }
    ],
    "manufacturers": [
        "JBL", "QSC", "EV", "Yamaha", "Bose", "Martin Audio", "Danley", "Meyer Sound"
    ],
    "types": [
        {"id": "point-source", "name": "Point Source"},
        {"id": "line-array", "name": "Line Array"},
        {"id": "ceiling", "name": "Ceiling"},
        {"id": "surface-mount", "name": "Surface Mount"},
        {"id": "subwoofer", "name": "Subwoofer"}
    ],
    "mountTypes": [
        {"id": "stand", "name": "Floor Stand"},
        {"id": "flying", "name": "Flying/Rigged"},
        {"id": "wall", "name": "Wall Mount"},
        {"id": "ceiling", "name": "Ceiling Mount"},
        {"id": "in-ceiling", "name": "In-Ceiling"},
        {"id": "in-wall", "name": "In-Wall"}
    ]
};

// Global variables for app state
let placedSpeakers = [];
let nextSpeakerId = 1;
let selectedSpeakerId = null;
let selectedDatabaseSpeakerId = null;
let coverageVisible = true;
let splValuesVisible = false;
let currentView = 'top';
let currentTool = 'speaker';

// Initialize when page loads
window.onload = function() {
    initializeSpeakerDatabase();
    
    // Set up room editor click handler for adding speakers
    document.getElementById('room-editor').addEventListener('click', function(event) {
        if (event.target === this || event.target.className === 'room' || event.target.className === 'room-label') {
            if (currentTool === 'speaker') {
                addSpeakerToRoom(event.offsetX, event.offsetY);
            }
        }
    });
    
    // Initialize with first speaker selected
    selectSpeaker(1);
    selectSpeakerModel('jbl-srx835p');
};

// Initialize the speaker database
function initializeSpeakerDatabase() {
    // Populate manufacturer filter
    const manufacturerSelect = document.getElementById('manufacturer-filter');
    speakerDatabase.manufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerSelect.appendChild(option);
    });
    
    // Populate type filter
    const typeSelect = document.getElementById('type-filter');
    speakerDatabase.types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        typeSelect.appendChild(option);
    });
    
    // Populate mount type filter
    const mountSelect = document.getElementById('mount-filter');
    speakerDatabase.mountTypes.forEach(mountType => {
        const option = document.createElement('option');
        option.value = mountType.id;
        option.textContent = mountType.name;
        mountSelect.appendChild(option);
    });
    
    // Initial rendering of speakers
    renderSpeakerList(speakerDatabase.speakers);
}

// Render the speaker list
function renderSpeakerList(speakers) {
    const container = document.getElementById('speaker-list-container');
    container.innerHTML = ''; // Clear existing content
    
    if (speakers.length === 0) {
        container.innerHTML = '<div class="no-results">No speakers match your criteria</div>';
        return;
    }
    
    speakers.forEach(speaker => {
        const speakerEl = document.createElement('div');
        speakerEl.className = 'speaker-item';
        speakerEl.onclick = () => selectSpeakerModel(speaker.id);
        
        // Create simple speaker icon based on type
        let speakerIcon = '🔊'; // Default speaker emoji
        if (speaker.type === 'ceiling') {
            speakerIcon = '⚪'; // Circle for ceiling speakers
        } else if (speaker.type === 'subwoofer') {
            speakerIcon = '⬛'; // Square for subwoofers
        } else if (speaker.type === 'line-array') {
            speakerIcon = '▬'; // Line for line arrays
        }
        
        // Determine primary mount type for indicator
        let mountIconClass = '';
        if (speaker.mountTypes.includes('ceiling') || speaker.mountTypes.includes('in-ceiling')) {
            mountIconClass = 'mount-ceiling';
        } else if (speaker.mountTypes.includes('wall') || speaker.mountTypes.includes('in-wall')) {
            mountIconClass = 'mount-wall';
        } else if (speaker.mountTypes.includes('stand')) {
            mountIconClass = 'mount-stand';
        }
        
        speakerEl.innerHTML = `
            <div class="speaker-icon">
                <div style="font-size: 24px;">${speakerIcon}</div>
                <div class="mount-type-indicator ${mountIconClass}"></div>
            </div>
            <div class="speaker-details">
                <div class="speaker-manufacturer">${speaker.manufacturer}</div>
                <div class="speaker-model">${speaker.model}</div>
                <div class="speaker-specs">${speaker.horizontalCoverage}° × ${speaker.verticalCoverage}°</div>
                <div class="speaker-specs">${speaker.maxSPL}dB SPL</div>
            </div>
        `;
        
        // Highlight if this is the selected model
        if (speaker.id === selectedDatabaseSpeakerId) {
            speakerEl.classList.add('selected');
        }
        
        container.appendChild(speakerEl);
    });
}

// Filter speakers based on search input and dropdown selections
function filterSpeakers() {
    const searchTerm = document.getElementById('speaker-search').value.toLowerCase();
    const manufacturer = document.getElementById('manufacturer-filter').value;
    const type = document.getElementById('type-filter').value;
    const mountType = document.getElementById('mount-filter').value;
    
    // Apply filters
    const filteredSpeakers = speakerDatabase.speakers.filter(speaker => {
        // Search term filter
        const matchesSearch = 
            speaker.manufacturer.toLowerCase().includes(searchTerm) ||
            speaker.model.toLowerCase().includes(searchTerm);
        
        // Manufacturer filter
        const matchesManufacturer = 
            manufacturer === '' || speaker.manufacturer === manufacturer;
        
        // Type filter
        const matchesType = 
            type === '' || speaker.type === type;
        
        // Mount type filter
        const matchesMountType = 
            mountType === '' || speaker.mountTypes.includes(mountType);
        
        return matchesSearch && matchesManufacturer && matchesType && matchesMountType;
    });
    
    renderSpeakerList(filteredSpeakers);
}

// Function to find a speaker by ID in the database
function getSpeakerById(speakerId) {
    return speakerDatabase.speakers.find(speaker => speaker.id === speakerId);
}

// Select a speaker model from the database
function selectSpeakerModel(speakerId) {
    selectedDatabaseSpeakerId = speakerId;
    
    // Get speaker data from database
    const speakerData = getSpeakerById(speakerId);
    
    // Highlight the selected speaker in the list
    document.querySelectorAll('.speaker-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Find and highlight the clicked element
    const speakerElements = document.querySelectorAll('.speaker-item');
    for (let i = 0; i < speakerElements.length; i++) {
        if (speakerElements[i].querySelector('.speaker-model').textContent === speakerData.model) {
            speakerElements[i].classList.add('selected');
            break;
        }
    }
    
    // If a speaker is currently selected in the room, update its model
    if (selectedSpeakerId !== null) {
        // Find the placed speaker object
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            // Update the speaker model
            placedSpeakers[speakerIndex].databaseId = speakerId;
            
            // Update properties panel
            updatePropertiesPanel(selectedSpeakerId);
        }
    }
}

// Select a tool
function selectTool(tool) {
    currentTool = tool;
    
    // Update tool button styling
    document.getElementById('speaker-tool').classList.toggle('active', tool === 'speaker');
    document.getElementById('move-tool').classList.toggle('active', tool === 'move');
    
    // Update cursor on room editor
    const roomEditor = document.getElementById('room-editor');
    roomEditor.style.cursor = tool === 'speaker' ? 'crosshair' : 'move';
}

// Switch between top and side views
function switchView(viewType) {
    currentView = viewType;
    
    // Update button states
    document.getElementById('top-view-btn').classList.toggle('active', viewType === 'top');
    document.getElementById('side-view-btn').classList.toggle('active', viewType === 'side');
    
    // Update view label
    document.getElementById('room-view-label').textContent = viewType === 'top' ? 'Top View' : 'Side View';
}

// Add a new speaker to the room
function addSpeakerToRoom(x, y) {
    if (!selectedDatabaseSpeakerId) {
        alert('Please select a speaker model first');
        return;
    }
    
    const speakerData = getSpeakerById(selectedDatabaseSpeakerId);
    
    // Get default mount type (first available for this speaker)
    const defaultMountType = speakerData.mountTypes[0];
    
    // Create a new speaker object with mount information
    const newSpeaker = {
        id: nextSpeakerId++,
        databaseId: selectedDatabaseSpeakerId,
        x: x,
        y: y,
        mountType: defaultMountType,
        mountHeight: defaultMountType === 'ceiling' || defaultMountType === 'in-ceiling' ? 300 : 120,
        rotation: 0,
        tilt: defaultMountType === 'ceiling' || defaultMountType === 'in-ceiling' ? 90 : 0,
        power: Math.round(speakerData.power / 10)
    };
    
    placedSpeakers.push(newSpeaker);
    
    // Create speaker element in the DOM
    createSpeakerElement(newSpeaker);
    
    // Select the new speaker
    selectSpeaker(newSpeaker.id);
    
    // Update speaker count
    document.getElementById('speaker-count').textContent = `Speakers: ${placedSpeakers.length}`;
}

// Create a speaker element in the DOM
function createSpeakerElement(speaker) {
    const roomEditor = document.getElementById('room-editor');
    
    // Create speaker element
    const speakerEl = document.createElement('div');
    speakerEl.className = `speaker speaker-mount-${speaker.mountType}`;
    speakerEl.id = 'speaker' + speaker.id;
    speakerEl.onclick = (e) => {
        e.stopPropagation();
        selectSpeaker(speaker.id);
    };
    speakerEl.style.left = speaker.x + 'px';
    speakerEl.style.top = speaker.y + 'px';
    
    // Create coverage element
    const coverageEl = document.createElement('div');
    coverageEl.className = 'speaker-coverage';
    coverageEl.id = 'coverage' + speaker.id;
    coverageEl.style.left = speaker.x + 'px';
    coverageEl.style.top = speaker.y + 'px';
    coverageEl.style.display = coverageVisible ? 'block' : 'none';
    
    // Add elements to the room
    roomEditor.appendChild(speakerEl);
    roomEditor.appendChild(coverageEl);
}

// Select a speaker when clicked
function selectSpeaker(id) {
    // Deselect previously selected speaker
    if (selectedSpeakerId) {
        const prevSpeaker = document.getElementById('speaker' + selectedSpeakerId);
        if (prevSpeaker) {
            prevSpeaker.classList.remove('selected');
        }
    }
    
    // Select new speaker
    selectedSpeakerId = id;
    const speakerEl = document.getElementById('speaker' + id);
    if (speakerEl) {
        speakerEl.classList.add('selected');
    }
    
    // Update properties panel
    updatePropertiesPanel(id);
}

// Update properties panel when a speaker is selected
function updatePropertiesPanel(speakerId) {
    const speaker = placedSpeakers.find(s => s.id === speakerId);
    if (!speaker) {
        // Handle static speakers for demo
        const speakerData = getSpeakerById(selectedDatabaseSpeakerId || 'jbl-srx835p');
        document.getElementById('model-value').textContent = speakerData ? `${speakerData.manufacturer} ${speakerData.model}` : 'Demo Speaker';
        return;
    }
    
    const speakerData = getSpeakerById(speaker.databaseId);
    
    // Update values in the properties panel
    document.getElementById('model-value').textContent = `${speakerData.manufacturer} ${speakerData.model}`;
    document.getElementById('x-position').value = Math.round(speaker.x) + ' cm';
    document.getElementById('y-position').value = Math.round(speaker.y) + ' cm';
    document.getElementById('rotation').value = speaker.rotation + '°';
    document.getElementById('tilt').value = speaker.tilt + '°';
    document.getElementById('power').value = speaker.power + 'W';
    document.getElementById('mount-height').value = speaker.mountHeight + ' cm';
    
    // Update mount type dropdown
    const mountTypeSelect = document.getElementById('mount-type');
    mountTypeSelect.innerHTML = ''; // Clear existing options
    
    // Only show mount types that are valid for this speaker
    speakerData.mountTypes.forEach(mountType => {
        const mountTypeInfo = speakerDatabase.mountTypes.find(mt => mt.id === mountType);
        if (mountTypeInfo) {
            const option = document.createElement('option');
            option.value = mountType;
            option.textContent = mountTypeInfo.name;
            option.selected = (speaker.mountType === mountType);
            mountTypeSelect.appendChild(option);
        }
    });
}

// Toggle coverage visualization
function toggleCoverage() {
    coverageVisible = !coverageVisible;
    
    // Update checkbox appearance
    const checkbox = document.getElementById('coverage-checkbox');
    checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    // Show/hide coverage visualization
    const overlay = document.getElementById('coverage-overlay');
    overlay.style.display = coverageVisible ? 'block' : 'none';
    
    // Show/hide individual speaker coverage patterns
    for (let i = 1; i <= 3; i++) {
        const coverage = document.getElementById('coverage' + i);
        if (coverage) {
            coverage.style.display = coverageVisible ? 'block' : 'none';
        }
    }
}

// Toggle SPL value visibility
function toggleSplValues() {
    splValuesVisible = !splValuesVisible;
    
    // Update checkbox appearance
    const checkbox = document.getElementById('spl-checkbox');
    checkbox.className = splValuesVisible ? 'checkbox checked' : 'checkbox unchecked';
}

// Update functions for properties
function updatePosition() {
    if (selectedSpeakerId && placedSpeakers.find(s => s.id === selectedSpeakerId)) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            const xValue = parseInt(document.getElementById('x-position').value);
            const yValue = parseInt(document.getElementById('y-position').value);
            
            placedSpeakers[speakerIndex].x = xValue;
            placedSpeakers[speakerIndex].y = yValue;
            
            // Update DOM elements
            const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
            const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
            if (speakerEl) speakerEl.style.left = xValue + 'px';
            if (speakerEl) speakerEl.style.top = yValue + 'px';
            if (coverageEl) coverageEl.style.left = xValue + 'px';
            if (coverageEl) coverageEl.style.top = yValue + 'px';
        }
    }
}

function updateRotation() {
    if (selectedSpeakerId) {
        const rotation = parseInt(document.getElementById('rotation').value);
        console.log(`Speaker ${selectedSpeakerId} rotation updated to ${rotation}°`);
    }
}

function updateTilt() {
    if (selectedSpeakerId) {
        const tilt = parseInt(document.getElementById('tilt').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].tilt = tilt;
        }
    }
}

function updateMountType() {
    if (selectedSpeakerId) {
        const mountType = document.getElementById('mount-type').value;
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].mountType = mountType;
            
            // Update default height based on mount type
            if (mountType === 'ceiling' || mountType === 'in-ceiling') {
                placedSpeakers[speakerIndex].mountHeight = 300;
                document.getElementById('mount-height').value = '300 cm';
            } else if (mountType === 'wall' || mountType === 'in-wall') {
                placedSpeakers[speakerIndex].mountHeight = 200;
                document.getElementById('mount-height').value = '200 cm';
            } else {
                placedSpeakers[speakerIndex].mountHeight = 120;
                document.getElementById('mount-height').value = '120 cm';
            }
        }
    }
}

function updateMountHeight() {
    if (selectedSpeakerId) {
        const mountHeight = parseInt(document.getElementById('mount-height').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].mountHeight = mountHeight;
        }
    }
}

function updatePower() {
    if (selectedSpeakerId) {
        const power = parseInt(document.getElementById('power').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].power = power;
        }
    }
}

function updateTargetSpl() {
    const targetSpl = parseInt(document.getElementById('target-spl').value);
    console.log(`Target SPL updated to ${targetSpl} dB`);
}

function updateEarHeight() {
    const earHeight = parseInt(document.getElementById('ear-height').value);
    console.log(`Ear height updated to ${earHeight} cm`);
}

// Delete selected speaker
function deleteSelectedSpeaker() {
    if (selectedSpeakerId) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            if (confirm(`Delete speaker ${selectedSpeakerId}?`)) {
                // Remove from the DOM
                const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
                const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
                
                if (speakerEl) speakerEl.remove();
                if (coverageEl) coverageEl.remove();
                
                // Remove from the array
                placedSpeakers.splice(speakerIndex, 1);
                
                // Reset selection
                selectedSpeakerId = null;
                
                // Update status bar
                document.getElementById('speaker-count').textContent = `Speakers: ${placedSpeakers.length}`;
                
                // Update model value display
                document.getElementById('model-value').textContent = 'Select a speaker';
            }
        } else {
            alert('Cannot delete demo speakers. Please add your own speakers first.');
        }
    } else {
        alert('No speaker selected');
    }
}

// Show premium feature dialog
function showPremiumDialog() {
    document.getElementById('premium-overlay').style.display = 'flex';
}

// Close premium feature dialog
function closePremiumDialog() {
    document.getElementById('premium-overlay').style.display = 'none';
}

// Upgrade to premium
function upgradeToPremium() {
    alert('Thank you for upgrading! PDF Report feature is now available.');
    closePremiumDialog();
}

// Save and Load functions
function saveLayout() {
    const layoutData = {
        speakers: placedSpeakers,
        settings: {
            targetSpl: document.getElementById('target-spl').value,
            earHeight: document.getElementById('ear-height').value
        }
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'speaker-layout.json';
    link.click();
}

function loadLayout() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const layoutData = JSON.parse(e.target.result);
                    // Implementation would restore the layout
                    alert('Layout loaded successfully!');
                } catch (error) {
                    alert('Error loading layout file.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}
