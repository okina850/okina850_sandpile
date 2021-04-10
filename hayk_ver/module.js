//使わない可能性が高い
class DOM_factory {
  constructor() {
    this.allElements = new Map();
  }

  createDOM(_nodeName = "div", _nodeId, _parentNode) {
    const newElement = document.createElement(_nodeName);
    newElement.id = _nodeId;
    const parent = _parentNode;
    this.appendDOM(newElement, parent);
    return newElement;
  }
  appendDOM(_childNode, _parentNode) {
    const parent = (_parentNode) ? _parentNode : document.body;
    parent.appendChild(_childNode);
  }
  editProp(_node, _prop, _content) {
    _node[_prop] = _content;
  }
  createMany(_n, _nodeName, _parentNode, _contents = [], _nodeIds = []) {
    const newElements = [];
    for (let i = 0; i < _n; i++) {
      newElements.push(this.createDOM(_nodeName, _nodeIds[i], _parentNode));
    }

    if (_contents.length === 0) return newElements;

    for (let i = 0; i < _n; i++) {
      this.editProp(newElements[i], "innerText", _contents[i]);
    }
    return newElements;

  }
  clearAll() {}

}
//使わない可能性が高い
class DOM_factory_for_sandpileSimulation extends DOM_factory {
  constructor() {
    super();
  }
  setupDOM() {
    /*       初期条件の設定用のinput要素やbutton要素を生成              */
    //ラッパー
    const setting_wrapper = this.createDOM("div", "setting_wrapper", document.body);
    //gridのリセット
    const reset_grid = this.createDOM("input", "reset_grid", setting_wrapper);
    reset_grid.type = "number";
    reset_grid.addEventListener("change", () => {
      const size = Number(document.getElementById("reset_grid").value);
      this.reset_grid(size, size);
      document.getElementById("defaultCanvas0").width = size;
      document.getElementById("defaultCanvas0").height = size;
    });
  }

}
//const myDOM_factory = new DOM_factory();


class Simulation {
  constructor() {
    this.defaultColor = [0, 0, 0];
    this.colors = [
      //for heights
      [0, 255, 255],//
      [0, 191, 255],//
      [30, 144, 255],//
      [0, 0, 255],//
      //for obstacles
      [255,0,0],//-1/wall
      [0,0,0]//-2/hole
    ];

    //初期条件
    this.initHeight = 2;
    this.gridWidth = 601;
    this.gridHeight = 601;
    this.center = {x:Math.floor(this.gridWidth/2),y:Math.floor(this.gridHeight/2)};

    //砂山の状態
    this.currentStackToBeAdded = 0;
    this.wholeAddedGrains = 0;
    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
    //obstaclesオブジェクト:格子に壁、穴などの障害物(obstacle)を設置するためのオブジェクト
    this.obstacles = {
      //各種プロパティ

      //this:外のthis(Simulationのthis)へのアクセスポート
      this:this,
      //sites:どの格子点にどの障害物が設置されているかの情報を格納する整数型の2次元配列。各要素は次のいずれかの整数値を持つ: 0:何もない(nothing),-1:壁(wall),-2:穴(hole)。
      sites:new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(0)),//0:nothingで初期化
      //sites:new Map(),
      //各種メソッド

      setSparse(_z_lat,_obstacleType){
        if(_obstacleType === "nothing") {
          return new Array(this.this.gridWidth).fill().map(i => new Array(this.this.gridHeight).fill(this.this.initHeight));
        }
        const obstacleType = (_obstacleType === "wall") ? -1 : -2;
        const dx = 50, dy = 50;

        for(let x = 0; x < this.this.gridWidth; x+=dx){
          for(let y = 0; y < this.this.gridHeight; y+=dy){
            this.setOne(x,y,obstacleType);
          }
        }

        //set obstacle on z_lat
        const obsList = this.getObstacleList();
        const map = new Map([[-1,-1],[-2,-2],[0,this.this.initHeight]]);
        for(let obs of obsList){
            _z_lat[obs.x][obs.y] = map.get(obs.type);
            //console.log(_z_lat[obs.x][obs.y])
        }

        return _z_lat;
      },

      set_wall_test(_z_lat){
        for(let dx = 10; dx <= 50; dx++){
          for(let dy = -280; dy <= 280; dy++){
            this.setOne(this.this.center.x + dx, this.this.center.y + dy,-1);
          }
        }

        const obsList = this.getObstacleList();
        for(let obs of obsList){
            _z_lat[obs.x][obs.y] = obs.type;
            //console.log(_z_lat[obs.x][obs.y])
        }

        return _z_lat;
      },
      set_hole_test(_z_lat){
        for(let dx = 10; dx <= 50; dx++){
          for(let dy = -20; dy <= 20; dy++){
            this.setOne(this.this.center.x + dx, this.this.center.y + dy,-2);
          }
        }

        const obsList = this.getObstacleList();
        for(let obs of obsList){
            _z_lat[obs.x][obs.y] = obs.type;
            //console.log(_z_lat[obs.x][obs.y])
        }

        return _z_lat;
      },
      test(){
        this.set_hole_test(this.this.sandpiles);
      },
      //getObstacleList:障害物が設置されている場所の座標と障害物のタイプの情報が入った1次元配列を返す関数
      getObstacleList(){
        const obstacleList = [];
        for(let i=0;i < this.this.gridWidth;i++){
          for(let j=0;j < this.this.gridHeight;j++){
            if(this.sites[i][j] !== 0) obstacleList.push({type:this.sites[i][j], x:i,y:j});
          }
        }
        return obstacleList;
      },
      //setOne第1,第2引数に指定した場所に第3引数で指定した障害物を設置するサブルーチン
      setOne(_x, _y, _type = -1){
        this.sites[_x][_y] = _type;
      },
      //wallMaintenance:sandpilesに設置された壁が壊れていないか調べる関数:引数:z_lat,戻り値:破壊されているz_latの場所の座標が入った1次元配列
      wallMaintenance(){
        const broken = [];
        console.log(this)
        console.log(this.getObstacleList)
        const wallList = this.getObstacleList().filter(elem => elem.type === -1);
        for(let elem of wallList){
          if(this.this.sandpiles[elem.x][elem.y] !== -1) broken.push({x:elem.x,y:elem.y});
        }
        console.log(`broken walls:`,broken)
        return broken;
      }

    };
    //this.obstacles.set_wall_test(this.sandpiles);//壁の設置テスト
    //this.obstacles.set_hole_test(this.sandpiles);//穴の設置テスト

    this.v_sites = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(false));
    this.to_be_moved = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(false));
    this.odometer = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(0));
    //If to_be_added[i][j] = true, the dealer puts a grain on the (i,j) site.
    this.to_be_added = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill());
    for(let i=0;i<this.gridWidth;i++){
      for(let j=0;j<this.gridHeight;j++){
        this.to_be_added[i][j] = {active:false,x:i,y:j};
      }
    }
    this.to_be_added[Math.floor(this.gridWidth/2)][Math.floor(this.gridWidth/2)].active = true;

    //walking stack
    this.walking = new Array(this.gridWidth * this.gridWidth).fill().map(i => {
      return {x:-1,y:-1};
    });


    //アプリのUI
    this.ui = new DOM_factory_for_sandpileSimulation();
  }
  //各種DOMセットアップ
  setupDOM() {
    /*         デバッグ用ボタン   */
    //document.getElementById("wallMaintenance").addEventListener("click",this.obstacles.wallMaintenance.bind(this.obstacles));


    /*       初期条件の設定用のinput要素やbutton要素を生成              */
    //ラッパー
    this.create_setting_wrapper();
    //setting a wall
    const settingObstacle = document.getElementById("setting_wrapper").appendChild(document.createElement("select"));
    settingObstacle.id = "settingObstacle";
    const options = ["nothing","wall","hole"];
    for(let elem of options){
      const option = settingObstacle.appendChild(document.createElement("option"));
      option.value = elem;
      option.innerText = elem;
    }
    settingObstacle.options[0].selected = true;
    settingObstacle.addEventListener("change",function(){
      console.log(document.getElementById("settingObstacle").value)
      this.sandpiles = this.obstacles.setSparse(this.sandpiles,document.getElementById("settingObstacle").value);
      render();
    }.bind(this));


    //gridのリセット
    this.createDOM("input", "reset_grid", "number", "change", () => {
      const size = Number(document.getElementById("reset_grid").value);
      this.reset_grid(size, size);
      document.getElementById("defaultCanvas0").width = size;
      document.getElementById("defaultCanvas0").height = size;

    }, [null], "setting_wrapper", "Grid size(initially 601 × 601)");
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

  createDOM(_nodeName = "div", _id = "noId", _type = undefined, _event = "click", _func, _arguments, _wrapper = "body", _placeholder) {
    const newElement = document.createElement(_nodeName);
    newElement.id = _id;
    newElement.type = _type;
    newElement.placeholder = _placeholder;
    newElement.addEventListener(_event, _func);

    document.getElementById(_wrapper).appendChild(newElement);
  }

  //おそらくもう使わない
  MoveStandard_1Step(n, ih, kLatticeSize, addedCell){
        //A vector notation designating the 4 neighborhoods of the cell on which we put the grains.
    const kDx = [1, 0, -1, 0];
    const kDy = [0, 1, 0, -1];

    const LCoord = () => {
      return {
        x: -1,
        y: -1
      }
    }

    let z_lat = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(ih));
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
    let walking = new Array(kLatticeSize * kLatticeSize).fill().map(i => LCoord()); //少し微妙な初期化
    //"walking" key: the number of sequence of toppling in the present avalanche
    //          value: the object of lattice point
    //walking[3] = {x:11,y:4} means "The 3rd lattice to topple is located at  (11,4)
    //"top" is an integer to stack the key of "walking".
    //So,"top" can take  0,1,2,...,(kLatticeSize * kLatticeSize - 1).

    let x = 0,
      y = 0,
      lx = 0,
      ly = 0;
    //(x,y): a site to topple
    //(lx,ly): a next site to topple

    let max_of_top = 0; //the maximum of the time during which avalanches continue during the whole simulation.
    let n_of_moves = 0; //the number of moves occured during the whole simulation.

    for (let i = n; i > 0; i--) {
      //Put one grain on the origin
      //If the stability of the origin breaks, push the origin lattice back into the walking stack.
      if (++z_lat[addedCell][addedCell] >= 4) { // one grain out of 'n' grains being put on the origin, and evaluating if the height of the origin is bigger or equal to 4(the upper limit value of height with which the cell stays stable.).
        walking[++top].x = addedCell;
        walking[top].y = addedCell;
      }
      //console.log(`i:${i}\n`);

      //avalanche continues until the walking stack is empty
      while (top >= 0) {
        n_of_moves += 1;
        //console.log(`top=${top}\n`);
        //refresh the maximum time of avalanches
        if (max_of_top < top) {
          max_of_top = top;
        }

        //designate the site which topples.
        x = walking[top].x;
        y = walking[top].y;

        z_lat[x][y] = z_lat[x][y] - 4;
        //if(z_lat.some(x => x.length != 5)) console.log(`i:%i,walking[top]:%o,z_lat:%o`,i,walking[top],z_lat);

        if (z_lat[x][y] < 4) {
          top--;
          to_be_moved[x][y] = false;
        }

        //designate sites to topple
        //designate sites onto which a grain falls.
        //topple.
        for (let k = 0; k < 4; ++k) {
          //designating the neighborhood cells onto which the toppled grains fall.
          // 'k' denotes a direction out of 4.(k = 0,1,2,3 : right,up,left,down) (refering to "kDx","kDy" on "abel" on "Abel.h")
          lx = x + kDx[k];
          ly = y + kDy[k];

          if (!(0 <= lx && lx < kLatticeSize && 0 <= ly && ly < kLatticeSize)) {
            continue;
          }

          v_sites[lx][ly] = true; //The falling grain lands on the "true" cell which we designated right above.
          z_lat[lx][ly]++; //The grain has been piled.
          //console.log(z_lat);

          //Fires when a toppling successively occurs.(when "avalanche" continues)
          if (to_be_moved[lx][ly] == false && z_lat[lx][ly] >= 4) {
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
  //こっちを使う
  Add_MoveStandard_1Step(_previousSandpile, _n, _ih, _kLatticeSize, _to_be_added,_animationMode = 0) {
    //animationMode: 0:no animation,1:only stable configulation,2:track any given moment of avalanche
    const animationMode = _animationMode;
    //console.log(render)
    //A vector notation designating the 4 neighborhoods of the cell on which we put the grains.
    const kDx = [1, 0, -1, 0];
    const kDy = [0, 1, 0, -1];

    const LCoord = () => {
      return {
        x: -1,
        y: -1
      }
    }

    const kLatticeSize = _kLatticeSize;

    /*
    const added_sites = _to_be_added.flat().filter(obj => obj.active === true);

    */
    const added_site = {
      x:Math.floor(kLatticeSize/2),
      y:Math.floor(kLatticeSize/2)
    };

    const n = _n;
    const ih = _ih;

    //set the previousSandpile
    const z_lat = _previousSandpile;
    //obstacles
    const obstacles = this.obstacles;//0:nothing,1:wall,2:hole

    // vertices of Z^2 which were visited during the process
    const v_sites = this.v_sites;
    v_sites[added_site.x][added_site.y] = true;
    // vertices of Z^2 which are already in the walking stack//which means the cell from which a toppling is going to occur.
    const to_be_moved = this.to_be_moved;
    // total number of topplings of a given vertex of Z^2
    const odometer = this.odometer;



    //walking stack
    const walking = this.walking;

    //const field_package = {z_lat:z_lat,v_sites:v_sites,to_be_moved:to_be_moved,odometer:odometer,obstacles:obstacles};

    let top = -1;//The top of the walking stack



    //"walking" key: the number of sequence of toppling in the present avalanche
    //          value: the object of lattice point
    //walking[3] = {x:11,y:4} means "The 3rd lattice to topple is located at  (11,4)
    //"top" is an integer to stack the key of "walking".
    //So,"top" can take  0,1,2,...,(kLatticeSize * kLatticeSize - 1).

    let x = 0,
      y = 0,
      lx = 0,
      ly = 0;
    //(x,y): a site to topple
    //(lx,ly): a next site to topple

    let max_of_top = 0; //the maximum of the time during which avalanches continue during the whole simulation.
    let n_of_moves = 0; //the number of moves occured during the whole simulation.

    for (let i = n; i >= 0; i--) {
      //Put one grain on the origin
      //If the stability of the origin breaks, push the origin lattice back into the walking stack.
      if (i !== 0) ++z_lat[added_site.x][added_site.y];
      if (z_lat[added_site.x][added_site.y] >= 4) { // one grain out of 'n' grains being put on the origin, and evaluating if the height of the origin is bigger or equal to 4(the upper limit value of height with which the cell stays stable.).
        walking[++top].x = added_site.x;
        walking[top].y = added_site.y;
      }
      //console.log(`i:${i}\n`);

      //avalanche continues until the walking stack is empty
      while (top >= 0) {
        n_of_moves += 1;
        //console.log(`top=${top}\n`);
        //refresh the maximum time of avalanches
        if (max_of_top < top) {
          max_of_top = top;
        }

        //designate the site which topples.
        x = walking[top].x;
        y = walking[top].y;
        //console.log(`top:`,top)
        //console.log(`walking[top]:`,walking[top]);
        //console.log(`x:`,x);
        //console.log(`z_lat[x][y]:`,z_lat)

        z_lat[x][y] = z_lat[x][y] - 4;
        //if(z_lat.some(x => x.length != 5)) console.log(`i:%i,walking[top]:%o,z_lat:%o`,i,walking[top],z_lat);

        if (z_lat[x][y] < 4) {
          top--;
          to_be_moved[x][y] = false;
        }

        //designate sites to topple
        //designate sites onto which a grain falls.
        //topple.
        for (let k = 0; k < 4; ++k) {
          //designating the neighborhood cells onto which the toppled grains fall.
          // 'k' denotes a direction out of 4.(k = 0,1,2,3 : right,up,left,down) (refering to "kDx","kDy" on "abel" on "Abel.h")
          lx = x + kDx[k];
          ly = y + kDy[k];

          //this.method(lx,ly,field_package);
          if (!(0 <= lx && lx < kLatticeSize && 0 <= ly && ly < kLatticeSize)) {
            continue;
          }

          /*
          //z_latで直接判定するversion
          //壁が壊れてしまい上手く行かない
          if(z_lat[lx][ly] < 0){
            //wall
            if(z_lat[lx][ly] === -1){
              //console.log(`hello wall`)
              lx = x;
              lx = y;
            }
            //hole
            if(z_lat[lx][ly] === -2){
              continue;
            }
          }
          */


          //obstacleFLgで間接的に操作するverstion
          const obstacleFlg = obstacles.sites[lx][ly];
          if(obstacleFlg !== 0){
            //-1:wall
            if(obstacleFlg === -1){
              lx = x;
              ly = y;
            }
            //-2:hole
            if(obstacleFlg === -2){
              continue;
            }
          }




          v_sites[lx][ly] = true; //The falling grain lands on the "true" cell which we designated right above.
          z_lat[lx][ly]++; //The grain has been piled.
          //console.log(z_lat);

          //Fires when a toppling successively occurs.(when "avalanche" continues)
          if (to_be_moved[lx][ly] == false && z_lat[lx][ly] >= 4) {
            //(lx,ly) cell is going to be the next one to topple.
            //Here in this iteration, the integer "top" can take 0,1,2,3 (other than 0)
            walking[++top].x = lx;
            walking[top].y = ly;
            to_be_moved[lx][ly] = true;
          }

          if(animationMode === 2) render();
        }
      }

      if(animationMode === 1) render();
    }
    return z_lat;
  }



  avalanche_1Step() {

  }

  reset_grid(_width, _height) {
    this.gridWidth = _width;
    this.gridHeight = _height;
    this.clear_sandpile();
  }

  clear_sandpile() {
    this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
    this.nextpiles = this.sandpiles;
    this.wholeAddedGrains = 0;
    this.currentStackToBeAdded = 0;
  }

  totteoki() {
    for (let i = 0; i < 4; i++) {
      this.initHeight = i;
      this.sandpiles = new Array(this.gridWidth).fill().map(i => new Array(this.gridHeight).fill(this.initHeight));
      this.nextpiles = this.sandpiles;

      for (let j = 1; j <= 5; j++) {
        this.currentStackToBeAdded = j * 100000;
        this.sandpiles[Math.floor(this.gridWidth / 2)][Math.floor(this.gridHeight / 2)] += this.currentStackToBeAdded;
        this.wholeAddedGrains += this.currentStackToBeAdded;
        this.currentStackToBeAdded = 0;

        let currentpile = this.sandpiles;

        while (true) {
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

  //save
  save_json() {
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
        wholeAddedGrains: this.wholeAddedGrains, //this.countingAddedGrains(),
        obstacles_sites:this.obstacles.sites
        //numOfAvalanche:0,
        //maxAvalancheTime:0
      }
    }

  }

  save_picture() {
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
        this.obstacles.sites = sandpile_data.state.obstacles_sites;
        console.log(this)

        render();
      }.bind(this);

    }.bind(this), false);

  }

  set_action_area() {
    //スタート、ストップ、セーブ、アナライズ
    const action_area = document.body.appendChild(document.createElement("div"));

    const hayk = action_area.appendChild(document.createElement("button"));
    hayk.innerText = "Add_MoveStandard_1Step";
    hayk.addEventListener("click", () => {
      this.wholeAddedGrains += this.currentStackToBeAdded;
      this.Add_MoveStandard_1Step(this.sandpiles, this.currentStackToBeAdded, this.initHeight, this.gridWidth,this.to_be_added,0);
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
