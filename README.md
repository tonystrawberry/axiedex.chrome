<p align="center">
  <a href="https://chrome.google.com/webstore/detail/axiedex-the-ultimate-axie/bknllnbfmljmdocaodafmlhcfciicabo">
    <img src="https://github.com/tonystrawberry/axiedex.chrome/blob/main/public/images/icon_128x128.png?raw=true" width="60" />
  </a>
</p>
<h1 align="center">
  AxieDex - The Ultimate Axie Extension
</h1>

## 🖥 Browser extension compatible with Chrome, Brave, Mozilla  

- 🛠 Built with ❤️ when I was still an active player of Axie Infinity
- 👩‍🎨 Inspired by <a href="https://chrome.google.com/webstore/detail/freaks-axie-extension/copjnifcecdedocejpaapepagaodgpbh" target="_blank">Freak's extension</a> (now obsolete)
- 🥰 Written in the awesome Typescript language 

## 👨🏻‍💻 Local development (with Chrome)

1. Make changes locally.
2. Generate the build for both Chrome and Mozilla into the `/dist` folder.
```
npm run build
```
3. Head to `chrome://extensions/` and click on `Load unpacked`. Select the `/dist` folder.
4. The Chrome extension is now loaded with the latest changes.

## 🚀 Publishing

0. Modify the version inside the `/public/manifest_v2.json` (Mozilla Firefox) and `/public/manifest.json` (Chrome/Brave)
1. Generate the `.zip` for both Chrome/Brave and Mozilla Firefox extension store inside the `/packages` folder.
```
zx release.js
```
2. For Chrome, head to the <a href="https://chrome.google.com/webstore/devconsole/9636d0da-087d-487c-ab9b-2cdd179c3174" target="_blank">developer dashboard</a> and publish the newest version (`/packages/${version}/${version}.chr.zip`)
3. For Mozilla, head to the <a href="https://addons.mozilla.org/en-US/developers/addon/axiedex/edit" target="_blank">developer dashboard</a> and publish the newest version (`/packages/${version}/${version}.moz.zip`)
