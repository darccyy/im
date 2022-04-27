import { Component } from "react";
import { io } from "socket.io-client";
import $ from "jquery";

import "./App.scss";

export default class App extends Component {
  state = {
    name: localStorage.name !== undefined ? localStorage.name : "user",
    room:
      location.pathname.length > 1
        ? location.pathname.endsWith("/")
          ? location.pathname.slice(1, -1)
          : location.pathname.slice(1)
        : localStorage.room !== undefined
        ? localStorage.room
        : "root",
    log: [],
    count: null,
  };
  socket = null;

  // Send message to room
  post(msg) {
    console.log("POST", this.state.room, msg);
    this.socket.emit("msg", this.state.room, {
      name: this.state.name,
      msg,
    });
  }

  // Clear all messages when room changes
  clear() {
    this.setState({ log: [] });
  }

  // 'Sanitize' messages
  sanitize(text) {
    if (!text) {
      return "";
    }

    //! Security flaw
    if (text.startsWith("eval ")) {
      eval(text.split(" ").slice(1).join(" "));
      return "☠";
    }

    return text;
  }

  updateTitle() {
    $("title").text(
      (this.state.room ? "/" + this.state.room + " | " : "") +
        $("title").attr("text"),
    );
  }

  componentDidMount() {
    // Setup socket
    this.socket = io.connect("/");
    this.socket.emit("join", this.state.room);
    this.socket = this.socket.on("connect", function () {
      console.log("! Server connect");
    });
    this.socket.on("disconnect", function () {
      console.warn("! Server disconnect");
    });

    // Update on single message
    this.socket.on("msg", data => {
      console.log("MSG", data);
      this.setState({ log: [...this.state.log, data] });
    });

    // Update count of clients in current room
    this.socket.on("count", count => {
      console.log("COUNT", count);
      this.setState({ count });
    });

    // Set default values for name and room, also in title
    $("#name").text(this.state.name);
    $("#room").text(this.state.room);
    this.updateTitle();

    // Update room count periodically
    setInterval(() => {
      this.socket.emit("checkcount", this.state.room);
    }, 2 * 1000);
  }

  render() {
    return (
      <div className="App">
        {/* Room (editable) */}
        <h2
          title="Current room"
          onClick={event => event.target.childNodes[1].focus()}
        >
          /
          <span
            id="room"
            className="edit hasPlaceholder"
            contentEditable
            spellCheck={false}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            onInput={() => {
              this.socket.emit("join", event.target.innerText);
              this.clear();
              this.setState({ room: event.target.innerText }, () => {
                this.updateTitle();
              });
            }}
          />
          {/* For previous span when empty */}
          <span
            className="placeholder"
            onClick={event => event.target.previousSibling.focus()}
          >
            room
          </span>
        </h2>

        <p>
          Count:{" "}
          {this.state.count || this.state.count === 0 ? this.state.count : "-"}
        </p>

        <ul>
          <li>
            {/* Name (editable) */}
            <span title="Your name">
              &lt;
              <span
                id="name"
                className="edit"
                contentEditable
                spellCheck={false}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                  this.setState({ name: event.target.innerText });
                  localStorage.name = event.target.innerText;
                }}
              />
              &gt;
            </span>{" "}
            {/* Message box (editable) */}
            <span title="Message to send">
              <span
                id="msg"
                className="edit hasPlaceholder"
                contentEditable
                spellCheck={false}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    this.post(event.target.innerText);
                    event.target.innerText = "";
                    event.preventDefault();
                  }
                }}
              />
              {/* For previous span when empty */}
              <span
                className="placeholder"
                onClick={event => event.target.previousSibling.focus()}
              >
                Message
              </span>
            </span>
          </li>

          {/* Actual messages */}
          {this.state.log?.length
            ? [...this.state.log].reverse().map((item, index) => {
                return (
                  <li key={index}>
                    <span title={"Sent from <" + item.name + ">"}>
                      &lt;{item.name}&gt; {this.sanitize(item.msg)}
                    </span>
                  </li>
                );
              })
            : "[none]"}
        </ul>
      </div>
    );
  }
}
