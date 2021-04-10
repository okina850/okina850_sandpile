//import {mySimulation} from './module.js';

const mySimulation = new Simulation();
mySimulation.setupDOM();

function setup() {

  noLoop();
  //canvas生成
  const canvas = createCanvas(mySimulation.gridWidth, mySimulation.gridHeight);
  pixelDensity(1);
  background(mySimulation.defaultColor[0], mySimulation.defaultColor[1], mySimulation.defaultColor[2]);

//  const canvas = createCanvas(mySimulation.gridWidth, mySimulation.gridHeight);
//  saveCanvas(c, 'myCanvas', 'jpg');
}

function render() {
  loadPixels();
  for (let x = 0; x < mySimulation.gridWidth; x++) {
    for (let y = 0; y < mySimulation.gridHeight; y++) {
      let num = mySimulation.sandpiles[x][y];
      let col = mySimulation.defaultColor;
      if (num == 0) {
        col = mySimulation.colors[0];
      } else if (num == 1) {
        col = mySimulation.colors[1];
      } else if (num == 2) {
        col = mySimulation.colors[2];
      } else if (num == 3) {
        col = mySimulation.colors[3];
      } else if (num == -1){
        col = mySimulation.colors[4];
      } else if (num == -2){
        col = mySimulation.colors[5];
      }

      let pix = (x + y * width) * 4;
      pixels[pix] = col[0];
      pixels[pix + 1] = col[1];
      pixels[pix + 2] = col[2];
      // pixels[pix + 3] = 255;
    }
  }

  updatePixels();
}

function draw() {
  //console.log(mySimulation.sandpiles[mySimulation.gridWidth/2][mySimulation.gridHeight/2]);//ずっと2
  //mySimulation.render.call(this);
  render();
}
