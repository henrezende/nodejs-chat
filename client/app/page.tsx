"use client";
import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Home() {
  const [messages, setMessages] = useState<
    { username: string; text: string; timestamp: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const username = prompt("Enter your username:");
    if (username) setUsername(username);
  }, []);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const message = {
      username,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    console.log("message", message);
    socket.emit("message", message);
    setInputText("");
  };

  const isMessageFromCurrentUser = (message) => {
    return message.username === username;
  };

  return (
    <div
      className={
        "flex flex-col drop-shadow-2xl rounded-lg justify-end h-full bg-violet-800 p-8"
      }
    >
      <div className={"flex h-full"}>
        <div className={"flex flex-col w-3/4 p-4 m-6 overflow-auto"}>
          {messages.map((message, index) =>
            isMessageFromCurrentUser(message) ? (
              <div
                key={index}
                className={
                  "p-2 bg-slate-200 rounded-lg my-2 w-fit self-end flex-col flex"
                }
              >
                <strong>Você: </strong>
                {message.text}
              </div>
            ) : (
              <div
                key={index}
                className={
                  "p-2 bg-violet-400 rounded-lg my-2 w-fit flex-col flex"
                }
              >
                <strong>{message.username}: </strong>
                {message.text}
              </div>
            )
          )}
        </div>

        <div className={"flex w-1/4 h-full py-8"}>
          <div className={"bg-slate-200 rounded-lg h-full w-full"}></div>
        </div>
      </div>

      <div className={"flex w-full"}>
        <input
          className={"w-3/4 rounded-md p-2 drop-shadow-lg"}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite uma mensagem..."
        />
        <button
          className={
            "w-1/4 bg-violet-400 text-violet-800 font-bold p-2 ml-4 drop-shadow-lg rounded-lg"
          }
          onClick={sendMessage}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
