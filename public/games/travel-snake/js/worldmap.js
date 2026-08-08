/*
 * worldmap.js — builds a pixelated equirectangular world map.
 *
 * The continents are stored as coarse lon/lat polygons and rasterised into a
 * small canvas at load time. Land polygons are painted first, then "sea"
 * polygons carve out inland waters (Hudson Bay, Black Sea, ...).
 */
(function (global) {
  'use strict';

  // Outlines are deliberately low-fidelity: at ~1.5 degrees per pixel anything
  // finer than a large bay disappears anyway.
  var LAND = [
    // North America
    [[-168, 65], [-160, 71], [-140, 70], [-120, 70], [-100, 69], [-85, 72],
     [-76, 67], [-60, 58], [-55, 50], [-66, 44], [-74, 40], [-80, 32],
     [-82, 25], [-90, 29], [-97, 26], [-97, 20], [-90, 17], [-84, 10],
     [-78, 8], [-83, 16], [-95, 19], [-105, 21], [-114, 29], [-121, 35],
     [-125, 48], [-133, 55], [-145, 60], [-152, 58], [-165, 62]],
    // South America
    [[-81, 10], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-44, -2], [-35, -5],
     [-39, -14], [-48, -25], [-53, -34], [-58, -38], [-62, -40], [-65, -45],
     [-68, -52], [-75, -52], [-73, -45], [-71, -33], [-70, -18], [-75, -14],
     [-81, -5], [-80, 2], [-77, 8]],
    // Africa
    [[-17, 15], [-16, 21], [-10, 28], [0, 32], [10, 37], [20, 32], [25, 32],
     [32, 31], [35, 28], [43, 12], [51, 12], [43, -1], [40, -10], [36, -18],
     [33, -27], [26, -34], [18, -35], [12, -18], [9, -1], [3, 5], [-8, 4],
     [-13, 8]],
    // Eurasia
    [[-9, 39], [-9, 43], [-2, 44], [-2, 48], [2, 51], [5, 53], [8, 54],
     [10, 57], [12, 56], [12, 58], [11, 59], [5, 62], [12, 66], [16, 69],
     [22, 70], [28, 71], [33, 70], [45, 68], [55, 68], [70, 70], [80, 74],
     [95, 76], [105, 77], [115, 74], [130, 72], [140, 72], [150, 70],
     [160, 70], [170, 68], [180, 66], [180, 62], [170, 60], [163, 58],
     [155, 50], [143, 45], [135, 43], [130, 42], [127, 38], [122, 31],
     [110, 22], [105, 10], [100, 13], [97, 17], [92, 21], [88, 22], [80, 15],
     [77, 8], [72, 20], [68, 23], [62, 25], [57, 25], [52, 29], [48, 30],
     [44, 37], [36, 36], [26, 37], [23, 38], [20, 40], [16, 42], [13, 45],
     [18, 40], [16, 38], [12, 42], [8, 44], [3, 43], [0, 40], [-6, 36]],
    // Greenland
    [[-45, 60], [-20, 70], [-20, 82], [-45, 84], [-60, 80], [-55, 68]],
    // Iceland
    [[-24, 64], [-14, 64], [-14, 66], [-24, 66]],
    // Great Britain
    [[-5, 50], [1, 52], [-1, 58], [-5, 58], [-6, 54]],
    // Ireland
    [[-10, 52], [-6, 52], [-6, 55], [-10, 55]],
    // Japan
    [[129, 32], [135, 34], [140, 38], [145, 44], [142, 45], [137, 36], [130, 31]],
    // Taiwan
    [[120, 22], [122, 25], [121, 25], [120, 23]],
    // Philippines
    [[120, 18], [124, 13], [126, 7], [122, 6], [120, 13]],
    // Borneo
    [[109, 2], [117, 4], [119, -1], [115, -4], [110, -3]],
    // Sumatra
    [[95, 5], [100, 2], [106, -6], [103, -6], [97, 2]],
    // Java
    [[105, -6], [114, -7], [114, -8], [105, -8]],
    // Sulawesi
    [[119, 1], [125, 1], [123, -5], [120, -3]],
    // New Guinea
    [[131, -1], [141, -3], [150, -6], [147, -9], [138, -8], [132, -4]],
    // Australia
    [[113, -22], [114, -35], [129, -32], [138, -35], [145, -38], [150, -37],
     [153, -28], [145, -15], [135, -12], [130, -11], [125, -14], [117, -20]],
    // New Zealand
    [[166, -46], [174, -41], [178, -38], [173, -34], [170, -40], [167, -45]],
    // Madagascar
    [[43, -25], [50, -15], [49, -12], [44, -16], [45, -25]],
    // Sri Lanka
    [[80, 6], [82, 7], [81, 9], [80, 9]],
    // Cuba
    [[-85, 22], [-74, 20], [-75, 22], [-84, 23]],
    // Hispaniola
    [[-74, 19], [-68, 18], [-69, 20], [-73, 20]],
    // Antarctica
    [[-180, -74], [-120, -76], [-70, -73], [-60, -65], [-45, -74], [20, -71],
     [70, -70], [110, -68], [160, -75], [180, -74], [180, -90], [-180, -90]]
  ];

  var SEA = [
    [[-95, 55], [-95, 59], [-90, 62], [-82, 63], [-78, 60], [-79, 55],
     [-84, 51], [-91, 52]],                                  // Hudson Bay
    [[-92, 48], [-86, 49], [-80, 46], [-76, 44], [-79, 42], [-84, 42],
     [-88, 44]],                                             // Great Lakes
    [[28, 42], [32, 46], [37, 47], [41, 45], [41, 42], [36, 41], [31, 41]],  // Black Sea
    [[48, 38], [51, 37], [53, 41], [52, 45], [49, 47], [47, 44], [47, 40]],  // Caspian Sea
    [[11, 54], [20, 54], [22, 59], [26, 60], [25, 65], [20, 62], [16, 57], [11, 56]], // Baltic
    [[33, 29], [43, 13], [40, 12], [32, 27]],                // Red Sea
    [[48, 30], [56, 26], [57, 24], [48, 28]]                 // Persian Gulf
  ];

  function pointInPoly(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1];
      var xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  // Deterministic value noise so the map looks the same every session.
  function hashNoise(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function lonAt(px, w) { return -180 + (px + 0.5) / w * 360; }
  function latAt(py, h) { return 90 - (py + 0.5) / h * 180; }

  function isLand(lon, lat) {
    var i;
    for (i = 0; i < SEA.length; i++) {
      if (pointInPoly(lon, lat, SEA[i])) return false;
    }
    for (i = 0; i < LAND.length; i++) {
      if (pointInPoly(lon, lat, LAND[i])) return true;
    }
    return false;
  }

  function shade(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, Math.round(r + amount)));
    g = Math.max(0, Math.min(255, Math.round(g + amount)));
    b = Math.max(0, Math.min(255, Math.round(b + amount)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // Biome colour purely as a function of latitude — cheap, and at this scale
  // it reads convincingly as ice caps / deserts / rainforest.
  function landColor(lat) {
    var a = Math.abs(lat);
    if (a > 66) return '#d5e2e8';
    if (a > 58) return '#5f8f6a';
    if (a > 38) return '#4f9146';
    if (a > 28) return '#8fa04a';
    if (a > 15) return '#c2ab5e';
    return '#3d8c40';
  }

  /**
   * Rasterise the map into a canvas of w x h pixels.
   * Returns { canvas, land } where `land` is a Uint8Array mask.
   */
  function build(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    var land = new Uint8Array(w * h);
    var x, y;

    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        if (isLand(lonAt(x, w), latAt(y, h))) land[y * w + x] = 1;
      }
    }

    for (y = 0; y < h; y++) {
      var lat = latAt(y, h);
      for (x = 0; x < w; x++) {
        var i = y * w + x;
        var n = hashNoise(x, y);
        var color;
        if (land[i]) {
          var coastal = false;
          for (var dy = -1; dy <= 1 && !coastal; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
              var nx = (x + dx + w) % w;
              var ny = y + dy;
              if (ny < 0 || ny >= h) continue;
              if (!land[ny * w + nx]) { coastal = true; break; }
            }
          }
          color = shade(landColor(lat), (n * 16 - 8) + (coastal ? 26 : 0));
        } else {
          // Shallow shelf ring around the coast gives the oceans some depth.
          var nearLand = false;
          for (var sy = -2; sy <= 2 && !nearLand; sy++) {
            for (var sx = -2; sx <= 2; sx++) {
              var ox = (x + sx + w) % w;
              var oy = y + sy;
              if (oy < 0 || oy >= h) continue;
              if (land[oy * w + ox]) { nearLand = true; break; }
            }
          }
          color = shade(nearLand ? '#1f5c86' : '#123a5c', n * 12 - 6);
        }
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Faint equator and meridian lines to sell the "map" reading.
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(0, Math.floor(h / 2), w, 1);
    ctx.fillRect(Math.floor(w / 2), 0, 1, h);

    return { canvas: canvas, land: land, width: w, height: h };
  }

  global.WorldMap = {
    build: build,
    isLand: isLand,
    /** lon/lat -> fractional grid coordinates on a gw x gh grid. */
    project: function (lat, lon, gw, gh) {
      return {
        x: Math.floor((lon + 180) / 360 * gw),
        y: Math.floor((90 - lat) / 180 * gh)
      };
    }
  };
})(window);
