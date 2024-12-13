let backup_icon;
let backup_name;
let socket;
if (location.origin.includes("https")) {
	socket = new WebSocket(`wss://${location.host}/socket`);
} else {
	socket = new WebSocket(`ws://${location.host}/socket`);
}
socket.addEventListener("open", (event) => {
	let cookies = document.cookie.split("; ");
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].trim().startsWith("token=")) {
			socket.send(cookies[i].trim());
		}
	}
});
socket.addEventListener("message", (event) => {
	if (event.data == "ping") {
		socket.send(`pong${location.pathname.includes("/semag/") ? location.pathname.split("/")[2] : ""}`);
		return;
	}
	if (event.data.startsWith("announce.")) {
		let styles = document.createElement("style");
		styles.innerHTML = `@import url("https://fonts.googleapis.com/css2?family=Prompt:wght@300&display=swap");.announce {font-family: "Prompt", sans-serif;position: absolute;margin-left: auto;margin-right: auto;top: 10px;z-index: 10000000;background-color: #a53026;padding: 10px;width: max-content;border-radius: 10px;left:0;right:0;border-color: #f74f40;border-width: 5px;border-radius: 10px;border-style: solid;max-width: 60%;font-size: 16px;color: white;}@keyframes FadeIn {0% {opacity: 0;}100% {opacity: 1;}}@keyframes FadeOut {0% {opacity: 1;}100% {opacity: 0;}}`;
		let announcement = document.createElement("div");
		announcement.innerText = event.data.substring(9);
		announcement.setAttribute("class", "announce");
		announcement.style.opacity = "0";
		announcement.style.animation = "FadeIn 1s ease-in-out forwards";
		document.head.appendChild(styles);
		document.body.appendChild(announcement);
		setTimeout(() => {
			announcement.style.animation = "FadeOut 1s ease-in-out forwards";
			setTimeout(() => {
				announcement.remove();
				styles.remove();
			}, 1000);
		}, 14000);
	}
});

function setCloak(name, icon) {
	var tabicon = getCookie("tabicon");
	if (tabicon || icon) {
		var link = document.querySelector("link[rel~='icon']");
		if (link) {
			if (link.href != icon) backup_icon = link;
			while (document.querySelector("link[rel~='icon']")) {
				document.querySelector("link[rel~='icon']").remove();
			}
		}
		var link = document.querySelector("link[rel~='shortcut icon']");
		if (link) {
			if (link.href != icon) backup_icon = link;
			while (document.querySelector("link[rel~='shortcut icon']")) {
				document.querySelector("link[rel~='shortcut icon']").remove();
			}
		}
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
		link.href = tabicon;
		if (name) {
			link.href = icon;
		}
	}

	var tabname = getCookie("tabname");
	backup_name = document.title;
	if (tabname) {
		document.title = tabname;
	}
	if (name) {
		document.title = name;
	}
	panicMode();
}
if (getCookie("debugging") == 1) {
	const debugscript = document.createElement("script");
	debugscript.setAttribute("src", "/js/debug.js");
	document.head.append(debugscript);
}
function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
let listofchars = "";
document.addEventListener("keydown", (e) => {
	listofchars = listofchars + e.key;
	if (listofchars.length > 20) {
		listofchars = listofchars.substring(e.key.length);
	}
	if (listofchars.includes("safemode")) {
		window.location.href = panicurl;
		listofchars = "";
	} else if (listofchars.includes("debugplz")) {
		if (getCookie("debugging") == 1) {
			document.cookie = "debugging=0;";
			alert("debugging off!");
		} else {
			document.cookie = "debugging=1";
			alert("debugging on!");
		}
		listofchars = "";
	}
});
function panicMode() {
	panicurl = getCookie("panicurl");
	if (panicurl == "") {
		panicurl = "https://google.com";
	}
}
document.addEventListener(
	"DOMContentLoaded",
	() => {
		setCloak();
		let plausible = document.createElement("script");
		plausible.setAttribute("event-domain", location.host)
		plausible.setAttribute("defer", "");
		plausible.setAttribute("src", "/js/analytics.js");
		plausible.setAttribute("data-domain", "selenite.cc");
		document.head.appendChild(plausible);
	},
	false
);
if (location.pathname.substring(1).includes("semag") && localStorage.getItem("selenite.blockClose") == "true") {
	window.onbeforeunload = function () {
		return "";
	};
}
addEventListener("visibilitychange", (e) => {
	if (localStorage.getItem("selenite.tabDisguise") == "true") {
		if (document.visibilityState === "hidden") {
			setCloak("Google", "https://www.google.com/favicon.ico");
		} else {
			if (!backup_icon) {
				icon = document.createElement("link");
				icon.rel = "icon";

				var link = document.querySelector("link[rel~='icon']");
				if (link) {
					backup_icon = link;
					while (document.querySelector("link[rel~='icon']")) {
						document.querySelector("link[rel~='icon']").remove();
					}
				}
				var link = document.querySelector("link[rel~='shortcut icon']");
				if (link) {
					backup_icon = link;
					while (document.querySelector("link[rel~='shortcut icon']")) {
						document.querySelector("link[rel~='shortcut icon']").remove();
					}
				}
				document.head.appendChild(icon);
				icon.href = location.origin + "/favicon.ico";
			} else {
				document.head.appendChild(backup_icon);
			}
			document.title = backup_name;
		}
	}
});
var polyfillScript = document.createElement("script");
polyfillScript.src = "https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0";
document.head.appendChild(polyfillScript);
function fps() {
	var script = document.createElement("script");
	script.onload = function () {
		var stats = new Stats();
		document.body.appendChild(stats.dom);
		requestAnimationFrame(function loop() {
			stats.update();
			requestAnimationFrame(loop);
		});

		localStorage.setItem("fps", true);
	};
	script.src = "https://cdn.jsdelivr.net/gh/mrdoob/stats.js@master/build/stats.min.js";
	document.head.appendChild(script);
}

if (localStorage.getItem("fps")) {
	fps();
}