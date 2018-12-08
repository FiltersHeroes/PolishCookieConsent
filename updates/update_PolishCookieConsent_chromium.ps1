# v1.0

$PATH_INSTALL_SCRIPT = [Environment]::GetFolderPath("UserProfile")+"\Rozszerzenia\update_PolishCookieConsent_chromium.ps1"

$data = @’
[Net.ServicePointManager]::SecurityProtocol = 'TLS11','TLS12','ssl3'
$repo = "PolishFiltersTeam/PolishCookieConsent"
$releases = "https://api.github.com/repos/$repo/releases"

$NEW_VERSION = $((Invoke-WebRequest $releases | ConvertFrom-Json)[0].tag_name).TRIM("v", " ")

$PATH_DOWNLOAD_EXT = [Environment]::GetFolderPath("UserProfile")+"\Downloads\PolishCookieConsent_v$NEW_VERSION"
$PATH_INSTALL_EXT = [Environment]::GetFolderPath("UserProfile")+"\Rozszerzenia\PolishCookieConsent"

$OLD_VERSION = $(cat $PATH_INSTALL_EXT\manifest.json | Select-String -Pattern '"version":').Line.Split(':')[1] -replace '"', "" -replace ',', "" -replace '\s',''

$zip = "PolishCookieConsent_chromium.zip"

If ( $NEW_VERSION -gt $OLD_VERSION )
{
	new-item $PATH_DOWNLOAD_EXT -itemtype directory
	Invoke-WebRequest "https://github.com/$repo/releases/download/v$NEW_VERSION/$zip" -OutFile $PATH_DOWNLOAD_EXT/$zip
	Expand-Archive -Path $PATH_DOWNLOAD_EXT/$zip -DestinationPath $PATH_INSTALL_EXT -Force
	Remove-Item $PATH_DOWNLOAD_EXT -Recurse
	Add-Type -AssemblyName System.Windows.Forms | Out-Null
	[System.Windows.Forms.MessageBox]::Show("Rozszerzenie Polska Ciasteczkowa Zgoda zostało zaktualizowane do wersji $NEW_VERSION. Proszę zrestartować przeglądarkę.", "Sukces")
}
Else
{
	Add-Type -AssemblyName System.Windows.Forms | Out-Null
	[System.Windows.Forms.MessageBox]::Show("Aktualnie nie ma nowszej wersji rozszerzenia Polska Ciasteczkowa Zgoda.", "Informacja")
}
‘@

Out-File -FilePath $PATH_INSTALL_SCRIPT -InputObject $data

Schtasks /create /tn "Aktualizacja rozszerzenia Polska Ciasteczkowa Zgoda" /sc weekly /RU $env:UserName /tr "PowerShell $PATH_INSTALL_SCRIPT"
