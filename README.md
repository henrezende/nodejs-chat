# Chat App

### Descrição

Esta é uma aplicação de chat simples que permite a vários utilizadores comunicar em tempo real.

O backend da aplicação é construído com NestJS e Socket.IO, enquanto o frontend é desenvolvido usando Next.js. O MySQL é usado como banco de dados para armazenar o histórico de mensagens. O Docker é usado para conteinerização.

### Features

- Mensagens em tempo real
- Histórico de mensagens
- Suporte a vários utilizadores
- Atribuição de nome de utilizador predefinido ("Anônimo" se não for fornecido um nome)
- Implantação em contêineres com o Docker

### Setup

Construa e inicie os contêineres usando o Docker Compose:

```
docker-compose up --build
```

Aguarde até que os contêineres estejam prontos. Isso pode levar alguns minutos.

### Utilização

- Abra o navegador da Web e navegue até o seguinte URL: `http://localhost:8000`
- Introduza o nome de utilizador pretendido no campo de introdução fornecido.
- Comece a enviar e a receber mensagens em tempo real.

### Tecnologias utilizadas

- NestJS
- Next.js
- MySQL
- Docker
- Socket.IO
