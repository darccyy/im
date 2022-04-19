import { Component } from "react";
import { io } from "socket.io-client";

import "./App.scss";

export default class App extends Component {
  state = { username: "unknown", room: "root", log: [] };
  socket = null;

  post(msg) {
    console.log("POST", msg);
    this.socket.emit("msg", this.state.room, {
      username: this.state.username,
      msg,
    });
  }

  componentDidMount() {
    // Setup socket
    this.socket = io.connect("/im");
    this.socket.emit("join", this.state.room);
    this.socket = this.socket.on("connect", function () {
      console.log("! Server connect");
    });
    this.socket.on("disconnect", function () {
      console.warn("! Server disconnect");
    });

    this.socket.on("msg", data => {
      console.log("MSG", data);
      this.setState({ log: [...this.state.log, data] });
    });
  }

  render() {
    return (
      <div className="App">
        <h1>Instant Messenger</h1>

        <input
          type="text"
          placeholder="Username"
          defaultValue={this.state.username}
          onInput={event => this.setState({ username: event.target.value })}
        />

        <input
          type="text"
          placeholder="Room"
          defaultValue={this.state.room}
          onInput={event => this.setState({ room: event.target.value })}
        />

        <h2>
          {this.state.username} - {this.state.room}
        </h2>

        <input
          type="text"
          placeholder="Message"
          autoFocus
          onKeyPress={e => {
            if (e.key === "Enter") {
              this.post(event.target.value);
              event.target.value = "";
            }
          }}
        />

        <ul>
          {this.state.log?.length
            ? this.state.log.reverse().map((item, index) => {
                return (
                  <li key={index}>
                    &lt;{item.username}&gt; {item.msg}
                  </li>
                );
              })
            : "[none]"}
        </ul>
      </div>
    );
  }
}
