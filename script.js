const arena = document.getElementById('arena');
let elixir = 0, selectedCard = null, selectedCost = 0, selectedSlot = null, tropas = [], construcoes = [];

// Cache de elementos da UI para otimização de performance
const elixirBar = document.getElementById('elixir-bar');
const elixirText = document.getElementById('elixir-text');

const tDados = {
    'red-king': {id: 'red-king', x: 180, y: 36, hp: 3000, maxHp: 3000, team: 'red', type:'tower', isKing: true, ativo: false, dmg: 85, hitSpeed: 2000, lastHit: 0, el: document.getElementById('tower-red-king'), range: 160},
    'red-left': {id: 'red-left', x: 76, y: 60, hp: 1500, maxHp: 1500, team: 'red', type:'tower', isKing: false, ativo: true, dmg: 55, hitSpeed: 2000, lastHit: 0, el: document.getElementById('tower-red-left'), range: 140},
    'red-right': {id: 'red-right', x: 284, y: 60, hp: 1500, maxHp: 1500, team: 'red', type:'tower', isKing: false, ativo: true, dmg: 55, hitSpeed: 2000, lastHit: 0, el: document.getElementById('tower-red-right'), range: 140},
    'blue-king': {id: 'blue-king', x: 180, y: 424, hp: 3000, maxHp: 3000, team: 'blue', type:'tower', isKing: true, ativo: false, dmg: 85, hitSpeed: 2000, lastHit: 0, el: document.getElementById('tower-blue-king'), range: 160},
    'blue-left': {id: 'blue-left', x: 76, y: 400, hp: 1500, maxHp: 1500, team: 'blue', type:'tower', isKing: false, ativo: true, dmg: 55, hitSpeed: 2000, lastHit: 0, el: document.getElementById('tower-blue-left'), range: 140},
    'blue-right': {id: 'blue-right', x: 284, y: 400, hp: 1500, maxHp: 1500, team: 'blue', type:'tower', isKing: false, ativo: true, dmg: 55, hitSpeed: 2000, lastHit: 0, el: document.getElementById('tower-blue-right'), range: 140}
};

const todasCartas = [
    { id: 'larrys', nome: 'Larrys', custo: 1, img: '💀' },
    { id: 'skelton_army', nome: 'Exército', custo: 3, img: '☠️' },
    { id: 'tornado', nome: 'Tornado', custo: 3, img: '🌪️' },
    { id: 'knight', nome: 'Cavaleiro', custo: 3, img: '⚔️' },
    { id: 'mini_pekka', nome: 'M. PEKKA', custo: 4, img: '🥞' },
    { id: 'fireball', nome: 'Fogo', custo: 4, img: '🔥' },
    { id: 'hog', nome: 'Corredor', custo: 4, img: '🐷' },
    { id: 'giant', nome: 'Gigante', custo: 5, img: '🛡️' }
];
let maoCartas = [];

function inicializarMao() {
    let embaralhado = [...todasCartas].sort(() => 0.5 - Math.random());
    maoCartas = embaralhado.slice(0, 4);
    renderizarDeck();
}

function renderizarDeck() {
    const deckDiv = document.getElementById('deck'); 
    deckDiv.innerHTML = '';
    maoCartas.forEach((carta, index) => {
        const cardEl = document.createElement('div'); 
        cardEl.className = 'card';
        cardEl.onclick = () => selectCard(carta, index, cardEl);
        cardEl.innerHTML = `<span class="card-img">${carta.img}</span>${carta.nome}<br>💧${carta.custo}`;
        deckDiv.appendChild(cardEl);
    });
}

// Geração de Elixir Passiva do Jogador
setInterval(() => {
    if (elixir < 10) {
        elixir += 1;
        elixirBar.style.width = (elixir * 10) + '%';
        elixirText.innerText = `Elixir: ${elixir} / 10`;
    }
}, 900);

function selectCard(carta, slotIndex, element) {
    if (elixir < carta.custo) return;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    selectedCard = carta.id; 
    selectedCost = carta.custo; 
    selectedSlot = slotIndex; 
    element.classList.add('active');
}

function rotacionarCarta(slot) {
    let cartasForaDaMao = todasCartas.filter(c => !maoCartas.some(m => m.id === c.id));
    let novaCarta = cartasForaDaMao[Math.floor(Math.random() * cartasForaDaMao.length)];
    maoCartas[slot] = novaCarta;
    renderizarDeck();
}

// Evento de Invocação por Clique na Arena
arena.addEventListener('click', (e) => {
    if (!selectedCard || elixir < selectedCost) return;
    const rect = arena.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    
    // Impede tropas terrestres de nascerem no campo inimigo
    if (selectedCard !== 'fireball' && selectedCard !== 'tornado' && y < 230) return;

    if (selectedCard === 'fireball') { 
        executarBolaDeFogo(x, y); 
    } else if (selectedCard === 'tornado') { 
        executarTornado(x, y); 
    } else if (selectedCard === 'larrys') {
        for(let i=0; i<3; i++) criarTropa('larrys', x + (i*12 - 12), y + (Math.random()*10 - 5), 'blue');
    } else if (selectedCard === 'skelton_army') {
        for(let i=0; i<11; i++) {
            let ox = (i % 4) * 10 - 15, oy = Math.floor(i / 4) * 10 - 15;
            criarTropa('larrys', x + ox, y + oy, 'blue');
        }
    } else { 
        criarTropa(selectedCard, x, y, 'blue'); 
    }
    
    elixir -= selectedCost; 
    selectedCard = null; 
    elixirBar.style.width = (elixir * 10) + '%';
    elixirText.innerText = `Elixir: ${elixir} / 10`;
    rotacionarCarta(selectedSlot);
});

function executarBolaDeFogo(targetX, targetY) {
    const fx = document.createElement('div');
    fx.style.position = 'absolute'; fx.style.width = '60px'; fx.style.height = '60px';
    fx.style.background = 'radial-gradient(circle, #ff5722 20%, transparent 70%)';
    fx.style.left = targetX + 'px'; fx.style.top = targetY + 'px'; fx.style.transform = 'translate(-50%, -50%)'; fx.style.zIndex = '10';
    arena.appendChild(fx); 
    setTimeout(() => { fx.remove(); }, 400);
    
    tropas.forEach(t => { if (t.team === 'red' && Math.hypot(t.x - targetX, t.y - targetY) < 45) t.hp -= 150; });
    for (let k in tDados) {
        let tor = tDados[k];
        if (tor.team === 'red' && Math.hypot(tor.x - targetX, tor.y - targetY) < 45) {
            tor.hp -= 100; 
            tor.el.innerHTML = (tor.isKing ? "👑" : "♜") + "<br>" + Math.max(0, Math.floor(tor.hp));
            if(tor.isKing) tor.ativo = true; 
            if(tor.hp <= 0) verificarDestruicaoTorre(tor);
        }
    }
}

function executarTornado(targetX, targetY) {
    const tnd = document.createElement('div');
    tnd.style.position = 'absolute'; tnd.style.width = '90px'; tnd.style.height = '90px';
    tnd.style.background = 'radial-gradient(circle, rgba(173,216,230,0.5) 10%, transparent 60%)';
    tnd.style.border = '2px dashed rgba(255,255,255,0.3)'; tnd.style.borderRadius = '50%';
    tnd.style.left = targetX + 'px'; tnd.style.top = targetY + 'px'; tnd.style.transform = 'translate(-50%, -50%)'; tnd.style.zIndex = '9';
    arena.appendChild(tnd);

    let duracao = 20;
    let intervaloTornado = setInterval(() => {
        tropas.forEach(t => {
            if (t.team === 'red') {
                let dist = Math.hypot(t.x - targetX, t.y - targetY);
                if (dist < 55) {
                    let angle = Math.atan2(targetY - t.y, targetX - t.x);
                    t.x += Math.cos(angle) * 3.5; 
                    t.y += Math.sin(angle) * 3.5; 
                    t.hp -= 1.5;
                }
            }
        });
        duracao--; 
        if(duracao <= 0) { clearInterval(intervaloTornado); tnd.remove(); }
    }, 100);
}

function criarTropa(type, x, y, team) {
    const htmlEl = document.createElement('div'); 
    htmlEl.className = `troop ${team}-team`;
    htmlEl.style.left = x + 'px'; 
    htmlEl.style.top = y + 'px';
    
    let hp = 50, dmg = 15, speed = 2, range = 15, targetType = 'any', movimento = 'ground', hitSpeed = 2000;
    
    if(type === 'larrys') { hp = 13; dmg = 8; speed = 2.4; range = 15; hitSpeed = 1000; htmlEl.innerText = '💀'; }
    if(type === 'knight') { hp = 110; dmg = 25; speed = 1.6; range = 15; hitSpeed = 1500; htmlEl.innerText = '⚔️'; }
    if(type === 'mini_pekka') { hp = 135; dmg = 400; speed = 1.4; range = 15; hitSpeed = 3000; htmlEl.innerText = '🥞'; }
    if(type === 'hog') { hp = 143; dmg = 110; speed = 3.2; range = 15; targetType = 'tower'; movimento = 'jump'; hitSpeed = 1800; htmlEl.innerText = '🐷'; }
    if(type === 'giant') { hp = 312; dmg = 200; speed = 0.9; range = 15; targetType = 'tower'; hitSpeed = 3500; htmlEl.innerText = '🛡️'; }

    arena.appendChild(htmlEl);
    tropas.push({ x, y, team, type, hp, dmg, speed, range, targetType, movimento, hitSpeed, lastHit: 0, el: htmlEl });
}

// Invocação de Tropas Inimigas do Bot (Vermelho)
setInterval(() => {
    const tipos = ['knight', 'giant', 'hog', 'larrys', 'mini_pekka', 'skelton_army'];
    let t = tipos[Math.floor(Math.random() * tipos.length)];
    let rx = Math.random() * 240 + 60;
    if(t === 'larrys') {
        for(let i=0; i<3; i++) criarTropa('larrys', rx + (i*10), Math.random() * 40 + 40, 'red');
    } else if(t === 'skelton_army') {
        for(let i=0; i<11; i++) criarTropa('larrys', rx + (i%4)*8, Math.random() * 40 + 40 + Math.floor(i/4)*8, 'red');
    } else { 
        criarTropa(t, rx, Math.random() * 40 + 40, 'red'); 
    }
}, 4200);

function verificarDestruicaoTorre(alvo) {
    alvo.el.style.background = '#555';
    if(alvo.isKing) { 
        alert(alvo.team === 'red' ? "🏆 VITÓRIA REAL!" : "GAME OVER!"); 
        location.reload(); 
    }
}

// Loop de Combate, Movimentação e Varredura de Alvos (~30 FPS)
setInterval(() => {
    let agora = Date.now();

    // 1. Defesa Controlada das Torres
    for (let k in tDados) {
        let tor = tDados[k];
        if (tor.hp > 0 && tor.ativo && (agora - tor.lastHit >= tor.hitSpeed)) {
            let alvoTorre = null, menorDist = tor.range;
            tropas.forEach(t => {
                if (t.team !== tor.team && t.hp > 0) {
                    let d = Math.hypot(t.x - tor.x, t.y - tor.y);
                    if (d < menorDist) { menorDist = d; alvoTorre = t; }
                }
            });
            if (alvoTorre) { 
                alvoTorre.hp -= tor.dmg; 
                tor.lastHit = agora; 
            }
        }
    }

    // 2. Inteligência Artificial e Física das Tropas
    tropas.forEach((tropa) => {
        if (tropa.hp <= 0) return;
        let alvo = null, menorDistancia = 9999;

        if (tropa.targetType === 'tower') {
            for (let k in tDados) {
// =========================================================================
// LOOP DE COMBATE, MOVIMENTAÇÃO E VARREDURA DE ALVOS (Roda suave a ~30 FPS)
// =========================================================================
setInterval(() => {
    let agora = Date.now();

    // 1. Defesa Controlada das Torres
    for (let k in tDados) {
        let tor = tDados[k];
        if (tor.hp > 0 && tor.ativo && (agora - tor.lastHit >= tor.hitSpeed)) {
            let alvoTorre = null, menorDist = tor.range;
            tropas.forEach(t => {
                if (t.team !== tor.team && t.hp > 0) {
                    let d = Math.hypot(t.x - tor.x, t.y - tor.y);
                    if (d < menorDist) { menorDist = d; alvoTorre = t; }
                }
            });
            if (alvoTorre) { 
                alvoTorre.hp -= tor.dmg; 
                tor.lastHit = agora; 
            }
        }
    }

    // 2. Inteligência Artificial e Física das Tropas
    tropas.forEach((tropa) => {
        if (tropa.hp <= 0) return;
        let alvo = null, menorDistancia = 9999;

        // Se a tropa foca apenas em construções/torres (ex: Gigante, Corredor)
        if (tropa.targetType === 'tower') {
            for (let k in tDados) {
                let tor = tDados[k];
                if (tor.team !== tropa.team && tor.hp > 0) {
                    let d = Math.hypot(tor.x - tropa.x, tor.y - tropa.y);
                    if (d < menorDistancia) { 
                        menorDistancia = d; 
                        alvo = tor; 
                    }
                }
            }
        } else {
            // Tropas comuns: focam primeiro em outras tropas inimigas
            tropas.forEach(inimiga => {
                if (inimiga.team !== tropa.team && inimiga.hp > 0) {
                    let d = Math.hypot(inimiga.x - tropa.x, inimiga.y - tropa.y);
                    if (d < menorDistancia) { 
                        menorDistancia = d; 
                        alvo = inimiga; 
                    }
                }
            });
            // Se não houver nenhuma tropa no mapa, avança contra as torres
            if (!alvo) {
                for (let k in tDados) {
                    let tor = tDados[k];
                    if (tor.team !== tropa.team && tor.hp > 0) {
                        let d = Math.hypot(tor.x - tropa.x, tor.y - tropa.y);
                        if (d < menorDistancia) { 
                            menorDistancia = d; 
                            alvo = tor; 
                        }
                    }
                }
            }
        }

        // Executa Aproximação ou Combate Corporal
        if (alvo) {
            if (menorDistancia <= tropa.range) {
                // Se estiver no alcance de ataque, bate respeitando o tempo de recarga (hitSpeed)
                if (agora - tropa.lastHit >= tropa.hitSpeed) {
                    alvo.hp -= tropa.dmg;
                    tropa.lastHit = agora;
                    
                    // Se estiver batendo em uma torre, atualiza o visual dela na tela
                    if (alvo.type === 'tower') {
                        alvo.el.innerHTML = (alvo.isKing ? "👑" : "♜") + "<br>" + Math.max(0, Math.floor(alvo.hp));
                        
                        // Se bater no Rei inimigo, ativa o modo de defesa dele
                        if(alvo.isKing) tDados[alvo.id.includes('red') ? 'red-king' : 'blue-king'].ativo = true;
                        
                        // Se o HP da torre zerar, roda a função de destruição
                        if (alvo.hp <= 0) verificarDestruicaoTorre(alvo);
                    }
                }
            } else {
                // Se estiver longe do alvo, calcula o ângulo vetorial e caminha até ele
                let angulo = Math.atan2(alvo.y - tropa.y, alvo.x - tropa.x);
                tropa.x += Math.cos(angulo) * tropa.speed;
                tropa.y += Math.sin(angulo) * tropa.speed;
                tropa.el.style.left = tropa.x + 'px';
                tropa.el.style.top = tropa.y + 'px';
            }
        }
    });

    // 3. Coleta de lixo e remoção de tropas com HP zerado (Garante ótima performance)
    for (let i = tropas.length - 1; i >= 0; i--) {
        if (tropas[i].hp <= 0) {
            if (tropas[i].el) tropas[i].el.remove();
            tropas.splice(i, 1);
        }
    }
}, 33); // Fecha corretamente o setInterval do Loop principal

// Executa a carga inicial do deck de cartas assim que a página abre
inicializarMao();
