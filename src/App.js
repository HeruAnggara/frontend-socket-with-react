import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [kodes, setKodes] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:2000");

    socket.on("connect", () => {
      console.log("Connected from server");
    });

    socket.on("chat message", (message) => {
      console.log("Received chat message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socket.on("kode message", (message) => {
      console.log("Received chat message:", message);
      setKodes((prevMessages) => [...prevMessages, message]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Chat Messages</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
