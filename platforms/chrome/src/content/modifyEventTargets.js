(() => {
    // Source: https://www.sqlpac.com/en/documents/javascript-listing-active-event-listeners.html
    EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function(a, b, c) {
        if (c==undefined) c=false;
        this._addEventListener(a,b,c);
        if (! this.eventListenerList) this.eventListenerList = {};
        if (! this.eventListenerList[a]) this.eventListenerList[a] = [];
        this.eventListenerList[a].push({listener:b,options:c});
    };

    // Source: https://www.sqlpac.com/en/documents/javascript-listing-active-event-listeners.html
    EventTarget.prototype._getEventListeners = function(a) {
        if (! this.eventListenerList) this.eventListenerList = {};
        if (a==undefined)  { return this.eventListenerList; }
        return this.eventListenerList[a];
    };
})();