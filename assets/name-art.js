/* Dotted name art — ONE "Razieh" on the left, ONE "Eslami" on the right.
   Dots light up at full brightness inside a small radius around the cursor
   (no dim ring), stay lit, and fade out 3 seconds after the mouse leaves.

   Two modes:
   - hero mode (default): horizontal words fitted BESIDE an avoided element
     (the profile photo), with a small clear gap, never behind it.
   - vertical mode (opts.vertical): words rotated 90° and pinned in the side
     gutters of a fixed full-viewport canvas — the page scrolls, they don't. */
(function () {
  var TEAL  = [191, 170, 190];
  var TEAL2 = [157, 127, 155];
  var RADIUS = 160, HOLD = 3000, FADE = 1200, GAP = 3.5;

  window.initNameArt = function (canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var parent = canvas.parentElement;
    var dots = [];
    var mx = -9999, my = -9999, tgx = -9999, tgy = -9999;
    var W = 0, H = 0;
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    var running = false;

    function collect(g) {
      var img = g.getImageData(0, 0, W, H).data;
      for (var y = 0; y < H; y += GAP) {
        for (var x = 0; x < W; x += GAP) {
          var i = ((y | 0) * W + (x | 0)) * 4;
          if (img[i] > 100) {
            dots.push({
              x: x, y: y,
              sz: 1.4 + Math.random() * 1.4,
              freq: 0.5 + Math.random() * 1.1,
              phase: Math.random() * Math.PI * 2,
              mix: Math.random(),
              lit: 0, litAt: 0
            });
          }
        }
      }
    }

    function makeLayer() {
      var off = document.createElement('canvas');
      off.width = W; off.height = H;
      var g = off.getContext('2d');
      g.fillStyle = '#fff';
      return g;
    }

    function sampleHorizontal(word, alignRight, zone, margin, wordY) {
      if (zone < 110) return;
      var g = makeLayer();
      g.font = '100px SoulMotion';
      var w100 = g.measureText(word).width;
      // fit to 90% of the zone so script tails stay clear of the photo
      var size = Math.min(150, 100 * (zone * 0.9) / w100);
      if (size < 34) return;
      g.font = size + 'px SoulMotion';
      var tw = g.measureText(word).width;
      var x = alignRight ? (W - tw - margin) : margin;
      g.fillText(word, x, wordY + size * 0.32);
      collect(g);
    }

    function sampleVertical(word, rightSide, gutter) {
      var g = makeLayer();
      g.font = '100px SoulMotion';
      var w100 = g.measureText(word).width;
      var availH = H - 190;                    // clear the nav and bottom edge
      var size = Math.min(150, Math.min(gutter * 0.72, 100 * (availH * 0.9) / w100));
      if (size < 30) return;
      g.font = size + 'px SoulMotion';
      var tw = g.measureText(word).width;
      g.save();
      if (rightSide) {
        // reads top-to-bottom on the right edge (glyphs rise toward +x)
        g.translate(W - gutter / 2 - size * 0.32, H / 2 - tw / 2);
        g.rotate(Math.PI / 2);
      } else {
        // reads bottom-to-top on the left edge (glyphs rise toward -x)
        g.translate(gutter / 2 + size * 0.32, H / 2 + tw / 2);
        g.rotate(-Math.PI / 2);
      }
      g.fillText(word, 0, 0);
      g.restore();
      collect(g);
    }

    function build() {
      var rect = parent.getBoundingClientRect();
      W = Math.round(rect.width);
      H = Math.round(rect.height);
      if (!W || !H) return;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];

      if (opts.vertical) {
        var contentW = opts.contentWidth || 1100;
        var gutter = (W - contentW) / 2;
        if (gutter >= 90) {
          sampleVertical('Razieh', false, gutter);
          sampleVertical('Eslami', true,  gutter);
        }
      } else {
        var margin = Math.max(28, W * 0.03);
        var centerHalf, wordY;
        var avoid = opts.avoidEl ? document.querySelector(opts.avoidEl) : null;
        if (avoid) {
          var pr = avoid.getBoundingClientRect();
          var cr = canvas.getBoundingClientRect();
          centerHalf = pr.width / 2 + 40;      // a little space, close to the picture
          wordY = (pr.top - cr.top) + pr.height / 2;
          margin = Math.max(84, W * 0.09);     // generous padding from the page edge
        } else {
          centerHalf = W * 0.06;
          wordY = H * 0.52;
        }
        var zone = W / 2 - centerHalf - margin - 12;
        sampleHorizontal('Razieh', false, zone, margin, wordY);
        sampleHorizontal('Eslami', true,  zone, margin, wordY);
      }

      if (opts.onBuild && opts.onBuild(dots.length > 0)) {
        // page layout changed (e.g. the text title was hidden) — remeasure
        requestAnimationFrame(build);
      }
    }

    function frame(nowTs) {
      mx += (tgx - mx) * 0.12;
      my += (tgy - my) * 0.12;
      ctx.clearRect(0, 0, W, H);
      var t = nowTs * 0.0008;
      for (var k = 0; k < dots.length; k++) {
        var d = dots[k];
        var dx = mx - d.x, dy = my - d.y;
        if (dx * dx + dy * dy < RADIUS * RADIUS) {
          d.lit = Math.min(200, d.lit + 30);
          d.litAt = nowTs;
        }
        var a = 0;
        if (d.lit > 0) {
          if (opts.persist) {
            // side pages: once revealed, the name stays visible while
            // the page scrolls underneath it
            a = d.lit;
          } else {
            var age = nowTs - d.litAt;
            if (age < HOLD) a = d.lit;
            else if (age < HOLD + FADE) a = d.lit * (1 - (age - HOLD) / FADE);
            else d.lit = 0;
          }
        }
        if (a < 2) continue;
        var m = d.mix;
        ctx.fillStyle = 'rgba(' +
          Math.round(TEAL[0] + (TEAL2[0] - TEAL[0]) * m) + ',' +
          Math.round(TEAL[1] + (TEAL2[1] - TEAL[1]) * m) + ',' +
          Math.round(TEAL[2] + (TEAL2[2] - TEAL[2]) * m) + ',' +
          (a / 255).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(
          d.x + Math.sin(t * d.freq + d.phase) * 1.4,
          d.y + Math.cos(t * d.freq * 0.8 + d.phase * 1.3) * 1.0,
          d.sz / 2, 0, 6.2832
        );
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    document.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      tgx = e.clientX - r.left;
      tgy = e.clientY - r.top;
    });
    document.addEventListener('mouseleave', function () {
      tgx = -9999; tgy = -9999;
    });
    window.addEventListener('resize', build);

    function start() {
      build();
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    if (document.fonts && document.fonts.load) {
      document.fonts.load('100px SoulMotion').then(start, start);
    } else {
      setTimeout(start, 400);
    }
  };
})();
