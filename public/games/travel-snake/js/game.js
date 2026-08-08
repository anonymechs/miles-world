/*
 * game.js — Travel Snake: Around the Countries
 *
 * Everything is drawn with three.js through an orthographic camera onto a
 * fixed 960x480 buffer, which the CSS then scales up with nearest-neighbour
 * filtering. That keeps every sprite on a hard pixel grid.
 */
(function () {
  'use strict';

  var GW = 120, GH = 60, CELL = 8;          // grid cells and their pixel size
  var W = GW * CELL, H = GH * CELL;         // 960 x 480 render buffer
  var MAP_W = 240, MAP_H = 120;             // world map raster resolution

  var FLAG_POINTS = 10, LANDMARK_POINTS = 50;
  var GROW_FLAG = 3, GROW_LANDMARK = 6;
  var BASE_STEP = 135, MIN_STEP = 62;
  var HIGH_SCORE_KEY = 'travelSnake.highScore';

  var HEAD_COLOR = 0xd6f45a;
  var DEFAULT_BODY = '#4f9146';

  var renderer, scene, camera, clock;
  var snakeGroup, segmentPool = [], headMesh;
  var itemMesh, haloMesh, labelMesh;
  var pinCanvas, pinCtx, pinTexture;

  var state = {
    running: false,
    paused: false,
    over: false,
    won: false,
    score: 0,
    high: 0,
    segments: [],
    dir: { x: 1, y: 0 },
    queue: [],
    grow: 0,
    trailColor: DEFAULT_BODY,
    item: null,
    remainingCountries: [],
    remainingLandmarks: [],
    eatenCountries: 0,
    eatenLandmarks: 0,
    accumulator: 0,
    elapsed: 0
  };

  var dom = {};

  /* ------------------------------------------------------------- audio -- */

  var audioCtx = null;

  function blip(freq, duration, type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.06;
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) { /* audio is a nicety, never a hard failure */ }
  }

  /* ------------------------------------------------------- three setup -- */

  function pixelTexture(canvas) {
    var tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  function plane(w, h, material) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  }

  function toWorld(cx, cy) {
    return { x: cx * CELL + CELL / 2, y: H - (cy * CELL + CELL / 2) };
  }

  function makeHeadTexture() {
    var c = document.createElement('canvas');
    c.width = 8; c.height = 8;
    var g = c.getContext('2d');
    g.fillStyle = '#d6f45a';
    g.fillRect(0, 0, 8, 8);
    g.fillStyle = '#9ac93a';
    g.fillRect(0, 0, 8, 1);
    g.fillRect(0, 7, 8, 1);
    g.fillStyle = '#12220a';
    g.fillRect(5, 2, 2, 2);   // eyes, facing +x
    g.fillRect(5, 4, 2, 2);
    g.fillStyle = '#ff5a5a';
    g.fillRect(7, 3, 1, 2);   // tongue
    return c;
  }

  function makeHaloTexture() {
    var c = document.createElement('canvas');
    c.width = 48; c.height = 48;
    var g = c.getContext('2d');
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(24, 24, 20, 0, Math.PI * 2);
    g.stroke();
    return c;
  }

  function makeLabelTexture(text) {
    var c = document.createElement('canvas');
    var g = c.getContext('2d');
    g.font = 'bold 10px monospace';
    var w = Math.ceil(g.measureText(text).width) + 6;
    c.width = w; c.height = 14;
    g = c.getContext('2d');
    g.font = 'bold 10px monospace';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(6,14,26,0.82)';
    g.fillRect(0, 0, w, 14);
    g.fillStyle = '#ffffff';
    g.fillText(text, 3, 8);
    return c;
  }

  function init() {
    var world = WorldMap.build(MAP_W, MAP_H);

    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('game'),
      antialias: false
    });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(0, W, H, 0, -100, 100);
    clock = new THREE.Clock();

    var mapMesh = plane(W, H, new THREE.MeshBasicMaterial({ map: pixelTexture(world.canvas) }));
    mapMesh.position.set(W / 2, H / 2, 0);
    scene.add(mapMesh);

    // Visited-country pins accumulate on their own transparent overlay.
    pinCanvas = document.createElement('canvas');
    pinCanvas.width = W; pinCanvas.height = H;
    pinCtx = pinCanvas.getContext('2d');
    pinTexture = pixelTexture(pinCanvas);
    var pinMesh = plane(W, H, new THREE.MeshBasicMaterial({ map: pinTexture, transparent: true }));
    pinMesh.position.set(W / 2, H / 2, 1);
    scene.add(pinMesh);

    haloMesh = plane(48, 48, new THREE.MeshBasicMaterial({
      map: pixelTexture(makeHaloTexture()), transparent: true, opacity: 0.5
    }));
    haloMesh.position.z = 2;
    scene.add(haloMesh);

    itemMesh = plane(Flags.WIDTH, Flags.HEIGHT, new THREE.MeshBasicMaterial({ transparent: true }));
    itemMesh.position.z = 3;
    scene.add(itemMesh);

    labelMesh = plane(1, 1, new THREE.MeshBasicMaterial({ transparent: true }));
    labelMesh.position.z = 4;
    scene.add(labelMesh);

    snakeGroup = new THREE.Group();
    snakeGroup.position.z = 5;
    scene.add(snakeGroup);

    headMesh = plane(CELL, CELL, new THREE.MeshBasicMaterial({
      map: pixelTexture(makeHeadTexture()), transparent: true, color: HEAD_COLOR
    }));
    headMesh.position.z = 6;
    scene.add(headMesh);

    cacheDom();
    bindEvents();
    layout();
    resetGame();
    animate();
  }

  /* ---------------------------------------------------------- game flow -- */

  function resetGame() {
    state.segments = [];
    var startX = 22, startY = 30;
    for (var i = 0; i < 6; i++) {
      state.segments.push({ x: startX - i, y: startY, c: DEFAULT_BODY });
    }
    state.dir = { x: 1, y: 0 };
    state.queue = [];
    state.grow = 0;
    state.trailColor = DEFAULT_BODY;
    state.score = 0;
    state.over = false;
    state.won = false;
    state.paused = false;
    state.eatenCountries = 0;
    state.eatenLandmarks = 0;
    state.accumulator = 0;
    state.elapsed = 0;
    state.remainingCountries = Countries.slice();
    state.remainingLandmarks = Landmarks.list.slice();
    pinCtx.clearRect(0, 0, W, H);
    pinTexture.needsUpdate = true;
    spawnItem();
    updateHud();
  }

  function startGame() {
    resetGame();
    state.running = true;
    dom.pause.textContent = '⏸ Pause';
    hideOverlay();
    blip(660, 0.08);
  }

  function stepInterval() {
    var speedUp = state.segments.length * 0.45;
    return Math.max(MIN_STEP, BASE_STEP - speedUp);
  }

  function spawnItem() {
    var useLandmark = state.remainingLandmarks.length > 0 &&
      (state.remainingCountries.length === 0 || Math.random() < 0.12);

    if (!useLandmark && state.remainingCountries.length === 0) {
      state.item = null;
      positionItem();
      win();
      return;
    }

    var pool = useLandmark ? state.remainingLandmarks : state.remainingCountries;
    var index = Math.floor(Math.random() * pool.length);
    var data = pool.splice(index, 1)[0];
    var cell = WorldMap.project(data.lat, data.lon, GW, GH);

    // Nudge off the snake so an item never spawns underneath the player.
    var attempts = 0;
    while (occupied(cell.x, cell.y) && attempts < 40) {
      cell.x = (cell.x + 2) % GW;
      cell.y = (cell.y + 1) % GH;
      attempts++;
    }

    var canvas = useLandmark ? Landmarks.render(data) : Flags.render(data);
    var kind = useLandmark ? 'landmark' : 'flag';
    var size = useLandmark ? 32 : Flags.WIDTH;
    var height = useLandmark ? 32 : Flags.HEIGHT;

    state.item = {
      kind: kind,
      data: data,
      x: cell.x,
      y: cell.y,
      color: dominantColor(canvas)
    };

    if (itemMesh.material.map) itemMesh.material.map.dispose();
    itemMesh.material.map = pixelTexture(canvas);
    itemMesh.material.needsUpdate = true;
    itemMesh.geometry.dispose();
    itemMesh.geometry = new THREE.PlaneGeometry(size, height);

    var label = makeLabelTexture(kind === 'landmark' ? data.name : data.name.toUpperCase());
    if (labelMesh.material.map) labelMesh.material.map.dispose();
    labelMesh.material.map = pixelTexture(label);
    labelMesh.material.needsUpdate = true;
    labelMesh.geometry.dispose();
    labelMesh.geometry = new THREE.PlaneGeometry(label.width, label.height);

    positionItem();
    updateHud();
  }

  /** Average of the sprite's opaque pixels — used to tint the snake's trail. */
  function dominantColor(canvas) {
    var g = canvas.getContext('2d');
    var data = g.getImageData(0, 0, canvas.width, canvas.height).data;
    var r = 0, gr = 0, b = 0, n = 0;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      r += data[i]; gr += data[i + 1]; b += data[i + 2]; n++;
    }
    if (!n) return DEFAULT_BODY;
    r /= n; gr /= n; b /= n;
    // Rescale so the brightest channel lands near 200: keeps the hue of the
    // flag but stops pale sprites bleaching the trail to white.
    var factor = 200 / Math.max(r, gr, b, 1);
    factor = Math.min(Math.max(factor, 0.85), 2.2);
    var out = function (v) { return Math.min(255, Math.round(v * factor)); };
    return 'rgb(' + out(r) + ',' + out(gr) + ',' + out(b) + ')';
  }

  function positionItem() {
    if (!state.item) {
      itemMesh.visible = haloMesh.visible = labelMesh.visible = false;
      return;
    }
    itemMesh.visible = haloMesh.visible = labelMesh.visible = true;
    var p = toWorld(state.item.x, state.item.y);
    itemMesh.position.x = p.x;
    itemMesh.position.y = p.y;
    haloMesh.position.x = p.x;
    haloMesh.position.y = p.y;
    labelMesh.position.x = Math.max(labelMesh.geometry.parameters.width / 2,
      Math.min(W - labelMesh.geometry.parameters.width / 2, p.x));
    labelMesh.position.y = Math.min(H - 8, p.y + 22);
  }

  function occupied(x, y) {
    for (var i = 0; i < state.segments.length; i++) {
      if (state.segments[i].x === x && state.segments[i].y === y) return true;
    }
    return false;
  }

  function step() {
    if (state.queue.length) {
      var next = state.queue.shift();
      // Ignore reversals into the neck.
      if (!(next.x === -state.dir.x && next.y === -state.dir.y)) state.dir = next;
    }

    var head = state.segments[0];
    var nx = (head.x + state.dir.x + GW) % GW;
    var ny = (head.y + state.dir.y + GH) % GH;

    var growing = state.grow > 0;
    var limit = growing ? state.segments.length : state.segments.length - 1;
    for (var i = 0; i < limit; i++) {
      if (state.segments[i].x === nx && state.segments[i].y === ny) {
        gameOver();
        return;
      }
    }

    state.segments.unshift({ x: nx, y: ny, c: state.trailColor });
    if (growing) state.grow--;
    else state.segments.pop();

    checkEat(nx, ny);
  }

  function checkEat(hx, hy) {
    if (!state.item) return;
    // Wrap-aware distance so an item near the map edge is still reachable.
    var dx = Math.abs(hx - state.item.x);
    var dy = Math.abs(hy - state.item.y);
    dx = Math.min(dx, GW - dx);
    dy = Math.min(dy, GH - dy);
    if (dx > 1 || dy > 1) return;

    var item = state.item;
    if (item.kind === 'flag') {
      state.score += FLAG_POINTS;
      state.grow += GROW_FLAG;
      state.eatenCountries++;
      blip(720, 0.09);
    } else {
      state.score += LANDMARK_POINTS;
      state.grow += GROW_LANDMARK;
      state.eatenLandmarks++;
      blip(520, 0.14, 'triangle');
      window.setTimeout(function () { blip(880, 0.12, 'triangle'); }, 90);
    }
    state.trailColor = item.color;
    saveHighScore();
    dropPin(item);
    announce(item);
    spawnItem();
    updateHud();
  }

  function dropPin(item) {
    var p = toWorld(item.x, item.y);
    var px = Math.round(p.x), py = Math.round(H - p.y);
    pinCtx.fillStyle = 'rgba(0,0,0,0.55)';
    pinCtx.fillRect(px - 2, py - 2, 5, 5);
    pinCtx.fillStyle = item.color;
    pinCtx.fillRect(px - 1, py - 1, 3, 3);
    pinTexture.needsUpdate = true;
  }

  function gameOver() {
    state.running = false;
    state.over = true;
    saveHighScore();
    blip(160, 0.35, 'sawtooth');
    showOverlay('Game Over',
      'The snake tied itself in a knot.',
      'Score ' + state.score + ' &middot; ' + state.eatenCountries + ' countries &middot; ' +
      state.eatenLandmarks + ' landmarks',
      'Play again');
    updateHud();
  }

  function win() {
    state.running = false;
    state.won = true;
    saveHighScore();
    showOverlay('You circled the world!',
      'All 193 flags and every landmark eaten.',
      'Final score ' + state.score,
      'Go again');
    updateHud();
  }

  function saveHighScore() {
    if (state.score > state.high) {
      state.high = state.score;
      try { localStorage.setItem(HIGH_SCORE_KEY, String(state.high)); } catch (e) { /* private mode */ }
    }
  }

  function togglePause(force) {
    if (!state.running) return;
    state.paused = (typeof force === 'boolean') ? force : !state.paused;
    dom.pause.textContent = state.paused ? '▶ Resume' : '⏸ Pause';
    if (state.paused) {
      showOverlay('Paused', 'Take a breather.', 'Score ' + state.score, 'Resume', true);
    } else {
      hideOverlay();
    }
  }

  /* ------------------------------------------------------------ render -- */

  function syncSnakeMeshes() {
    while (segmentPool.length < state.segments.length) {
      var mesh = plane(CELL, CELL, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      mesh.visible = false;
      snakeGroup.add(mesh);
      segmentPool.push(mesh);
    }
    for (var i = 0; i < segmentPool.length; i++) {
      var seg = state.segments[i];
      var m = segmentPool[i];
      if (!seg || i === 0) { m.visible = false; continue; }
      var p = toWorld(seg.x, seg.y);
      m.visible = true;
      m.position.set(p.x, p.y, 0);
      m.material.color.set(seg.c);
      // Taper the last few segments so the snake reads as a snake, not a train.
      var fromTail = state.segments.length - 1 - i;
      var scale = fromTail < 3 ? 0.5 + fromTail * 0.18 : 1;
      m.scale.set(scale, scale, 1);
    }

    var head = state.segments[0];
    var hp = toWorld(head.x, head.y);
    headMesh.position.x = hp.x;
    headMesh.position.y = hp.y;
    headMesh.rotation.z = Math.atan2(-state.dir.y, state.dir.x);
  }

  function animate() {
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta() * 1000, 250);

    if (state.running && !state.paused) {
      state.elapsed += dt;
      state.accumulator += dt;
      var interval = stepInterval();
      while (state.accumulator >= interval) {
        state.accumulator -= interval;
        step();
        if (!state.running) break;
      }
    }

    var pulse = 1 + Math.sin(performance.now() / 260) * 0.12;
    haloMesh.scale.set(pulse, pulse, 1);
    haloMesh.material.opacity = 0.32 + Math.sin(performance.now() / 260) * 0.16;

    syncSnakeMeshes();
    renderer.render(scene, camera);
  }

  /* --------------------------------------------------------------- ui -- */

  function cacheDom() {
    dom.score = document.getElementById('score');
    dom.high = document.getElementById('high');
    dom.length = document.getElementById('length');
    dom.progress = document.getElementById('progress');
    dom.progressBar = document.getElementById('progress-bar');
    dom.target = document.getElementById('target');
    dom.targetFlag = document.getElementById('target-flag');
    dom.recent = document.getElementById('recent');
    dom.pause = document.getElementById('btn-pause');
    dom.restart = document.getElementById('btn-restart');
    dom.overlay = document.getElementById('overlay');
    dom.overlayTitle = document.getElementById('overlay-title');
    dom.overlayText = document.getElementById('overlay-text');
    dom.overlayStats = document.getElementById('overlay-stats');
    dom.overlayBtn = document.getElementById('overlay-btn');
    dom.stage = document.getElementById('stage');
    dom.panel = document.getElementById('panel');

    try {
      state.high = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10) || 0;
    } catch (e) { state.high = 0; }
  }

  function updateHud() {
    dom.score.textContent = state.score;
    dom.high.textContent = Math.max(state.high, state.score);
    dom.length.textContent = state.segments.length;
    var total = Countries.length;
    dom.progress.textContent = state.eatenCountries + ' / ' + total;
    dom.progressBar.style.width = (state.eatenCountries / total * 100) + '%';

    if (state.item) {
      dom.target.textContent = state.item.data.name;
      var canvas = state.item.kind === 'landmark'
        ? Landmarks.render(state.item.data)
        : Flags.render(state.item.data);
      dom.targetFlag.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
      dom.targetFlag.classList.toggle('is-landmark', state.item.kind === 'landmark');
    } else {
      dom.target.textContent = '—';
      dom.targetFlag.style.backgroundImage = 'none';
    }
  }

  var recent = [];

  function announce(item) {
    recent.unshift(item.data.name + (item.kind === 'landmark' ? ' ★' : ''));
    if (recent.length > 5) recent.pop();
    dom.recent.innerHTML = recent.map(function (n, i) {
      return '<li' + (i === 0 ? ' class="fresh"' : '') + '>' + n + '</li>';
    }).join('');
  }

  function showOverlay(title, text, stats, button, isPause) {
    dom.overlayTitle.textContent = title;
    dom.overlayText.textContent = text;
    dom.overlayStats.innerHTML = stats || '';
    dom.overlayBtn.textContent = button;
    dom.overlay.dataset.mode = isPause ? 'pause' : 'stop';
    dom.overlay.classList.add('visible');
  }

  function hideOverlay() {
    dom.overlay.classList.remove('visible');
  }

  function layout() {
    // Measure what is actually above and below the map rather than assuming a
    // fixed chrome height — the top bar and stat row both wrap on narrow windows.
    // Two passes: the stat row's height depends on the width it is given, which
    // depends on the scale we are choosing, so one extra pass settles it.
    for (var pass = 0; pass < 2; pass++) {
      // 46 = the column gap under the map plus the body's bottom padding.
      var reserved = dom.stage.offsetTop + dom.panel.offsetHeight + 46;
      var availableW = window.innerWidth - 32;      // body padding
      var availableH = Math.max(220, window.innerHeight - reserved);
      var scale = Math.min(availableW / W, availableH / H);
      // Upscaling snaps to eighths so sprite pixels stay near-even without
      // throwing away space; below 1x we take the exact fit.
      scale = scale >= 1 ? Math.min(3, Math.floor(scale * 8) / 8) : Math.max(0.2, scale);
      var width = Math.round(W * scale);
      dom.stage.style.width = width + 'px';
      dom.stage.style.height = Math.round(H * scale) + 'px';
      dom.panel.style.maxWidth = width + 'px';
    }
  }

  /**
   * Queues a turn. Only genuinely new directions are stored: key repeat and
   * reversals are dropped here rather than eating a queue slot, otherwise a
   * held-down arrow key would fill the queue and block every later input.
   */
  function turn(x, y) {
    var last = state.queue.length ? state.queue[state.queue.length - 1] : state.dir;
    if (x === last.x && y === last.y) return;          // same heading
    if (x === -last.x && y === -last.y) return;        // reversal
    if (state.queue.length >= 2) state.queue.length = 1;
    state.queue.push({ x: x, y: y });
  }

  // Matched against e.key and e.code alike, so the physical WASD block still
  // works on AZERTY/QWERTZ layouts where those keys carry other letters.
  var DIRECTIONS = {
    ArrowUp: [0, -1], KeyW: [0, -1], w: [0, -1], W: [0, -1],
    ArrowDown: [0, 1], KeyS: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], KeyA: [-1, 0], a: [-1, 0], A: [-1, 0],
    ArrowRight: [1, 0], KeyD: [1, 0], d: [1, 0], D: [1, 0]
  };

  function bindEvents() {
    window.addEventListener('keydown', function (e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;

      var dir = DIRECTIONS[e.key] || DIRECTIONS[e.code];
      if (dir) {
        turn(dir[0], dir[1]);
        e.preventDefault();
        return;
      }

      var key = e.key;
      if (key === ' ' || key === 'Spacebar' || e.code === 'Space' ||
          key === 'p' || key === 'P' || e.code === 'KeyP') {
        e.preventDefault();
        if (!state.running) startGame(); else togglePause();
      } else if (key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        if (!state.running) startGame();
      } else if (key === 'r' || key === 'R' || e.code === 'KeyR') {
        e.preventDefault();
        startGame();
      }
    });

    // Buttons keep focus after a mouse click, so a later Space would activate
    // them as well as reaching the game. Hand focus back to the page.
    function onClick(button, action) {
      button.addEventListener('click', function () {
        button.blur();
        action();
      });
    }
    onClick(dom.pause, function () { togglePause(); });
    onClick(dom.restart, function () { startGame(); });
    onClick(dom.overlayBtn, function () {
      if (dom.overlay.dataset.mode === 'pause') togglePause(false);
      else startGame();
    });

    window.addEventListener('resize', layout);

    // Swipe controls for touch devices.
    var touchStart = null;
    dom.stage.addEventListener('touchstart', function (e) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    dom.stage.addEventListener('touchend', function (e) {
      if (!touchStart) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - touchStart.x;
      var dy = t.clientY - touchStart.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
      else turn(0, dy > 0 ? 1 : -1);
      touchStart = null;
    }, { passive: true });
  }

  // Read-only handle for debugging in the console.
  window.TravelSnake = { state: state, turn: turn };

  window.addEventListener('load', function () {
    init();
    showOverlay('Travel Snake',
      'Slither around the world eating all 193 flags and 19 landmarks.',
      'Arrows or WASD to steer &middot; Space to pause &middot; R to restart &middot; every edge wraps around',
      'Start travelling');
  });
})();
