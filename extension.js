const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const math = Me.imports.math.window.math;

const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Search = imports.ui.search;
const SearchDisplay = imports.ui.searchDisplay;

const IS_DEBUG = false;

function CalculatorResult(result) {
    this._init(result);
}

CalculatorResult.prototype = {
    _init: function (resultMeta) {
        this.actor = new St.Bin({
            reactive: true,
            track_hover: true,
            can_focus: true,
            style_class: 'ase-actor'
        });

        let content = new St.BoxLayout({
            vertical: false,
            style: 'width: 300px; height: 30px;'
        })

        this.actor.set_child(content);

        let result = new St.BoxLayout({
            vertical: true,
            style: 'width: 300px; height: 30px;'
        });

        content.add(result, {
            x_fill: false,
            x_align: St.Align.START
        });
        
        let nameLabel = new St.Label({
            text: resultMeta.expression,
            style_class: 'name-label'
        });

        let resultLabel = new St.Label({
            text: resultMeta.result,
        });

        result.add(nameLabel, {
            x_fill: false,
            x_align: St.Align.START
        });

         result.add(resultLabel, {
            x_fill: false,
            x_align: St.Align.START
        });
    }
}


const MathProvider = new Lang.Class({
    Name: 'MathProvider',
    Extends: Search.SearchProvider,

    _expression : "",
    _result: null,

    _init: function () {
        this.parent('MATH');
    },

    getInitialResultSet: function(raw_terms) {
      if (raw_terms.length == 0) {
        this.searchSystem.pushResults(this, []);
        return;
      } 

      
      try {
        let expression = raw_terms.toString()
        let searching = [{
            "expression": expression,
            "result": "" + math.eval("0 + " + expression),
            "show_icon": true
        }];
        this.searchSystem.pushResults(this, searching);
      } catch (e) {
        if(!IS_DEBUG) {
          this.searchSystem.pushResults(this, []);
        } else {
          let error = [{
              "expression": raw_terms.toString(),
              "result": "" + e.toString(),
              "show_icon": true
          }];
          this.searchSystem.pushResults(this, error);
        }
      }
    },

    getSubsearchResultSet: function (prevResults, terms) {
      this.getInitialResultSet(terms);
    },

    getResultMeta: function (result) {
      return result;
    },

    getResultMetas: function (ids, callback) {
        let metas = ids.map(this.getResultMeta, this);
        callback(metas);
    },

    createResultActor: function (resultMeta, terms) {
        let result = new CalculatorResult(resultMeta);
        return result.actor;
    },

    activateResult: function (id) {
    }
});


function init() {
}


let advancedSearchProvider = null;
function enable() {
  if(advancedSearchProvider == null) {
    advancedSearchProvider = new MathProvider();
    Main.overview.addSearchProvider(advancedSearchProvider);
  }
}

function disable() {
  if(advancedSearchProvider != null) {
        Main.overview.removeSearchProvider(advancedSearchProvider);
        advancedSearchProvider = null;
    }
}
