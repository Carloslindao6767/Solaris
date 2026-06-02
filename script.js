const arena = document.getElementById('arena');
let elixir = 0, selectedCard = null, selectedCost = 0, selectedSlot = null;
let tropas = [], campeaoEmCampo = false;

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
    // 1. TROPAS (Foco Dinâmico: Construção vs Qualquer Alvo)
    { id: 'giant', nome: 'Gigante', custo: 5, img: '🛡️', cat: 'tropa' },
    { id: 'hog', nome: 'Corredor', custo: 4, img: '🐷', cat: 'tropa' },
    { id: 'balloon', nome: 'Balão', custo: 5, img: '🎈', cat: 'tropa' },
    { id: 'royal_giant', nome: 'G. Real', custo: 6, img: '🧔', cat: 'tropa' },
    { id: 'knight', nome: 'Cavaleiro', custo: 3, img: '⚔️', cat: 'tropa' },
    // 2. FEITIÇOS (Uso Instantâneo no Clique)
    { id: 'fireball', nome: 'Fogo', custo: 4, img: '🔥', cat: 'feitico' },
    { id: 'poison', nome: 'Veneno', custo: 4, img: '🧪', cat: 'feitico' },
    { id: 'graveyard', nome: 'Cemitério', custo: 5, img: '🪦', cat: 'feitico' },
    // 3. CONSTRUÇÕES (Estáticas no Campo)
    { id: 'tesla', nome: 'Tesla', custo: 4, img: '⚡', cat: 'construcao' },
    // 4. CAMPEÕES (Apenas 1 por vez no campo)
    { id: 'golden_knight', nome: 'C. Dourado', custo: 4, img: '👑', cat: 'campeao' }
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
        cardEl.className = `card cat-${carta.cat}`;
        cardEl.onclick = () => selectCard(carta, index, cardEl);
        cardEl.innerHTML = `<span class="card-img">${carta.img}</span>${carta.nome}<br>💧${carta.custo}`;
        deckDiv.appendChild(cardEl);
    });
}

setInterval(() => {
    if (elixir < 10) {
        elixir += 1;
        elixirBar.style.width = (elixir * 10) + '%';
        elixirText.innerText = `Elixir: ${elixir} / 10`;
    }
}, 900);

function selectCard(carta, slotIndex, element) {
    if (elixir < carta.custo) return;
    if (carta.cat === 'campeao' && campeaoEmCampo) return; // Bloqueia invocação múltipla do Campeão
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    selectedCard = carta; 
    selectedCost = carta.custo; 
    selectedSlot = slotIndex; 
    element.classList.add('active');
}

function rotacionarCarta(slot) {
    let cartasForaDaMao = todasCartas.filter(c => !maoCartas.some(m => m.id === c.id));
    // Impede o Campeão de reentrar na rotação se ele já estiver vivo no mapa
    if (campeaoEmCampo) cartasForaDaMao = cartasForaDaMao.filter(c => c.cat !== 'campeao');
    let novaCarta = cartasForaDaMao[Math.floor(Math.random() * cartasForaDaMao.length)];
    maoCartas[slot] = novaCarta;
    renderizarDeck();
}

arena.addEventListener('click', (e) => {
    if (!selectedCard || elixir < selectedCost) return;
    const rect = arena.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    
    if (selectedCard.cat !== 'feitico' && y < 230) return; // Linha do rio

    if (selectedCard.cat === 'feitico') {
        executarFeitico(selectedCard.id, x, y);
    } else {
        if (selectedCard.cat === 'campeao') campeaoEmCampo = true;
        criarEntidade(selectedCard.id, x, y, 'blue', selectedCard.cat);
    }
    
    elixir -= selectedCost; 
    selectedCard = null; 
    elixirBar.style.width = (elixir * 10) + '%';
    elixirText.innerText = `Elixir: ${elixir} / 10`;
    rotacionarCarta(selectedSlot);
});

function executarFeitico(id, targetX, targetY) {
    const fx = document.createElement('div');
    fx.style.position = 'absolute'; fx.style.transform = 'translate(-50%, -50%)'; fx.style.left = targetX + 'px'; fx.style.top = targetY + 'px'; fx.style.zIndex = '10'; fx.style.borderRadius = '50%';
    
    if (id === 'fireball') {
        fx.style.width = '70px'; fx.style.height = '70px'; fx.style.background = 'radial-gradient(circle, #ff5722 20%, transparent 70%)';
        arena.appendChild(fx); setTimeout(() => fx.remove(), 400);
        aplicarDanoArea(targetX, targetY, 45, 150, 100);
    } 
    else if (id === 'poison') {
        fx.style.width = '90px'; fx.style.height = '90px'; fx.style.background = 'radial-gradient(circle, rgba(156,39,176,0.4) 30%, transparent 70%)'; fx.style.border = '1px solid #9c27b0';
        arena.appendChild(fx);
        let ticks = 6;
        let pInterval = setInterval(() => {
            aplicarDanoArea(targetX, targetY, 55, 30, 15);
            ticks--; if(ticks <= 0) { clearInterval(pInterval); fx.remove(); }
        }, 800);
    } 
    else if (id === 'graveyard') {
        fx.style.width = '100px'; fx.style.height = '100px'; fx.style.border = '2px dashed rgba(255,255,255,0.2)';
        arena.appendChild(fx);
        let esqGerados = 0;
        let gInterval = setInterval(() => {
            let sx = targetX + (Math.random() * 60 - 30), sy = targetY + (Math.random() * 60 - 30);
            criarEntidade('larrys', sx, sy, 'blue', 'tropa');
            esqGerados++; if(esqGerados >= 10) { clearInterval(gInterval); fx.remove(); }
        }, 500);
    }
}

function aplicarDanoArea(tx, ty, raio, dmgTropas, dmgTorres) {
    tropas.forEach(t => { if (t.team === 'red' && Math.hypot(t.x - tx, t.y - ty) < raio) t.hp -= dmgTropas; });
    for (let k in tDados) {
        let tor = tDados[k];
        if (tor.team === 'red' && Math.hypot(tor.x - tx, tor.y - ty) < raio) {
            tor.hp -= dmgTorres;
            tor.el.innerHTML = (tor.isKing ? "👑" : "♜") + "<br>" + Math.max(0, Math.floor(tor.hp));
            if(tor.isKing) tor.ativo = true;
            if(tor.hp <div class="hp-bar"></div></div>`;
    const label = document.createElement('span');
    htmlEl.appendChild(label);
    
    let hp = 100, maxHp = 100, dmg = 20, speed = 1.5, range = 15, targetType = 'any', hitSpeed = 1500;
    
    if(type === 'larrys') { hp = 15; dmg = 10; speed = 2.4; label.innerText = '💀'; }
    else if(type === 'knight') { hp = 130; dmg = 28; speed = 1.6; label.innerText = '⚔️'; }
    else if(type === 'giant') { hp = 350; dmg = 45; speed = 0.8; targetType = 'tower'; label.innerText = '🛡️'; }
    else if(type === 'hog') { hp = 180; dmg = 60; speed = 3.0; targetType = 'tower'; label.innerText = '🐷'; }
    else if(type === 'balloon') { hp = 140; dmg = 180; speed = 1.2; targetType = 'tower'; hitSpeed = 3000; label.innerText = '🎈'; }
    else if(type === 'royal_giant') { hp = 290; dmg = 35; speed = 0.9; range = 65; targetType = 'tower'; label.innerText = '🧔'; }
    else if(type === 'tesla') { hp = 200; dmg = 30; speed = 0; range = 45; label.innerText = '⚡'; }
    else if(type === 'golden_knight') { hp = 250; dmg = 40; speed = 1.8; label.innerText = '👑'; } // Campeão

    maxHp = hp;
    tropas.push({ x, y, team, type, cat, hp, maxHp, dmg, speed, range, targetType, hitSpeed, lastHit: 0, el: htmlEl });
    arena.appendChild(htmlEl);
}

// Spawn automático do Robô Inimigo
setInterval(() => {
    const pools = ['knight', 'giant', 'hog', 'balloon', 'royal_giant'];
    let tipoSorteado = pools[Math.floor(Math.random() * pools.length)];
    let rx = Math.random() * 240 + 60;
    criarEntidade(tipoSorteado, rx, 40, 'red', 'tropa');
}, 5000);

function verificarDestruicaoTorre(alvo) {
    alvo.el.style.background = '#424242';
    if(alvo.isKing) { alert(alvo.team === 'red' ? "🏆 VITÓRIA REAL!" : "GAME OVER!"); location.reload(); }
}

// Loop Principal de Física e Cálculo de Alvos (~30 FPS)
setInterval(() => {
    let agora = Date.now();

    // Ataque das Torres estáticas
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
        // Execução de movimento ou ataque corporal
        if (alvo) {
            if (menorDistancia <= t.range) {
                // Se estiver no alcance, ataca respeitando o tempo de recarga (hitSpeed)
                if (agora - t.lastHit >= t.hitSpeed) {
                    alvo.hp -= t.dmg; 
                    t.lastHit = agora;
                    
                    // Se o alvo for uma torre, atualiza o texto de vida na tela
                    if (alvo.type === 'tower') {
                        alvo.el.innerHTML = (alvo.isKing ? "👑" : "♜") + "<br>" + Math.max(0, Math.floor(alvo.hp));
                        
                        // Ativa o Rei inimigo caso ele seja atingido
                        if(alvo.isKing) tDados[alvo.id.includes('red') ? 'red-king' : 'blue-king'].ativo = true;
                        
                        // Verifica se a torre caiu
                        if (alvo.hp <= 0) verificarDestruicaoTorre(alvo);
                    }
                }
            } else if (t.speed > 0) {
                // Se estiver longe e puder andar (speed > 0), calcula o caminho vetorial
                let angulo = Math.atan2(alvo.y - t.y, alvo.x - t.x);
                t.x += Math.cos(angulo) * t.speed; 
                t.y += Math.sin(angulo) * t.speed;
                
                // Atualiza a posição visual no mapa da arena
                t.el.style.left = t.x + 'px'; 
                t.el.style.top = t.y + 'px';
            }
        }
    });

    // 3. Coleta de lixo e remoção de entidades mortas (Garante alta performance)
    for (let i = tropas.length - 1; i >= 0; i--) {
        if (tropas[i].hp <= 0) {
            // Se o Campeão Azul morrer, libera a variável para permitir que ele seja jogado de novo
            if (tropas[i].cat === 'campeao' && tropas[i].team === 'blue') {
                campeaoEmCampo = false; 
            }
            // Remove o elemento do HTML
            if (tropas[i].el) tropas[i].el.remove();
            // Remove do array lógico do jogo
            tropas.splice(i, 1);
        }
    }
}, 33); // Fecha corretamente o setInterval do Loop principal a ~30 FPS

// Sorteia e renderiza as 4 cartas iniciais do jogador na abertura da página
inicializarMao();
