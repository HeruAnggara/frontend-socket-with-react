import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:2000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [typingDisplay, setTypingDisplay] = useState("");

  useEffect(() => {
    socket.emit("findAllMessages", {}, (response) => {
      if (Array.isArray(response)) {
        setMessages(response);
      } else if (typeof response === "object" && response !== null) {
        setMessages([response]);
      }
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("typing", ({ name, isTyping }) => {
      if (isTyping) {
        setTypingDisplay(`${name} is typing ...`);
      } else {
        setTypingDisplay("");
      }
    });

    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, []);

  const join = (e) => {
    e.preventDefault();
    socket.emit("join", { name }, () => {
      setJoined(true);
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("createMessage", { text: messageText }, () => {
      setMessageText("");
    });
  };

  let timeout;
  const emitTyping = () => {
    socket.emit("typing", { name, isTyping: true });
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      socket.emit("typing", { name, isTyping: false });
    }, 2000);
  };

  return (
    <div className="chat">
      {!joined ? (
        <div>
          <form onSubmit={join}>
            <label>What's your name ? </label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <div className="chat-container">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div>No messages</div>
            ) : (
              messages.map((message, index) => (
                <div key={index}>
                  {message.name}: {message.text}
                </div>
              ))
            )}
          </div>

          {typingDisplay && <div>{typingDisplay}</div>}

          <hr />

          <div className="message-input">
            <form onSubmit={sendMessage}>
              <label>Message:</label>
              <input
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  emitTyping();
                }}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
