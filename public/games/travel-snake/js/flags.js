/*
 * flags.js — draws every flag procedurally into a tiny 30x20 canvas.
 *
 * Flags are described by a compact spec in countries.js:
 *   [name, lat, lon, baseType, "colorA,colorB,...", "op:args;op:args"]
 *
 * baseType: h  horizontal bands       v  vertical bands
 *           s  solid                  dv diagonal tribands
 *           da split bottom-left/top-right diagonal
 *           db split top-left/bottom-right diagonal
 *           x  hand-drawn special (colors holds the key)
 *
 * At 30x20 pixels the goal is recognisable-at-a-glance, not heraldic accuracy:
 * emblems collapse to coloured blobs on purpose.
 */
(function (global) {
  'use strict';

  var FW = 30, FH = 20;
  var cache = {};

  function starPath(ctx, cx, cy, r, points, rot) {
    var inner = r * 0.42;
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var rad = (i % 2 === 0) ? r : inner;
      var a = rot + i * Math.PI / points;
      var x = cx + Math.sin(a) * rad;
      var y = cy - Math.cos(a) * rad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function star(ctx, c, x, y, r, points) {
    ctx.fillStyle = c;
    starPath(ctx, x * FW, y * FH, r * FH, points || 5, 0);
    ctx.fill();
  }

  function sixStar(ctx, c, x, y, r) {
    ctx.fillStyle = c;
    ctx.lineWidth = Math.max(1, r * FH * 0.28);
    ctx.strokeStyle = c;
    var cx = x * FW, cy = y * FH, rr = r * FH;
    for (var t = 0; t < 2; t++) {
      ctx.beginPath();
      for (var i = 0; i < 3; i++) {
        var a = t * Math.PI / 3 + i * 2 * Math.PI / 3;
        var px = cx + Math.sin(a) * rr, py = cy - Math.cos(a) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  function circle(ctx, c, x, y, r) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x * FW, y * FH, r * FH, 0, Math.PI * 2);
    ctx.fill();
  }

  function ring(ctx, c, x, y, r, t) {
    ctx.strokeStyle = c;
    ctx.lineWidth = t * FH;
    ctx.beginPath();
    ctx.arc(x * FW, y * FH, r * FH, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Crescents are punched out on a scratch canvas so they composite over any field.
  function crescent(ctx, c, x, y, r, withStar) {
    var tmp = document.createElement('canvas');
    tmp.width = FW; tmp.height = FH;
    var t = tmp.getContext('2d');
    var cx = x * FW, cy = y * FH, rr = r * FH;
    t.fillStyle = c;
    t.beginPath();
    t.arc(cx, cy, rr, 0, Math.PI * 2);
    t.fill();
    t.globalCompositeOperation = 'destination-out';
    t.beginPath();
    t.arc(cx + rr * 0.42, cy, rr * 0.82, 0, Math.PI * 2);
    t.fill();
    ctx.drawImage(tmp, 0, 0);
    if (withStar) star(ctx, c, x + r * 0.75 * FH / FW, y, r * 0.55);
  }

  function sun(ctx, c, x, y, r) {
    var cx = x * FW, cy = y * FH, rr = r * FH;
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(1, rr * 0.3);
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * rr * 0.9, cy + Math.sin(a) * rr * 0.9);
      ctx.lineTo(cx + Math.cos(a) * rr * 1.8, cy + Math.sin(a) * rr * 1.8);
      ctx.stroke();
    }
    circle(ctx, c, x, y, r);
  }

  // Generic "there is a coat of arms here" mark.
  function emblem(ctx, c, x, y, r) {
    var cx = x * FW, cy = y * FH, rr = r * FH;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rr * 1.2);
    ctx.lineTo(cx + rr, cy - rr * 0.2);
    ctx.lineTo(cx, cy + rr * 1.2);
    ctx.lineTo(cx - rr, cy - rr * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  function rect(ctx, c, x, y, w, h) {
    ctx.fillStyle = c;
    ctx.fillRect(x * FW, y * FH, w * FW, h * FH);
  }

  function triangle(ctx, c, pts) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(pts[0] * FW, pts[1] * FH);
    ctx.lineTo(pts[2] * FW, pts[3] * FH);
    ctx.lineTo(pts[4] * FW, pts[5] * FH);
    ctx.closePath();
    ctx.fill();
  }

  function diagBand(ctx, c, t, flip) {
    ctx.strokeStyle = c;
    ctx.lineWidth = t * FH;
    ctx.beginPath();
    if (flip) { ctx.moveTo(-2, -2); ctx.lineTo(FW + 2, FH + 2); }
    else { ctx.moveTo(-2, FH + 2); ctx.lineTo(FW + 2, -2); }
    ctx.stroke();
  }

  function nordic(ctx, c, outline) {
    var vx = 0.34 * FW, vw = Math.max(2, 0.13 * FW);
    var hy = 0.5 * FH, hh = Math.max(2, 0.2 * FH);
    if (outline) {
      ctx.fillStyle = outline;
      ctx.fillRect(vx - vw, 0, vw * 3, FH);
      ctx.fillRect(0, hy - hh * 1.5, FW, hh * 3);
    }
    ctx.fillStyle = c;
    ctx.fillRect(vx - vw / 2, 0, vw, FH);
    ctx.fillRect(0, hy - hh / 2, FW, hh);
  }

  function plusCross(ctx, c, t) {
    var tw = t * FW, th = t * FW; // square arms
    ctx.fillStyle = c;
    ctx.fillRect(FW / 2 - tw / 2, 0, tw, FH);
    ctx.fillRect(0, FH / 2 - th / 2, FW, th);
  }

  function saltire(ctx, c, t) {
    ctx.strokeStyle = c;
    ctx.lineWidth = t * FH;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(FW, FH);
    ctx.moveTo(FW, 0); ctx.lineTo(0, FH);
    ctx.stroke();
  }

  function stripes(ctx, colors, n, horizontal) {
    for (var i = 0; i < n; i++) {
      ctx.fillStyle = colors[i % colors.length];
      if (horizontal) ctx.fillRect(0, i * FH / n, FW, FH / n + 1);
      else ctx.fillRect(i * FW / n, 0, FW / n + 1, FH);
    }
  }

  function unionJack(ctx, x, y, w, h) {
    var px = x * FW, py = y * FH, pw = w * FW, ph = h * FH;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.fillStyle = '#012169';
    ctx.fillRect(px, py, pw, ph);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, ph * 0.22);
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(px + pw, py + ph);
    ctx.moveTo(px + pw, py); ctx.lineTo(px, py + ph);
    ctx.stroke();
    ctx.strokeStyle = '#c8102e';
    ctx.lineWidth = Math.max(1, ph * 0.1);
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(px + pw, py + ph);
    ctx.moveTo(px + pw, py); ctx.lineTo(px, py + ph);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + pw / 2 - ph * 0.19, py, ph * 0.38, ph);
    ctx.fillRect(px, py + ph / 2 - ph * 0.19, pw, ph * 0.38);
    ctx.fillStyle = '#c8102e';
    ctx.fillRect(px + pw / 2 - ph * 0.1, py, ph * 0.2, ph);
    ctx.fillRect(px, py + ph / 2 - ph * 0.1, pw, ph * 0.2);
    ctx.restore();
  }

  var SPECIAL = {
    uk: function (ctx) { unionJack(ctx, 0, 0, 1, 1); },

    us: function (ctx) {
      stripes(ctx, ['#b22234', '#ffffff'], 13, true);
      rect(ctx, '#3c3b6e', 0, 0, 0.4, 0.538);
      ctx.fillStyle = '#ffffff';
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 6; c++) {
          ctx.fillRect(1 + c * 1.9, 1 + r * 2.4, 1, 1);
        }
      }
    },

    br: function (ctx) {
      rect(ctx, '#009c3b', 0, 0, 1, 1);
      triangle(ctx, '#ffdf00', [0.06, 0.5, 0.5, 0.08, 0.94, 0.5]);
      triangle(ctx, '#ffdf00', [0.06, 0.5, 0.5, 0.92, 0.94, 0.5]);
      circle(ctx, '#002776', 0.5, 0.5, 0.26);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(FW * 0.5, FH * 0.68, FH * 0.3, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    },

    ca: function (ctx) {
      rect(ctx, '#ffffff', 0, 0, 1, 1);
      rect(ctx, '#d80621', 0, 0, 0.25, 1);
      rect(ctx, '#d80621', 0.75, 0, 0.25, 1);
      ctx.fillStyle = '#d80621';
      var cx = FW * 0.5, cy = FH * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx + 2, cy - 2);
      ctx.lineTo(cx + 4.5, cy - 3);
      ctx.lineTo(cx + 3.5, cy + 1);
      ctx.lineTo(cx + 5, cy + 2);
      ctx.lineTo(cx + 1, cy + 4);
      ctx.lineTo(cx + 1, cy + 6);
      ctx.lineTo(cx - 1, cy + 6);
      ctx.lineTo(cx - 1, cy + 4);
      ctx.lineTo(cx - 5, cy + 2);
      ctx.lineTo(cx - 3.5, cy + 1);
      ctx.lineTo(cx - 4.5, cy - 3);
      ctx.lineTo(cx - 2, cy - 2);
      ctx.closePath();
      ctx.fill();
    },

    kr: function (ctx) {
      rect(ctx, '#ffffff', 0, 0, 1, 1);
      var cx = FW * 0.5, cy = FH * 0.5, r = FH * 0.26;
      ctx.fillStyle = '#cd2e3a';
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#0047a0';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#cd2e3a';
      ctx.beginPath();
      ctx.arc(cx - r / 2, cy, r / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0047a0';
      ctx.beginPath();
      ctx.arc(cx + r / 2, cy, r / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(3, 3, 4, 1);
      ctx.fillRect(3, 16, 4, 1);
      ctx.fillRect(23, 3, 4, 1);
      ctx.fillRect(23, 16, 4, 1);
    },

    np: function (ctx) {
      // Nepal: the only non-rectangular flag — draw the pennants on transparency.
      ctx.clearRect(0, 0, FW, FH);
      ctx.fillStyle = '#003893';
      ctx.beginPath();
      ctx.moveTo(4, 1); ctx.lineTo(22, 8); ctx.lineTo(4, 8);
      ctx.lineTo(24, 15); ctx.lineTo(4, 19);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc143c';
      ctx.beginPath();
      ctx.moveTo(5, 2.5); ctx.lineTo(19, 8.6); ctx.lineTo(5, 8.6);
      ctx.lineTo(21, 14.2); ctx.lineTo(5, 17.6);
      ctx.closePath();
      ctx.fill();
      circle(ctx, '#ffffff', 0.3, 0.71, 0.09);
      star(ctx, '#ffffff', 0.3, 0.3, 0.1, 6);
    },

    za: function (ctx) {
      rect(ctx, '#e03c31', 0, 0, 1, 0.5);
      rect(ctx, '#001489', 0, 0.5, 1, 0.5);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 2); ctx.lineTo(FW, FH / 2 - 3.5); ctx.lineTo(FW, FH / 2 + 3.5);
      ctx.lineTo(0, FH - 2); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#007749';
      ctx.beginPath();
      ctx.moveTo(0, 4); ctx.lineTo(FW, FH / 2 - 2); ctx.lineTo(FW, FH / 2 + 2);
      ctx.lineTo(0, FH - 4); ctx.closePath();
      ctx.fill();
      triangle(ctx, '#ffb81c', [0, 0, 0.36, 0.5, 0, 1]);
      triangle(ctx, '#000000', [0, 0.13, 0.26, 0.5, 0, 0.87]);
      ctx.fillStyle = '#007749';
      ctx.fillRect(0, FH / 2 - 2, 11, 4);
    },

    au: function (ctx) {
      rect(ctx, '#00247d', 0, 0, 1, 1);
      unionJack(ctx, 0, 0, 0.5, 0.5);
      star(ctx, '#ffffff', 0.25, 0.78, 0.13, 7);
      star(ctx, '#ffffff', 0.72, 0.25, 0.08);
      star(ctx, '#ffffff', 0.86, 0.52, 0.08);
      star(ctx, '#ffffff', 0.72, 0.8, 0.08);
      star(ctx, '#ffffff', 0.6, 0.55, 0.06);
    },

    nz: function (ctx) {
      rect(ctx, '#00247d', 0, 0, 1, 1);
      unionJack(ctx, 0, 0, 0.5, 0.5);
      star(ctx, '#cc142b', 0.72, 0.28, 0.09);
      star(ctx, '#cc142b', 0.86, 0.55, 0.09);
      star(ctx, '#cc142b', 0.7, 0.82, 0.09);
      star(ctx, '#cc142b', 0.62, 0.55, 0.07);
    },

    fj: function (ctx) {
      rect(ctx, '#68bfe5', 0, 0, 1, 1);
      unionJack(ctx, 0, 0, 0.5, 0.5);
      rect(ctx, '#ffffff', 0.66, 0.25, 0.2, 0.55);
      rect(ctx, '#ce1126', 0.74, 0.25, 0.04, 0.55);
      rect(ctx, '#ce1126', 0.66, 0.38, 0.2, 0.06);
    },

    tv: function (ctx) {
      rect(ctx, '#5b97b1', 0, 0, 1, 1);
      unionJack(ctx, 0, 0, 0.5, 0.5);
      for (var i = 0; i < 5; i++) star(ctx, '#fcd116', 0.62 + (i % 3) * 0.15, 0.28 + Math.floor(i / 3) * 0.42, 0.07);
    },

    ag: function (ctx) {
      rect(ctx, '#ce1126', 0, 0, 1, 1);
      triangle(ctx, '#ffffff', [0.16, 0.18, 0.84, 0.18, 0.5, 1]);
      triangle(ctx, '#0072c6', [0.21, 0.32, 0.79, 0.32, 0.5, 0.86]);
      triangle(ctx, '#000000', [0.26, 0.45, 0.74, 0.45, 0.5, 0.72]);
      rect(ctx, '#000000', 0.16, 0, 0.68, 0.2);
      sun(ctx, '#fcd116', 0.5, 0.2, 0.09);
    },

    gd: function (ctx) {
      rect(ctx, '#ce1126', 0, 0, 1, 1);
      triangle(ctx, '#007a5e', [0.12, 0.2, 0.5, 0.5, 0.12, 0.8]);
      triangle(ctx, '#007a5e', [0.88, 0.2, 0.5, 0.5, 0.88, 0.8]);
      triangle(ctx, '#fcd116', [0.12, 0.2, 0.5, 0.5, 0.88, 0.2]);
      triangle(ctx, '#fcd116', [0.12, 0.8, 0.5, 0.5, 0.88, 0.8]);
      circle(ctx, '#ce1126', 0.35, 0.5, 0.16);
      star(ctx, '#fcd116', 0.35, 0.5, 0.1);
    },

    ki: function (ctx) {
      rect(ctx, '#ce1126', 0, 0, 1, 1);
      rect(ctx, '#003f87', 0, 0.55, 1, 0.45);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 12 + i * 2.6);
        for (var x = 0; x <= FW; x += 3) ctx.lineTo(x, 12 + i * 2.6 + (x % 6 === 0 ? -1 : 1));
        ctx.stroke();
      }
      sun(ctx, '#fcd116', 0.5, 0.55, 0.11);
      ctx.fillStyle = '#fcd116';
      ctx.beginPath();
      ctx.moveTo(11, 6); ctx.lineTo(15, 3); ctx.lineTo(19, 6);
      ctx.lineTo(15, 7); ctx.closePath();
      ctx.fill();
    }
  };

  function applyBase(ctx, type, colors) {
    var i;
    switch (type) {
      case 's':
        rect(ctx, colors[0], 0, 0, 1, 1);
        break;
      case 'h':
        for (i = 0; i < colors.length; i++) {
          ctx.fillStyle = colors[i];
          ctx.fillRect(0, i * FH / colors.length, FW, FH / colors.length + 1);
        }
        break;
      case 'v':
        for (i = 0; i < colors.length; i++) {
          ctx.fillStyle = colors[i];
          ctx.fillRect(i * FW / colors.length, 0, FW / colors.length + 1, FH);
        }
        break;
      case 'dv':
        rect(ctx, colors[0], 0, 0, 1, 1);
        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.moveTo(0, FH); ctx.lineTo(FW, 0); ctx.lineTo(FW, FH * 0.45);
        ctx.lineTo(FW * 0.45, FH); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = colors[2];
        ctx.beginPath();
        ctx.moveTo(FW * 0.45, FH); ctx.lineTo(FW, FH * 0.45); ctx.lineTo(FW, FH);
        ctx.closePath();
        ctx.fill();
        break;
      case 'da': // split along the hoist-bottom -> fly-top diagonal
        rect(ctx, colors[0], 0, 0, 1, 1);
        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.moveTo(0, FH); ctx.lineTo(FW, 0); ctx.lineTo(FW, FH); ctx.closePath();
        ctx.fill();
        break;
      case 'db': // split along the hoist-top -> fly-bottom diagonal
        rect(ctx, colors[0], 0, 0, 1, 1);
        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(FW, FH); ctx.lineTo(0, FH); ctx.closePath();
        ctx.fill();
        break;
      case 'x':
        SPECIAL[colors[0]](ctx);
        break;
    }
  }

  function applyOp(ctx, op) {
    var p = op.split(':');
    var k = p[0];
    var n = function (i) { return parseFloat(p[i]); };
    switch (k) {
      case 'star': star(ctx, p[1], n(2), n(3), n(4), p[5] ? parseInt(p[5], 10) : 5); break;
      case 'star6': sixStar(ctx, p[1], n(2), n(3), n(4)); break;
      case 'circle': circle(ctx, p[1], n(2), n(3), n(4)); break;
      case 'ring': ring(ctx, p[1], n(2), n(3), n(4), n(5)); break;
      case 'cres': crescent(ctx, p[1], n(2), n(3), n(4), false); break;
      case 'cstar': crescent(ctx, p[1], n(2), n(3), n(4), true); break;
      case 'sun': sun(ctx, p[1], n(2), n(3), n(4)); break;
      case 'emb': emblem(ctx, p[1], n(2), n(3), n(4)); break;
      case 'rect': rect(ctx, p[1], n(2), n(3), n(4), n(5)); break;
      case 'vband': rect(ctx, p[1], n(2), 0, n(3), 1); break;
      case 'hband': rect(ctx, p[1], 0, n(2), 1, n(3)); break;
      case 'canton': rect(ctx, p[1], 0, 0, n(2), n(3)); break;
      case 'tri': triangle(ctx, p[1], [0, 0, n(2), 0.5, 0, 1]); break;
      case 'ctri': triangle(ctx, p[1], [n(2) - n(4) / 2, n(3) + n(5) / 2, n(2), n(3) - n(5) / 2, n(2) + n(4) / 2, n(3) + n(5) / 2]); break;
      case 'diag': diagBand(ctx, p[1], n(2), false); break;
      case 'diag2': diagBand(ctx, p[1], n(2), true); break;
      case 'nordic': nordic(ctx, p[1], p[2]); break;
      case 'plus': plusCross(ctx, p[1], n(2)); break;
      case 'saltire': saltire(ctx, p[1], n(2)); break;
      case 'stripes': stripes(ctx, p[1].split('|'), parseInt(p[2], 10), true); break;
      case 'quad': // p2/p3: top-bottom colour, left-right colour
        triangle(ctx, p[1], [0, 0, 1, 0, 0.5, 0.5]);
        triangle(ctx, p[1], [0, 1, 1, 1, 0.5, 0.5]);
        triangle(ctx, p[2], [0, 0, 0, 1, 0.5, 0.5]);
        triangle(ctx, p[2], [1, 0, 1, 1, 0.5, 0.5]);
        break;
      case 'check':
        for (var cy = 0; cy < 3; cy++) {
          for (var cx = 0; cx < 3; cx++) {
            ctx.fillStyle = (cx + cy) % 2 ? p[2] : p[1];
            ctx.fillRect(FW * n(3) - 3 + cx * 2, FH * n(4) - 3 + cy * 2, 2, 2);
          }
        }
        break;
      case 'rays':
        // Equal-angle wedges fanning out of the bottom-hoist corner.
        var cols = p[1].split('|');
        var span = Math.PI / 2 / cols.length;
        for (var i = 0; i < cols.length; i++) {
          var a0 = Math.PI / 2 - i * span;
          var a1 = Math.PI / 2 - (i + 1) * span;
          ctx.fillStyle = cols[i];
          ctx.beginPath();
          ctx.moveTo(0, FH);
          ctx.lineTo(Math.cos(a0) * FW * 3, FH - Math.sin(a0) * FW * 3);
          ctx.lineTo(Math.cos(a1) * FW * 3, FH - Math.sin(a1) * FW * 3);
          ctx.closePath();
          ctx.fill();
        }
        break;
    }
  }

  /** Renders a country spec into a 30x20 canvas (results are cached). */
  function render(country) {
    if (cache[country.name]) return cache[country.name];
    var canvas = document.createElement('canvas');
    canvas.width = FW;
    canvas.height = FH;
    var ctx = canvas.getContext('2d');
    applyBase(ctx, country.type, country.colors);
    if (country.ops) {
      var ops = country.ops.split(';');
      for (var i = 0; i < ops.length; i++) {
        if (ops[i]) applyOp(ctx, ops[i]);
      }
    }
    cache[country.name] = canvas;
    return canvas;
  }

  global.Flags = { render: render, WIDTH: FW, HEIGHT: FH };
})(window);
