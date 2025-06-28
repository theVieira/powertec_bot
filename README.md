# PowerTec Bot

### Pré requisitos

- Tenha instalado o [Docker](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/)

### Configuração

- Crie um arquivo em **_./config/config.ts_** implementando **iConfig**

```ts
import { iConfig } from "./config.model";

export const config: iConfig = {
  // America/Porto_Velho
  timezone: "Timezone válida",
  target_groups: ["Nome do Grupo"],
  // Formato Válido -> 5569900000000
  allowed_contacts: ["Número de telefone de contatos admin"],
  auto_reply_message: "Mensagem para resposta automática",
  notice_message: "Mensagem agendada para envio",
  command: {
    // Comando para desabilitar auto-reply
    pause: "#pause",
    // Comando para habilitar auto-reply
    resume: "#resume",
  },
  // Agendamentos
  auto_reply_schedule: {
    0: [{ start: "00:00", end: "00:00" }], // Domingo
    1: [{ start: "00:00", end: "00:00" }], // Segunda
    2: [{ start: "00:00", end: "00:00" }], // Terça
    3: [{ start: "00:00", end: "00:00" }], // Quarta
    4: [{ start: "00:00", end: "00:00" }], // Quinta
    5: [{ start: "00:00", end: "00:00" }], // Sexta
    6: [{ start: "00:00", end: "00:00" }], // Sábado
  },
  notice_schedule: {
    0: null, // Domingo
    1: [{ start: "00:00" }], // Segunda
    2: [{ start: "00:00" }], // Terça
    3: [{ start: "00:00" }], // Quarta
    4: [{ start: "00:00" }], // Quinta
    5: [{ start: "00:00" }], // Sexta
    6: [{ start: "00:00" }], // Sábado
  },
};
```

### Como executar

- Após a instalação e configuração, execute

```bash
docker compose up
```

- Conecte-se ao whatsapp pelo qrcode no terminal
- Aguarde o console exibir `console.log("🚀 Client connected");`
- Então pare a execução com `ctrl + c` e execute

```bash
docker compose up -d
```
