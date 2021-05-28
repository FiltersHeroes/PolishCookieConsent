var PCC_vAPI_common = {
    convertUFToNewSyntax: () => {
        // Convert user filters to new syntax and comment them
        PCC_vAPI.storage.local.get("convertUF").then(function (resultConvert) {
            if (typeof resultConvert === "undefined" || resultConvert !== "done") {
                PCC_vAPI.storage.local.get("userFilters").then(function (resultUF) {
                    if (typeof resultUF !== "undefined") {
                        let filters = resultUF.split("\n");
                        let argsAfterFunc;
                        for (var i = 0; i < filters.length; i++) {
                            argsAfterFunc = filters[i].split("##+js(")[1];
                            if (typeof argsAfterFunc === "undefined") {
                                filters[i] = filters[i].replace("(", "##+js(").replace("clickCompleteText", "clickComplete").split("|").join(",").replace(/^/, "#");
                            }
                        }
                        PCC_vAPI.storage.local.set("userFilters", filters.join("\n")).then(function () {
                            PCC_vAPI.storage.local.set("convertUF", "done");
                        });
                    }
                });
            }
        });
    }
}
