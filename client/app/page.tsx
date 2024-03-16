"use client";
import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { IMessage } from "./interfaces";

export default function Home() {
  const [messages, setMessages] = useState<
    { username: string; text: string; timestamp: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUsernameAndConnect = async () => {
      let username = prompt("Digite seu nome:");
      if (!username) username = "Anônimo";

      setUsername(username);
      const socketWithUser = io("http://localhost:3000", {
        query: { username },
      });

      socketWithUser.on("userListUpdate", (updatedUserList: string[]) => {
        setUserList(updatedUserList);
      });

      socketWithUser.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socketWithUser.on("validatedUsername", (validatedUser) => {
        if (validatedUser.id === socketWithUser.id) {
          setUsername(validatedUser.name);
        }
      });

      setSocket(socketWithUser);

      return () => {
        socketWithUser.disconnect();
      };
    };

    getUsernameAndConnect();
  }, []);

  const sendMessage = (): void => {
    if (inputText.trim() === "") return;
    const message = {
      username,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    socket?.emit("message", message);
    setInputText("");
    inputRef.current?.focus();
  };

  const isMessageFromCurrentUser = (message: IMessage): boolean => {
    return message.username === username;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
                  "p-2 bg-slate-200 rounded-lg my-2 w-fit self-end flex-col flex text-wrap max-w-baloon drop-shadow-xl"
                }
              >
                <strong>Você: </strong>
                {message.text}
                <span
                  className={
                    "opacity-50	font-semibold text-xs text-violet-800 text-right pt-2 drop-shadow"
                  }
                >
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            ) : (
              <div
                key={index}
                className={
                  "p-2 bg-violet-400 rounded-lg my-2 w-fit flex-col flex text-wrap max-w-baloon drop-shadow-xl"
                }
              >
                <strong>{message.username}: </strong>
                {message.text}
                <span
                  className={
                    "opacity-50	font-semibold text-xs text-violet-800 text-right pt-2 drop-shadow"
                  }
                >
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            )
          )}
        </div>

        <div
          className={"flex flex-col w-1/4 bg-slate-200 rounded-lg my-8 pr-2"}
        >
          <h2 className={"font-bold text-violet-900 p-4"}>
            Usuários conectados
          </h2>
          <div className={"px-4 pb-4 h-full w-full overflow-auto "}>
            <ul>
              {userList.map((user, index) => (
                <li
                  key={index}
                  className={`${
                    user === username ? "font-extrabold" : "font-medium"
                  }`}
                >
                  {user}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={"flex w-full"}>
        <input
          className={"w-3/4 rounded-md p-2 drop-shadow-lg"}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite uma mensagem..."
          onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
          ref={inputRef}
          autoFocus
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
