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
  //各種DOMセットアップ
  setupDOM() {


    /*        プレイモードを選ぶselect要素を生成                */
  //  this.set_playMode();


    /*       初期条件の設定用のinput要素やbutton要素を生成              */
    //ラッパー
    this.create_setting_wrapper();
    //gridのリセット
    this.createDOM("input","reset_grid","number","change",()=>{
      const size = Number(document.getElementById("reset_grid").value);
      this.reset_grid(size,size);
      document.getElementById("defaultCanvas0").width = size;
      document.getElementById("defaultCanvas0").height = size;

    },[null],"setting_wrapper","Grid size(initially 601 × 601)");
    //初期砂山高さの入力欄
    this.create_set_initHeightInput();

    this.create_set_grainsInput(); //追加したい粒子数の入力欄
    //this.create_addBtn(); //addボタン
    this.create_fileInput(); //ファイルロード

    /*     スタート、ストップ、セーブ、アナライズ等 アクション用           */
    this.set_action_area();

    /*分析結果を表示する画面 */

    const analysisDisplay = document.body.appendChild(document.createElement("div"));
    analysisDisplay.id = "analysisDisplay";
    analysisDisplay.innerText = "analysis:";


  }

  createDOM(_nodeName = "div",_id = "noId",_type = undefined,_event = "click",_func,_arguments,_wrapper = "body", _placeholder){
    const newElement = document.createElement(_nodeName);
    newElement.id = _id;
    newElement.type = _type;
    newElement.placeholder = _placeholder;
    newElement.addEventListener(_event,_func);

    document.getElementById(_wrapper).appendChild(newElement);
  }

  MoveStandard_1Step(n,ih,kLatticeSize,addedCell){
    //A vector notation designating the 4 neighborhoods of the cell on which we put the grains.
      const kDx = [1,0,-1,0];
      const kDy = [0,1,0,-1];

      const LCoord = () => {
        return {x:-1,y:-1}
      }

      let z_lat =  new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(ih));
      //console.log(JSON.stringify(z_lat))
          // models the standard lattice Z^2
      let v_sites = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(false));
          // vertices of Z^2 which were visited during the process//which means the neighborhood cells onto which the toppled grains fall.
      v_sites[addedCell][addedCell] = true;

      let to_be_moved = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(false));
          // vertices of Z^2 which are already in the walking stack//which means the cell from which a toppling is going to occur.
      let odometer = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(0));
          // total number of topplings of a given vertex of Z^2


      let top = -1;
      let walking = new Array(kLatticeSize*kLatticeSize).fill().map(i => LCoord());//少し微妙な初期化
          //"walking" key: the number of sequence of toppling in the present avalanche
          //          value: the object of lattice point
          //walking[3] = {x:11,y:4} means "The 3rd lattice to topple is located at  (11,4)
          //"top" is an integer to stack the key of "walking".
          //So,"top" can take  0,1,2,...,(kLatticeSize * kLatticeSize - 1).

      let x = 0, y = 0, lx = 0, ly = 0;
          //(x,y): a site to topple
          //(lx,ly): a next site to topple

      let max_of_top = 0;//the maximum of the time during which avalanches continue during the whole simulation.
      let n_of_moves = 0;//the number of moves occured during the whole simulation.

      for(let i = n;i>0;i--){
          //Put one grain on the origin
          //If the stability of the origin breaks, push the origin lattice back into the walking stack.
          if(++z_lat[addedCell][addedCell] >= 4){// one grain out of 'n' grains being put on the origin, and evaluating if the height of the origin is bigger or equal to 4(the upper limit value of height with which the cell stays stable.).
              walking[++top].x = addedCell;
              walking[top].y = addedCell;
          }
          //console.log(`i:${i}\n`);

          //avalanche continues until the walking stack is empty
          while(top >= 0){
              n_of_moves += 1;
             //console.log(`top=${top}\n`);
             //refresh the maximum time of avalanches
              if(max_of_top < top){
                  max_of_top = top;
              }

              //designate the site which topples.
              x = walking[top].x;
              y = walking[top].y;

              z_lat[x][y] = z_lat[x][y] - 4;
              //if(z_lat.some(x => x.length != 5)) console.log(`i:%i,walking[top]:%o,z_lat:%o`,i,walking[top],z_lat);

              if (z_lat[x][y] < 4){
                  top--;
                  to_be_moved[x][y] = false;
              }

                  //designate sites to topple
                  //designate sites onto which a grain falls.
                  //topple.
              for (let k = 0; k < 4; ++k){
                  //designating the neighborhood cells onto which the toppled grains fall.
                  // 'k' denotes a direction out of 4.(k = 0,1,2,3 : right,up,left,down) (refering to "kDx","kDy" on "abel" on "Abel.h")
                  lx = x + kDx[k];
                  ly = y + kDy[k];

                  if(!(0 <= lx && lx < kLatticeSize && 0 <= ly && ly < kLatticeSize)){
                    continue;
                  }

                  v_sites[lx][ly] = true;//The falling grain lands on the "true" cell which we designated right above.
                  z_lat[lx][ly]++;//The grain has been piled.
                  //console.log(z_lat);

                  //Fires when a toppling successively occurs.(when "avalanche" continues)
                  if (to_be_moved[lx][ly] == false && z_lat[lx][ly] >= 4){
                          //(lx,ly) cell is going to be the next one to topple.
                          //Here in this iteration, the integer "top" can take 0,1,2,3 (other than 0)
                      walking[++top].x = lx;
                      walking[top].y = ly;
                      to_be_moved[lx][ly] = true;
                  }
              }

          }


      }
      this.sandpiles = z_lat;
      //return z_lat;
  }
  Add_MoveStandard_1Step(previousSandpile,n,ih,kLatticeSize,addedCell){
    //A vector notation designating the 4 neighborhoods of the cell on which we put the grains.
      const kDx = [1,0,-1,0];
      const kDy = [0,1,0,-1];

      const LCoord = () => {
        return {x:-1,y:-1}
      }

      let v_sites = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(false));
          // vertices of Z^2 which were visited during the process//which means the neighborhood cells onto which the toppled grains fall.
      v_sites[addedCell][addedCell] = true;

      let to_be_moved = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(false));
          // vertices of Z^2 which are already in the walking stack//which means the cell from which a toppling is going to occur.
      let odometer = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(0));
          // total number of topplings of a given vertex of Z^2


      let top = -1;
      let walking = new Array(kLatticeSize*kLatticeSize).fill().map(i => LCoord());//少し微妙な初期化
          //"walking" key: the number of sequence of toppling in the present avalanche
          //          value: the object of lattice point
          //walking[3] = {x:11,y:4} means "The 3rd lattice to topple is located at  (11,4)
          //"top" is an integer to stack the key of "walking".
          //So,"top" can take  0,1,2,...,(kLatticeSize * kLatticeSize - 1).

      let x = 0, y = 0, lx = 0, ly = 0;
          //(x,y): a site to topple
          //(lx,ly): a next site to topple

      let max_of_top = 0;//the maximum of the time during which avalanches continue during the whole simulation.
      let n_of_moves = 0;//the number of moves occured during the whole simulation.

      for(let i = n;i>=0;i--){
          //Put one grain on the origin
          //If the stability of the origin breaks, push the origin lattice back into the walking stack.
          if(i!==0) ++previousSandpile[addedCell][addedCell];
          if(previousSandpile[addedCell][addedCell] >= 4){// one grain out of 'n' grains being put on the origin, and evaluating if the height of the origin is bigger or equal to 4(the upper limit value of height with which the cell stays stable.).
              walking[++top].x = addedCell;
              walking[top].y = addedCell;
          }
          //console.log(`i:${i}\n`);

          //avalanche continues until the walking stack is empty
          while(top >= 0){
              n_of_moves += 1;
             //console.log(`top=${top}\n`);
             //refresh the maximum time of avalanches
              if(max_of_top < top){
                  max_of_top = top;
              }

              //designate the site which topples.
              x = walking[top].x;
              y = walking[top].y;

              previousSandpile[x][y] = previousSandpile[x][y] - 4;
              //if(previousSandpile.some(x => x.length != 5)) console.log(`i:%i,walking[top]:%o,previousSandpile:%o`,i,walking[top],previousSandpile);

              if (previousSandpile[x][y] < 4){
                  top--;
                  to_be_moved[x][y] = false;
              }

                  //designate sites to topple
                  //designate sites onto which a grain falls.
                  //topple.
              for (let k = 0; k < 4; ++k){
                  //designating the neighborhood cells onto which the toppled grains fall.
                  // 'k' denotes a direction out of 4.(k = 0,1,2,3 : right,up,left,down) (refering to "kDx","kDy" on "abel" on "Abel.h")
                  lx = x + kDx[k];
                  ly = y + kDy[k];

                  if(!(0 <= lx && lx < kLatticeSize && 0 <= ly && ly < kLatticeSize)){
                    continue;
                  }

                  v_sites[lx][ly] = true;//The falling grain lands on the "true" cell which we designated right above.
                  previousSandpile[lx][ly]++;//The grain has been piled.
                  //console.log(previousSandpile);

                  //Fires when a toppling successively occurs.(when "avalanche" continues)
                  if (to_be_moved[lx][ly] == false && previousSandpile[lx][ly] >= 4){
                          //(lx,ly) cell is going to be the next one to topple.
                          //Here in this iteration, the integer "top" can take 0,1,2,3 (other than 0)
                      walking[++top].x = lx;
                      walking[top].y = ly;
                      to_be_moved[lx][ly] = true;
                  }
              }

          }


      }
      return previousSandpile;
  }

  avalanche_1Step(){

  }

  reset_grid(_width,_height){
    this.gridWidth = _width;
    this.gridHeight = _height;
    this.clear_sandpile();
  }

  clear_sandpile(){
    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
    this.wholeAddedGrains = 0;
    this.currentStackToBeAdded = 0;
  }

  totteoki(){
    for(let i = 0;i<4;i++){
      this.initHeight = i;
      this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      this.nextpiles = this.sandpiles;

      for(let j=1;j<=5;j++){
          this.currentStackToBeAdded = j * 100000;
          this.sandpiles[Math.floor(this.gridWidth / 2)][Math.floor(this.gridHeight / 2)] += this.currentStackToBeAdded;
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
  /*
  topple() {

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
  */

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
  */

  create_setting_wrapper() {
    const setting_wrapper = document.body.appendChild(document.createElement("div"));
    setting_wrapper.id = "setting_wrapper";
  }

  create_set_initHeightInput() {
    const set_initHeight = document.getElementById("setting_wrapper").appendChild(document.createElement("input"));
    set_initHeight.id = "set_initHeight";
    set_initHeight.type = "number";
    set_initHeight.placeholder = "Set initial height";
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
    set_grains.placeholder = "Number of grains to add";
    set_grains.addEventListener("change", function(e) {
      this.currentStackToBeAdded = Number(document.getElementById("set_grains").value);
    }.bind(this));

  }
  /*
  create_addBtn() {
    const addBtn = document.getElementById("setting_wrapper").appendChild(document.createElement("button"));
    addBtn.id = "addBtn";
    this.switch_functionality_addBtn();

  }
  */
  /*
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
  */
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

    const hayk = action_area.appendChild(document.createElement("button"));
    hayk.innerText = "MoveStandard_1Step";
    hayk.addEventListener("click", () => {
      this.wholeAddedGrains += this.currentStackToBeAdded;
      this.Add_MoveStandard_1Step(this.sandpiles,this.currentStackToBeAdded,this.initHeight,this.gridWidth,Math.floor(this.gridWidth/2));
      render();
    });

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


    /*
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
    */
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


}

//const mySimulation = new Simulation();
//window.mySimulation =  mySimulation;
//export {mySimulation};