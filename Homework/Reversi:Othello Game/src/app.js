//Author: Klevis Tefa
// app.js

const rev = require('./reversi.js');
const readlineSync = require('readline-sync');
const fs = require('fs');

let board;
let consecutivePasses = 0;
let gameEnded = false;
let currentLetter = "X"; //game starts with X;
let playerLetter;

if (process.argv[2] !== undefined){
  const input = fs.readFileSync(process.argv[2], 'utf8');
  const data = JSON.parse(input);

  board = data.boardPreset.board;
  playerLetter = data.boardPreset.playerLetter;
  const playerMoves = data.scriptedMoves.player;
  const computerMoves = data.scriptedMoves.computer;

  console.log("Computer will make the following moves: " + computerMoves);
  console.log("Player will make the following moves: " + playerMoves);
  console.log("Player is: " + playerLetter +"\n");
  console.log(rev.boardToString(board));
  const currentLetterCount = rev.getLetterCounts(board);
  const currentScoreString = "Score\n====\nX: " + currentLetterCount.X + "\nO: " + currentLetterCount.O + "\n";
  console.log(currentScoreString +"\n"); //display score

  while (!gameEnded && !(playerMoves === undefined || computerMoves === undefined)){
    //player's turn
    if (playerLetter === currentLetter){
      playerMove = playerMoves.shift();
      if (playerMove == undefined){
        console.log("No more scripted moves. Play the game manually! +\n");
        break;
      } else {
        if (rev.isValidMoveAlgebraicNotation(board, currentLetter, playerMove)){

          console.log("Player move to " + playerMove + " is scripted\n");

          const rowColMove = rev.algebraicToRowCol(playerMove);
          const lastRow = rowColMove["row"];
          const lastCol = rowColMove["col"];
          board = rev.setBoardCell(board, currentLetter, lastRow, lastCol);


          const cellsToFlip = rev.getCellsToFlip(board, lastRow, lastCol);
          board = rev.flipCells(board, cellsToFlip);

          const letterCount = rev.getLetterCounts(board);
          const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

          console.log(rev.boardToString(board));//display board
          console.log(scoreString + "\n"); //display score

          let enter = readlineSync.question('Press <ENTER> to continue...');
          while (enter !== ''){
            enter = readlineSync.question('Press <ENTER> to continue...');
          }

        } else {

          console.log("Scripted player move not valid. Take controll for the next move.\n");

          if (rev.getValidMoves(board, currentLetter).length !== 0){ //there are possible valid moves
            consecutivePasses = 0;
            let playerMove = readlineSync.question('What is your move?\n>');

            //Make sure the move is valid
            while (!rev.isValidMoveAlgebraicNotation(board, currentLetter, playerMove)){

              console.log("INVALID MOVE: Your move should:");
              console.log("* be in a format\n* specify an existing empty cell\n* flip at least one of your opponent's pieces\n");

              playerMove = readlineSync.question('Please enter a VALID move:\n>');

            }

            const rowColMove = rev.algebraicToRowCol(playerMove);
            const lastRow = rowColMove["row"];
            const lastCol = rowColMove["col"];
            board = rev.setBoardCell(board, currentLetter, lastRow, lastCol);


            const cellsToFlip = rev.getCellsToFlip(board, lastRow, lastCol);
            board = rev.flipCells(board, cellsToFlip);

            const letterCount = rev.getLetterCounts(board);
            const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

            console.log(rev.boardToString(board));//display board
            console.log(scoreString + "\n"); //display score

            let enter = readlineSync.question('Press <ENTER> to show computer\'s move...');
            while (enter !== ''){
              enter = readlineSync.question('Press <ENTER> to show computer\'s move...');
            }

          } else { //no valid moves for the player
            consecutivePasses++;
            let enter = readlineSync.question('No valid moves for you.\nPress <ENTER> to pass.');
            while (enter !== ''){
              enter = readlineSync.question('No valid moves for you.\nPress <ENTER> to pass.');
            }

            const letterCount = rev.getLetterCounts(board);
            const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

            console.log(scoreString + "\n"); //display score

          }//handling manual player's turn

        }
      }
    }
    //computer's turn
    if (playerLetter !== currentLetter){
      computerMove = computerMoves.shift();
      if (computerMove == undefined){
        console.log("No more scripted moves. Play the game manually! +\n");
        break;
      } else {
        if (rev.isValidMoveAlgebraicNotation(board, currentLetter, computerMove)){
          //scripted computer move

          console.log("Computer move to " + computerMove + " is scripted");

          const rowColMove = rev.algebraicToRowCol(computerMove);
          const lastRow = rowColMove["row"];
          const lastCol = rowColMove["col"];
          board = rev.setBoardCell(board, currentLetter, lastRow, lastCol);


          const cellsToFlip = rev.getCellsToFlip(board, lastRow, lastCol);
          board = rev.flipCells(board, cellsToFlip);

          const letterCount = rev.getLetterCounts(board);
          const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

          console.log(rev.boardToString(board));//display board
          console.log(scoreString + "\n"); //display score

          let enter = readlineSync.question('Press <ENTER> to continue...');
          while (enter !== ''){
            enter = readlineSync.question('Press <ENTER> to continue...');
          }
        } else {
          //computer takes control
          const validMoves = rev.getValidMoves(board, currentLetter);

          if (validMoves.length !== 0){
            consecutivePasses = 0;

            let bestValidMove = validMoves[0];
            let possibleBoard = rev.setBoardCell(board, currentLetter, bestValidMove[0], bestValidMove[1]);
            let possibleCellsToFlip = rev.getCellsToFlip(possibleBoard, bestValidMove[0], bestValidMove[1]);

            //Computer chooses the valid moves that flips most cells.
            //If there are more than one options it choose the first one that it finds.
            for (let i = 1; i < validMoves.length; i++){

              const temp = validMoves[i];
              possibleBoard = rev.setBoardCell(board, currentLetter, temp[0], temp[1]);
              const tempCellsToFlip = rev.getCellsToFlip(possibleBoard, temp[0], temp[1]);

              if (tempCellsToFlip.length > possibleCellsToFlip.length){
                bestValidMove = validMoves[i];
                possibleCellsToFlip = tempCellsToFlip;
              }
            } //after this for-loop the computer has chosen a move

            const lastRow = bestValidMove[0];
            const lastCol = bestValidMove[1];

            board = rev.setBoardCell(board, currentLetter, lastRow, lastCol);
            const cellsToFlip = rev.getCellsToFlip(board, lastRow, lastCol);
            board = rev.flipCells(board, cellsToFlip, lastRow, lastCol);

            const letterCount = rev.getLetterCounts(board);
            const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

            console.log("Computer played at cell " + String.fromCharCode(65 + lastCol) + (lastRow+1).toString());
            console.log(rev.boardToString(board));//display board
            console.log(scoreString + "\n"); //display score

          } else { //no valid moves for the computer
            consecutivePasses++;

            let enter = readlineSync.question('Computer has no valid moves.\nPress <ENTER> to continue.');
            while (enter !== ''){
              enter = readlineSync.question('Computer has no valid moves.\nPress <ENTER> to continue.');
            }

            const letterCount = rev.getLetterCounts(board);
            const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

            console.log(scoreString + "\n"); //display score*/

          } //handle a computer's turn
        }
      }

    }
    if (consecutivePasses === 2 || rev.isBoardFull(board)){
      const letterCount = rev.getLetterCounts(board);
      const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;
      console.log(scoreString + "\n"); //display score

      if (letterCount.X > letterCount.O){
        if (playerLetter === 'X'){
          console.log("Congratulations! You won!");
        } else {
          console.log("Sorry! You lost! Computer won!");
        }
      } else if (letterCount.X < letterCount.O){
        if (playerLetter === 'O'){
          console.log("Congratulations! You won!");
        } else {
          console.log("Sorry! You lost! Computer won!");
        }
      } else {
        console.log("It's a draw!");
      }
      gameEnded = true; //end game
    } else {
      //Switch who moves the next iteration
      if (currentLetter === 'X'){
        currentLetter = 'O';
      } else {
        currentLetter = 'X';
      }

    }
  }
} else {

  let boardSize = readlineSync.question('How wide should the board be? (choose an even number from 4 to 26)\n>');

  while (isNaN(boardSize) || boardSize % 2 !== 0 || !(boardSize >= 4 && boardSize <= 26)){
    boardSize = readlineSync.question('Wrong input! \nHow wide should the board be? (choose an even number from 4 to 26)\n>');
  }

  playerLetter = readlineSync.question("Pick your letter: X (black) or O (white)\n>");

  while (playerLetter !== 'X' && playerLetter !== 'O'){
    playerLetter = readlineSync.question("Wrong input! Please pick a letter between X (black) or O (white)\n>");
  }


  console.log("Player is: " + playerLetter +"\n");

  board = rev.generateBoard(boardSize, boardSize);
  board = rev.setBoardCell(board, 'X', Math.floor(boardSize/2), Math.floor(boardSize/2)-1);
  board = rev.setBoardCell(board, 'X', Math.floor(boardSize/2)-1, Math.floor(boardSize/2));
  board = rev.setBoardCell(board, 'O', Math.floor(boardSize/2), Math.floor(boardSize/2));
  board = rev.setBoardCell(board, 'O', Math.floor(boardSize/2)-1, Math.floor(boardSize/2)-1);



  console.log(rev.boardToString(board));

  //Game started;
 //Game while loop
}

while(!gameEnded){

  if (playerLetter === currentLetter){ //players turn

    if (rev.getValidMoves(board, currentLetter).length !== 0){ //there are possible valid moves
      consecutivePasses = 0;
      let playerMove = readlineSync.question('What is your move?\n>');

      //Make sure the move is valid
      while (!rev.isValidMoveAlgebraicNotation(board, currentLetter, playerMove)){

        console.log("INVALID MOVE: Your move should:");
        console.log("* be in a format\n* specify an existing empty cell\n* flip at least one of your opponent's pieces");

        playerMove = readlineSync.question('Please enter a VALID move:\n>');

      }

      const rowColMove = rev.algebraicToRowCol(playerMove);
      const lastRow = rowColMove["row"];
      const lastCol = rowColMove["col"];
      board = rev.setBoardCell(board, currentLetter, lastRow, lastCol);


      const cellsToFlip = rev.getCellsToFlip(board, lastRow, lastCol);
      board = rev.flipCells(board, cellsToFlip);

      const letterCount = rev.getLetterCounts(board);
      const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

      console.log(rev.boardToString(board));//display board
      console.log(scoreString + "\n"); //display score

      let enter = readlineSync.question('Press <ENTER> to show computer\'s move...');
      while (enter !== ''){
        enter = readlineSync.question('Press <ENTER> to show computer\'s move...');
      }

    } else { //no valid moves for the player
      consecutivePasses++;
      let enter = readlineSync.question('No valid moves for you.\nPress <ENTER> to pass.');
      while (enter !== ''){
        enter = readlineSync.question('No valid moves for you.\nPress <ENTER> to pass.');
      }

      const letterCount = rev.getLetterCounts(board);
      const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

      console.log(scoreString + "\n"); //display score

    }//handling player's turn

  } else { //computers turn

    const validMoves = rev.getValidMoves(board, currentLetter);

    if (validMoves.length !== 0){
      consecutivePasses = 0;

      let bestValidMove = validMoves[0];
      let possibleBoard = rev.setBoardCell(board, currentLetter, bestValidMove[0], bestValidMove[1]);
      let possibleCellsToFlip = rev.getCellsToFlip(possibleBoard, bestValidMove[0], bestValidMove[1]);

      //Computer chooses the valid moves that flips most cells.
      //If there are more than one options it choose the first one that it finds.
      for (let i = 1; i < validMoves.length; i++){

        const temp = validMoves[i];
        possibleBoard = rev.setBoardCell(board, currentLetter, temp[0], temp[1]);
        const tempCellsToFlip = rev.getCellsToFlip(possibleBoard, temp[0], temp[1]);

        if (tempCellsToFlip.length > possibleCellsToFlip.length){
          bestValidMove = validMoves[i];
          possibleCellsToFlip = tempCellsToFlip;
        }
      } //after this for-loop the computer has chosen a move

      const lastRow = bestValidMove[0];
      const lastCol = bestValidMove[1];

      board = rev.setBoardCell(board, currentLetter, lastRow, lastCol);
      const cellsToFlip = rev.getCellsToFlip(board, lastRow, lastCol);
      board = rev.flipCells(board, cellsToFlip, lastRow, lastCol);

      const letterCount = rev.getLetterCounts(board);
      const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

      console.log("Computer played at cell " + String.fromCharCode(65 + lastCol) + (lastRow+1).toString());
      console.log(rev.boardToString(board));//display board
      console.log(scoreString + "\n"); //display score

    } else { //no valid moves for the computer
      consecutivePasses++;

      let enter = readlineSync.question('Computer has no valid moves.\nPress <ENTER> to continue.');
      while (enter !== ''){
        enter = readlineSync.question('Computer has no valid moves.\nPress <ENTER> to continue.');
      }

      const letterCount = rev.getLetterCounts(board);
      const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;

      console.log(scoreString + "\n"); //display score*/

    } //handle a computer's turn


  }//handling player/computer turn

  //Handle a game end scenario
  if (consecutivePasses === 2 || rev.isBoardFull(board)){
    const letterCount = rev.getLetterCounts(board);
    const scoreString = "Score\n====\nX: " + letterCount.X + "\nO: " + letterCount.O;
    console.log(scoreString + "\n"); //display score

    if (letterCount.X > letterCount.O){
      if (playerLetter === 'X'){
        console.log("Congratulations! You won!");
      } else {
        console.log("Sorry! You lost! Computer won!");
      }
    } else if (letterCount.X < letterCount.O){
      if (playerLetter === 'O'){
        console.log("Congratulations! You won!");
      } else {
        console.log("Sorry! You lost! Computer won!");
      }
    } else {
      console.log("It's a draw!");
    }
    gameEnded = true; //end game
  } else {
    //Switch who moves the next iteration
    if (currentLetter === 'X'){
      currentLetter = 'O';
    } else {
      currentLetter = 'X';
    }

  }

}
