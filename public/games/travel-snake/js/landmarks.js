/*
 * landmarks.js — famous landmarks as 16x16 pixel art.
 *
 * Each landmark is a list of 16-character rows; every character is a key into
 * the landmark's palette, and '.' means transparent.
 */
(function (global) {
  'use strict';

  var cache = {};

  var DATA = [
    {
      name: 'Eiffel Tower', country: 'France', lat: 48.86, lon: 2.29,
      pal: { a: '#e0b050', b: '#a8802f' },
      art: [
        '................',
        '.......aa.......',
        '.......aa.......',
        '......aaaa......',
        '......a..a......',
        '......a..a......',
        '.....aaaaaa.....',
        '.....a....a.....',
        '....aa....aa....',
        '....a......a....',
        '...aa......aa...',
        '...aaaaaaaaaa...',
        '..aa........aa..',
        '..a..........a..',
        '.aa..........aa.',
        'bbb..........bbb'
      ]
    },
    {
      name: 'Statue of Liberty', country: 'United States of America', lat: 40.69, lon: -74.04,
      pal: { g: '#6ec6a0', y: '#ffd34d', Y: '#fff3b0', c: '#8ad9b6', s: '#9a8f7d' },
      art: [
        '................',
        '............y...',
        '...........yYy..',
        '............y...',
        '.....ccc....g...',
        '....cgggc..gg...',
        '.....ggg..gg....',
        '....ggggggg.....',
        '....gggggg......',
        '.....gggg.......',
        '.....gggg.......',
        '....gggggg......',
        '....gggggg......',
        '...ssssssss.....',
        '...ssssssss.....',
        '..ssssssssss....'
      ]
    },
    {
      name: 'Sydney Opera House', country: 'Australia', lat: -33.86, lon: 151.21,
      pal: { w: '#f2f2ec', d: '#c9c9bd', b: '#2a6fa8' },
      art: [
        '................',
        '................',
        '................',
        '..........w.....',
        '.....w...ww.....',
        '....ww..www.....',
        '...www.wwww...w.',
        '..wwww.wwwww.ww.',
        '.wwwwwwwwwwwwww.',
        'wwwwwwwwwwwwwwww',
        'dddddddddddddddd',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        '................',
        '................'
      ]
    },
    {
      name: 'Pyramids of Giza', country: 'Egypt', lat: 29.98, lon: 31.13,
      pal: { s: '#d8b56a', d: '#a8863c', y: '#e8d9a8' },
      art: [
        '................',
        '................',
        '................',
        '................',
        '.......s........',
        '......sds.......',
        '.....ssdss......',
        '..s..ssdss.s....',
        '.sds.ssdss.ss...',
        'ssdssssdssssss..',
        'ssdssssdssssss.s',
        'yyyyyyyyyyyyyyyy',
        'yyyyyyyyyyyyyyyy',
        '................',
        '................',
        '................'
      ]
    },
    {
      name: 'Big Ben', country: 'United Kingdom', lat: 51.50, lon: -0.12,
      pal: { t: '#c8a86a', r: '#8a6a3a', c: '#fff8d0', g: '#6f8f5a' },
      art: [
        '.......rr.......',
        '......rrrr......',
        '......tttt......',
        '......tttt......',
        '.....tttttt.....',
        '.....tccccT.....',
        '.....tccccT.....',
        '.....tttttt.....',
        '.....tttttt.....',
        '.....tttttt.....',
        '.....tttttt.....',
        '.....tttttt.....',
        '....tttttttt....',
        '....tttttttt....',
        '...tttttttttt...',
        'gggggggggggggggg'
      ]
    },
    {
      name: 'Colosseum', country: 'Italy', lat: 41.89, lon: 12.49,
      pal: { s: '#cbb187', d: '#8a7350', g: '#6f8f5a' },
      art: [
        '................',
        '................',
        '...ssssssss.....',
        '..ssssssssss....',
        '.s.d.d.d.d.d.s..',
        '.ssssssssssss...',
        '.s.d.d.d.d.d.s..',
        '.ssssssssssss...',
        '.s.d.d.d.d.d.s..',
        '.ssssssssssss...',
        '.s.d.d.d.d.d.s..',
        '.ssssssssssss...',
        '..ssssssssss....',
        '...ssssssss.....',
        'gggggggggggggggg',
        '................'
      ]
    },
    {
      name: 'Taj Mahal', country: 'India', lat: 27.17, lon: 78.04,
      pal: { w: '#f5f0e6', d: '#d8d0bf', b: '#b9b0a0' },
      art: [
        '................',
        '.......w........',
        '......www.......',
        '.....wwwww......',
        '..w..wwwww..w...',
        '..w.wwwwwww.w...',
        '..w.wwwwwww.w...',
        '..w.wwwwwww.w...',
        '..w.wwwwwww.w...',
        '..wwwwwwwwwww...',
        '..wwwwwwwwwww...',
        '.wwwwwwwwwwwww..',
        '.dddddddddddddd.',
        'bbbbbbbbbbbbbbbb',
        '................',
        '................'
      ]
    },
    {
      name: 'Christ the Redeemer', country: 'Brazil', lat: -22.95, lon: -43.21,
      pal: { g: '#dcdcd2', k: '#6b6b5a' },
      art: [
        '.......gg.......',
        '.......gg.......',
        '.......gg.......',
        '..gggggggggggg..',
        '..gggggggggggg..',
        '.......gg.......',
        '......gggg......',
        '......gggg......',
        '......gggg......',
        '......gggg......',
        '.....kkkkkk.....',
        '....kkkkkkkk....',
        '...kkkkkkkkkk...',
        '..kkkkkkkkkkkk..',
        '.kkkkkkkkkkkkkk.',
        'kkkkkkkkkkkkkkkk'
      ]
    },
    {
      name: 'Great Wall of China', country: 'China', lat: 40.43, lon: 116.57,
      pal: { w: '#c8b795', d: '#948360', h: '#6f8f5a' },
      art: [
        '................',
        '................',
        '................',
        '..............w.',
        '.............ww.',
        '..w.w.w....w.w..',
        '..wwwww...wwww..',
        '.wwwwwww.wwwww..',
        '.wwwwwwwwwwwwww.',
        'dwwwwwwwwwwwwwwd',
        'hddddddddddddddh',
        'hhhhhhhhhhhhhhhh',
        'hhhhhhhhhhhhhhhh',
        '................',
        '................',
        '................'
      ]
    },
    {
      name: 'Machu Picchu', country: 'Peru', lat: -13.16, lon: -72.54,
      pal: { p: '#7a8f6a', d: '#5c6b50', s: '#c9c2ae', g: '#8fae72' },
      art: [
        '................',
        '................',
        '..........p.....',
        '.........ppp....',
        '........ppppp...',
        '.......ppppppp..',
        '......ppppppppp.',
        '.....ppppppppppp',
        '....dppppppppppp',
        '.sss.ddppppppppp',
        'sssss..dddpppppp',
        'sssssss..dddpppp',
        'ssssssssss.ddddd',
        'gggggggggggggggg',
        '................',
        '................'
      ]
    },
    {
      name: 'Moai of Easter Island', country: 'Chile', lat: -27.12, lon: -109.37,
      pal: { s: '#8b8b83', d: '#4a4a44', g: '#6f8f5a' },
      art: [
        '................',
        '...ssss.........',
        '..ssssss....ss..',
        '.ssssssss..ssss.',
        '.sddssdds..sddss',
        '.ssssssss..ssss.',
        '.ssssssss..ssss.',
        '..ssssss...ssss.',
        '..ssssss...ssss.',
        '.ssssssss..ssss.',
        '.ssssssss..ssss.',
        '.ssssssss..ssss.',
        '.ssssssss..ssss.',
        'gggggggggggggggg',
        'gggggggggggggggg',
        '................'
      ]
    },
    {
      name: 'Stonehenge', country: 'United Kingdom', lat: 51.18, lon: -1.83,
      pal: { s: '#a9a49a', d: '#7b766d', g: '#6f8f5a' },
      art: [
        '................',
        '................',
        '................',
        '................',
        '.ssssssssssss...',
        '.ddddddddddd....',
        '.ss.ss.ss.ss.s..',
        '.ss.ss.ss.ss.s..',
        '.ss.ss.ss.ss.s..',
        '.ss.ss.ss.ss.s..',
        '.ss.ss.ss.ss.s..',
        '.ss.ss.ss.ss.s..',
        'gggggggggggggggg',
        'gggggggggggggggg',
        '................',
        '................'
      ]
    },
    {
      name: 'Mount Fuji', country: 'Japan', lat: 35.36, lon: 138.73,
      pal: { w: '#f4f8ff', m: '#5c6f8a', d: '#465571' },
      art: [
        '................',
        '................',
        '................',
        '.......ww.......',
        '......wwww......',
        '.....wwwwww.....',
        '....mmwwwwmm....',
        '...mmmmwwmmmm...',
        '..mmmmmmmmmmmm..',
        '.mmmmmdmmmmmmmm.',
        'mmmmmdmmmmmmmmmm',
        'mmmmdmmmmmmmmmmm',
        'mmmmmmmmmmmmmmmm',
        '................',
        '................',
        '................'
      ]
    },
    {
      name: 'Leaning Tower of Pisa', country: 'Italy', lat: 43.72, lon: 10.40,
      pal: { w: '#e8e0cc', d: '#c0b69c', g: '#6f8f5a' },
      art: [
        '................',
        '........www.....',
        '........www.....',
        '.......wdw......',
        '.......www......',
        '.......wdw......',
        '......www.......',
        '......wdw.......',
        '......www.......',
        '.....wdw........',
        '.....www........',
        '.....wdw........',
        '....wwwww.......',
        '....wwwww.......',
        'gggggggggggggggg',
        '................'
      ]
    },
    {
      name: 'Burj Khalifa', country: 'United Arab Emirates', lat: 25.20, lon: 55.27,
      pal: { b: '#9fc4dd', d: '#6d95b0', s: '#c8b48a' },
      art: [
        '.......b........',
        '.......b........',
        '......bdb.......',
        '......bdb.......',
        '......bdb.......',
        '.....bbdbb......',
        '.....bbdbb......',
        '....bbbdbbb.....',
        '....bbbdbbb.....',
        '...bbbbdbbbb....',
        '...bbbbdbbbb....',
        '..bbbbbdbbbbb...',
        '..bbbbbdbbbbb...',
        '.bbbbbbdbbbbbb..',
        '.bbbbbbdbbbbbb..',
        'ssssssssssssssss'
      ]
    },
    {
      name: "Saint Basil's Cathedral", country: 'Russia', lat: 55.75, lon: 37.62,
      pal: { r: '#d94f3d', b: '#3d6fd9', y: '#f0c53d', g: '#4faa5a', w: '#f0ece0', k: '#9a3a2c' },
      art: [
        '................',
        '....r...y...b...',
        '...rrr.yyy.bbb..',
        '...rrr.yyy.bbb..',
        '....w...w...w...',
        '...www.www.www..',
        '...www.www.www..',
        '...www.www.www..',
        '..wwwwwwwwwwww..',
        '..wwwwwwwwwwww..',
        '..wkwwwkwwwkww..',
        '..wwwwwwwwwwww..',
        '..wwwgwwwgwwww..',
        '..wwwwwwwwwwww..',
        '.wwwwwwwwwwwwww.',
        '.wwwwwwwwwwwwww.'
      ]
    },
    {
      name: 'Chichen Itza', country: 'Mexico', lat: 20.68, lon: -88.57,
      pal: { s: '#c9b48a', d: '#96814f', g: '#6f8f5a' },
      art: [
        '................',
        '................',
        '................',
        '.......ss.......',
        '......ssss......',
        '......sdds......',
        '.....ssddss.....',
        '....ssssddssss..',
        '...sssssddsssss.',
        '..ssssssddssssss',
        '.sssssssddsssssd',
        'ssssssssddssssss',
        'ssssssssddssssss',
        'gggggggggggggggg',
        '................',
        '................'
      ]
    },
    {
      name: 'Table Mountain', country: 'South Africa', lat: -33.96, lon: 18.40,
      pal: { m: '#8a7f6a', d: '#6b6153', w: '#e8eef2', g: '#6f8f5a' },
      art: [
        '................',
        '................',
        '................',
        '..wwwwwwwwwww...',
        '.mmmmmmmmmmmmm..',
        '.mmmmmmmmmmmmm..',
        '.mdmmmmmmmmdmm..',
        'mmdmmmmmmmmdmmm.',
        'mmdmmmmmmmmdmmmm',
        'mmmmmmmmmmmmmmmm',
        'mmmmmmmmmmmmmmmm',
        'gggggggggggggggg',
        'gggggggggggggggg',
        '................',
        '................',
        '................'
      ]
    },
    {
      name: 'Angkor Wat', country: 'Cambodia', lat: 13.41, lon: 103.87,
      pal: { t: '#b9a37a', d: '#8c7855', b: '#3f7fa8' },
      art: [
        '................',
        '................',
        '.......t........',
        '..t...ttt...t...',
        '..t...ttt...t...',
        '.ttt..ttt..ttt..',
        '.ttt..ttt..ttt..',
        '.ttt..ttt..ttt..',
        'tttttttttttttttt',
        'tdtdtdtdtdtdtdtd',
        'tttttttttttttttt',
        'bbbbbbbbbbbbbbbb',
        'bbbbbbbbbbbbbbbb',
        '................',
        '................',
        '................'
      ]
    }
  ];

  /** Renders a landmark's pixel art into a 16x16 canvas (cached). */
  function render(landmark) {
    if (cache[landmark.name]) return cache[landmark.name];
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    var ctx = canvas.getContext('2d');
    for (var y = 0; y < landmark.art.length; y++) {
      var row = landmark.art[y];
      for (var x = 0; x < row.length; x++) {
        var ch = row.charAt(x);
        if (ch === '.') continue;
        // Unknown keys fall back to the first palette entry, so a typo in the
        // art never leaves a hole in the sprite.
        ctx.fillStyle = landmark.pal[ch] || landmark.pal[Object.keys(landmark.pal)[0]];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    cache[landmark.name] = canvas;
    return canvas;
  }

  global.Landmarks = { list: DATA, render: render };
})(window);
