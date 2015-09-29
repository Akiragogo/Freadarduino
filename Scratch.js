// Simulate the bare minimum of the view that exists on the main site 
2 var Scratch = Scratch || {}; 
3 Scratch.FlashApp = Scratch.FlashApp || {}; 
4 
 
5 var editorId = "scratch"; 
6 var initialPage = "home"; 
7 var ShortURL = { 
8     key : "AIzaSyBlaftRUIOLFVs8nfrWvp4IBrqq9-az46A", 
9     api : "https://www.googleapis.com/urlshortener/v1/url", 
10     domain : "http://goo.gl" 
11 } 
12 
 
13 function handleEmbedStatus(e) { 
14     $('#scratch-loader').hide(); 
15     var scratch = $(document.getElementById(editorId)); 
16     if (!e.success) { 
17         scratch.css('marginTop', '10'); 
18         scratch.find('IMG.proj_thumb').css('width', '179px'); 
19         scratch.find('DIV.scratch_unsupported').show(); 
20         scratch.find('DIV.scratch_loading').hide(); 
21     } else { 
22         Scratch.FlashApp.ASobj = scratch[0]; 
23         Scratch.FlashApp.$ASobj = $(Scratch.FlashApp.ASobj); 
24     } 
25 } 
26 
 
27 // enables the SWF to log errors 
28 function JSthrowError(e) { 
29     if (window.onerror) window.onerror(e, 'swf', 0); 
30     else console.error(e); 
31 } 
32 
 
33 function JSeditorReady() { 
34     try { 
35         handleParameters(); 
36         Scratch.FlashApp.$ASobj.trigger("editor:ready"); 
37         return true; 
38     } catch (error) { 
39         console.error(error.message, "\n", error.stack); 
40         throw error; 
41     } 
42 } 
43 
 
44 function JSprojectLoaded() { 
45     loadExtensionQueue(); 
46 } 
47 
 
48 function JSshowExtensionDialog() { 
49     showModal(["template-extension-file", "template-extension-url"]); 
50 } 
51 
 
52 var extensionQueue = []; 
53 function handleParameters() { 
54     var project; 
55     var queryString = window.location.search.substring(1); 
56     var queryVars = queryString.split(/[&;]/); 
57     for (var i = 0; i < queryVars.length; i++) { 
58         var nameVal = queryVars[i].split('='); 
59         switch(nameVal[0]){ 
60             case 'ext': 
61                 extensionQueue.push(nameVal[1]); 
62                 break; 
63             case 'proj': 
64                 project = nameVal[1]; 
65                 break; 
66         } 
67     } 
68     if (project) { 
69         Scratch.FlashApp.ASobj.ASloadSBXFromURL(project); 
70     } 
71     else { 
72         loadExtensionQueue(); 
73     } 
74 } 
75 
 
76 function loadExtensionQueue() { 
77     for (var i = 0; i < extensionQueue.length; ++i) { 
78         var extensionURL = extensionQueue[i]; 
79         ScratchExtensions.loadExternalJS(extensionURL); 
80     } 
81     extensionQueue = []; 
82 } 
83 
 
84 var flashVars = { 
85     autostart: 'false', 
86     extensionDevMode: 'true', 
87     server: encodeURIComponent(location.host), 
88     cloudToken: '4af4863d-a921-4004-b2cb-e0ad00ee1927', 
89     cdnToken: '34f16bc63e8ada7dfd7ec12c715d0c94', 
90     urlOverrides: { 
91         sitePrefix: "http://scratch.mit.edu/", 
92         siteCdnPrefix: "http://cdn.scratch.mit.edu/", 
93         assetPrefix: "http://assets.scratch.mit.edu/", 
94         assetCdnPrefix: "http://cdn.assets.scratch.mit.edu/", 
95         projectPrefix: "http://projects.scratch.mit.edu/", 
96         projectCdnPrefix: "http://cdn.projects.scratch.mit.edu/", 
97         internalAPI: "internalapi/", 
98         siteAPI: "site-api/", 
99         staticFiles: "scratchr2/static/" 
100     }, 
101     inIE: (navigator.userAgent.indexOf('MSIE') > -1) 
102 }; 
103 
 
104 var params = { 
105     allowscriptaccess: 'always', 
106     allowfullscreen: 'true', 
107     wmode: 'direct', 
108     menu: 'false' 
109 }; 
110 
 
111 $.each(flashVars, function (prop, val) { 
112     if ($.isPlainObject(val)) 
113         flashVars[prop] = encodeURIComponent(JSON.stringify(val)); 
114 }); 
115 
 
116 swfobject.switchOffAutoHideShow(); 
117 
 
118 swfobject.embedSWF('Scratch.swf', 'scratch', '100%', '100%', '11.7.0', 'libs/expressInstall.swf', 
119         flashVars, params, null, handleEmbedStatus); 
120 
 
121 
 
122 /* File uploads */ 
123 function sendFileToFlash(file) { 
124     /* 
125      * Use the HTML5 FileReader API to send base-64 encoded file 
126      * contents to Flash via ASloadBase64SBX (or do it when the SWF 
127      * is ready). 
128      */ 
129     var fileReader = new FileReader(); 
130     fileReader.onload = function (e) { 
131         var fileAsB64 = ab_to_b64(fileReader.result); 
132         if (Scratch.FlashApp.ASobj.ASloadBase64SBX !== undefined) { 
133             $(document).trigger("editor:extensionLoaded", {method: "file"}); 
134             showPage(editorId); 
135             Scratch.FlashApp.ASobj.ASloadBase64SBX(fileAsB64); 
136         } else { 
137             $(document).on("editor:ready", function(e) { 
138                 $(document).trigger("editor:extensionLoaded", {method: "file"}); 
139                 showPage(editorId); 
140                 Scratch.FlashApp.ASobj.ASloadBase64SBX(fileAsB64); 
141                 $(this).off(e); 
142             }); 
143         } 
144          
145     } 
146     fileReader.readAsArrayBuffer(file); 
147 } 
148 
 
149 function sendURLtoFlash() { 
150     /* 
151      * Send a URL to Flash with ASloadGithubURL, or do it when the 
152      * editor is ready. 
153      */ 
154     var urls = []; 
155     for (var i = 0; i < arguments.length; i++) { 
156         urls.push(arguments[i]); 
157     } 
158     if (urls.length <= 0) return; 
159     if (Scratch.FlashApp.ASobj.ASloadGithubURL !== undefined) { 
160         $(document).trigger("editor:extensionLoaded", {method: "url", urls: urls}); 
161         showPage(editorId); 
162         Scratch.FlashApp.ASobj.ASloadGithubURL(urls); 
163     } else { 
164         $(document).on("editor:ready",  function(e) { 
165             $(document).trigger("editor:extensionLoaded", {method: "url", urls: urls}); 
166             showPage(editorId); 
167             Scratch.FlashApp.ASobj.ASloadGithubURL(urls); 
168             $(this).off(e); 
169         }); 
170     } 
171 } 
172 
 
173 
 
174 /* Load from URL */ 
175 
 
176 function loadFromURLParameter(queryString) { 
177     /* 
178      * Get all url=urlToLoad from the querystring and send to Flash 
179      * Use like... 
180      *     http://scratchx.org/?url=urlToLoad1&url=urlToLoad2 
181      */ 
182     var paramString = queryString.replace(/^\?|\/$/g, ''); 
183     var vars = paramString.split("&"); 
184     var showedEditor = false; 
185     var urls = []; 
186     for (var i=0; i<vars.length; i++) { 
187         var pair = vars[i].split("="); 
188         if (pair.length > 1 && pair[0]=="url") { 
189             urls.push(pair[1]); 
190         } 
191     } 
192     if (urls.length > 0) sendURLtoFlash.apply(window, urls); 
193 } 
194 
 
195 /* Modals */ 
196 
 
197 function getOrCreateFromTemplate(elementId, templateId, elementType, appendTo, wrapper, data) { 
198     elementType = elementType || "div"; 
199     appendTo = appendTo || "body"; 
200     data = data || {}; 
201 
 
202     var $element = $(document.getElementById(elementId)); 
203     if (!$element.length) { 
204         var templateContent = ""; 
205         if (typeof(templateId) != "string") { 
206             for (var id in templateId) { 
207                 templateContent += $(document.getElementById(templateId[id])).html(); 
208             } 
209         } else { 
210             templateContent += $(document.getElementById(templateId)).html() 
211         } 
212         $template = _.template(templateContent); 
213         $element = $("<"+elementType+"></"+elementType+">") 
214             .attr("id", elementId) 
215             .html($template(data)); 
216         if (wrapper) $element.wrapInner(wrapper); 
217         $element.appendTo(appendTo) 
218     } 
219     return $element; 
220 }; 
221 
 
222 function showModal(templateId, data) { 
223     /* 
224      * Copies the HTML referenced by data-template into a new element, 
225      * with id="modal-[template value]" and creates an overlay on the 
226      * page, which when clicked will close the popup. 
227      */ 
228 
 
229     var zIndex = 100; 
230     var modalId = ("modal-" + templateId).replace(",", "-"); 
231     $modalwrapper = $("<div class='modal-fade-screen'><div class='modal-inner'></div></div>"); 
232     var $modal = getOrCreateFromTemplate(modalId, templateId, "dialog", "body", $modalwrapper, data); 
233 
 
234     $modal.addClass("modal"); 
235 
 
236     $(".modal-fade-screen", $modal) 
237         .addClass("visible") 
238         .click(function(e){if ($(e.target).is($(this))) $(this).trigger("modal:exit")}); 
239 
 
240     $(".modal-close", $modal).click(function(e){ 
241         e.preventDefault(); 
242         $(document).trigger("modal:exit") 
243     }); 
244      
245     $("body").addClass("modal-open"); 
246 
 
247     $(document).one("modal:exit page:show editor:extensionLoaded", function(e){ 
248         $("body").removeClass("modal-open"); 
249         Scratch.FlashApp.ASobj.ASsetModalOverlay(false); 
250         $modal.remove(); 
251     }); 
252      
253     return $modal; 
254 } 
255 
 
256 $(document).keyup(function(e) { 
257     // Exit modals with esc key 
258     if (e.keyCode == 27) $(document).trigger("modal:exit"); 
259 }); 
260 
 
261 $(document).on("modal:exit", function(e){Scratch.FlashApp.ASobj.ASsetModalOverlay(false);}); 
262 
 
263 $(document).on('click', "[data-action='modal']", function(e){ 
264     /* 
265      * Usage: 
266      *     <a href="#content" data-action="modal" data-template="id-for-content">Popup</a> 
267      */ 
268 
 
269     e.preventDefault(); 
270     showModal($(this).data("template")); 
271 }); 
272 
 
273 function JSshowWarning(extensionData) { 
274     $modal = showModal("template-warning", extensionData); 
275     $("button", $modal).click(function(e){ 
276         e.preventDefault(); 
277         $(document).trigger("modal:exit") 
278     }); 
279 } 
280 
 
281 
 
282 /* Page switching */ 
283 function showPage(path, force) { 
284     /* 
285      Show a part of the page.  The site is set up like 
286      body 
287        main 
288          article#home 
289          article#privacy-policy 
290          ... 
291        editor 
292       
293      Each <article> is a "page" of the site, plus one special 
294      view, which is the editor. 
295       
296      The editor is not actually hidden, but located -9999px above 
297      the viewport. This is because if it's hidden, it doesn't load 
298      when the page is loaded. 
299           So first we have to hide everything that we're not going to show 
300      or move the editor up, then display everything we're going to show 
301      if it's hidden. 
302           If we are linking to an anchor within a page, then show its parent. 
303     */ 
304     var toHide = "body > main, body > main > article"; 
305     var toShow = "#" + path; 
306     var $toShow = $(toShow); 
307     var showEditor = $toShow.is(Scratch.FlashApp.$ASobj); 
308     var editorShown = parseInt(Scratch.FlashApp.$ASobj.css("top")) == 0; 
309 
 
310     if (!$toShow.length || (!showEditor && $toShow.filter(":visible").length > 0) || (showEditor && editorShown)) return; 
311      
312     if (editorShown && !force) { 
313         Scratch.FlashApp.ASobj.AScreateNewProject(["showPage", path, true]); 
314         return; 
315     } 
316 
 
317     $(toHide).filter(":visible").hide(); 
318     if (!showEditor && editorShown) $(document.getElementById(editorId)).css({top: "-9999px"}); 
319     $("body > main, body > main > article").has($toShow).show(); 
320     setBodyClass(path); 
321     $toShow.show(); 
322 
 
323     if (showEditor) $toShow.css({top: 0}); 
324      
325     if (document.location.hash.substr(1) != path) document.location.hash = path; 
326     $toShow[0].scrollIntoView(true); 
327     $(document).trigger("page:show", path); 
328 } 
329 
 
330 function setBodyClass(path) { 
331     var pageClassPrefix = "page-"; 
332     var currentPageClasses = ($("body").attr("class") || "").split(" "); 
333     for (c in currentPageClasses) { 
334         if (currentPageClasses[c].indexOf(pageClassPrefix) != -1) { 
335             $("body").removeClass(currentPageClasses[c]); 
336         } 
337     } 
338     $("body").addClass(pageClassPrefix + path); 
339 } 
340 
 
341 /* URL Shortening */ 
342 function shorten(url, done) { 
343     var data = {longUrl: url}; 
344     $.ajax({ 
345         url : ShortURL.api + '?' + $.param({key : ShortURL.key}), 
346         type : "post", 
347         data : JSON.stringify(data), 
348         dataType : "json", 
349         contentType : "application/json" 
350     }).done(done); 
351 } 
352 
 
353 function getUrlFor(extensions) { 
354     return document.location.origin + '/?' + $.param( 
355         extensions.map(function(url){ 
356             return {name: 'url', value: url} 
357         }) 
358     ); 
359 } 
360 
 
361 function UrlParser(url) { 
362     parser = document.createElement('a'); 
363     parser.href = url; 
364     return parser 
365 } 
366 
 
367 function showShortUrl(url) { 
368     shorten(url, function(data) { 
369         var parser = UrlParser(data.id); 
370         var id = parser.pathname.replace('/', ''); 
371         parser.href = window.location.origin; 
372         parser.hash = "#!" + id; 
373         var shortUrl = parser.href; 
374         var context = { 
375             longUrl : data.longUrl, 
376             shortUrl : shortUrl 
377         } 
378 
 
379         $modal = showModal("template-short-url", context); 
380         var client = new ZeroClipboard($('button', $modal)); 
381     }); 
382 } 
383 
 
384 function JSshowShortUrlFor() { 
385     showShortUrl(getUrlFor(Array.prototype.slice.call(arguments))); 
386 } 
387 
 
388 function decompress(id, done) { 
389     var data = {shortUrl: ShortURL.domain + id} 
390     $.ajax({ 
391         url : ShortURL.api + '?' + $.param({ 
392             key : ShortURL.key, 
393             shortUrl : ShortURL.domain + '/' + id}), 
394         dataType : "json", 
395         contentType : "application/json" 
396     }).done(done); 
397 } 
398 
 
399 /* Setup */ 
400 
 
401 $(document).on('click', "[data-action='load-file']", function(e) { 
402     /* 
403     Buttons with data-action="load-file" trigger a file input 
404     prompt, passed to a handler that passes the file to Flash. 
405     */ 
406     $('<input type="file" />').on('change', function(){ 
407         sendFileToFlash(this.files[0]) 
408     }).click(); 
409 }); 
410 
 
411 $(document).on('click', "[data-action='load-url']", function(e) { 
412     /* 
413     Links with data-action="load-url" send their href to Flash 
414     So use like... 
415        <a href="?url=urlToLoad" data-action="load-url">Load this</a> 
416     */ 
417     e.preventDefault(); 
418     showPage(editorId); 
419     loadFromURLParameter($(this).attr("href")); 
420 }); 
421 
 
422 $(document).on('submit', ".url-load-form", function(e) { 
423     // Load text input value on submit 
424     e.preventDefault() 
425     showPage(editorId); 
426     sendURLtoFlash($('input[type="text"]', this).val()); 
427 }); 
428 
 
429 $(document).on('click', "[data-action='show']", function(e) { 
430     /* 
431     Links with data-action="static-link" should switch the view 
432     to that page. Works like tabs sort of. Use like... 
433         <!-- Makes a link to the Privacy Policy section --> 
434         <a href="#privacy-policy" data-action="static-link">Privacy Policy</a> 
435     */ 
436     var path = $(this).data('target') || $(this).attr("href").substring(1); 
437     showPage(path); 
438 }); 
439 
 
440 $(window).on('hashchange', function(e) { 
441     var path = document.location.hash.split('#')[1] || document.location.hash || 'home'; 
442     if (path.charAt(0) != '!') showPage(path); 
443 }); 
444 
 
445 $(document).on("page:show", function(e, page){ 
446     ga("send", "pageview", '#' + page); 
447     ga("set", "referrer", document.location.origin + document.location.pathname + document.location.hash) 
448 }); 
449 
 
450 $(document).on("editor:extensionLoaded", function(e, data){ 
451     if (data.method == "url") { 
452         for (var i = 0; url = data['urls'][i]; i++) { 
453             ga("send", "event", "extensionLoaded", data.method, url); 
454         } 
455     } else { 
456         ga("send", "event", "extensionLoaded", data.method); 
457     } 
458 }); 
459 
 
460 function initPage() { 
461     /* 
462     On load, show the page identified by the URL fragment. Default to #home. 
463     */ 
464     if (window.location.hash) { 
465         if (window.location.hash.charAt(1) == "!") { 
466             decompress(window.location.hash.substr(2), function(data) { 
467                 var parser = UrlParser(data.longUrl); 
468                 if (parser.hostname == window.location.hostname) window.location = data.longUrl; 
469                 return; 
470             }); 
471         } else { 
472             initialPage = window.location.hash.substr(1); 
473         } 
474     } 
475     setBodyClass(initialPage); 
476     showPage(initialPage, true); 
477     loadFromURLParameter(window.location.search, true); 
478 } 
479 $(initPage); 
