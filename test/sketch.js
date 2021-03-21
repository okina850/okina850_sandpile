//シミュレーションクラス under construction
class Simulation {
  constructor() {
    this.gridWidth = 600;
    this.gridHeight = 600;

    this.initHeight = 2;
    this.currentStackToBeAdded = 10000;
    this.wholeAddedGrains = 0;

    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
    //this.render();

    this.playMode;
    this.action_area;
    this.analysis_display;

    this.setup();
  }
  
  //各種セットアップ
  setup() {
    noLoop();//最初からレンダリングしない
    createCanvas(600, 600);//キャンバス生成
    pixelDensity(1);


    /*        プレイモードを選ぶselect要素を生成                */
    this.set_playMode();


    /*       初期条件の設定用のinput要素やbutton要素を生成              */
    this.create_setting_wrapper();//ラッパー
    this.create_set_initHeightInput();//初期砂山高さの入力欄
    this.create_set_grainsInput();//追加したい粒子数の入力欄
    this.create_addBtn();//addボタン
    this.create_fileInput();//ファイルロード
  
    /*     スタート、ストップ、セーブ、アナライズ等 アクション用           */
    this.set_action_area();
    
    /*分析結果を表示する画面 */

    const analysisDisplay = document.body.appendChild(document.createElement("div"));
    analysisDisplay.id = "analysisDisplay";
    analysisDisplay.innerText = "analysis:";
  
  
  }

  
  topple() {

    /*
    方法:
     一旦nextpilesに渡して、nextpilesでトップリングを行う。

    */
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.nextpiles[x][y] = this.sandpiles[x][y];
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let num = this.sandpiles[x][y];
        if (num >= 4) {
          this.nextpiles[x][y] -= 4;
          if (x + 1 < width)
            this.nextpiles[x + 1][y]++;
          if (x - 1 >= 0)
            this.nextpiles[x - 1][y]++;
          if (y + 1 < height)
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

  //under construction
  render() {
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

  
  
  
  set_playMode(){
    this.playMode = document.body.appendChild(document.createElement("select"));
    this.playMode.id = "select_playMode";
    this.playMode.appendChild(document.createElement("option")).value = "atOnce";
    this.playMode.appendChild(document.createElement("option")).value = "oneByOne";

    console.log(this)
    this.playMode.addEventListener("change", function(e) {
      console.log(this);
      const addBtn = document.getElementById("addBtn");

      if (this.playMode.value === "atOnce") {
        addBtn.value = "Add at once";
        addBtn.addEventListener("click", function(e) {
          console.log(this)

          this.sandpiles[width / 2][height / 2] += this.currentStackToBeAdded;
          this.currentStackToBeAdded = 0;
          console.log(`origin:%i, currentStack:%i`, this.sandpiles[width / 2][height / 2], this.currentStackToBeAdded);
        }.bind(this));
      }

      if (this.playMode.value === "oneByOne") {
        console.log(this)
        addBtn.value = "Add one by one";
        addBtn.addEventListener("click", function(e) {
          console.log(this)
          this.sandpiles[width / 2][height / 2] += 1;
          this.currentStackToBeAdded -= 1;
          console.log(`origin:%i, currentStack:%i`, this.sandpiles[width / 2][height / 2], this.currentStackToBeAdded);
        }.bind(this));
      }

    }.bind(this));
  }
  
  
  create_setting_wrapper(){
    const setting_wrapper = document.body.appendChild(document.createElement("div"));
    setting_wrapper.id = "setting_wrapper";
  }
  
  create_set_initHeightInput(){
    const set_initHeight = document.getElementById("setting_wrapper").appendChild(document.createElement("input"));
    set_initHeight.id = "set_initHeight";
    set_initHeight.type = "number";
    set_initHeight.addEventListener("change", function(e) {
      console.log(e);
      console.log(this);
      console.log(typeof this.value);
      this.initHeight = Number(this.value);

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
      this.currentStackToBeAdded = Number(this.value);
    }.bind(this));

  }

  create_addBtn() {
    const addBtn = document.getElementById("setting_wrapper").appendChild(document.createElement("button"));
    addBtn.id = "addBtn";
  }
  
  create_fileInput(){
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
        console.log(reader.result)
        console.log(JSON.parse(reader.result));
        this.sandpiles = JSON.parse(reader.result);
        render();
      }

    }.bind(this), false);
  
  }
  
  set_action_area(){
    //スタート、ストップ、セーブ、アナライズ
    const action_area = document.body.appendChild(document.createElement("div"));

    const saveBtn = action_area.appendChild(document.createElement("button"));
    saveBtn.innerText = "save";
    saveBtn.addEventListener("click", () => {
      noLoop();
      const json = JSON.stringify(sandpiles);
      const blob = new Blob([json], {
        type: "application/json"
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ASM.json';
      link.click();

    });

    const stopBtn = action_area.appendChild(document.createElement("button"));
    stopBtn.innerText = "stop";
    stopBtn.addEventListener("click", () => {
      noLoop();
    });

    const startBtn = action_area.appendChild(document.createElement("button"));
    startBtn.innerText = "start";
    startBtn.addEventListener("click", () => {
      loop();
    });

    const analysisBtn = action_area.appendChild(document.createElement("button"));
    analysisBtn.innerText = "analyze";
    analysisBtn.addEventListener("click", function(e) {
      console.log("analyze")
      console.log(`Number of added grains:${this.countingAddedGrains()}`);
      console.log(`Number of topples:%i`, this.countNumberOfTopples());

      const wrapper = document.getElementById("analysisDisplay");
      wrapper.innerHTML = "";

      /*
      const numOfAddedGrains = wrapper.appendChild(document.createElement("div"));
      numOfAddedGrains.innerText = `Number of added grains:${stateOfSandpile.countingAddedGrains()}`;
      */
      const numOfTopples = wrapper.appendChild(document.createElement("div"));
      numOfTopples.innerText = `Number of topples:${stateOfSandpile.countNumberOfTopples()}`;


    }.bind(this), false);

  }



}


//シミュレーションスタート
function setup() {
  const mySimulation = new Simulation();
  mySimulation.setup();
}


//draw
function draw() {

  mySimulation.render();

  for (let i = 0; i < 50; i++) {
    mySimulation.topple();
  }
}