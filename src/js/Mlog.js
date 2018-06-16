/**
 * @author Marico <ok@nongshiye.com>
 * @description A console program whitch can shou consoled logs in pages
 */
'use strict';
function Mlog(opt) {
	if (window.getMlog && typeof window.getMlog == 'function' && getMlog() instanceof Mlog) {
		return getMlog();
	}
	const $this = this;

	const $opt = opt,
		$libs = {};
	let $container;
	let $useStorage = true;
	let $localforageIsReady = false;
	const $dbStores = [];
	let $dbIndex = null;
	let $dbLastLogId = 0;
	let $dbLastStoreIndex = 0;
	const $storeSize = 2000;
	const $Mdata = {};
	const $tmpLogsArr = [];
	$this.init = function () {
		if (isUseLocalForage()) {
			replaceConsole().then(initLocalForage).then(localForageInited).then(addTmpLog2Db);
		} else {
			replaceConsole().then(initLocalForage).then(localForageInited).catch(addTmpLog2Db)
		}
		addWrapper(creatWrapper()).then(() => {
			$container = document.getElementById("mlogMain");
		});

	}
	//Create Mlog wrapper 
	let creatWrapper = function () {
		let html = `		
		<style type="text/css">
			#mlogWrapper {
				position: fixed;
				display: none;
				width: 100%;
				height: 100%;
				background: rgba(30, 30, 30, .95);
				color: #f3f3f3;
				line-height: 1.5rem;
				padding: 0;
				z-index: 9999;
				bottom: 0;
				margin: 0 auto;
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
			}
			.mlogWrapper #mlogForm {
				position:fixed;
				bottom:0;
				display: none;
				width: 100%;
				height: 3rem;
				/*border: 1px solid rgba(250,250,250,.5);*/
				background: #444;				
				box-sizing: border-box;
				padding: 0;
				margin: 0;
				z-index:99999;/**/
			}
			.mlogWrapper #mlogFormInput {
				background: none;
				border: 0;
				outline: 0;
				width: 90%;
				height: 3rem;
				line-height: 1.4rem;
				height: auto;
				padding: 0;
				color:#eee;
			}
			.mlogWrapper #mlogFormBt {
				/* display: inline-block; */
				width: 8%;
				text-align: center;
				line-height: 3rem;
				float: right;
				background: rgba(30, 30, 30, .95);
				color: #fff;
				border-left: 1px solid #fff;
			}
			.mlogWrapper #mlogMain {
				height: calc(100% - 6rem);
				overflow-y: scroll;
				overflow-wrap: break-word;
				overflow-x: hidden;
				padding: 1rem;
			}
			.mlogWrapper #mlogHeader {
				height: 2rem;
				line-height: 2rem;
				width: 100%;
				text-align: right;
			}
			.mlogWrapper #mlogHeader span {
				padding: 0 1rem;
			}

			.mlogWrapper .mlog-item {
				line-height: 2rem;
				min-height: 18px;				
			}
			.mlogWrapper .mlog-item-type {
				color: #679;
				padding-left: 1rem;
			}
			.mlogWrapper .tableMark{
				font-style: normal;
				color: rgba(250, 250, 250, .05)
			}
			.mlogWrapper .isOpenedMark{
				font-style: normal;
			}
			.isOpenedMark.avalable{
				visibility: hidden;
			}
		</style>
		<div class="" id="mlogHeader">
			<span id="mlogMini" onclick="getMlog().setSize('min');"> - </span>
			<span id="mlogHalf"  onclick="getMlog().setSize('half');"> = </span>
			<span id="mlogMax"  onclick="getMlog().setSize('max');"> + </span>
			<span id="mlogClear"  onclick="getMlog().clear();"> c </span>
			<span id="mlogClose"  onclick="getMlog().close();"> x </span>
		</div>
		<div class="" id="mlogMain">
			<p class="tc lh05" id="containerTitle"></p>
		</div>
		<div class="form" id="mlogForm">
			<textarea rows="2" id="mlogFormInput"> </textarea>
			<span id="mlogFormBt"> &gt; </span>
		</div>			
			`;
		let div = document.createElement('div');
		div.innerHTML = html;
		div.id = 'mlogWrapper';
		div.className = 'mlogWrapper';
		return div;
	}
	let addWrapper = function (div) {
		document.body.appendChild(div);
		$container = document.getElementById("mlogMain");
		return new Promise((resolve) => {
			resolve(true)
		})
	}

	//format single msg 
	let formatMsg = function (msg, type = null) {
		let [
			dataType,
			iteratable
		] = getDataType(msg);
		let arrLength = 'arrLength';
		if (dataType === 'Array') {
			arrLength = msg.length
		}

		let msgObj = {
			type: type,
			content: msg,
			dataType: dataType,
			time: new Date().getTime(),
			iteratable: iteratable
		}
		if (arrLength !== 'arrLength') {
			msgObj.arrLength = arrLength
		}

		try {
			throw new Error();
		} catch (e) {
			msgObj.stack = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
		}
		return msgObj;
	}

	let replaceConsole = function () {
		$libs.log = console.log;
		$libs.error = console.error;
		$libs.warn = console.warn;
		$libs.info = console.info;
		console.log = getNewFun('log');
		console.error = getNewFun('error');
		console.warn = getNewFun('warn');
		console.info = getNewFun('info');
		return new Promise((resolve) => {
			resolve(true)
		})
	}
	let getNewFun = function (type) {
		return function () {
			if (typeof $libs[type] === 'function') {
				if (arguments.length > 0) {
					$libs[type].call(null, ...arguments);
					for (let msg of arguments) {
						addLog(formatMsg(msg, type));
					}
				} else {
					//nothing to log
				}

			} else {
				alert(type + ' is not a function');
			}
		}
	}

	let addHtmlItem = function (msg) {
		return addChildNodes(document.getElementById("containerTitle"), `getMlog().getLog(${msg._id})`, 'content', true);
	}


	let localForageInited = function (lastId) {
		return new Promise((resolve, reject) => {
			resolve(lastId)
		})
	}

	let addTmpLog2Db = function (lastId) {
		if ($tmpLogsArr.length) {
			for (let i = 0; i < $tmpLogsArr.length; i++) {
				$tmpLogsArr[i]._id = lastId + i + 1
				addToDb($tmpLogsArr[i]);
			}
		}
		$tmpLogsArr.splice(0, $tmpLogsArr.length); //cleat array 
	}

	let addLog = function (msgObj) {
		if (isUseLocalForage() && (!$localforageIsReady)) {
			$tmpLogsArr.push(msgObj);
		} else {
			addToDb(msgObj);
		}
	}
	let addToDb = function (obj) {
		$dbLastLogId++;
		obj._id = $dbLastLogId;
		$Mdata['log_' + obj._id] = obj;
		addHtmlItem(obj);
		if ($localforageIsReady) {
			$dbIndex.setItem('lastLogId', $dbLastLogId)
			if ((getDbLastStoreIndex($dbLastLogId) - $dbLastStoreIndex) === 1) {
				$dbLastStoreIndex = getDbLastStoreIndex($dbLastLogId);
				creatDbStore($dbLastStoreIndex);
			}
			if (obj.content == '[object HTMLHeadElement]') obj.content = obj.content.outerHTML;
			$dbStores[$dbLastStoreIndex].setItem('log_' + obj._id, obj);
		}
	}

	let getDbLastStoreIndex = function (dbLastLogId) {
		return Math.floor(dbLastLogId / $storeSize);
	}
	let isUseLocalForage = function () {
		return (!(window.localforage === undefined) && ($useStorage === true))
	}
	let addChildNodes = function (dom, log, path, showSelf = false /*if true ,show the message itself ,not children items*/) {
		let msg = eval(log)[path]
		let [
			dataType,
			iteratable
		] = getDataType(msg);
		let makeDOm4Self = function (parentPathName, curPath) {
			let childEl = document.createElement('div');
			let dateTypeSpan = document.createElement('span');
			let dateMainSpan = document.createElement('span');
			dateTypeSpan.className = 'mlog-item-type';
			dateTypeSpan.innerHTML = dataType
			dateMainSpan.className = 'mlog-item-name';
			dateMainSpan.setAttribute('onclick', `getMlog().addChilds(this);`)
			childEl.setAttribute('name', parentPathName);
			childEl.setAttribute('path', curPath)
			childEl.appendChild(dateMainSpan)
			childEl.appendChild(dateTypeSpan)
			childEl.className = "mlog-item"
			if (iteratable) {
				dateMainSpan.innerHTML = `<i class="isOpenedMark" name="${parentPathName}_openedMark_${curPath}">▸</i>${getContent2Shown(msg)}`;
			} else {
				dateMainSpan.innerHTML = `<i class="isOpenedMark avalable"  name="${parentPathName}_openedMark_${curPath}">▸</i> ${getContent2Shown(msg)}`;
			}

			dom.parentNode.appendChild(childEl)
			dom.parentNode.setAttribute('depth', 0)
		}
		let makeDOm4Child = function (parentPathName, curPath) {
			let depth = dom.parentNode.getAttribute('depth') * 1;
			let childEl = document.createElement('div');
			let dateTypeSpan = document.createElement('span');
			let dateMainSpan = document.createElement('span');
			dateTypeSpan.className = 'mlog-item-type';
			dateTypeSpan.innerHTML = getDataType(msg[curPath])[0]
			dateMainSpan.className = 'mlog-item-name';
			dateMainSpan.setAttribute('onclick', `getMlog().addChilds(this);`)
			childEl.setAttribute('name', parentPathName);
			childEl.setAttribute('path', curPath)
			childEl.setAttribute('depth', depth + 1)
			childEl.appendChild(dateMainSpan)
			childEl.appendChild(dateTypeSpan)
			childEl.className = "mlog-item"
			if (getDataType(msg[curPath])[1]) {
				dateMainSpan.innerHTML = `<i class="tableMark">${"├─".repeat(depth + 1)} </i>  <i class="isOpenedMark" name="${parentPathName}_openedMark_${curPath}">▸</i>  ${curPath}: ${getContent2Shown(msg[curPath])}`;
			} else {
				dateMainSpan.innerHTML = `<i class="tableMark">${"├─".repeat(depth + 1)} </i>  <i class="isOpenedMark avalable" name="${parentPathName}_openedMark_${curPath}" >▸</i>  ${curPath}: ${getContent2Shown(msg[curPath])}`;
			}
			dom.parentNode.appendChild(childEl)
		}

		if (showSelf === true) {
			makeDOm4Self(log, path)
		} else {
			if (iteratable) {
				for (let key in msg) {
					makeDOm4Child(`${log}['${path}']`, key);
				}
			}
		}
	}
	let getContent2Shown = function (msg) {
		let dateType = getDataType(msg);
		let res = null;
		switch (dateType[0]) {
			case 'Object':
				res = ` { ${Object.keys(msg).join(', ')} }`
				break;
			case 'Array':
				res = ` [ length: ${msg.length} ]`
				break;
			case 'String':
				res = ` "${msg}"`
				break;
			case 'Number':
				res = ` ${msg}`
				break;
			default:
				break;
		}
		return res;
	}

	let getDataType = function (data) {
		let dataType, iteratable = false;
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
		return [dataType, iteratable]
	}
	let creatDbStore = function (index) {
		$dbStores[index] = localforage.createInstance({
			name: 'store' + index
		});
	}

	$this.addChilds = function (dom) {
		let log = dom.parentNode.getAttribute('name')
		let path = dom.parentNode.getAttribute('path')
		let childNodesIfExist = document.getElementsByName(`${log}['${path}']`);
		if (childNodesIfExist.length > 0) {
			for (let i = childNodesIfExist.length - 1; i >= 0; i--) {
				childNodesIfExist[i].parentNode.removeChild(childNodesIfExist[i]);
			}
			document.getElementsByName(`${log}_openedMark_${path}`)[0].innerHTML = "▸";
			return 0;
		} else {
			addChildNodes(dom, log, path);
			document.getElementsByName(`${log}_openedMark_${path}`)[0].innerHTML = "▾";
			return 1;
		}
	}
	//set the wrapper size
	let setSize = function (size) {
		let ht = '';
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
	}
	let clear = function () {
		document.getElementById("mlogMain").innerHTML = `<p class="tc lh05" id="containerTitle"></p>`;
	}
	let close = function () {
		document.getElementById("mlogWrapper").style.display = 'none';
	}
	let show = function () {
		document.getElementById("mlogWrapper").style.display = 'block';
	}
	$this.show = function () {
		return show();
	}
	$this.close = function () {
		return close();
	}
	$this.clear = function () {
		return clear();
	}
	$this.setSize = function (size) {
		return setSize(size);
	}
	$this.getLog = function (id) {
		return $Mdata['log_' + id];
	}

	window.getMlog = function () {
		return $this;
	}


	let initLocalForage = function () {
		return new Promise((resolve, reject) => {
			if (!isUseLocalForage()) {
				//not surport localForage		
				$dbLastLogId = 0;
				reject($dbLastLogId)
			} else {
				localforage.ready(() => {
					//creat db stored all indexes
					$dbIndex = localforage.createInstance({
						name: 'index'
					})
					$dbIndex.getItem('lastLogId').then(lastId => {

						if (isNaN(lastId)) {
							$dbLastLogId = 0;
						} else {
							$dbLastLogId = lastId + 0;
						}
						let i = 0;
						$dbLastStoreIndex = getDbLastStoreIndex($dbLastLogId);
						do {
							// create stores for logs by group
							creatDbStore(i)
							i++;

						} while (i <= $dbLastStoreIndex);
						i = null;
						$localforageIsReady = true;
						resolve($dbLastLogId);
					});


				});
			}
		})
	}
	$this.init()
}
