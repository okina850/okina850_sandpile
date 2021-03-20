//シミュレーションクラス under construction
class Simulation{
  constructor(){
    this.gridWidth = 600;
    this.gridHeight = 600;
    
    this.initHeight = 2;
    this.numOfAdd = 10000;
    
    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
    //this.render();
    
    this.playMode = "";
    
    this.setup();
  }
  
  setup(){
    noLoop();
    createCanvas(600, 600);
    pixelDensity(1);
    
    /*                  console                  */

    //初期設定関連
    const setting_wrapper = document.body.appendChild(document.createElement("div"));
    //初期高さを指定する入力欄
    const set_initHeight = setting_wrapper.appendChild(document.createElement("input"));
    set_initHeight.id = "set_initHeight";
    set_initHeight.type = "number";
    set_initHeight.addEventListener("change",function(e){
      console.log(e);console.log(this);console.log(typeof this.value);
      this.initHeight = Number(this.value);
      
      this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      this.nextpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      render();
    }.bind(this));
    //加える粒子の数の入力欄
    const set_grains = setting_wrapper.appendChild(document.createElement("input"));
    set_grains.id = "set_grains";
    set_grains.type = "number";
    set_grains.addEventListener("change",function(e){
      const numOfAdd = Number(this.value);
      this.sandpiles[width/2][height/2] += numOfAdd;
    }.bind(this));
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
       this.sandpiles = JSON.parse(reader.result);
       render();
     }

   }.bind(this),false);
    
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
      console.log(`Number of added grains:${this.countingAddedGrains()}`);
      console.log(`Number of topples:%i`,this.countNumberOfTopples());
    
      const wrapper = document.getElementById("analysisDisplay");
      wrapper.innerHTML = "";
    
      /*
      const numOfAddedGrains = wrapper.appendChild(document.createElement("div"));
      numOfAddedGrains.innerText = `Number of added grains:${stateOfSandpile.countingAddedGrains()}`;
      */
      const numOfTopples = wrapper.appendChild(document.createElement("div"));
      numOfTopples.innerText = `Number of topples:${stateOfSandpile.countNumberOfTopples()}`;
    
    
    }.bind(this),false);
    
    const analysisDisplay = document.body.appendChild(document.createElement("div"));
    analysisDisplay.id = "analysisDisplay";
    analysisDisplay.innerText = "analysis:";
  }
  
  //under construction
  topple() {

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
  
  //under construction
  render(){
    //under construction
    loadPixels();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let num = this.sandpiles[x][y];
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
  

  countingAddedGrains(){
  }
  
  count(){
  }
  
}


//シミュレーションスタート
function setup(){
   const mySimulation = new Simulation(); 
}


//draw
function draw() {

  mySimulation.render();

  for (let i = 0; i < 50; i++) {
    mySimulation.topple();
  }
}
