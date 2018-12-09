# Polska Ciasteczkowa Zgoda

Rozszerzenie automatycznie akceptujące politykę ciasteczek/RODO na stronach dostępnych w języku polskim. Stanowi ono uzupełnienie **Polskich Filtrów Rodo-Ciasteczkowych**.

[![GitHub Releases](https://img.shields.io/github/downloads/PolishFiltersTeam/PolishCookieConsent/latest/total.svg)](https://github.com/PolishFiltersTeam/PolishCookieConsent/releases/latest)

[![GitHub All Releases](https://img.shields.io/github/downloads/PolishFiltersTeam/PolishCookieConsent/total.svg?colorB=blue)](https://github.com/PolishFiltersTeam/PolishCookieConsent/releases)


## **Jak zainstalować?**
### **I. ![Firefox][Firefox]Firefox/![Waterfox][Waterfox]Waterfox**
1. Pobierz najnowszy plik xpi z [https://github.com/PolishFiltersTeam/PolishCookieConsent/releases/latest](https://github.com/PolishFiltersTeam/PolishCookieConsent/releases/latest) i kliknij **zezwól**, by zainstalować.
2. Gotowe! Aktualizacje powinny być automatyczne, więc nie trzeba będzie znowu wchodzić na stronę i pobierać jak będzie nowa wersja.

### **II. ![Chrome][Chrome]Chrome/![Chromium][Chromium]Chromium/![Vivaldi][Vivaldi]Vivaldi/![Opera][Opera](Chr)Opera/![Cent][Cent]Cent /![Yandex][Yandex]Yandex**
1. Pobierz najnowszy plik zip z [https://github.com/PolishFiltersTeam/PolishCookieConsent/releases/latest](https://github.com/PolishFiltersTeam/PolishCookieConsent/releases/latest).
2. Utwórz nowy katalog **Rozszerzenia**, a w nim katalog **PolishCookieConsent**.
3. Wypakuj archiwum zip do katalogu **PolishCookieConsent**.
4. Wpisz do paska adresu `chrome://extensions` i potwierdź <kbd>Enterem</kbd>.
5. Włącz tryb programisty.
6. Kliknij **załaduj rozpakowane**, potem wskaż katalog, w którym wypakowałeś(aś) rozszerzenie i kliknij **OK**.
7. Gotowe!

**Uwaga! W tym przypadku niestety aktualizacje muszą być przeprowadzane ręcznie (pobierz, wypakuj, nadpisz pliki i zrestartuj przeglądarkę).**

Jednakże w przypadku posiadania jakiejś dystrybucji **Linuksa** można też skorzystać ze [skryptu](https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/updates/update_PolishCookieConsent_chromium.sh), który dodaje automatyczne cotygodniowe sprawdzanie i instalowanie aktualizacji. Oczywiście w takim przypadku, katalog **Rozszerzenia** powinien być w katalogu domowym (/home/nazwa_użytkownika/) albo ścieżka do rozszerzenia powinna zostać zmieniona w skrypcie.

A jeśli masz **Windowsa**, to również możesz skorzystać z podobnego skryptu. Aby to zrobić, należy uruchomić **Windows PowerShell (w wersji min. 5.1)**, a następnie w jego pole wpisać:

---

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy remotesigned
Set-ExecutionPolicy remotesigned
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/updates/update_PolishCookieConsent_chromium.ps1'))
```

 i wcisnąć <kbd>Enter</kbd>. Oczywiście w takim przypadku, katalog **Rozszerzenia** powinien być w katalogu domowym (C:\Users\NazwaUżytkownika\\) albo ścieżka do rozszerzenia powinna zostać zmieniona w skrypcie.

Wymaganą wersję **PowerShell 5.1** dla Windows **7** i Windows **8.1** można pobrać z:
[https://www.microsoft.com/en-us/download/details.aspx?id=54616](https://www.microsoft.com/en-us/download/details.aspx?id=54616).
Po zakończeniu instalacji wymagane jest ponowne uruchomienie systemu.

[Firefox]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/firefox/firefox_24x24.png "Mozilla Firefox"
[Waterfox]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/waterfox/waterfox_24x24.png "Waterfox"
[Chrome]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/chrome/chrome_24x24.png "Google Chrome"
[Chromium]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/chromium/chromium_24x24.png "Chromium"
[Vivaldi]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/vivaldi/vivaldi_24x24.png "Vivaldi"
[Opera]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/opera/opera_24x24.png "Opera"
[Cent]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/cent/cent_24x24.png "Cent Browser"
[Yandex]: https://cdnjs.cloudflare.com/ajax/libs/browser-logos/46.1.0/yandex/yandex_24x24.png "Yandex Browser"

## **Podziękowania**

Polska Ciasteczkowa Zgoda korzysta z otwartoźródłowego kodu następujących projektów (wg. kolejności alfabetycznej):

[erosman/HTML-Internationalization](https://github.com/erosman/HTML-Internationalization)

[primer/octicons](https://github.com/primer/octicons/)
