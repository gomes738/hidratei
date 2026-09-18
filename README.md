# Hidratei

Aplicativo pessoal para registrar o consumo de água, acompanhar a meta diária e receber lembretes locais. Os dados ficam somente no aparelho e o aplicativo funciona sem internet.

## Tecnologias

- React Native com TypeScript
- Expo SDK 57 e Expo Router
- AsyncStorage para persistência local
- Expo Notifications para lembretes locais

## Funcionalidades

- Meta diária configurável (2.000 ml por padrão)
- Registro rápido de 200 ml, 300 ml, 500 ml ou outra quantidade
- Progresso diário, valor restante e mensagem motivacional
- Exclusão de registros incorretos
- Histórico por dia com a meta vigente e percentual atingido
- Lembretes configuráveis entre dois horários, a cada 30, 60 ou 120 minutos
- Persistência local de registros e configurações
- Configuração inicial em seis etapas, exibida somente até a primeira conclusão
- Perfil, peso e rotina salvos exclusivamente no aparelho
- Meta inicial estimada para bem-estar, sempre editável e sem caráter médico

## Organização MVVM Simplificada

O projeto segue o padrão do capítulo 8 de *Tutoriais de PDM*:

```text
src/
├── app/          # rotas finas e configuração da pilha
├── model/        # entidades, regras, DataSource e Service
├── viewmodel/    # Custom Hooks no formato [state, actions]
└── view/         # telas e componentes visuais
```

- **Model:** tipos e regras de água/configurações, acesso ao AsyncStorage em `WaterDataSource` e notificações em `NotificationService`.
- **ViewModel:** carrega e prepara dados, valida ações, trata erros e controla toda a navegação.
- **View:** renderiza o estado, dispara ações e mantém somente o texto temporário dos campos.

O primeiro acesso abre `onboarding`, onde o usuário escolhe o perfil, informa peso e horários e revisa o plano. `ProfileDataSource` salva `UserProfile` no AsyncStorage, e `useOnboardingViewModel` controla todas as etapas, validações, permissões e navegação. A configuração pode ser refeita pela tela de configurações.

## Instalação e execução

Requisitos: Node.js, npm, Expo Go ou um emulador/dispositivo com uma development build.

```bash
npm install
npx expo start
```

Depois, leia o QR Code no celular ou pressione `a` para Android, `i` para iOS ou `w` para web. Para iniciar diretamente:

```bash
npm run android
npm run ios
npm run web
```

## Build Android

O perfil `preview` do `eas.json` gera um APK instalável:

```bash
npx eas-cli build -p android --profile preview
```

## Como testar as notificações

1. Use uma development build em um aparelho físico. No Android com SDK 57, o aplicativo abre no Expo Go, mas os lembretes ficam indisponíveis para evitar a incompatibilidade de `expo-notifications`.
2. Abra **Configurações**, ative **Lembretes** e escolha início, fim e intervalo.
3. Toque em **Salvar configurações** e permita notificações quando o sistema solicitar.
4. Para um teste rápido, use um período que inclua um horário próximo. Ao salvar novamente, os lembretes anteriores são cancelados e recriados.
5. Se a permissão for negada, habilite-a nas configurações do sistema operacional e salve novamente no aplicativo.

Para gerar e executar uma compilação Android com suporte aos lembretes:

```bash
npx expo run:android
```

No Android, o aplicativo cria o canal **Lembretes de hidratação**. Desativar os lembretes cancela todos os agendamentos do aplicativo.

## Observações

- Não há login, servidor, Firebase ou sincronização em nuvem.
- A meta é escolhida pelo usuário; o aplicativo não fornece recomendação médica.
- Alterações de fuso horário ou restrições de bateria do sistema podem afetar o horário exato de entrega.
- Se o Expo Go informar que o projeto exige uma versão mais nova, atualize o Expo Go pela Play Store e reinicie o Metro com `npx expo start --clear`.
