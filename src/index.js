import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
}
  
class Board extends React.Component {
    renderSquare(i) {
      return (
        <Square
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
        />
        );
    }   
  
    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null)
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            pickupSquare: -1,   // -1 if there is no square selected
                                // or square id if square is selected for grain remove
            centerPlayed: false,
            centerX: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares)) {
            return;
        }
        if (this.state.centerPlayed && ((this.state.xIsNext && this.state.centerX) || (!this.state.xIsNext && !this.state.centerX))) {
            if(this.state.pickupSquare === -1) {    // if no square has been picked
                if((squares[i] === "X" && this.state.xIsNext) || (squares[i] === "O" && !this.state.xIsNext)) {
                    this.setState({
                        pickupSquare: i,
                    });
                }
            }
            // if picked
            else {
                if(checkAdjacent(this.state.pickupSquare, i)) {
                    var temp = Array(9).fill(null);
                    for(var x = 0; x < squares.length; x++) {
                        temp[x] = squares[x];
                    }
                    temp[i] = this.state.xIsNext ? "X" : "O";
                    temp[this.state.pickupSquare] = null;
                    if(calculateWinner(temp) || this.state.pickupSquare === 4) {
                        squares[i] = this.state.xIsNext ? "X" : "O";
                        squares[this.state.pickupSquare] = null;
                        this.setState({
                            history: history.concat([
                                {
                                    squares: squares
                                }
                            ]),
                            stepNumber: history.length,
                            xIsNext: !this.state.xIsNext,
                            pickupSquare: -1,
                            centerPlayed: false,
                        });
                    }
                    else {
                        this.setState({
                            pickupSquare: -1,
                        })
                    }
                }
            }
        }
        else {
            if (this.state.stepNumber < 6) {
                if (!squares[i]) {
                    squares[i] = this.state.xIsNext ? "X" : "O";
                    this.setState({
                        history: history.concat([
                        {
                            squares: squares
                        }
                        ]),
                        stepNumber: history.length,
                        xIsNext: !this.state.xIsNext,
                    });
                }
            }
            else {  // if more than six steps
                // if not picked yet
                if(this.state.pickupSquare === -1) {
                    if((squares[i] === "X" && this.state.xIsNext) || (squares[i] === "O" && !this.state.xIsNext)) {
                        this.setState({
                            pickupSquare: i,
                        });
                    }
                }
                // if picked
                else {
                    if(checkAdjacent(this.state.pickupSquare, i)) {
                        squares[i] = this.state.xIsNext ? "X" : "O";
                        squares[this.state.pickupSquare] = null;
                        this.setState({
                            history: history.concat([
                                {
                                    squares: squares
                                }
                            ]),
                            stepNumber: history.length,
                            centerX: i === 4 ? this.state.xIsNext : this.state.centerX,
                            xIsNext: !this.state.xIsNext,
                            pickupSquare: -1,
                            centerPlayed: i === 4 ? true : this.state.centerPlayed,
                        });
                    }
                }
            }
        }
    }
  
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }
  
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
  
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });
  
        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        } 
  
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
            <div className="game-info">
            <div>{status}</div>
                <ol>{moves}</ol>
            </div>
            </div>
        );
    }
}
  
// ========================================
  
ReactDOM.render(<Game />, document.getElementById("root"));
  
function checkAdjacent(pickUp, placeDown) {
    const adjacent = [
        [1, 3, 4],
        [0, 2, 3, 4, 5],
        [1, 4, 5],
        [0, 1, 4, 6, 7],
        [0, 1, 2, 3, 5, 6, 7, 8],
        [1, 2, 4, 7, 8],
        [3, 4, 7],
        [3, 4, 5, 6, 8],
        [4, 5, 7] 
    ];
    for(let i = 0; i < adjacent[pickUp].length; i++) {
        if (adjacent[pickUp][i] === placeDown) {
            return true;
        }
    }
    return false;
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}