
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

    var token = '%[a-f0-9]{2}';
    var singleMatcher = new RegExp(token, 'gi');
    var multiMatcher = new RegExp('(' + token + ')+', 'gi');

    function decodeComponents(components, split) {
    	try {
    		// Try to decode the entire string first
    		return decodeURIComponent(components.join(''));
    	} catch (err) {
    		// Do nothing
    	}

    	if (components.length === 1) {
    		return components;
    	}

    	split = split || 1;

    	// Split the array in 2 parts
    	var left = components.slice(0, split);
    	var right = components.slice(split);

    	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
    }

    function decode(input) {
    	try {
    		return decodeURIComponent(input);
    	} catch (err) {
    		var tokens = input.match(singleMatcher);

    		for (var i = 1; i < tokens.length; i++) {
    			input = decodeComponents(tokens, i).join('');

    			tokens = input.match(singleMatcher);
    		}

    		return input;
    	}
    }

    function customDecodeURIComponent(input) {
    	// Keep track of all the replacements and prefill the map with the `BOM`
    	var replaceMap = {
    		'%FE%FF': '\uFFFD\uFFFD',
    		'%FF%FE': '\uFFFD\uFFFD'
    	};

    	var match = multiMatcher.exec(input);
    	while (match) {
    		try {
    			// Decode as big chunks as possible
    			replaceMap[match[0]] = decodeURIComponent(match[0]);
    		} catch (err) {
    			var result = decode(match[0]);

    			if (result !== match[0]) {
    				replaceMap[match[0]] = result;
    			}
    		}

    		match = multiMatcher.exec(input);
    	}

    	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
    	replaceMap['%C2'] = '\uFFFD';

    	var entries = Object.keys(replaceMap);

    	for (var i = 0; i < entries.length; i++) {
    		// Replace all decoded components
    		var key = entries[i];
    		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
    	}

    	return input;
    }

    var decodeUriComponent = function (encodedURI) {
    	if (typeof encodedURI !== 'string') {
    		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
    	}

    	try {
    		encodedURI = encodedURI.replace(/\+/g, ' ');

    		// Try the built in decoder first
    		return decodeURIComponent(encodedURI);
    	} catch (err) {
    		// Fallback to a more advanced decoder
    		return customDecodeURIComponent(encodedURI);
    	}
    };

    var splitOnFirst = (string, separator) => {
    	if (!(typeof string === 'string' && typeof separator === 'string')) {
    		throw new TypeError('Expected the arguments to be of type `string`');
    	}

    	if (separator === '') {
    		return [string];
    	}

    	const separatorIndex = string.indexOf(separator);

    	if (separatorIndex === -1) {
    		return [string];
    	}

    	return [
    		string.slice(0, separatorIndex),
    		string.slice(separatorIndex + separator.length)
    	];
    };

    var queryString = createCommonjsModule(function (module, exports) {




    const isNullOrUndefined = value => value === null || value === undefined;

    function encoderForArrayFormat(options) {
    	switch (options.arrayFormat) {
    		case 'index':
    			return key => (result, value) => {
    				const index = result.length;

    				if (
    					value === undefined ||
    					(options.skipNull && value === null) ||
    					(options.skipEmptyString && value === '')
    				) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, [encode(key, options), '[', index, ']'].join('')];
    				}

    				return [
    					...result,
    					[encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')
    				];
    			};

    		case 'bracket':
    			return key => (result, value) => {
    				if (
    					value === undefined ||
    					(options.skipNull && value === null) ||
    					(options.skipEmptyString && value === '')
    				) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, [encode(key, options), '[]'].join('')];
    				}

    				return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
    			};

    		case 'comma':
    		case 'separator':
    			return key => (result, value) => {
    				if (value === null || value === undefined || value.length === 0) {
    					return result;
    				}

    				if (result.length === 0) {
    					return [[encode(key, options), '=', encode(value, options)].join('')];
    				}

    				return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
    			};

    		default:
    			return key => (result, value) => {
    				if (
    					value === undefined ||
    					(options.skipNull && value === null) ||
    					(options.skipEmptyString && value === '')
    				) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, encode(key, options)];
    				}

    				return [...result, [encode(key, options), '=', encode(value, options)].join('')];
    			};
    	}
    }

    function parserForArrayFormat(options) {
    	let result;

    	switch (options.arrayFormat) {
    		case 'index':
    			return (key, value, accumulator) => {
    				result = /\[(\d*)\]$/.exec(key);

    				key = key.replace(/\[\d*\]$/, '');

    				if (!result) {
    					accumulator[key] = value;
    					return;
    				}

    				if (accumulator[key] === undefined) {
    					accumulator[key] = {};
    				}

    				accumulator[key][result[1]] = value;
    			};

    		case 'bracket':
    			return (key, value, accumulator) => {
    				result = /(\[\])$/.exec(key);
    				key = key.replace(/\[\]$/, '');

    				if (!result) {
    					accumulator[key] = value;
    					return;
    				}

    				if (accumulator[key] === undefined) {
    					accumulator[key] = [value];
    					return;
    				}

    				accumulator[key] = [].concat(accumulator[key], value);
    			};

    		case 'comma':
    		case 'separator':
    			return (key, value, accumulator) => {
    				const isArray = typeof value === 'string' && value.split('').indexOf(options.arrayFormatSeparator) > -1;
    				const newValue = isArray ? value.split(options.arrayFormatSeparator).map(item => decode(item, options)) : value === null ? value : decode(value, options);
    				accumulator[key] = newValue;
    			};

    		default:
    			return (key, value, accumulator) => {
    				if (accumulator[key] === undefined) {
    					accumulator[key] = value;
    					return;
    				}

    				accumulator[key] = [].concat(accumulator[key], value);
    			};
    	}
    }

    function validateArrayFormatSeparator(value) {
    	if (typeof value !== 'string' || value.length !== 1) {
    		throw new TypeError('arrayFormatSeparator must be single character string');
    	}
    }

    function encode(value, options) {
    	if (options.encode) {
    		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
    	}

    	return value;
    }

    function decode(value, options) {
    	if (options.decode) {
    		return decodeUriComponent(value);
    	}

    	return value;
    }

    function keysSorter(input) {
    	if (Array.isArray(input)) {
    		return input.sort();
    	}

    	if (typeof input === 'object') {
    		return keysSorter(Object.keys(input))
    			.sort((a, b) => Number(a) - Number(b))
    			.map(key => input[key]);
    	}

    	return input;
    }

    function removeHash(input) {
    	const hashStart = input.indexOf('#');
    	if (hashStart !== -1) {
    		input = input.slice(0, hashStart);
    	}

    	return input;
    }

    function getHash(url) {
    	let hash = '';
    	const hashStart = url.indexOf('#');
    	if (hashStart !== -1) {
    		hash = url.slice(hashStart);
    	}

    	return hash;
    }

    function extract(input) {
    	input = removeHash(input);
    	const queryStart = input.indexOf('?');
    	if (queryStart === -1) {
    		return '';
    	}

    	return input.slice(queryStart + 1);
    }

    function parseValue(value, options) {
    	if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === 'string' && value.trim() !== '')) {
    		value = Number(value);
    	} else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
    		value = value.toLowerCase() === 'true';
    	}

    	return value;
    }

    function parse(input, options) {
    	options = Object.assign({
    		decode: true,
    		sort: true,
    		arrayFormat: 'none',
    		arrayFormatSeparator: ',',
    		parseNumbers: false,
    		parseBooleans: false
    	}, options);

    	validateArrayFormatSeparator(options.arrayFormatSeparator);

    	const formatter = parserForArrayFormat(options);

    	// Create an object with no prototype
    	const ret = Object.create(null);

    	if (typeof input !== 'string') {
    		return ret;
    	}

    	input = input.trim().replace(/^[?#&]/, '');

    	if (!input) {
    		return ret;
    	}

    	for (const param of input.split('&')) {
    		let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, ' ') : param, '=');

    		// Missing `=` should be `null`:
    		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    		value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
    		formatter(decode(key, options), value, ret);
    	}

    	for (const key of Object.keys(ret)) {
    		const value = ret[key];
    		if (typeof value === 'object' && value !== null) {
    			for (const k of Object.keys(value)) {
    				value[k] = parseValue(value[k], options);
    			}
    		} else {
    			ret[key] = parseValue(value, options);
    		}
    	}

    	if (options.sort === false) {
    		return ret;
    	}

    	return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
    		const value = ret[key];
    		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
    			// Sort object keys, not values
    			result[key] = keysSorter(value);
    		} else {
    			result[key] = value;
    		}

    		return result;
    	}, Object.create(null));
    }

    exports.extract = extract;
    exports.parse = parse;

    exports.stringify = (object, options) => {
    	if (!object) {
    		return '';
    	}

    	options = Object.assign({
    		encode: true,
    		strict: true,
    		arrayFormat: 'none',
    		arrayFormatSeparator: ','
    	}, options);

    	validateArrayFormatSeparator(options.arrayFormatSeparator);

    	const shouldFilter = key => (
    		(options.skipNull && isNullOrUndefined(object[key])) ||
    		(options.skipEmptyString && object[key] === '')
    	);

    	const formatter = encoderForArrayFormat(options);

    	const objectCopy = {};

    	for (const key of Object.keys(object)) {
    		if (!shouldFilter(key)) {
    			objectCopy[key] = object[key];
    		}
    	}

    	const keys = Object.keys(objectCopy);

    	if (options.sort !== false) {
    		keys.sort(options.sort);
    	}

    	return keys.map(key => {
    		const value = object[key];

    		if (value === undefined) {
    			return '';
    		}

    		if (value === null) {
    			return encode(key, options);
    		}

    		if (Array.isArray(value)) {
    			return value
    				.reduce(formatter(key), [])
    				.join('&');
    		}

    		return encode(key, options) + '=' + encode(value, options);
    	}).filter(x => x.length > 0).join('&');
    };

    exports.parseUrl = (input, options) => {
    	options = Object.assign({
    		decode: true
    	}, options);

    	const [url, hash] = splitOnFirst(input, '#');

    	return Object.assign(
    		{
    			url: url.split('?')[0] || '',
    			query: parse(extract(input), options)
    		},
    		options && options.parseFragmentIdentifier && hash ? {fragmentIdentifier: decode(hash, options)} : {}
    	);
    };

    exports.stringifyUrl = (input, options) => {
    	options = Object.assign({
    		encode: true,
    		strict: true
    	}, options);

    	const url = removeHash(input.url).split('?')[0] || '';
    	const queryFromUrl = exports.extract(input.url);
    	const parsedQueryFromUrl = exports.parse(queryFromUrl, {sort: false});

    	const query = Object.assign(parsedQueryFromUrl, input.query);
    	let queryString = exports.stringify(query, options);
    	if (queryString) {
    		queryString = `?${queryString}`;
    	}

    	let hash = getHash(input.url);
    	if (input.fragmentIdentifier) {
    		hash = `#${encode(input.fragmentIdentifier, options)}`;
    	}

    	return `${url}${queryString}${hash}`;
    };
    });
    var queryString_1 = queryString.extract;
    var queryString_2 = queryString.parse;
    var queryString_3 = queryString.stringify;
    var queryString_4 = queryString.parseUrl;
    var queryString_5 = queryString.stringifyUrl;

    var index_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      var defaultExport = /*@__PURE__*/(function (Error) {
        function defaultExport(route, path) {
          var message = "Unreachable '" + (route !== '/' ? route.replace(/\/$/, '') : route) + "', segment '" + path + "' is not defined";
          Error.call(this, message);
          this.message = message;
          this.route = route;
          this.path = path;
        }

        if ( Error ) defaultExport.__proto__ = Error;
        defaultExport.prototype = Object.create( Error && Error.prototype );
        defaultExport.prototype.constructor = defaultExport;

        return defaultExport;
      }(Error));

      function buildMatcher(path, parent) {
        var regex;

        var _isSplat;

        var _priority = -100;

        var keys = [];
        regex = path.replace(/[-$.]/g, '\\$&').replace(/\(/g, '(?:').replace(/\)/g, ')?').replace(/([:*]\w+)(?:<([^<>]+?)>)?/g, function (_, key, expr) {
          keys.push(key.substr(1));

          if (key.charAt() === ':') {
            _priority += 100;
            return ("((?!#)" + (expr || '[^#/]+?') + ")");
          }

          _isSplat = true;
          _priority += 500;
          return ("((?!#)" + (expr || '[^#]+?') + ")");
        });

        try {
          regex = new RegExp(("^" + regex + "$"));
        } catch (e) {
          throw new TypeError(("Invalid route expression, given '" + parent + "'"));
        }

        var _hashed = path.includes('#') ? 0.5 : 1;

        var _depth = path.length * _priority * _hashed;

        return {
          keys: keys,
          regex: regex,
          _depth: _depth,
          _isSplat: _isSplat
        };
      }
      var PathMatcher = function PathMatcher(path, parent) {
        var ref = buildMatcher(path, parent);
        var keys = ref.keys;
        var regex = ref.regex;
        var _depth = ref._depth;
        var _isSplat = ref._isSplat;
        return {
          _isSplat: _isSplat,
          _depth: _depth,
          match: function (value) {
            var matches = value.match(regex);

            if (matches) {
              return keys.reduce(function (prev, cur, i) {
                prev[cur] = typeof matches[i + 1] === 'string' ? decodeURIComponent(matches[i + 1]) : null;
                return prev;
              }, {});
            }
          }
        };
      };

      PathMatcher.push = function push (key, prev, leaf, parent) {
        var root = prev[key] || (prev[key] = {});

        if (!root.pattern) {
          root.pattern = new PathMatcher(key, parent);
          root.route = (leaf || '').replace(/\/$/, '') || '/';
        }

        prev.keys = prev.keys || [];

        if (!prev.keys.includes(key)) {
          prev.keys.push(key);
          PathMatcher.sort(prev);
        }

        return root;
      };

      PathMatcher.sort = function sort (root) {
        root.keys.sort(function (a, b) {
          return root[a].pattern._depth - root[b].pattern._depth;
        });
      };

      function merge(path, parent) {
        return ("" + (parent && parent !== '/' ? parent : '') + (path || ''));
      }
      function walk(path, cb) {
        var matches = path.match(/<[^<>]*\/[^<>]*>/);

        if (matches) {
          throw new TypeError(("RegExp cannot contain slashes, given '" + matches + "'"));
        }

        var parts = path.split(/(?=\/|#)/);
        var root = [];

        if (parts[0] !== '/') {
          parts.unshift('/');
        }

        parts.some(function (x, i) {
          var parent = root.slice(1).concat(x).join('') || null;
          var segment = parts.slice(i + 1).join('') || null;
          var retval = cb(x, parent, segment ? ("" + (x !== '/' ? x : '') + segment) : null);
          root.push(x);
          return retval;
        });
      }
      function reduce(key, root, _seen) {
        var params = {};
        var out = [];
        var splat;
        walk(key, function (x, leaf, extra) {
          var found;

          if (!root.keys) {
            throw new defaultExport(key, x);
          }

          root.keys.some(function (k) {
            if (_seen.includes(k)) { return false; }
            var ref = root[k].pattern;
            var match = ref.match;
            var _isSplat = ref._isSplat;
            var matches = match(_isSplat ? extra || x : x);

            if (matches) {
              Object.assign(params, matches);

              if (root[k].route) {
                var routeInfo = Object.assign({}, root[k].info); // properly handle exact-routes!

                var hasMatch = false;

                if (routeInfo.exact) {
                  hasMatch = extra === null;
                } else {
                  hasMatch = !(x && leaf === null) || x === leaf || _isSplat || !extra;
                }

                routeInfo.matches = hasMatch;
                routeInfo.params = Object.assign({}, params);
                routeInfo.route = root[k].route;
                routeInfo.path = _isSplat && extra || leaf || x;
                out.push(routeInfo);
              }

              if (extra === null && !root[k].keys) {
                return true;
              }

              if (k !== '/') { _seen.push(k); }
              splat = _isSplat;
              root = root[k];
              found = true;
              return true;
            }

            return false;
          });

          if (!(found || root.keys.some(function (k) { return root[k].pattern.match(x); }))) {
            throw new defaultExport(key, x);
          }

          return splat || !found;
        });
        return out;
      }
      function find(path, routes, retries) {
        var get = reduce.bind(null, path, routes);
        var set = [];

        while (retries > 0) {
          retries -= 1;

          try {
            return get(set);
          } catch (e) {
            if (retries > 0) {
              return get(set);
            }

            throw e;
          }
        }
      }
      function add(path, routes, parent, routeInfo) {
        var fullpath = merge(path, parent);
        var root = routes;
        var key;

        if (routeInfo && routeInfo.nested !== true) {
          key = routeInfo.key;
          delete routeInfo.key;
        }

        walk(fullpath, function (x, leaf) {
          root = PathMatcher.push(x, root, leaf, fullpath);

          if (x !== '/') {
            root.info = root.info || Object.assign({}, routeInfo);
          }
        });
        root.info = root.info || Object.assign({}, routeInfo);

        if (key) {
          root.info.key = key;
        }

        return fullpath;
      }
      function rm(path, routes, parent) {
        var fullpath = merge(path, parent);
        var root = routes;
        var leaf = null;
        var key = null;
        walk(fullpath, function (x) {
          if (!root) {
            leaf = null;
            return true;
          }

          if (!root.keys) {
            throw new defaultExport(path, x);
          }

          key = x;
          leaf = root;
          root = root[key];
        });

        if (!(leaf && key)) {
          throw new defaultExport(path, key);
        }

        if (leaf === routes) {
          leaf = routes['/'];
        }

        if (leaf.route !== key) {
          var offset = leaf.keys.indexOf(key);

          if (offset === -1) {
            throw new defaultExport(path, key);
          }

          leaf.keys.splice(offset, 1);
          PathMatcher.sort(leaf);
          delete leaf[key];
        } // nested routes are upgradeable, so keep original info...


        if (root.route === leaf.route && (!root.info || root.info.key === leaf.info.key)) { delete leaf.info; }
      }

      var Router = function Router() {
        var routes = {};
        var stack = [];
        return {
          resolve: function (path, cb) {
            var url = path.split('?')[0];
            var seen = [];
            walk(url, function (x, leaf, extra) {
              try {
                cb(null, find(leaf, routes, 1).filter(function (r) {
                  if (!seen.includes(r.path)) {
                    seen.push(r.path);
                    return true;
                  }

                  return false;
                }));
              } catch (e) {
                cb(e, []);
              }
            });
          },
          mount: function (path, cb) {
            if (path !== '/') {
              stack.push(path);
            }

            cb();
            stack.pop();
          },
          find: function (path, retries) { return find(path, routes, retries === true ? 2 : retries || 1); },
          add: function (path, routeInfo) { return add(path, routes, stack.join(''), routeInfo); },
          rm: function (path) { return rm(path, routes, stack.join('')); }
        };
      };

      Router.matches = function matches (uri, path) {
        return buildMatcher(uri, path).regex.test(path);
      };

      return Router;

    })));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const cache = {};
    const baseTag = document.getElementsByTagName('base');
    const basePrefix = (baseTag[0] && baseTag[0].href) || '/';

    const ROOT_URL = basePrefix.replace(window.location.origin, '');

    const router = writable({
      path: '/',
      query: {},
      params: {},
      initial: true,
    });

    const CTX_ROUTER = {};
    const CTX_ROUTE = {};

    // use location.hash on embedded pages, e.g. Svelte REPL
    let HASHCHANGE = window.location.origin === 'null';

    function hashchangeEnable(value) {
      if (typeof value === 'boolean') {
        HASHCHANGE = !!value;
      }

      return HASHCHANGE;
    }

    function fixedLocation(path, callback, doFinally) {
      const baseUri = HASHCHANGE ? window.location.hash.replace('#', '') : window.location.pathname;

      // this will rebase anchors to avoid location changes
      if (path.charAt() !== '/') {
        path = baseUri + path;
      }

      const currentURL = baseUri + window.location.hash + window.location.search;

      // do not change location et all...
      if (currentURL !== path) {
        callback(path);
      }

      // invoke final guard regardless of previous result
      if (typeof doFinally === 'function') {
        doFinally();
      }
    }

    function cleanPath(uri, fix) {
      return uri !== '/' || fix ? uri.replace(/\/$/, '') : uri;
    }

    function navigateTo(path, options) {
      const {
        reload, replace,
        params, queryParams,
      } = options || {};

      // If path empty or no string, throws error
      if (!path || typeof path !== 'string' || (path[0] !== '/' && path[0] !== '#')) {
        throw new Error(`Expecting '/${path}' or '#${path}', given '${path}'`);
      }

      if (params) {
        path = path.replace(/:([a-zA-Z][a-zA-Z0-9_-]*)/g, (_, key) => params[key]);
      }

      if (queryParams) {
        const qs = queryString.stringify(queryParams);

        if (qs) {
          path += `?${qs}`;
        }
      }

      if (HASHCHANGE) {
        let fixedURL = path.replace(/^#|#$/g, '');

        if (ROOT_URL !== '/') {
          fixedURL = fixedURL.replace(cleanPath(ROOT_URL), '');
        }

        window.location.hash = fixedURL !== '/' ? fixedURL : '';
        return;
      }

      // If no History API support, fallbacks to URL redirect
      if (reload || !window.history.pushState || !window.dispatchEvent) {
        window.location.href = path;
        return;
      }

      // If has History API support, uses it
      fixedLocation(path, nextURL => {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', nextURL);
        window.dispatchEvent(new Event('popstate'));
      });
    }

    function getProps(given, required) {
      const { props: sub, ...others } = given;

      // prune all declared props from this component
      required.forEach(k => {
        delete others[k];
      });

      return {
        ...sub,
        ...others,
      };
    }

    function isActive(uri, path, exact) {
      if (!cache[[uri, path, exact]]) {
        if (exact !== true && path.indexOf(uri) === 0) {
          cache[[uri, path, exact]] = /^[#/?]?$/.test(path.substr(uri.length, 1));
        } else if (uri.includes('*') || uri.includes(':')) {
          cache[[uri, path, exact]] = index_umd.matches(uri, path);
        } else {
          cache[[uri, path, exact]] = cleanPath(path) === uri;
        }
      }

      return cache[[uri, path, exact]];
    }

    function isPromise(object) {
      return object && typeof object.then === 'function';
    }

    function isSvelteComponent(object) {
      return object && object.prototype;
    }

    const baseRouter = new index_umd();
    const routeInfo = writable({});

    // private registries
    const onError = {};
    const shared = {};

    let errors = [];
    let routers = 0;
    let interval;
    let currentURL;

    // take snapshot from current state...
    router.subscribe(value => { shared.router = value; });
    routeInfo.subscribe(value => { shared.routeInfo = value; });

    function doFallback(failure, fallback) {
      routeInfo.update(defaults => ({
        ...defaults,
        [fallback]: {
          ...shared.router,
          failure,
        },
      }));
    }

    function handleRoutes(map, params) {
      const keys = [];

      map.some(x => {
        if (x.key && x.matches && !shared.routeInfo[x.key]) {
          if (x.redirect && (x.condition === null || x.condition(shared.router) !== true)) {
            if (x.exact && shared.router.path !== x.path) return false;
            navigateTo(x.redirect);
            return true;
          }

          if (x.exact) {
            keys.push(x.key);
          }

          // extend shared params...
          Object.assign(params, x.params);

          // upgrade matching routes!
          routeInfo.update(defaults => ({
            ...defaults,
            [x.key]: {
              ...shared.router,
              ...x,
            },
          }));
        }

        return false;
      });

      return keys;
    }

    function evtHandler() {
      let baseUri = !HASHCHANGE ? window.location.href.replace(window.location.origin, '') : window.location.hash || '/';
      let failure;

      // unprefix active URL
      if (ROOT_URL !== '/') {
        baseUri = baseUri.replace(cleanPath(ROOT_URL), '');
      }

      // trailing slash is required to keep route-info on nested routes!
      // see: https://github.com/pateketrueke/abstract-nested-router/commit/0f338384bddcfbaee30f3ea2c4eb0c24cf5174cd
      const [fixedUri, qs] = baseUri.replace('/#', '#').replace(/^#\//, '/').split('?');
      const fullpath = fixedUri.replace(/\/?$/, '/');
      const query = queryString.parse(qs);
      const params = {};
      const keys = [];

      // reset current state
      routeInfo.set({});

      if (currentURL !== baseUri) {
        currentURL = baseUri;
        router.set({
          path: cleanPath(fullpath),
          query,
          params,
        });
      }

      // load all matching routes...
      baseRouter.resolve(fullpath, (err, result) => {
        if (err) {
          failure = err;
          return;
        }

        // save exact-keys for deletion after failures!
        keys.push(...handleRoutes(result, params));
      });

      const toDelete = {};

      // it's fine to omit failures for '/' paths
      if (failure && failure.path !== '/') {
        keys.reduce((prev, cur) => {
          prev[cur] = null;
          return prev;
        }, toDelete);
      } else {
        failure = null;
      }

      // clear previously failed handlers
      errors.forEach(cb => cb());
      errors = [];

      try {
        // clear routes that not longer matches!
        baseRouter.find(cleanPath(fullpath))
          .forEach(sub => {
            if (sub.exact && !sub.matches) {
              toDelete[sub.key] = null;
            }
          });
      } catch (e) {
        // this is fine
      }

      // drop unwanted routes...
      routeInfo.update(defaults => ({
        ...defaults,
        ...toDelete,
      }));

      let fallback;

      // invoke error-handlers to clear out previous state!
      Object.keys(onError).forEach(root => {
        if (isActive(root, fullpath, false)) {
          const fn = onError[root].callback;

          fn(failure);
          errors.push(fn);
        }

        if (!fallback && onError[root].fallback) {
          fallback = onError[root].fallback;
        }
      });

      // handle unmatched fallbacks
      if (failure && fallback) {
        doFallback(failure, fallback);
      }
    }

    function findRoutes() {
      clearTimeout(interval);
      interval = setTimeout(evtHandler);
    }

    function addRouter(root, fallback, callback) {
      if (!routers) {
        window.addEventListener('popstate', findRoutes, false);
      }

      // register error-handlers
      if (!onError[root] || fallback) {
        onError[root] = { fallback, callback };
      }

      routers += 1;

      return () => {
        routers -= 1;

        if (!routers) {
          window.removeEventListener('popstate', findRoutes, false);
        }
      };
    }

    /* node_modules/yrv/src/Router.svelte generated by Svelte v3.22.3 */
    const file = "node_modules/yrv/src/Router.svelte";

    // (103:0) {#if !disabled}
    function create_if_block_1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[14], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(103:0) {#if !disabled}",
    		ctx
    	});

    	return block;
    }

    // (107:0) {#if failure && !fallback && !nofallback}
    function create_if_block(ctx) {
    	let fieldset;
    	let legend;
    	let t0;
    	let t1;
    	let t2;
    	let pre;
    	let t3;

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t0 = text("Router failure: ");
    			t1 = text(/*path*/ ctx[1]);
    			t2 = space();
    			pre = element("pre");
    			t3 = text(/*failure*/ ctx[3]);
    			add_location(legend, file, 108, 4, 2300);
    			add_location(pre, file, 109, 4, 2344);
    			attr_dev(fieldset, "data-failure", "");
    			attr_dev(fieldset, "class", "svelte-kx2cky");
    			add_location(fieldset, file, 107, 2, 2272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, legend);
    			append_dev(legend, t0);
    			append_dev(legend, t1);
    			append_dev(fieldset, t2);
    			append_dev(fieldset, pre);
    			append_dev(pre, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 2) set_data_dev(t1, /*path*/ ctx[1]);
    			if (dirty & /*failure*/ 8) set_data_dev(t3, /*failure*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(107:0) {#if failure && !fallback && !nofallback}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = !/*disabled*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = /*failure*/ ctx[3] && !/*fallback*/ ctx[4] && !/*nofallback*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*disabled*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*disabled*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*failure*/ ctx[3] && !/*fallback*/ ctx[4] && !/*nofallback*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function unassignRoute(route) {
    	try {
    		baseRouter.rm(route);
    	} catch(e) {
    		
    	} // 🔥 this is fine...

    	findRoutes();
    }

    function instance($$self, $$props, $$invalidate) {
    	let $basePath;
    	let $router;
    	validate_store(router, "router");
    	component_subscribe($$self, router, $$value => $$invalidate(9, $router = $$value));
    	let cleanup;
    	let failure;
    	let fallback;
    	let { path = "/" } = $$props;
    	let { disabled = false } = $$props;
    	let { condition = null } = $$props;
    	let { nofallback = false } = $$props;
    	const routerContext = getContext(CTX_ROUTER);
    	const basePath = routerContext ? routerContext.basePath : writable(path);
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, value => $$invalidate(8, $basePath = value));

    	const fixedRoot = $basePath !== path && $basePath !== "/"
    	? `${$basePath}${path !== "/" ? path : ""}`
    	: path;

    	try {
    		if (condition !== null && typeof condition !== "function") {
    			throw new TypeError(`Expecting condition to be a function, given '${condition}'`);
    		}

    		if (path.charAt() !== "#" && path.charAt() !== "/") {
    			throw new TypeError(`Expecting a leading slash or hash, given '${path}'`);
    		}
    	} catch(e) {
    		failure = e;
    	}

    	function assignRoute(key, route, detail) {
    		key = key || Math.random().toString(36).substr(2);

    		// consider as nested routes if they does not have any segment
    		const nested = !route.substr(1).includes("/");

    		const handler = { key, nested, ...detail };
    		let fullpath;

    		baseRouter.mount(fixedRoot, () => {
    			fullpath = baseRouter.add(route, handler);
    			$$invalidate(4, fallback = handler.fallback && key || fallback);
    		});

    		findRoutes();
    		return [key, fullpath];
    	}

    	function onError(err) {
    		$$invalidate(3, failure = err);

    		if (failure && fallback) {
    			doFallback(failure, fallback);
    		}
    	}

    	onMount(() => {
    		cleanup = addRouter(fixedRoot, fallback, onError);
    	});

    	onDestroy(() => {
    		if (cleanup) cleanup();
    	});

    	setContext(CTX_ROUTER, { basePath, assignRoute, unassignRoute });
    	const writable_props = ["path", "disabled", "condition", "nofallback"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("condition" in $$props) $$invalidate(6, condition = $$props.condition);
    		if ("nofallback" in $$props) $$invalidate(2, nofallback = $$props.nofallback);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		CTX_ROUTER,
    		router,
    		baseRouter,
    		addRouter,
    		findRoutes,
    		doFallback,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		cleanup,
    		failure,
    		fallback,
    		path,
    		disabled,
    		condition,
    		nofallback,
    		routerContext,
    		basePath,
    		fixedRoot,
    		assignRoute,
    		unassignRoute,
    		onError,
    		$basePath,
    		$router
    	});

    	$$self.$inject_state = $$props => {
    		if ("cleanup" in $$props) cleanup = $$props.cleanup;
    		if ("failure" in $$props) $$invalidate(3, failure = $$props.failure);
    		if ("fallback" in $$props) $$invalidate(4, fallback = $$props.fallback);
    		if ("path" in $$props) $$invalidate(1, path = $$props.path);
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ("condition" in $$props) $$invalidate(6, condition = $$props.condition);
    		if ("nofallback" in $$props) $$invalidate(2, nofallback = $$props.nofallback);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*condition, $router*/ 576) {
    			 if (condition) {
    				$$invalidate(0, disabled = !condition($router));
    			}
    		}
    	};

    	return [
    		disabled,
    		path,
    		nofallback,
    		failure,
    		fallback,
    		basePath,
    		condition,
    		cleanup,
    		$basePath,
    		$router,
    		routerContext,
    		fixedRoot,
    		assignRoute,
    		onError,
    		$$scope,
    		$$slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			path: 1,
    			disabled: 0,
    			condition: 6,
    			nofallback: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get path() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nofallback() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofallback(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/yrv/src/Route.svelte generated by Svelte v3.22.3 */
    const file$1 = "node_modules/yrv/src/Route.svelte";

    const get_default_slot_changes = dirty => ({
    	router: dirty & /*activeRouter*/ 4,
    	props: dirty & /*activeProps*/ 8
    });

    const get_default_slot_context = ctx => ({
    	router: /*activeRouter*/ ctx[2],
    	props: /*activeProps*/ ctx[3]
    });

    // (110:0) {#if failure}
    function create_if_block_5(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*failure*/ ctx[4]);
    			attr_dev(p, "data-failure", "");
    			attr_dev(p, "class", "svelte-7lze0z");
    			add_location(p, file$1, 110, 2, 2923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*failure*/ 16) set_data_dev(t, /*failure*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(110:0) {#if failure}",
    		ctx
    	});

    	return block;
    }

    // (114:0) {#if activeRouter}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_if_block_4, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*hasLoaded*/ ctx[5]) return 0;
    		if (/*component*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(114:0) {#if activeRouter}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {:else}
    function create_else_block_1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[25].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[24], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, activeRouter, activeProps*/ 16777228) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[24], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[24], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(126:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#if component}
    function create_if_block_4(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ router: /*activeRouter*/ ctx[2] }, /*activeProps*/ ctx[3]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeRouter, activeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*activeRouter*/ 4 && { router: /*activeRouter*/ ctx[2] },
    					dirty & /*activeProps*/ 8 && get_spread_object(/*activeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(124:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (115:2) {#if !hasLoaded}
    function create_if_block_1$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*pending*/ ctx[1] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pending*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*pending*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(115:2) {#if !hasLoaded}",
    		ctx
    	});

    	return block;
    }

    // (116:4) {#if pending}
    function create_if_block_2(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*pending*/ 2) show_if = !!isSvelteComponent(/*pending*/ ctx[1]);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(116:4) {#if pending}",
    		ctx
    	});

    	return block;
    }

    // (119:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*pending*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pending*/ 2) set_data_dev(t, /*pending*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(119:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (117:6) {#if isSvelteComponent(pending)}
    function create_if_block_3(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ router: /*activeRouter*/ ctx[2] }, /*activeProps*/ ctx[3]];
    	var switch_value = /*pending*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeRouter, activeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*activeRouter*/ 4 && { router: /*activeRouter*/ ctx[2] },
    					dirty & /*activeProps*/ 8 && get_spread_object(/*activeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*pending*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(117:6) {#if isSvelteComponent(pending)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*failure*/ ctx[4] && create_if_block_5(ctx);
    	let if_block1 = /*activeRouter*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*failure*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*activeRouter*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*activeRouter*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $routePath;
    	let $routeInfo;
    	validate_store(routeInfo, "routeInfo");
    	component_subscribe($$self, routeInfo, $$value => $$invalidate(16, $routeInfo = $$value));
    	let { key = null } = $$props;
    	let { path = "/" } = $$props;
    	let { exact = null } = $$props;
    	let { pending = null } = $$props;
    	let { disabled = false } = $$props;
    	let { fallback = null } = $$props;
    	let { component = null } = $$props;
    	let { condition = null } = $$props;
    	let { redirect = null } = $$props;

    	// replacement for `Object.keys(arguments[0].$$.props)`
    	const thisProps = [
    		"key",
    		"path",
    		"exact",
    		"pending",
    		"disabled",
    		"fallback",
    		"component",
    		"condition",
    		"redirect"
    	];

    	const routeContext = getContext(CTX_ROUTE);
    	const routerContext = getContext(CTX_ROUTER);
    	const { assignRoute, unassignRoute } = routerContext || {};
    	const routePath = routeContext ? routeContext.routePath : writable(path);
    	validate_store(routePath, "routePath");
    	component_subscribe($$self, routePath, value => $$invalidate(15, $routePath = value));
    	let activeRouter = null;
    	let activeProps = {};
    	let fullpath;
    	let failure;
    	let hasLoaded;

    	const fixedRoot = $routePath !== path && $routePath !== "/"
    	? `${$routePath}${path !== "/" ? path : ""}`
    	: path;

    	try {
    		if (redirect !== null && !(/^(?:\w+:\/\/|\/)/).test(redirect)) {
    			throw new TypeError(`Expecting valid URL to redirect, given '${redirect}'`);
    		}

    		if (condition !== null && typeof condition !== "function") {
    			throw new TypeError(`Expecting condition to be a function, given '${condition}'`);
    		}

    		if (path.charAt() !== "#" && path.charAt() !== "/") {
    			throw new TypeError(`Expecting a leading slash or hash, given '${path}'`);
    		}

    		if (!assignRoute) {
    			throw new TypeError(`Missing top-level <Router>, given route: ${path}`);
    		}

    		const fixedRoute = path !== fixedRoot && fixedRoot.substr(-1) !== "/"
    		? `${fixedRoot}/`
    		: fixedRoot;

    		[key, fullpath] = assignRoute(key, fixedRoute, { condition, redirect, fallback, exact });
    	} catch(e) {
    		failure = e;
    	}

    	onDestroy(() => {
    		if (unassignRoute) {
    			unassignRoute(fullpath);
    		}
    	});

    	setContext(CTX_ROUTE, { routePath });
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("key" in $$new_props) $$invalidate(7, key = $$new_props.key);
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("exact" in $$new_props) $$invalidate(9, exact = $$new_props.exact);
    		if ("pending" in $$new_props) $$invalidate(1, pending = $$new_props.pending);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("fallback" in $$new_props) $$invalidate(11, fallback = $$new_props.fallback);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("condition" in $$new_props) $$invalidate(12, condition = $$new_props.condition);
    		if ("redirect" in $$new_props) $$invalidate(13, redirect = $$new_props.redirect);
    		if ("$$scope" in $$new_props) $$invalidate(24, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		routeInfo,
    		CTX_ROUTER,
    		CTX_ROUTE,
    		getProps,
    		isPromise,
    		isSvelteComponent,
    		onDestroy,
    		getContext,
    		setContext,
    		key,
    		path,
    		exact,
    		pending,
    		disabled,
    		fallback,
    		component,
    		condition,
    		redirect,
    		thisProps,
    		routeContext,
    		routerContext,
    		assignRoute,
    		unassignRoute,
    		routePath,
    		activeRouter,
    		activeProps,
    		fullpath,
    		failure,
    		hasLoaded,
    		fixedRoot,
    		$routePath,
    		$routeInfo
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(23, $$props = assign(assign({}, $$props), $$new_props));
    		if ("key" in $$props) $$invalidate(7, key = $$new_props.key);
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("exact" in $$props) $$invalidate(9, exact = $$new_props.exact);
    		if ("pending" in $$props) $$invalidate(1, pending = $$new_props.pending);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("fallback" in $$props) $$invalidate(11, fallback = $$new_props.fallback);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("condition" in $$props) $$invalidate(12, condition = $$new_props.condition);
    		if ("redirect" in $$props) $$invalidate(13, redirect = $$new_props.redirect);
    		if ("activeRouter" in $$props) $$invalidate(2, activeRouter = $$new_props.activeRouter);
    		if ("activeProps" in $$props) $$invalidate(3, activeProps = $$new_props.activeProps);
    		if ("fullpath" in $$props) fullpath = $$new_props.fullpath;
    		if ("failure" in $$props) $$invalidate(4, failure = $$new_props.failure);
    		if ("hasLoaded" in $$props) $$invalidate(5, hasLoaded = $$new_props.hasLoaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 if (key) {
    			$$invalidate(2, activeRouter = !disabled && $routeInfo[key]);
    			$$invalidate(3, activeProps = getProps($$props, thisProps));
    		}

    		if ($$self.$$.dirty & /*activeRouter, component*/ 5) {
    			 if (activeRouter) {
    				if (!component) {
    					// component passed as slot
    					$$invalidate(5, hasLoaded = true);
    				} else if (isSvelteComponent(component)) {
    					// component passed as Svelte component
    					$$invalidate(5, hasLoaded = true);
    				} else if (isPromise(component)) {
    					// component passed as import()
    					component.then(module => {
    						$$invalidate(0, component = module.default);
    						$$invalidate(5, hasLoaded = true);
    					});
    				} else {
    					// component passed as () => import()
    					component().then(module => {
    						$$invalidate(0, component = module.default);
    						$$invalidate(5, hasLoaded = true);
    					});
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		pending,
    		activeRouter,
    		activeProps,
    		failure,
    		hasLoaded,
    		routePath,
    		key,
    		path,
    		exact,
    		disabled,
    		fallback,
    		condition,
    		redirect,
    		fullpath,
    		$routePath,
    		$routeInfo,
    		thisProps,
    		routeContext,
    		routerContext,
    		assignRoute,
    		unassignRoute,
    		fixedRoot,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			key: 7,
    			path: 8,
    			exact: 9,
    			pending: 1,
    			disabled: 10,
    			fallback: 11,
    			component: 0,
    			condition: 12,
    			redirect: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get key() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pending() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pending(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redirect() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redirect(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/yrv/src/Link.svelte generated by Svelte v3.22.3 */

    const file$2 = "node_modules/yrv/src/Link.svelte";

    // (97:0) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let a_levels = [
    		/*fixedProps*/ ctx[6],
    		{
    			href: cleanPath(/*fixedHref*/ ctx[5] || /*href*/ ctx[1])
    		},
    		{ class: /*cssClass*/ ctx[0] },
    		{ title: /*title*/ ctx[2] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$2, 97, 2, 2699);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[21](a);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*onClick*/ ctx[7]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*fixedProps*/ 64 && /*fixedProps*/ ctx[6],
    				dirty & /*cleanPath, fixedHref, href*/ 34 && {
    					href: cleanPath(/*fixedHref*/ ctx[5] || /*href*/ ctx[1])
    				},
    				dirty & /*cssClass*/ 1 && { class: /*cssClass*/ ctx[0] },
    				dirty & /*title*/ 4 && { title: /*title*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[21](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(97:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:0) {#if button}
    function create_if_block$2(ctx) {
    	let button_1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		/*fixedProps*/ ctx[6],
    		{ class: /*cssClass*/ ctx[0] },
    		{ title: /*title*/ ctx[2] }
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button_1, button_1_data);
    			add_location(button_1, file$2, 93, 2, 2564);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button_1, anchor);

    			if (default_slot) {
    				default_slot.m(button_1, null);
    			}

    			/*button_1_binding*/ ctx[20](button_1);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button_1, "click", prevent_default(/*onClick*/ ctx[7]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[18], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null));
    				}
    			}

    			set_attributes(button_1, get_spread_update(button_1_levels, [
    				dirty & /*fixedProps*/ 64 && /*fixedProps*/ ctx[6],
    				dirty & /*cssClass*/ 1 && { class: /*cssClass*/ ctx[0] },
    				dirty & /*title*/ 4 && { title: /*title*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[20](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(93:0) {#if button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*button*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $router;
    	validate_store(router, "router");
    	component_subscribe($$self, router, $$value => $$invalidate(14, $router = $$value));
    	let ref;
    	let active;
    	let { class: cssClass = "" } = $$props;
    	let fixedHref = null;
    	let { go = null } = $$props;
    	let { open = null } = $$props;
    	let { href = "/" } = $$props;
    	let { title = "" } = $$props;
    	let { button = false } = $$props;
    	let { exact = false } = $$props;
    	let { reload = false } = $$props;
    	let { replace = false } = $$props;

    	// replacement for `Object.keys(arguments[0].$$.props)`
    	const thisProps = ["go", "open", "href", "class", "title", "button", "exact", "reload", "replace"];

    	const dispatch = createEventDispatcher();

    	// this will enable `<Link on:click={...} />` calls
    	function onClick(e) {
    		if (typeof go === "string" && window.history.length > 1) {
    			if (go === "back") window.history.back(); else if (go === "fwd") window.history.forward(); else window.history.go(parseInt(go, 10));
    			return;
    		}

    		if (!fixedHref) {
    			if (open) {
    				let specs = typeof open === "string" ? open : "";
    				const wmatch = specs.match(/width=(\d+)/);
    				const hmatch = specs.match(/height=(\d+)/);
    				if (wmatch) specs += `,left=${(window.screen.width - wmatch[1]) / 2}`;
    				if (hmatch) specs += `,top=${(window.screen.height - hmatch[1]) / 2}`;

    				if (wmatch && !hmatch) {
    					specs += `,height=${wmatch[1]},top=${(window.screen.height - wmatch[1]) / 2}`;
    				}

    				const w = window.open(href, "", specs);

    				const t = setInterval(
    					() => {
    						if (w.closed) {
    							dispatch("close");
    							clearInterval(t);
    						}
    					},
    					120
    				);
    			} else window.location.href = href;

    			return;
    		}

    		fixedLocation(
    			href,
    			() => {
    				navigateTo(fixedHref, { reload, replace });
    			},
    			() => dispatch("click", e)
    		);
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, ['default']);

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, ref = $$value);
    		});
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, ref = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(0, cssClass = $$new_props.class);
    		if ("go" in $$new_props) $$invalidate(8, go = $$new_props.go);
    		if ("open" in $$new_props) $$invalidate(9, open = $$new_props.open);
    		if ("href" in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ("title" in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ("button" in $$new_props) $$invalidate(3, button = $$new_props.button);
    		if ("exact" in $$new_props) $$invalidate(10, exact = $$new_props.exact);
    		if ("reload" in $$new_props) $$invalidate(11, reload = $$new_props.reload);
    		if ("replace" in $$new_props) $$invalidate(12, replace = $$new_props.replace);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ROOT_URL,
    		HASHCHANGE,
    		fixedLocation,
    		navigateTo,
    		cleanPath,
    		isActive,
    		getProps,
    		router,
    		ref,
    		active,
    		cssClass,
    		fixedHref,
    		go,
    		open,
    		href,
    		title,
    		button,
    		exact,
    		reload,
    		replace,
    		thisProps,
    		dispatch,
    		onClick,
    		$router,
    		fixedProps
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("ref" in $$props) $$invalidate(4, ref = $$new_props.ref);
    		if ("active" in $$props) $$invalidate(13, active = $$new_props.active);
    		if ("cssClass" in $$props) $$invalidate(0, cssClass = $$new_props.cssClass);
    		if ("fixedHref" in $$props) $$invalidate(5, fixedHref = $$new_props.fixedHref);
    		if ("go" in $$props) $$invalidate(8, go = $$new_props.go);
    		if ("open" in $$props) $$invalidate(9, open = $$new_props.open);
    		if ("href" in $$props) $$invalidate(1, href = $$new_props.href);
    		if ("title" in $$props) $$invalidate(2, title = $$new_props.title);
    		if ("button" in $$props) $$invalidate(3, button = $$new_props.button);
    		if ("exact" in $$props) $$invalidate(10, exact = $$new_props.exact);
    		if ("reload" in $$props) $$invalidate(11, reload = $$new_props.reload);
    		if ("replace" in $$props) $$invalidate(12, replace = $$new_props.replace);
    		if ("fixedProps" in $$props) $$invalidate(6, fixedProps = $$new_props.fixedProps);
    	};

    	let fixedProps;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*href*/ 2) {
    			// rebase active URL
    			 if (!(/^(\w+:)?\/\//).test(href)) {
    				$$invalidate(5, fixedHref = cleanPath(ROOT_URL, true) + cleanPath(HASHCHANGE ? `#${href}` : href));
    			}
    		}

    		if ($$self.$$.dirty & /*ref, $router, href, exact, active, button*/ 25626) {
    			 if (ref && $router.path) {
    				if (isActive(href, $router.path, exact)) {
    					if (!active) {
    						$$invalidate(13, active = true);
    						ref.setAttribute("aria-current", "page");

    						if (button) {
    							ref.setAttribute("disabled", true);
    						}
    					}
    				} else if (active) {
    					$$invalidate(13, active = false);
    					ref.removeAttribute("disabled");
    					ref.removeAttribute("aria-current");
    				}
    			}
    		}

    		// extract additional props
    		 $$invalidate(6, fixedProps = getProps($$props, thisProps));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		cssClass,
    		href,
    		title,
    		button,
    		ref,
    		fixedHref,
    		fixedProps,
    		onClick,
    		go,
    		open,
    		exact,
    		reload,
    		replace,
    		active,
    		$router,
    		thisProps,
    		dispatch,
    		$$props,
    		$$scope,
    		$$slots,
    		button_1_binding,
    		a_binding
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 0,
    			go: 8,
    			open: 9,
    			href: 1,
    			title: 2,
    			button: 3,
    			exact: 10,
    			reload: 11,
    			replace: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get go() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set go(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reload() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reload(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Object.defineProperty(Router, 'hashchange', {
      set: value => hashchangeEnable(value),
      get: () => hashchangeEnable(),
      configurable: false,
      enumerable: false,
    });

    /* node_modules/svelte-atoms/Variables.svelte generated by Svelte v3.22.3 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Variables> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Variables", $$slots, []);
    	return [];
    }

    class Variables extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Variables",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var arrowDown = "M9 12.268l2.293-2.235a1.02 1.02 0 011.414 0c.39.38.39.998 0 1.379L8 16l-4.707-4.588a.957.957 0 010-1.379 1.02 1.02 0 011.414 0L7 12.268V.975A.988.988 0 018 0c.552 0 1 .436 1 .975v11.293z";

    var arrowLeft = "M5.977 9H13a1 1 0 100-2H5.977l2.726-2.448a.845.845 0 000-1.286 1.095 1.095 0 00-1.431 0L2 8l5.272 4.734a1.095 1.095 0 001.431 0 .845.845 0 000-1.286L5.977 9z";

    var arrowRight = "M10.023 9H3a1 1 0 110-2h7.023L7.297 4.552a.845.845 0 010-1.286 1.095 1.095 0 011.431 0L14 8l-5.272 4.734a1.095 1.095 0 01-1.431 0 .845.845 0 010-1.286L10.023 9z";

    var arrowUp = "M9 3.732l2.293 2.235c.39.38 1.024.38 1.414 0a.957.957 0 000-1.379L8 0 3.293 4.588a.957.957 0 000 1.379c.39.38 1.024.38 1.414 0L7 3.732v11.293c0 .539.448.975 1 .975s1-.436 1-.975V3.732z";

    var arrowsUpdown = "M8 2.646l-3.293 3.08a1.05 1.05 0 01-1.414 0 .893.893 0 010-1.323L8 0l4.707 4.403c.39.365.39.958 0 1.323a1.05 1.05 0 01-1.414 0L8 2.646zm0 10.708l3.293-3.08a1.05 1.05 0 011.414 0c.39.365.39.958 0 1.323L8 16l-4.707-4.403a.893.893 0 010-1.323 1.05 1.05 0 011.414 0L8 13.354z";

    var attention = "M6 9V2a2 2 0 114 0v7a2 2 0 11-4 0zm2 7a2 2 0 110-4 2 2 0 010 4z";

    var burger = "M1 5a1 1 0 110-2h13.986a1 1 0 010 2H1zm0 4a1 1 0 110-2h13.986a1 1 0 010 2H1zm0 4a1 1 0 010-2h13.986a1 1 0 010 2H1z";

    var calendar = "M4 2V0h2v2h4V0h2v2h1c1.657 0 3 1.373 3 3.067v7.866C16 14.627 14.657 16 13 16H3c-1.657 0-3-1.373-3-3.067V5.067C0 3.373 1.343 2 3 2h1zm0 0zm2 0zm4 0zm2 0zM3 4c-.552 0-1 .462-1 1.032v7.936C2 13.538 2.448 14 3 14h10c.552 0 1-.462 1-1.032V5.032C14 4.462 13.552 4 13 4H3zm1 9v-2h2v2H4zm3 0v-2h2v2H7zm3 0v-2h2v2h-2zm-6-3V8h2v2H4zm3 0V8h2v2H7zm0-3V5h2v2H7zm3 3V8h2v2h-2zm0-3V5h2v2h-2z";

    var cashbox = "M9 8V6H7a1 1 0 01-1-1V1a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1h-2v2h2a1 1 0 011 1v6a1 1 0 01-1 1H1a1 1 0 01-1-1V9a1 1 0 011-1h8zm0-4h5V2H8v2h1zm-7 6v4h12v-4H2z";

    var cashbox2 = "M4 5V1.5A1.5 1.5 0 015.5 0h3.293a1.5 1.5 0 011.06.44l1.708 1.706A1.5 1.5 0 0112 3.207V5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm2 0h4V3.414L8.586 2H6v3zm-.5 3h5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5zM4 7v7h8V7H4z";

    var catalog = "M9 4.711v6.727a10.236 10.236 0 015-.234V4.337A6.481 6.481 0 0011.969 4c-.97 0-1.955.232-2.969.711zm-2 .06C5.994 4.25 5.022 4 4.061 4c-.65 0-1.337.115-2.061.351v6.85a10.063 10.063 0 015 .26V4.77zM7.93 3h.015c1.341-.667 2.683-1 4.024-1 1.344 0 2.687.335 4.031 1.004v11C14.656 13.334 13.312 13 11.969 13c-1.344 0-2.688.335-4.031 1.004C6.643 13.334 5.332 13 4 13c-1.332 0-2.665.335-4 1.004v-11C1.411 2.334 2.765 2 4.061 2c1.294 0 2.584.333 3.87 1z";

    var check = "M14.138 2.322a1.085 1.085 0 011.542 0c.427.43.427 1.126 0 1.555L6 13.602.32 7.877a1.106 1.106 0 010-1.555 1.085 1.085 0 011.542 0L6 10.492l8.138-8.17z";

    var chevronDown = "M8 10.657l6.364-6.364a1 1 0 011.414 1.414l-7.07 7.071a1 1 0 01-1.415 0L.222 5.708a1 1 0 011.414-1.415L8 10.657z";

    var chevronLeft = "M5.225 8.016l6.364-6.364A1 1 0 1010.174.237l-7.07 7.071a1 1 0 000 1.415l7.07 7.07a1 1 0 001.415-1.413L5.225 8.016z";

    var chevronRight = "M10.538 8.016L4.174 1.652A1 1 0 115.59.237l7.07 7.071a1 1 0 010 1.415l-7.07 7.07a1 1 0 01-1.415-1.413l6.364-6.364z";

    var chevronUp = "M8 5.343l6.364 6.364a1 1 0 001.414-1.414l-7.07-7.071a1 1 0 00-1.415 0l-7.071 7.07a1 1 0 001.414 1.415L8 5.343z";

    var clear = "M10.347 12.186l3.863.028c.511.009.933.43.942.942a.888.888 0 01-.91.91H7.754a.767.767 0 01-.252-.048l-5.837-.04C.193 12.507.152 10.162 1.573 8.74L7.74 2.573c1.422-1.42 3.767-1.38 5.238.092l.78.78c1.472 1.472 1.513 3.817.092 5.238l-3.503 3.503zm-.056-2.609L6.866 6.113l-3.96 3.96c-.55.549-.662 1.374-.345 2.06l5.14.035 2.59-2.59zm1.287-1.287l.94-.94c.71-.71.69-1.882-.046-2.618l-.78-.78c-.736-.736-1.909-.757-2.62-.046l-.92.92 3.426 3.464z";

    var close = "M8.047 9.555L8 9.602l-.047-.047-4.09 4.123c-.427.43-1.117.43-1.543 0a1.106 1.106 0 010-1.555L6.41 8 2.32 3.877a1.106 1.106 0 010-1.555 1.085 1.085 0 011.542 0l4.091 4.123L8 6.398l.047.047 4.09-4.123a1.085 1.085 0 011.543 0c.427.43.427 1.126 0 1.555L9.59 8l4.09 4.123c.427.43.427 1.126 0 1.555-.426.43-1.116.43-1.542 0L8.047 9.555z";

    var column = "M9 1a1 1 0 112 0v14a1 1 0 11-2 0V1zm4 0a1 1 0 112 0v14a1 1 0 11-2 0V1zM5 1a1 1 0 112 0v14a1 1 0 11-2 0V1zM1 1a1 1 0 112 0v14a1 1 0 11-2 0V1z";

    var copy = "M10 12H4V6H2v8h8v-2zm0 0V6H4v6h6zM4 4V1a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1h-3v3a1 1 0 01-1 1H1a1 1 0 01-1-1V5a1 1 0 011-1h3zm2 0h5a1 1 0 011 1v5h2V2H6v2z";

    var cycle = "M4.912 11.5a4.667 4.667 0 007.36-1.62 1.167 1.167 0 012.136.941A7 7 0 013.333 13.22v.614a1.167 1.167 0 11-2.333 0V9.167h4.667a1.167 1.167 0 110 2.333h-.755zm6.176-7a4.668 4.668 0 00-7.37 1.641 1.167 1.167 0 01-2.14-.93 7 7 0 0111.089-2.43v-.614a1.167 1.167 0 112.333 0v4.666h-4.667a1.167 1.167 0 010-2.333h.755z";

    var visible = "M8 5c-1.9 0-3.707.955-5.464 3C4.293 10.045 6.101 11 8 11c1.9 0 3.707-.955 5.464-3C11.707 5.955 9.899 5 8 5zm0 8c-2.946 0-5.612-1.667-8-5 2.388-3.333 5.054-5 8-5 2.946 0 5.612 1.667 8 5-2.388 3.333-5.054 5-8 5zm0-3a2 2 0 110-4 2 2 0 010 4z";

    var edit = "M4.204 10.126l1.724 1.748 5.994-6.034-1.73-1.743-5.988 6.029zm-.892 1.23l-.737 2.155 2.242-.63-1.505-1.525zm7.793-8.177l1.729 1.743.747-.752-1.73-1.741-.746.75zM6.207 14.442a1.004 1.004 0 01-.441.259l-4.489 1.26A1.004 1.004 0 01.056 14.67L1.66 9.98c.05-.144.13-.274.238-.382l9.24-9.302a1.004 1.004 0 011.425 0l3.145 3.166a1.004 1.004 0 010 1.415l-9.501 9.565z";

    var favorite = "M10.776 11.127a3.075 3.075 0 01.813-2.614l1.434-1.48-1.992-.315c-.918-.145-1.712-.748-2.128-1.616L8 3.22l-.903 1.882a2.873 2.873 0 01-2.128 1.616l-1.992.316 1.434 1.479c.661.682.964 1.657.813 2.614l-.328 2.077 1.789-.968a2.752 2.752 0 012.63 0l1.79.968-.329-2.077zm-3.215 2.88l-3.477 1.881a.934.934 0 01-1.286-.427 1.036 1.036 0 01-.094-.62l.638-4.038c.05-.32-.05-.644-.271-.872L.284 7.056a1.029 1.029 0 01-.009-1.41.94.94 0 01.536-.285l3.872-.614a.958.958 0 00.71-.538L7.146.55a.936.936 0 011.28-.444.976.976 0 01.425.444l1.756 3.659c.139.29.403.49.71.538l3.871.614c.521.083.88.591.8 1.135-.03.213-.127.41-.273.56L12.93 9.931a1.03 1.03 0 00-.271.872l.638 4.038c.085.543-.266 1.056-.786 1.145a.918.918 0 01-.594-.098l-3.478-1.882a.917.917 0 00-.877 0z";

    var favoriteFill = "M7.561 14.006l-3.477 1.882a.934.934 0 01-1.286-.427 1.036 1.036 0 01-.094-.62l.638-4.038c.05-.32-.05-.644-.271-.872L.284 7.056a1.029 1.029 0 01-.009-1.41.94.94 0 01.536-.285l3.872-.614a.958.958 0 00.71-.538L7.146.55a.936.936 0 011.28-.444.976.976 0 01.425.444l1.756 3.659c.139.29.403.49.71.538l3.871.614c.521.083.88.591.8 1.135-.03.213-.127.41-.273.56L12.93 9.931a1.03 1.03 0 00-.271.872l.638 4.038c.085.543-.266 1.056-.786 1.145a.918.918 0 01-.594-.098l-3.478-1.882a.917.917 0 00-.877 0z";

    var file$3 = "M4 0h5.158a2 2 0 011.422.593l2.842 2.872A2 2 0 0114 4.87V14a2 2 0 01-2 2H4a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h8V4.871L9.158 2H4z";

    var filter = "M3.437 2l3.33 3.287A1 1 0 017.064 6v7.363l1.919-.986V6a1 1 0 01.294-.709L12.58 2H3.437zm1.627 4.417L.297 1.712C-.339 1.084.106 0 1 0h14c.892 0 1.338 1.079.706 1.708l-4.723 4.706v6.573a1 1 0 01-.543.89L6.52 15.89A1 1 0 015.064 15V6.417z";

    var history = "M6.027 12H4.923C4.413 12 4 11.552 4 11s.413-1 .923-1h1.333c.126-.356.295-.691.502-1H4.923C4.413 9 4 8.552 4 8s.413-1 .923-1h5.154a.86.86 0 01.128.01A4.568 4.568 0 0112 7.256V5.392L8.583 2H4a1 1 0 00-1 1v10a1 1 0 001 1h2.758a4.474 4.474 0 01-.73-2zm6.945 3.26A2.985 2.985 0 0111 16H4a3 3 0 01-3-3V3a3 3 0 013-3h4.995l.704.29 4.005 3.976.296.71V8.67c.625.773 1 1.757 1 2.829a4.496 4.496 0 01-4.5 4.5l2.472-.74zM10.5 14a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4.923 6C4.413 6 4 5.552 4 5s.413-1 .923-1h3.154C8.587 4 9 4.448 9 5s-.413 1-.923 1H4.923zm6.577 5a.5.5 0 110 1H10v-1.5a.5.5 0 111 0v.5h.5z";

    var inputCalendar = "M4 2V0h2v2h4V0h2v2h1c1.657 0 3 1.373 3 3.067v7.866C16 14.627 14.657 16 13 16H3c-1.657 0-3-1.373-3-3.067V5.067C0 3.373 1.343 2 3 2h1zm0 0zm2 0zm4 0zm2 0zM3 4c-.552 0-1 .462-1 1.032v7.936C2 13.538 2.448 14 3 14h10c.552 0 1-.462 1-1.032V5.032C14 4.462 13.552 4 13 4H3zm1 9v-2h2v2H4zm3 0v-2h2v2H7zm3 0v-2h2v2h-2zm-6-3V8h2v2H4zm3 0V8h2v2H7zm0-3V5h2v2H7zm3 3V8h2v2h-2zm0-3V5h2v2h-2z";

    var invisible = "M3.85 9.32l-1.416 1.417C1.593 10.003.782 9.091 0 8c2.388-3.333 5.054-5 8-5a7.54 7.54 0 011.924.247L8.17 5.003A5.634 5.634 0 008 5c-1.9 0-3.707.955-5.464 3 .435.506.873.946 1.315 1.32zm3.981 1.677C7.887 11 7.944 11 8 11c1.9 0 3.707-.955 5.464-3a11.837 11.837 0 00-1.315-1.32l1.417-1.417C14.407 5.997 15.218 6.909 16 8c-2.388 3.333-5.054 5-8 5a7.54 7.54 0 01-1.924-.247l1.755-1.756zm5.826-8.654a1 1 0 010 1.414l-9.9 9.9a1 1 0 01-1.414-1.414l9.9-9.9a1 1 0 011.414 0z";

    var key = "M6.166 6.283a5 5 0 113.579 3.558l-1.304.874-.795 2.905-2.576.31L4 16H0v-3.605l6.166-6.112zM11 8a3 3 0 100-6 3 3 0 000 6zm1-3a1 1 0 110-2 1 1 0 010 2zM2 13.229V14h.782l.997-1.929 2.293-.276.637-2.327 1-.67-.662-.572L2 13.23z";

    var list3 = "M1 5a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm4-8a1 1 0 110-2h9.986a1 1 0 010 2H5zm0 4a1 1 0 110-2h9.986a1 1 0 010 2H5zm0 4a1 1 0 010-2h9.986a1 1 0 010 2H5z";

    var loader = "M8 0a1 1 0 110 2 6 6 0 106 6 1 1 0 012 0 8 8 0 11-8-8z";

    var market = "M1.25 8.033A1.75 1.75 0 01-.046 5.768l1.334-4.005A.75.75 0 012 1.25h12a.75.75 0 01.712.513l1.334 4.005a1.75 1.75 0 01-1.296 2.265V10H15a1 1 0 011 1v4a1 1 0 01-1 1H1a1 1 0 01-1-1v-4a1 1 0 011-1h.25V8.033zm1.5-.17V10h10.5V7.863A7.4 7.4 0 0012 7.756c-.7 0-1.01.093-1.666.418-.845.42-1.367.576-2.334.576-.967 0-1.49-.156-2.334-.576C5.011 7.85 4.7 7.756 4 7.756a7.4 7.4 0 00-1.25.107zM1.5 11.5v3h13v-3h-13zm1.04-8.75L1.378 6.242a.25.25 0 00.3.32A9.043 9.043 0 014 6.257c.967 0 1.49.155 2.334.575.655.326.967.419 1.666.419.7 0 1.01-.093 1.666-.419.845-.42 1.367-.575 2.334-.575.775 0 1.55.102 2.322.307a.25.25 0 00.301-.321L13.46 2.75H2.541z";

    var message = "M3 2c-.552 0-1 .462-1 1.032v6.936C2 10.538 2.448 11 3 11h5l2.786 1.683L11.39 11H13c.552 0 1-.462 1-1.032V3.032C14 2.462 13.552 2 13 2H3zm0-2h10c1.657 0 3 1.373 3 3.067v6.866C16 11.627 14.657 13 13 13l-1.048 3-4.866-3H3c-1.657 0-3-1.373-3-3.067V3.067C0 1.373 1.343 0 3 0zm2 4h6a1 1 0 010 2H5a1 1 0 110-2zm0 3h6a1 1 0 010 2H5a1 1 0 110-2z";

    var minus = "M1 7h14c.554 0 1 .446 1 1s-.446 1-1 1H1c-.554 0-1-.446-1-1s.446-1 1-1z";

    var moreHorizontal = "M14 10a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4zm-6 0a2 2 0 110-4 2 2 0 010 4z";

    var moreVertical = "M8 16a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4z";

    var phone = "M3.55.124c.243.092.475.227.727.405.064.046.127.093.197.146l.128.1c.366.258.665.52 1.154.988l.265.252c.388.388.553.571.746.872.616.973.46 1.622-.27 2.731a6.218 6.218 0 01-.432.544l-.05.058-.151.172a17.881 17.881 0 00.56.867c.31.437.677.858 1.083 1.245.381.363.834.714 1.374 1.067a16.235 16.235 0 00.885.555l.235-.234c.031-.031.068-.07.116-.125l.15-.171c.487-.55.866-.824 1.475-.847.439-.014.855.168 1.34.498.154.103.31.22.484.358.097.077.593.487.692.56 1.166.892 1.668 1.456 1.74 2.474.028.69-.319 1.29-.88 1.886-2.462 2.69-5.943 1.46-10.044-1.748C1.591 10.052-.41 7.003.071 3.701.303 2.164 1.21.577 2.408.116c.247-.123.52-.139.78-.09.122.02.242.053.361.098zM1.601 3.926c-.38 2.605 1.338 5.222 4.429 7.64 3.478 2.72 6.299 3.718 7.95 1.913.307-.326.477-.62.472-.754-.027-.38-.332-.722-1.128-1.33-.128-.095-.657-.531-.725-.585a6.527 6.527 0 00-.39-.29c-.232-.158-.4-.232-.414-.231-.043.002-.146.076-.367.326-.073.083-.122.14-.153.173a4.344 4.344 0 01-.18.192l-.599.599a.778.778 0 01-.615.233.98.98 0 01-.246-.043 1.948 1.948 0 01-.286-.117 7.39 7.39 0 01-.544-.301 16.939 16.939 0 01-.8-.51 10.927 10.927 0 01-1.57-1.224c-.477-.454-.909-.95-1.274-1.466a19.05 19.05 0 01-.515-.785 7.814 7.814 0 01-.3-.516 2.04 2.04 0 01-.117-.264.976.976 0 01-.051-.22c-.022-.198.008-.396.204-.638.114-.124.288-.316.46-.515l.046-.054a5.3 5.3 0 00.316-.39c.428-.65.451-.747.255-1.056-.11-.173-.224-.299-.522-.596l-.253-.243c-.438-.417-.693-.64-1.004-.861l-.15-.115a5.675 5.675 0 00-.155-.115A1.807 1.807 0 003 1.564a.502.502 0 00-.035-.011c-.616.299-1.211 1.367-1.364 2.373z";

    var plus = "M7.036 7V1.036a1 1 0 112 0V7H15a1 1 0 010 2H9.036v5.964a1 1 0 01-2 0V9H1.07a1 1 0 010-2h5.965z";

    var print = "M2 12H1a1 1 0 01-1-1V5a1 1 0 011-1h1V2a2 2 0 012-2h8a2 2 0 012 2v2h1a1 1 0 011 1v6a1 1 0 01-1 1h-1v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm2-1v3h8V7H4v4zm0-7h8V2H4v2zm2 6a1 1 0 110-2h4a1 1 0 010 2H6zm0 3a1 1 0 010-2h4a1 1 0 010 2H6z";

    var question = "M8.5 16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0-16C10.981 0 13 2.05 13 4.571c0 2.127-1.436 3.918-3.375 4.427v1.86c0 .63-.504 1.142-1.125 1.142a1.134 1.134 0 01-1.125-1.143V8c0-.631.504-1.143 1.125-1.143 1.24 0 2.25-1.025 2.25-2.286 0-1.26-1.01-2.285-2.25-2.285S6.25 3.31 6.25 4.57c0 .632-.504 1.143-1.125 1.143A1.134 1.134 0 014 4.571C4 2.051 6.019 0 8.5 0z";

    var rouble = "M4 11V9h-.995A1.002 1.002 0 012 8c0-.552.45-1 1.005-1H4V1a1 1 0 011-1h4.5a4.5 4.5 0 110 9H6v2h4.995c.555 0 1.005.448 1.005 1s-.45 1-1.005 1H6v2a1 1 0 01-2 0v-2h-.995A1.002 1.002 0 012 12c0-.552.45-1 1.005-1H4zm2-9v5h3.5a2.5 2.5 0 100-5H6z";

    var save = "M11 2.414V4a2 2 0 01-2 2H6a2 2 0 01-2-2V2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5.828a1 1 0 00-.293-.707L11 2.414zM3 0h7.172a3 3 0 012.12.879l2.83 2.828A3 3 0 0116 5.828V13a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3zm3 2v2h3V2H6zM5 9v2h6V9H5zm0-2h6a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z";

    var set = "M13.962 10.33a3.494 3.494 0 010-4.516l-.128-.31A3.492 3.492 0 0110.64 2.31l-.31-.128a3.492 3.492 0 01-4.516 0l-.31.128A3.492 3.492 0 012.31 5.504l-.128.31a3.492 3.492 0 010 4.517l.128.31a3.492 3.492 0 013.194 3.193l.31.128a3.494 3.494 0 014.516 0l.31-.128a3.492 3.492 0 011.01-2.184 3.494 3.494 0 012.184-1.01l.128-.31zm-3.329 3.964l.013.257.109-.006.079-.07-.172-.191a3.479 3.479 0 00-.03-.034l.001.044zm-5.15-.01l-.172.19.079.071.108.006.013-.257.002-.044-.03.034zm-3.633-3.65l-.257.012.006.109.071.079.19-.173.034-.03-.044.002zm.01-5.151l-.19-.172-.071.078-.006.109.257.013.044.002-.033-.03zM5.512 1.85l-.013-.257-.109.006-.079.071.173.19.03.034-.002-.044zm5.15.01l.173-.19-.08-.071-.108-.006-.013.257-.002.044.03-.033zm3.633 3.651l.257-.013-.006-.109-.071-.078-.19.171-.034.031.044-.002zm-.01 5.15l.19.173.071-.08.006-.108-.257-.013-.044-.002.034.03zm.165 1.983l-.257-.013a1.493 1.493 0 00-1.128.433 1.492 1.492 0 00-.434 1.128l.014.257a1 1 0 01-.616.975l-1.553.644a1 1 0 01-1.126-.254l-.172-.19a1.493 1.493 0 00-1.105-.491c-.42 0-.824.18-1.105.491l-.172.19a1 1 0 01-1.125.254l-1.554-.644a1 1 0 01-.615-.975l.013-.257a1.491 1.491 0 00-1.562-1.562l-.257.014a1 1 0 01-.974-.616l-.645-1.553A1 1 0 01.33 9.349l.19-.172a1.492 1.492 0 000-2.21l-.19-.172A1 1 0 01.076 5.67l.645-1.554a1 1 0 01.974-.615l.257.013a1.492 1.492 0 001.561-1.561l-.012-.257A1 1 0 014.116.72L5.67.076A1 1 0 016.795.33l.172.19a1.492 1.492 0 002.21 0l.172-.19a1 1 0 011.125-.254l1.554.645a1 1 0 01.616.974l-.014.257a1.491 1.491 0 001.561 1.561l.258-.012a1 1 0 01.974.615l.645 1.554a1 1 0 01-.254 1.125l-.19.172a1.493 1.493 0 00-.491 1.105c0 .42.179.824.49 1.105l.191.172a1 1 0 01.254 1.125l-.644 1.554a1 1 0 01-.975.616zM8 10a2 2 0 100-4 2 2 0 000 4zm0 2a4 4 0 110-8 4 4 0 010 8z";

    var settings = "M9 10.732V15a1 1 0 01-2 0v-4.268a2 2 0 112 0zm3.031-7.482A1.002 1.002 0 0112 3V1a1 1 0 012 0v2c0 .086-.01.17-.031.25a2 2 0 11-1.938 0zm-10 0A1.002 1.002 0 012 3V1a1 1 0 112 0v2c0 .086-.01.17-.031.25a2 2 0 11-1.938 0zM2 10a1 1 0 112 0v5a1 1 0 01-2 0v-5zm10 0a1 1 0 012 0v5a1 1 0 01-2 0v-5zM7 1a1 1 0 112 0v3a1 1 0 11-2 0V1z";

    var sort = "M7 1v14a1 1 0 01-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1zm2 14V1a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z";

    var sortDown = ["M9 15V1a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z",{path:"M7 1v14a1 1 0 01-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1z",color:"var(--palette-noactive-3)"}];

    var sortUp = ["M7 1v14a1 1 0 11-2 0V3.414L2.707 5.707a1 1 0 01-1.414-1.414l4-4A1 1 0 017 1z",{path:"M9 15V1a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4A1 1 0 019 15z",color:"var(--palette-noactive-3)"}];

    var trash = "M2 5h12V4h-3a1 1 0 01-1-1V2H6v1a1 1 0 01-1 1H2v1zm12 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7H1a1 1 0 01-1-1V3a1 1 0 011-1h3V1a1 1 0 011-1h6a1 1 0 011 1v1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1zm-2 0H4v7h8V7zM5 9a1 1 0 112 0v3a1 1 0 01-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 01-2 0V9z";

    var upload = "M14 14v-4a1 1 0 012 0v6H0v-6a1 1 0 112 0v4h12zM7 3.828L4.207 6.621a1 1 0 11-1.414-1.414L8 0l5.207 5.207a1 1 0 11-1.414 1.414L9 3.828V11a1 1 0 01-2 0V3.828z";

    var download = "M14 14v-4a1 1 0 012 0v6H0v-6a1 1 0 112 0v4h12zM7 8.172V1a1 1 0 112 0v7.172l2.793-2.793a1 1 0 011.414 1.414L8 12 2.793 6.793a1 1 0 011.414-1.414L7 8.172z";

    var cashCheck = "M11.002 15.132l-1.587.785a1 1 0 01-.897-.005l-1.52-.774-1.519.774a1 1 0 01-.897.005l-2.026-1.005A1 1 0 012 14.016V1a1 1 0 011-1h10.033a1 1 0 011 1v14.02a1 1 0 01-1.444.897l-1.587-.785zM4 13.396l1.02.506 1.525-.777a1 1 0 01.907 0l1.526.777 1.581-.782a1 1 0 01.887 0l.587.29V2H4v11.396zM6 3h4a1 1 0 010 2H6a1 1 0 110-2zm0 3h4a1 1 0 010 2H6a1 1 0 110-2zm0 3h4a1 1 0 010 2H6a1 1 0 010-2z";

    var move = "M5.65 7.063L3.292 4.707a1 1 0 011.414-1.414l2.356 2.356A1 1 0 019 6v2a.999.999 0 01-1 1H6a1 1 0 01-.35-1.937zM3 0h6a3 3 0 013 3v6a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H3zm10 2a3 3 0 013 3v6a3 3 0 01-3 3H7a3 3 0 01-3-3h2a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 00-1-1V4z";

    var tree = "M7 9h4a1 1 0 010 2H6a1 1 0 01-1-1V6H2v7h13a1 1 0 010 2H1a.997.997 0 01-1-1V1a1 1 0 112 0v3h13a1 1 0 010 2H7v3zm8 0a1 1 0 110 2 1 1 0 010-2z";

    var list4 = "M14.986 3a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm-4-12a1 1 0 100-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 100-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 000-2H1a1 1 0 000 2h9.986zm0 4a1 1 0 000-2H1a1 1 0 000 2h9.986z";

    var ok = "M13.462 6.304a7 7 0 11-2.621-3.157L9.62 4.74a5 5 0 102.328 3.541l1.513-1.978zm-6.755-.011L8.4 7.985 14.206.393a1 1 0 111.588 1.214l-6.5 8.5a1 1 0 01-1.501.1l-2.5-2.5a1 1 0 011.414-1.414z";

    var monitor = "M9 12v2h3a1 1 0 010 2H4a1 1 0 010-2h3v-2H2a2 2 0 01-2-2V2a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9zM2 2v8h12V2H2z";

    var toggleOff = "M6 2h4a6 6 0 110 12H6A6 6 0 116 2zm4 9a3 3 0 100-6 3 3 0 000 6z";

    var toggleOn = "M6 2h4a6 6 0 110 12H6A6 6 0 116 2zm0 2a4 4 0 100 8h4a4 4 0 100-8H6zm0 7a3 3 0 110-6 3 3 0 010 6z";

    var mail = "M15.994 3.846a.94.94 0 01.006.187V12a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 011.994 1.846zM2.77 4l5.238 3.618L13.236 4H2.77zM14 5.854L8.009 10 2 5.849V12h12V5.854z";

    var mailFull = "M15.535 2.718l-7.56 5.068-7.54-5.03C.8 2.296 1.364 2 2 2h12c.617 0 1.168.28 1.535.718zM16 4.814V12a2 2 0 01-2 2H2a2 2 0 01-2-2V4.87l7.978 5.322L16 4.814z";

    var mailOk = "M16 6.033v7.149C16 14.73 14.778 16 13.25 16H2.75C1.222 16 0 14.73 0 13.182V6a.944.944 0 01.186-.593.996.996 0 01.521-.364L8.007 0l7.286 5.043a.99.99 0 01.52.363.944.944 0 01.187.627zM2 7.85v5.332c0 .46.345.818.75.818h10.5c.405 0 .75-.358.75-.818v-5.33L8.007 12 2 7.85zM2.768 6l5.238 3.618L13.234 6 8.006 2.382 2.768 6z";

    var fullscreen = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm3 3v2a1 1 0 11-2 0V4a1 1 0 011-1h3a1 1 0 110 2H5zm6 6V9a1 1 0 012 0v3a1 1 0 01-1 1H9a1 1 0 010-2h2z";

    var smallscreen = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm4 4V4a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 110-2h2zm4 4v2a1 1 0 01-2 0V9a1 1 0 011-1h3a1 1 0 010 2h-2z";

    var cart = "M5.542 3h9.353C15.505 3 16 3.448 16 4c0 .045-.003.09-.01.133.024.174.005.357-.064.532l-1.773 5.01A2.073 2.073 0 0112.23 11H7.45a2.076 2.076 0 01-1.969-1.447L3.395 3.105H1.036A1.045 1.045 0 010 2.053C0 1.47.464 1 1.036 1h2.359c.895 0 1.689.584 1.968 1.447l.18.553zm.648 2l1.26 3.895h4.778L13.607 5H6.19zm.31 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z";

    var notifyNot = "M11.584 12.998A1.524 1.524 0 0111.5 13h-10a1.5 1.5 0 010-3H3V5c0-.188.01-.373.03-.555L.293 1.707A1 1 0 111.707.293l14 14a1 1 0 01-1.414 1.414l-2.71-2.71zM4.678 1.263A5 5 0 0113 5v4.586L4.678 1.263zM10 14a2 2 0 11-4 0h4z";

    var notify = "M13 10h1.5a1.5 1.5 0 010 3h-13a1.5 1.5 0 010-3H3V5a5 5 0 1110 0v5zm-3 4a2 2 0 11-4 0h4z";

    var monitorNot = "M2 3.414V10h6.586L2 3.414zM10.586 12H9v2h2a1 1 0 010 2H4a1 1 0 010-2h3v-2H2a2 2 0 01-2-2V2a2 2 0 01.088-.589A1 1 0 011.708.293l14 14a1 1 0 01-1.415 1.414L10.586 12zM3.414 0H14a2 2 0 012 2v8c0 .702-.362 1.32-.91 1.677L13.415 10H14V2H5.414l-2-2z";

    var start = "M8 16A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12zm-.972-9.297l4.156 2.434a1 1 0 010 1.726l-4.156 2.434a1 1 0 01-1.506-.862v-4.87a1 1 0 011.506-.862z";

    var image = "M14 4.692V2H2v10.577l4.437-4.426 2.395 1.979 5.12-5.483.048.045zm0 2.834L9.009 12.87l-2.446-2.02L3.406 14H14V7.526zM2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm3 7a2 2 0 110-4 2 2 0 010 4z";

    var hub = "M5 13.688l9-2.25V4.562l-9 2.25v6.876zm-2-.424V6.736l-1-.503v6.53l1 .5zM4 5l12-3v11L4 16l-4-2V2.99L4 5zm8-5l2 .938L16 2l-2.505.629L12 2 2.567 4.28 0 2.99 12 0zM8 7.234l.837-.257v4.766L8 12V7.234zM12.744 6v.943l-.008.002v3.743l-2.783.754v-.944l1.85-.5v-.944l-1.85.501V6.756L12.744 6zm-1.858 1.447v.912l.918-.249v-.912l-.918.249z";

    var profile = "M10.635 7.01a3 3 0 012.256 1.326L15 11.5a2.894 2.894 0 01-2.408 4.5H3.408A2.894 2.894 0 011 11.5l2.11-3.164A3 3 0 015.364 7.01a4 4 0 115.27 0zM8 6a2 2 0 100-4 2 2 0 000 4zM5.606 9a1 1 0 00-.832.445l-2.11 3.164A.894.894 0 003.408 14h9.184a.894.894 0 00.744-1.39l-2.11-3.165A1 1 0 0010.394 9H5.606z";

    var time = "M9 7h3a1 1 0 010 2H8a1 1 0 01-1-1V4a1 1 0 112 0v3zm-1 9A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12z";

    var pin = "M7.698 16S3 7.761 3 5a5 5 0 1110 0c0 2.761-5.302 11-5.302 11zm-.552-5.342c.214.437.434.876.658 1.314.27-.467.537-.936.794-1.402.27-.492.526-.97.762-1.43C10.392 7.133 11 5.555 11 5a3 3 0 10-6 0c0 .6.543 2.191 1.47 4.226.209.46.435.939.676 1.432zM8 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z";

    var mark = "M2 0h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2zm0 2v12h12V2H2zm2 2h2v2H4zm0 2h2v2H4zm4-2h2v2H8zm0 4h2v2H8zM6 6h2v2H6zm4 0h2v2h-2zm0 2h2v2h-2zM6 8h2v2H6zm-2 2h2v2H4zm2 0h2v2H6zm4 0h2v2h-2z";

    var copyLink = "M8.597 7.539c.78.766.78 2.005 0 2.77l-2.354 2.314c-.784.77-2.057.77-2.84 0a1.934 1.934 0 010-2.77.894.894 0 00.005-1.274.916.916 0 00-1.286-.005 3.72 3.72 0 000 5.326 3.866 3.866 0 005.401 0l2.355-2.313a3.72 3.72 0 000-5.326.916.916 0 00-1.286.005.894.894 0 00.005 1.273zm-1.194.922a1.934 1.934 0 010-2.77l2.354-2.314a2.035 2.035 0 012.84 0c.78.766.78 2.005 0 2.77a.894.894 0 00-.005 1.274.916.916 0 001.286.005 3.72 3.72 0 000-5.326 3.866 3.866 0 00-5.401 0L6.122 4.413a3.72 3.72 0 000 5.326.916.916 0 001.286-.005.894.894 0 00-.005-1.273z";

    var document$1 = "M4 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4.87a2 2 0 00-.578-1.405L10.58.594A2 2 0 009.158 0H4zm0 2h5.158L12 4.871V14H4V2zm2 2a1 1 0 100 2h3.002a1 1 0 100-2H6zm0 3a1 1 0 100 2h4a1 1 0 100-2H6zm0 3a1 1 0 100 2h4a1 1 0 100-2H6z";

    var tire = "M9.88 16l-3.68-.016c-.135 0-.903-.064-1.025-.064a.203.203 0 01-.037-.004 4.826 4.826 0 01-1.01-.32c-.132-.056-.28-.28-.096-.272.58-.06 1.188-.12 1.276-.158.1-.044-1.55-.236-1.942-.29-.026-.017-.418-.007-.586-.135-.297-.225-.232-.177-.506-.462-.107-.113-.132-.36.057-.369.188-.009 1.206-.052 1.294-.09.107-.047-1.799-.515-1.93-.54-.068-.013-.283-.127-.331-.199-.233-.34-.142-.224-.336-.606-.096-.19-.118-.452.092-.462.159-.006 1.163-.174 1.25-.212.107-.047-1.568-.645-1.7-.684a.462.462 0 01-.3-.282c-.133-.427-.138-.51-.211-.956-.03-.178.001-.396.25-.402.11-.004 1.182-.12 1.269-.157.106-.047-1.08-.556-1.31-.652-.17-.07-.35-.262-.357-.438a12.41 12.41 0 01-.007-.364c0-.34-.014-.34.017-.671.017-.177.118-.283.272-.285.154-.002 1.176-.215 1.374-.205.119.006-1.048-.686-1.202-.763a.376.376 0 01-.187-.427c.102-.435.13-.592.289-1.004.062-.163.202-.17.378-.17s.963-.145 1.37-.116c-.36-.263-.952-.51-1.077-.565-.125-.056-.132-.317-.05-.462.208-.367.234-.478.486-.791.101-.127.238-.14.497-.119.262.022 1.332-.044 1.42-.083.103-.045-.665-.493-.823-.557-.165-.068-.136-.285-.022-.385.287-.253.191-.21.5-.406.12-.077.408-.061.615-.048.52.031 1.35.059 1.413.031.077-.034-.55-.224-.715-.282-.149-.052-.078-.298.14-.375.332-.116.57-.147.917-.18.133-.008.867.02 1.039 0h3.002L9.666 0H10l-.013.003c.192.005.367.012.433.023a4.98 4.98 0 011.051.257c.135.05.215.233.176.408 0 .004-.004.005-.007.01l.143.061s.559-.07.688.01c.32.197.628.432.92.699.114.106.142.312.059.46-.003.006-.008.003-.011.009.137.138.255.266.289.314.002-.005.376-.019.475.11.25.326.48.682.684 1.058.08.15.051.355-.065.46l-.01.004c.092.187.238.492.238.492s.31.069.368.236c.15.416.275.85.368 1.291.037.176-.045.358-.181.405l-.01.001c.039.216.066.436.089.658l.011-.008c.156-.012.266.118.279.3a10.398 10.398 0 01-.065 2.103c-.022.16-.13.273-.254.273a.225.225 0 01-.044-.004c-.003-.001-.003-.006-.007-.007a9.326 9.326 0 01-.13.647c.003 0 .005-.002.007-.001.133.062.203.251.156.423a9.2 9.2 0 01-.447 1.249c-.049.106-.133.167-.222.167-.044 0-.156.011-.159.008-.093.191-.169.31-.272.489.004.004.009.001.013.006.11.116.124.323.035.464a7.347 7.347 0 01-.748.984.223.223 0 01-.167.08 3.18 3.18 0 01-.307-.025c-.137.138-.166.168-.31.29 0 .004.004.004.006.008.073.156.034.36-.087.452-.307.236-.63.439-.96.603a.21.21 0 01-.092.022c-.104 0-.605.02-.605.02s-.276.367-.415.401a3.17 3.17 0 01-.725.087l-.302-.001zM8.666.37c-.177.06-.34.124-.476.192-.54.033-1.916.25-1.843.28.077.031.54-.007 1.05-.001.089.001.247.026.052.145-.219.134-.416.296-.626.447-.245.176-.432.22-.566.25-.614.135-1.635.479-1.57.504.07.03.471-.001.933-.001.122 0 .325.031.141.266-.187.24-.385.476-.565.728a1.248 1.248 0 01-.633.483c-.6.218-1.243.542-1.187.565.06.024.366.007.741.001.148-.003.44.05.297.368-.158.351-.266.724-.393 1.096a.695.695 0 01-.357.422c-.486.261-.99.578-.939.6.052.02.405.005.754-.01.113-.005.318.055.278.354a7.26 7.26 0 00-.057.983c0 .099.015.197.007.295-.03.346-.193.395-.295.46-.38.248-.726.519-.68.538.052.022.402.018.747.009a.353.353 0 01.366.29c.072.404.19.793.297 1.178.074.267-.05.398-.128.455-.338.246-.674.523-.628.542.06.024.492.001.873.006.243.004.35.135.385.204.17.332.36.65.57.953.065.094.157.299-.07.458-.26.184-.528.379-.482.398.064.026.572.011.973.005a.577.577 0 01.441.168c.229.23.47.445.726.643.076.06.22.176.062.29-.136.097-.245.197-.195.218.062.025.334.03.65.008a.685.685 0 01.372.077c.255.137.555.261.868.372a7.916 7.916 0 01-1.12-.64c.294-.128-.456-.609-.519-.39a7.678 7.678 0 01-1.05-1.04c.41-.076-.31-.83-.452-.6a7.818 7.818 0 01-.714-1.305c.536-.134-.061-.98-.291-.788a8.996 8.996 0 01-.35-1.666c.504-.009.32-.984-.059-.849a9.904 9.904 0 01.088-1.655c.352.154.536-.913.146-.791.133-.58.32-1.126.553-1.635.296.33.8-.84.382-.734a7.92 7.92 0 01.967-1.315c.14.427.997-.496.536-.533.283-.255.582-.487.896-.695-.083.38 1.003-.269.523-.318.186-.103.377-.198.571-.286zm1.544 2.548c-1.973 0-3.572 2.276-3.572 5.084 0 2.807 1.6 5.083 3.572 5.083 1.973 0 3.571-2.277 3.571-5.083 0-2.808-1.598-5.084-3.571-5.084z";

    var tShirt = "M14.983 3.158a.355.355 0 00-.167-.211l-2.67-1.417a11.585 11.585 0 00-1.73-.523.278.278 0 00-.06-.007c-.145 0-.275.115-.307.283C9.836 2.363 9.004 3.17 8 3.17s-1.836-.808-2.049-1.887C5.918 1.115 5.79 1 5.645 1a.26.26 0 00-.061.007c-.584.128-1.163.302-1.732.523L1.184 2.947a.348.348 0 00-.166.21.407.407 0 00.017.285L2.193 6.07c.055.125.165.2.282.2.03 0 .06-.005.09-.015l1.287-.439v8.82c0 .2.143.364.317.364h7.662c.174 0 .316-.163.316-.364v-8.82l1.288.439c.03.01.06.015.09.015a.314.314 0 00.282-.2l1.159-2.628a.415.415 0 00.017-.284z";

    var cigarette = "M14 12v4H0v-4h14zm2 0v4h-1v-4h1zM14.779 1C15.472 2.06 16 2.96 16 5.072c0 2.11-1.172 2.937-1.221 4.928C13.965 9.289 13 8.646 13 6.379 13 4.6 14.8 3.012 14.779 1zm-1.593-1c.462.471.814.871.814 1.81 0 .938-.781 1.305-.814 2.19C12.643 3.684 12 3.398 12 2.39 12 1.6 13.2.895 13.186 0z";

    var shoes = "M0 8.123l16 3.972c-.624 1.006-1.39 1.698-2.098 1.532L.93 10.59C.223 10.424-.033 9.267 0 8.123zm1.746-5.684a.719.719 0 01.828-.418.534.534 0 01.41.476l.02.265c.068.921.719 1.676 1.656 1.924 1.335.352 2.84-.406 3.353-1.69l.156-.39a.894.894 0 011.03-.518.69.69 0 01.41.29l.91 1.74-1.866.347.556.606 1.84-.364.454.51-1.863.345.549.582 1.716-.362.398.483-1.513.406.537.556 1.482-.391c.53.722.91 1.164 1.874 1.544l.521.26c.968.433.766 1.341.796 2.297L0 6.993z";

    var bike = "M8.058 3.306c.263-.233 1.105-.646 1.796.213.335.418.36 1.01.155 1.48l.075.673 1.687-.691c.344-.143.733.05.863.43.13.382-.047.805-.394.947l-.153.063.47 2.554c.077-.006.154-.013.233-.013 1.77 0 3.21 1.579 3.21 3.519C16 14.42 14.56 16 12.79 16s-3.21-1.579-3.21-3.52c0-.506.1-.988.278-1.424l-.62-.41-.955 1.715a.925.925 0 01-.803.493.875.875 0 01-.488-.15c-.443-.297-.583-.93-.313-1.416l1.048-1.882-1.962-.873h-.578l-.356.915c.949.612 1.59 1.74 1.59 3.033C6.42 14.42 4.98 16 3.21 16S0 14.421 0 12.48c0-1.94 1.44-3.518 3.21-3.518.306 0 .6.05.881.138l.221-.567c-.295-.002-.534-.264-.534-.588 0-.31.22-.556.496-.58a1.12 1.12 0 01.05-.584c.059-.155.149-.283.257-.387zM3.21 9.845c-1.326 0-2.405 1.182-2.405 2.636 0 1.454 1.08 2.636 2.405 2.636 1.189 0 2.172-.951 2.364-2.195H3.88a.771.771 0 01-.67.42c-.433 0-.785-.386-.785-.861 0-.435.296-.791.678-.849l.667-1.708a2.19 2.19 0 00-.56-.08zm9.58 0l-.072.008.334 1.82a.856.856 0 01.523.808c0 .475-.352.86-.785.86-.433 0-.785-.385-.785-.86v-.003l-1.448-.96a2.83 2.83 0 00-.172.963c0 1.454 1.079 2.636 2.405 2.636 1.326 0 2.405-1.182 2.405-2.636 0-1.454-1.079-2.636-2.405-2.636zm-8.28.424l-.666 1.709.036.062h1.694a2.652 2.652 0 00-1.064-1.77zm7.418-.242a2.417 2.417 0 00-.95.74l1.237.818zm-3.13-3.774l-1.056.937 1.715.764a.999.999 0 01.54.631c.086.287.053.601-.091.859l-.25.448.619.41a3.238 3.238 0 011.492-1.153l-.444-2.415-1.566.642a.62.62 0 01-.583-.06.743.743 0 01-.318-.539l-.059-.524zM9.207.74a1.5 1.5 0 112.585 1.52A1.5 1.5 0 019.207.74z";

    var pulse = "M8.991 0v9.46l1.643-2.451 5.366.04-.015 1.981-4.293-.032L7.002 16V5.42L3.946 9.022H0V7.041h3.023z";

    var exit = "M9.03 0a2 2 0 012 1.997V5h-2l-.001-3H3.05l2.16 1.674a3 3 0 011.817 2.752l.025 4.572L5.72 11h3.314l-.001-2h2l.001 2.008a2 2 0 01-2 1.992H7.026v.765a2 2 0 01-2.894 1.79l-3.026-3.01A2 2 0 010 10.753l.023-8.756a2 2 0 012-1.997H9.03zM2.018 3.649L2 10.756l3.026 3.01V11h.027l-.025-4.57a1 1 0 00-.606-.918L2.02 3.65zm11.474 1.015l1.843 1.843a.697.697 0 010 .986l-1.843 1.843a.697.697 0 11-.986-.985l.351-.352L9.888 8C9.399 8 9 7.552 9 7s.398-1 .889-1h2.968l-.35-.35a.697.697 0 01.986-.986z";

    var zoomIn = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8zm0 1a1 1 0 011 1v1h1a1 1 0 110 2H7v1a1 1 0 11-2 0V7H4a1 1 0 110-2h1V4a1 1 0 011-1z";

    var zoomOut = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8zm2 3a1 1 0 110 2H4a1 1 0 110-2h4z";

    var search = "M6 0a6 6 0 014.891 9.476l4.816 4.817a1 1 0 01-1.414 1.414l-4.817-4.816A6 6 0 116 0zm0 2a4 4 0 100 8 4 4 0 000-8z";

    var flash = "M11.784.089l.07.057 4 4a.501.501 0 01.057.638l-.057.07L12.707 8l.147.146a.501.501 0 01.057.638l-.057.07-5.965 5.964a4.062 4.062 0 01-2.626 1.175L4.036 16a4.009 4.009 0 01-2.854-1.182A4.006 4.006 0 010 11.964a4.06 4.06 0 011.026-2.687l.156-.166 5.964-5.965a.501.501 0 01.638-.057l.07.057.146.147L11.146.146a.501.501 0 01.638-.057zM3.293 11.293a1 1 0 101.416 1.414 1 1 0 00-1.416-1.414zM11.5 1.207L8.707 4l1.011 1.011 1.463-1.463 1.362 1.362-1.464 1.462.921.921.007-.007L14.793 4.5 11.5 1.207z";

    var questionInvert = "M8 0a8 8 0 110 16A8 8 0 018 0zm0 12a1 1 0 100 2 1 1 0 000-2zM8 2C5.794 2 4 3.73 4 5.857c0 .533.448.964 1 .964s1-.431 1-.964c0-1.063.897-1.928 2-1.928s2 .865 2 1.928c0 1.064-.897 1.929-2 1.929-.552 0-1 .431-1 .964v1.286l.007.112c.057.48.48.852.993.852.552 0 1-.432 1-.964v-.444l.19-.052C10.816 9.05 12 7.585 12 5.857 12 3.73 10.206 2 8 2z";

    var info = "M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2zm0 5a1 1 0 011 1v3a1 1 0 01-2 0V8a1 1 0 011-1zm0-3a1 1 0 110 2 1 1 0 010-2z";

    const icons = {
      "arrow-down": arrowDown,
      "arrow-left": arrowLeft,
      "arrow-right": arrowRight,
      "arrow-up": arrowUp,
      "arrows-updown": arrowsUpdown,
      attention,
      burger,
      calendar,
      cashbox,
      cashbox2,
      catalog,
      check,
      "chevron-down": chevronDown,
      "chevron-left": chevronLeft,
      "chevron-right": chevronRight,
      "chevron-up": chevronUp,
      clear,
      close,
      column,
      copy,
      cycle,
      visible,
      edit,
      favorite,
      "favorite-fill": favoriteFill,
      file: file$3,
      filter,
      history,
      "input-calendar": inputCalendar,
      invisible,
      key,
      list3,
      loader,
      market,
      message,
      minus,
      "more-horizontal": moreHorizontal,
      "more-vertical": moreVertical,
      phone,
      plus,
      print,
      question,
      rouble,
      save,
      set,
      settings,
      sort,
      "sort-down": sortDown,
      "sort-up": sortUp,
      trash,
      upload,
      download,
      "cash-check": cashCheck,
      move,
      tree,
      list4,
      ok,
      monitor,
      "toggle-off": toggleOff,
      "toggle-on": toggleOn,
      mail,
      "mail-full": mailFull,
      "mail-ok": mailOk,
      fullscreen,
      smallscreen,
      cart,
      "notify-not": notifyNot,
      notify,
      "monitor-not": monitorNot,
      start,
      image,
      hub,
      profile,
      time,
      pin,
      mark,
      "copy-link": copyLink,
      document: document$1,
      tire,
      cigarette,
      "t-shirt": tShirt,
      shoes,
      bike,
      pulse,
      exit,
      "zoom-in": zoomIn,
      "zoom-out": zoomOut,
      search,
      flash,
      "question-invert": questionInvert,
      info,
    };

    function getEventsAction(component) {
      return (node) => {
        const events = Object.keys(component.$$.callbacks);
        const listeners = [];

        events.forEach((event) =>
          listeners.push(listen(node, event, (e) => bubble(component, e)))
        );

        return {
          destroy: () => {
            listeners.forEach((listener) => listener());
          },
        };
      };
    }


    function getSVGIconObjet(input) {
      const iconObject = { viewbox: 16, pathes:[] };

      let raw = (icons[input]) ? icons[input] : input;

      if(typeof raw === 'string' && raw.startsWith("M")) return (iconObject.pathes.push({path:raw}),iconObject);

      if (Array.isArray(raw)) iconObject.pathes = raw;
      if( typeof raw === 'object'){
        if(raw.viewbox) iconObject.viewbox = raw.viewbox;
        if(raw.pathes) iconObject.pathes = Array.isArray(raw.pathes) ? raw.pathes : [raw.pathes];
      }

      iconObject.pathes = iconObject.pathes.map(p => {
        if(typeof p === 'string' && p.startsWith("M")) return {path:p};
        if(typeof p === 'object' && p.path) return p;
        return {};
      }).filter(p=>!!p.path);

      return iconObject;
    }

    /* node_modules/svelte-atoms/Icon.svelte generated by Svelte v3.22.3 */
    const file$4 = "node_modules/svelte-atoms/Icon.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].path;
    	child_ctx[6] = list[i].color;
    	return child_ctx;
    }

    // (19:4) {#each iconObject.pathes as { path, color }}
    function create_each_block(ctx) {
    	let path;
    	let path_style_value;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "style", path_style_value = /*color*/ ctx[6] ? `fill: ${/*color*/ ctx[6]}` : null);
    			attr_dev(path, "d", path_d_value = /*path*/ ctx[5]);
    			add_location(path, file$4, 19, 6, 425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconObject*/ 4 && path_style_value !== (path_style_value = /*color*/ ctx[6] ? `fill: ${/*color*/ ctx[6]}` : null)) {
    				attr_dev(path, "style", path_style_value);
    			}

    			if (dirty & /*iconObject*/ 4 && path_d_value !== (path_d_value = /*path*/ ctx[5])) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:4) {#each iconObject.pathes as { path, color }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let svg;
    	let g;
    	let svg_viewBox_value;
    	let svg_class_value;
    	let svg_style_value;
    	let each_value = /*iconObject*/ ctx[2].pathes;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(g, file$4, 17, 2, 366);
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*iconObject*/ ctx[2].viewbox + "\n  " + /*iconObject*/ ctx[2].viewbox);
    			attr_dev(svg, "class", svg_class_value = "" + (null_to_empty(`aa-icon ${/*status*/ ctx[1]} ${/*$$props*/ ctx[3].class || ""}`) + " svelte-1gjxfeb"));
    			attr_dev(svg, "style", svg_style_value = /*$$props*/ ctx[3].style || null);
    			add_location(svg, file$4, 10, 0, 182);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*iconObject*/ 4) {
    				each_value = /*iconObject*/ ctx[2].pathes;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			if (dirty & /*iconObject*/ 4 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*iconObject*/ ctx[2].viewbox + "\n  " + /*iconObject*/ ctx[2].viewbox)) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*status, $$props*/ 10 && svg_class_value !== (svg_class_value = "" + (null_to_empty(`aa-icon ${/*status*/ ctx[1]} ${/*$$props*/ ctx[3].class || ""}`) + " svelte-1gjxfeb"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*$$props*/ 8 && svg_style_value !== (svg_style_value = /*$$props*/ ctx[3].style || null)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { icon = "" } = $$props;
    	let { size = 16 } = $$props;
    	let { status = "" } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Icon", $$slots, []);

    	$$self.$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("icon" in $$new_props) $$invalidate(4, icon = $$new_props.icon);
    		if ("size" in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$new_props) $$invalidate(1, status = $$new_props.status);
    	};

    	$$self.$capture_state = () => ({
    		getSVGIconObjet,
    		icon,
    		size,
    		status,
    		iconObject
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("icon" in $$props) $$invalidate(4, icon = $$new_props.icon);
    		if ("size" in $$props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$props) $$invalidate(1, status = $$new_props.status);
    		if ("iconObject" in $$props) $$invalidate(2, iconObject = $$new_props.iconObject);
    	};

    	let iconObject;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon*/ 16) {
    			 $$invalidate(2, iconObject = getSVGIconObjet(icon));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [size, status, iconObject, $$props, icon];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { icon: 4, size: 0, status: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-atoms/Typography.svelte generated by Svelte v3.22.3 */

    const file$5 = "node_modules/svelte-atoms/Typography.svelte";

    function create_fragment$5(ctx) {
    	let span;
    	let span_class_value;
    	let span_style_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(`aa-typography ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[2].class || ""}`) + " svelte-2vpi93"));
    			attr_dev(span, "style", span_style_value = /*$$props*/ ctx[2].style || "");
    			toggle_class(span, "block", /*block*/ ctx[1]);
    			add_location(span, file$5, 5, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    				}
    			}

    			if (!current || dirty & /*type, $$props*/ 5 && span_class_value !== (span_class_value = "" + (null_to_empty(`aa-typography ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[2].class || ""}`) + " svelte-2vpi93"))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 4 && span_style_value !== (span_style_value = /*$$props*/ ctx[2].style || "")) {
    				attr_dev(span, "style", span_style_value);
    			}

    			if (dirty & /*type, $$props, block*/ 7) {
    				toggle_class(span, "block", /*block*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { type = "body1" } = $$props;
    	let { block = false } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Typography", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("block" in $$new_props) $$invalidate(1, block = $$new_props.block);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, block });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("block" in $$props) $$invalidate(1, block = $$new_props.block);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [type, block, $$props, $$scope, $$slots];
    }

    class Typography extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { type: 0, block: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typography",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get type() {
    		throw new Error("<Typography>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Typography>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Typography>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Typography>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-atoms/Loader.svelte generated by Svelte v3.22.3 */
    const file$6 = "node_modules/svelte-atoms/Loader.svelte";

    // (20:2) <Typography>
    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(20:2) <Typography>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let svg;
    	let circle;
    	let circle_class_value;
    	let t;
    	let div_class_value;
    	let div_style_value;
    	let current;

    	const typography = new Typography({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			t = space();
    			create_component(typography.$$.fragment);
    			attr_dev(circle, "class", circle_class_value = "" + (null_to_empty(`path ${/*status*/ ctx[1]}`) + " svelte-x0zo0j"));
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke-width", "6");
    			attr_dev(circle, "stroke-miter-limit", "10");
    			add_location(circle, file$6, 10, 4, 314);
    			attr_dev(svg, "class", "icon svelte-x0zo0j");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$6, 9, 2, 242);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`aa-loader ${/*$$props*/ ctx[2].class || ""}`) + " svelte-x0zo0j"));
    			attr_dev(div, "style", div_style_value = /*$$props*/ ctx[2].style || "");
    			add_location(div, file$6, 8, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    			append_dev(div, t);
    			mount_component(typography, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*status*/ 2 && circle_class_value !== (circle_class_value = "" + (null_to_empty(`path ${/*status*/ ctx[1]}`) + " svelte-x0zo0j"))) {
    				attr_dev(circle, "class", circle_class_value);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				attr_dev(svg, "width", /*size*/ ctx[0]);
    			}

    			if (!current || dirty & /*size*/ 1) {
    				attr_dev(svg, "height", /*size*/ ctx[0]);
    			}

    			const typography_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				typography_changes.$$scope = { dirty, ctx };
    			}

    			typography.$set(typography_changes);

    			if (!current || dirty & /*$$props*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(`aa-loader ${/*$$props*/ ctx[2].class || ""}`) + " svelte-x0zo0j"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 4 && div_style_value !== (div_style_value = /*$$props*/ ctx[2].style || "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typography.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typography.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(typography);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { size = 40 } = $$props;
    	let { status = "noactive" } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Loader", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("size" in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$new_props) $$invalidate(1, status = $$new_props.status);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Icon, Typography, size, status });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("size" in $$props) $$invalidate(0, size = $$new_props.size);
    		if ("status" in $$props) $$invalidate(1, status = $$new_props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [size, status, $$props, $$slots, $$scope];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { size: 0, status: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get size() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-atoms/Button.svelte generated by Svelte v3.22.3 */
    const file$7 = "node_modules/svelte-atoms/Button.svelte";

    // (27:4) {:else}
    function create_else_block$2(ctx) {
    	let t0;
    	let span;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*iconLeft*/ ctx[4] && create_if_block_2$1(ctx);
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let if_block1 = /*iconRight*/ ctx[5] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(span, "class", "contentText svelte-12pbvzi");
    			add_location(span, file$7, 30, 6, 945);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconLeft*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*iconLeft*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[9], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null));
    				}
    			}

    			if (/*iconRight*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(27:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if isLoading}
    function create_if_block$3(ctx) {
    	let current;

    	const loader = new Loader({
    			props: {
    				size: 28,
    				status: /*type*/ ctx[0] === "filled"
    				? "white"
    				: /*status*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const loader_changes = {};

    			if (dirty & /*type, status*/ 5) loader_changes.status = /*type*/ ctx[0] === "filled"
    			? "white"
    			: /*status*/ ctx[2];

    			loader.$set(loader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:4) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (28:6) {#if iconLeft}
    function create_if_block_2$1(ctx) {
    	let current;

    	const icon = new Icon({
    			props: {
    				icon: /*iconLeft*/ ctx[4],
    				status: /*iconStatus*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconLeft*/ 16) icon_changes.icon = /*iconLeft*/ ctx[4];
    			if (dirty & /*iconStatus*/ 64) icon_changes.status = /*iconStatus*/ ctx[6];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(28:6) {#if iconLeft}",
    		ctx
    	});

    	return block;
    }

    // (34:6) {#if iconRight}
    function create_if_block_1$2(ctx) {
    	let current;

    	const icon = new Icon({
    			props: {
    				icon: /*iconRight*/ ctx[5],
    				status: /*iconStatus*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconRight*/ 32) icon_changes.icon = /*iconRight*/ ctx[5];
    			if (dirty & /*iconStatus*/ 64) icon_changes.status = /*iconStatus*/ ctx[6];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(34:6) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let button;
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let button_disabled_value;
    	let button_class_value;
    	let button_style_value;
    	let events_action;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoading*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "content svelte-12pbvzi");
    			add_location(span, file$7, 23, 2, 725);
    			button.disabled = button_disabled_value = /*disabled*/ ctx[1] || /*isLoading*/ ctx[3];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(`aa-button ${/*type*/ ctx[0]} ${/*disabled*/ ctx[1] ? "disabled" : /*status*/ ctx[2]} ${/*isLoading*/ ctx[3] ? "loading" : ""} ${/*$$props*/ ctx[8].class || ""}`) + " svelte-12pbvzi"));
    			attr_dev(button, "style", button_style_value = /*$$props*/ ctx[8].style || "");
    			add_location(button, file$7, 18, 0, 519);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;
    			if (remount) dispose();
    			dispose = action_destroyer(events_action = /*events*/ ctx[7].call(null, button));
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, null);
    			}

    			if (!current || dirty & /*disabled, isLoading*/ 10 && button_disabled_value !== (button_disabled_value = /*disabled*/ ctx[1] || /*isLoading*/ ctx[3])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (!current || dirty & /*type, disabled, status, isLoading, $$props*/ 271 && button_class_value !== (button_class_value = "" + (null_to_empty(`aa-button ${/*type*/ ctx[0]} ${/*disabled*/ ctx[1] ? "disabled" : /*status*/ ctx[2]} ${/*isLoading*/ ctx[3] ? "loading" : ""} ${/*$$props*/ ctx[8].class || ""}`) + " svelte-12pbvzi"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 256 && button_style_value !== (button_style_value = /*$$props*/ ctx[8].style || "")) {
    				attr_dev(button, "style", button_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_blocks[current_block_type_index].d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { type = "filled" } = $$props;
    	let { disabled = false } = $$props;
    	let { status = "primary" } = $$props;
    	let { isLoading = false } = $$props;
    	let { iconLeft = null } = $$props;
    	let { iconRight = null } = $$props;
    	const events = getEventsAction(current_component);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("disabled" in $$new_props) $$invalidate(1, disabled = $$new_props.disabled);
    		if ("status" in $$new_props) $$invalidate(2, status = $$new_props.status);
    		if ("isLoading" in $$new_props) $$invalidate(3, isLoading = $$new_props.isLoading);
    		if ("iconLeft" in $$new_props) $$invalidate(4, iconLeft = $$new_props.iconLeft);
    		if ("iconRight" in $$new_props) $$invalidate(5, iconRight = $$new_props.iconRight);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		current_component,
    		Loader,
    		Icon,
    		type,
    		disabled,
    		status,
    		isLoading,
    		iconLeft,
    		iconRight,
    		events,
    		iconStatus
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$new_props.disabled);
    		if ("status" in $$props) $$invalidate(2, status = $$new_props.status);
    		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$new_props.isLoading);
    		if ("iconLeft" in $$props) $$invalidate(4, iconLeft = $$new_props.iconLeft);
    		if ("iconRight" in $$props) $$invalidate(5, iconRight = $$new_props.iconRight);
    		if ("iconStatus" in $$props) $$invalidate(6, iconStatus = $$new_props.iconStatus);
    	};

    	let iconStatus;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*disabled, type, status*/ 7) {
    			 $$invalidate(6, iconStatus = disabled
    			? "noactive"
    			: type === "filled" ? "white" : status);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		type,
    		disabled,
    		status,
    		isLoading,
    		iconLeft,
    		iconRight,
    		iconStatus,
    		events,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			type: 0,
    			disabled: 1,
    			status: 2,
    			isLoading: 3,
    			iconLeft: 4,
    			iconRight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get status() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLoading() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLoading(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconLeft() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconLeft(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconRight() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconRight(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-atoms/Block.svelte generated by Svelte v3.22.3 */

    const file$8 = "node_modules/svelte-atoms/Block.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`aa-block ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[1].class || ""}`) + " svelte-hd0o23"));
    			attr_dev(div, "style", div_style_value = /*$$props*/ ctx[1].style || "");
    			add_location(div, file$8, 4, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    				}
    			}

    			if (!current || dirty & /*type, $$props*/ 3 && div_class_value !== (div_class_value = "" + (null_to_empty(`aa-block ${/*type*/ ctx[0].toLowerCase()} ${/*$$props*/ ctx[1].class || ""}`) + " svelte-hd0o23"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*$$props*/ 2 && div_style_value !== (div_style_value = /*$$props*/ ctx[1].style || "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { type = "block1" } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Block", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("$$scope" in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [type, $$props, $$scope, $$slots];
    }

    class Block extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { type: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Block",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get type() {
    		throw new Error("<Block>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Block>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/packery-svelte/Grid.svelte generated by Svelte v3.22.3 */

    const { document: document_1 } = globals;
    const file$9 = "src/ui/packery-svelte/Grid.svelte";

    function create_fragment$9(ctx) {
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let t;
    	let div;
    	let div_id_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			script0 = element("script");
    			script1 = element("script");
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			if (script0.src !== (script0_src_value = "/assets/packery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$9, 29, 2, 765);
    			if (script1.src !== (script1_src_value = "/assets/draggabilly.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$9, 32, 2, 849);
    			attr_dev(div, "id", div_id_value = `packery${/*randID*/ ctx[0]}`);
    			add_location(div, file$9, 37, 0, 951);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document_1.head, script0);
    			append_dev(document_1.head, script1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(script0, "load", /*initializeRemarkable*/ ctx[1], false, false, false),
    				listen_dev(script1, "load", /*initializeRemarkable*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script0);
    			detach_dev(script1);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let randID = Date.now() + Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    	let grid = null;

    	const initializeRemarkable = () => {
    		if (window.Draggabilly && window.Packery) {
    			const elem = document.querySelector(`#packery${randID}`);

    			// Init packery
    			grid = new Packery(elem,
    			{
    					// options
    					itemSelector: ".packery-grid-item",
    					gutter: 10,
    					columnWidth: 250
    				});

    			// Add draggable
    			Array.from(elem.querySelectorAll(".packery-grid-item")).forEach((gridItem, i) => {
    				const draggie = new Draggabilly(gridItem);

    				// bind drag events to Packery
    				grid.bindDraggabillyEvents(draggie);
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Grid", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ randID, grid, initializeRemarkable });

    	$$self.$inject_state = $$props => {
    		if ("randID" in $$props) $$invalidate(0, randID = $$props.randID);
    		if ("grid" in $$props) grid = $$props.grid;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [randID, initializeRemarkable, grid, $$scope, $$slots];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/ui/packery-svelte/GridItem.svelte generated by Svelte v3.22.3 */

    const file$a = "src/ui/packery-svelte/GridItem.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "packery-grid-item");
    			add_location(div, file$a, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GridItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GridItem", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class GridItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GridItem",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /**
     * add to your "assets" folder scripts:
     * packery.min.js (https://unpkg.com/packery@2/dist/packery.pkgd.min.js)
     * draggabilly.min.js (https://unpkg.com/draggabilly@2/dist/draggabilly.pkgd.min.js)
     * npm i @bit/dugnist.packery-svelte.packery-svelte
     * import { Grid, GridItem } from "@bit/dugnist.packery-svelte.packery-svelte";
     * <Grid class="grid">
        <GridItem>
            Hello
        </GridItem>
        <GridItem>
            World
        </GridItem>
      </Grid>
     */

    const Grid$1 = Grid;
    const GridItem$1 = GridItem;

    const Grid$2 = Grid$1;
    const GridItem$2 = GridItem$1;

    /* src/modules/Install/pages/Install.svelte generated by Svelte v3.22.3 */
    const file$b = "src/modules/Install/pages/Install.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (191:10) <Block type="block3" class="card">
    function create_default_slot_2(ctx) {
    	let img;
    	let img_src_value;
    	let img_width_value;
    	let t0;
    	let div4;
    	let div0;
    	let t1;
    	let b0;
    	let t2_value = /*tool*/ ctx[4].name + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let b1;
    	let t6;
    	let div2;
    	let i;
    	let t8;
    	let div3;
    	let a;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			div4 = element("div");
    			div0 = element("div");
    			t1 = text("name:\n                ");
    			b0 = element("b");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text("version:\n                ");
    			b1 = element("b");
    			b1.textContent = "0.0.1";
    			t6 = space();
    			div2 = element("div");
    			i = element("i");
    			i.textContent = "Not installed";
    			t8 = space();
    			div3 = element("div");
    			a = element("a");
    			a.textContent = "Install";
    			if (img.src !== (img_src_value = /*tool*/ ctx[4].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", img_width_value = /*tool*/ ctx[4].imgwidth);
    			add_location(img, file$b, 191, 12, 5202);
    			add_location(b0, file$b, 195, 16, 5381);
    			set_style(div0, "font-size", "11px");
    			add_location(div0, file$b, 193, 14, 5313);
    			add_location(b1, file$b, 199, 16, 5506);
    			set_style(div1, "font-size", "11px");
    			add_location(div1, file$b, 197, 14, 5435);
    			add_location(i, file$b, 202, 16, 5600);
    			set_style(div2, "font-size", "11px");
    			add_location(div2, file$b, 201, 14, 5554);
    			attr_dev(a, "href", "#");
    			add_location(a, file$b, 205, 16, 5702);
    			set_style(div3, "font-size", "11px");
    			add_location(div3, file$b, 204, 14, 5656);
    			attr_dev(div4, "class", "card-description");
    			add_location(div4, file$b, 192, 12, 5268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t1);
    			append_dev(div0, b0);
    			append_dev(b0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div1, t4);
    			append_dev(div1, b1);
    			append_dev(div4, t6);
    			append_dev(div4, div2);
    			append_dev(div2, i);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, a);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(191:10) <Block type=\\\"block3\\\" class=\\\"card\\\">",
    		ctx
    	});

    	return block;
    }

    // (190:8) <GridItem>
    function create_default_slot_1(ctx) {
    	let current;

    	const block = new Block({
    			props: {
    				type: "block3",
    				class: "card",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(block.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(block, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const block_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				block_changes.$$scope = { dirty, ctx };
    			}

    			block.$set(block_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(block.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(block.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(block, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(190:8) <GridItem>",
    		ctx
    	});

    	return block_1;
    }

    // (189:6) {#each sector.tools as tool}
    function create_each_block_1(ctx) {
    	let current;

    	const griditem = new GridItem$2({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(griditem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(griditem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const griditem_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				griditem_changes.$$scope = { dirty, ctx };
    			}

    			griditem.$set(griditem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(griditem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(griditem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(griditem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(189:6) {#each sector.tools as tool}",
    		ctx
    	});

    	return block;
    }

    // (188:4) <Grid>
    function create_default_slot$1(ctx) {
    	let t;
    	let current;
    	let each_value_1 = /*sector*/ ctx[1].tools;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*toolslist*/ 1) {
    				each_value_1 = /*sector*/ ctx[1].tools;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(188:4) <Grid>",
    		ctx
    	});

    	return block;
    }

    // (182:2) {#each toolslist as sector}
    function create_each_block$1(ctx) {
    	let br0;
    	let t0;
    	let t1_value = /*sector*/ ctx[1].title + "";
    	let t1;
    	let t2;
    	let hr;
    	let t3;
    	let br1;
    	let t4;
    	let current;

    	const grid = new Grid$2({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			hr = element("hr");
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			create_component(grid.$$.fragment);
    			add_location(br0, file$b, 182, 4, 5006);
    			add_location(hr, file$b, 184, 4, 5036);
    			add_location(br1, file$b, 185, 4, 5047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(grid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const grid_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				grid_changes.$$scope = { dirty, ctx };
    			}

    			grid.$set(grid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(grid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(182:2) {#each toolslist as sector}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	let each_value = /*toolslist*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$b, 180, 0, 4966);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toolslist*/ 1) {
    				each_value = /*toolslist*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let toolslist = [
    		{
    			title: "Enviropment",
    			tools: [
    				{
    					image: "./images/nodejs.svg",
    					imgwidth: "65",
    					name: "Node.js"
    				},
    				{
    					image: "./images/yarn.svg",
    					imgwidth: "60",
    					name: "Yarn"
    				},
    				{
    					image: "./images/docker.svg",
    					imgwidth: "70",
    					name: "Docker"
    				},
    				{
    					image: "./images/dockercompose.svg",
    					imgwidth: "55",
    					name: "Docker-Compose"
    				},
    				{
    					image: "./images/portainer.svg",
    					imgwidth: "70",
    					name: "Portainer"
    				},
    				{
    					image: "./images/pm2.svg",
    					imgwidth: "60",
    					name: "PM2"
    				}
    			]
    		},
    		{
    			title: "Server",
    			tools: [
    				{
    					image: "./images/nginx.svg",
    					imgwidth: "100",
    					name: "Nginx"
    				},
    				{
    					image: "./images/haproxy.svg",
    					imgwidth: "60",
    					name: "Haproxy"
    				},
    				{
    					image: "./images/traefik.svg",
    					imgwidth: "60",
    					name: "Traefik"
    				}
    			]
    		},
    		{
    			title: "Cache",
    			tools: [
    				{
    					image: "./images/memcached.svg",
    					imgwidth: "60",
    					name: "Memcached"
    				},
    				{
    					image: "./images/redis.svg",
    					imgwidth: "60",
    					name: "Redis"
    				}
    			], // { image: './images/ignite.svg', imgwidth: '60', name: 'Apache Ignite' },
    			
    		},
    		{
    			title: "Databases",
    			tools: [
    				{
    					image: "./images/mongodb.svg",
    					imgwidth: "60",
    					name: "MongoDB"
    				},
    				{
    					image: "./images/postgresql.svg",
    					imgwidth: "60",
    					name: "PostgreQL"
    				},
    				{
    					image: "./images/neo4j.svg",
    					imgwidth: "60",
    					name: "Neo4j"
    				}
    			]
    		},
    		{
    			title: "Orchestration",
    			tools: [
    				{
    					image: "./images/kubernetes.svg",
    					imgwidth: "60",
    					name: "Kubernetes"
    				},
    				{
    					image: "./images/nomad.svg",
    					imgwidth: "60",
    					name: "Nomad"
    				},
    				{
    					image: "./images/consul.svg",
    					imgwidth: "60",
    					name: "Consul"
    				}
    			]
    		},
    		{
    			title: "Brokers",
    			tools: [
    				{
    					image: "./images/rabbitmq.svg",
    					imgwidth: "60",
    					name: "RabbitMQ"
    				},
    				{
    					image: "./images/kafka.svg",
    					imgwidth: "60",
    					name: "Kafka"
    				}
    			]
    		},
    		{
    			title: "Configurations",
    			tools: [
    				{
    					image: "./images/terraform.svg",
    					imgwidth: "60",
    					name: "Terraform"
    				},
    				{
    					image: "./images/ansible.svg",
    					imgwidth: "60",
    					name: "Ansible"
    				},
    				{
    					image: "./images/zookeeper.svg",
    					imgwidth: "60",
    					name: "Zookeeper"
    				}
    			]
    		},
    		{
    			title: "CI/CD",
    			tools: [
    				{
    					image: "./images/jenkins.svg",
    					imgwidth: "60",
    					name: "Jenkins"
    				},
    				{
    					image: "./images/github.svg",
    					imgwidth: "60",
    					name: "GitHub Actions"
    				},
    				{
    					image: "./images/gitlab.svg",
    					imgwidth: "60",
    					name: "GitLab CI/CD"
    				},
    				{
    					image: "./images/travisci.svg",
    					imgwidth: "60",
    					name: "Travis CI"
    				},
    				{
    					image: "./images/circleci.svg",
    					imgwidth: "60",
    					name: "Circle CI"
    				},
    				{
    					image: "./images/heroku.svg",
    					imgwidth: "60",
    					name: "Heroku-cli"
    				}
    			]
    		},
    		{
    			title: "Search",
    			tools: [
    				{
    					image: "./images/elasticsearch.svg",
    					imgwidth: "60",
    					name: "ElasticSearch"
    				},
    				{
    					image: "./images/sphinx.svg",
    					imgwidth: "60",
    					name: "Sphinx"
    				}
    			]
    		},
    		{
    			title: "Credentials",
    			tools: [
    				{
    					image: "./images/vault.svg",
    					imgwidth: "60",
    					name: "Vault"
    				}
    			]
    		},
    		{
    			title: "Monitoring",
    			tools: [
    				{
    					image: "./images/kibana.svg",
    					imgwidth: "60",
    					name: "Kibana"
    				},
    				{
    					image: "./images/prometheus.svg",
    					imgwidth: "60",
    					name: "Prometheus"
    				},
    				{
    					image: "./images/grafana.svg",
    					imgwidth: "60",
    					name: "Grafana"
    				},
    				{
    					image: "./images/graphite.svg",
    					imgwidth: "60",
    					name: "Graphite"
    				},
    				{
    					image: "./images/datadog.svg",
    					imgwidth: "60",
    					name: "DataDog"
    				},
    				{
    					image: "./images/jaeger.svg",
    					imgwidth: "60",
    					name: "Jaeger"
    				}
    			]
    		},
    		{
    			title: "Logs",
    			tools: [
    				{
    					image: "./images/logstash.svg",
    					imgwidth: "60",
    					name: "Logstash"
    				},
    				{
    					image: "./images/influxdb.svg",
    					imgwidth: "60",
    					name: "InfluxDB"
    				}
    			]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Install> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Install", $$slots, []);

    	$$self.$capture_state = () => ({
    		Button,
    		Block,
    		Typography,
    		Grid: Grid$2,
    		GridItem: GridItem$2,
    		toolslist
    	});

    	$$self.$inject_state = $$props => {
    		if ("toolslist" in $$props) $$invalidate(0, toolslist = $$props.toolslist);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toolslist];
    }

    class Install extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Install",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/modules/Main/pages/MainPage.svelte generated by Svelte v3.22.3 */

    const file$c = "src/modules/Main/pages/MainPage.svelte";

    function create_fragment$c(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Main Page";
    			add_location(div, file$c, 4, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MainPage", $$slots, []);
    	return [];
    }

    class MainPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainPage",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.22.3 */

    const { console: console_1 } = globals;
    const file$d = "src/App.svelte";

    // (60:6) <Link href="/">
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(60:6) <Link href=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (61:6) <Link href="/#install">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Install");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(61:6) <Link href=\\\"/#install\\\">",
    		ctx
    	});

    	return block;
    }

    // (58:2) <Router {url}>
    function create_default_slot$2(ctx) {
    	let nav;
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let current;

    	const link0 = new Link({
    			props: {
    				href: "/",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const link1 = new Link({
    			props: {
    				href: "/#install",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route0 = new Route({
    			props: {
    				exact: true,
    				path: "/#install",
    				component: Install
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: {
    				exact: true,
    				path: "/",
    				component: MainPage
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			create_component(link1.$$.fragment);
    			t1 = space();
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t2 = space();
    			create_component(route1.$$.fragment);
    			add_location(nav, file$d, 58, 4, 1135);
    			add_location(div, file$d, 62, 4, 1233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(link0, nav, null);
    			append_dev(nav, t0);
    			mount_component(link1, nav, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t2);
    			mount_component(route1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(route0);
    			destroy_component(route1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(58:2) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let hr;
    	let t4;
    	let br2;
    	let t5;
    	let div;
    	let t7;
    	let br3;
    	let t8;
    	let span;
    	let t9;
    	let current;
    	let dispose;
    	const variables = new Variables({ $$inline: true });

    	const router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(variables.$$.fragment);
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			hr = element("hr");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			div = element("div");
    			div.textContent = "Run cmd command";
    			t7 = space();
    			br3 = element("br");
    			t8 = space();
    			span = element("span");
    			t9 = text(/*message*/ ctx[1]);
    			add_location(br0, file$d, 69, 2, 1425);
    			add_location(br1, file$d, 70, 2, 1434);
    			add_location(hr, file$d, 71, 2, 1443);
    			add_location(br2, file$d, 72, 2, 1452);
    			add_location(div, file$d, 73, 2, 1461);
    			add_location(br3, file$d, 74, 2, 1514);
    			attr_dev(span, "class", "svelte-fmiyhn");
    			add_location(span, file$d, 75, 2, 1523);
    			attr_dev(main, "class", "svelte-fmiyhn");
    			add_location(main, file$d, 55, 0, 1091);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main, anchor);
    			mount_component(variables, main, null);
    			append_dev(main, t0);
    			mount_component(router, main, null);
    			append_dev(main, t1);
    			append_dev(main, br0);
    			append_dev(main, t2);
    			append_dev(main, br1);
    			append_dev(main, t3);
    			append_dev(main, hr);
    			append_dev(main, t4);
    			append_dev(main, br2);
    			append_dev(main, t5);
    			append_dev(main, div);
    			append_dev(main, t7);
    			append_dev(main, br3);
    			append_dev(main, t8);
    			append_dev(main, span);
    			append_dev(span, t9);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 16) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    			if (!current || dirty & /*message*/ 2) set_data_dev(t9, /*message*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(variables.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(variables.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(variables);
    			destroy_component(router);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { url = null } = $$props;

    	// test
    	const exec = () => new Promise((res, rej) => {
    			try {
    				window.Neutralino.os.runCommand(
    					"help",
    					data => {
    						$$invalidate(1, message = data);
    						res(data);
    					},
    					() => {
    						rej("error");
    						console.log("errror");
    					}
    				);
    			} catch(error) {
    				console.log(error.message);
    				$$invalidate(1, message = error.message);
    				rej(error.message);
    			}
    		});

    	let message = "";
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => exec();

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Link,
    		Variables,
    		Install,
    		MainPage,
    		url,
    		exec,
    		message
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, message, exec, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      // props: {
      // 	name: 'world'
      // }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
