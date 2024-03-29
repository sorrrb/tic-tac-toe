// Module - Represents the full playing board for a Tic-Tac-Toe game
const gameboard = (function () {
  const cols = 3;
  const rows = 3;
  const board = [];

  /* 2D Array
  [ [0, 0, 0], 
    [0, 0, 0],
    [0, 0, 0] ]
  - row 0 represents top row
  - col 0 represents left-most column  
  */
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      board[i].push(Square());
    }
  }

  const getBoard = () => board;

  const printBoard = () => {
    const consoleBoard = board.map((row) => row.map((square) => square.getToken())); // Loop through rows, then columns to find value of each square
    console.log(consoleBoard);
  }

  const takeSquare = (row, column, token) => {
    if (board[row][column].getToken()) return;
    board[row][column].addToken(token);
  }

  return { getBoard, printBoard, takeSquare };
})();





/* Factory - Represents an individual square on a Tic-Tac-Toe board
- value prop represents status of game square, holding 1 of 3 number values:
- 0 [represents an empty square]
- 1 [represents a square occupied by Player One's token]
- 2 [represents a square occupied by Player Two's token] */
function Square() {
  let value = 0;

  const getToken = () => value;

  const addToken = token => {
    value = (token === 1 ? 'X' : 'O');
  };

  return { getToken, addToken };
}





// Factory - Represents the logic controller for a game of Tic-Tac-Toe, handling game state, flow and win logic
function GameController() {
  const board = gameboard;
  const playerOneName = 'Player One';
  const playerTwoName = 'Player Two';
  const players = [
    {
      name: playerOneName,
      token: 1
    },
    {
      name: playerTwoName,
      token: 2
    }
  ];

  const setPlayerName = (player, newName) => {
    const checkPlayer = (player === 0 ? players[0] : players[1]);
    checkPlayer.name = newName;
  }

  let winner = null; // Set default winner to null
  let isGameOver = false; // Set default game state as active

  const checkGameOver = () => isGameOver;

  const setWinner = (player = getActivePlayer().name) => {
    isGameOver = true;
    winner = (player === null ? null : player);
  }

  const getWinner = () => winner;

  let activePlayer = players[0]; // Set default active player to P1

  const getActivePlayer = () => activePlayer;

  const switchActivePlayer = () => {
    activePlayer = (activePlayer === players[0] ? players[1] : players[0]);
  };

  const playRound = (row, column) => {
    board.takeSquare(row, column, getActivePlayer().token);

    const checkEnd = (function () {
      const boardState = board.getBoard();

      // Helper function to check given 3 element flat object array to see if all object's (square's) token value is equal
      const checkAllEqual = testArr => {
        const emptySquares = testArr.filter((square) => square.getToken() === 0);
        if (emptySquares.length > 0) return false; // Check if a square in a given 3x1 line is empty

        return (testArr.every((square) => square.getToken() === testArr[0].getToken() ? true : false)); // https://dev.to/rajnishkatharotiya/function-to-check-if-all-records-are-equal-in-array-javascript-3mo3#:~:text=Javascript%20Useful%20Snippets%20%E2%80%94%20allEqual(),allEqual%20%3D%20arr%20%3D%3E%20arr.
      };

      // Helper function to check given 9 element flat object array for 1st/5th/9th or 3rd/5th/7th element equality
      const checkNthEquality = testArr => {
        const middleSquare = testArr[4];
        let foundEqual = false;
        if (middleSquare.getToken() === 0) foundEqual = false; // Assigns false if middle square is empty

        const checkWinOne = checkAllEqual([testArr[0], middleSquare, testArr[8]]);
        const checkWinTwo = checkAllEqual([testArr[2], middleSquare, testArr[6]]);
        return (checkWinOne || checkWinTwo ? true : false);
      }

      // Check board for horizontal wins
      const checkRow = (function () {
        const findWin = boardState.filter((row) => checkAllEqual(row));
        if (findWin.length > 0) setWinner();
      })();

      // Check board for vertical wins
      const checkCol = (function () {
        const matrixLength = boardState.length;
        const reformatBoard = [];

        for (let j = 0; j < matrixLength; j++) { // Transposes dimensions of 2D array for helper function --- https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
          reformatBoard[j] = Array(matrixLength);
          for (let i = 0; i < matrixLength; i++) {
            reformatBoard[j][i] = boardState[i][j];
          }
        }

        const findWin = reformatBoard.filter((column) => checkAllEqual(column));
        if (findWin.length > 0) setWinner();
      })();

      // Check board for diagonal wins
      const checkDiag = (function () {
        const flatBoard = boardState.flat();
        const foundWin = checkNthEquality(flatBoard); 
        if (foundWin) setWinner();
      })();

      // Check board for a draw
      const checkDraw = (function () {
        if (isGameOver) return;
        const emptySquares = boardState.flat().filter((square) => square.getToken() === 0);
        if (emptySquares.length === 0) setWinner(null);
      })();
    })();

    if (isGameOver) return;

    switchActivePlayer(); // Switches player
  }

  return { playRound, getActivePlayer, getBoard: board.getBoard, checkGameOver, getWinner, setPlayerName };
};





// Module - represents the display controller for a game of Tic-Tac-Toe
const displayController = (function () {
  const game = GameController(); // Reference to and initialization of GameController
  const displayBoard = document.querySelector('.game');
  const gameMessage = document.querySelector('.turn');
  const restartButton = document.querySelector('.restart');

  const updateScreen = () => {
    displayBoard.textContent = ''; // Reset board

    const board = game.getBoard(); // Grab updated board & player turn
    const turn = game.getActivePlayer().name;
    const end = game.checkGameOver();
    const winner = game.getWinner();
    
    if (end) {
      displayBoard.removeEventListener('click', clickHandler);
      restartButton.style.visibility = '';
      if (winner) gameMessage.textContent = `[${turn} wins!]`;
      else gameMessage.textContent = `[It's a draw!]`;
    }

    board.forEach((row, i) => { // Populate board with squares
      row.forEach((square, j) => {
        const squareButton = document.createElement('button');
        squareButton.classList.add('square');
        squareButton.dataset.rowIndex = i; // Adds dataset attribute to track row of each button
        squareButton.dataset.colIndex = j; // Adds dataset attribute to track column of each button
        squareButton.textContent = (square.getToken() === 0 ? '' : square.getToken());
        displayBoard.appendChild(squareButton);
      })
    });
  }

  function clickHandler(e) {
    const row = e.target.dataset.rowIndex;
    const column = e.target.dataset.colIndex;
    if (!row || !column) return;
    else if (e.target.textContent) return;
    game.playRound(row, column);
    updateScreen();
  }

  function loadHandler(e) {
    switch(e.target.textContent) { // Check textContent of Start button
      case 'START':
        let newPlayerOneName;
        let newPlayerTwoName;
        e.target.style.visibility = 'hidden';
        e.target.textContent = 'PLAY AGAIN?';
        newPlayerOneName = document.querySelector('.one').firstElementChild.value;
        newPlayerTwoName = document.querySelector('.two').firstElementChild.value;
        if (!document.querySelector('.one').firstElementChild.value) newPlayerOneName = 'Player One';
        if (!document.querySelector('.two').firstElementChild.value) newPlayerTwoName = 'Player Two';
        game.setPlayerName(0, newPlayerOneName);
        game.setPlayerName(1, newPlayerTwoName);
        displayBoard.addEventListener('click', clickHandler);
        break;
      default:
        location.replace(location.href);
    }
  }

  const inputFields = document.querySelectorAll('input');
  inputFields.forEach((textbox) => {
    textbox.addEventListener('change', e => {
      e.target.setAttribute('readonly', true);
      e.target.setAttribute('disabled', 'disabled');
      e.target.style.color = 'black';
    });
  });

  restartButton.addEventListener('click', loadHandler);

  updateScreen(); // Initializes display 
})();