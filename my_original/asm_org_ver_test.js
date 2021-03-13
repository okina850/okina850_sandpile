
/*
コメント(課題など):
ver16。かなり良くなった。
時刻追跡、雪崩継続時間とか追加した。

変数の宣言、変数のスコープ、関数の呼び出し、などについての理解を深めれば、もっとリファクタリングできる。
とりあえず、windows.onloadの外に出して良いものと出しちゃいけないものの区別をつけたい。

*/
window.onload = () =>{
  //必要なグローバル変数たちをここで宣言
  
  var canvas;
  var ctx;
  const myFunc = () =>{
   alert("aa");
  }
  
  //capture the picture of present sandpile
  const haha = () => {
    canvas.toBlob(function(blob){
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "mySandPile.jpeg";
      link.click();
    });
  }
  
  //安定配置の進み具合を表す(最初のステップを0)
  let step_of_stableConfiguration = 0;
  //時刻＝全ての(不安定配置も含めた)配置ステップを表す(最初の時刻を0)
  let time = 0;
  let interval_avalanche = 0;
  
  //セル1マスのサイズを格納する変数
  var cellSize;
  
  //セルの列の個数と行の個数を格納
  var retsunokazu;
  var gyounokazu;
  //例：divNumが 5 だとすると、retsunokazuは 5 genten_retsu は 2。
  //genten_retsu = 2は左から数えると、0,1,2,3,4と、丁度真ん中にある
  
  let genten_retsu = Math.floor(retsunokazu/2);
  let genten_gyou = Math.floor(gyounokazu/2);
  
  //分割
  //html上の分割数を入力するinputエレメントを格納する変数
  let division;
  //上の変数に格納された文字列を数値に変換したものを格納する変数
  let divNum;
  
  //初期の砂山の高さ
  let initHeight;
  //安定な高さの上限
  let sup_stableHeight =3;
  
  
  //________わざわざwindow.onloadで書く意味がわからない
  
  //_________________DOMエレメント関連_________________________
      //canvasの準備
          canvas = document.getElementById('asm_org');
          ctx = canvas.getContext('2d');
          ctx.save();//これは必要？
  
      //まず、背景を黒で塗りつぶす。のちにこれが罫線になる。
          ctx.fillStyle = 'black';
          ctx.fillRect(0,0, canvas.width, canvas.height);
  
      //次に、マス目作るために、cellSize、canvasサイズ、divNumを用意。divNumを決めて(or フォームから拾う)、それでcanvasサイズを割ってcellSizeを出す。
      //canvas.widthをdivNumで必ず割り切れるように工夫しないと、罫線が薄れる現象が起こる
          division = document.getElementById('division');
          divNum = Number(document.getElementById('division').value);
          cellSize = canvas.width / divNum;
  
  //_________砂山配置のサイズを決める因子_____________
      //retsunokazuとgyounokazuにdivNumをぶち込む。
          retsunokazu = divNum;
          gyounokazu = divNum;
          genten_retsu = Math.floor(retsunokazu/2);
          genten_gyou = Math.floor(gyounokazu/2);
  
          //砂山配置(各セルの高さ情報)を格納する二次元配列
          let heights = [];
  
          //砂山配置の初期化
          //たぶん、引数なしにした方がよかった…。
          reset_heights();
  
          //初期の砂山配置をセット
          initHeight = Number(document.getElementById('initHeight').value); //全セルの砂山の最初の高さ
          //初期砂山配置をセットするためだけの関数。汎用性低いが便宜上作った。二度と使わない
          set_initHeight();
          drawAllCells(heights);
  
  
      //安定配置のみ追跡モード
          //動的シミュレーション
          let timer_stableConfiguration_tracking;
  
          document.getElementById("start_stableConfiguration_tracking").addEventListener("click", e => {
              start_sc_track();
              division.disabled = true;
              document.getElementById('initHeight').disabled = true;
  
              function start_sc_track(){
                heights = oneStep_for_stableConfigurationTracking(heights);
                drawAllCells(heights);
                timer_stableConfiguration_tracking = setTimeout(start_sc_track, 1);
              }
  
            },false);
  
          document.getElementById("stop_stableConfiguration_tracking").addEventListener("click", e => {
            clearTimeout(timer_stableConfiguration_tracking)
          }, false);
  
      //一個だけ進めるボタン
          document.getElementById("justOne_stableConfiguration_tracking").addEventListener("click", e => {
            heights = oneStep_for_stableConfigurationTracking(heights);
            drawAllCells(heights);
  
            division.disabled = true;
            document.getElementById('initHeight').disabled = true;
          }, false);
  
      //任意の数進めるボタン
      document.getElementById("Nstep_stableConfiguration_tracking").addEventListener("click", e => {
        const N = Number(document.getElementById("howManyStepsForStable").value);
        for(let i=0;i<N;i++){
          heights = oneStep_for_stableConfigurationTracking(heights);
        }
        drawAllCells(heights);
  
        division.disabled = true;
        document.getElementById('initHeight').disabled = true;
      }, false);
  
  
    //雪崩も追跡するtime-trackingモード
    //動的シミュレーション
    let timer_time_tracking;
  
    document.getElementById("start_time_tracking").addEventListener("click", e => {
  
        division.disabled = true;
        document.getElementById('initHeight').disabled = true;
  
        start_time_track();
  
        function start_time_track(){
                heights = oneStep_for_timeTracking(heights);
                drawAllCells(heights);
                timer_time_tracking = setTimeout(start_time_track, 1);
        }
  
      },false);
  
  
    document.getElementById("stop_time_tracking").addEventListener("click", e => {
      clearTimeout(timer_time_tracking)
    }, false);
  
  //一個だけ進めるボタン
    document.getElementById("justOne_time_tracking").addEventListener("click", e => {
        division.disabled = true;
        document.getElementById('initHeight').disabled = true;
  
        heights = oneStep_for_timeTracking(heights);
        drawAllCells(heights);
  
    }, false);
  
    //砂山をクリア
    document.getElementById("clearSandpile").addEventListener("click", e => {
      clearTimeout(timer_stableConfiguration_tracking)
      clearTimeout(timer_time_tracking)
  
      reset_heights();
      set_initHeight();
      drawAllCells(heights);
  
      division.disabled = false;
      document.getElementById('initHeight').disabled = false;
      //データをリセット
      time = 0
      document.getElementById("time").value = time;
      step_of_stableConfiguration = 0;
      document.getElementById("step_of_stableConfiguration").value = step_of_stableConfiguration;
      interval_avalanche = 0;
      document.getElementById("interval_avalanche").value = interval_avalanche;
  
      },false);
  
      //canvasの分割数を変えた時の処理。
          division.onchange = function(){
            division_reset();
            heights = [];
            reset_heights();
            set_initHeight();
  
            ctx.fillStyle = 'black';
            ctx.fillRect(0,0, canvas.width, canvas.height);
            drawAllCells(heights);
          }
  
          document.getElementById('initHeight').onchange = function(){
          initHeight = Number(document.getElementById('initHeight').value);
          set_initHeight();
          drawAllCells(heights);
          }
          
          document.getElementById("capture").addEventListener("click", e => {
            haha();
            },false);
  
  
  
  
  
  //_______初期の砂山配置をセットする用の関数達_________
  //window.onloadの外に出したらバグった…（なぜ？）
  
          //砂山配置の配列の初期化
          function reset_heights(){
            for(col = 0;col < retsunokazu;col++){
              heights[col] = [];
              for(row = 0;row < gyounokazu;row++){
              heights[col][row] = 0;
              }
            }
          }
  
          //砂山の初期配置(全セル高さが同じ配置)をセット
          function set_initHeight(){
          //初期の砂山高さ
              initHeight = Number(document.getElementById('initHeight').value); //全セルの砂山の最初の高さ
          //初期砂山配置を装填
              for(col = 0;col < retsunokazu;col++){
                for(row = 0;row < gyounokazu;row++){
                heights[col][row] = initHeight;
                }
              }
          }
  
          //セルの分割数が変更された時のリセット(htmlの分割数のオプションが変更された時に使う)
          function division_reset(){
          divNum = Number(division.value);
          retsunokazu = divNum;
          gyounokazu = divNum;
          genten_retsu = Math.floor(retsunokazu/2);
          genten_gyou = Math.floor(gyounokazu/2);
          cellSize = canvas.width / divNum;
          }
  
  
  
  
  
  //__________砂山模型実行のための関数たち
  
  //______________________stableConfigurationTracking, timeTracking共通の関数たち_____________________________
  //砂山配置heightsの中に不安定セルが1つでもあれば、falseを、無ければtrueを返す
  function check_unstableCell(h){
  
  //バックアップキー: benty
    //不安定セルを検索し、一個でもあれば検索を終了してfalseを返す。
    for(i= 0;i<retsunokazu;i++){
      if(h[i].some(v => v > sup_stableHeight)) return false;
    }
    //一個も無かった場合はtrueを返す
    return true;
  
  /*
  //バックアップキー:brian
    let tfbox = [];
    for(i= 0;i<retsunokazu;i++){
      //i行目に不安定が1つもなければ、true
      tfbox[i] = h[i].every(value => value <= sup_stableHeight)
    }
  
    //product:フラグ。セル全体に一個も不安定が無ければTrue 一個でもあればFalse.
    let product = 1;
    for(i = 0; i<retsunokazu;i++){
      product = product * tfbox[i]
    }
  
    return product;
  */
  }
  
  
  
  //_______stableConfigurationTracking用の関数群__________
  
    //砂山模型を1ステップ実行 = 1個分次の安定配置を返す。安定配置ごとの砂山状態を追跡するためのアルゴリズム。(stable-configuration-tracking)
  function oneStep_for_stableConfigurationTracking(h){
  
  //バックアップキー: Trump
          //問答無用で粒子を1個積む。
          h[genten_retsu][genten_gyou] = h[genten_retsu][genten_gyou] +1;
          //
          interval_avalanche = 0;
  
          time += 1
          document.getElementById("time").value = time;
  
  
        //その結果配置が不安定になった場合は、雪崩発生。
        if(!check_unstableCell(h))  h = avalanche(h);
  
  
        step_of_stableConfiguration += 1;
        document.getElementById("step_of_stableConfiguration").value = step_of_stableConfiguration;
  
        return h;
  /*
  //バックアップラベル:alice
            //時刻を1進める。
            h = oneStep_for_timeTracking(h);
            //time += 1; //不要。oneStepの関数の中に既にある
  
            //あるなら、雪崩を起こす。無いなら何もしない。
            if(!check_unstableCell(h)){
               h = avalanche(h)
             };
  
            return h;
  */
  
  
  /*
  //バックアップラベル:john
            // 原点に粒子を1個積む（積むセルと個数は書き換え可能）
            h[genten_retsu][genten_gyou] = h[genten_retsu][genten_gyou] +1;
            //雪崩。
            h = avalanche(h)
  
             return h;
  
  */
  }
    //雪崩の結果の砂山情報を返す。雪崩が起きなければ何もしない。
    function avalanche(h){
  
    //バックアップラベル:alice
  
          //不安定セルが1つでもあれば、再度トップルする。
          while(!check_unstableCell(h)){
            //toppling_just_firstを使う必要があるが、1つだけトップルしては一回一回返すやり方なので、演算効率は悪そう。
            toppling_just_first(h);
            //時刻を1進める
            time += 1;
            //雪崩継続時間が1進む
            interval_avalanche += 1;
          }
          document.getElementById("time").value = time;
          document.getElementById("interval_avalanche").value = interval_avalanche;
          interval_avalanche = 0;
  
          return h;
  /*
  //バックアップラベル:john
  
      //不安定なセルが1つでもある→ flg_avalanche = false,一つもない→true
      flg_avalanche = check_unstableCell(h);
  
      //雪崩。flg_avalanche = false ならば実行。
      while(!flg_avalanche){
            //セル全体を左上からトップリングして一周する
            for (col = 0; col<retsunokazu;col++) {
               for (row= 0;row<gyounokazu;row++) {
                  h[col][row] = toppling(h,col,row);
               };
             };
      };
  
      return h;
  */
    }
  
  //渡された砂山配置hのcol:x,row:yが不安定ならtoppleする関数。
  //安定なら何もしないで返す。
    //toppling_just_firstと違って、雪崩の過程がはちゃめちゃで、時刻ごとの細かい雪崩の観測には使えない。
    //もしかしたらリファクタリングで消えるかも。
    function toppling(h,x,y){
              if(h[x][y] > sup_stableHeight){
  
                     //考えている格子の外部に落ちたら消え去る、とする。
                     //考えている格子の外側の格子については、オブジェクトとして宣言されていないので、以下のように回避する。
  
                     if( !(typeof h[x - 1] === "undefined") ) h[x - 1][y] += (h[x][y] - (h[x][y] % 4))/4;
                     if( !(typeof h[x + 1] === "undefined") ) h[x + 1][y] += (h[x][y] - (h[x][y] % 4))/4;
                     if( !(typeof h[x][y - 1] === "undefined") ) h[x][y - 1] += (h[x][y] - (h[x][y] % 4))/4;
                     if( !(typeof h[x][y + 1] === "undefined") ) h[x][y + 1] += (h[x][y] - (h[x][y] % 4))/4;
                  //取り去る
                    h[x][y] = h[x][y] % 4;
  
              };
              return h[x][y];
    }
  
  //____________________timeTracking用の関数たち___________________
    //砂山模型を1時刻進める。1時刻分次の配置を返す。時刻ごとの砂山状態を追跡するためのアルゴリズム。(time-tracking)
    function oneStep_for_timeTracking(h){
  
      time += 1
      document.getElementById("time").value = time;
  
      if(check_unstableCell(h)){
        //前回の配置が安定な場合
        // 粒子を1個積む。
        h[genten_retsu][genten_gyou] = h[genten_retsu][genten_gyou] +1;
        //
        interval_avalanche = 0;
        //ステップを1進める
        step_of_stableConfiguration += 1;
        document.getElementById("step_of_stableConfiguration").value = step_of_stableConfiguration;
  
      }else{
        //前回の配置が不安定な場合
        //粒子をつまないで、一回だけトップリング(雪崩ではなくトップリングであることに注意)
        h = toppling_just_first(h);
        //雪崩継続時間の追加
        interval_avalanche += 1;
        document.getElementById("interval_avalanche").value = interval_avalanche;
  
      }
  
      return h;
    }
  
    //渡された砂山配置を逆N字向きの順番に読み取り、一番最初に見つけた不安定セルをtoppleして、その結果得られた砂山配置を返す。
    function toppling_just_first(h){
  
      dasshutsu :
      for (col = 0; col<retsunokazu;col++) {
         for (row= 0;row<gyounokazu;row++) {
           if(h[col][row] > sup_stableHeight){
  
                    //考えている格子の外部に落ちたら消え去る、とする。
                    //考えている格子の外側の格子については、オブジェクトとして宣言されていないので、以下のように回避する。
  
                    if( !(typeof h[col - 1] === "undefined") ) h[col - 1][row] += (h[col][row] - (h[col][row] % 4))/4;
                    if( !(typeof h[col + 1] === "undefined") ) h[col + 1][row] += (h[col][row] - (h[col][row] % 4))/4;
                    if( !(typeof h[col][row - 1] === "undefined") ) h[col][row - 1] += (h[col][row] - (h[col][row] % 4))/4;
                    if( !(typeof h[col][row + 1] === "undefined") ) h[col][row + 1] += (h[col][row] - (h[col][row] % 4))/4;
                 //取り去る
                    h[col][row] = h[col][row] % 4;
  
                        break dasshutsu;
            };
         };
       };
       return h;
    }
  
  
  
  
  //_________描画用の関数たち_____________
  
   // 全てのセルを塗る
   function drawAllCells(h){
       for(col=0;col<retsunokazu;col++){
           for(row=0;row<gyounokazu;row++){
               drawCell(h,col, row);
           }
       }
   }
  
   // 各セルを塗る
   function drawCell(h,x, y){
       var style = colorCode(h[x][y]);
       ctx.fillStyle = style;
       ctx.fillRect(x * cellSize, y * cellSize,
           cellSize - 1, cellSize - 1);
   }
  
  // カラーコードの対応
  function colorCode(takasa){
     let color;
     switch(takasa) {
                case 0:
             color = "white";
                break;
                case 1:
             color = "gray";
                break;
                case 2:
             color = "red";
                break;
                case 3:
             color = "blue";
                break;
                default:
             color = "black";
              };
     return color;
  }
  

}


