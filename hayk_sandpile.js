let kLatticeSize = 100;
let kLatticeHalfSize = 50;

//A vector notation designating the 4 neighborhoods of the cell on which we put the grains.
const kDx = [1,0,-1,0];
const kDy = [0,1,0,-1];

const LCoord = () => {
  return {x:-1,y:-1}
}

/*
MoveStandard_1Step

arguments:
  the number of grains(int) : n, initial height(int): ih, lattice size(int): kLatticeSize, half lattice size(int):kLatticeHalfSize
return: 
  sandpile data(array) :z_lattice
*/
const MoveStandard_1Step = (n,ih,kLatticeSize,kLatticeHalfSize) => {
    let z_lat =  new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(ih));
        // models the standard lattice Z^2
    let v_sites = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(false));
        // vertices of Z^2 which were visited during the process//which means the neighborhood cells onto which the toppled grains fall.
    v_sites[kLatticeHalfSize][kLatticeHalfSize] = true;

    let to_be_moved = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(false));
        // vertices of Z^2 which are already in the walking stack//which means the cell from which a toppling is going to occur.
    let odometer = new Array(kLatticeSize).fill().map(i => new Array(kLatticeSize).fill(0));
        // total number of topplings of a given vertex of Z^2


    let top = -1;
    let walking = new Array(kLatticeSize*kLatticeSize).fill().map(i => LCoord());
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
        if(++z_lat[kLatticeHalfSize][kLatticeHalfSize] >= 4){// one grain out of 'n' grains being put on the origin, and evaluating if the height of the origin is bigger or equal to 4(the upper limit value of height with which the cell stays stable.).
            walking[++top].x = kLatticeHalfSize;
            walking[top].y = kLatticeHalfSize;
        }
        console.log(`i:${i}\n`);

        //avalanche continues until the walking stack is empty
        while(top >= 0){
            n_of_moves += 1;
           console.log(`top=${top}\n`);
           //refresh the maximum time of avalanches
            if(max_of_top < top){
                max_of_top = top;
            }

            //designate the site which topples.
            x = walking[top].x;
            y = walking[top].y;

            z_lat[x][y] = z_lat[x][y] - 4;
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
                console.log(`k=${k}:(lx,ly) = (${lx},${ly})`);
                
                //If the next lattice to visit is out of range of lattice, add new row or column to avoid an error.
                //I don't know whether this is reasonable as an error handling.
                
                if(lx > v_sites.length - 1){
                  v_sites.push(Array(v_sites.length).fill().map(i => false));
                  z_lat.push(Array(z_lat.length).fill().map(i => ih));
                  to_be_moved.push(Array(to_be_moved.length).fill().map(i => false));
                }
                if(lx < 0){
                  lx = 0;
                  v_sites.unshift(Array(v_sites.length).fill().map(i => false));
                  z_lat.unshift(Array(z_lat.length).fill().map(i => ih));
                  to_be_moved.unshift(Array(to_be_moved.length).fill().map(i => false));
                }
                if(ly > v_sites[0].length - 1){
                  for(let elem of v_sites){elem.push(false);}
                  for(let elem of z_lat){elem.push(ih);}
                  for(let elem of to_be_moved){elem.push(false);}
                }
                if(ly < 0){
                  ly = 0;
                  for(let elem of v_sites){elem.unshift(false);}
                  for(let elem of z_lat){elem.unshift(ih);}
                  for(let elem of to_be_moved){elem.unshift(false);}
                }
                //if(lx<0 && ly<0){}

                v_sites[lx][ly] = true;//The falling grain lands on the "true" cell which we designated right above.
                z_lat[lx][ly]++;//The grain has been piled.

                
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

    return z_lat;
}

const capture = (sandpiles)=>{
  console.log(sandpiles);
  let array = [`P3\n${kLatticeSize} ${kLatticeSize}\n255\n`];
  for(let i=0;i<kLatticeSize;i++){
    for(let j=0;j<kLatticeSize;j++){
      let row_data = ``;
      if (sandpiles[i][j] == 1){
        row_data += `255 128 255 `;
      }else if(sandpiles[i][j] == 2){
        row_data += `255 0 0 `;
      }else if(sandpiles[i][j] == 3){
        row_data += `0 128 255 `;//"0 128 255 ";
      }else{
        row_data += `0 0 0 ` //"0 0 0 ";
      }
      array[0] += row_data;
      if(j == kLatticeSize - 1){
        array[0] += `\n`;
      }
    }
  }

  let blob = new Blob(array,{type:"text/plan"});
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ASM.ppm';
  link.click();

}



/* C++のsandpile


	// now running the process until stabilisation

	t2 = clock();

	std::cout<<endl;

	std::cout<<"Maximal number in the stack was "<<max_of_top<<endl;
	std::cout<<"Number of moves in the main loop was "<<n_of_moves<<endl;


	BoxCoord b = TrimmedArray(v_sites, kLatticeSize, kLatticeSize);
	ArrayToCSV(z_lat, v_sites, b.i1, b.i2, b.j1, b.j2, ("Abel" + std::to_string(n) + ".csv").c_str());
	ArrayToPPM(z_lat, v_sites, b.i1, b.i2, b.j1, b.j2, ("Abel" + std::to_string(n) + ".ppm").c_str());

	// clean-ups
	for (int k = 0; k<kLatticeSize; ++k){
		delete[] z_lat[k];
		delete[] v_sites[k];
		delete[] odometer[k];
		delete[] to_be_moved[k];
	}

	delete[] z_lat;
	delete[] v_sites;
	delete[] odometer;
	delete[] to_be_moved;
	delete[] walking;


	return ((double)(t2)-double(t1))*0.001;
}


*/

/*二次元配列のppm化
console.log(sandpiles);
let array = [`P3\n${width} ${height}\n255\n`];
for(let i=0;i<height;i++){
  for(let j=0;j<width;j++){
    let row_data = ``;
    if (sandpiles[i][j] == 1){
      row_data += `255 128 255 `;
    }else if(sandpiles[i][j] == 2){
      row_data += `255 0 0 `;
    }else if(sandpiles[i][j] == 3){
      row_data += `0 128 255 `;//"0 128 255 ";
    }else{
      row_data += `0 0 0 ` //"0 0 0 ";
    }
    array[0] += row_data;
    if(j == width - 1){
      array[0] += `\n`;
    }
  }
}

let blob = new Blob(array,{type:"text/plan"});
let link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = '作ったファイル.ppm';
link.click();
*/
