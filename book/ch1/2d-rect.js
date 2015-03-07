(function () {
  'use strict';

	let canvas = document.querySelector('canvas');

  if (!canvas)
    return console.error('Failed to retrieve \'canvas\' element.');

  let ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';
  ctx.fillRect(120, 10, 150, 150);
})();
