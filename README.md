# Quasar App (quasar)

A Quasar Project

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).

## Настройка и работа с проектом

### Команды локального старта и билда для удобства
В package.json добавляем в scripts.
```bash
"start": "quasar dev",
"build": "quasar build",
```

### Настройка роутинга
В quasar.config.js vueRouterMode меняем hash на history.
```bash
vueRouterMode: 'history'
```

### localhost с https
В quasar.config.js указываем https и какой-либо порт.
```bash
devServer: {
  server: {
    type: 'https'
  },
  port: 3031,
  open: true // opens browser window automatically
},
```

### Использование своего шрифта для проекта вместо Roboto
1. В quasar.config.js комментируем 'roboto-font'.
2. В папке src/css создаём папку fonts с нужными шрифтами.
3. В папке src/css создаём файл _fonts.scss со стилями шрифтов.
4. В файле app.scss импортируем _fonts.scss.
```bash
@import "fonts";
```
5. В файле quasar.variables.scss прописываем шрифт в $typography-font-family. Например, для шрифта Inter:
```bash
$typography-font-family: 'Inter', sans-serif !default;
```

### Глобальное изменение стилей компонентов quasar
1. В файле app.scss первой же строчкой заранее импортируем файл quasar.variables.scss, чтобы можно было использовать его переменные во всех файлах проекта.
```bash
@import "quasar.variables";
```
2. В папке src/css создаём папку quasar.
3. Используем строгое наименование компонентов для понимания, где какой находится. Все компоненты в отдельных файлах, например:
```bash
_q-breadcrumbs.scss
_q-btn.scss
_q-dialog.scss
```
4. Каждый такой файл импортируется в файле app.scss.
```bash
@import "quasar/q-breadcrumbs";
@import "quasar/q-btn";
@import "quasar/q-dialog";
```
