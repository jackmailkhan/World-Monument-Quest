
        // Game Configuration
        const game = {
            canvas: null,
            ctx: null,
            width: 0,
            height: 0,
            level: 0,
            score: 0,
            moves: 0,
            hints: 3,
            maxHints: 3,
            pieces: [],
            selectedPiece: null,
            dragOffset: { x: 0, y: 0 },
            lastTap: 0,
            soundEnabled: true,
            particles: [],
            audioCtx: null
        };

        // Monument data - each monument has pieces with relative coordinates
        const monuments = [
            {
                name: "Eiffel Tower",
                country: "France",
                pieces: [
                    { shape: [[0,0], [60,0], [50,120], [10,120]], color: '#8B7355', target: {x: 0.5, y: 0.4} },
                    { shape: [[0,0], [40,0], [35,100], [5,100]], color: '#A0826D', target: {x: 0.45, y: 0.45} },
                    { shape: [[0,0], [40,0], [35,100], [5,100]], color: '#8B7355', target: {x: 0.55, y: 0.45} }
                ]
            },
            {
                name: "Taj Mahal",
                country: "India",
                pieces: [
                    { shape: [[0,0], [80,0], [70,40], [10,40]], color: '#F5F5DC', target: {x: 0.5, y: 0.5} },
                    { shape: [[20,0], [60,0], [70,80], [50,100], [30,100], [10,80]], color: '#FFFFFF', target: {x: 0.5, y: 0.35} },
                    { shape: [[0,0], [30,0], [25,60], [5,60]], color: '#F5F5DC', target: {x: 0.35, y: 0.4} },
                    { shape: [[0,0], [30,0], [25,60], [5,60]], color: '#F5F5DC', target: {x: 0.65, y: 0.4} }
                ]
            },
            {
                name: "Pyramids",
                country: "Egypt",
                pieces: [
                    { shape: [[50,0], [100,80], [0,80]], color: '#D2B48C', target: {x: 0.4, y: 0.45} },
                    { shape: [[40,0], [80,70], [0,70]], color: '#C9A97C', target: {x: 0.6, y: 0.5} },
                    { shape: [[30,0], [60,50], [0,50]], color: '#D2B48C', target: {x: 0.5, y: 0.35} }
                ]
            },
            {
                name: "Statue of Liberty",
                country: "USA",
                pieces: [
                    { shape: [[10,0], [30,0], [25,50], [15,50]], color: '#4A7C59', target: {x: 0.5, y: 0.3} },
                    { shape: [[0,0], [40,0], [35,60], [5,60]], color: '#6B9D6F', target: {x: 0.5, y: 0.45} },
                    { shape: [[5,0], [35,0], [40,40], [0,40]], color: '#4A7C59', target: {x: 0.5, y: 0.6} },
                    { shape: [[0,0], [50,0], [50,20], [0,20]], color: '#7FA97F', target: {x: 0.5, y: 0.7} }
                ]
            },
            {
                name: "Colosseum",
                country: "Italy",
                pieces: [
                    { shape: [[0,0], [40,0], [40,80], [0,80], [5,70], [5,10]], color: '#D2B48C', target: {x: 0.35, y: 0.45} },
                    { shape: [[0,0], [35,0], [35,80], [0,80], [5,70], [5,10]], color: '#C9A97C', target: {x: 0.5, y: 0.45} },
                    { shape: [[0,0], [40,0], [40,80], [0,80], [5,70], [5,10]], color: '#D2B48C', target: {x: 0.65, y: 0.45} },
                    { shape: [[0,0], [120,0], [120,20], [0,20]], color: '#B8966B', target: {x: 0.5, y: 0.65} }
                ]
            },
            {
                name: "Sydney Opera House",
                country: "Australia",
                pieces: [
                    { shape: [[0,60], [20,0], [40,30], [40,60]], color: '#F5F5F5', target: {x: 0.35, y: 0.45} },
                    { shape: [[0,60], [20,5], [40,30], [40,60]], color: '#FFFFFF', target: {x: 0.45, y: 0.45} },
                    { shape: [[0,60], [20,10], [40,35], [40,60]], color: '#F5F5F5', target: {x: 0.55, y: 0.45} },
                    { shape: [[0,60], [20,0], [40,30], [40,60]], color: '#FFFFFF', target: {x: 0.65, y: 0.45} },
                    { shape: [[0,0], [130,0], [130,15], [0,15]], color: '#E8E8E8', target: {x: 0.5, y: 0.6} }
                ]
            }
        ];

        // Initialize
        function init() {
            game.canvas = document.getElementById('canvas');
            game.ctx = game.canvas.getContext('2d');
            
            resize();
            window.addEventListener('resize', resize);

            setupEventListeners();
            loadLevel(0);
            gameLoop();

            setTimeout(() => {
                const instr = document.getElementById('instruction');
                instr.style.opacity = '0';
                instr.style.transition = 'opacity 0.5s';
            }, 4000);
        }

        function resize() {
            game.canvas.width = window.innerWidth;
            game.canvas.height = window.innerHeight;
            game.width = game.canvas.width;
            game.height = game.canvas.height;
        }

        // Load level
        function loadLevel(levelIndex) {
            if (levelIndex >= monuments.length) {
                showGameOver();
                return;
            }

            game.level = levelIndex;
            game.moves = 0;
            game.hints = game.maxHints;
            game.pieces = [];

            const monument = monuments[levelIndex];
            const scale = Math.min(game.width, game.height) / 600;

            monument.pieces.forEach((pieceData, i) => {
                const piece = {
                    shape: pieceData.shape.map(p => [...p]),
                    color: pieceData.color,
                    x: Math.random() * (game.width - 150) + 50,
                    y: game.height - 150 - Math.random() * 50,
                    targetX: game.width * pieceData.target.x,
                    targetY: game.height * pieceData.target.y,
                    rotation: Math.floor(Math.random() * 4) * 90,
                    targetRotation: 0,
                    scale: scale,
                    placed: false,
                    dragging: false
                };
                game.pieces.push(piece);
            });

            updateHUD();
        }

        // Event listeners
        function setupEventListeners() {
            game.canvas.addEventListener('mousedown', handleStart);
            game.canvas.addEventListener('mousemove', handleMove);
            game.canvas.addEventListener('mouseup', handleEnd);
            game.canvas.addEventListener('touchstart', handleStart);
            game.canvas.addEventListener('touchmove', handleMove);
            game.canvas.addEventListener('touchend', handleEnd);

            document.getElementById('hintBtn').addEventListener('click', useHint);
            document.getElementById('restartBtn').addEventListener('click', () => loadLevel(game.level));
            document.getElementById('nextBtn').addEventListener('click', nextLevel);
            document.getElementById('playAgainBtn').addEventListener('click', () => {
                game.score = 0;
                hideModal('gameOverModal');
                loadLevel(0);
            });
            document.getElementById('rotateBtn').addEventListener('click', rotateCurrent);
            document.getElementById('soundBtn').addEventListener('click', toggleSound);
        }

        function getPos(e) {
            const rect = game.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function handleStart(e) {
            e.preventDefault();
            initAudio();

            const pos = getPos(e);
            const now = Date.now();

            // Check double tap
            if (now - game.lastTap < 300) {
                for (let i = game.pieces.length - 1; i >= 0; i--) {
                    if (!game.pieces[i].placed && isPointInPiece(pos, game.pieces[i])) {
                        rotatePiece(game.pieces[i]);
                        return;
                    }
                }
            }
            game.lastTap = now;

            // Find piece to drag
            for (let i = game.pieces.length - 1; i >= 0; i--) {
                const piece = game.pieces[i];
                if (!piece.placed && isPointInPiece(pos, piece)) {
                    game.selectedPiece = piece;
                    piece.dragging = true;
                    game.dragOffset = {
                        x: pos.x - piece.x,
                        y: pos.y - piece.y
                    };
                    // Move to top
                    game.pieces.splice(i, 1);
                    game.pieces.push(piece);
                    break;
                }
            }
        }

        function handleMove(e) {
            e.preventDefault();
            if (game.selectedPiece) {
                const pos = getPos(e);
                game.selectedPiece.x = pos.x - game.dragOffset.x;
                game.selectedPiece.y = pos.y - game.dragOffset.y;
            }
        }

        function handleEnd(e) {
            e.preventDefault();
            if (game.selectedPiece) {
                const piece = game.selectedPiece;
                piece.dragging = false;

                if (isNearTarget(piece)) {
                    snapToTarget(piece);
                    checkComplete();
                }

                game.selectedPiece = null;
                game.moves++;
                updateHUD();
            }
        }

        function isPointInPiece(point, piece) {
            const transformed = getTransformedPoints(piece);
            let inside = false;
            for (let i = 0, j = transformed.length - 1; i < transformed.length; j = i++) {
                const xi = transformed[i][0], yi = transformed[i][1];
                const xj = transformed[j][0], yj = transformed[j][1];
                if ((yi > point.y) !== (yj > point.y) &&
                    point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) {
                    inside = !inside;
                }
            }
            return inside;
        }

        function getTransformedPoints(piece) {
            const rad = piece.rotation * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            
            return piece.shape.map(p => {
                const px = p[0] * piece.scale;
                const py = p[1] * piece.scale;
                return [
                    piece.x + px * cos - py * sin,
                    piece.y + px * sin + py * cos
                ];
            });
        }

        function isNearTarget(piece) {
            const dist = Math.sqrt(
                Math.pow(piece.x - piece.targetX, 2) +
                Math.pow(piece.y - piece.targetY, 2)
            );
            const rotDiff = Math.abs(((piece.rotation - piece.targetRotation + 180) % 360) - 180);
            return dist < 50 && rotDiff < 20;
        }

        function snapToTarget(piece) {
            piece.x = piece.targetX;
            piece.y = piece.targetY;
            piece.rotation = piece.targetRotation;
            piece.placed = true;
            playSound('snap');
            createParticles(piece.x, piece.y, piece.color);
        }

        function rotatePiece(piece) {
            piece.rotation = (piece.rotation + 90) % 360;
            game.moves++;
            updateHUD();
        }

        function rotateCurrent() {
            if (game.selectedPiece && !game.selectedPiece.placed) {
                rotatePiece(game.selectedPiece);
            } else {
                for (let i = game.pieces.length - 1; i >= 0; i--) {
                    if (!game.pieces[i].placed) {
                        rotatePiece(game.pieces[i]);
                        break;
                    }
                }
            }
        }

        function useHint() {
            if (game.hints > 0) {
                const unplaced = game.pieces.find(p => !p.placed);
                if (unplaced) {
                    snapToTarget(unplaced);
                    game.hints--;
                    game.score = Math.max(0, game.score - 50);
                    updateHUD();
                    checkComplete();
                    playSound('hint');
                }
            }
        }

        function checkComplete() {
            if (game.pieces.every(p => p.placed)) {
                setTimeout(() => completeLevel(), 500);
            }
        }

        function completeLevel() {
            const baseScore = 1000;
            const moveBonus = Math.max(0, 500 - game.moves * 10);
            const hintPenalty = (game.maxHints - game.hints) * 100;
            const levelScore = baseScore + moveBonus - hintPenalty;
            game.score += levelScore;

            playSound('complete');
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createParticles(
                        Math.random() * game.width,
                        Math.random() * game.height / 2,
                        '#FFD700'
                    );
                }, i * 100);
            }

            document.getElementById('completeText').textContent = 
                `You restored the ${monuments[game.level].name}!`;
            document.getElementById('modalScore').textContent = levelScore;
            showModal('completeModal');
        }

        function nextLevel() {
            hideModal('completeModal');
            loadLevel(game.level + 1);
        }

        function showGameOver() {
            playSound('complete');
            document.getElementById('finalScore').textContent = game.score;
            showModal('gameOverModal');
        }

        function showModal(id) {
            document.getElementById('overlay').classList.add('show');
            document.getElementById(id).classList.add('show');
        }

        function hideModal(id) {
            document.getElementById('overlay').classList.remove('show');
            document.getElementById(id).classList.remove('show');
        }

        function updateHUD() {
            document.getElementById('level').textContent = game.level + 1;
            document.getElementById('score').textContent = game.score;
            document.getElementById('moves').textContent = game.moves;
            document.getElementById('hints').textContent = game.hints;
        }

        function toggleSound() {
            game.soundEnabled = !game.soundEnabled;
            document.getElementById('soundBtn').textContent = game.soundEnabled ? '🔊' : '🔇';
        }

        // Audio
        function initAudio() {
            if (!game.audioCtx) {
                game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playSound(type) {
            if (!game.soundEnabled || !game.audioCtx) return;

            const ctx = game.audioCtx;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            switch(type) {
                case 'snap':
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                case 'complete':
                    [523, 659, 784].forEach((freq, i) => {
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        o.connect(g);
                        g.connect(ctx.destination);
                        o.frequency.setValueAtTime(freq, now + i * 0.1);
                        g.gain.setValueAtTime(0.2, now + i * 0.1);
                        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
                        o.start(now + i * 0.1);
                        o.stop(now + i * 0.1 + 0.3);
                    });
                    break;
                case 'hint':
                    osc.frequency.setValueAtTime(600, now);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
            }
        }

        // Particles
        function createParticles(x, y, color) {
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 * i) / 20;
                game.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * (2 + Math.random() * 2),
                    vy: Math.sin(angle) * (2 + Math.random() * 2),
                    life: 1,
                    color: color,
                    size: 3 + Math.random() * 3
                });
            }
        }

        function updateParticles() {
            game.particles = game.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2;
                p.life -= 0.02;
                return p.life > 0;
            });
        }

        // Render
        function render() {
            const ctx = game.ctx;
            ctx.clearRect(0, 0, game.width, game.height);

            // Background
            const grad = ctx.createLinearGradient(0, 0, 0, game.height);
            grad.addColorStop(0, '#667eea');
            grad.addColorStop(1, '#764ba2');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, game.width, game.height);

            // Draw target silhouettes
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#ffffff';
            game.pieces.forEach(piece => {
                if (!piece.placed) {
                    const points = piece.shape.map(p => [
                        piece.targetX + p[0] * piece.scale,
                        piece.targetY + p[1] * piece.scale
                    ]);
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i][0], points[i][1]);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            });
            ctx.globalAlpha = 1;

            // Draw pieces
            game.pieces.forEach(piece => {
                const points = getTransformedPoints(piece);
                
                ctx.save();
                if (!piece.placed) {
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                }

                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i][0], points[i][1]);
                }
                ctx.closePath();

                ctx.fillStyle = piece.color;
                ctx.fill();

                ctx.strokeStyle = piece.placed ? '#FFD700' : 'rgba(0,0,0,0.3)';
                ctx.lineWidth = piece.placed ? 3 : 2;
                if (piece.dragging) {
                    ctx.strokeStyle = '#667eea';
                    ctx.lineWidth = 4;
                }
                ctx.stroke();
                ctx.restore();
            });

            // Draw particles
            game.particles.forEach(p => {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Draw monument name
            if (game.level < monuments.length) {
                ctx.save();
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 5;
                ctx.fillText(monuments[game.level].name, game.width / 2, game.height - 40);
                ctx.font = '14px Arial';
                ctx.fillText(monuments[game.level].country, game.width / 2, game.height - 20);
                ctx.restore();
            }
        }

        function gameLoop() {
            updateParticles();
            render();
            requestAnimationFrame(gameLoop);
        }

        // Start game
        window.addEventListener('load', init);
  
