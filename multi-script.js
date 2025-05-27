class MultiSpeakerSPLSimulator {
    constructor() {
        console.log('MultiSpeakerSPLSimulator constructor started');
        this.mainCanvas = document.getElementById('mainView');
        this.mainCtx = this.mainCanvas.getContext('2d');
        
        console.log('Canvas element:', this.mainCanvas);
        console.log('Canvas context:', this.mainCtx);
        
        if (!this.mainCanvas || !this.mainCtx) {
            console.error('Canvas or context not found!');
            return;
        }
        
        // Initialize speakers array
        this.speakers = [
            { x: 50, z: 50, horizontalRotation: 0, verticalTilt: 0, wall: 'front' }
        ];
        this.maxSpeakersForWall = 8;
        
        // Setup immediately - DOM should be ready when constructor is called
        this.setupEventListeners();
        this.updateMaxSpeakers();
        this.generateSpeakerControls();
        
        // Only update simulation after a small delay to ensure everything is ready
        setTimeout(() => {
            this.updateSimulation();
        }, 100);
        
        console.log('MultiSpeakerSPLSimulator constructor completed');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Only listen to elements that actually exist in the HTML
        const requiredControls = ['roomWidth', 'roomHeight', 'roomDepth', 'maxSPL', 'viewMode'];
        
        requiredControls.forEach(control => {
            const element = document.getElementById(control);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateDisplayValues();
                    this.updateSimulation();
                });
                element.addEventListener('input', () => {
                    this.updateDisplayValues();
                    this.updateSimulation();
                });
                console.log(`Event listener added for: ${control}`);
            } else {
                console.warn(`Element not found: ${control}`);
            }
        });
        
        // Speaker count control
        const numSpeakersElement = document.getElementById('numSpeakers');
        if (numSpeakersElement) {
            numSpeakersElement.addEventListener('change', () => {
                this.setNumberOfSpeakers(parseInt(numSpeakersElement.value));
            });
            numSpeakersElement.addEventListener('input', () => {
                const numSpeakersValue = document.getElementById('numSpeakersValue');
                if (numSpeakersValue) {
                    numSpeakersValue.textContent = numSpeakersElement.value;
                }
            });
            console.log('Event listener added for: numSpeakers');
        }
        
        this.updateDisplayValues();
        console.log('Event listeners setup complete');
    }
    
    updateDisplayValues() {
        const numSpeakersValue = document.getElementById('numSpeakersValue');
        const numSpeakersSlider = document.getElementById('numSpeakers');
        if (numSpeakersValue && numSpeakersSlider) {
            numSpeakersValue.textContent = numSpeakersSlider.value;
        }
    }
    
    getMaxSpeakersForWall(wallLength) {
        const MIN_SPACING = 3.0;
        const WALL_BUFFER = 1.5;
        const usableLength = wallLength - (2 * WALL_BUFFER);
        
        if (usableLength < MIN_SPACING) return 1;
        const maxSpeakers = Math.floor(usableLength / MIN_SPACING) + 1;
        return Math.min(maxSpeakers, 5); // Cap at 5 for UI management
    }
    
    updateMaxSpeakers() {
        // Set a reasonable default maximum since speakers can be on any wall
        this.maxSpeakersForWall = 8;
        
        // Update slider max value if it exists
        const numSpeakersSlider = document.getElementById('numSpeakers');
        if (numSpeakersSlider) {
            numSpeakersSlider.max = this.maxSpeakersForWall;
        }
        
        // Update info text if it exists
        const maxSpeakersInfo = document.getElementById('maxSpeakersInfo');
        if (maxSpeakersInfo) {
            maxSpeakersInfo.textContent = `Maximum ${this.maxSpeakersForWall} speakers total (3m spacing per wall)`;
        }
    }
    
    validateSpeakerCount() {
        if (this.speakers.length > this.maxSpeakersForWall) {
            this.speakers = this.speakers.slice(0, this.maxSpeakersForWall);
            const numSpeakersSlider = document.getElementById('numSpeakers');
            if (numSpeakersSlider) {
                numSpeakersSlider.value = this.speakers.length;
                this.updateDisplayValues();
            }
        }
    }.max = this.maxSpeakersForWall;
            
            // Update info text
            const maxSpeakersInfo = document.getElementById('maxSpeakersInfo');
            if (maxSpeakersInfo) {
                maxSpeakersInfo.textContent = `Maximum ${this.maxSpeakersForWall} speakers (${wallLength}m wall, 3m spacing)`;
            }
        }
    }
    
    setNumberOfSpeakers(count) {
        const validCount = Math.min(count, this.maxSpeakersForWall);
        
        // Adjust speakers array
        while (this.speakers.length < validCount) {
            this.speakers.push({ x: 50, z: 50, horizontalRotation: 0, verticalTilt: 0, wall: 'front' });
        }
        while (this.speakers.length > validCount) {
            this.speakers.pop();
        }
        
        this.distributeSpeakersEvenly();
        this.generateSpeakerControls();
        this.updateSimulation();
    }
    
    validateSpeakerCount() {
        if (this.speakers.length > this.maxSpeakersForWall) {
            this.speakers = this.speakers.slice(0, this.maxSpeakersForWall);
            const numSpeakersSlider = document.getElementById('numSpeakers');
            if (numSpeakersSlider) {
                numSpeakersSlider.value = this.speakers.length;
                this.updateDisplayValues();
            }
        }
    }
    
    distributeSpeakersEvenly() {
        for (let i = 0; i < this.speakers.length; i++) {
            this.speakers[i].x = ((i + 1) / (this.speakers.length + 1)) * 100;
        }
    }
    
    validateSpeakerSpacing(speakerIndex, newXPosition) {
        const roomWidth = parseFloat(document.getElementById('roomWidth')?.value || 10);
        const roomDepth = parseFloat(document.getElementById('roomDepth')?.value || 8);
        const speakerWall = this.speakers[speakerIndex].wall;
        
        const wallLength = (speakerWall === 'front' || speakerWall === 'back') 
            ? roomWidth : roomDepth;
        
        const newPositionMeters = (newXPosition / 100) * wallLength;
        
        // Only check spacing against speakers on the same wall
        for (let i = 0; i < this.speakers.length; i++) {
            if (i === speakerIndex || this.speakers[i].wall !== speakerWall) continue;
            
            const otherPositionMeters = (this.speakers[i].x / 100) * wallLength;
            const distance = Math.abs(newPositionMeters - otherPositionMeters);
            
            if (distance < 3.0) {
                return false;
            }
        }
        return true;
    }
    
    generateSpeakerControls() {
        const container = document.getElementById('speakerControlsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        const speakerColors = ['#ff0000', '#0080ff', '#00ff00', '#ff8000', '#8000ff'];
        
        this.speakers.forEach((speaker, index) => {
            const speakerDiv = document.createElement('div');
            speakerDiv.className = 'speaker-controls';
            speakerDiv.innerHTML = `
                <div class="speaker-header">
                    <div class="speaker-title">
                        <div class="speaker-color" style="background-color: ${speakerColors[index % speakerColors.length]};"></div>
                        🔊 Speaker ${index + 1}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="speaker${index}Wall">Wall</label>
                    <select id="speaker${index}Wall">
                        <option value="front" ${speaker.wall === 'front' ? 'selected' : ''}>Front Wall</option>
                        <option value="back" ${speaker.wall === 'back' ? 'selected' : ''}>Back Wall</option>
                        <option value="left" ${speaker.wall === 'left' ? 'selected' : ''}>Left Wall</option>
                        <option value="right" ${speaker.wall === 'right' ? 'selected' : ''}>Right Wall</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="speaker${index}X">Position on Wall (%)</label>
                    <div class="slider-group">
                        <input type="range" id="speaker${index}X" min="10" max="90" value="${speaker.x}" step="1">
                        <div class="value-display" id="speaker${index}XValue">${speaker.x}%</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="speaker${index}Z">Height on Wall (%)</label>
                    <div class="slider-group">
                        <input type="range" id="speaker${index}Z" min="10" max="90" value="${speaker.z}" step="1">
                        <div class="value-display" id="speaker${index}ZValue">${speaker.z}%</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="speaker${index}HorizontalRotation">Horizontal Rotation (°)</label>
                    <div class="slider-group">
                        <input type="range" id="speaker${index}HorizontalRotation" min="-45" max="45" value="${speaker.horizontalRotation}" step="1">
                        <div class="value-display" id="speaker${index}HorizontalRotationValue">${speaker.horizontalRotation}°</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="speaker${index}VerticalTilt">Vertical Tilt (°)</label>
                    <div class="slider-group">
                        <input type="range" id="speaker${index}VerticalTilt" min="-30" max="30" value="${speaker.verticalTilt}" step="1">
                        <div class="value-display" id="speaker${index}VerticalTiltValue">${speaker.verticalTilt}°</div>
                    </div>
                </div>
            `;
            
            container.appendChild(speakerDiv);
            
            // Add event listeners for this speaker's controls
            this.addSpeakerEventListeners(index);
        });
    }
    
    addSpeakerEventListeners(speakerIndex) {
        const controls = ['Wall', 'X', 'Z', 'HorizontalRotation', 'VerticalTilt'];
        
        controls.forEach(control => {
            const element = document.getElementById(`speaker${speakerIndex}${control}`);
            const valueElement = document.getElementById(`speaker${speakerIndex}${control}Value`);
            
            if (element) {
                element.addEventListener('input', (e) => {
                    const newValue = control === 'Wall' ? e.target.value : parseFloat(e.target.value);
                    
                    // Special validation for X position (3m spacing rule)
                    if (control === 'X') {
                        if (!this.validateSpeakerSpacing(speakerIndex, newValue)) {
                            // Revert to previous value
                            e.target.value = this.speakers[speakerIndex].x;
                            return;
                        }
                    }
                    
                    // Update speaker property
                    if (control === 'Wall') this.speakers[speakerIndex].wall = newValue;
                    else if (control === 'X') this.speakers[speakerIndex].x = newValue;
                    else if (control === 'Z') this.speakers[speakerIndex].z = newValue;
                    else if (control === 'HorizontalRotation') this.speakers[speakerIndex].horizontalRotation = newValue;
                    else if (control === 'VerticalTilt') this.speakers[speakerIndex].verticalTilt = newValue;
                    
                    // Update display for non-wall controls
                    if (valueElement && control !== 'Wall') {
                        const suffix = (control === 'HorizontalRotation' || control === 'VerticalTilt') ? '°' : '%';
                        valueElement.textContent = newValue + suffix;
                    }
                    
                    this.updateSimulation();
                });
            }
        });
    }
    
    getParameters() {
        return {
            roomWidth: parseFloat(document.getElementById('roomWidth').value),
            roomHeight: parseFloat(document.getElementById('roomHeight').value),
            roomDepth: parseFloat(document.getElementById('roomDepth').value),
            maxSPL: parseFloat(document.getElementById('maxSPL').value),
            viewMode: document.getElementById('viewMode').value,
            speakers: this.speakers
        };
    }
    
    getSpeakerPosition(params, speakerConfig) {
        const { roomWidth, roomHeight, roomDepth } = params;
        const { x, z, wall } = speakerConfig;
        
        let position;
        switch (wall) {
            case 'front':
                position = { 
                    x: (x / 100) * roomWidth, 
                    y: 0, 
                    z: (z / 100) * roomHeight 
                };
                break;
            case 'back':
                position = { 
                    x: (x / 100) * roomWidth, 
                    y: roomDepth, 
                    z: (z / 100) * roomHeight 
                };
                break;
            case 'left':
                position = { 
                    x: 0, 
                    y: (x / 100) * roomDepth, 
                    z: (z / 100) * roomHeight 
                };
                break;
            case 'right':
                position = { 
                    x: roomWidth, 
                    y: (x / 100) * roomDepth, 
                    z: (z / 100) * roomHeight 
                };
                break;
            default:
                position = { 
                    x: roomWidth/2, 
                    y: 0, 
                    z: (z / 100) * roomHeight 
                };
        }
        
        return position;
    }
    
    getSpeakerDirection(params, speakerConfig) {
        const { wall, horizontalRotation, verticalTilt } = speakerConfig;
        const horizRotRad = (horizontalRotation * Math.PI) / 180;
        const vertTiltRad = (verticalTilt * Math.PI) / 180;
        
        // Base direction depending on wall
        let baseDirection;
        switch (wall) {
            case 'front':
                baseDirection = { x: 0, y: 1, z: 0 };
                break;
            case 'back':
                baseDirection = { x: 0, y: -1, z: 0 };
                break;
            case 'left':
                baseDirection = { x: 1, y: 0, z: 0 };
                break;
            case 'right':
                baseDirection = { x: -1, y: 0, z: 0 };
                break;
            default:
                baseDirection = { x: 0, y: 1, z: 0 };
        }
        
        // Apply horizontal rotation (around Z-axis)
        let rotatedDir = {
            x: baseDirection.x * Math.cos(horizRotRad) - baseDirection.y * Math.sin(horizRotRad),
            y: baseDirection.x * Math.sin(horizRotRad) + baseDirection.y * Math.cos(horizRotRad),
            z: baseDirection.z
        };
        
        // Apply vertical tilt
        const horizontalMagnitude = Math.sqrt(rotatedDir.x * rotatedDir.x + rotatedDir.y * rotatedDir.y);
        
        const direction = {
            x: rotatedDir.x * Math.cos(vertTiltRad),
            y: rotatedDir.y * Math.cos(vertTiltRad),
            z: horizontalMagnitude * Math.sin(vertTiltRad)
        };
        
        return direction;
    }
    
    calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL) {
        if (distance <= 0) return maxSPL;
        
        // Distance attenuation (6dB per doubling of distance)
        const distanceAttenuation = 20 * Math.log10(distance);
        
        // Horizontal angular attenuation (90° dispersion)
        const normalizedHorizAngle = Math.abs(horizontalAngle) / 45;
        const horizAngularAttenuation = normalizedHorizAngle > 1 ? -20 : -6 * Math.pow(normalizedHorizAngle, 2);
        
        // Vertical angular attenuation (45° dispersion)
        const normalizedVertAngle = Math.abs(verticalAngle) / 22.5;
        const vertAngularAttenuation = normalizedVertAngle > 1 ? -20 : -6 * Math.pow(normalizedVertAngle, 2);
        
        // Combined attenuation
        const totalAttenuation = distanceAttenuation - horizAngularAttenuation - vertAngularAttenuation;
        
        return Math.max(0, maxSPL - totalAttenuation);
    }
    
    getSPLColorRGB(spl) {
        // Smooth gradient color mapping with proper interpolation
        spl = Math.max(0, Math.min(120, spl)); // Clamp SPL values
        
        // Define color stops with SPL values
        const colorStops = [
            { spl: 120, r: 255, g: 0, b: 0 },     // Bright red (very loud)
            { spl: 110, r: 255, g: 0, b: 0 },     // Red
            { spl: 100, r: 255, g: 128, b: 0 },   // Orange
            { spl: 90, r: 255, g: 255, b: 0 },    // Yellow
            { spl: 80, r: 128, g: 255, b: 0 },    // Yellow-green
            { spl: 70, r: 0, g: 255, b: 128 },    // Green-cyan
            { spl: 60, r: 0, g: 128, b: 255 },    // Light blue
            { spl: 50, r: 0, g: 0, b: 255 },      // Blue
            { spl: 0, r: 0, g: 0, b: 128 }        // Dark blue (quiet)
        ];
        
        // Find the two color stops to interpolate between
        let lowerStop = colorStops[colorStops.length - 1];
        let upperStop = colorStops[0];
        
        for (let i = 0; i < colorStops.length - 1; i++) {
            if (spl >= colorStops[i + 1].spl && spl <= colorStops[i].spl) {
                upperStop = colorStops[i];
                lowerStop = colorStops[i + 1];
                break;
            }
        }
        
        // Interpolate between the two stops
        if (upperStop.spl === lowerStop.spl) {
            return { r: upperStop.r, g: upperStop.g, b: upperStop.b };
        }
        
        const ratio = (spl - lowerStop.spl) / (upperStop.spl - lowerStop.spl);
        
        return {
            r: Math.round(lowerStop.r + (upperStop.r - lowerStop.r) * ratio),
            g: Math.round(lowerStop.g + (upperStop.g - lowerStop.g) * ratio),
            b: Math.round(lowerStop.b + (upperStop.b - lowerStop.b) * ratio)
        };
    }
    
    drawTopView(params, listeningHeight) {
        const canvas = this.mainCanvas;
        const ctx = this.mainCtx;
        const { roomWidth, roomDepth, maxSPL, speakers } = params;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scale and offsets for centering
        const padding = 50;
        const availableWidth = canvas.width - (padding * 2);
        const availableHeight = canvas.height - (padding * 2);
        
        const scaleX = availableWidth / roomWidth;
        const scaleY = availableHeight / roomDepth;
        const scale = Math.min(scaleX, scaleY);
        
        const roomPixelWidth = roomWidth * scale;
        const roomPixelHeight = roomDepth * scale;
        const offsetX = (canvas.width - roomPixelWidth) / 2;
        const offsetY = (canvas.height - roomPixelHeight) / 2;
        
        // Create SPL calculation grid
        const gridResolution = 2; // pixels per calculation
        const gridWidth = Math.floor(roomPixelWidth / gridResolution);
        const gridHeight = Math.floor(roomPixelHeight / gridResolution);
        
        // Calculate SPL for each grid point
        const imageData = ctx.createImageData(gridWidth, gridHeight);
        const data = imageData.data;
        
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                // Convert pixel coordinates to room coordinates
                const roomX = (x * gridResolution) / scale;
                const roomY = (y * gridResolution) / scale;
                const roomZ = listeningHeight;
                
                // Calculate combined SPL from all speakers
                let totalSPL = 0;
                
                speakers.forEach(speakerConfig => {
                    const speakerPos = this.getSpeakerPosition(params, speakerConfig);
                    const speakerDir = this.getSpeakerDirection(params, speakerConfig);
                    
                    // Calculate distance
                    const dx = roomX - speakerPos.x;
                    const dy = roomY - speakerPos.y;
                    const dz = roomZ - speakerPos.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance > 0.1) {
                        // Calculate angles
                        const vectorToPoint = {
                            x: dx / distance,
                            y: dy / distance,
                            z: dz / distance
                        };
                        
                        const dotProduct = speakerDir.x * vectorToPoint.x + 
                                        speakerDir.y * vectorToPoint.y + 
                                        speakerDir.z * vectorToPoint.z;
                        const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
                        const angleDeg = (angleRad * 180) / Math.PI;
                        
                        // Calculate horizontal and vertical angles
                        const horizontalAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                        const verticalAngle = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI;
                        
                        // Calculate SPL from this speaker
                        const spl = this.calculateSPL(distance, angleDeg, verticalAngle, maxSPL);
                        
                        // Add SPL energy (logarithmic addition)
                        totalSPL += Math.pow(10, spl / 10);
                    }
                });
                
                // Convert back to dB
                const combinedSPL = totalSPL > 0 ? 10 * Math.log10(totalSPL) : 0;
                
                // Get color for this SPL level
                const color = this.getSPLColorRGB(combinedSPL);
                
                // Set pixel color
                const pixelIndex = (y * gridWidth + x) * 4;
                data[pixelIndex] = color.r;     // Red
                data[pixelIndex + 1] = color.g; // Green
                data[pixelIndex + 2] = color.b; // Blue
                data[pixelIndex + 3] = 180;     // Alpha (transparency)
            }
        }
        
        // Draw the SPL heatmap
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gridWidth;
        tempCanvas.height = gridHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        ctx.drawImage(tempCanvas, offsetX, offsetY, roomPixelWidth, roomPixelHeight);
        
        // Draw room outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX, offsetY, roomPixelWidth, roomPixelHeight);
        
        // Draw speakers
        const speakerColors = ['#ff0000', '#0080ff', '#00ff00', '#ff8000', '#8000ff'];
        
        speakers.forEach((speakerConfig, index) => {
            const speakerPos = this.getSpeakerPosition(params, speakerConfig);
            const speakerDir = this.getSpeakerDirection(params, speakerConfig);
            
            // Convert to canvas coordinates
            const canvasX = offsetX + (speakerPos.x * scale);
            const canvasY = offsetY + (speakerPos.y * scale);
            
            // Draw speaker position
            const speakerColor = speakerColors[index % speakerColors.length];
            ctx.fillStyle = speakerColor;
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw white outline
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw speaker direction arrow
            const arrowLength = 30;
            const arrowX = canvasX + (speakerDir.x * arrowLength);
            const arrowY = canvasY + (speakerDir.y * arrowLength);
            
            ctx.strokeStyle = speakerColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(canvasX, canvasY);
            ctx.lineTo(arrowX, arrowY);
            ctx.stroke();
            
            // Draw arrow head
            const headLength = 10;
            const headAngle = Math.PI / 6;
            const angle = Math.atan2(speakerDir.y, speakerDir.x);
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - headLength * Math.cos(angle - headAngle),
                arrowY - headLength * Math.sin(angle - headAngle)
            );
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - headLength * Math.cos(angle + headAngle),
                arrowY - headLength * Math.sin(angle + headAngle)
            );
            ctx.stroke();
            
            // Draw speaker label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`S${index + 1}`, canvasX, canvasY - 15);
        });
        
        // Draw room dimensions
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${roomWidth}m`, offsetX + roomPixelWidth / 2, offsetY - 10);
        ctx.save();
        ctx.translate(offsetX - 20, offsetY + roomPixelHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${roomDepth}m`, 0, 0);
        ctx.restore();
    }
    
    drawSideView(params) {
        const canvas = this.mainCanvas;
        const ctx = this.mainCtx;
        const { roomWidth, roomHeight, maxSPL, speakers } = params;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scale and offsets for centering
        const padding = 50;
        const availableWidth = canvas.width - (padding * 2);
        const availableHeight = canvas.height - (padding * 2);
        
        const scaleX = availableWidth / roomWidth;
        const scaleY = availableHeight / roomHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const roomPixelWidth = roomWidth * scale;
        const roomPixelHeight = roomHeight * scale;
        const offsetX = (canvas.width - roomPixelWidth) / 2;
        const offsetY = (canvas.height - roomPixelHeight) / 2;
        
        // Create SPL calculation grid
        const gridResolution = 2;
        const gridWidth = Math.floor(roomPixelWidth / gridResolution);
        const gridHeight = Math.floor(roomPixelHeight / gridResolution);
        
        // Calculate SPL for each grid point
        const imageData = ctx.createImageData(gridWidth, gridHeight);
        const data = imageData.data;
        
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                // Convert pixel coordinates to room coordinates
                const roomX = (x * gridResolution) / scale;
                const roomZ = roomHeight - ((y * gridResolution) / scale); // Flip Y for room coordinates
                const roomY = 1.0; // Fixed depth for side view
                
                // Calculate combined SPL from all speakers
                let totalSPL = 0;
                
                speakers.forEach(speakerConfig => {
                    const speakerPos = this.getSpeakerPosition(params, speakerConfig);
                    const speakerDir = this.getSpeakerDirection(params, speakerConfig);
                    
                    // Calculate distance
                    const dx = roomX - speakerPos.x;
                    const dy = roomY - speakerPos.y;
                    const dz = roomZ - speakerPos.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance > 0.1) {
                        // Calculate angles
                        const vectorToPoint = {
                            x: dx / distance,
                            y: dy / distance,
                            z: dz / distance
                        };
                        
                        const dotProduct = speakerDir.x * vectorToPoint.x + 
                                        speakerDir.y * vectorToPoint.y + 
                                        speakerDir.z * vectorToPoint.z;
                        const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
                        const angleDeg = (angleRad * 180) / Math.PI;
                        
                        // Calculate vertical angle for side view
                        const verticalAngle = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI;
                        
                        // Calculate SPL from this speaker
                        const spl = this.calculateSPL(distance, angleDeg, verticalAngle, maxSPL);
                        
                        // Add SPL energy (logarithmic addition)
                        totalSPL += Math.pow(10, spl / 10);
                    }
                });
                
                // Convert back to dB
                const combinedSPL = totalSPL > 0 ? 10 * Math.log10(totalSPL) : 0;
                
                // Get color for this SPL level
                const color = this.getSPLColorRGB(combinedSPL);
                
                // Set pixel color
                const pixelIndex = (y * gridWidth + x) * 4;
                data[pixelIndex] = color.r;     // Red
                data[pixelIndex + 1] = color.g; // Green
                data[pixelIndex + 2] = color.b; // Blue
                data[pixelIndex + 3] = 180;     // Alpha
            }
        }
        
        // Draw the SPL heatmap
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gridWidth;
        tempCanvas.height = gridHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        ctx.drawImage(tempCanvas, offsetX, offsetY, roomPixelWidth, roomPixelHeight);
        
        // Draw room outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX, offsetY, roomPixelWidth, roomPixelHeight);
        
        // Draw speakers
        const speakerColors = ['#ff0000', '#0080ff', '#00ff00', '#ff8000', '#8000ff'];
        
        speakers.forEach((speakerConfig, index) => {
            const speakerPos = this.getSpeakerPosition(params, speakerConfig);
            
            // Convert to canvas coordinates (side view: X vs Z)
            const canvasX = offsetX + (speakerPos.x * scale);
            const canvasY = offsetY + ((roomHeight - speakerPos.z) * scale);
            
            // Draw speaker position
            const speakerColor = speakerColors[index % speakerColors.length];
            ctx.fillStyle = speakerColor;
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw white outline
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw speaker label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`S${index + 1}`, canvasX, canvasY - 15);
        });
        
        // Draw room dimensions
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${roomWidth}m`, offsetX + roomPixelWidth / 2, offsetY + roomPixelHeight + 20);
        ctx.save();
        ctx.translate(offsetX - 20, offsetY + roomPixelHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${roomHeight}m`, 0, 0);
        ctx.restore();
        
        // Add floor and ceiling labels
        ctx.fillStyle = '#cccccc';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Floor', offsetX + 5, offsetY + roomPixelHeight - 5);
        ctx.fillText('Ceiling', offsetX + 5, offsetY + 15);
    }
    
    updateSimulation() {
        console.log('Updating simulation...');
        const params = this.getParameters();
        const viewMode = params.viewMode;
        
        // Update view title
        const viewTitle = document.getElementById('viewTitle');
        if (viewTitle) {
            switch (viewMode) {
                case 'top_1.2':
                    viewTitle.textContent = 'Top View (1.2m Listening Height)';
                    break;
                case 'top_1.7':
                    viewTitle.textContent = 'Top View (1.7m Standing Height)';
                    break;
                case 'side':
                    viewTitle.textContent = 'Side View (Vertical Analysis)';
                    break;
            }
        }
        
        try {
            if (viewMode === 'side') {
                this.drawSideView(params);
            } else {
                const listeningHeight = viewMode === 'top_1.7' ? 1.7 : 1.2;
                this.drawTopView(params, listeningHeight);
            }
            console.log('Simulation updated successfully');
        } catch (error) {
            console.error('Error updating simulation:', error);
        }
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing MultiSpeakerSPLSimulator');
    try {
        window.simulator = new MultiSpeakerSPLSimulator();
        console.log('MultiSpeakerSPLSimulator initialized successfully');
    } catch (error) {
        console.error('Error initializing MultiSpeakerSPLSimulator:', error);
    }
});
