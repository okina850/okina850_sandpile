//シミュレーションクラス under construction
class Simulation {
  constructor() {


    this.defaultColor = [0, 0, 0];
    this.colors = [
      [255, 255, 255],
      [100, 100, 100],
      [255, 0, 0],
      [0, 0, 255]
    ];

    //初期条件
    this.initHeight = 2;
    this.gridWidth = 601;
    this.gridHeight = 601;


    //砂山の状態
    this.currentStackToBeAdded = 0;
    this.wholeAddedGrains = 0;
    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
    //this.render();

    //アプリのUI
    this.playMode;
    this.action_area;
    this.analysis_display;
  }

  reset_grid(_width,_height){
    this.gridWidth = _width;
    this.gridHeight = _height;
    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
  }
  //各種セットアップ
  setup() {


    /*        プレイモードを選ぶselect要素を生成                */
    this.set_playMode();


    /*       初期条件の設定用のinput要素やbutton要素を生成              */
    this.create_setting_wrapper(); //ラッパー
    this.create_set_initHeightInput(); //初期砂山高さの入力欄
    this.create_set_grainsInput(); //追加したい粒子数の入力欄
    this.create_addBtn(); //addボタン
    this.create_fileInput(); //ファイルロード

    /*     スタート、ストップ、セーブ、アナライズ等 アクション用           */
    this.set_action_area();

    /*分析結果を表示する画面 */

    const analysisDisplay = document.body.appendChild(document.createElement("div"));
    analysisDisplay.id = "analysisDisplay";
    analysisDisplay.innerText = "analysis:";


  }

  totteoki(){
    for(let i = 0;i<4;i++){
      this.initHeight = i;
      this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      this.nextpiles = this.sandpiles;

      for(let j=1;j<=5;j++){
          this.currentStackToBeAdded = j * 100000;
          this.sandpiles[Math.floor(this.gridWidth / 2) + 1][Math.floor(this.gridHeight / 2) + 1] += this.currentStackToBeAdded;
          this.wholeAddedGrains += this.currentStackToBeAdded;
          this.currentStackToBeAdded = 0;

          let currentpile = this.sandpiles;
          
          while(true){
            for (let x = 0; x < this.gridWidth; x++) {
              for (let y = 0; y < this.gridHeight; y++) {
                this.nextpiles[x][y] = this.sandpiles[x][y];
                //プリミティブ渡しなので、参照渡しではない。nextpilesとsandpilesは別物。
              }
            }

            for (let x = 0; x < this.gridWidth; x++) {
              for (let y = 0; y < this.gridHeight; y++) {
                let num = this.sandpiles[x][y];
                if (num >= 4) {
                  this.nextpiles[x][y] -= 4;
                  if (x + 1 < this.gridWidth)
                    this.nextpiles[x + 1][y]++;
                  if (x - 1 >= 0)
                    this.nextpiles[x - 1][y]++;
                  if (y + 1 < this.gridHeight)
                    this.nextpiles[x][y + 1]++;
                  if (y - 1 >= 0)
                    this.nextpiles[x][y - 1]++;
                }
              }
            }

            let tmp = this.sandpiles; //tmp にsandpilesを避難
            this.sandpiles = this.nextpiles; //トップリング済みの結果をthis.sandpilesに渡す。this.sandpilesの参照であるtmpも連動して変化。
            this.nextpiles = tmp; //sandpilesとnextpilesは別もの
          }


      }

    }
  }

  //topple
  topple() {

    /*
    方法:
     一旦nextpilesに渡して、nextpilesでトップリングを行う。

    */
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        this.nextpiles[x][y] = this.sandpiles[x][y];
      }
    }

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        let num = this.sandpiles[x][y];
        if (num >= 4) {
          this.nextpiles[x][y] -= 4;
          if (x + 1 < this.gridWidth)
            this.nextpiles[x + 1][y]++;
          if (x - 1 >= 0)
            this.nextpiles[x - 1][y]++;
          if (y + 1 < this.gridHeight)
            this.nextpiles[x][y + 1]++;
          if (y - 1 >= 0)
            this.nextpiles[x][y - 1]++;
        }
      }
    }

    let tmp = this.sandpiles; //配列なので、参照渡し。(JavaScript特有の挙動)
    this.sandpiles = this.nextpiles; //トップリング済みの結果をthis.sandpilesに渡す。this.sandpilesの参照であるtmpも連動して変化。
    this.nextpiles = tmp; //nextpilesを更新
  }


  //save
  save_json(){
    const sandpile_data = {
      init_condition: {
        initHeight: this.initHeight,
        gridSize: {
          width: this.gridWidth,
          height: this.gridHeight
        },
        maxStability: 3
      },
      state: {
        sandpiles: this.sandpiles,
        wholeAddedGrains: this.wholeAddedGrains //this.countingAddedGrains(),
        //numOfAvalanche:0,
        //maxAvalancheTime:0
      }
    }

  }

  save_picture(){
    const sandpile_data = {
      init_condition: {
        initHeight: this.initHeight,
        gridSize: {
          width: this.gridWidth,
          height: this.gridHeight
        },
        maxStability: 3
      },
      state: {
        sandpiles: this.sandpiles,
        wholeAddedGrains: this.wholeAddedGrains //this.countingAddedGrains(),
        //numOfAvalanche:0,
        //maxAvalancheTime:0
      }
    }
    saveCanvas(canvas, `ASM_${sandpile_data.state.wholeAddedGrains}_IH_${sandpile_data.init_condition.initHeight}_grid_${sandpile_data.init_condition.gridSize.width}bi${sandpile_data.init_condition.gridSize.height}`, 'jpg');
  }




  /*
    //under construction

    render() {
      //under construction
      loadPixels();
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          let num = this.sandpiles[x][y];
          let col = this.defaultColor;
          if (num == 0) {
            col = this.colors[0];
          } else if (num == 1) {
            col = this.colors[1];
          } else if (num == 2) {
            col = this.colors[2];
          } else if (num == 3) {
            col = this.colors[3];
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
  */



  set_playMode() {
    this.playMode = document.body.appendChild(document.createElement("select"));
    [this.playMode.id, this.playMode.value] = ["select_playMode", "atOnce-mode"];
    const option1 = this.playMode.appendChild(document.createElement("option"));
    const option2 = this.playMode.appendChild(document.createElement("option"));
    [option1.value, option2.value, option1.innerText, option2.innerText] = ["atOnce-mode", "oneByOne-mode", "atOnce-mode", "oneByOne-mode"];

    this.playMode.addEventListener("change", function(e) {
      const addBtn = document.getElementById("addBtn");
      this.switch_functionality_addBtn();
    }.bind(this));

  }


  create_setting_wrapper() {
    const setting_wrapper = document.body.appendChild(document.createElement("div"));
    setting_wrapper.id = "setting_wrapper";
  }

  create_set_initHeightInput() {
    const set_initHeight = document.getElementById("setting_wrapper").appendChild(document.createElement("input"));
    set_initHeight.id = "set_initHeight";
    set_initHeight.type = "number";
    set_initHeight.addEventListener("change", function(e) {
      this.initHeight = Number(document.getElementById("set_initHeight").value);
      this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      this.nextpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      render();
    }.bind(this));
  }

  create_set_grainsInput() {
    const set_grains = document.getElementById("setting_wrapper").appendChild(document.createElement("input"));
    set_grains.id = "set_grains";
    set_grains.type = "number";
    set_grains.addEventListener("change", function(e) {
      this.currentStackToBeAdded = Number(document.getElementById("set_grains").value);
    }.bind(this));

  }

  create_addBtn() {
    const addBtn = document.getElementById("setting_wrapper").appendChild(document.createElement("button"));
    addBtn.id = "addBtn";
    this.switch_functionality_addBtn();

  }

  switch_functionality_addBtn(){
    if (this.playMode.value == "atOnce-mode") {

      addBtn.value = "Add at once";
      addBtn.innerText = "Add at once";
      addBtn.addEventListener("click", function(e) {
        this.sandpiles[this.gridWidth / 2][this.gridHeight / 2] += this.currentStackToBeAdded;
        this.wholeAddedGrains += this.currentStackToBeAdded;
        this.currentStackToBeAdded = 0;
        document.getElementById("set_grains").value = 0;
      }.bind(this));

    }

    if (this.playMode.value == "oneByOne-mode") {
      addBtn.value = "Add one by one";
      addBtn.innerText = "Add one by one";
      addBtn.addEventListener("click", function(e) {
        this.sandpiles[this.gridWidth / 2][this.gridHeight / 2] += 1;
        this.currentStackToBeAdded -= 1;
      }.bind(this));
    }


  }

  create_fileInput() {
    //ファイルをロード
    const inputFiles = document.getElementById("setting_wrapper").appendChild(document.createElement("input"));
    inputFiles.type = "file";
    inputFiles.addEventListener("change", function(e) {
      noLoop();
      console.log(e.target.files);
      const file = e.target.files;
      const reader = new FileReader();
      reader.readAsText(file[0]);
      console.log(reader.result);

      reader.onload = function() {
        console.log(JSON.parse(reader.result));
        const sandpile_data = JSON.parse(reader.result);

        this.initHeight = sandpile_data.init_condition.initHeight;
        this.gridWidth = sandpile_data.init_condition.gridSize.width;
        this.gridHeight = sandpile_data.init_condition.gridSize.height;

        this.sandpiles = sandpile_data.state.sandpiles;
        this.wholeAddedGrains = sandpile_data.state.wholeAddedGrains;
        console.log(this)

        render();
      }.bind(this);

    }.bind(this), false);

  }

  set_action_area() {
    //スタート、ストップ、セーブ、アナライズ
    const action_area = document.body.appendChild(document.createElement("div"));

    const saveJsonBtn = action_area.appendChild(document.createElement("button"));
    saveJsonBtn.innerText = "save json";
    saveJsonBtn.addEventListener("click", () => {
      noLoop();
      const sandpile_data = {
        init_condition: {
          initHeight: this.initHeight,
          gridSize: {
            width: this.gridWidth,
            height: this.gridHeight
          },
          maxStability: 3
        },
        state: {
          sandpiles: this.sandpiles,
          wholeAddedGrains: this.wholeAddedGrains //this.countingAddedGrains(),
          //numOfAvalanche:0,
          //maxAvalancheTime:0
        }
      }


      const json = JSON.stringify(sandpile_data);
      const blob = new Blob([json], {
        type: "application/json"
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ASM_${sandpile_data.state.wholeAddedGrains}_IH_${sandpile_data.init_condition.initHeight}_grid_${sandpile_data.init_condition.gridSize.width}bi${sandpile_data.init_condition.gridSize.height}.json`;
      link.click();

    });

    const savePictureBtn = action_area.appendChild(document.createElement("button"));
    savePictureBtn.innerText = "save picture";
    savePictureBtn.addEventListener("click", () => {
      noLoop();
      this.save_picture();
    });



    const stopBtn = action_area.appendChild(document.createElement("button"));
    stopBtn.innerText = "stop";
    stopBtn.addEventListener("click", () => {
      noLoop();

      document.getElementById("set_initHeight").disabled = false;
      document.getElementById("set_grains").disabled = false;

    });

    const startBtn = action_area.appendChild(document.createElement("button"));
    startBtn.innerText = "start";
    startBtn.addEventListener("click", () => {
      document.getElementById("set_initHeight").disabled = true;
      document.getElementById("set_grains").disabled = true;
      loop();
    });

    const analysisBtn = action_area.appendChild(document.createElement("button"));
    analysisBtn.innerText = "analyze";
    analysisBtn.addEventListener("click", function(e) {
      console.log("analyze")
//      console.log(`Number of added grains:${this.countingAddedGrains()}`);
//      console.log(`Number of topples:%i`, this.countNumberOfTopples());

      const wrapper = document.getElementById("analysisDisplay");
      wrapper.innerHTML = "";


      const numOfAddedGrains = wrapper.appendChild(document.createElement("div"));
      numOfAddedGrains.innerText = `Number of added grains:${this.wholeAddedGrains}`;

      const numOfTopples = wrapper.appendChild(document.createElement("div"));
      numOfTopples.innerText = `Number of topples:`;

      const isDone = wrapper.appendChild(document.createElement("div"));
      isDone.innerText = `Avalanche is done:`;


    }.bind(this), false);

  }


  /*
  countingAddedGrains() {
    let sum = 0;

    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {
        //  console.log(`sandpiles[%i][%i]:%i`,i,j,sandpiles[i][j]);
        sum += this.sandpiles[i][j];
      }
    }
    console.log(`sum:%i,initHeight:%i,width:%i,height:%i`, sum, this.initHeight, width, height);
    return sum - this.initHeight * width * height;
  }
  */


}


//シミュレーションスタート
const mySimulation = new Simulation();
mySimulation.setup();

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
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
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

//draw
function draw() {
  //console.log(mySimulation.sandpiles[mySimulation.gridWidth/2][mySimulation.gridHeight/2]);//ずっと2
  //mySimulation.render.call(this);
  render();
  for (let i = 0; i < 50; i++) {
    mySimulation.topple();
  }
}
