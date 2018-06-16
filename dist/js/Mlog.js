/**
 * @author Marico <ok@nongshiye.com>
 * @description A console program whitch can shou consoled logs in pages
 */
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function Mlog(opt) {
	if (window.getMlog && typeof window.getMlog == 'function' && getMlog() instanceof Mlog) {
		return getMlog();
	}
	var $this = this;

	var $opt = opt,
	    $libs = {};
	var $container = void 0;
	var $useStorage = true;
	var $localforageIsReady = false;
	var $dbStores = [];
	var $dbIndex = null;
	var $dbLastLogId = 0;
	var $dbLastStoreIndex = 0;
	var $storeSize = 2000;
	var $Mdata = {};
	var $tmpLogsArr = [];
	$this.init = function () {
		if (isUseLocalForage()) {
			replaceConsole().then(initLocalForage).then(localForageInited).then(addTmpLog2Db);
		} else {
			replaceConsole().then(initLocalForage).then(localForageInited).catch(addTmpLog2Db);
		}
		addWrapper(creatWrapper()).then(function () {
			$container = document.getElementById("mlogMain");
		});
	};
	//Create Mlog wrapper 
	var creatWrapper = function creatWrapper() {
		var html = '\t\t\n\t\t<style type="text/css">\n\t\t\t#mlogWrapper {\n\t\t\t\tposition: fixed;\n\t\t\t\tdisplay: none;\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tbackground: rgba(30, 30, 30, .95);\n\t\t\t\tcolor: #f3f3f3;\n\t\t\t\tline-height: 1.5rem;\n\t\t\t\tpadding: 0;\n\t\t\t\tz-index: 9999;\n\t\t\t\tbottom: 0;\n\t\t\t\tmargin: 0 auto;\n\t\t\t\t-webkit-touch-callout: none;\n\t\t\t\t-webkit-user-select: none;\n\t\t\t\t-khtml-user-select: none;\n\t\t\t\t-moz-user-select: none;\n\t\t\t\t-ms-user-select: none;\n\t\t\t\tuser-select: none;\n\t\t\t}\n\t\t\t.mlogWrapper #mlogForm {\n\t\t\t\tposition:fixed;\n\t\t\t\tbottom:0;\n\t\t\t\tdisplay: none;\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 3rem;\n\t\t\t\t/*border: 1px solid rgba(250,250,250,.5);*/\n\t\t\t\tbackground: #444;\t\t\t\t\n\t\t\t\tbox-sizing: border-box;\n\t\t\t\tpadding: 0;\n\t\t\t\tmargin: 0;\n\t\t\t\tz-index:99999;/**/\n\t\t\t}\n\t\t\t.mlogWrapper #mlogFormInput {\n\t\t\t\tbackground: none;\n\t\t\t\tborder: 0;\n\t\t\t\toutline: 0;\n\t\t\t\twidth: 90%;\n\t\t\t\theight: 3rem;\n\t\t\t\tline-height: 1.4rem;\n\t\t\t\theight: auto;\n\t\t\t\tpadding: 0;\n\t\t\t\tcolor:#eee;\n\t\t\t}\n\t\t\t.mlogWrapper #mlogFormBt {\n\t\t\t\t/* display: inline-block; */\n\t\t\t\twidth: 8%;\n\t\t\t\ttext-align: center;\n\t\t\t\tline-height: 3rem;\n\t\t\t\tfloat: right;\n\t\t\t\tbackground: rgba(30, 30, 30, .95);\n\t\t\t\tcolor: #fff;\n\t\t\t\tborder-left: 1px solid #fff;\n\t\t\t}\n\t\t\t.mlogWrapper #mlogMain {\n\t\t\t\theight: calc(100% - 6rem);\n\t\t\t\toverflow-y: scroll;\n\t\t\t\toverflow-wrap: break-word;\n\t\t\t\toverflow-x: hidden;\n\t\t\t\tpadding: 1rem;\n\t\t\t}\n\t\t\t.mlogWrapper #mlogHeader {\n\t\t\t\theight: 2rem;\n\t\t\t\tline-height: 2rem;\n\t\t\t\twidth: 100%;\n\t\t\t\ttext-align: right;\n\t\t\t}\n\t\t\t.mlogWrapper #mlogHeader span {\n\t\t\t\tpadding: 0 1rem;\n\t\t\t}\n\n\t\t\t.mlogWrapper .mlog-item {\n\t\t\t\tline-height: 2rem;\n\t\t\t\tmin-height: 18px;\t\t\t\t\n\t\t\t}\n\t\t\t.mlogWrapper .mlog-item-type {\n\t\t\t\tcolor: #679;\n\t\t\t\tpadding-left: 1rem;\n\t\t\t}\n\t\t\t.mlogWrapper .tableMark{\n\t\t\t\tfont-style: normal;\n\t\t\t\tcolor: rgba(250, 250, 250, .05)\n\t\t\t}\n\t\t\t.mlogWrapper .isOpenedMark{\n\t\t\t\tfont-style: normal;\n\t\t\t}\n\t\t\t.isOpenedMark.avalable{\n\t\t\t\tvisibility: hidden;\n\t\t\t}\n\t\t</style>\n\t\t<div class="" id="mlogHeader">\n\t\t\t<span id="mlogMini" onclick="getMlog().setSize(\'min\');"> - </span>\n\t\t\t<span id="mlogHalf"  onclick="getMlog().setSize(\'half\');"> = </span>\n\t\t\t<span id="mlogMax"  onclick="getMlog().setSize(\'max\');"> + </span>\n\t\t\t<span id="mlogClear"  onclick="getMlog().clear();"> c </span>\n\t\t\t<span id="mlogClose"  onclick="getMlog().close();"> x </span>\n\t\t</div>\n\t\t<div class="" id="mlogMain">\n\t\t\t<p class="tc lh05" id="containerTitle"></p>\n\t\t</div>\n\t\t<div class="form" id="mlogForm">\n\t\t\t<textarea rows="2" id="mlogFormInput"> </textarea>\n\t\t\t<span id="mlogFormBt"> &gt; </span>\n\t\t</div>\t\t\t\n\t\t\t';
		var div = document.createElement('div');
		div.innerHTML = html;
		div.id = 'mlogWrapper';
		div.className = 'mlogWrapper';
		return div;
	};
	var addWrapper = function addWrapper(div) {
		document.body.appendChild(div);
		$container = document.getElementById("mlogMain");
		return new Promise(function (resolve) {
			resolve(true);
		});
	};

	//format single msg 
	var formatMsg = function formatMsg(msg) {
		var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		var _getDataType = getDataType(msg),
		    _getDataType2 = _slicedToArray(_getDataType, 2),
		    dataType = _getDataType2[0],
		    iteratable = _getDataType2[1];

		var arrLength = 'arrLength';
		if (dataType === 'Array') {
			arrLength = msg.length;
		}

		var msgObj = {
			type: type,
			content: msg,
			dataType: dataType,
			time: new Date().getTime(),
			iteratable: iteratable
		};
		if (arrLength !== 'arrLength') {
			msgObj.arrLength = arrLength;
		}

		try {
			throw new Error();
		} catch (e) {
			msgObj.stack = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
		}
		return msgObj;
	};

	var replaceConsole = function replaceConsole() {
		$libs.log = console.log;
		$libs.error = console.error;
		$libs.warn = console.warn;
		$libs.info = console.info;
		console.log = getNewFun('log');
		console.error = getNewFun('error');
		console.warn = getNewFun('warn');
		console.info = getNewFun('info');
		return new Promise(function (resolve) {
			resolve(true);
		});
	};
	var getNewFun = function getNewFun(type) {
		return function () {
			if (typeof $libs[type] === 'function') {
				if (arguments.length > 0) {
					var _$libs$type;

					(_$libs$type = $libs[type]).call.apply(_$libs$type, [null].concat(Array.prototype.slice.call(arguments)));
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = arguments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var msg = _step.value;

							addLog(formatMsg(msg, type));
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				} else {
					//nothing to log
				}
			} else {
				alert(type + ' is not a function');
			}
		};
	};

	var addHtmlItem = function addHtmlItem(msg) {
		return addChildNodes(document.getElementById("containerTitle"), 'getMlog().getLog(' + msg._id + ')', 'content', true);
	};

	var localForageInited = function localForageInited(lastId) {
		return new Promise(function (resolve, reject) {
			resolve(lastId);
		});
	};

	var addTmpLog2Db = function addTmpLog2Db(lastId) {
		if ($tmpLogsArr.length) {
			for (var i = 0; i < $tmpLogsArr.length; i++) {
				$tmpLogsArr[i]._id = lastId + i + 1;
				addToDb($tmpLogsArr[i]);
			}
		}
		$tmpLogsArr.splice(0, $tmpLogsArr.length); //cleat array 
	};

	var addLog = function addLog(msgObj) {
		if (isUseLocalForage() && !$localforageIsReady) {
			$tmpLogsArr.push(msgObj);
		} else {
			addToDb(msgObj);
		}
	};
	var addToDb = function addToDb(obj) {
		$dbLastLogId++;
		obj._id = $dbLastLogId;
		$Mdata['log_' + obj._id] = obj;
		addHtmlItem(obj);
		if ($localforageIsReady) {
			$dbIndex.setItem('lastLogId', $dbLastLogId);
			if (getDbLastStoreIndex($dbLastLogId) - $dbLastStoreIndex === 1) {
				$dbLastStoreIndex = getDbLastStoreIndex($dbLastLogId);
				creatDbStore($dbLastStoreIndex);
			}
			if (obj.content == '[object HTMLHeadElement]') obj.content = obj.content.outerHTML;
			$dbStores[$dbLastStoreIndex].setItem('log_' + obj._id, obj);
		}
	};

	var getDbLastStoreIndex = function getDbLastStoreIndex(dbLastLogId) {
		return Math.floor(dbLastLogId / $storeSize);
	};
	var isUseLocalForage = function isUseLocalForage() {
		return !(window.localforage === undefined) && $useStorage === true;
	};
	var addChildNodes = function addChildNodes(dom, log, path) /*if true ,show the message itself ,not children items*/{
		var showSelf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

		var msg = eval(log)[path];

		var _getDataType3 = getDataType(msg),
		    _getDataType4 = _slicedToArray(_getDataType3, 2),
		    dataType = _getDataType4[0],
		    iteratable = _getDataType4[1];

		var makeDOm4Self = function makeDOm4Self(parentPathName, curPath) {
			var childEl = document.createElement('div');
			var dateTypeSpan = document.createElement('span');
			var dateMainSpan = document.createElement('span');
			dateTypeSpan.className = 'mlog-item-type';
			dateTypeSpan.innerHTML = dataType;
			dateMainSpan.className = 'mlog-item-name';
			dateMainSpan.setAttribute('onclick', 'getMlog().addChilds(this);');
			childEl.setAttribute('name', parentPathName);
			childEl.setAttribute('path', curPath);
			childEl.appendChild(dateMainSpan);
			childEl.appendChild(dateTypeSpan);
			childEl.className = "mlog-item";
			if (iteratable) {
				dateMainSpan.innerHTML = '<i class="isOpenedMark" name="' + parentPathName + '_openedMark_' + curPath + '">\u25B8</i>' + getContent2Shown(msg);
			} else {
				dateMainSpan.innerHTML = '<i class="isOpenedMark avalable"  name="' + parentPathName + '_openedMark_' + curPath + '">\u25B8</i> ' + getContent2Shown(msg);
			}

			dom.parentNode.appendChild(childEl);
			dom.parentNode.setAttribute('depth', 0);
		};
		var makeDOm4Child = function makeDOm4Child(parentPathName, curPath) {
			var depth = dom.parentNode.getAttribute('depth') * 1;
			var childEl = document.createElement('div');
			var dateTypeSpan = document.createElement('span');
			var dateMainSpan = document.createElement('span');
			dateTypeSpan.className = 'mlog-item-type';
			dateTypeSpan.innerHTML = getDataType(msg[curPath])[0];
			dateMainSpan.className = 'mlog-item-name';
			dateMainSpan.setAttribute('onclick', 'getMlog().addChilds(this);');
			childEl.setAttribute('name', parentPathName);
			childEl.setAttribute('path', curPath);
			childEl.setAttribute('depth', depth + 1);
			childEl.appendChild(dateMainSpan);
			childEl.appendChild(dateTypeSpan);
			childEl.className = "mlog-item";
			if (getDataType(msg[curPath])[1]) {
				dateMainSpan.innerHTML = '<i class="tableMark">' + "├─".repeat(depth + 1) + ' </i>  <i class="isOpenedMark" name="' + parentPathName + '_openedMark_' + curPath + '">\u25B8</i>  ' + curPath + ': ' + getContent2Shown(msg[curPath]);
			} else {
				dateMainSpan.innerHTML = '<i class="tableMark">' + "├─".repeat(depth + 1) + ' </i>  <i class="isOpenedMark avalable" name="' + parentPathName + '_openedMark_' + curPath + '" >\u25B8</i>  ' + curPath + ': ' + getContent2Shown(msg[curPath]);
			}
			dom.parentNode.appendChild(childEl);
		};

		if (showSelf === true) {
			makeDOm4Self(log, path);
		} else {
			if (iteratable) {
				for (var key in msg) {
					makeDOm4Child(log + '[\'' + path + '\']', key);
				}
			}
		}
	};
	var getContent2Shown = function getContent2Shown(msg) {
		var dateType = getDataType(msg);
		var res = null;
		switch (dateType[0]) {
			case 'Object':
				res = ' { ' + Object.keys(msg).join(', ') + ' }';
				break;
			case 'Array':
				res = ' [ length: ' + msg.length + ' ]';
				break;
			case 'String':
				res = ' "' + msg + '"';
				break;
			case 'Number':
				res = ' ' + msg;
				break;
			default:
				break;
		}
		return res;
	};

	var getDataType = function getDataType(data) {
		var dataType = void 0,
		    iteratable = false;
		if (Object.prototype.toString.call(data) == '[object Object]') {
			dataType = 'Object';
			iteratable = true;
		} else if (Object.prototype.toString.call(data) == '[object Array]') {
			dataType = 'Array';
			iteratable = true;
		} else if (Object.prototype.toString.call(data) == '[object String]') {
			dataType = 'String';
		} else if (Object.prototype.toString.call(data) == '[object Number]') {
			dataType = 'Number';
		}
		return [dataType, iteratable];
	};
	var creatDbStore = function creatDbStore(index) {
		$dbStores[index] = localforage.createInstance({
			name: 'store' + index
		});
	};

	$this.addChilds = function (dom) {
		var log = dom.parentNode.getAttribute('name');
		var path = dom.parentNode.getAttribute('path');
		var childNodesIfExist = document.getElementsByName(log + '[\'' + path + '\']');
		if (childNodesIfExist.length > 0) {
			for (var i = childNodesIfExist.length - 1; i >= 0; i--) {
				childNodesIfExist[i].parentNode.removeChild(childNodesIfExist[i]);
			}
			document.getElementsByName(log + '_openedMark_' + path)[0].innerHTML = "▸";
			return 0;
		} else {
			addChildNodes(dom, log, path);
			document.getElementsByName(log + '_openedMark_' + path)[0].innerHTML = "▾";
			return 1;
		}
	};
	//set the wrapper size
	var setSize = function setSize(size) {
		var ht = '';
		switch (size) {
			case 'min':
				ht = '5rem';
				break;
			case 'max':
				ht = '100vh';
				break;
			case 'half':
				ht = '50vh';
				break;
			case 'hide':
				ht = '0';
				break;
			default:
				break;
		}
		document.getElementById("mlogWrapper").style.height = ht;
	};
	var clear = function clear() {
		document.getElementById("mlogMain").innerHTML = '<p class="tc lh05" id="containerTitle"></p>';
	};
	var close = function close() {
		document.getElementById("mlogWrapper").style.display = 'none';
	};
	var show = function show() {
		document.getElementById("mlogWrapper").style.display = 'block';
	};
	$this.show = function () {
		return show();
	};
	$this.close = function () {
		return close();
	};
	$this.clear = function () {
		return clear();
	};
	$this.setSize = function (size) {
		return setSize(size);
	};
	$this.getLog = function (id) {
		return $Mdata['log_' + id];
	};

	window.getMlog = function () {
		return $this;
	};

	var initLocalForage = function initLocalForage() {
		return new Promise(function (resolve, reject) {
			if (!isUseLocalForage()) {
				//not surport localForage		
				$dbLastLogId = 0;
				reject($dbLastLogId);
			} else {
				localforage.ready(function () {
					//creat db stored all indexes
					$dbIndex = localforage.createInstance({
						name: 'index'
					});
					$dbIndex.getItem('lastLogId').then(function (lastId) {

						if (isNaN(lastId)) {
							$dbLastLogId = 0;
						} else {
							$dbLastLogId = lastId + 0;
						}
						var i = 0;
						$dbLastStoreIndex = getDbLastStoreIndex($dbLastLogId);
						do {
							// create stores for logs by group
							creatDbStore(i);
							i++;
						} while (i <= $dbLastStoreIndex);
						i = null;
						$localforageIsReady = true;
						resolve($dbLastLogId);
					});
				});
			}
		});
	};
	$this.init();
}