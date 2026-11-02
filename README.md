# TaskTwig — sito pubblico

Pagina di presentazione pubblicata su GitHub Pages. Il codice dell'app rimane nel repository privato `Whiteware-Lab/TaskTwig`.

La cartella `dist/` contiene esclusivamente i file pubblici del sito. APK e installer Windows vengono allegati alle GitHub Releases **di questo repository pubblico**, non committati nel sito. Il workflow Pages aggiorna i link dei download quando una release viene pubblicata.

Le release Android devono essere firmate con una chiave di distribuzione stabile. La build Android dell'app privata usa ancora la chiave di debug: non pubblicare quell'APK sul sito.

Per verificare il sito localmente: `node --check scripts/sync-release.mjs` e aprire `dist/index.html` con un server statico. Per rigenerare i link dalle release pubblicate: `node scripts/sync-release.mjs`.

L'app web è disponibile su <https://tasktwig.web.app/>.
