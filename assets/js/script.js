class SPLSimulator {
    constructor() {
        this.mainCanvas = document.getElementById('mainView');
        this.mainCtx = this.mainCanvas.getContext('2d');
        
        this.setupEventListeners();
        this.updateSimulation();
    }
    
    setupEventListeners() {
        const controls = [
            'roomWidth', 'roomHeight', 'roomDepth', 'maxSPL', 'speakerWall', 
            'speakerX', 'speakerY', 'speakerZ', 'horizontalRotation', 
            'verticalTilt', 'viewMode'
        ];
        
        controls.forEach(control => {
            const element = document.getElementById(control);
            element.addEventListener('change', () => {
                this.updateDisplayValues();
                this.updateSimulation();
            });
            element.addEventListener('input', () => {
                this.updateDisplayValues();
                this.updateSimulation();
            });
        });
        
        this.updateDisplayValues();
    }
    
    updateDisplayValues() {
        document.getElementById('speakerXValue').textContent = document.getElementById('speakerX').value + '%';
        document.getElementById('speakerYValue').textContent = document.getElementById('speakerY').value + '%';
        document.getElementById('speakerZValue').textContent = document.getElementById('speakerZ').value + '%';
        document.getElementById('horizontalRotationValue').textContent = document.getElementById('horizontalRotation').value + '°';
        document.getElementById('verticalTiltValue').textContent = document.getElementById('verticalTilt').value + '°';
    }
    
    getParameters() {
        return {
            roomWidth: parseFloat(document.getElementById('roomWidth').value),
            roomHeight: parseFloat(document.getElementById('roomHeight').value),
            roomDepth: parseFloat(document.getElementById('roomDepth').value),
            maxSPL: parseFloat(document.getElementById('maxSPL').value),
            speakerWall: document.getElementById('speakerWall').value,
            speakerX: parseFloat(document.getElementById('speakerX').value) / 100,
            speakerY: parseFloat(document.getElementById('speakerY').value) / 100,
            speakerZ: parseFloat(document.getElementById('speakerZ').value) / 100,
            horizontalRotation: parseFloat(document.getElementById('horizontalRotation').value),
            verticalTilt: parseFloat(document.getElementById('verticalTilt').value),
            viewMode: document.getElementById('viewMode').value
        };
    }
    
    getSpeakerPosition(params) {
        const { roomWidth, roomHeight, roomDepth, speakerWall, speakerX, speakerY, speakerZ } = params;
        
        switch (speakerWall) {
            case 'front':
                return { 
                    x: speakerX * roomWidth, 
                    y: 0, 
                    z: speakerZ * roomHeight 
                };
            case 'back':
                return { 
                    x: speakerX * roomWidth, 
                    y: roomDepth, 
                    z: speakerZ * roomHeight 
                };
            case 'left':
                return { 
                    x: 0, 
                    y: speakerY * roomDepth, 
                    z: speakerZ * roomHeight 
                };
            case 'right':
                return { 
                    x: roomWidth, 
                    y: speakerY * roomDepth, 
                    z: speakerZ * roomHeight 
                };
            default:
                return { 
                    x: roomWidth/2, 
                    y: 0, 
                    z: speakerZ * roomHeight 
                };
        }
    }
    
    getSpeakerDirection(params) {
        const { speakerWall, horizontalRotation, verticalTilt } = params;
        const horizRotRad = (horizontalRotation * Math.PI) / 180;
        const vertTiltRad = (verticalTilt * Math.PI) / 180;
        
        // Base direction depending on wall
        let baseDirection;
        switch (speakerWall) {
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
        
        return {
            x: rotatedDir.x * Math.cos(vertTiltRad),
            y: rotatedDir.y * Math.cos(vertTiltRad),
            z: horizontalMagnitude * Math.sin(vertTiltRad)
        };
    }
    
    calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL) {
        if (distance <= 0) return maxSPL;
        
        // Distance attenuation (6dB per doubling of distance)
        const distanceAttenuation = 20 * Math.log10(distance);
        
        // Horizontal angular attenuation (90° dispersion)
        const normalizedHorizAngle = Math.abs(horizontalAngle) / 45; // 90° total = ±45°
        const horizAngularAttenuation = normalizedHorizAngle > 1 ? -20 : -6 * Math.pow(normalizedHorizAngle, 2);
        
        // Vertical angular attenuation (45° dispersion)
        const normalizedVertAngle = Math.abs(verticalAngle) / 22.5; // 45° total = ±22.5°
        const vertAngularAttenuation = normalizedVertAngle > 1 ? -20 : -6 * Math.pow(normalizedVertAngle, 2);
        
        // Combined attenuation
        const totalAttenuation = distanceAttenuation - horizAngularAttenuation - vertAngularAttenuation;
        
        return Math.max(0, maxSPL - totalAttenuation);
    }
    
    getSPLColor(spl) {
        if (spl >= 110) return '#ff0000';
        if (spl >= 100) return '#ff8000';
        if (spl >= 90) return '#ffff00';
        if (spl >= 80) return '#80ff00';
        if (spl >= 70) return '#00ff80';
        if (spl >= 60) return '#0080ff';
        return '#0000ff';
    }
    
    drawTopView(params, listeningHeight) {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const { roomWidth, roomDepth, maxSPL } = params;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / roomWidth;
        const scaleY = canvas.height / roomDepth;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        const offsetX = (canvas.width - roomWidth * scale) / 2;
        const offsetY = (canvas.height - roomDepth * scale) / 2;
        
        // Draw room outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, roomWidth * scale, roomDepth * scale);
        
        // Get speaker position and direction
        const speaker = this.getSpeakerPosition(params);
        const direction = this.getSpeakerDirection(params);
        
        // Draw SPL heatmap
        const resolution = 30;
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = (i / (resolution - 1)) * roomWidth;
                const y = (j / (resolution - 1)) * roomDepth;
                
                const dx = x - speaker.x;
                const dy = y - speaker.y;
                const dz = listeningHeight - speaker.z; // Use specified listening height
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0) {
                    // Calculate horizontal angle (in XY plane)
                    const pointDirection = { x: dx / distance, y: dy / distance };
                    const horizDotProduct = direction.x * pointDirection.x + direction.y * pointDirection.y;
                    const horizontalAngle = Math.acos(Math.max(-1, Math.min(1, horizDotProduct))) * 180 / Math.PI;
                    
                    // Calculate vertical angle
                    const verticalAngle = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI;
                    
                    const spl = this.calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL);
                    const color = this.getSPLColor(spl);
                    
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.7;
                    ctx.fillRect(
                        offsetX + x * scale - 3,
                        offsetY + y * scale - 3,
                        6, 6
                    );
                }
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Draw dispersion pattern
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const speakerPixelX = offsetX + speaker.x * scale;
        const speakerPixelY = offsetY + speaker.y * scale;
        
        // Project 3D direction to 2D for display
        const directionAngle = Math.atan2(direction.y, direction.x);
        
        // Draw 90-degree horizontal dispersion cone
        const coneLength = 120;
        const leftAngle = directionAngle - Math.PI / 4; // -45°
        const rightAngle = directionAngle + Math.PI / 4; // +45°
        
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(leftAngle) * coneLength,
            speakerPixelY + Math.sin(leftAngle) * coneLength
        );
        
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(rightAngle) * coneLength,
            speakerPixelY + Math.sin(rightAngle) * coneLength
        );
        
        // Draw center axis
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(directionAngle) * coneLength,
            speakerPixelY + Math.sin(directionAngle) * coneLength
        );
        
        ctx.stroke();
        
        // Draw speaker
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw speaker orientation indicator
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(verticalDirection) * 20,
            speakerPixelY - Math.sin(verticalDirection) * 20
        );
        ctx.stroke();
        
        // Labels for listening heights
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Arial';
        ctx.fillText('1.7m', offsetX + roomDepth * scale + 10, height17Y + 5);
        ctx.fillText('1.2m', offsetX + roomDepth * scale + 10, height12Y + 5);
    }
    
    updateSimulation() {
        const params = this.getParameters();
        const viewTitle = document.getElementById('viewTitle');
        
        console.log('View mode:', params.viewMode); // Debug log
        
        if (params.viewMode === 'top_1.2') {
            viewTitle.textContent = 'Top View (1.2m Listening Height)';
            this.drawTopView(params, 1.2);
        } else if (params.viewMode === 'top_1.7') {
            viewTitle.textContent = 'Top View (1.7m Listening Height)';
            this.drawTopView(params, 1.7);
        } else if (params.viewMode === 'side') {
            viewTitle.textContent = 'Side View (45° Vertical Dispersion)';
            this.drawSideView(params);
        } else {
            // Default fallback
            viewTitle.textContent = 'Top View (1.2m Listening Height)';
            this.drawTopView(params, 1.2);
        }
    }
}

// Initialize the simulator when the page loads
window.addEventListener('load', () => {
    new SPLSimulator();
});
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(directionAngle) * 20,
            speakerPixelY + Math.sin(directionAngle) * 20
        );
        ctx.stroke();
        
        // Add listening height indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`Listening Height: ${listeningHeight}m`, 20, 30);
    }
    
    drawSideView(params) {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const { roomDepth, roomHeight, maxSPL } = params;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / roomDepth;
        const scaleY = canvas.height / roomHeight;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        
        const offsetX = (canvas.width - roomDepth * scale) / 2;
        const offsetY = (canvas.height - roomHeight * scale) / 2;
        
        // Draw room outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, roomDepth * scale, roomHeight * scale);
        
        // Get speaker position and direction
        const speaker = this.getSpeakerPosition(params);
        const direction = this.getSpeakerDirection(params);
        
        // Draw SPL heatmap for side view
        const resolution = 25;
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const y = (i / (resolution - 1)) * roomDepth;
                const z = (j / (resolution - 1)) * roomHeight;
                
                const dx = 0; // For side view, assume x = 0 (center of room width)
                const dy = y - speaker.y;
                const dz = z - speaker.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0) {
                    // Calculate horizontal angle (how far off the Y-axis in the XY plane)
                    const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
                    let horizontalAngle = 0;
                    if (horizontalDistance > 0) {
                        horizontalAngle = Math.atan2(Math.abs(dx), Math.abs(dy)) * 180 / Math.PI;
                    }
                    
                    // Calculate vertical angle (up/down from horizontal plane)
                    const verticalAngle = Math.atan2(dz, horizontalDistance) * 180 / Math.PI;
                    
                    const spl = this.calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL);
                    const color = this.getSPLColor(spl);
                    
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.6;
                    ctx.fillRect(
                        offsetX + y * scale - 3,
                        offsetY + (roomHeight - z) * scale - 3,
                        6, 6
                    );
                }
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Draw listening height indicators first (background)
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // 1.2m line
        const height12Y = offsetY + (roomHeight - 1.2) * scale;
        ctx.beginPath();
        ctx.moveTo(offsetX, height12Y);
        ctx.lineTo(offsetX + roomDepth * scale, height12Y);
        ctx.stroke();
        
        // 1.7m line
        const height17Y = offsetY + (roomHeight - 1.7) * scale;
        ctx.beginPath();
        ctx.moveTo(offsetX, height17Y);
        ctx.lineTo(offsetX + roomDepth * scale, height17Y);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Draw vertical dispersion pattern
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const speakerPixelX = offsetX + speaker.y * scale;
        const speakerPixelY = offsetY + (roomHeight - speaker.z) * scale;
        
        // Calculate the vertical direction component
        const horizontalMag = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const verticalDirection = Math.atan2(direction.z, horizontalMag);
        
        const coneLength = 100;
        const topAngle = verticalDirection + Math.PI / 8; // +22.5 degrees
        const bottomAngle = verticalDirection - Math.PI / 8; // -22.5 degrees
        
        // Draw dispersion cone lines
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(topAngle) * coneLength,
            speakerPixelY - Math.sin(topAngle) * coneLength
        );
        
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(bottomAngle) * coneLength,
            speakerPixelY - Math.sin(bottomAngle) * coneLength
        );
        
        // Draw center axis
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(verticalDirection) * coneLength,
            speakerPixelY - Math.sin(verticalDirection) * coneLength
        );
        
        ctx.stroke();
        
        // Draw speaker
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw speaker orientation indicator
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
