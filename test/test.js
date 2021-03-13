window.onload = function()
{

const arrayToPPM = (arr,i1,i2,j1,j2)=>{
}

let retsu = 100;
let gyou = 100;
let z_lat = [];
for(let i=0;i<gyou;i++){
  z_lat[i] = [];
  for(let j=0;j<retsu;j++){
    z_lat[i][j] = getRandomIntInclusive(0,3);
    console.log(z_lat[i][j]);
  }
}


//注意: 列 行 の順番
let array = [`P3\n${retsu} ${gyou}\n255\n`];

for(let i=0;i<gyou;i++){
  for(let j=0;j<retsu;j++){
    let row_data = ``;
    if (z_lat[i][j] == 1){
      row_data += `255 128 255 `;
    }else if(z_lat[i][j] == 2){
      row_data += `255 0 0 `;
    }else if(z_lat[i][j] == 3){
      row_data += `0 128 255 `;//"0 128 255 ";
    }else{
      row_data += `0 0 0 ` //"0 0 0 ";
    }
    array[0] += row_data;
    if(j == retsu - 1){
      array[0] += `\n`;
    }
  }
}

let blob = new Blob(array,{type:"text/plan"});
let link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = '作ったファイル.ppm';
link.click();

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}


//console.log(array);




}
