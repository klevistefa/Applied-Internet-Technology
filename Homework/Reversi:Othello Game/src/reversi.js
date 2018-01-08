//Author: Klevis Tefa
// reversi.js
const rev = {
  repeat: function(value,n){
    const array = new Array(n);
    for (let i=0; i < n; i++){
      array[i] = value;
    }
    return array;
  },

  generateBoard: function(rows, columns, initialCellValue = " "){
    return rev.repeat(initialCellValue, rows*columns);
  },

  rowColToIndex: function(board, rowNumber, columnNumber){
    return rowNumber*Math.sqrt(board.length) + columnNumber;
  },

  indexToRowCol: function(board, i){
    const rowNumber = Math.floor(i/Math.sqrt(board.length));
    const columnNumber = i % Math.sqrt(board.length);
    return {"row": rowNumber, "col": columnNumber};
  },

  setBoardCell: function(board, letter, row, col){
    const updatedBoard = board.slice();
    updatedBoard[row*Math.sqrt(board.length) + col] = letter;
    return updatedBoard;
  },

  algebraicToRowCol: function(algebraicNotation){
    const col = algebraicNotation.charAt(0);
    const row = algebraicNotation.substring(1);

    if (algebraicNotation.length < 2 || row.indexOf(" ") > -1 || isNaN(row)){ return undefined; }
    const rowNumber = parseInt(row) - 1;
    /* Based on ASCII notation where A = 65, B = 66 and so on. By substracting 65 you get 0 from A, 1 from B and so on. */
    const colNumber = col.charCodeAt() - 65;

    return {"row": rowNumber, "col": colNumber};
  },

  placeLetters: function(board, letter, ...algebraicNotation){
    let newBoard = board.slice();
    for (let i=0; i < algebraicNotation.length; i++){
      const rowCol = rev.algebraicToRowCol(algebraicNotation[i]);

      newBoard = rev.setBoardCell(newBoard, letter, rowCol["row"], rowCol["col"]);
    }
    return newBoard;
  },

  boardToString: function(board){
    let charCode = 65;
    let boardString = "";
    let grids = "";
    const boardSize = Math.sqrt(board.length);
    for (let i = 0; i <= boardSize; i++){
      if (i === 0){
        boardString += "   ";
      } else {
        boardString += (" " + i + " ");
      }
      grids += "   ";
      for (let j = 0; j < boardSize; j++){
        if (i === 0){
          boardString += "  " + String.fromCodePoint(charCode) + " ";
          charCode ++;
        } else {
          boardString += "| " + board[rev.rowColToIndex(board, i-1, j)] + " ";
        }
        grids += "+---";
        if (j === boardSize-1){
          if (i !== 0){
            boardString += "|\n";
          } else {
            boardString += " \n";
          }
          grids += "+\n";
        }
      }
      boardString += grids;
      grids = "";
    }
    return boardString;
  },

  isBoardFull: function(board){
    for (let i = 0; i < board.length; i++){
      if (board[i] === " "){return false;}
    }
    return true;
  },

  flip: function(board, row, col){
    const index = rev.rowColToIndex(board, row, col);
    if (board[index] === "X"){
      board[index] = "O";
    } else if (board[index] === "O"){
      board[index] = "X";
    }
    return board;
  },

  flipCells: function(board, cellsToFlip){
    for (let i = 0; i < cellsToFlip.length; i++){
      for (let j = 0; j < cellsToFlip[i].length; j++){
        board = rev.flip(board, cellsToFlip[i][j][0], cellsToFlip[i][j][1]);
      }
    }
    return board;
  },

  getCellsToFlip: function(board, lastRow, lastCol){
    const cellsToFlip = [];
    const lastIndex = rev.rowColToIndex(board, lastRow, lastCol); //the index of the last move on board
    const boardSize = Math.sqrt(board.length);

    if (lastCol !== 0 && board[rev.rowColToIndex(board, lastRow, lastCol - 1)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow, lastCol - 1)] !== " "){//check the left cell

      let potentialCells = []; //create a group of potential cells to be flipped

      if (lastCol - 1 !== 0){
        potentialCells.push([lastRow, lastCol-1]); //adding the [row, col]
      }

      //Going through each cell on the left
      for (let i = lastCol - 2; i >= 0; i--){
        const index = rev.rowColToIndex(board, lastRow, i);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([lastRow, i]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === 0){
          if (board[rev.rowColToIndex(board, lastRow, 0)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }

    }
    if (lastCol !== boardSize - 1 && board[rev.rowColToIndex(board, lastRow, lastCol + 1)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow, lastCol + 1)] !== " "){//check the right cell

      let potentialCells = []; //create a group of potential cells to be flipped

      if (lastCol + 1 !== boardSize-1){
        potentialCells.push([lastRow, lastCol+1]); //adding the [row, col]
      }

      //Going through each cell on the right
      for (let i = lastCol + 2; i < boardSize; i++){
        const index = rev.rowColToIndex(board, lastRow, i);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([lastRow, i]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === boardSize - 1){
          if (board[rev.rowColToIndex(board, lastRow, boardSize-1)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }

    }
    if (lastRow !== 0 && board[rev.rowColToIndex(board, lastRow-1, lastCol)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow-1, lastCol)] !== " "){//check the up cells

      let potentialCells = []; //create a group of potential cells to be flipped

      if (lastRow-1 !== 0){
        potentialCells.push([lastRow-1, lastCol]); //adding the [row, col]
      }

      //Going through each cell on the up direction
      for (let i = lastRow - 2; i >= 0; i--){
        const index = rev.rowColToIndex(board, i, lastCol);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([i, lastCol]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === 0){
          if (board[rev.rowColToIndex(board, 0, lastCol)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }
    }

    if (lastRow !== boardSize - 1 && board[rev.rowColToIndex(board, lastRow+1, lastCol)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow+1, lastCol)] !== " "){//check the down cells
      let potentialCells = []; //create a group of potential cells to be flipped

      if (lastRow + 1 !== boardSize-1){
        potentialCells.push([lastRow+1, lastCol]); //adding the [row, col]
      }

      //Going through each cell on the down direction
      for (let i = lastRow + 2; i < boardSize; i++){
        const index = rev.rowColToIndex(board, i, lastCol);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([i, lastCol]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === boardSize-1){
          if (board[rev.rowColToIndex(board, boardSize-1, lastCol)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }
    }

    if ((lastRow !== 0 && lastCol !== 0) && board[rev.rowColToIndex(board, lastRow-1, lastCol-1)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow-1, lastCol-1)] !== " "){//check upper left diagonal cells
      let potentialCells = []; //create a group of potential cells to be flipped


      let maxSteps = lastRow; //maximum amount of cells in the upper left diagonal
      if (lastCol < maxSteps){maxSteps = lastCol;}

      if (maxSteps > 1){
        potentialCells.push([lastRow-1, lastCol-1]); //adding the [row, col]
      }

      //Going through each cell in the upper left diagonal
      for (let i = 2; i <= maxSteps; i++){
        const index = rev.rowColToIndex(board, lastRow-i, lastCol-i);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([lastRow-i, lastCol-i]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === maxSteps){
          if (board[rev.rowColToIndex(board, lastRow-maxSteps, lastCol-maxSteps)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }
    }

    if ((lastRow !== 0 && lastCol !== boardSize-1) && board[rev.rowColToIndex(board, lastRow-1, lastCol+1)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow-1, lastCol+1)] !== " "){//check upper right diagonal cells

      let potentialCells = []; //create a group of potential cells to be flipped

      let maxSteps = boardSize - lastCol - 1; //maximum amount of cells in the upper right diagonal
      if (lastRow < maxSteps){maxSteps = lastRow;}

      if (maxSteps > 1){
        potentialCells.push([lastRow-1, lastCol+1]); //adding the [row, col]
      }

      //Going through each cell in the upper right diagonal
      for (let i = 2; i <= maxSteps; i++){
        const index = rev.rowColToIndex(board, lastRow-i, lastCol+i);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([lastRow-i, lastCol+i]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if(i === maxSteps){
          if (board[rev.rowColToIndex(board, lastRow-maxSteps, lastCol+maxSteps)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }
    }

    if ((lastRow !== boardSize-1 && lastCol !== 0) && board[rev.rowColToIndex(board, lastRow+1, lastCol-1)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow+1, lastCol-1)] !== " "){//check lower left diagonal cells

      let potentialCells = []; //create a group of potential cells to be flipped


      let maxSteps = boardSize - lastRow - 1; //maximum amount of cells in the lower left diagonal
      if (lastCol < maxSteps){maxSteps = lastCol;}

      if (maxSteps > 1){
        potentialCells.push([lastRow+1, lastCol-1]); //adding the [row, col]
      }

      //Going through each cell in the lower left diagonal
      for (let i = 2; i <= maxSteps; i++){
        const index = rev.rowColToIndex(board, lastRow+i, lastCol-i);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([lastRow+i, lastCol-i]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === maxSteps){
          if (board[rev.rowColToIndex(board, lastRow+maxSteps, lastCol-maxSteps)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }

      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }
    }

    if ((lastRow !== boardSize-1 && lastCol !== boardSize-1) && board[rev.rowColToIndex(board, lastRow+1, lastCol+1)] !== board[lastIndex] &&
        board[rev.rowColToIndex(board, lastRow+1, lastCol+1)] !== " "){//check lower right diagonal cells

      let potentialCells = []; //create a group of potential cells to be flipped

      let maxSteps = boardSize - lastRow; //maximum amount of cells in the lower right diagonal
      if (boardSize - lastCol < maxSteps){maxSteps = boardSize - lastCol;}

      if (maxSteps > 1){
        potentialCells.push([lastRow+1, lastCol+1]); //adding the [row, col]
      }

      //Going through each cell in the lower right diagonal
      for (let i = 2; i <= maxSteps; i++){
        const index = rev.rowColToIndex(board, lastRow+i, lastCol+i);
        if (board[index] !== " " && board[index] !== board[lastIndex]){
          potentialCells.push([lastRow+i, lastCol+i]);
        }
        else if (board[index] === board[lastIndex]){
          break;
        }
        if (board[index] === " "){
          potentialCells = [];
          break;
        }
        if (i === maxSteps){
          if (board[rev.rowColToIndex(board, lastRow+maxSteps-1, lastCol+maxSteps-1)] !== board[lastIndex]){
            potentialCells = []; //empty the array since the end of board is reached and the potential cells cannot be flipped
          }
        }
      }
      if (potentialCells.length !== 0){
        cellsToFlip.push(potentialCells);
      }
    }
    return cellsToFlip;
  },

  isValidMove: function(board, letter, row, col){
    const index = rev.rowColToIndex(board, row, col);
    const boardCopy = board.slice();
    boardCopy[index] = letter;
    if (index >= board.length){ //out of boundary
      return false;
    }
    if (board[index] !== " "){ //targeting an occupied cell
      return false;
    }

    if (rev.getCellsToFlip(boardCopy, row, col).length === 0){//check if the cells to flip array with this move is empty
      return false;
    }
    return true;
  },

  isValidMoveAlgebraicNotation: function(board, letter, algebraicNotation){
    const rowCol = rev.algebraicToRowCol(algebraicNotation);
    if (rowCol !== undefined){
      const row = rowCol["row"];
      const col = rowCol["col"];
      return rev.isValidMove(board, letter, row, col);
    } else {
      return false;
    }
  },

  getLetterCounts: function(board){
    let Xcount = 0;
    let Ocount = 0;

    for (let i = 0; i < board.length; i++){
      if (board[i] === "X"){Xcount++;}
      if (board[i] === "O"){Ocount++;}
    }
    return {X: Xcount, O: Ocount};
  },

  getValidMoves: function(board, letter){
    const validMoves = [];
    for (let i = 0; i < board.length; i++){
      const rowCol = rev.indexToRowCol(board, i);
      if (rev.isValidMove(board, letter, rowCol["row"], rowCol["col"])){
        validMoves.push([rowCol["row"], rowCol["col"]]);
      }
    }
    return validMoves;
  }
};

module.exports = rev;
