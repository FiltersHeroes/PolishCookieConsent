/*!
* Materialize v2.2.2 (https://materializeweb.com)
* Copyright 2014-2025 Materialize
* MIT License (https://raw.githubusercontent.com/materializecss/materialize/master/LICENSE)
* Modified/cutted out version by Filters Heroes
*/
var M = (function (exports) {
    'use strict';

    /**
     * Class with utilitary functions for global usage.
     */
    class Utils {
        /** Specifies wether tab is pressed or not. */
        static tabPressed = false;
        /** Specifies wether there is a key pressed. */
        static keyDown = false;
        /**
         * Key maps.
         */
        static keys = {
            TAB: ['Tab'],
            ENTER: ['Enter'],
            ESC: ['Escape', 'Esc'],
            BACKSPACE: ['Backspace'],
            ARROW_UP: ['ArrowUp', 'Up'],
            ARROW_DOWN: ['ArrowDown', 'Down'],
            ARROW_LEFT: ['ArrowLeft', 'Left'],
            ARROW_RIGHT: ['ArrowRight', 'Right'],
            DELETE: ['Delete', 'Del']
        };
        /**
         * Detects when a key is pressed.
         * @param e Event instance.
         */
        static docHandleKeydown(e) {
            Utils.keyDown = true;
            if ([...Utils.keys.TAB, ...Utils.keys.ARROW_DOWN, ...Utils.keys.ARROW_UP].includes(e.key)) {
                Utils.tabPressed = true;
            }
        }
        /**
         * Detects when a key is released.
         * @param e Event instance.
         */
        static docHandleKeyup(e) {
            Utils.keyDown = false;
            if ([...Utils.keys.TAB, ...Utils.keys.ARROW_DOWN, ...Utils.keys.ARROW_UP].includes(e.key)) {
                Utils.tabPressed = false;
            }
        }
        /**
         * Detects when document is focused.
         * @param e Event instance.
         */
        /* eslint-disabled as of required event type condition check */
        /* eslint-disable-next-line */
        static docHandleFocus(e) {
            if (Utils.keyDown) {
                document.body.classList.add('keyboard-focused');
            }
        }
        /**
         * Detects when document is not focused.
         * @param e Event instance.
         */
        /* eslint-disabled as of required event type condition check */
        /* eslint-disable-next-line */
        static docHandleBlur(e) {
            document.body.classList.remove('keyboard-focused');
        }
        /**
         * Generates a unique string identifier.
         */
        static guid() {
            const s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            };
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        /**
         * Checks for exceeded edges
         * @param container Container element.
         * @param bounding Bounding rect.
         * @param offset Element offset.
         */
        static checkWithinContainer(container, bounding, offset) {
            const edges = {
                top: false,
                right: false,
                bottom: false,
                left: false
            };
            const containerRect = container.getBoundingClientRect();
            // If body element is smaller than viewport, use viewport height instead.
            const containerBottom = container === document.body
                ? Math.max(containerRect.bottom, window.innerHeight)
                : containerRect.bottom;
            const scrollLeft = container.scrollLeft;
            const scrollTop = container.scrollTop;
            const scrolledX = bounding.left - scrollLeft;
            const scrolledY = bounding.top - scrollTop;
            // Check for container and viewport for each edge
            if (scrolledX < containerRect.left + offset || scrolledX < offset) {
                edges.left = true;
            }
            if (scrolledX + bounding.width > containerRect.right - offset ||
                scrolledX + bounding.width > window.innerWidth - offset) {
                edges.right = true;
            }
            if (scrolledY < containerRect.top + offset || scrolledY < offset) {
                edges.top = true;
            }
            if (scrolledY + bounding.height > containerBottom - offset ||
                scrolledY + bounding.height > window.innerHeight - offset) {
                edges.bottom = true;
            }
            return edges;
        }
        /**
         * Checks if element can be aligned in multiple directions.
         * @param el Element to be inspected.
         * @param container Container element.
         * @param bounding Bounding rect.
         * @param offset Element offset.
         */
        static checkPossibleAlignments(el, container, bounding, offset) {
            const canAlign = {
                top: true,
                right: true,
                bottom: true,
                left: true,
                spaceOnTop: null,
                spaceOnRight: null,
                spaceOnBottom: null,
                spaceOnLeft: null
            };
            const containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
            const containerRect = container.getBoundingClientRect();
            const containerHeight = Math.min(containerRect.height, window.innerHeight);
            const containerWidth = Math.min(containerRect.width, window.innerWidth);
            const elOffsetRect = el.getBoundingClientRect();
            const scrollLeft = container.scrollLeft;
            const scrollTop = container.scrollTop;
            const scrolledX = bounding.left - scrollLeft;
            const scrolledYTopEdge = bounding.top - scrollTop;
            const scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;
            // Check for container and viewport for left
            canAlign.spaceOnRight = !containerAllowsOverflow
                ? containerWidth - (scrolledX + bounding.width)
                : window.innerWidth - (elOffsetRect.left + bounding.width);
            if (canAlign.spaceOnRight < 0) {
                canAlign.left = false;
            }
            // Check for container and viewport for Right
            canAlign.spaceOnLeft = !containerAllowsOverflow
                ? scrolledX - bounding.width + elOffsetRect.width
                : elOffsetRect.right - bounding.width;
            if (canAlign.spaceOnLeft < 0) {
                canAlign.right = false;
            }
            // Check for container and viewport for Top
            canAlign.spaceOnBottom = !containerAllowsOverflow
                ? containerHeight - (scrolledYTopEdge + bounding.height + offset)
                : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
            if (canAlign.spaceOnBottom < 0) {
                canAlign.top = false;
            }
            // Check for container and viewport for Bottom
            canAlign.spaceOnTop = !containerAllowsOverflow
                ? scrolledYBottomEdge - (bounding.height - offset)
                : elOffsetRect.bottom - (bounding.height + offset);
            if (canAlign.spaceOnTop < 0) {
                canAlign.bottom = false;
            }
            return canAlign;
        }
        /**
         * Retrieves target element id from trigger.
         * @param trigger Trigger element.
         */
        static getIdFromTrigger(trigger) {
            let id = trigger.dataset.target;
            if (!id) {
                id = trigger.getAttribute('href');
                return id ? id.slice(1) : '';
            }
            return id;
        }
        /**
         * Retrieves document scroll postion from top.
         */
        static getDocumentScrollTop() {
            return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        }
        /**
         * Retrieves document scroll postion from left.
         */
        static getDocumentScrollLeft() {
            return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        }
        /**
         * Fires the given function after a certain ammount of time.
         * @param func Function to be fired.
         * @param wait Wait time.
         * @param options Additional options.
         */
        static throttle(func, wait, options = {}) {
            let context, args, result, timeout = null, previous = 0;
            const later = () => {
                previous = options.leading === false ? 0 : new Date().getTime();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return (...args) => {
                const now = new Date().getTime();
                if (!previous && options.leading === false)
                    previous = now;
                const remaining = wait - (now - previous);
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(this, args);
                }
                else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }
        /**
         * Renders confirm/close buttons with callback function
         */
        static createConfirmationContainer(container, confirmText, cancelText, onConfirm, onCancel) {
            const confirmationButtonsContainer = document.createElement('div');
            confirmationButtonsContainer.classList.add('confirmation-btns');
            container.append(confirmationButtonsContainer);
            this.createButton(confirmationButtonsContainer, cancelText, ['btn-cancel'], true, onCancel);
            this.createButton(confirmationButtonsContainer, confirmText, ['btn-confirm'], true, onConfirm);
        }
        /**
         * Renders a button with optional callback function
         */
        static createButton(container, text, className = [], visibility = true, callback = null) {
            className = className.concat(['btn', 'waves-effect', 'text']);
            const button = document.createElement('button');
            button.className = className.join(' ');
            button.style.visibility = visibility ? 'visible' : 'hidden';
            button.type = 'button';
            button.tabIndex = !!visibility ? 0 : -1;
            button.innerText = text;
            button.addEventListener('click', callback);
            button.addEventListener('keypress', (e) => {
                if (Utils.keys.ENTER.includes(e.key))
                    callback(e);
            });
            container.append(button);
        }
        static _setAbsolutePosition(origin, container, position, margin, transitionMovement, align = 'center') {
            const originHeight = origin.offsetHeight, originWidth = origin.offsetWidth, containerHeight = container.offsetHeight, containerWidth = container.offsetWidth;
            let xMovement = 0, yMovement = 0, targetTop = origin.getBoundingClientRect().top + Utils.getDocumentScrollTop(), targetLeft = origin.getBoundingClientRect().left + Utils.getDocumentScrollLeft();
            if (position === 'top') {
                targetTop += -containerHeight - margin;
                if (align === 'center') {
                    targetLeft += originWidth / 2 - containerWidth / 2; // This is center align
                }
                yMovement = -transitionMovement;
            }
            else if (position === 'right') {
                targetTop += originHeight / 2 - containerHeight / 2;
                targetLeft = originWidth + margin;
                xMovement = transitionMovement;
            }
            else if (position === 'left') {
                targetTop += originHeight / 2 - containerHeight / 2;
                targetLeft = -containerWidth - margin;
                xMovement = -transitionMovement;
            }
            else {
                targetTop += originHeight + margin;
                if (align === 'center') {
                    targetLeft += originWidth / 2 - containerWidth / 2; // This is center align
                }
                yMovement = transitionMovement;
            }
            if (align === 'right') {
                targetLeft += originWidth - containerWidth - margin;
            }
            const newCoordinates = Utils._repositionWithinScreen(targetLeft, targetTop, containerWidth, containerHeight, margin, transitionMovement, align);
            container.style.top = newCoordinates.y + 'px';
            container.style.left = newCoordinates.x + 'px';
            return { x: xMovement, y: yMovement };
        }
        static _repositionWithinScreen(x, y, width, height, margin, transitionMovement, align) {
            const scrollLeft = Utils.getDocumentScrollLeft();
            const scrollTop = Utils.getDocumentScrollTop();
            let newX = x - scrollLeft;
            let newY = y - scrollTop;
            const bounding = {
                left: newX,
                top: newY,
                width: width,
                height: height
            };
            let offset;
            if (align === 'left' || align == 'center') {
                offset = margin + transitionMovement;
            }
            else if (align === 'right') {
                offset = margin - transitionMovement;
            }
            const edges = Utils.checkWithinContainer(document.body, bounding, offset);
            if (edges.left) {
                newX = offset;
            }
            else if (edges.right) {
                newX -= newX + width - window.innerWidth;
            }
            if (edges.top) {
                newY = offset;
            }
            else if (edges.bottom) {
                newY -= newY + height - window.innerHeight;
            }
            return {
                x: newX + scrollLeft,
                y: newY + scrollTop
            };
        }
    }

    /**
     * Base class implementation for Materialize components.
     */
    class Component {
        /**
         * The DOM element the plugin was initialized with.
         */
        el;
        /**
         * The options the instance was initialized with.
         */
        options;
        /**
         * Constructs component instance and set everything up.
         */
        constructor(el, options, classDef) {
            // Display error if el is not a valid HTML Element
            if (!(el instanceof HTMLElement)) {
                console.error(Error(el + ' is not an HTML Element'));
            }
            // If exists, destroy and reinitialize in child
            const ins = classDef.getInstance(el);
            if (!!ins) {
                ins.destroy();
            }
            this.el = el;
        }
        /**
         * Initializes component instances.
         * @param els HTML elements.
         * @param options Component options.
         * @param classDef Class definition.
         */
        static init(els, options, classDef) {
            let instances = null;
            if (els instanceof Element) {
                instances = new classDef(els, options);
            }
            else if (!!els && els.length) {
                instances = [];
                for (let i = 0; i < els.length; i++) {
                    instances.push(new classDef(els[i], options));
                }
            }
            return instances;
        }
        /**
         * @returns default options for component instance.
         */
        static get defaults() {
            return {};
        }
        /**
         * Retrieves component instance for the given element.
         * @param el Associated HTML Element.
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        static getInstance(el) {
            throw new Error('This method must be implemented.');
        }
        /**
         * Destroy plugin instance and teardown.
         */
        destroy() {
            throw new Error('This method must be implemented.');
        }
    }

    const _defaults$4 = {
        alignment: 'left',
        autoFocus: true,
        constrainWidth: true,
        container: null,
        coverTrigger: true,
        closeOnClick: true,
        hover: false,
        inDuration: 150,
        outDuration: 250,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        onItemClick: null
    };
    class Dropdown extends Component {
        static _dropdowns = [];
        /** ID of the dropdown element. */
        id;
        /** The DOM element of the dropdown. */
        dropdownEl;
        /** If the dropdown is open. */
        isOpen;
        /** If the dropdown content is scrollable. */
        isScrollable;
        isTouchMoving;
        /** The index of the item focused. */
        focusedIndex;
        filterQuery;
        filterTimeout;
        constructor(el, options) {
            super(el, options, Dropdown);
            this.el['M_Dropdown'] = this;
            Dropdown._dropdowns.push(this);
            this.id = Utils.getIdFromTrigger(el);
            this.dropdownEl = document.getElementById(this.id);
            this.options = {
                ...Dropdown.defaults,
                ...options
            };
            this.isOpen = false;
            this.isScrollable = false;
            this.isTouchMoving = false;
            this.focusedIndex = -1;
            this.filterQuery = [];
            this.el.ariaExpanded = 'false';
            // Move dropdown-content after dropdown-trigger
            this._moveDropdownToElement();
            this._makeDropdownFocusable();
            this._setupEventHandlers();
        }
        static get defaults() {
            return _defaults$4;
        }
        /**
         * Initializes instances of Dropdown.
         * @param els HTML elements.
         * @param options Component options.
         */
        static init(els, options = {}) {
            return super.init(els, options, Dropdown);
        }
        static getInstance(el) {
            return el['M_Dropdown'];
        }
        destroy() {
            this._resetDropdownStyles();
            this._removeEventHandlers();
            Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
            this.el['M_Dropdown'] = undefined;
        }
        _setupEventHandlers() {
            // Trigger keydown handler
            this.el.addEventListener('keydown', this._handleTriggerKeydown);
            // Item click handler
            this.dropdownEl?.addEventListener('click', this._handleDropdownClick);
            // Hover event handlers
            if (this.options.hover) {
                this.el.addEventListener('mouseenter', this._handleMouseEnter);
                this.el.addEventListener('mouseleave', this._handleMouseLeave);
                this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeave);
                // Click event handlers
            }
            else {
                this.el.addEventListener('click', this._handleClick);
            }
        }
        _removeEventHandlers() {
            this.el.removeEventListener('keydown', this._handleTriggerKeydown);
            this.dropdownEl.removeEventListener('click', this._handleDropdownClick);
            if (this.options.hover) {
                this.el.removeEventListener('mouseenter', this._handleMouseEnter);
                this.el.removeEventListener('mouseleave', this._handleMouseLeave);
                this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeave);
            }
            else {
                this.el.removeEventListener('click', this._handleClick);
            }
        }
        _setupTemporaryEventHandlers() {
            document.body.addEventListener('click', this._handleDocumentClick);
            document.body.addEventListener('touchmove', this._handleDocumentTouchmove);
            this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydown);
            window.addEventListener('resize', this._handleWindowResize);
        }
        _removeTemporaryEventHandlers() {
            document.body.removeEventListener('click', this._handleDocumentClick);
            document.body.removeEventListener('touchmove', this._handleDocumentTouchmove);
            this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydown);
            window.removeEventListener('resize', this._handleWindowResize);
        }
        _handleClick = (e) => {
            e.preventDefault();
            //this._moveDropdown((<HTMLElement>e.target).closest('li'));
            if (this.isOpen) {
                this.close();
            }
            else {
                this.open();
            }
        };
        _handleMouseEnter = () => {
            //this._moveDropdown((<HTMLElement>e.target).closest('li'));
            this.open();
        };
        _handleMouseLeave = (e) => {
            const toEl = e.relatedTarget;
            const leaveToDropdownContent = !!toEl.closest('.dropdown-content');
            let leaveToActiveDropdownTrigger = false;
            const closestTrigger = toEl.closest('.dropdown-trigger');
            if (closestTrigger && !!closestTrigger['M_Dropdown'] && closestTrigger['M_Dropdown'].isOpen) {
                leaveToActiveDropdownTrigger = true;
            }
            // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
            if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
                this.close();
            }
        };
        _handleDocumentClick = (e) => {
            const target = e.target;
            if (this.options.closeOnClick && target.closest('.dropdown-content') && !this.isTouchMoving) {
                // isTouchMoving to check if scrolling on mobile.
                this.close();
            }
            else if (!target.closest('.dropdown-content')) {
                // Do this one frame later so that if the element clicked also triggers _handleClick
                // For example, if a label for a select was clicked, that we don't close/open the dropdown
                setTimeout(() => {
                    if (this.isOpen) {
                        this.close();
                    }
                }, 0);
            }
            this.isTouchMoving = false;
        };
        _handleTriggerKeydown = (e) => {
            // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
            const arrowDownOrEnter = Utils.keys.ARROW_DOWN.includes(e.key) || Utils.keys.ENTER.includes(e.key);
            if (arrowDownOrEnter && !this.isOpen) {
                e.preventDefault();
                this.open();
            }
        };
        _handleDocumentTouchmove = (e) => {
            const target = e.target;
            if (target.closest('.dropdown-content')) {
                this.isTouchMoving = true;
            }
        };
        _handleDropdownClick = (e) => {
            // onItemClick callback
            if (typeof this.options.onItemClick === 'function') {
                const itemEl = e.target.closest('li');
                this.options.onItemClick.call(this, itemEl);
            }
        };
        _handleDropdownKeydown = (e) => {
            const arrowUpOrDown = Utils.keys.ARROW_DOWN.includes(e.key) || Utils.keys.ARROW_UP.includes(e.key);
            if (Utils.keys.TAB.includes(e.key)) {
                e.preventDefault();
                this.close();
            }
            // Navigate down dropdown list
            else if (arrowUpOrDown && this.isOpen) {
                e.preventDefault();
                const direction = Utils.keys.ARROW_DOWN.includes(e.key) ? 1 : -1;
                let newFocusedIndex = this.focusedIndex;
                let hasFoundNewIndex = false;
                do {
                    newFocusedIndex = newFocusedIndex + direction;
                    if (!!this.dropdownEl.children[newFocusedIndex] &&
                        this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
                        hasFoundNewIndex = true;
                        break;
                    }
                } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);
                if (hasFoundNewIndex) {
                    // Remove active class from old element
                    if (this.focusedIndex >= 0)
                        this.dropdownEl.children[this.focusedIndex].classList.remove('active');
                    this.focusedIndex = newFocusedIndex;
                    this._focusFocusedItem();
                }
            }
            // ENTER selects choice on focused item
            else if (Utils.keys.ENTER.includes(e.key) && this.isOpen) {
                // Search for <a> and <button>
                const focusedElement = this.dropdownEl.children[this.focusedIndex];
                const activatableElement = focusedElement?.querySelector('a, button');
                // Click a or button tag if exists, otherwise click li tag
                if (!!activatableElement) {
                    activatableElement.click();
                }
                else if (!!focusedElement) {
                    if (focusedElement instanceof HTMLElement) {
                        focusedElement.click();
                    }
                }
            }
            // Close dropdown on ESC
            else if (Utils.keys.ESC.includes(e.key) && this.isOpen) {
                e.preventDefault();
                this.close();
            }
            // CASE WHEN USER TYPE LTTERS
            const keyText = e.key.toLowerCase();
            const isLetter = /[a-zA-Z0-9-_]/.test(keyText);
            const specialKeys = [
                ...Utils.keys.ARROW_DOWN,
                ...Utils.keys.ARROW_UP,
                ...Utils.keys.ENTER,
                ...Utils.keys.ESC,
                ...Utils.keys.TAB
            ];
            if (isLetter && !specialKeys.includes(e.key)) {
                this.filterQuery.push(keyText);
                const string = this.filterQuery.join('');
                const newOptionEl = Array.from(this.dropdownEl.querySelectorAll('li')).find((el) => el.innerText.toLowerCase().indexOf(string) === 0);
                if (newOptionEl) {
                    this.focusedIndex = [...newOptionEl.parentNode.children].indexOf(newOptionEl);
                    this._focusFocusedItem();
                }
            }
            this.filterTimeout = setTimeout(this._resetFilterQuery, 1000);
        };
        _handleWindowResize = () => {
            // Only re-place the dropdown if it's still visible
            // Accounts for elements hiding via media queries
            if (this.el.offsetParent) {
                this.recalculateDimensions();
            }
        };
        _resetFilterQuery = () => {
            this.filterQuery = [];
        };
        _resetDropdownStyles() {
            this.dropdownEl.style.display = '';
            this._resetDropdownPositioningStyles();
            this.dropdownEl.style.transform = '';
            this.dropdownEl.style.opacity = '';
        }
        _resetDropdownPositioningStyles() {
            this.dropdownEl.style.width = '';
            this.dropdownEl.style.height = '';
            this.dropdownEl.style.left = '';
            this.dropdownEl.style.top = '';
            this.dropdownEl.style.transformOrigin = '';
        }
        _moveDropdownToElement(containerEl = null) {
            if (this.options.container) {
                this.options.container.append(this.dropdownEl);
                return;
            }
            if (containerEl) {
                if (!containerEl.contains(this.dropdownEl))
                    containerEl.append(this.dropdownEl);
                return;
            }
            this.el.after(this.dropdownEl);
        }
        _makeDropdownFocusable() {
            if (!this.dropdownEl)
                return;
            this.dropdownEl.popover = '';
            // Needed for arrow key navigation
            this.dropdownEl.tabIndex = 0;
            // Only set tabindex if it hasn't been set by user
            Array.from(this.dropdownEl.children).forEach((el) => {
                if (!el.getAttribute('tabindex'))
                    el.setAttribute('tabindex', '0');
            });
        }
        _focusFocusedItem() {
            if (this.focusedIndex >= 0 &&
                this.focusedIndex < this.dropdownEl.children.length &&
                this.options.autoFocus) {
                this.dropdownEl.children[this.focusedIndex].focus({
                    preventScroll: true
                });
                this.dropdownEl.children[this.focusedIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
        _getDropdownPosition(closestOverflowParent) {
            // const offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
            const triggerBRect = this.el.getBoundingClientRect();
            const dropdownBRect = this.dropdownEl.getBoundingClientRect();
            let idealHeight = dropdownBRect.height;
            let idealWidth = dropdownBRect.width;
            let idealXPos = triggerBRect.left - dropdownBRect.left;
            let idealYPos = triggerBRect.top - dropdownBRect.top;
            const dropdownBounds = {
                left: idealXPos,
                top: idealYPos,
                height: idealHeight,
                width: idealWidth
            };
            const alignments = Utils.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);
            let verticalAlignment = 'top';
            let horizontalAlignment = this.options.alignment;
            idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;
            // Reset isScrollable
            this.isScrollable = false;
            if (!alignments.top) {
                if (alignments.bottom) {
                    verticalAlignment = 'bottom';
                    if (!this.options.coverTrigger) {
                        idealYPos -= triggerBRect.height;
                    }
                }
                else {
                    this.isScrollable = true;
                    // Determine which side has most space and cutoff at correct height
                    idealHeight -= 20; // Add padding when cutoff
                    if (alignments.spaceOnTop > alignments.spaceOnBottom) {
                        verticalAlignment = 'bottom';
                        idealHeight += alignments.spaceOnTop;
                        idealYPos -= this.options.coverTrigger
                            ? alignments.spaceOnTop - 20
                            : alignments.spaceOnTop - 20 + triggerBRect.height;
                    }
                    else {
                        idealHeight += alignments.spaceOnBottom;
                    }
                }
            }
            // If preferred horizontal alignment is possible
            if (!alignments[horizontalAlignment]) {
                const oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
                if (alignments[oppositeAlignment]) {
                    horizontalAlignment = oppositeAlignment;
                }
                else {
                    // Determine which side has most space and cutoff at correct height
                    if (alignments.spaceOnLeft > alignments.spaceOnRight) {
                        horizontalAlignment = 'right';
                        idealWidth += alignments.spaceOnLeft;
                        idealXPos -= alignments.spaceOnLeft;
                    }
                    else {
                        horizontalAlignment = 'left';
                        idealWidth += alignments.spaceOnRight;
                    }
                }
            }
            if (verticalAlignment === 'bottom') {
                idealYPos =
                    idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
            }
            if (horizontalAlignment === 'right') {
                idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
            }
            return {
                x: idealXPos,
                y: idealYPos,
                verticalAlignment: verticalAlignment,
                horizontalAlignment: horizontalAlignment,
                height: idealHeight,
                width: idealWidth
            };
        }
        _animateIn() {
            const duration = this.options.inDuration;
            this.dropdownEl.style.transition = 'none';
            // from
            this.dropdownEl.style.opacity = '0';
            this.dropdownEl.style.transform = 'scale(0.3, 0.3)';
            setTimeout(() => {
                // easeOutQuad (opacity) & easeOutQuint
                this.dropdownEl.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
                // to
                this.dropdownEl.style.opacity = '1';
                this.dropdownEl.style.transform = 'scale(1, 1)';
            }, 1);
            setTimeout(() => {
                if (this.options.autoFocus)
                    this.dropdownEl.focus();
                if (typeof this.options.onOpenEnd === 'function')
                    this.options.onOpenEnd.call(this, this.el);
            }, duration);
        }
        _animateOut() {
            const duration = this.options.outDuration;
            // easeOutQuad (opacity) & easeOutQuint
            this.dropdownEl.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
            // to
            this.dropdownEl.style.opacity = '0';
            this.dropdownEl.style.transform = 'scale(0.3, 0.3)';
            setTimeout(() => {
                this._resetDropdownStyles();
                if (typeof this.options.onCloseEnd === 'function')
                    this.options.onCloseEnd.call(this, this.el);
            }, duration);
        }
        _getClosestAncestor(el, condition) {
            let ancestor = el.parentNode;
            while (ancestor !== null && ancestor !== document) {
                if (condition(ancestor)) {
                    return ancestor;
                }
                ancestor = ancestor.parentElement;
            }
            return null;
        }
        _placeDropdown() {
            // Container here will be closest ancestor with overflow: hidden
            let closestOverflowParent = this._getClosestAncestor(this.dropdownEl, (ancestor) => {
                return (!['HTML', 'BODY'].includes(ancestor.tagName) &&
                    getComputedStyle(ancestor).overflow !== 'visible');
            });
            // Fallback
            if (!closestOverflowParent) {
                closestOverflowParent = ((!!this.dropdownEl.offsetParent ? this.dropdownEl.offsetParent : this.dropdownEl.parentNode));
            }
            if (getComputedStyle(closestOverflowParent).position === 'static')
                closestOverflowParent.style.position = 'relative';
            //this._moveDropdown(closestOverflowParent);
            // Set width before calculating positionInfo
            const idealWidth = this.options.constrainWidth
                ? this.el.getBoundingClientRect().width
                : this.dropdownEl.getBoundingClientRect().width;
            this.dropdownEl.style.width = idealWidth + 'px';
            const positionInfo = this._getDropdownPosition(closestOverflowParent);
            this.dropdownEl.style.left = positionInfo.x + 'px';
            this.dropdownEl.style.top = positionInfo.y + 'px';
            this.dropdownEl.style.height = positionInfo.height + 'px';
            this.dropdownEl.style.width = positionInfo.width + 'px';
            this.dropdownEl.style.transformOrigin = `${positionInfo.horizontalAlignment === 'left' ? '0' : '100%'} ${positionInfo.verticalAlignment === 'top' ? '0' : '100%'}`;
        }
        /**
         * Open dropdown.
         */
        open = () => {
            if (this.isOpen)
                return;
            this.isOpen = true;
            // onOpenStart callback
            if (typeof this.options.onOpenStart === 'function') {
                this.options.onOpenStart.call(this, this.el);
            }
            // Reset styles
            this._resetDropdownStyles();
            this.dropdownEl.style.display = 'block';
            this._placeDropdown();
            this._animateIn();
            // Do this one frame later so that we don't bind an event handler that's immediately
            // called when the event bubbles up to the document and closes the dropdown
            setTimeout(() => this._setupTemporaryEventHandlers(), 0);
            this.el.ariaExpanded = 'true';
        };
        /**
         * Close dropdown.
         */
        close = () => {
            if (!this.isOpen)
                return;
            this.isOpen = false;
            this.focusedIndex = -1;
            // onCloseStart callback
            if (typeof this.options.onCloseStart === 'function') {
                this.options.onCloseStart.call(this, this.el);
            }
            this._animateOut();
            this._removeTemporaryEventHandlers();
            if (this.options.autoFocus) {
                this.el.focus();
            }
            this.el.ariaExpanded = 'false';
        };
        /**
         * While dropdown is open, you can recalculate its dimensions if its contents have changed.
         */
        recalculateDimensions = () => {
            if (this.isOpen) {
                this._resetDropdownPositioningStyles();
                this._placeDropdown();
            }
        };
    }

    const _defaults$3 = {
        classes: '',
        dropdownOptions: {}
    };
    class FormSelect extends Component {
        /** If this is a multiple select. */
        isMultiple;
        /**
         * Label associated with the current select element.
         * Is "null", if not detected.
         */
        labelEl;
        /** Dropdown UL element. */
        dropdownOptions;
        /** Text input that shows current selected option. */
        input;
        /** Instance of the dropdown plugin for this select. */
        dropdown;
        /** The select wrapper element. */
        wrapper;
        selectOptions;
        _values;
        nativeTabIndex;
        constructor(el, options) {
            super(el, options, FormSelect);
            if (this.el.classList.contains('browser-default'))
                return;
            this.el['M_FormSelect'] = this;
            this.options = {
                ...FormSelect.defaults,
                ...options
            };
            this.isMultiple = this.el.multiple;
            this.nativeTabIndex = this.el.tabIndex ?? -1;
            this.el.tabIndex = -1;
            this._values = [];
            this._setupDropdown();
            this._setupEventHandlers();
        }
        static get defaults() {
            return _defaults$3;
        }
        /**
         * Initializes instances of FormSelect.
         * @param els HTML elements.
         * @param options Component options.
         */
        static init(els, options = {}) {
            return super.init(els, options, FormSelect);
        }
        static getInstance(el) {
            return el['M_FormSelect'];
        }
        destroy() {
            this._removeEventHandlers();
            this._removeDropdown();
            this.el['M_FormSelect'] = undefined;
        }
        _setupEventHandlers() {
            this.dropdownOptions.querySelectorAll('li:not(.optgroup)').forEach((el) => {
                el.addEventListener('click', this._handleOptionClick);
                el.addEventListener('keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter')
                        this._handleOptionClick(e);
                });
            });
            this.el.addEventListener('change', this._handleSelectChange);
            this.input.addEventListener('click', this._handleInputClick);
        }
        _removeEventHandlers() {
            this.dropdownOptions.querySelectorAll('li:not(.optgroup)').forEach((el) => {
                el.removeEventListener('click', this._handleOptionClick);
            });
            this.el.removeEventListener('change', this._handleSelectChange);
            this.input.removeEventListener('click', this._handleInputClick);
        }
        _handleSelectChange = () => {
            this._setValueToInput();
        };
        _handleOptionClick = (e) => {
            e.preventDefault();
            const virtualOption = e.target.closest('li');
            this._selectOptionElement(virtualOption);
            e.stopPropagation();
        };
        _arraysEqual(a, b) {
            if (a === b)
                return true;
            if (a == null || b == null)
                return false;
            if (a.length !== b.length)
                return false;
            for (let i = 0; i < a.length; ++i)
                if (a[i] !== b[i])
                    return false;
            return true;
        }
        _selectOptionElement(virtualOption) {
            if (!virtualOption.classList.contains('disabled') &&
                !virtualOption.classList.contains('optgroup')) {
                const value = this._values.find((value) => value.optionEl === virtualOption);
                const previousSelectedValues = this.getSelectedValues();
                if (this.isMultiple) {
                    // Multi-Select
                    this._toggleEntryFromArray(value);
                }
                else {
                    // Single-Select
                    this._deselectAll();
                    this._selectValue(value);
                }
                // Refresh Input-Text
                this._setValueToInput();
                // Trigger Change-Event only when data is different
                const actualSelectedValues = this.getSelectedValues();
                const selectionHasChanged = !this._arraysEqual(previousSelectedValues, actualSelectedValues);
                if (selectionHasChanged)
                    this.el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true, composed: true })); // trigger('change');
            }
            if (!this.isMultiple)
                this.dropdown.close();
        }
        _handleInputClick = () => {
            if (this.dropdown && this.dropdown.isOpen) {
                this._setValueToInput();
                this._setSelectedStates();
            }
        };
        _setupDropdown() {
            this.labelEl = document.querySelector('[for="' + this.el.id + '"]');
            this.wrapper = document.createElement('div');
            this.wrapper.classList.add('select-wrapper', 'input-field');
            if (this.options.classes.length > 0) {
                this.wrapper.classList.add(...this.options.classes.split(' '));
            }
            this.el.before(this.wrapper);
            // Move actual select element into overflow hidden wrapper
            const hiddenDiv = document.createElement('div');
            hiddenDiv.classList.add('hide-select');
            this.wrapper.append(hiddenDiv);
            hiddenDiv.appendChild(this.el);
            if (this.el.disabled)
                this.wrapper.classList.add('disabled');
            this.selectOptions = (Array.from(this.el.children).filter((el) => ['OPTION', 'OPTGROUP'].includes(el.tagName)));
            // Create dropdown
            this.dropdownOptions = document.createElement('ul');
            this.dropdownOptions.id = `select-options-${Utils.guid()}`;
            this.dropdownOptions.setAttribute('popover', 'auto');
            this.dropdownOptions.classList.add('dropdown-content', 'select-dropdown');
            this.dropdownOptions.setAttribute('role', 'listbox');
            this.dropdownOptions.ariaMultiSelectable = this.isMultiple.toString();
            if (this.isMultiple)
                this.dropdownOptions.classList.add('multiple-select-dropdown');
            // Create dropdown structure
            if (this.selectOptions.length > 0) {
                this.selectOptions.forEach((realOption) => {
                    if (realOption.tagName === 'OPTION') {
                        // Option
                        const virtualOption = this._createAndAppendOptionWithIcon(realOption, this.isMultiple ? 'multiple' : undefined);
                        this._addOptionToValues(realOption, virtualOption);
                    }
                    else if (realOption.tagName === 'OPTGROUP') {
                        // Optgroup
                        const groupId = 'opt-group-' + Utils.guid();
                        const groupParent = document.createElement('li');
                        groupParent.classList.add('optgroup');
                        groupParent.tabIndex = -1;
                        groupParent.setAttribute('role', 'group');
                        groupParent.setAttribute('aria-labelledby', groupId);
                        groupParent.innerHTML = `<span id="${groupId}" role="presentation">${realOption.getAttribute('label')}</span>`;
                        this.dropdownOptions.append(groupParent);
                        const groupChildren = [];
                        const selectOptions = (Array.from(realOption.children).filter((el) => el.tagName === 'OPTION'));
                        selectOptions.forEach((realOption) => {
                            const virtualOption = this._createAndAppendOptionWithIcon(realOption, 'optgroup-option');
                            const childId = 'opt-child-' + Utils.guid();
                            virtualOption.id = childId;
                            groupChildren.push(childId);
                            this._addOptionToValues(realOption, virtualOption);
                        });
                        groupParent.setAttribute('aria-owns', groupChildren.join(' '));
                    }
                });
            }
            this.wrapper.append(this.dropdownOptions);
            // Add input dropdown
            this.input = document.createElement('input');
            this.input.id = 'm_select-input-' + Utils.guid();
            this.input.classList.add('select-dropdown', 'dropdown-trigger');
            this.input.type = 'text';
            this.input.readOnly = true;
            this.input.setAttribute('data-target', this.dropdownOptions.id);
            this.input.ariaReadOnly = 'true';
            this.input.ariaRequired = this.el.hasAttribute('required').toString(); //setAttribute("aria-required", this.el.hasAttribute("required"));
            if (this.el.disabled)
                this.input.disabled = true; // 'true');
            this.input.setAttribute('tabindex', this.nativeTabIndex.toString());
            const attrs = this.el.attributes;
            for (let i = 0; i < attrs.length; ++i) {
                const attr = attrs[i];
                if (attr.name.startsWith('aria-'))
                    this.input.setAttribute(attr.name, attr.value);
            }
            // Adds aria-attributes to input element
            this.input.setAttribute('role', 'combobox');
            this.input.ariaExpanded = 'false';
            this.input.setAttribute('aria-owns', this.dropdownOptions.id);
            this.input.setAttribute('aria-controls', this.dropdownOptions.id);
            this.input.placeholder = ' ';
            this.wrapper.prepend(this.input);
            this._setValueToInput();
            // Add caret
            const dropdownIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); //document.createElement('svg')
            dropdownIcon.classList.add('caret');
            dropdownIcon.setAttribute('height', '24');
            dropdownIcon.setAttribute('width', '24');
            dropdownIcon.setAttribute('viewBox', '0 0 24 24');
            dropdownIcon.ariaHidden = 'true';
            dropdownIcon.innerHTML = `<path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/>`;
            this.wrapper.prepend(dropdownIcon);
            // Initialize dropdown
            if (!this.el.disabled) {
                const dropdownOptions = { ...this.options.dropdownOptions };
                dropdownOptions.coverTrigger = false;
                const userOnOpenEnd = dropdownOptions.onOpenEnd;
                const userOnCloseEnd = dropdownOptions.onCloseEnd;
                // Add callback for centering selected option when dropdown content is scrollable
                dropdownOptions.onOpenEnd = () => {
                    const selectedOption = this.dropdownOptions.querySelector('.selected');
                    if (selectedOption) {
                        // Focus selected option in dropdown
                        Utils.keyDown = true;
                        this.dropdown.focusedIndex = [...selectedOption.parentNode.children].indexOf(selectedOption);
                        this.dropdown._focusFocusedItem();
                        Utils.keyDown = false;
                        // Handle scrolling to selected option
                        if (this.dropdown.isScrollable) {
                            let scrollOffset = selectedOption.getBoundingClientRect().top -
                                this.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
                            scrollOffset -= this.dropdownOptions.clientHeight / 2; // center in dropdown
                            this.dropdownOptions.scrollTop = scrollOffset;
                        }
                    }
                    this.input.ariaExpanded = 'true';
                    // Handle user declared onOpenEnd if needed
                    if (userOnOpenEnd && typeof userOnOpenEnd === 'function')
                        userOnOpenEnd.call(this.dropdown, this.el);
                };
                // Add callback for reseting "expanded" state
                dropdownOptions.onCloseEnd = () => {
                    this.input.ariaExpanded = 'false';
                    // Handle user declared onOpenEnd if needed
                    if (userOnCloseEnd && typeof userOnCloseEnd === 'function')
                        userOnCloseEnd.call(this.dropdown, this.el);
                };
                // Prevent dropdown from closing too early
                dropdownOptions.closeOnClick = false;
                this.dropdown = Dropdown.init(this.input, dropdownOptions);
            }
            // Add initial selections
            this._setSelectedStates();
            // move label
            if (this.labelEl)
                this.input.after(this.labelEl);
        }
        _addOptionToValues(realOption, virtualOption) {
            this._values.push({ el: realOption, optionEl: virtualOption });
        }
        _removeDropdown() {
            this.wrapper.querySelector('.caret').remove();
            this.input.remove();
            this.dropdownOptions.remove();
            this.wrapper.before(this.el);
            this.wrapper.remove();
        }
        _createAndAppendOptionWithIcon(realOption, type) {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            if (realOption.disabled) {
                li.classList.add('disabled');
                li.ariaDisabled = 'true';
            }
            if (type === 'optgroup-option')
                li.classList.add(type);
            // Text / Checkbox
            const span = document.createElement('span');
            span.innerHTML = realOption.innerHTML;
            if (this.isMultiple && !realOption.disabled) {
                span.innerHTML = `<label><input type="checkbox"><span>${realOption.innerHTML}</span></label>`;
            }
            li.appendChild(span);
            // add Icon
            const iconUrl = realOption.getAttribute('data-icon');
            const classes = realOption.getAttribute('class')?.split(' ');
            if (iconUrl) {
                const img = document.createElement('img');
                if (classes)
                    img.classList.add(...classes);
                img.src = iconUrl;
                img.ariaHidden = 'true';
                li.prepend(img);
            }
            // Check for multiple type
            this.dropdownOptions.append(li);
            return li;
        }
        _selectValue(value) {
            value.el.selected = true;
            value.optionEl.classList.add('selected');
            value.optionEl.ariaSelected = 'true'; // setAttribute("aria-selected", true);
            const checkbox = value.optionEl.querySelector('input[type="checkbox"]');
            if (checkbox)
                checkbox.checked = true;
        }
        _deselectValue(value) {
            value.el.selected = false;
            value.optionEl.classList.remove('selected');
            value.optionEl.ariaSelected = 'false'; //setAttribute("aria-selected", false);
            const checkbox = value.optionEl.querySelector('input[type="checkbox"]');
            if (checkbox)
                checkbox.checked = false;
        }
        _deselectAll() {
            this._values.forEach((value) => this._deselectValue(value));
        }
        _isValueSelected(value) {
            const realValues = this.getSelectedValues();
            return realValues.some((realValue) => realValue === value.el.value);
        }
        _toggleEntryFromArray(value) {
            if (this._isValueSelected(value))
                this._deselectValue(value);
            else
                this._selectValue(value);
        }
        _getSelectedOptions() {
            // remove null, false, ... values
            return Array.prototype.filter.call(this.el.selectedOptions, (realOption) => realOption);
        }
        _setValueToInput() {
            const selectedRealOptions = this._getSelectedOptions();
            const selectedOptionPairs = this._values.filter((value) => selectedRealOptions.indexOf(value.el) >= 0);
            // Filter not disabled
            const notDisabledOptionPairs = selectedOptionPairs.filter((op) => !op.el.disabled);
            const texts = notDisabledOptionPairs.map((value) => value.optionEl.querySelector('span').innerText.trim());
            // Set input-text to first Option with empty value which indicates a description like "choose your option"
            if (texts.length === 0) {
                const firstDisabledOption = this.el.querySelector('option:disabled');
                if (firstDisabledOption && firstDisabledOption.value === '') {
                    this.input.value = firstDisabledOption.innerText;
                    return;
                }
            }
            this.input.value = texts.join(', ');
        }
        _setSelectedStates() {
            this._values.forEach((value) => {
                const optionIsSelected = value.el.selected;
                const cb = value.optionEl.querySelector('input[type="checkbox"]');
                if (cb)
                    cb.checked = optionIsSelected;
                if (optionIsSelected) {
                    this._activateOption(this.dropdownOptions, value.optionEl);
                }
                else {
                    value.optionEl.classList.remove('selected');
                    value.optionEl.ariaSelected = 'false'; // attr("aria-selected", 'false');
                }
            });
        }
        _activateOption(ul, li) {
            if (!li)
                return;
            if (!this.isMultiple)
                ul.querySelectorAll('li.selected').forEach((li) => li.classList.remove('selected'));
            li.classList.add('selected');
            li.ariaSelected = 'true';
        }
        getSelectedValues() {
            return this._getSelectedOptions().map((realOption) => realOption.value);
        }
    }

    const _defaults$2 = {
        edge: 'left',
        draggable: true,
        dragTargetWidth: '10px',
        inDuration: 250,
        outDuration: 200,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        preventScrolling: true
    };
    class Sidenav extends Component {
        id;
        /** Describes open/close state of Sidenav. */
        isOpen;
        /** Describes if sidenav is fixed. */
        isFixed;
        /** Describes if Sidenav is being dragged. */
        isDragged;
        lastWindowWidth;
        lastWindowHeight;
        static _sidenavs;
        _overlay;
        dragTarget;
        _startingXpos;
        _xPos;
        _time;
        _width;
        _initialScrollTop;
        _verticallyScrolling;
        deltaX;
        velocityX;
        percentOpen;
        constructor(el, options) {
            super(el, options, Sidenav);
            this.el['M_Sidenav'] = this;
            this.options = {
                ...Sidenav.defaults,
                ...options
            };
            this.id = this.el.id;
            this.isOpen = false;
            this.isFixed = this.el.classList.contains('sidenav-fixed');
            this.isDragged = false;
            // Window size variables for window resize checks
            this.lastWindowWidth = window.innerWidth;
            this.lastWindowHeight = window.innerHeight;
            this._createOverlay();
            this._createDragTarget();
            this._setupEventHandlers();
            this._setupClasses();
            this._setupFixed();
            Sidenav._sidenavs.push(this);
        }
        static get defaults() {
            return _defaults$2;
        }
        /**
         * Initializes instances of Sidenav.
         * @param els HTML elements.
         * @param options Component options.
         */
        static init(els, options = {}) {
            return super.init(els, options, Sidenav);
        }
        static getInstance(el) {
            return el['M_Sidenav'];
        }
        destroy() {
            this._removeEventHandlers();
            this._enableBodyScrolling();
            this._overlay.parentNode.removeChild(this._overlay);
            this.dragTarget.parentNode.removeChild(this.dragTarget);
            this.el['M_Sidenav'] = undefined;
            this.el.style.transform = '';
            const index = Sidenav._sidenavs.indexOf(this);
            if (index >= 0) {
                Sidenav._sidenavs.splice(index, 1);
            }
        }
        _createOverlay() {
            this._overlay = document.createElement('div');
            this._overlay.classList.add('sidenav-overlay');
            this._overlay.addEventListener('click', this.close);
            document.body.appendChild(this._overlay);
        }
        _setupEventHandlers() {
            if (Sidenav._sidenavs.length === 0) {
                document.body.addEventListener('click', this._handleTriggerClick);
            }
            const passiveIfSupported = null;
            this.dragTarget.addEventListener('touchmove', this._handleDragTargetDrag, passiveIfSupported);
            this.dragTarget.addEventListener('touchend', this._handleDragTargetRelease);
            this._overlay.addEventListener('touchmove', this._handleCloseDrag, passiveIfSupported);
            this._overlay.addEventListener('touchend', this._handleCloseRelease);
            this.el.addEventListener('touchmove', this._handleCloseDrag); // , passiveIfSupported);
            this.el.addEventListener('touchend', this._handleCloseRelease);
            this.el.addEventListener('click', this._handleCloseTriggerClick);
            // Add resize for side nav fixed
            if (this.isFixed) {
                window.addEventListener('resize', this._handleWindowResize);
            }
            /* Set aria-hidden state */
            this._setAriaHidden();
            this._setTabIndex();
        }
        _removeEventHandlers() {
            if (Sidenav._sidenavs.length === 1) {
                document.body.removeEventListener('click', this._handleTriggerClick);
            }
            this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDrag);
            this.dragTarget.removeEventListener('touchend', this._handleDragTargetRelease);
            this._overlay.removeEventListener('touchmove', this._handleCloseDrag);
            this._overlay.removeEventListener('touchend', this._handleCloseRelease);
            this.el.removeEventListener('touchmove', this._handleCloseDrag);
            this.el.removeEventListener('touchend', this._handleCloseRelease);
            this.el.removeEventListener('click', this._handleCloseTriggerClick);
            // Remove resize for side nav fixed
            if (this.isFixed) {
                window.removeEventListener('resize', this._handleWindowResize);
            }
        }
        _handleTriggerClick(e) {
            const trigger = e.target.closest('.sidenav-trigger');
            if (e.target && trigger) {
                const sidenavId = Utils.getIdFromTrigger(trigger);
                const sidenavInstance = document.getElementById(sidenavId)['M_Sidenav'];
                if (sidenavInstance) {
                    sidenavInstance.open();
                }
                e.preventDefault();
            }
        }
        // Set variables needed at the beginning of drag and stop any current transition.
        _startDrag(e) {
            const clientX = e.targetTouches[0].clientX;
            this.isDragged = true;
            this._startingXpos = clientX;
            this._xPos = this._startingXpos;
            this._time = Date.now();
            this._width = this.el.getBoundingClientRect().width;
            this._overlay.style.display = 'block';
            this._initialScrollTop = this.isOpen ? this.el.scrollTop : Utils.getDocumentScrollTop();
            this._verticallyScrolling = false;
        }
        //Set variables needed at each drag move update tick
        _dragMoveUpdate(e) {
            const clientX = e.targetTouches[0].clientX;
            const currentScrollTop = this.isOpen ? this.el.scrollTop : Utils.getDocumentScrollTop();
            this.deltaX = Math.abs(this._xPos - clientX);
            this._xPos = clientX;
            this.velocityX = this.deltaX / (Date.now() - this._time);
            this._time = Date.now();
            if (this._initialScrollTop !== currentScrollTop) {
                this._verticallyScrolling = true;
            }
        }
        _handleDragTargetDrag = (e) => {
            // Check if draggable
            if (!this._isDraggable())
                return;
            let totalDeltaX = this._calculateDelta(e);
            const dragDirection = totalDeltaX > 0 ? 'right' : 'left';
            // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
            totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
            if (this.options.edge === dragDirection) {
                totalDeltaX = 0;
            }
            /**
             * transformX is the drag displacement
             * transformPrefix is the initial transform placement
             * Invert values if Sidenav is right edge
             */
            let transformX = totalDeltaX;
            let transformPrefix = 'translateX(-100%)';
            if (this.options.edge === 'right') {
                transformPrefix = 'translateX(100%)';
                transformX = -transformX;
            }
            // Calculate open/close percentage of sidenav, with open = 1 and close = 0
            this.percentOpen = Math.min(1, totalDeltaX / this._width);
            // Set transform and opacity styles
            this.el.style.transform = `${transformPrefix} translateX(${transformX}px)`;
            this._overlay.style.opacity = this.percentOpen.toString();
        };
        _handleDragTargetRelease = () => {
            if (this.isDragged) {
                if (this.percentOpen > 0.2) {
                    this.open();
                }
                else {
                    this._animateOut();
                }
                this.isDragged = false;
                this._verticallyScrolling = false;
            }
        };
        _handleCloseDrag = (e) => {
            // Check if open and draggable
            if (!this.isOpen || !this._isDraggable())
                return;
            let totalDeltaX = this._calculateDelta(e);
            // dragDirection is the attempted user drag direction
            const dragDirection = totalDeltaX > 0 ? 'right' : 'left';
            totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
            if (this.options.edge !== dragDirection) {
                totalDeltaX = 0;
            }
            let transformX = -totalDeltaX;
            if (this.options.edge === 'right') {
                transformX = -transformX;
            }
            // Calculate open/close percentage of sidenav, with open = 1 and close = 0
            this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);
            // Set transform and opacity styles
            this.el.style.transform = `translateX(${transformX}px)`;
            this._overlay.style.opacity = this.percentOpen.toString();
        };
        _calculateDelta = (e) => {
            // If not being dragged, set initial drag start variables
            if (!this.isDragged) {
                this._startDrag(e);
            }
            // Run touchmove updates
            this._dragMoveUpdate(e);
            // Calculate raw deltaX
            return this._xPos - this._startingXpos;
        };
        _handleCloseRelease = () => {
            if (this.isOpen && this.isDragged) {
                if (this.percentOpen > 0.8) {
                    this._animateIn();
                }
                else {
                    this.close();
                }
                this.isDragged = false;
                this._verticallyScrolling = false;
            }
        };
        // Handles closing of Sidenav when element with class .sidenav-close
        _handleCloseTriggerClick = (e) => {
            const closeTrigger = e.target.closest('.sidenav-close');
            if (closeTrigger && !this._isCurrentlyFixed()) {
                this.close();
            }
        };
        _handleWindowResize = () => {
            // Only handle horizontal resizes
            if (this.lastWindowWidth !== window.innerWidth) {
                if (window.innerWidth > 992) {
                    this.open();
                }
                else {
                    this.close();
                }
            }
            this.lastWindowWidth = window.innerWidth;
            this.lastWindowHeight = window.innerHeight;
        };
        _setupClasses() {
            if (this.options.edge === 'right') {
                this.el.classList.add('right-aligned');
                this.dragTarget.classList.add('right-aligned');
            }
        }
        _removeClasses() {
            this.el.classList.remove('right-aligned');
            this.dragTarget.classList.remove('right-aligned');
        }
        _setupFixed() {
            if (this._isCurrentlyFixed())
                this.open();
        }
        _isDraggable() {
            return this.options.draggable && !this._isCurrentlyFixed() && !this._verticallyScrolling;
        }
        _isCurrentlyFixed() {
            return this.isFixed && window.innerWidth > 992;
        }
        _createDragTarget() {
            const dragTarget = document.createElement('div');
            dragTarget.classList.add('drag-target');
            dragTarget.style.width = this.options.dragTargetWidth;
            document.body.appendChild(dragTarget);
            this.dragTarget = dragTarget;
        }
        _preventBodyScrolling() {
            document.body.style.overflow = 'hidden';
        }
        _enableBodyScrolling() {
            document.body.style.overflow = '';
        }
        /**
         * Opens Sidenav.
         */
        open = () => {
            if (this.isOpen === true)
                return;
            this.isOpen = true;
            // Run onOpenStart callback
            if (typeof this.options.onOpenStart === 'function') {
                this.options.onOpenStart.call(this, this.el);
            }
            // Handle fixed Sidenav
            if (this._isCurrentlyFixed()) {
                // Show if fixed
                this.el.style.transform = 'translateX(0)';
                this._enableBodyScrolling();
                this._overlay.style.display = 'none';
            }
            // Handle non-fixed Sidenav
            else {
                if (this.options.preventScrolling)
                    this._preventBodyScrolling();
                if (!this.isDragged || this.percentOpen != 1)
                    this._animateIn();
                /* Set aria-hidden state */
                this._setAriaHidden();
                this._setTabIndex();
            }
        };
        /**
         * Closes Sidenav.
         */
        close = () => {
            if (this.isOpen === false)
                return;
            this.isOpen = false;
            // Run onCloseStart callback
            if (typeof this.options.onCloseStart === 'function') {
                this.options.onCloseStart.call(this, this.el);
            }
            // Handle fixed Sidenav
            if (this._isCurrentlyFixed()) {
                const transformX = this.options.edge === 'left' ? '-105%' : '105%';
                this.el.style.transform = `translateX(${transformX})`;
            }
            // Handle non-fixed Sidenav
            else {
                this._enableBodyScrolling();
                if (!this.isDragged || this.percentOpen != 0) {
                    this._animateOut();
                }
                else {
                    this._overlay.style.display = 'none';
                }
                /* Set aria-hidden state */
                this._setAriaHidden();
                this._setTabIndex();
            }
        };
        _animateIn() {
            this._animateSidenavIn();
            this._animateOverlayIn();
        }
        _animateOut() {
            this._animateSidenavOut();
            this._animateOverlayOut();
        }
        _animateSidenavIn() {
            let slideOutPercent = this.options.edge === 'left' ? -1 : 1;
            if (this.isDragged) {
                slideOutPercent =
                    this.options.edge === 'left'
                        ? slideOutPercent + this.percentOpen
                        : slideOutPercent - this.percentOpen;
            }
            const duration = this.options.inDuration;
            // from
            this.el.style.transition = 'none';
            this.el.style.transform = 'translateX(' + slideOutPercent * 100 + '%)';
            setTimeout(() => {
                this.el.style.transition = `transform ${duration}ms ease`; // easeOutQuad
                // to
                this.el.style.transform = 'translateX(0)';
            }, 1);
            setTimeout(() => {
                if (typeof this.options.onOpenEnd === 'function')
                    this.options.onOpenEnd.call(this, this.el);
            }, duration);
        }
        _animateSidenavOut() {
            const endPercent = this.options.edge === 'left' ? -1 : 1;
            // let slideOutPercent = 0;
            // if (this.isDragged) {
            //   // @todo unused variable
            //   slideOutPercent =
            //     this.options.edge === 'left'
            //       ? endPercent + this.percentOpen
            //       : endPercent - this.percentOpen;
            // }
            const duration = this.options.outDuration;
            this.el.style.transition = `transform ${duration}ms ease`; // easeOutQuad
            // to
            this.el.style.transform = 'translateX(' + endPercent * 100 + '%)';
            setTimeout(() => {
                if (typeof this.options.onCloseEnd === 'function')
                    this.options.onCloseEnd.call(this, this.el);
            }, duration);
        }
        _animateOverlayIn() {
            let start = 0;
            if (this.isDragged)
                start = this.percentOpen;
            else
                this._overlay.style.display = 'block';
            // Animation
            const duration = this.options.inDuration;
            // from
            this._overlay.style.transition = 'none';
            this._overlay.style.opacity = start.toString();
            // easeOutQuad
            setTimeout(() => {
                this._overlay.style.transition = `opacity ${duration}ms ease`;
                // to
                this._overlay.style.opacity = '1';
            }, 1);
        }
        _animateOverlayOut() {
            const duration = this.options.outDuration;
            // easeOutQuad
            this._overlay.style.transition = `opacity ${duration}ms ease`;
            // to
            this._overlay.style.opacity = '0';
            setTimeout(() => {
                this._overlay.style.display = 'none';
            }, duration);
        }
        _setAriaHidden = () => {
            this.el.ariaHidden = this.isOpen ? 'false' : 'true';
            const navWrapper = document.querySelector('.nav-wrapper ul');
            if (navWrapper)
                navWrapper.ariaHidden = this.isOpen.toString();
        };
        _setTabIndex = () => {
            const navLinks = document.querySelectorAll('.nav-wrapper ul li a');
            const sideNavLinks = document.querySelectorAll('.sidenav li a');
            if (navLinks)
                navLinks.forEach((navLink) => {
                    navLink.tabIndex = this.isOpen ? -1 : 0;
                });
            if (sideNavLinks)
                sideNavLinks.forEach((sideNavLink) => {
                    sideNavLink.tabIndex = this.isOpen ? 0 : -1;
                });
        };
        static {
            Sidenav._sidenavs = [];
        }
    }

    const _defaults$1 = {
        duration: 200, // ms
        dist: -100, // zoom scale TODO: make this more intuitive as an option
        shift: 0, // spacing for center image
        padding: 0, // Padding between non center items
        numVisible: 5, // Number of visible items in carousel
        fullWidth: false, // Change to full width styles
        indicators: false, // Toggle indicators
        noWrap: false, // Don't wrap around and cycle through items.
        onCycleTo: null // Callback for when a new slide is cycled to.
    };
    class Carousel extends Component {
        hasMultipleSlides;
        showIndicators;
        noWrap;
        /** If the carousel is being clicked or tapped. */
        pressed;
        /** If the carousel is currently being dragged. */
        dragged;
        offset;
        target;
        images;
        itemWidth;
        itemHeight;
        dim;
        _indicators;
        count;
        xform;
        verticalDragged;
        reference;
        referenceY;
        velocity;
        frame;
        timestamp;
        ticker;
        amplitude;
        /** The index of the center carousel item. */
        center = 0;
        imageHeight;
        scrollingTimeout;
        oneTimeCallback;
        constructor(el, options) {
            super(el, options, Carousel);
            this.el['M_Carousel'] = this;
            this.options = {
                ...Carousel.defaults,
                ...options
            };
            // Setup
            this.hasMultipleSlides = this.el.querySelectorAll('.carousel-item').length > 1;
            this.showIndicators = this.options.indicators && this.hasMultipleSlides;
            this.noWrap = this.options.noWrap || !this.hasMultipleSlides;
            this.pressed = false;
            this.dragged = false;
            this.offset = this.target = 0;
            this.images = [];
            this.itemWidth = this.el.querySelector('.carousel-item').clientWidth;
            this.itemHeight = this.el.querySelector('.carousel-item').clientHeight;
            this.dim = this.itemWidth * 2 + this.options.padding || 1; // Make sure dim is non zero for divisions.
            // Full Width carousel setup
            if (this.options.fullWidth) {
                this.options.dist = 0;
                this._setCarouselHeight();
                // Offset fixed items when indicators.
                if (this.showIndicators) {
                    this.el.querySelector('.carousel-fixed-item')?.classList.add('with-indicators');
                }
            }
            // Iterate through slides
            this._indicators = document.createElement('ul');
            this._indicators.classList.add('indicators');
            this.el.querySelectorAll('.carousel-item').forEach((item, i) => {
                this.images.push(item);
                if (this.showIndicators) {
                    const indicator = document.createElement('li');
                    indicator.classList.add('indicator-item');
                    indicator.tabIndex = 0;
                    if (i === 0) {
                        indicator.classList.add('active');
                    }
                    this._indicators.appendChild(indicator);
                }
            });
            if (this.showIndicators)
                this.el.appendChild(this._indicators);
            this.count = this.images.length;
            // Cap numVisible at count
            this.options.numVisible = Math.min(this.count, this.options.numVisible);
            // Setup cross browser string
            this.xform = 'transform';
            ['webkit', 'Moz', 'O', 'ms'].every((prefix) => {
                const e = prefix + 'Transform';
                if (typeof document.body.style[e] !== 'undefined') {
                    this.xform = e;
                    return false;
                }
                return true;
            });
            this._setupEventHandlers();
            this._scroll(this.offset);
        }
        static get defaults() {
            return _defaults$1;
        }
        /**
         * Initializes instances of Carousel.
         * @param els HTML elements.
         * @param options Component options.
         */
        static init(els, options = {}) {
            return super.init(els, options, Carousel);
        }
        static getInstance(el) {
            return el['M_Carousel'];
        }
        destroy() {
            this._removeEventHandlers();
            this.el['M_Carousel'] = undefined;
        }
        _setupEventHandlers() {
            if (typeof window.ontouchstart !== 'undefined') {
                this.el.addEventListener('touchstart', this._handleCarouselTap);
                this.el.addEventListener('touchmove', this._handleCarouselDrag);
                this.el.addEventListener('touchend', this._handleCarouselRelease);
            }
            this.el.addEventListener('mousedown', this._handleCarouselTap);
            this.el.addEventListener('mousemove', this._handleCarouselDrag);
            this.el.addEventListener('mouseup', this._handleCarouselRelease);
            this.el.addEventListener('mouseleave', this._handleCarouselRelease);
            this.el.addEventListener('click', this._handleCarouselClick);
            if (this.showIndicators && this._indicators) {
                this._indicators.querySelectorAll('.indicator-item').forEach((el) => {
                    el.addEventListener('click', this._handleIndicatorClick);
                    el.addEventListener('keypress', this._handleIndicatorKeyPress);
                });
            }
            // Resize
            window.addEventListener('resize', this._handleThrottledResize);
        }
        _removeEventHandlers() {
            if (typeof window.ontouchstart !== 'undefined') {
                this.el.removeEventListener('touchstart', this._handleCarouselTap);
                this.el.removeEventListener('touchmove', this._handleCarouselDrag);
                this.el.removeEventListener('touchend', this._handleCarouselRelease);
            }
            this.el.removeEventListener('mousedown', this._handleCarouselTap);
            this.el.removeEventListener('mousemove', this._handleCarouselDrag);
            this.el.removeEventListener('mouseup', this._handleCarouselRelease);
            this.el.removeEventListener('mouseleave', this._handleCarouselRelease);
            this.el.removeEventListener('click', this._handleCarouselClick);
            if (this.showIndicators && this._indicators) {
                this._indicators.querySelectorAll('.indicator-item').forEach((el) => {
                    el.removeEventListener('click', this._handleIndicatorClick);
                });
            }
            window.removeEventListener('resize', this._handleThrottledResize);
        }
        _handleThrottledResize = () => Utils.throttle(this._handleResize, 200, null).bind(this);
        _handleCarouselTap = (e) => {
            // Fixes firefox draggable image bug
            if (e.type === 'mousedown' && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
            this.pressed = true;
            this.dragged = false;
            this.verticalDragged = false;
            this.reference = this._xpos(e);
            this.referenceY = this._ypos(e);
            this.velocity = this.amplitude = 0;
            this.frame = this.offset;
            this.timestamp = Date.now();
            clearInterval(this.ticker);
            this.ticker = setInterval(this._track, 100);
        };
        _handleCarouselDrag = (e) => {
            let x, y, delta, deltaY;
            if (this.pressed) {
                x = this._xpos(e);
                y = this._ypos(e);
                delta = this.reference - x;
                deltaY = Math.abs(this.referenceY - y);
                if (deltaY < 30 && !this.verticalDragged) {
                    // If vertical scrolling don't allow dragging.
                    if (delta > 2 || delta < -2) {
                        this.dragged = true;
                        this.reference = x;
                        this._scroll(this.offset + delta);
                    }
                }
                else if (this.dragged) {
                    // If dragging don't allow vertical scroll.
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                else {
                    // Vertical scrolling.
                    this.verticalDragged = true;
                }
            }
            if (this.dragged) {
                // If dragging don't allow vertical scroll.
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        _handleCarouselRelease = (e) => {
            if (this.pressed) {
                this.pressed = false;
            }
            else {
                return;
            }
            clearInterval(this.ticker);
            this.target = this.offset;
            if (this.velocity > 10 || this.velocity < -10) {
                this.amplitude = 0.9 * this.velocity;
                this.target = this.offset + this.amplitude;
            }
            this.target = Math.round(this.target / this.dim) * this.dim;
            // No wrap of items.
            if (this.noWrap) {
                if (this.target >= this.dim * (this.count - 1)) {
                    this.target = this.dim * (this.count - 1);
                }
                else if (this.target < 0) {
                    this.target = 0;
                }
            }
            this.amplitude = this.target - this.offset;
            this.timestamp = Date.now();
            requestAnimationFrame(this._autoScroll);
            if (this.dragged) {
                e.preventDefault();
                e.stopPropagation();
            }
            return false;
        };
        _handleCarouselClick = (e) => {
            // Disable clicks if carousel was dragged.
            if (this.dragged) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            else if (!this.options.fullWidth) {
                const clickedElem = e.target.closest('.carousel-item');
                if (!clickedElem)
                    return;
                const clickedIndex = [...clickedElem.parentNode.children].indexOf(clickedElem);
                const diff = this._wrap(this.center) - clickedIndex;
                // Disable clicks if carousel was shifted by click
                if (diff !== 0) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                // fixes https://github.com/materializecss/materialize/issues/180
                if (clickedIndex < 0) {
                    // relative X position > center of carousel = clicked at the right part of the carousel
                    if (e.clientX - e.target.getBoundingClientRect().left >
                        this.el.clientWidth / 2) {
                        this.next();
                    }
                    else {
                        this.prev();
                    }
                }
                else {
                    this._cycleTo(clickedIndex);
                }
            }
        };
        _handleIndicatorClick = (e) => {
            e.stopPropagation();
            this._handleIndicatorInteraction(e);
        };
        _handleIndicatorKeyPress = (e) => {
            e.stopPropagation();
            if (Utils.keys.ENTER.includes(e.key)) {
                this._handleIndicatorInteraction(e);
            }
        };
        _handleIndicatorInteraction = (e) => {
            const indicator = e.target.closest('.indicator-item');
            if (indicator) {
                const index = [...indicator.parentNode.children].indexOf(indicator);
                this._cycleTo(index);
            }
        };
        _handleResize = () => {
            if (this.options.fullWidth) {
                this.itemWidth = this.el.querySelector('.carousel-item').clientWidth;
                this.imageHeight = this.el.querySelector('.carousel-item.active').clientHeight;
                this.dim = this.itemWidth * 2 + this.options.padding;
                this.offset = this.center * 2 * this.itemWidth;
                this.target = this.offset;
                this._setCarouselHeight(true);
            }
            else {
                this._scroll();
            }
        };
        _setCarouselHeight(imageOnly = false) {
            const firstSlide = this.el.querySelector('.carousel-item.active')
                ? this.el.querySelector('.carousel-item.active')
                : this.el.querySelector('.carousel-item');
            const firstImage = firstSlide.querySelector('img');
            if (firstImage) {
                if (firstImage.complete) {
                    // If image won't trigger the load event
                    const imageHeight = firstImage.clientHeight;
                    if (imageHeight > 0) {
                        this.el.style.height = imageHeight + 'px';
                    }
                    else {
                        // If image still has no height, use the natural dimensions to calculate
                        const naturalWidth = firstImage.naturalWidth;
                        const naturalHeight = firstImage.naturalHeight;
                        const adjustedHeight = (this.el.clientWidth / naturalWidth) * naturalHeight;
                        this.el.style.height = adjustedHeight + 'px';
                    }
                }
                else {
                    // Get height when image is loaded normally
                    firstImage.addEventListener('load', () => {
                        this.el.style.height = firstImage.offsetHeight + 'px';
                    });
                }
            }
            else if (!imageOnly) {
                const slideHeight = firstSlide.clientHeight;
                this.el.style.height = slideHeight + 'px';
            }
        }
        _xpos(e) {
            // touch event
            if (e.type.startsWith('touch') && e.targetTouches.length >= 1) {
                return e.targetTouches[0].clientX;
            }
            // mouse event
            return e.clientX;
        }
        _ypos(e) {
            // touch event
            if (e.type.startsWith('touch') && e.targetTouches.length >= 1) {
                return e.targetTouches[0].clientY;
            }
            // mouse event
            return e.clientY;
        }
        _wrap(x) {
            return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + (x % this.count)) : x;
        }
        _track = () => {
            const now = Date.now(), elapsed = now - this.timestamp, delta = this.offset - this.frame, v = (1000 * delta) / (1 + elapsed);
            // now = Date.now();
            // elapsed = now - this.timestamp;
            this.timestamp = now;
            // delta = this.offset - this.frame;
            this.frame = this.offset;
            // v = (1000 * delta) / (1 + elapsed);
            this.velocity = 0.8 * v + 0.2 * this.velocity;
        };
        _autoScroll = () => {
            let elapsed, delta;
            if (this.amplitude) {
                elapsed = Date.now() - this.timestamp;
                delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
                if (delta > 2 || delta < -2) {
                    this._scroll(this.target - delta);
                    requestAnimationFrame(this._autoScroll);
                }
                else {
                    this._scroll(this.target);
                }
            }
        };
        _scroll(x = 0) {
            // Track scrolling state
            if (!this.el.classList.contains('scrolling')) {
                this.el.classList.add('scrolling');
            }
            if (this.scrollingTimeout != null) {
                clearTimeout(this.scrollingTimeout);
            }
            this.scrollingTimeout = setTimeout(() => {
                this.el.classList.remove('scrolling');
            }, this.options.duration);
            // Start actual scroll
            this.offset = typeof x === 'number' ? x : this.offset;
            this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
            const half = this.count >> 1, delta = this.offset - this.center * this.dim, dir = delta < 0 ? 1 : -1, tween = (-dir * delta * 2) / this.dim;
            let i, el, alignment, zTranslation, tweenedOpacity, centerTweenedOpacity;
            const lastCenter = this.center;
            const numVisibleOffset = 1 / this.options.numVisible;
            // delta = this.offset - this.center * this.dim;
            // dir = delta < 0 ? 1 : -1;
            // tween = (-dir * delta * 2) / this.dim;
            // half = this.count >> 1;
            if (this.options.fullWidth) {
                alignment = 'translateX(0)';
                centerTweenedOpacity = 1;
            }
            else {
                alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
                alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
                centerTweenedOpacity = 1 - numVisibleOffset * tween;
            }
            // Set indicator active
            if (this.showIndicators) {
                const diff = this.center % this.count;
                const activeIndicator = this._indicators.querySelector('.indicator-item.active');
                const activeIndicatorIndex = [...activeIndicator.parentNode.children].indexOf(activeIndicator);
                if (activeIndicatorIndex !== diff) {
                    activeIndicator.classList.remove('active');
                    const pos = diff < 0 ? this.count + diff : diff;
                    this._indicators.querySelectorAll('.indicator-item')[pos].classList.add('active');
                }
            }
            // center
            // Don't show wrapped items.
            if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
                el = this.images[this._wrap(this.center)];
                // Add active class to center item.
                if (!el.classList.contains('active')) {
                    this.el.querySelector('.carousel-item').classList.remove('active');
                    el.classList.add('active');
                }
                const transformString = `${alignment} translateX(${-delta / 2}px) translateX(${dir * this.options.shift * tween * i}px) translateZ(${this.options.dist * tween}px)`;
                this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
            }
            for (i = 1; i <= half; ++i) {
                // right side
                if (this.options.fullWidth) {
                    zTranslation = this.options.dist;
                    tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
                }
                else {
                    zTranslation = this.options.dist * (i * 2 + tween * dir);
                    tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
                }
                // Don't show wrapped items.
                if (!this.noWrap || this.center + i < this.count) {
                    el = this.images[this._wrap(this.center + i)];
                    const transformString = `${alignment} translateX(${this.options.shift + (this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
                    this._updateItemStyle(el, tweenedOpacity, -i, transformString);
                }
                // left side
                if (this.options.fullWidth) {
                    zTranslation = this.options.dist;
                    tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
                }
                else {
                    zTranslation = this.options.dist * (i * 2 - tween * dir);
                    tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
                }
                // Don't show wrapped items.
                if (!this.noWrap || this.center - i >= 0) {
                    el = this.images[this._wrap(this.center - i)];
                    const transformString = `${alignment} translateX(${-this.options.shift + (-this.dim * i - delta) / 2}px) translateZ(${zTranslation}px)`;
                    this._updateItemStyle(el, tweenedOpacity, -i, transformString);
                }
            }
            // center
            // Don't show wrapped items.
            if (!this.noWrap || (this.center >= 0 && this.center < this.count)) {
                el = this.images[this._wrap(this.center)];
                const transformString = `${alignment} translateX(${-delta / 2}px) translateX(${dir * this.options.shift * tween}px) translateZ(${this.options.dist * tween}px)`;
                this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
            }
            // onCycleTo callback
            const _currItem = this.el.querySelectorAll('.carousel-item')[this._wrap(this.center)];
            if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
                this.options.onCycleTo.call(this, _currItem, this.dragged);
            }
            // One time callback
            if (typeof this.oneTimeCallback === 'function') {
                this.oneTimeCallback.call(this, _currItem, this.dragged);
                this.oneTimeCallback = null;
            }
        }
        _updateItemStyle(el, opacity, zIndex, transform) {
            el.style[this.xform] = transform;
            el.style.zIndex = zIndex.toString();
            el.style.opacity = opacity.toString();
            el.style.visibility = 'visible';
        }
        _cycleTo(n, callback = null) {
            let diff = (this.center % this.count) - n;
            // Account for wraparound.
            if (!this.noWrap) {
                if (diff < 0) {
                    if (Math.abs(diff + this.count) < Math.abs(diff)) {
                        diff += this.count;
                    }
                }
                else if (diff > 0) {
                    if (Math.abs(diff - this.count) < diff) {
                        diff -= this.count;
                    }
                }
            }
            this.target = this.dim * Math.round(this.offset / this.dim);
            // Next
            if (diff < 0) {
                this.target += this.dim * Math.abs(diff);
            } // Prev
            else if (diff > 0) {
                this.target -= this.dim * diff;
            }
            // Set one time callback
            if (typeof callback === 'function') {
                this.oneTimeCallback = callback;
            }
            // Scroll
            if (this.offset !== this.target) {
                this.amplitude = this.target - this.offset;
                this.timestamp = Date.now();
                requestAnimationFrame(this._autoScroll);
            }
        }
        /**
         * Move carousel to next slide or go forward a given amount of slides.
         * @param n How many times the carousel slides.
         */
        next(n = 1) {
            if (n === undefined || isNaN(n)) {
                n = 1;
            }
            let index = this.center + n;
            if (index >= this.count || index < 0) {
                if (this.noWrap)
                    return;
                index = this._wrap(index);
            }
            this._cycleTo(index);
        }
        /**
         * Move carousel to previous slide or go back a given amount of slides.
         * @param n How many times the carousel slides.
         */
        prev(n = 1) {
            if (n === undefined || isNaN(n)) {
                n = 1;
            }
            let index = this.center - n;
            if (index >= this.count || index < 0) {
                if (this.noWrap)
                    return;
                index = this._wrap(index);
            }
            this._cycleTo(index);
        }
        /**
         * Move carousel to nth slide.
         * @param n Index of slide.
         * @param callback "onCycleTo" optional callback.
         */
        set(n, callback) {
            if (n === undefined || isNaN(n)) {
                n = 0;
            }
            if (n > this.count || n < 0) {
                if (this.noWrap)
                    return;
                n = this._wrap(n);
            }
            this._cycleTo(n, callback);
        }
    }

    const _defaults = {
        duration: 300,
        onShow: null,
        swipeable: false,
        responsiveThreshold: Infinity // breakpoint for swipeable
    };
    class Tabs extends Component {
        _tabLinks;
        _index;
        _indicator;
        _tabWidth;
        _tabsWidth;
        _tabsCarousel;
        _activeTabLink;
        _content;
        constructor(el, options) {
            super(el, options, Tabs);
            this.el['M_Tabs'] = this;
            this.options = {
                ...Tabs.defaults,
                ...options
            };
            this._tabLinks = this.el.querySelectorAll('li.tab > a');
            this._index = 0;
            this._setupActiveTabLink();
            if (this.options.swipeable) {
                this._setupSwipeableTabs();
            }
            else {
                this._setupNormalTabs();
            }
            // Setup tabs indicator after content to ensure accurate widths
            this._setTabsAndTabWidth();
            this._createIndicator();
            this._setupEventHandlers();
        }
        static get defaults() {
            return _defaults;
        }
        /**
         * Initializes instances of Tabs.
         * @param els HTML elements.
         * @param options Component options.
         */
        static init(els, options = {}) {
            return super.init(els, options, Tabs);
        }
        static getInstance(el) {
            return el['M_Tabs'];
        }
        destroy() {
            this._removeEventHandlers();
            this._indicator.parentNode.removeChild(this._indicator);
            if (this.options.swipeable) {
                this._teardownSwipeableTabs();
            }
            else {
                this._teardownNormalTabs();
            }
            this.el['M_Tabs'] = undefined;
        }
        /**
         * The index of tab that is currently shown.
         */
        get index() {
            return this._index;
        }
        _setupEventHandlers() {
            window.addEventListener('resize', this._handleWindowResize);
            this.el.addEventListener('click', this._handleTabClick);
        }
        _removeEventHandlers() {
            window.removeEventListener('resize', this._handleWindowResize);
            this.el.removeEventListener('click', this._handleTabClick);
        }
        _handleWindowResize = () => {
            this._setTabsAndTabWidth();
            if (this._tabWidth !== 0 && this._tabsWidth !== 0) {
                this._indicator.style.left = this._calcLeftPos(this._activeTabLink) + 'px';
                this._indicator.style.right = this._calcRightPos(this._activeTabLink) + 'px';
            }
        };
        _handleTabClick = (e) => {
            let tabLink = e.target;
            if (!tabLink)
                return;
            let tab = tabLink.parentElement;
            while (tab && !tab.classList.contains('tab')) {
                tabLink = tabLink.parentElement;
                tab = tab.parentElement;
            }
            // Handle click on tab link only
            if (!tabLink || !tab.classList.contains('tab'))
                return;
            // is disabled?
            if (tab.classList.contains('disabled')) {
                e.preventDefault();
                return;
            }
            // Act as regular link if target attribute is specified.
            if (tabLink.hasAttribute('target'))
                return;
            // Make the old tab inactive.
            this._activeTabLink.classList.remove('active');
            const _oldContent = this._content;
            // Update the variables with the new link and content
            this._activeTabLink = tabLink;
            if (tabLink.hash)
                this._content = document.querySelector(tabLink.hash);
            this._tabLinks = this.el.querySelectorAll('li.tab > a');
            // Make the tab active
            this._activeTabLink.classList.add('active');
            const prevIndex = this._index;
            this._index = Math.max(Array.from(this._tabLinks).indexOf(tabLink), 0);
            // Swap content
            if (this.options.swipeable) {
                if (this._tabsCarousel) {
                    this._tabsCarousel.set(this._index, () => {
                        if (typeof this.options.onShow === 'function')
                            this.options.onShow.call(this, this._content);
                    });
                }
            }
            else {
                if (this._content) {
                    this._content.style.display = 'block';
                    this._content.classList.add('active');
                    if (typeof this.options.onShow === 'function')
                        this.options.onShow.call(this, this._content);
                    if (_oldContent && _oldContent !== this._content) {
                        _oldContent.style.display = 'none';
                        _oldContent.classList.remove('active');
                    }
                }
            }
            // Update widths after content is swapped (scrollbar bugfix)
            this._setTabsAndTabWidth();
            this._animateIndicator(prevIndex);
            e.preventDefault();
        };
        _createIndicator() {
            const indicator = document.createElement('li');
            indicator.classList.add('indicator');
            this.el.appendChild(indicator);
            this._indicator = indicator;
            this._indicator.style.left = this._calcLeftPos(this._activeTabLink) + 'px';
            this._indicator.style.right = this._calcRightPos(this._activeTabLink) + 'px';
        }
        _setupActiveTabLink() {
            // If the location.hash matches one of the links, use that as the active tab.
            this._activeTabLink = Array.from(this._tabLinks).find((a) => a.getAttribute('href') === location.hash);
            // If no match is found, use the first link or any with class 'active' as the initial active tab.
            if (!this._activeTabLink) {
                let activeTabLink = this.el.querySelector('li.tab a.active');
                if (!activeTabLink) {
                    activeTabLink = this.el.querySelector('li.tab a');
                }
                this._activeTabLink = activeTabLink;
            }
            Array.from(this._tabLinks).forEach((a) => a.classList.remove('active'));
            this._activeTabLink.classList.add('active');
            this._index = Math.max(Array.from(this._tabLinks).indexOf(this._activeTabLink), 0);
            if (this._activeTabLink && this._activeTabLink.hash) {
                this._content = document.querySelector(this._activeTabLink.hash);
                if (this._content)
                    this._content.classList.add('active');
            }
        }
        _setupSwipeableTabs() {
            // Change swipeable according to responsive threshold
            if (window.innerWidth > this.options.responsiveThreshold)
                this.options.swipeable = false;
            const tabsContent = [];
            this._tabLinks.forEach((a) => {
                if (a.hash) {
                    const currContent = document.querySelector(a.hash);
                    currContent.classList.add('carousel-item');
                    tabsContent.push(currContent);
                }
            });
            // Create Carousel-Wrapper around Tab-Contents
            const tabsWrapper = document.createElement('div');
            tabsWrapper.classList.add('tabs-content', 'carousel', 'carousel-slider');
            // Wrap around
            tabsContent[0].parentElement.insertBefore(tabsWrapper, tabsContent[0]);
            tabsContent.forEach((tabContent) => {
                tabsWrapper.appendChild(tabContent);
                tabContent.style.display = '';
            });
            // Keep active tab index to set initial carousel slide
            const tab = this._activeTabLink.parentElement;
            const activeTabIndex = Array.from(tab.parentNode.children).indexOf(tab);
            this._tabsCarousel = Carousel.init(tabsWrapper, {
                fullWidth: true,
                noWrap: true,
                onCycleTo: (item) => {
                    const prevIndex = this._index;
                    this._index = Array.from(item.parentNode.children).indexOf(item);
                    this._activeTabLink.classList.remove('active');
                    this._activeTabLink = Array.from(this._tabLinks)[this._index];
                    this._activeTabLink.classList.add('active');
                    this._animateIndicator(prevIndex);
                    if (typeof this.options.onShow === 'function')
                        this.options.onShow.call(this, this._content);
                }
            });
            // Set initial carousel slide to active tab
            this._tabsCarousel.set(activeTabIndex);
        }
        _teardownSwipeableTabs() {
            const tabsWrapper = this._tabsCarousel.el;
            this._tabsCarousel.destroy();
            // Unwrap
            tabsWrapper.append(tabsWrapper.parentElement);
            tabsWrapper.remove();
        }
        _setupNormalTabs() {
            // Hide Tabs Content
            Array.from(this._tabLinks).forEach((a) => {
                if (a === this._activeTabLink)
                    return;
                if (a.hash) {
                    const currContent = document.querySelector(a.hash);
                    if (currContent)
                        currContent.style.display = 'none';
                }
            });
        }
        _teardownNormalTabs() {
            // show Tabs Content
            this._tabLinks.forEach((a) => {
                if (a.hash) {
                    const currContent = document.querySelector(a.hash);
                    if (currContent)
                        currContent.style.display = '';
                }
            });
        }
        _setTabsAndTabWidth() {
            this._tabsWidth = this.el.getBoundingClientRect().width;
            this._tabWidth = Math.max(this._tabsWidth, this.el.scrollWidth) / this._tabLinks.length;
        }
        _calcRightPos(el) {
            return Math.ceil(this._tabsWidth - el.offsetLeft - el.getBoundingClientRect().width);
        }
        _calcLeftPos(el) {
            return Math.floor(el.offsetLeft);
        }
        /**
         * Recalculate tab indicator position. This is useful when
         * the indicator position is not correct.
         */
        updateTabIndicator() {
            this._setTabsAndTabWidth();
            this._animateIndicator(this._index);
        }
        _animateIndicator(prevIndex) {
            let leftDelay = 0, rightDelay = 0;
            const isMovingLeftOrStaying = this._index - prevIndex >= 0;
            if (isMovingLeftOrStaying)
                leftDelay = 90;
            else
                rightDelay = 90;
            // in v1: easeOutQuad
            this._indicator.style.transition = `
      left ${this.options.duration}ms ease-out ${leftDelay}ms,
      right ${this.options.duration}ms ease-out ${rightDelay}ms`;
            this._indicator.style.left = this._calcLeftPos(this._activeTabLink) + 'px';
            this._indicator.style.right = this._calcRightPos(this._activeTabLink) + 'px';
        }
        /**
         * Show tab content that corresponds to the tab with the id.
         * @param tabId The id of the tab that you want to switch to.
         */
        select(tabId) {
            const tab = Array.from(this._tabLinks).find((a) => a.getAttribute('href') === '#' + tabId);
            if (tab)
                tab.click();
        }
    }

    class Forms {
        /**
         * Checks if the label has validation and apply
         * the correct class and styles
         * @param textfield
         */
        static validateField(textfield) {
            if (!textfield) {
                console.error('No text field element found');
                return;
            }
            const hasLength = textfield.getAttribute('data-length') !== null;
            const lenAttr = parseInt(textfield.getAttribute('data-length'));
            const len = textfield.value.length;
            if (len === 0 &&
                textfield.validity.badInput === false &&
                !textfield.required &&
                textfield.classList.contains('validate')) {
                textfield.classList.remove('invalid');
            }
            else if (textfield.classList.contains('validate')) {
                // Check for character counter attributes
                if ((textfield.validity.valid && hasLength && len <= lenAttr) ||
                    (textfield.validity.valid && !hasLength)) {
                    textfield.classList.remove('invalid');
                }
                else {
                    textfield.classList.add('invalid');
                }
            }
        }
        /**
         * Resizes the given TextArea after updating the
         *  value content dynamically.
         * @param e EventTarget
         */
        static textareaAutoResize(e) {
            const textarea = e;
            // if (!textarea) {
            //   console.error('No textarea element found');
            //   return;
            // }
            // Textarea Auto Resize
            let hiddenDiv = document.querySelector('.hiddendiv');
            if (!hiddenDiv) {
                hiddenDiv = document.createElement('div');
                hiddenDiv.classList.add('hiddendiv', 'common');
                document.body.append(hiddenDiv);
            }
            const style = getComputedStyle(textarea);
            // Set font properties of hiddenDiv
            const fontFamily = style.fontFamily; //textarea.css('font-family');
            const fontSize = style.fontSize; //textarea.css('font-size');
            const lineHeight = style.lineHeight; //textarea.css('line-height');
            // Firefox can't handle padding shorthand.
            const paddingTop = style.paddingTop; //getComputedStyle(textarea).css('padding-top');
            const paddingRight = style.paddingRight; //textarea.css('padding-right');
            const paddingBottom = style.paddingBottom; //textarea.css('padding-bottom');
            const paddingLeft = style.paddingLeft; //textarea.css('padding-left');
            if (fontSize)
                hiddenDiv.style.fontSize = fontSize; //('font-size', fontSize);
            if (fontFamily)
                hiddenDiv.style.fontFamily = fontFamily; //css('font-family', fontFamily);
            if (lineHeight)
                hiddenDiv.style.lineHeight = lineHeight; //css('line-height', lineHeight);
            if (paddingTop)
                hiddenDiv.style.paddingTop = paddingTop; //ss('padding-top', paddingTop);
            if (paddingRight)
                hiddenDiv.style.paddingRight = paddingRight; //css('padding-right', paddingRight);
            if (paddingBottom)
                hiddenDiv.style.paddingBottom = paddingBottom; //css('padding-bottom', paddingBottom);
            if (paddingLeft)
                hiddenDiv.style.paddingLeft = paddingLeft; //css('padding-left', paddingLeft);
            // Set original-height, if none
            if (!textarea.hasAttribute('original-height'))
                textarea.setAttribute('original-height', textarea.getBoundingClientRect().height.toString());
            if (textarea.getAttribute('wrap') === 'off') {
                hiddenDiv.style.overflowWrap = 'normal'; // ('overflow-wrap', 'normal')
                hiddenDiv.style.whiteSpace = 'pre'; //.css('white-space', 'pre');
            }
            hiddenDiv.innerText = textarea.value + '\n';
            hiddenDiv.innerHTML = hiddenDiv.innerHTML.replace(/\n/g, '<br>');
            // When textarea is hidden, width goes crazy.
            // Approximate with half of window size
            if (textarea.offsetWidth > 0 && textarea.offsetHeight > 0) {
                hiddenDiv.style.width = textarea.getBoundingClientRect().width + 'px'; // ('width', textarea.width() + 'px');
            }
            else {
                hiddenDiv.style.width = window.innerWidth / 2 + 'px'; //css('width', window.innerWidth / 2 + 'px');
            }
            // Resize if the new height is greater than the
            // original height of the textarea
            const originalHeight = parseInt(textarea.getAttribute('original-height'));
            const prevLength = parseInt(textarea.getAttribute('previous-length'));
            if (isNaN(originalHeight))
                return;
            if (originalHeight <= hiddenDiv.clientHeight) {
                textarea.style.height = hiddenDiv.clientHeight + 'px'; //css('height', hiddenDiv.innerHeight() + 'px');
            }
            else if (textarea.value.length < prevLength) {
                // In case the new height is less than original height, it
                // means the textarea has less text than before
                // So we set the height to the original one
                textarea.style.height = originalHeight + 'px';
            }
            textarea.setAttribute('previous-length', (textarea.value || '').length.toString());
        }
        static Init() {
            if (typeof document !== 'undefined')
                document?.addEventListener('DOMContentLoaded', () => {
                    document.addEventListener('change', (e) => {
                        const target = e.target;
                        if (target instanceof HTMLInputElement) {
                            if (target.value.length !== 0 || target.getAttribute('placeholder') !== null) {
                                for (const child of target.parentNode.children) {
                                    if (child.tagName == 'label') {
                                        child.classList.add('active');
                                    }
                                }
                            }
                            Forms.validateField(target);
                        }
                    });
                    document.addEventListener('keyup', (e) => {
                        const target = e.target;
                        // Radio and Checkbox focus class
                        if (target instanceof HTMLInputElement && ['radio', 'checkbox'].includes(target.type)) {
                            // TAB, check if tabbing to radio or checkbox.
                            if (Utils.keys.TAB.includes(e.key)) {
                                target.classList.add('tabbed');
                                target.addEventListener('blur', () => target.classList.remove('tabbed'), {
                                    once: true
                                });
                            }
                        }
                    });
                    document
                        .querySelectorAll('.materialize-textarea')
                        .forEach((textArea) => {
                        Forms.InitTextarea(textArea);
                    });
                    // File Input Path
                    document
                        .querySelectorAll('.file-field input[type="file"]')
                        .forEach((fileInput) => {
                        Forms.InitFileInputPath(fileInput);
                    });
                });
        }
        static InitTextarea(textarea) {
            // Save Data in Element
            textarea.setAttribute('original-height', textarea.getBoundingClientRect().height.toString());
            textarea.setAttribute('previous-length', (textarea.value || '').length.toString());
            Forms.textareaAutoResize(textarea);
            textarea.addEventListener('keyup', (e) => Forms.textareaAutoResize(e.target));
            textarea.addEventListener('keydown', (e) => Forms.textareaAutoResize(e.target));
        }
        static InitFileInputPath(fileInput) {
            fileInput.addEventListener('change', () => {
                const fileField = fileInput.closest('.file-field');
                const pathInput = fileField.querySelector('input.file-path');
                const files = fileInput.files;
                const filenames = [];
                for (let i = 0; i < files.length; i++) {
                    filenames.push(files[i].name);
                }
                pathInput.value = filenames.join(', ');
                pathInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true, composed: true }));
            });
        }
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const version = '2.2.2';
    /**
     * Automatically initialize components.
     * @param context Root element to initialize. Defaults to `document.body`.
     * @param options Options for each component.
     */
    function AutoInit(context = document.body, options) {
        const registry = {
            FormSelect: context.querySelectorAll('select:not(.no-autoinit)'),
            Sidenav: context.querySelectorAll('.sidenav:not(.no-autoinit)'),
            Tabs: context.querySelectorAll('.tabs:not(.no-autoinit)'),
        };
        FormSelect.init(registry.FormSelect, options?.FormSelect ?? {});
        Sidenav.init(registry.Sidenav, options?.Sidenav ?? {});
        Tabs.init(registry.Tabs, options?.Tabs ?? {});
    }

    exports.AutoInit = AutoInit;
    exports.FormSelect = FormSelect;
    exports.Forms = Forms;
    exports.Sidenav = Sidenav;
    exports.Tabs = Tabs;
    exports.version = version;

    return exports;

})({});
