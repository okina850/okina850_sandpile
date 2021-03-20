// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Sandpiles
// https://youtu.be/diGjw5tghYU

"use strict"

let defaultColor = [255, 0, 0];
let colors = [
  [255, 255, 0],
  [0, 185, 63],
  [0, 104, 255],
  [122, 0, 229]
];

let sandpiles;
let nextpiles;

function setup() {
  noLoop();

  createCanvas(600, 600);
  pixelDensity(1);

  sandpiles = new Array(width).fill().map(i => new Array(height).fill(2));
  nextpiles = new Array(width).fill().map(i => new Array(height).fill(2));

  sandpiles[width / 2][height / 2] += 100000000;

  background(defaultColor[0], defaultColor[1], defaultColor[2]);




  /*                  console                  */

  //初期設定関連
  const setting_wrapper = document.body.appendChild(document.createElement("div"));
  //初期高さを指定する入力欄
  const set_initHeight = setting_wrapper.appendChild(document.createElement("input"));
  set_initHeight.id = "set_initHeight";
  set_initHeight.type = "number";
  set_initHeight.addEventListener("change",function(e){
    console.log(e);console.log(this);console.log(typeof this.value);
    const initHeight = Number(this.value);
    sandpiles = new Array(width).fill().map(i => new Array(height).fill(initHeight));
    nextpiles = new Array(width).fill().map(i => new Array(height).fill(initHeight));
    render();
  });
  //加える粒子の数の入力欄
  const set_grains = setting_wrapper.appendChild(document.createElement("input"));
  set_grains.id = "set_grains";
  set_grains.type = "number";
  set_grains.addEventListener("change",function(e){
    const numOfAdd = Number(this.value);
    sandpiles[width/2][height/2] += numOfAdd;
  });
  //ファイルをロード
  const inputFiles = setting_wrapper.appendChild(document.createElement("input"));
  inputFiles.type = "file";
  inputFiles.addEventListener("change", function(e) {
   noLoop();
   console.log(e.target.files);
   const file = e.target.files;
   const reader = new FileReader();
   reader.readAsText(file[0]);
   console.log(reader.result);
   reader.onload = function() {
     console.log(reader.result)
     console.log(JSON.parse(reader.result));
     sandpiles = JSON.parse(reader.result);
     render();
   }

  },false);


  //スタート、ストップ、セーブ、アナライズ
  const action_area = document.body.appendChild(document.createElement("div"));

  const saveBtn = action_area.appendChild(document.createElement("button"));
  saveBtn.innerText = "save";
  saveBtn.addEventListener("click",() => {
    noLoop();
    const json=JSON.stringify(sandpiles);
    const blob = new Blob([json],{type:"application/json"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ASM.json';
    link.click();

  });

  const stopBtn = action_area.appendChild(document.createElement("button"));
  stopBtn.innerText = "stop";
  stopBtn.addEventListener("click",() => {noLoop();});

  const startBtn = action_area.appendChild(document.createElement("button"));
  startBtn.innerText = "start";
  startBtn.addEventListener("click",() => {loop();});

  const analysisBtn = action_area.appendChild(document.createElement("button"));
  analysisBtn.innerText = "analyze";
  analysisBtn.addEventListener("click", function(e) {
    console.log("analyze")
    console.log(`Number of added grains:${stateOfSandpile.countingAddedGrains()}`);
    console.log(`Number of topples:%i`,stateOfSandpile.countNumberOfTopples());

    const wrapper = document.getElementById("analysisDisplay");
    wrapper.innerHTML = "";

    /*
    const numOfAddedGrains = wrapper.appendChild(document.createElement("div"));
    numOfAddedGrains.innerText = `Number of added grains:${stateOfSandpile.countingAddedGrains()}`;
    */
    const numOfTopples = wrapper.appendChild(document.createElement("div"));
    numOfTopples.innerText = `Number of topples:${stateOfSandpile.countNumberOfTopples()}`;


  },false);

  const analysisDisplay = document.body.appendChild(document.createElement("div"));
  analysisDisplay.id = "analysisDisplay";
  analysisDisplay.innerText = "analysis:";



  const stateOfSandpile = {
    //NumberOfAddedGrains:this.countingAddedGrains,
    initHeight:2,
    //加えられた粒子数を返す
    countingAddedGrains:function(){
      let sum = 0;

      for(let i = 0;i<width;i++){
        for(let j = 0;j<height;j++){
        //  console.log(`sandpiles[%i][%i]:%i`,i,j,sandpiles[i][j]);
          sum += sandpiles[i][j];
        }
      }
      console.log(`sum:%i,initHeight:%i,width:%i,height:%i`,sum,this.initHeight,width,height);
      return sum - this.initHeight*width*height;
    },

    countNumberOfTopples:function(){
      //under construction
    }

  }

}

function topple() {

  /*
  方法:
   一旦nextpilesに渡して、nextpilesでトップリングを行う。

  */
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      nextpiles[x][y] = sandpiles[x][y];
    }
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let num = sandpiles[x][y];
      if (num >= 4) {
        nextpiles[x][y] -= 4;
        if (x + 1 < width)
          nextpiles[x + 1][y]++;
        if (x - 1 >= 0)
          nextpiles[x - 1][y]++;
        if (y + 1 < height)
          nextpiles[x][y + 1]++;
        if (y - 1 >= 0)
          nextpiles[x][y - 1]++;
      }
    }
  }

  let tmp = sandpiles;//配列なので、参照渡し。(JavaScript特有の挙動)
  sandpiles = nextpiles;//トップリング済みの結果をsandpilesに渡す。sandpilesの参照であるtmpも連動して変化。
  nextpiles = tmp;//nextpilesを更新
}

function render() {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let num = sandpiles[x][y];
      let col = defaultColor;
      if (num == 0) {
        col = colors[0];
      } else if (num == 1) {
        col = colors[1];
      } else if (num == 2) {
        col = colors[2];
      } else if (num == 3) {
        col = colors[3];
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

  render();

  for (let i = 0; i < 50; i++) {
    topple();
  }
}
