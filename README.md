# TaskTwig — sito pubblico

Pagina di presentazione pubblicata su GitHub Pages. Il codice dell'app rimane nel repository privato `Whiteware-Lab/TaskTwig`.

La cartella `dist/` contiene esclusivamente i file pubblici del sito. APK e installer Windows vengono allegati alle GitHub Releases **di questo repository pubblico**, non committati nel sito. Il workflow Pages aggiorna i link dei download quando una release viene pubblicata.

Le release Android sono firmate con la chiave di distribuzione TaskTwig, conservata fuori dal controllo versione e nei GitHub Actions Secrets del repository privato. Non allegare APK di debug alle release pubbliche.

Per pubblicare una nuova versione, creare la release nel repository pubblico con i file `TaskTwig-Android-VERSION+BUILD.apk`, `TaskTwig-Setup-VERSION+BUILD.exe` e `SHA256SUMS.txt`. L'evento `release: published` aggiorna automaticamente i pulsanti di download sul sito. Il repository privato può conservare i propri artefatti di build, ma i visitatori scaricano soltanto gli asset del repository pubblico.

Per verificare il sito localmente: `node --check scripts/sync-release.mjs` e aprire `dist/index.html` con un server statico. Per rigenerare i link dalle release pubblicate: `node scripts/sync-release.mjs`.

L'app web è disponibile su <https://tasktwig.web.app/>.
