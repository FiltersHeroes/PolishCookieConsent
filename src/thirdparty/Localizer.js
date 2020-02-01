/*!
 * Localizer (modified for legacy extensions by Polish Filters Team)
 * Copyright (c) 2018 rugk and contributors
 * MIT License (https://raw.githubusercontent.com/TinyWebEx/Localizer/master/LICENSE.md)
 */

/**
 * Translates Extension's HTML document by attributes.
 *
 * @public
 * @module Localizer
 */

const I18N_ATTRIBUTE = "data-i18n";
const I18N_DATASET = "i18n";
const I18N_DATASET_INT = I18N_DATASET.length;

const I18N_DATASET_KEEP_CHILDREN = "optI18nKeepChildren";
const UNIQUE_REPLACEMENT_SPLIT = "$i18nSplit$";
const UNIQUE_REPLACEMENT_ID = "i18nKeepChildren#";

/**
 * Splits the _MSG__*__ format and returns the actual tag.
 *
 * The format is defined in {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference#name}.
 *
 * @private
 * @param  {string} tag
 * @returns {string}
 * @throws {Error} if pattern does not match
 */
function getMessageTag(tag) {
    /** {@link https://regex101.com/r/LAC5Ib/2} **/
    const splitMessage = tag.split(/^__MSG_([\w@]+)__$/);

    // throw custom exception if input is invalid
    if (splitMessage.length < 2) {
        throw new Error(`invalid message tag pattern "${tag}"`);
    }

    return splitMessage[1];
}

/**
 * Converts a dataset value back to a real attribute.
 *
 * This is intended for substrings of datasets too, i.e. it does not add the "data" prefix
 * in front of the attribute.
 *
 * @private
 * @param  {string} dataSetValue
 * @returns {string}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#Name_conversion}
 */
function convertDatasetToAttribute(dataSetValue) {
    // if beginning of string is capital letter, only lowercase that
    /** {@link https://regex101.com/r/GaVoVi/1} **/
    dataSetValue = dataSetValue.replace(/^[A-Z]/, (char) => char.toLowerCase());

    // replace all other capital letters with dash in front of them
    /** {@link https://regex101.com/r/GaVoVi/3} **/
    dataSetValue = dataSetValue.replace(/[A-Z]/, (char) => {
        return `-${char.toLowerCase()}`;
    });

    return dataSetValue;
}

/**
 * Returns the translated message when a key is given.
 *
 * @private
 * @param  {string} messageName
 * @param  {string[]} substitutions
 * @returns {string} translated string
 * @throws {Error} if no translation could be found
 * @see {@link https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getMessage}
 */
function getTranslatedMessage(messageName, substitutions) {
    const { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
    let translatedMessage;
    if(substitutions)
    {
        translatedMessage = Services.strings.createBundle(document.querySelector("meta[stringbundle]").getAttribute("stringbundle")).formatStringFromName(messageName, substitutions, substitutions.length);
    }
    else
    {
        translatedMessage = Services.strings.createBundle(document.querySelector("meta[stringbundle]").getAttribute("stringbundle")).GetStringFromName(messageName);
    }


    if (!translatedMessage) {
        throw new Error(`no translation string for "${messageName}" could be found`);
    }

    return translatedMessage;
}

/**
 * Translates only the text nodes of the element, and adjusts the psition of the
 * other HTML elements.
 *
 * It does this wout inserting HTML just by moving DOM elements and inserting text,
 * so it works around potential security problems of innerHtml etc.
 *
 * @private
 * @param  {HTMLElement} parent the element to tramslate
 * @param  {string} translatedMessage the already translated and prepared string
 * @param  {Object} subsContainer
 * @param  {string[]} subsContainer.substitutions IDs correspond to number of htmlOnlyChilds
 * @param  {Node[]} subsContainer.textOnlyChilds
 * @param  {HTMLElement[]} subsContainer.htmlOnlyChilds
 * @param  {Node[]} [subsContainer.allChilds] not actually used currently
 * @returns {void}
 */
function innerTranslateTextNodes(parent, translatedMessage, subsContainer) {
    const splitTranslatedMessage = translatedMessage.split(UNIQUE_REPLACEMENT_SPLIT);

    console.log("Replacing text nodes for", parent, ", message:", translatedMessage, "detected elements:", subsContainer);

    // sanity check whether all translations were used
    // We also trigger for =, because we assume we have at least one text node, which
    // is also returned in splitTranslatedMessage
    if (splitTranslatedMessage.length <= subsContainer.substitutions.length) {
        console.warn(
            "You used only", splitTranslatedMessage.length, "message blocks, altghough you could use",
            subsContainer.substitutions.length, "substitutions. Possibly you did not include all substitutions in your translation?",
            "Check for typos in the placeholder name e.g.",
            {
                translationObject: splitTranslatedMessage,
                intendedSubstitutions: subsContainer.substitutions
            }
        );
    }

    // create iterator out of arrays
    const textOnlyIterator = subsContainer.textOnlyChilds[Symbol.iterator]();

    // for first element, fake the first element as the next element
    let previousElement = { nextSibling: parent.fistChild };
    for (const message of splitTranslatedMessage) {
        // if it is placeholder, replace it with HTML element
        if (message.startsWith(UNIQUE_REPLACEMENT_ID)) {
            const childId = message.slice(UNIQUE_REPLACEMENT_ID.length);
            const child = subsContainer.htmlOnlyChilds[childId - 1];

            // move child element in there, *after* the last element = before the next one
            const newElement = parent.insertBefore(child, previousElement.nextSibling);

            // save last element
            previousElement = newElement;
        } else {
            // otherwise we have a text message, which we need to put into a
            // text node

            const nextText = textOnlyIterator.next();
            const nextTextElement = nextText.value;

            // if we have no more text elements
            if (nextText.done) {
                console.warn("Translation contained more text then HTML template. We now add a note. Triggered for translation: ", message);
                // just create & add a new one
                const newTextNode = document.createTextNode(message);

                // move child element in there, *after* the last element = before the next one
                parent.insertBefore(newTextNode, previousElement.nextSibling);

                // save last element
                previousElement = nextTextElement;
            } else {
                // replace the next text element
                nextTextElement.textContent = message;

                // save last element
                previousElement = nextTextElement;
            }
        }
    }
}

/**
 * Replaces attribute or inner text of element with string.
 *
 * @private
 * @param  {HTMLElement} elem
 * @param  {string} attribute attribute to replace, set to "null" to replace inner content
 * @param  {string} translatedMessage
 * @returns {void}
 */
function replaceWith(elem, attribute, translatedMessage) {
    const isHTML = translatedMessage.startsWith("!HTML!");
    if (isHTML) {
        translatedMessage = translatedMessage.replace("!HTML!", "").trimLeft();
    }

    switch (attribute) {
    case null:
        replaceInnerContent(elem, translatedMessage, isHTML);
        break;
    default:
        // attributes are never allowed to contain unbescaped HTML
        elem.setAttribute(attribute, translatedMessage);
    }
}

/**
 * Returns the HTML children..
 *
 * @private
 * @param  {HTMLElement} elem
 * @returns {void}
 */
function getSubitems(elem) {
    // only keep subitems if enabled
    if (!(I18N_DATASET_KEEP_CHILDREN in elem.dataset)) {
        return {};
    }

    // always creates arrays to freeze elements, so later DOM changes do not
    // affect it

    // get all children elements
    const childs = Array.from(elem.childNodes);

    // filter out text childs
    const htmlOnlyChilds = Array.from(elem.children);
    const textOnlyChilds = childs.filter((node) => node.nodeType === Node.TEXT_NODE);

    // create list of substitutions, i.e. $1, $2, §3 etc.
    const substitutions = htmlOnlyChilds.map((elem, num) => `${UNIQUE_REPLACEMENT_SPLIT}${UNIQUE_REPLACEMENT_ID}${num + 1}${UNIQUE_REPLACEMENT_SPLIT}`);

    return {
        substitutions: substitutions,
        allChilds: childs,
        textOnlyChilds: textOnlyChilds,
        htmlOnlyChilds: htmlOnlyChilds
    };
}

/**
 * Localises the strings to localize in the HTMLElement.
 *
 * @private
 * @param  {HTMLElement} elem
 * @param  {string} tag the translation tag
 * @returns {void}
 */
function replaceI18n(elem, tag) {
    const subsContainer = getSubitems(elem);

    // localize main content
    if (tag !== "") {
        try {
            const translatedMessage = getTranslatedMessage(getMessageTag(tag), subsContainer.substitutions);

            // if we have substrings to replace
            if (subsContainer.substitutions) {
                innerTranslateTextNodes(elem, translatedMessage, subsContainer);
            } else {
                // otherwise do "usual" full replacement
                replaceWith(elem, null, translatedMessage);
            }
        } catch (error) {
            // log error but continue translating as it was likely just one problem in one translation
            console.error(error.message, "for element", elem);
        }
    }

    // replace attributes
    for (const [dataAttribute, dataValue] of Object.entries(elem.dataset)) {
        if (
            !dataAttribute.startsWith(I18N_DATASET) || // ignore other data attributes
            dataAttribute.length === I18N_DATASET_INT // ignore non-attribute replacements
        ) {
            continue;
        }

        const replaceAttribute = convertDatasetToAttribute(dataAttribute.slice(I18N_DATASET_INT));

        try {
            const translatedMessage = getTranslatedMessage(getMessageTag(dataValue));
            replaceWith(elem, replaceAttribute, translatedMessage);
        } catch (error) {
            // log error but continue translating as it was likely just one problem in one translation
            console.error(error.message, "for element", elem, "while replacing attribute", replaceAttribute);
        }
    }
}

/**
 * Localizes static strings in the HTML file.
 *
 * @public
 * @returns {void}
 */
export function init() {
    document.querySelectorAll(`[${I18N_ATTRIBUTE}]`).forEach((currentElem) => {
        const contentString = currentElem.dataset[I18N_DATASET];
        replaceI18n(currentElem, contentString);
    });

    // replace html lang attribut after translation
    document.querySelector("html").setAttribute("lang", navigator.language);
}

// automatically init module
init();


/**
 * Replaces inner content of the HTML element.
 *
 * This function ignores a potential third parameter and thus does not allow
 * you to insert HTML code, but always interprets it as text.
 *
 * @protected
 * @param  {HTMLElement} elem
 * @param  {string} translatedMessage
 * @returns {void}
 */
function replaceInnerContent(elem, translatedMessage) {
    elem.textContent = translatedMessage;
}
