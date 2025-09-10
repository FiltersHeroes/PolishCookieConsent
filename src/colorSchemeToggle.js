// Apply dark theme
function applyColorScheme(mode) {
    let rootSelector = document.documentElement;
    let chosenTheme = "light";
    if (mode === "dark") {
        chosenTheme = mode;
    }
    rootSelector.setAttribute("theme", chosenTheme);
    let colorSchemeEvent = new CustomEvent("colorSchemeChange", {
        detail: { currentColorScheme: mode }
    });
    document.dispatchEvent(colorSchemeEvent);
}

let currentColorScheme = "light";
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentColorScheme = "dark";
}
applyColorScheme(currentColorScheme);
let savedCurrentColorScheme = PCC_vAPI.storage.local.getCache("colorScheme");
if (savedCurrentColorScheme && savedCurrentColorScheme != "auto") {
    currentColorScheme = savedCurrentColorScheme;
}
applyColorScheme(currentColorScheme);


PCC_vAPI.storage.local.get("userSettings").then(function (resultUS) {
    if (resultUS) {
        const userSettings = JSON.parse(resultUS);
        let colorScheme = userSettings["colorScheme"];
        if (colorScheme && colorScheme != "auto" && colorScheme !== currentColorScheme) {
            currentColorScheme = colorScheme;
            applyColorScheme(currentColorScheme, true);
        }
    }
});
