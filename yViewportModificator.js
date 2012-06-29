/**
 * This small library emulates one of the many features which implements the CSS media queries.
 * Library set class name for body element depending on the width of viewport.
 * This is similar to CSS media queries feature:
 *   "media screen and (min-width: 100px) and (max-width: 500px)"
 * 
 * All of this actually for browser IE versions less 9 (which not support CSS media queries).
 * 
 * @author Tikhomirov Yaroslav <tikhomirov.yaroslav@gmail.com>
 * 
 * @example 
 *   Basically you must include only one script into head tag:
 *   <script type="text/javascript" src="yViewportModificator.js"></script>
 *   
 *   Optionally you can set properties:
 *   <script type="text/javascript">
 *     yViewportModificator.configure({
 *       class_mask: 'someclass_',
 *       widths: [800, 1000, 1500]
 *     });
 *   </script>
 *   
 *   Maintained few of following options:
 *     class_mask - mask of class name which set for body tag ("body_" by default)
 *     widths - an array of integer values of the widths of the viewport ([320, 480, 600, 800, 1000, 1200, 1600] by default)
 * 
 * @version 1.0.3
 * @copyright Tikhomirov Yaroslav 2011
 */

var yViewportModificator = (function () {
	var module = {},
		element = null,
		opts = {
			/**
			 * Mask of class name
			 */
			class_mask: 'body_',
			/**
			 * An array of integer values of the widths of the viewport
			 */
			widths: [320, 480, 600, 800, 1000, 1200, 1600]
		};
	
	
	/**
	 * Calculates class name, which necessary set for body element.
	 * 
	 * @return {String} String of class name.
	 */
	function _generateClassName() {
		var iDocumentWidth = _getDocumentWidth(),
			sClassName = '',
			widthValuesCount = opts.widths.length;
		
		if (widthValuesCount === 1) {
			return opts.class_mask + opts.widths[0];
		}
		
		if (iDocumentWidth < opts.widths[0] || iDocumentWidth > opts.widths[widthValuesCount - 1]) {
			return '';
		}
		
		// class: min-max
		sClassName += opts.class_mask + opts.widths[0] + '-' + opts.widths[widthValuesCount - 1];
		
		for (var i = 0; i < widthValuesCount; i += 1) {
			if (iDocumentWidth < opts.widths[i]) {
				if (!opts.widths[i-1]) {
					break;
				}
				
				// class: lt_current-gt_current
				sClassName += ' ' + opts.class_mask + opts.widths[i-1] + '-' + opts.widths[i];
				
				if ((i - 1) > 0 && opts.widths[i + 1]) {
					// class: lt_current-max
					sClassName += ' ' + opts.class_mask + opts.widths[i-1] + '-' + opts.widths[widthValuesCount - 1];
				}
				
				break;
			}
		}
		
		return sClassName;
	}
	
	
	/**
	 * Cross-browser calculates the width of the browser window
	 *
	 * @returns {Number} The width of the browser window
	 */
	function _getDocumentWidth() {
		return document.compatMode == 'CSS1Compat' && !window.opera ?
			document.documentElement.clientWidth :
			document.body.clientWidth;
	}
	
	
	/**
	 * Returns a string of element's class that contains the generated class.
	 * 
	 * @returns {String} String of element's class.
	 */
	function _resetClass() {
		var sNewClassName = _generateClassName(),
			sCurrentClasses = element.className,
			oReg = new RegExp('\\s?' + opts.class_mask + '\\d+(-\\d+)?\\s?', "ig");
		
		if (sCurrentClasses.indexOf(opts.class_mask) >= 0) {
			sCurrentClasses = sCurrentClasses.replace(oReg, '');
		}
		
		sCurrentClasses += (sCurrentClasses.length > 0 && sNewClassName) ?
			' ' + sNewClassName : sNewClassName;
		
		return sCurrentClasses;
	}
	
	
	/**
	 * Define if browser is IE version less 9
	 * 
	 * @return {Boolean} true for IE < 9
	 */
	function _isIELt9() {
		return (! + "\v1"); // true for IE < 9
	}
	
	
	/**
	 * Extends the first object values following objects
	 * 
	 * @return {Object} Extended object
	 */
	function _extend() {
		var target;
		
		if (!arguments.length) {
			return {};
		}
		
		target = typeof arguments[0] === 'object' ? arguments[0] : {};
		
		if (arguments.length > 1) {
			for (var k = 1; k < arguments.length; k += 1) {
				target = _merge(target, arguments[k]);
			}
		}
		
		return target;
	}
	
	
	/**
	 * Merges two objects by keys first object
	 * 
	 * @return {Object} Target object
	 */
	function _merge(target, obj) {
		for (var key in obj) {
			if (key in target) {
				target[key] = obj[key];
			}
		}
		
		return target;
	}


	/**
	 * Event handler for change class name.
	 *
	 * @return {Void}
	 */
	function _setClassEvent() {
		var clasName = _resetClass();

		if (!clasName) {
			element.removeAttribute('class');
		} else {
			element.className = clasName;
		}
	}
	
	
	/**
	 * Set class name for body element
	 * 
	 * @return {Void}
	 */
	function _registerHandlers() {
		element = document.body;
		_setClassEvent();
		
		_addEvent(window, 'resize', function () {
			_setClassEvent();
		});
	}
	
	
	/**
	 * Add event for element
	 * 
	 * @param {Object} elem DOMElement, target for event
	 * @param {String} eventName Name of event
	 * @param {Function} fn Callback
	 * @return {Void}
	 */
	function _addEvent(elem, eventName, fn) {
		if (elem.addEventListener) {
			elem.addEventListener(eventName, fn);
		} else {
			elem.attachEvent('on' + eventName, fn);
		}
	}
	
	
	/**
	 * Initialize module
	 * 
	 * @return {Object} The module instance
	 */
	module.init = function () {
		if (_isIELt9()) {
			_addEvent(window, 'load', _registerHandlers);
		}
		
		return this;
	};
	
	
	/**
	 * Set options for module
	 * 
	 * @param {Object} options Hash of config options
	 * @return {Object} The module instance
	 */
	module.configure = function (options) {
		opts = _extend(opts, options);
		
		opts.widths.sort(function (a, b) {return a - b});
		
		return this;
	};
	
	
	return module || {};
} ()).init();