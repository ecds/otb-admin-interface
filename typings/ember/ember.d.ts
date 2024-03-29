interface DOMElement {}
interface Promise<T> {}
declare class Registry {}
declare class Transition {}
declare namespace Handlebars { class SafeString {} }
declare class JQuery {}


declare module 'ember' {
  export namespace Ember {
    /**
     * Define an assertion that will throw an exception if the condition is not met. Ember build tools will remove any calls to `Ember.assert()` when doing a production build. Example:
     */
    function assert(desc: string, test: boolean|Function);
    /**
     * Display a warning with the provided message. Ember build tools will remove any calls to `Ember.warn()` when doing a production build.
     */
    function warn(message: string, test: boolean);
    /**
     * Display a debug notice. Ember build tools will remove any calls to `Ember.debug()` when doing a production build.
     */
    function debug(message: string);
    /**
     * Display a deprecation warning with the provided message and a stack trace (Chrome and Firefox only). Ember build tools will remove any calls to `Ember.deprecate()` when doing a production build.
     */
    function deprecate(message: string, test: boolean|Function, options: {});
    /**
     * Run a function meant for debugging. Ember build tools will remove any calls to `Ember.runInDebug()` when doing a production build.
     */
    function runInDebug(func: Function);
    /**
     * Identical to `Object.create()`. Implements if not available natively.
     */
    function create();
    /**
     * Array polyfills to support ES5 features in older browsers.
     */
    var ArrayPolyfills: any;
    /**
     * Debug parameter you can turn on. This will log all bindings that fire to the console. This should be disabled in production code. Note that you can also enable this from the console or temporarily.
     */
    var LOG_BINDINGS: boolean;
    /**
     * Global helper method to create a new binding. Just pass the root object along with a `to` and `from` path to create and connect the binding.
     */
    function bind(obj: {}, to: string, from: string): Binding;
    function oneWay(obj: {}, to: string, from: string): Binding;
    /**
     * Returns the cached value for a property, if one exists. This can be useful for peeking at the value of a computed property that is generated lazily, without accidentally causing it to be created.
     */
    function cacheFor(obj: {}, key: string): {};
    /**
     * The semantic version.
     */
    var VERSION: string;
    /**
     * The hash of environment variables used to control various configuration settings. To specify your own or override default settings, add the desired properties to a global hash named `EmberENV` (or `ENV` for backwards compatibility with earlier versions of Ember). The `EmberENV` hash must be created before loading Ember.
     */
    var ENV: {};
    /**
     * Determines whether Ember should add to `Array`, `Function`, and `String` native object prototypes, a few extra methods in order to provide a more friendly API.
     */
    var EXTEND_PROTOTYPES: boolean;
    /**
     * The `LOG_STACKTRACE_ON_DEPRECATION` property, when true, tells Ember to log a full stack trace during deprecation warnings.
     */
    var LOG_STACKTRACE_ON_DEPRECATION: boolean;
    /**
     * The `SHIM_ES5` property, when true, tells Ember to add ECMAScript 5 Array shims to older browsers.
     */
    var SHIM_ES5: boolean;
    /**
     * The `LOG_VERSION` property, when true, tells Ember to log versions of all dependent libraries in use.
     */
    var LOG_VERSION: boolean;
    /**
     * An empty function useful for some operations. Always returns `this`.
     */
    function K(): {};
    /**
     * Add an event listener
     */
    function addListener(obj: any, eventName: string, target: {}|Function, method: Function|string, once: boolean);
    /**
     * Remove an event listener
     */
    function removeListener(obj: any, eventName: string, target: {}|Function, method: Function|string);
    /**
     * Send an event. The execution of suspended listeners is skipped, and once listeners are removed. A listener without a target is executed on the passed object. If an array of actions is not passed, the actions stored on the passed object are invoked.
     */
    function sendEvent(obj: any, eventName: string, params: Ember.Array, actions: Ember.Array): void;
    /**
     * Define a property as a function that should be executed when a specified event or events are triggered.
     */
    function on(eventNames: string, func: Function): void;
    /**
     * A value is blank if it is empty or a whitespace string.
     */
    function isBlank(obj: {}): boolean;
    /**
     * Verifies that a value is `null` or an empty string, empty array, or empty function.
     */
    function isEmpty(obj: {}): boolean;
    /**
     * Returns true if the passed value is null or undefined. This avoids errors from JSLint complaining about use of ==, which can be technically confusing.
     */
    function isNone(obj: {}): boolean;
    /**
     * A value is present if it not `isBlank`.
     */
    function isPresent(obj: {}): boolean;
    function addObserver(obj: any, _path: string, target: {}|Function, method: Function|string);
    function removeObserver(obj: any, path: string, target: {}|Function, method: Function|string);
    /**
     * Gets the value of a property on an object. If the property is computed, the function will be invoked. If the property is not defined but the object implements the `unknownProperty` method then that will be invoked.
     */
    function get(obj: {}, keyName: string): {};
    /**
     * Sets the value of a property on an object, respecting computed properties and notifying observers and other listeners of the change. If the property is not defined but the object implements the `setUnknownProperty` method then that will be invoked as well.
     */
    function set(obj: {}, keyName: string, value: {}): {};
    /**
     * Error-tolerant form of `Ember.set`. Will not blow up if any part of the chain is `undefined`, `null`, or destroyed.
     */
    function trySet(root: {}, path: string, value: {});
    /**
     * Set a list of properties on an object. These properties are set inside a single `beginPropertyChanges` and `endPropertyChanges` batch, so observers will be buffered.
     */
    function setProperties(obj: any, properties: {}): void;
    /**
     * Checks to see if the `methodName` exists on the `obj`, and if it does, invokes it with the arguments passed.
     */
    function tryInvoke(obj: {}, methodName: string, args: Ember.Array): any;
    /**
     * DEPRECATED:
     * Creates a computed property which operates on dependent arrays and is updated with "one at a time" semantics. When items are added or removed from the dependent array(s) a reduce computed only operates on the change instead of re-evaluating the entire array.
     */
    function reduceComputed(...dependentKeys: string[]): ComputedProperty;
    function reduceComputed(options: {}): ComputedProperty;
    /**
     * Creates an `Ember.NativeArray` from an Array like object. Does not modify the original object. Ember.A is not needed if `Ember.EXTEND_PROTOTYPES` is `true` (the default value). However, it is recommended that you use Ember.A when creating addons for ember or when you can not guarantee that `Ember.EXTEND_PROTOTYPES` will be `true`.
     */
    function A(): NativeArray;
    /**
     * Creates a clone of the passed object. This function can take just about any type of object and create a clone of it, including primitive values (which are not actually cloned because they are immutable).
     */
    function copy(obj: {}, deep: boolean): {};
    /**
     * Compares two objects, returning true if they are logically equal. This is a deeper comparison than a simple triple equal. For sets it will compare the internal objects. For any other object that implements `isEqual()` it will respect that method.
     */
    function isEqual(a: {}, b: {}): boolean;
    /**
     * Returns true if the passed object is an array or Array-like.
     */
    function isArray(obj: {}): boolean;
    /**
     * Returns a consistent type for the passed item.
     */
    function typeOf(item: {}): string;
    /**
     * Alias for jQuery
     */
    function $();
    export namespace Handlebars {
      /**
       * DEPRECATED:
       * Lookup both on root and on window. If the path starts with a keyword, the corresponding object will be looked up in the template's data hash and used to resolve the path.
       */
      function get(root: {}, path: string, options: {});
      export class helpers {
        /**
         * DEPRECATED:
         * `bind-attr` allows you to create a binding between DOM element attributes and Ember objects. For example:
         */
        'bind-attr'(options: {}): string;
        /**
         * DEPRECATED:
         * See `bind-attr`
         */
        bindAttr(context: Function, options: {}): string;
        /**
         * The `{{#each}}` helper loops over elements in a collection. It is an extension of the base Handlebars `{{#each}}` helper.
         */
        each();
        /**
         * Use the `if` block helper to conditionally render a block depending on a property. If the property is "falsey", for example: `false`, `undefined `null`, `""`, `0` or an empty array, the block will not be rendered.
         */
        if();
        /**
         * The `unless` helper is the inverse of the `if` helper. Its block will be rendered if the expression contains a falsey value.  All forms of the `if` helper can also be used with `unless`.
         */
        unless();
        /**
         * Calls [Ember.String.loc](/api/classes/Ember.String.html#method_loc) with the provided string. This is a convenient way to localize text within a template: ```javascript Ember.STRINGS = { '_welcome_': 'Bonjour' }; ``` ```handlebars <div class='message'> {{loc '_welcome_'}} </div> ``` ```html <div class='message'> Bonjour </div> ``` See [Ember.String.loc](/api/classes/Ember.String.html#method_loc) for how to set up localized string references.
         */
        loc(str: string);
        /**
         * `log` allows you to output the value of variables in the current rendering context. `log` also accepts primitive types such as strings or numbers. ```handlebars {{log "myVariable:" myVariable }} ```
         */
        log(values: any);
        /**
         * Use the `{{with}}` helper when you want to alias a property to a new name. This is helpful for semantic clarity as it allows you to retain default scope or to reference a property from another `{{with}}` block.
         */
        with(options: {}): string;
        /**
         * Execute the `debugger` statement in the current template's context.
         */
        debugger();
        /**
         * This is a sub-expression to be used in conjunction with the link-to helper. It will supply url query parameters to the target route.
         */
        'query-params'(hash: {}): string;
        /**
         * The `{{action}}` helper provides a useful shortcut for registering an HTML element within a template for a single DOM event and forwarding that interaction to the template's controller or specified `target` option.
         */
        action();
        /**
         * The `{{link-to}}` helper renders a link to the supplied `routeName` passing an optionally supplied model to the route as its `model` context of the route. The block for `{{link-to}}` becomes the innerHTML of the rendered element:
         */
        'link-to'(routeName: string, context: {}, options: {}): string;
      }
    }
    export namespace HTMLBars {
      /**
       * Concatenates input params together.
       */
      function concat();
      export class Helper {
      }
    }
    export namespace streams {
      export namespace Ember {
        export class stream {
          /**
           * Generate a new stream by providing a source stream and a function that can be used to transform the stream's value. In the case of a non-stream object, returns the result of the function.
           */
          chain(value: {}|Stream, fn: Function): {}|Stream;
        }
      }
      export class Dependency {
      }
      export class Subscriber {
      }
    }
    export namespace stream {
      export class Stream {
      }
    }
    export namespace Test {
      /**
       * Loads a route, sets up any controllers, and renders any templates associated with the route as though a real user had triggered the route change while using your app.
       */
      function visit(url: string): RSVP.Promise<any>;
      /**
       * Clicks an element and triggers any actions triggered by the element's `click` event.
       */
      function click(selector: string): RSVP.Promise<any>;
      /**
       * Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
       */
      function keyEvent(selector: string, type: string, keyCode: number): RSVP.Promise<any>;
      /**
       * Fills in an input element with some text.
       */
      function fillIn(selector: string, text: string): RSVP.Promise<any>;
      /**
       * Finds an element in the context of the app's container element. A simple alias for `app.$(selector)`.
       */
      function find(selector: string): {};
      /**
       * Causes the run loop to process any pending events. This is used to ensure that any async operations from other helpers (or your assertions) have been processed.
       */
      function wait(value: {}): RSVP.Promise<any>;
      /**
       * Returns the currently active route name.
       */
      function currentRouteName(): {};
      /**
       * Returns the current path.
       */
      function currentPath(): {};
      /**
       * Returns the current URL.
       */
      function currentURL(): {};
      /**
       * Pauses the current test - this is useful for debugging while testing or for test-driving. It allows you to inspect the state of your application at any point.
       */
      function pauseTest(): {};
      /**
       * Triggers the given DOM event on the element identified by the provided selector.
       */
      function triggerEvent(selector: string, context: string, type: string, options: {}): RSVP.Promise<any>;
      /**
       * This hook defers the readiness of the application, so that you can start the app when your tests are ready to run. It also sets the router's location to 'none', so that the window's location will not be modified (preventing both accidental leaking of state between tests and interference with your testing framework).
       */
      function setupForTesting();
      /**
       * `registerHelper` is used to register a test helper that will be injected when `App.injectTestHelpers` is called.
       */
      function registerHelper(name: string, helperMethod: Function, options: {});
      /**
       * `registerAsyncHelper` is used to register an async test helper that will be injected when `App.injectTestHelpers` is called.
       */
      function registerAsyncHelper(name: string, helperMethod: Function);
      /**
       * Remove a previously added helper method.
       */
      function unregisterHelper(name: string);
      /**
       * Used to register callbacks to be fired whenever `App.injectTestHelpers` is called.
       */
      function onInjectHelpers(callback: Function);
      /**
       * This returns a thenable tailored for testing.  It catches failed `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception` callback in the last chained then.
       */
      function promise(resolver: Function, label: string);
      /**
       * Used to allow ember-testing to communicate with a specific testing framework.
       */
      var adapter: any;
      /**
       * Replacement for `Ember.RSVP.resolve` The only difference is this uses an instance of `Ember.Test.Promise`
       */
      function resolve(The: any);
      /**
       * This allows ember-testing to play nicely with other asynchronous events, such as an application that is waiting for a CSS3 transition or an IndexDB transaction.
       */
      function registerWaiter(context: {}, callback: Function);
      /**
       * `unregisterWaiter` is used to unregister a callback that was registered with `registerWaiter`.
       */
      function unregisterWaiter(context: {}, callback: Function);
      /**
       * This property contains the testing helpers for the current application. These are created once you call `injectTestHelpers` on your `Ember.Application` instance. The included helpers are also available on the `window` object by default, but can be used from this object on the individual application also.
       */
      var testHelpers: {};
      /**
       * This property indicates whether or not this application is currently in testing mode. This is set when `setupForTesting` is called on the current application.
       */
      var testing: boolean;
      /**
       * This injects the test helpers into the `helperContainer` object. If an object is provided it will be used as the helperContainer. If `helperContainer` is not set it will default to `window`. If a function of the same name has already been defined it will be cached (so that it can be reset if the helper is removed with `unregisterHelper` or `removeTestHelpers`).
       */
      function injectTestHelpers();
      /**
       * This removes all helpers that have been registered, and resets and functions that were overridden by the helpers.
       */
      function removeTestHelpers();
      /**
       * The primary purpose of this class is to create hooks that can be implemented by an adapter for various test frameworks.
       */
      export class Adapter {
        /**
         * This callback will be called whenever an async operation is about to start.
         */
        asyncStart();
        /**
         * This callback will be called whenever an async operation has completed.
         */
        asyncEnd();
        /**
         * Override this method with your testing framework's false assertion. This function is called whenever an exception occurs causing the testing promise to fail.
         */
        exception(error: string);
      }
      /**
       * This class implements the methods defined by Ember.Test.Adapter for the QUnit testing framework.
       */
      export class QUnitAdapter extends Adapter {
      }
    }
    /**
     * `Ember.ControllerMixin` provides a standard interface for all classes that compose Ember's controller layer: `Ember.Controller`, `Ember.ArrayController`, and `Ember.ObjectController`.
     */
    export class ControllerMixin implements ActionHandler {
      /**
       * DEPRECATED: Use `Ember.inject.controller()` instead.
       * An array of other controller objects available inside instances of this controller via the `controllers` property:
       */
      needs: Ember.Array;
      /**
       * DEPRECATED: Use `needs` instead
       */
      controllerFor();
      /**
       * Stores the instances of other controllers available from within this controller. Any controller listed by name in the `needs` property will be accessible by name through this property.
       */
      controllers: {};
      /**
       * Defines which query parameters the controller accepts. If you give the names ['category','page'] it will bind the values of these query parameters to the variables `this.category` and `this.page`
       */
      queryParams: any;
      /**
       * Transition the application into another route. The route may be either a single route or route path:
       */
      transitionToRoute(name: string, ...models: any[]);
      transitionToRoute(name: string, options: {});
      /**
       * The controller's current model. When retrieving or modifying a controller's model, this property should be used instead of the `content` property.
       */
      model: any;
      /**
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * Triggers a named action on the `ActionHandler`. Any parameters supplied after the `actionName` string will be passed as arguments to the action target function.
       */
      send(actionName: string, context: any);
    }
    /**
     * An instance of `Ember.Application` is the starting point for every Ember application. It helps to instantiate, initialize and coordinate the many objects that make up your app.
     */
    export class Application extends Namespace {
      /**
       * The application instance's container. The container stores all of the instance-specific state for this application run.
       */
      container: Container;
      /**
       * The DOM events for which the event dispatcher should listen.
       */
      customEvents: {};
      /**
       * The root DOM element of the Application. This can be specified as an element or a [jQuery-compatible selector string](http://api.jquery.com/category/selectors/).
       */
      rootElement: DOMElement;
      /**
       * The `Ember.EventDispatcher` responsible for delegating events to this application's views.
       */
      eventDispatcher: EventDispatcher;
      /**
       * This creates a registry with the default Ember naming conventions.
       */
      static buildRegistry(namespace: Application): Registry;
      /**
       * Use this to defer readiness until some condition is true.
       */
      deferReadiness();
      /**
       * Call `advanceReadiness` after any asynchronous setup logic has completed. Each call to `deferReadiness` must be matched by a call to `advanceReadiness` or the application will never become ready and routing will not begin.
       */
      advanceReadiness();
      /**
       * Registers a factory that can be used for dependency injection (with `App.inject`) or for service lookup. Each factory is registered with a full name including two parts: `type:name`.
       */
      register(fullName: string, factory: Function, options: {});
      /**
       * Define a dependency injection onto a specific factory or all factories of a type.
       */
      inject(factoryNameOrType: string, property: string, injectionName: string);
      /**
       * Reset the application. This is typically used only in tests. It cleans up the application in the following order:
       */
      reset();
      /**
       * Set this to provide an alternate class to `Ember.DefaultResolver`
       */
      resolver: any;
      /**
       * Initializer receives an object which has the following attributes: `name`, `before`, `after`, `initialize`. The only required attribute is `initialize`, all others are optional.
       */
      initializer(initializer: {});
    }
    /**
     * The DefaultResolver defines the default lookup rules to resolve container lookups before consulting the container for registered items:
     */
    export class DefaultResolver extends Object {
      /**
       * This will be set to the Application instance when it is created.
       */
      namespace: any;
      /**
       * This method is called via the container's resolver method. It parses the provided `fullName` and then looks up and returns the appropriate template or class.
       */
      resolve(fullName: string): {};
      /**
       * Convert the string name of the form 'type:name' to a Javascript object with the parsed aspects of the name broken out.
       */
      parseName(fullName: string);
      /**
       * Returns a human-readable description for a fullName. Used by the Application namespace in assertions to describe the precise name of the class that Ember is looking for, rather than container keys.
       */
      lookupDescription(fullName: string);
      /**
       * Given a parseName object (output from `parseName`), apply the conventions expected by `Ember.Router`
       */
      useRouterNaming(parsedName: {});
      /**
       * Look up the template in Ember.TEMPLATES
       */
      resolveTemplate(parsedName: {});
      /**
       * Lookup the view using `resolveOther`
       */
      resolveView(parsedName: {});
      /**
       * Lookup the controller using `resolveOther`
       */
      resolveController(parsedName: {});
      /**
       * Lookup the route using `resolveOther`
       */
      resolveRoute(parsedName: {});
      /**
       * Lookup the model on the Application namespace
       */
      resolveModel(parsedName: {});
      /**
       * Look up the specified object (from parsedName) on the appropriate namespace (usually on the Application)
       */
      resolveHelper(parsedName: {});
      /**
       * Look up the specified object (from parsedName) on the appropriate namespace (usually on the Application)
       */
      resolveOther(parsedName: {});
    }
    /**
     * The `ContainerDebugAdapter` helps the container and resolver interface with tools that debug Ember such as the [Ember Extension](https://github.com/tildeio/ember-extension) for Chrome and Firefox.
     */
    export class ContainerDebugAdapter extends Object {
      /**
       * The container of the application being debugged. This property will be injected on creation.
       */
      container: any;
      /**
       * The resolver instance of the application being debugged. This property will be injected on creation.
       */
      resolver: any;
      /**
       * Returns true if it is possible to catalog a list of available classes in the resolver for a given type.
       */
      canCatalogEntriesByType(type: string): boolean;
      /**
       * Returns the available classes a given type.
       */
      catalogEntriesByType(type: string): Ember.Array;
    }
    /**
     * The `DataAdapter` helps a data persistence library interface with tools that debug Ember such as the [Ember Extension](https://github.com/tildeio/ember-extension) for Chrome and Firefox.
     */
    export class DataAdapter {
      /**
       * The container of the application being debugged. This property will be injected on creation.
       */
      container: any;
      /**
       * The container-debug-adapter which is used to list all models.
       */
      containerDebugAdapter: any;
      /**
       * Ember Data > v1.0.0-beta.18 requires string model names to be passed around instead of the actual factories.
       */
      acceptsModelName: any;
      /**
       * Specifies how records can be filtered. Records returned will need to have a `filterValues` property with a key for every name in the returned array.
       */
      getFilters(): Ember.Array;
      /**
       * Fetch the model types and observe them for changes.
       */
      watchModelTypes(typesAdded: Function, typesUpdated: Function): Function;
      /**
       * Fetch the records of a given type and observe them for changes.
       */
      watchRecords(modelName: string, recordsAdded: Function, recordsUpdated: Function, recordsRemoved: Function): Function;
    }
    /**
     * Defines string helper methods including string formatting and localization. Unless `Ember.EXTEND_PROTOTYPES.String` is `false` these methods will also be added to the `String.prototype` as well.
     */
    export class String {
      /**
       * Mark a string as safe for unescaped output with Handlebars. If you return HTML from a Handlebars helper, use this function to ensure Handlebars does not escape the HTML.
       */
      static htmlSafe(): Handlebars.SafeString;
      /**
       * Apply formatting options to the string. This will look for occurrences of "%@" in your string and substitute them with the arguments you pass into this method. If you want to control the specific order of replacement, you can add a number after the key as well to indicate which argument you want to insert.
       */
      fmt(str: string, formats: Ember.Array): string;
      /**
       * Formats the passed string, but first looks up the string in the localized strings hash. This is a convenient way to localize text. See `Ember.String.fmt()` for more information on formatting.
       */
      loc(str: string, formats: Ember.Array): string;
      /**
       * Splits a string into separate units separated by spaces, eliminating any empty strings in the process. This is a convenience method for split that is mostly useful when applied to the `String.prototype`.
       */
      w(str: string): Ember.Array;
      /**
       * Converts a camelized string into all lower case separated by underscores.
       */
      decamelize(str: string): string;
      /**
       * Replaces underscores, spaces, or camelCase with dashes.
       */
      dasherize(str: string): string;
      /**
       * Returns the lowerCamelCase form of a string.
       */
      camelize(str: string): string;
      /**
       * Returns the UpperCamelCase form of a string.
       */
      classify(str: string): string;
      /**
       * More general than decamelize. Returns the lower\_case\_and\_underscored form of a string.
       */
      underscore(str: string): string;
      /**
       * Returns the Capitalized form of a string
       */
      capitalize(str: string): string;
    }
    export class platform {
      /**
       * Identical to `Object.defineProperty()`. Implements as much functionality as possible if not available natively.
       */
      defineProperty(obj: {}, keyName: string, desc: {}): void;
    }
    /**
     * An `Ember.Binding` connects the properties of two objects so that whenever the value of one property changes, the other property will be changed also.
     */
    export class Binding {
      /**
       * This copies the Binding so it can be connected to another object.
       */
      copy(): Binding;
      /**
       * This will set `from` property path to the specified value. It will not attempt to resolve this property path to an actual object until you connect the binding.
       */
      from(path: string): Binding;
      /**
       * This will set the `to` property path to the specified value. It will not attempt to resolve this property path to an actual object until you connect the binding.
       */
      to(path: string|any[]): Binding;
      /**
       * Creates a new Binding instance and makes it apply in a single direction. A one-way binding will relay changes on the `from` side object (supplied as the `from` argument) the `to` side, but not the other way around. This means that if you change the "to" side directly, the "from" side may have a different value.
       */
      oneWay(from: string, flag: boolean): Binding;
      toString(): string;
      /**
       * Attempts to connect this binding instance so that it can receive and relay changes. This method will raise an exception if you have not set the from/to properties yet.
       */
      connect(obj: {}): Binding;
      /**
       * Disconnects the binding instance. Changes will no longer be relayed. You will not usually need to call this method.
       */
      disconnect(obj: {}): Binding;
    }
    /**
     * A computed property transforms an object's function into a property.
     */
    export class ComputedProperty {
      /**
       * DEPRECATED: All computed properties are cacheble by default. Use `volatile()` instead to opt-out to caching.
       * Properties are cacheable by default. Computed property will automatically cache the return value of your function until one of the dependent keys changes.
       */
      cacheable(aFlag: boolean): ComputedProperty;
      /**
       * Call on a computed property to set it into non-cached mode. When in this mode the computed property will not automatically cache the return value.
       */
      volatile(): ComputedProperty;
      /**
       * Call on a computed property to set it into read-only mode. When in this mode the computed property will throw an error when set.
       */
      readOnly(): ComputedProperty;
      /**
       * Sets the dependent keys on this computed property. Pass any number of arguments containing key paths that this computed property depends on.
       */
      property(path: string): ComputedProperty;
      /**
       * In some cases, you may want to annotate computed properties with additional metadata about how they function or what values they operate on. For example, computed property functions may close over variables that are then no longer available for introspection.
       */
      meta(meta: {});
      /**
       * Access the value of the function backing the computed property. If this property has already been cached, return the cached result. Otherwise, call the function passing the property name as an argument.
       */
      get(keyName: string): {};
      /**
       * Set the value of a computed property. If the function that backs your computed property does not accept arguments then the default action for setting would be to define the property on the current object, and set the value of the property to the value being set.
       */
      set(keyName: string, newValue: {}, oldValue: string): {};
    }
    /**
     * This helper returns a new property descriptor that wraps the passed computed property function. You can use this helper to define properties with mixins or via `Ember.defineProperty()`.
     */
    export class computed {
      /**
       * A computed property that returns true if the value of the dependent property is null, an empty string, empty array, or empty function.
       */
      empty(dependentKey: string): ComputedProperty;
      /**
       * A computed property that returns true if the value of the dependent property is NOT null, an empty string, empty array, or empty function.
       */
      notEmpty(dependentKey: string): ComputedProperty;
      /**
       * A computed property that returns true if the value of the dependent property is null or undefined. This avoids errors from JSLint complaining about use of ==, which can be technically confusing.
       */
      none(dependentKey: string): ComputedProperty;
      /**
       * A computed property that returns the inverse boolean value of the original value for the dependent property.
       */
      not(dependentKey: string): ComputedProperty;
      /**
       * A computed property that converts the provided dependent property into a boolean value.
       */
      bool(dependentKey: string): ComputedProperty;
      /**
       * A computed property which matches the original value for the dependent property against a given RegExp, returning `true` if they values matches the RegExp and `false` if it does not.
       */
      match(dependentKey: string, regexp: RegExp): ComputedProperty;
      /**
       * A computed property that returns true if the provided dependent property is equal to the given value.
       */
      equal(dependentKey: string, value: string|number|{}): ComputedProperty;
      /**
       * A computed property that returns true if the provided dependent property is greater than the provided value.
       */
      gt(dependentKey: string, value: number): ComputedProperty;
      /**
       * A computed property that returns true if the provided dependent property is greater than or equal to the provided value.
       */
      gte(dependentKey: string, value: number): ComputedProperty;
      /**
       * A computed property that returns true if the provided dependent property is less than the provided value.
       */
      lt(dependentKey: string, value: number): ComputedProperty;
      /**
       * A computed property that returns true if the provided dependent property is less than or equal to the provided value.
       */
      lte(dependentKey: string, value: number): ComputedProperty;
      /**
       * A computed property that performs a logical `and` on the original values for the provided dependent properties.
       */
      and(dependentKey: string): ComputedProperty;
      /**
       * A computed property which performs a logical `or` on the original values for the provided dependent properties.
       */
      or(dependentKey: string): ComputedProperty;
      /**
       * DEPRECATED: Use `Ember.computed.or` instead.
       * A computed property that returns the first truthy value from a list of dependent properties.
       */
      any(dependentKey: string): ComputedProperty;
      /**
       * A computed property that returns the array of values for the provided dependent properties.
       */
      collect(dependentKey: string): ComputedProperty;
      /**
       * Creates a new property that is an alias for another property on an object. Calls to `get` or `set` this property behave as though they were called on the original property.
       */
      alias(dependentKey: string): ComputedProperty;
      /**
       * Where `computed.alias` aliases `get` and `set`, and allows for bidirectional data flow, `computed.oneWay` only provides an aliased `get`. The `set` will not mutate the upstream property, rather causes the current property to become the value set. This causes the downstream property to permanently diverge from the upstream property.
       */
      oneWay(dependentKey: string): ComputedProperty;
      /**
       * This is a more semantically meaningful alias of `computed.oneWay`, whose name is somewhat ambiguous as to which direction the data flows.
       */
      reads(dependentKey: string): ComputedProperty;
      /**
       * Where `computed.oneWay` provides oneWay bindings, `computed.readOnly` provides a readOnly one way binding. Very often when using `computed.oneWay` one does not also want changes to propagate back up, as they will replace the value.
       */
      readOnly(dependentKey: string): ComputedProperty;
      /**
       * DEPRECATED: Use `Ember.computed.oneWay` or custom CP with default instead.
       * A computed property that acts like a standard getter and setter, but returns the value at the provided `defaultPath` if the property itself has not been set to a value
       */
      defaultTo(defaultPath: string): ComputedProperty;
      /**
       * Creates a new property that is an alias for another property on an object. Calls to `get` or `set` this property behave as though they were called on the original property, but also print a deprecation warning.
       */
      deprecatingAlias(dependentKey: string): ComputedProperty;
      /**
       * A computed property that returns the sum of the value in the dependent array.
       */
      sum(dependentKey: string): ComputedProperty;
      /**
       * A computed property that calculates the maximum value in the dependent array. This will return `-Infinity` when the dependent array is empty.
       */
      max(dependentKey: string): ComputedProperty;
      /**
       * A computed property that calculates the minimum value in the dependent array. This will return `Infinity` when the dependent array is empty.
       */
      min(dependentKey: string): ComputedProperty;
      /**
       * Returns an array mapped via the callback
       */
      map(dependentKey: string, callback: Function): ComputedProperty;
      /**
       * Returns an array mapped to the specified key.
       */
      mapBy(dependentKey: string, propertyKey: string): ComputedProperty;
      /**
       * DEPRECATED: Use `Ember.computed.mapBy` instead
       */
      mapProperty(dependentKey: any, propertyKey: any);
      /**
       * Filters the array by the callback.
       */
      filter(dependentKey: string, callback: Function): ComputedProperty;
      /**
       * Filters the array by the property and value
       */
      filterBy(dependentKey: string, propertyKey: string, value: any): ComputedProperty;
      /**
       * DEPRECATED: Use `Ember.computed.filterBy` instead
       */
      filterProperty(dependentKey: any, propertyKey: any, value: any);
      /**
       * A computed property which returns a new array with all the unique elements from one or more dependent arrays.
       */
      uniq(propertyKey: string): ComputedProperty;
      /**
       * Alias for [Ember.computed.uniq](/api/#method_computed_uniq).
       */
      union(propertyKey: string): ComputedProperty;
      /**
       * A computed property which returns a new array with all the duplicated elements from two or more dependent arrays.
       */
      intersect(propertyKey: string): ComputedProperty;
      /**
       * A computed property which returns a new array with all the properties from the first dependent array that are not in the second dependent array.
       */
      setDiff(setAProperty: string, setBProperty: string): ComputedProperty;
      /**
       * A computed property which returns a new array with all the properties from the first dependent array sorted based on a property or sort function.
       */
      sort(itemsKey: string, sortDefinition: string): ComputedProperty;
    }
    /**
     * The hash of enabled Canary features. Add to this, any canary features before creating your application.
     */
    export class FEATURES {
      /**
       * Determine whether the specified `feature` is enabled. Used by Ember's build tools to exclude experimental features from beta/stable builds.
       */
      isEnabled(feature: string): boolean;
    }
    /**
     * DEPRECATED:
     * Defines some convenience methods for working with Enumerables. `Ember.EnumerableUtils` uses `Ember.ArrayPolyfills` when necessary.
     */
    export class EnumerableUtils {
      /**
       * DEPRECATED: Use ES5's Array.prototype.map instead.
       * Calls the map function on the passed object with a specified callback. This uses `Ember.ArrayPolyfill`'s-map method when necessary.
       */
      map(obj: {}, callback: Function, thisArg: {}): Ember.Array;
      /**
       * DEPRECATED: Use ES5's Array.prototype.forEach instead.
       * Calls the forEach function on the passed object with a specified callback. This uses `Ember.ArrayPolyfill`'s-forEach method when necessary.
       */
      forEach(obj: {}, callback: Function, thisArg: {});
      /**
       * DEPRECATED: Use ES5's Array.prototype.filter instead.
       * Calls the filter function on the passed object with a specified callback. This uses `Ember.ArrayPolyfill`'s-filter method when necessary.
       */
      filter(obj: {}, callback: Function, thisArg: {}): Ember.Array;
      /**
       * DEPRECATED: Use ES5's Array.prototype.indexOf instead.
       * Calls the indexOf function on the passed object with a specified callback. This uses `Ember.ArrayPolyfill`'s-indexOf method when necessary.
       */
      indexOf(obj: {}, index: {});
      /**
       * DEPRECATED:
       * Returns an array of indexes of the first occurrences of the passed elements on the passed object.
       */
      indexesOf(obj: {}, elements: Ember.Array): Ember.Array;
      /**
       * DEPRECATED:
       * Adds an object to an array. If the array already includes the object this method has no effect.
       */
      addObject(array: Ember.Array, item: {}): void;
      /**
       * DEPRECATED:
       * Removes an object from an array. If the array does not contain the passed object this method has no effect.
       */
      removeObject(array: Ember.Array, item: {}): void;
      /**
       * DEPRECATED:
       * Replaces objects in an array with the passed objects.
       */
      replace(array: Ember.Array, idx: number, amt: number, objects: Ember.Array): Ember.Array;
      /**
       * DEPRECATED:
       * Calculates the intersection of two arrays. This method returns a new array filled with the records that the two passed arrays share with each other. If there is no intersection, an empty array will be returned.
       */
      intersection(array1: Ember.Array, array2: Ember.Array): Ember.Array;
    }
    /**
     * A subclass of the JavaScript Error object for use in Ember.
     */
    export class Error {
    }
    /**
     * Read-only property that returns the result of a container lookup.
     */
    export class InjectedProperty {
    }
    /**
     * The purpose of the Ember Instrumentation module is to provide efficient, general-purpose instrumentation for Ember.
     */
    export class Instrumentation {
    }
    /**
     * Inside Ember-Metal, simply uses the methods from `imports.console`. Override this to provide more robust logging functionality.
     */
    export class Logger {
    }
    /**
     * This class is used internally by Ember and Ember Data. Please do not use it at this time. We plan to clean it up and add many tests soon.
     */
    export class OrderedSet {
    }
    /**
     * A Map stores values indexed by keys. Unlike JavaScript's default Objects, the keys of a Map can be any JavaScript object.
     */
    export class Map {
    }
    export class MapWithDefault extends Map {
    }
    /**
     * The `Ember.Mixin` class allows you to create mixins, whose properties can be added to other classes. For instance,
     */
    export class Mixin {
      static create(args: any);
    }
    /**
     * Runs the passed target and method inside of a RunLoop, ensuring any deferred actions including bindings and views updates are flushed at the end.
     */
    export class run {
      /**
       * If no run-loop is present, it creates a new one. If a run loop is present it will queue itself to run on the existing run-loops action queue.
       */
      join(target: {}, method: Function|string, ...args: any[]): {};
      /**
       * Allows you to specify which context to call the specified function in while adding the execution of that function to the Ember run loop. This ability makes this method a great way to asynchronously integrate third-party libraries into your Ember application.
       */
      bind(target: {}, method: Function|string, ...args: any[]): Function;
      /**
       * Begins a new RunLoop. Any deferred actions invoked after the begin will be buffered until you invoke a matching call to `run.end()`. This is a lower-level way to use a RunLoop instead of using `run()`.
       */
      begin(): void;
      /**
       * Ends a RunLoop. This must be called sometime after you call `run.begin()` to flush any deferred actions. This is a lower-level way to use a RunLoop instead of using `run()`.
       */
      end(): void;
      /**
       * Adds the passed target/method and any optional arguments to the named queue to be executed at the end of the RunLoop. If you have not already started a RunLoop when calling this method one will be started for you automatically.
       */
      schedule(queue: string, target: {}, method: string|Function, ...args: any[]): void;
      /**
       * Invokes the passed target/method and optional arguments after a specified period of time. The last parameter of this method must always be a number of milliseconds.
       */
      later(target: {}, method: Function|string, ...args: any[]): any;
      later(target: {}, method: Function|string, wait: number): any;
      /**
       * Schedule a function to run one time during the current RunLoop. This is equivalent to calling `scheduleOnce` with the "actions" queue.
       */
      once(target: {}, method: Function|string, ...args: any[]): {};
      /**
       * Schedules a function to run one time in a given queue of the current RunLoop. Calling this method with the same queue/target/method combination will have no effect (past the initial call).
       */
      scheduleOnce(queue: string, target: {}, method: Function|string, ...args: any[]): {};
      /**
       * Schedules an item to run from within a separate run loop, after control has been returned to the system. This is equivalent to calling `run.later` with a wait time of 1ms.
       */
      next(target: {}, method: Function|string, ...args: any[]): {};
      /**
       * Cancels a scheduled item. Must be a value returned by `run.later()`, `run.once()`, `run.next()`, `run.debounce()`, or `run.throttle()`.
       */
      cancel(timer: {}): boolean;
      /**
       * Delay calling the target method until the debounce period has elapsed with no additional debounce calls. If `debounce` is called again before the specified time has elapsed, the timer is reset and the entire period must pass again before the target method is called.
       */
      debounce(target: {}, method: Function|string, ...args: any[]): Ember.Array;
      debounce(target: {}, method: Function|string, wait: number, immediate: boolean): Ember.Array;
      /**
       * Ensure that the target method is never called more frequently than the specified spacing period. The target method is called immediately.
       */
      throttle(target: {}, method: Function|string, ...args: any[]): Ember.Array;
      throttle(target: {}, method: Function|string, spacing: number, immediate: boolean): Ember.Array;
    }
    /**
     * Ember.Location returns an instance of the correct implementation of the `location` API.
     */
    export class Location {
    }
    /**
     * Ember.AutoLocation will select the best location option based off browser support with the priority order: history, hash, none.
     */
    export class AutoLocation {
    }
    /**
     * `Ember.HashLocation` implements the location API using the browser's hash. At present, it relies on a `hashchange` event existing in the browser.
     */
    export class HashLocation extends Object {
    }
    /**
     * Ember.HistoryLocation implements the location API using the browser's history.pushState API.
     */
    export class HistoryLocation extends Object {
    }
    /**
     * Ember.NoneLocation does not interact with the browser. It is useful for testing, or when you need to manage state with your Router, but temporarily don't want it to muck with the URL (for example when you embed your application in a larger page).
     */
    export class NoneLocation extends Object {
    }
    /**
     * The `Ember.Route` class is used to define individual routes. Refer to the [routing guide](http://emberjs.com/guides/routing/) for documentation.
     */
    export class Route extends Object implements ActionHandler, Evented {
      /**
       * Configuration hash for this route's queryParams. The possible configuration options and their defaults are as follows (assuming a query param whose controller property is `page`):
       */
      queryParams: {};
      /**
       * Retrieves parameters, for current route using the state.params variable and getQueryParamsFor, using the supplied routeName.
       */
      paramsFor(name: string);
      /**
       * A hook you can use to reset controller values either when the model changes or the route is exiting.
       */
      resetController(controller: Controller, isExiting: boolean, transition: {});
      /**
       * The name of the view to use by default when rendering this routes template.
       */
      viewName: string;
      /**
       * The name of the template to use by default when rendering this routes template.
       */
      templateName: string;
      /**
       * The name of the controller to associate with this route.
       */
      controllerName: string;
      /**
       * This hook is executed when the router completely exits this route. It is not executed when the model for the route changes.
       */
      deactivate();
      /**
       * This hook is executed when the router enters the route. It is not executed when the model for the route changes.
       */
      activate();
      /**
       * Transition the application into another route. The route may be either a single route or route path:
       */
      transitionTo(name: string, ...models: any[]): Transition;
      transitionTo(name: string, options: {}): Transition;
      /**
       * Refresh the model on this route and any child routes, firing the `beforeModel`, `model`, and `afterModel` hooks in a similar fashion to how routes are entered when transitioning in from other route. The current route params (e.g. `article_id`) will be passed in to the respective model hooks, and if a different model is returned, `setupController` and associated route hooks will re-fire as well.
       */
      refresh(): Transition;
      /**
       * Sends an action to the router, which will delegate it to the currently active route hierarchy per the bubbling rules explained under `actions`.
       */
      send(name: string, ...args: any[]);
      /**
       * This hook is the first of the route entry validation hooks called when an attempt is made to transition into a route or one of its children. It is called before `model` and `afterModel`, and is appropriate for cases when:
       */
      beforeModel(transition: Transition): Promise<any>;
      /**
       * This hook is called after this route's model has resolved. It follows identical async/promise semantics to `beforeModel` but is provided the route's resolved model in addition to the `transition`, and is therefore suited to performing logic that can only take place after the model has already resolved.
       */
      afterModel(resolvedModel: {}, transition: Transition): Promise<any>;
      /**
       * A hook you can implement to optionally redirect to another route.
       */
      redirect(model: {}, transition: Transition);
      /**
       * A hook you can implement to convert the URL into the model for this route.
       */
      model(params: {}, transition: Transition): {}|Promise<any>;
      /**
       * A hook you can implement to convert the route's model into parameters for the URL.
       */
      serialize(model: {}, params: Ember.Array): {};
      /**
       * A hook you can use to setup the controller for the current route.
       */
      setupController(controller: Controller, model: {});
      /**
       * Returns the controller for a particular route or name.
       */
      controllerFor(name: string): Controller;
      /**
       * Returns the model of a parent (or any ancestor) route in a route hierarchy.  During a transition, all routes must resolve a model object, and if a route needs access to a parent route's model in order to resolve a model (or just reuse the model from a parent), it can call `this.modelFor(theNameOfParentRoute)` to retrieve it.
       */
      modelFor(name: string): {};
      /**
       * `render` is used to render a template into a region of another template (indicated by an `{{outlet}}`). `render` is used both during the entry phase of routing (via the `renderTemplate` hook) and later in response to user interaction.
       */
      render(name: string, options: {});
      /**
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * Subscribes to a named event with given function.
       */
      on(name: string, target: {}, method: Function): void;
      /**
       * Subscribes a function to a named event and then cancels the subscription after the first time the event is triggered. It is good to use ``one`` when you only care about the first time an event has taken place.
       */
      one(name: string, target: {}, method: Function): void;
      /**
       * Triggers a named event for the object. Any additional arguments will be passed as parameters to the functions that are subscribed to the event.
       */
      trigger(name: string, ...args: any[]);
      /**
       * Cancels subscription for given name, target, and method.
       */
      off(name: string, target: {}, method: Function): void;
      /**
       * Checks to see if object has any subscriptions for named event.
       */
      has(name: string): boolean;
    }
    /**
     * The `Ember.Router` class manages the application state and URLs. Refer to the [routing guide](http://emberjs.com/guides/routing/) for documentation.
     */
    export class Router extends Object implements Evented {
      /**
       * The `location` property determines the type of URL's that your application will use.
       */
      location: any;
      /**
       * Represents the URL of the root of the application, often '/'. This prefix is assumed on all routes defined on this router.
       */
      rootURL: any;
      /**
       * The `Router.map` function allows you to define mappings from URLs to routes and resources in your application. These mappings are defined within the supplied callback function using `this.resource` and `this.route`.
       */
      map(callback: any);
      /**
       * Subscribes to a named event with given function.
       */
      on(name: string, target: {}, method: Function): void;
      /**
       * Subscribes a function to a named event and then cancels the subscription after the first time the event is triggered. It is good to use ``one`` when you only care about the first time an event has taken place.
       */
      one(name: string, target: {}, method: Function): void;
      /**
       * Triggers a named event for the object. Any additional arguments will be passed as parameters to the functions that are subscribed to the event.
       */
      trigger(name: string, ...args: any[]);
      /**
       * Cancels subscription for given name, target, and method.
       */
      off(name: string, target: {}, method: Function): void;
      /**
       * Checks to see if object has any subscriptions for named event.
       */
      has(name: string): boolean;
    }
    /**
     * `Ember.LinkComponent` renders an element whose `click` event triggers a transition of the application's instance of `Ember.Router` to a supplied route by name.
     */
    export class LinkComponent extends Component {
    }
    /**
     * A computed property whose dependent keys are arrays and which is updated with "one at a time" semantics.
     */
    export class ReduceComputedProperty extends ComputedProperty {
    }
    /**
     * DEPRECATED:
     * `Ember.ArrayController` provides a way for you to publish a collection of objects so that you can easily bind to the collection from a Handlebars `#each` helper, an `Ember.CollectionView`, or other controllers.
     */
    export class ArrayController extends ArrayProxy implements SortableMixin, ControllerMixin {
      /**
       * DEPRECATED:
       * __Required.__ You must implement this method to apply this mixin.
       */
      addObject(object: {}): {};
      /**
       * DEPRECATED:
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * DEPRECATED:
       * __Required.__ You must implement this method to apply this mixin.
       */
      removeObject(object: {}): {};
      /**
       * DEPRECATED:
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
      /**
       * DEPRECATED:
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
      /**
       * DEPRECATED: Use `Ember.inject.controller()` instead.
       * An array of other controller objects available inside instances of this controller via the `controllers` property:
       */
      needs: Ember.Array;
      /**
       * DEPRECATED: Use `needs` instead
       */
      controllerFor();
      /**
       * DEPRECATED:
       * Stores the instances of other controllers available from within this controller. Any controller listed by name in the `needs` property will be accessible by name through this property.
       */
      controllers: {};
      /**
       * DEPRECATED:
       * Defines which query parameters the controller accepts. If you give the names ['category','page'] it will bind the values of these query parameters to the variables `this.category` and `this.page`
       */
      queryParams: any;
      /**
       * DEPRECATED:
       * Transition the application into another route. The route may be either a single route or route path:
       */
      transitionToRoute(name: string, ...models: any[]);
      transitionToRoute(name: string, options: {});
      /**
       * DEPRECATED:
       * The controller's current model. When retrieving or modifying a controller's model, this property should be used instead of the `content` property.
       */
      model: any;
      /**
       * DEPRECATED:
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * DEPRECATED:
       * Triggers a named action on the `ActionHandler`. Any parameters supplied after the `actionName` string will be passed as arguments to the action target function.
       */
      send(actionName: string, context: any);
    }
    export class Controller extends Object implements ControllerMixin {
      /**
       * DEPRECATED: Use `Ember.inject.controller()` instead.
       * An array of other controller objects available inside instances of this controller via the `controllers` property:
       */
      needs: Ember.Array;
      /**
       * DEPRECATED: Use `needs` instead
       */
      controllerFor();
      /**
       * Stores the instances of other controllers available from within this controller. Any controller listed by name in the `needs` property will be accessible by name through this property.
       */
      controllers: {};
      /**
       * Defines which query parameters the controller accepts. If you give the names ['category','page'] it will bind the values of these query parameters to the variables `this.category` and `this.page`
       */
      queryParams: any;
      /**
       * Transition the application into another route. The route may be either a single route or route path:
       */
      transitionToRoute(name: string, ...models: any[]);
      transitionToRoute(name: string, options: {});
      /**
       * The controller's current model. When retrieving or modifying a controller's model, this property should be used instead of the `content` property.
       */
      model: any;
      /**
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * Triggers a named action on the `ActionHandler`. Any parameters supplied after the `actionName` string will be passed as arguments to the action target function.
       */
      send(actionName: string, context: any);
    }
    /**
     * Namespace for injection helper methods.
     */
    export class inject {
      /**
       * Creates a property that lazily looks up a service in the container. There are no restrictions as to what objects a service can be injected into.
       */
      service(name: string): InjectedProperty;
    }
    /**
     * DEPRECATED:
     * `Ember.ObjectController` is part of Ember's Controller layer. It is intended to wrap a single object, proxying unhandled attempts to `get` and `set` to the underlying model object, and to forward unhandled action attempts to its `target`.
     */
    export class ObjectController extends ObjectProxy implements ControllerMixin {
      /**
       * DEPRECATED: Use `Ember.inject.controller()` instead.
       * An array of other controller objects available inside instances of this controller via the `controllers` property:
       */
      needs: Ember.Array;
      /**
       * DEPRECATED: Use `needs` instead
       */
      controllerFor();
      /**
       * DEPRECATED:
       * Stores the instances of other controllers available from within this controller. Any controller listed by name in the `needs` property will be accessible by name through this property.
       */
      controllers: {};
      /**
       * DEPRECATED:
       * Defines which query parameters the controller accepts. If you give the names ['category','page'] it will bind the values of these query parameters to the variables `this.category` and `this.page`
       */
      queryParams: any;
      /**
       * DEPRECATED:
       * Transition the application into another route. The route may be either a single route or route path:
       */
      transitionToRoute(name: string, ...models: any[]);
      transitionToRoute(name: string, options: {});
      /**
       * DEPRECATED:
       * The controller's current model. When retrieving or modifying a controller's model, this property should be used instead of the `content` property.
       */
      model: any;
      /**
       * DEPRECATED:
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * DEPRECATED:
       * Triggers a named action on the `ActionHandler`. Any parameters supplied after the `actionName` string will be passed as arguments to the action target function.
       */
      send(actionName: string, context: any);
    }
    /**
     * `Ember.ProxyMixin` forwards all properties not defined by the proxy itself to a proxied `content` object.  See Ember.ObjectProxy for more details.
     */
    export class ProxyMixin {
    }
    /**
     * The `Ember.ActionHandler` mixin implements support for moving an `actions` property to an `_actions` property at extend time, and adding `_actions` to the object's mergedProperties list.
     */
    export class ActionHandler {
      /**
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * Triggers a named action on the `ActionHandler`. Any parameters supplied after the `actionName` string will be passed as arguments to the action target function.
       */
      send(actionName: string, context: any);
    }
    /**
     * This mixin implements Observer-friendly Array-like behavior. It is not a concrete implementation, but it can be used up by other classes that want to appear like arrays.
     */
    export class Array implements Enumerable {
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      length: number;
      /**
       * Returns the object at the given `index`. If the given `index` is negative or is greater or equal than the array length, returns `undefined`.
       */
      objectAt(idx: number): any;
      /**
       * This returns the objects at the specified indexes, using `objectAt`.
       */
      objectsAt(indexes: Ember.Array): Ember.Array;
      /**
       * This is the handler for the special array content property. If you get this property, it will return this. If you set this property to a new array, it will replace the current content.
       */
      '[]': any;
      /**
       * Returns a new array that is a slice of the receiver. This implementation uses the observable array methods to retrieve the objects for the new slice.
       */
      slice(beginIndex: number, endIndex: number): Ember.Array;
      /**
       * Returns the index of the given object's first occurrence. If no `startAt` argument is given, the starting location to search is 0. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      indexOf(object: {}, startAt: number): number;
      /**
       * Returns the index of the given object's last occurrence. If no `startAt` argument is given, the search starts from the last position. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      lastIndexOf(object: {}, startAt: number): number;
      /**
       * Adds an array observer to the receiving array. The array observer object normally must implement two methods:
       */
      addArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Removes an array observer from the object if the observer is current registered. Calling this method multiple times with the same object will have no effect.
       */
      removeArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Becomes true whenever the array currently has observers watching changes on the array.
       */
      hasArrayObservers: boolean;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just before the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentWillChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just after the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentDidChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * Returns a special object that can be used to observe individual properties on the array. Just get an equivalent property on this object and it will return an enumerable that maps automatically to the named key on the member objects.
       */
      '@each': any;
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
    }
    /**
     * Implements some standard methods for comparing objects. Add this mixin to any class you create that can compare its instances.
     */
    export class Comparable {
    }
    /**
     * Implements some standard methods for copying an object. Add this mixin to any object you create that can create a copy of itself. This mixin is added automatically to the built-in array.
     */
    export class Copyable {
    }
    export class Deferred {
    }
    /**
     * This mixin defines the common interface implemented by enumerable objects in Ember. Most of these methods follow the standard Array iteration API defined up to JavaScript 1.8 (excluding language-specific features that cannot be emulated in older versions of JavaScript).
     */
    export class Enumerable {
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
    }
    /**
     * This mixin allows for Ember objects to subscribe to and emit events.
     */
    export class Evented {
      /**
       * Subscribes to a named event with given function.
       */
      on(name: string, target: {}, method: Function): void;
      /**
       * Subscribes a function to a named event and then cancels the subscription after the first time the event is triggered. It is good to use ``one`` when you only care about the first time an event has taken place.
       */
      one(name: string, target: {}, method: Function): void;
      /**
       * Triggers a named event for the object. Any additional arguments will be passed as parameters to the functions that are subscribed to the event.
       */
      trigger(name: string, ...args: any[]);
      /**
       * Cancels subscription for given name, target, and method.
       */
      off(name: string, target: {}, method: Function): void;
      /**
       * Checks to see if object has any subscriptions for named event.
       */
      has(name: string): boolean;
    }
    /**
     * The `Ember.Freezable` mixin implements some basic methods for marking an object as frozen. Once an object is frozen it should be read only. No changes may be made the internal state of the object.
     */
    export class Freezable {
    }
    /**
     * This mixin defines the API for modifying array-like objects. These methods can be applied only to a collection that keeps its items in an ordered set. It builds upon the Array mixin and adds methods to modify the array. Concrete implementations of this class include ArrayProxy and ArrayController.
     */
    export class MutableArray implements Ember.Array, MutableEnumerable {
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      replace(idx: number, amt: number, objects: Ember.Array);
      /**
       * Remove all elements from the array. This is useful if you want to reuse an existing array without having to recreate it.
       */
      clear(): Ember.Array;
      /**
       * This will use the primitive `replace()` method to insert an object at the specified index.
       */
      insertAt(idx: number, object: {}): Ember.Array;
      /**
       * Remove an object at the specified index using the `replace()` primitive method. You can pass either a single index, or a start and a length.
       */
      removeAt(start: number, len: number): Ember.Array;
      /**
       * Push the object onto the end of the array. Works just like `push()` but it is KVO-compliant.
       */
      pushObject(obj: any): void;
      /**
       * Add the objects in the passed numerable to the end of the array. Defers notifying observers of the change until all objects are added.
       */
      pushObjects(objects: Enumerable): Ember.Array;
      /**
       * Pop object from array or nil if none are left. Works just like `pop()` but it is KVO-compliant.
       */
      popObject(): void;
      /**
       * Shift an object from start of array or nil if none are left. Works just like `shift()` but it is KVO-compliant.
       */
      shiftObject(): void;
      /**
       * Unshift an object to start of array. Works just like `unshift()` but it is KVO-compliant.
       */
      unshiftObject(obj: any): void;
      /**
       * Adds the named objects to the beginning of the array. Defers notifying observers until all objects have been added.
       */
      unshiftObjects(objects: Enumerable): Ember.Array;
      /**
       * Reverse objects in the array. Works just like `reverse()` but it is KVO-compliant.
       */
      reverseObjects(): Ember.Array;
      /**
       * Replace all the receiver's content with content of the argument. If argument is an empty array receiver will be cleared.
       */
      setObjects(objects: Ember.Array): Ember.Array;
      /**
       * Remove all occurrences of an object in the array.
       */
      removeObject(obj: any): Ember.Array;
      /**
       * Push the object onto the end of the array if it is not already present in the array.
       */
      addObject(obj: any): Ember.Array;
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      length: number;
      /**
       * Returns the object at the given `index`. If the given `index` is negative or is greater or equal than the array length, returns `undefined`.
       */
      objectAt(idx: number): any;
      /**
       * This returns the objects at the specified indexes, using `objectAt`.
       */
      objectsAt(indexes: Ember.Array): Ember.Array;
      /**
       * This is the handler for the special array content property. If you get this property, it will return this. If you set this property to a new array, it will replace the current content.
       */
      '[]': any;
      /**
       * Returns a new array that is a slice of the receiver. This implementation uses the observable array methods to retrieve the objects for the new slice.
       */
      slice(beginIndex: number, endIndex: number): Ember.Array;
      /**
       * Returns the index of the given object's first occurrence. If no `startAt` argument is given, the starting location to search is 0. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      indexOf(object: {}, startAt: number): number;
      /**
       * Returns the index of the given object's last occurrence. If no `startAt` argument is given, the search starts from the last position. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      lastIndexOf(object: {}, startAt: number): number;
      /**
       * Adds an array observer to the receiving array. The array observer object normally must implement two methods:
       */
      addArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Removes an array observer from the object if the observer is current registered. Calling this method multiple times with the same object will have no effect.
       */
      removeArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Becomes true whenever the array currently has observers watching changes on the array.
       */
      hasArrayObservers: boolean;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just before the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentWillChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just after the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentDidChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * Returns a special object that can be used to observe individual properties on the array. Just get an equivalent property on this object and it will return an enumerable that maps automatically to the named key on the member objects.
       */
      '@each': any;
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
      /**
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
    }
    /**
     * This mixin defines the API for modifying generic enumerables. These methods can be applied to an object regardless of whether it is ordered or unordered.
     */
    export class MutableEnumerable implements Enumerable {
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      addObject(object: {}): {};
      /**
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      removeObject(object: {}): {};
      /**
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
    }
    /**
     * ## Overview
     */
    export class Observable {
      /**
       * Retrieves the value of a property from the object.
       */
      get(keyName: string): {};
      /**
       * To get the values of multiple properties at once, call `getProperties` with a list of strings or an array:
       */
      getProperties(...list: string[]): {};
      /**
       * Sets the provided key or path to the value.
       */
      set(keyName: string, value: {}): Observable;
      /**
       * Sets a list of properties at once. These properties are set inside a single `beginPropertyChanges` and `endPropertyChanges` batch, so observers will be buffered.
       */
      setProperties(hash: {}): Observable;
      /**
       * Adds an observer on a property.
       */
      addObserver(key: string, target: {}, method: string|Function);
      /**
       * Remove an observer you have previously registered on this object. Pass the same key, target, and method you passed to `addObserver()` and your target will no longer receive notifications.
       */
      removeObserver(key: string, target: {}, method: string|Function);
      /**
       * Retrieves the value of a property, or a default value in the case that the property returns `undefined`.
       */
      getWithDefault(keyName: string, defaultValue: {}): {};
      /**
       * Set the value of a property to the current value plus some amount.
       */
      incrementProperty(keyName: string, increment: number): number;
      /**
       * Set the value of a property to the current value minus some amount.
       */
      decrementProperty(keyName: string, decrement: number): number;
      /**
       * Set the value of a boolean property to the opposite of its current value.
       */
      toggleProperty(keyName: string): boolean;
      /**
       * Returns the cached value of a computed property, if it exists. This allows you to inspect the value of a computed property without accidentally invoking it if it is intended to be generated lazily.
       */
      cacheFor(keyName: string): {};
    }
    /**
     * A low level mixin making ObjectProxy, ObjectController or ArrayControllers promise-aware.
     */
    export class PromiseProxyMixin {
      /**
       * If the proxied promise is rejected this will contain the reason provided.
       */
      reason: any;
      /**
       * Once the proxied promise has settled this will become `false`.
       */
      isPending: any;
      /**
       * Once the proxied promise has settled this will become `true`.
       */
      isSettled: any;
      /**
       * Will become `true` if the proxied promise is rejected.
       */
      isRejected: any;
      /**
       * Will become `true` if the proxied promise is fulfilled.
       */
      isFulfilled: any;
      /**
       * The promise whose fulfillment value is being proxied by this object.
       */
      promise: any;
      /**
       * An alias to the proxied promise's `then`.
       */
      then(callback: Function): RSVP.Promise<any>;
      /**
       * An alias to the proxied promise's `catch`.
       */
      catch(callback: Function): RSVP.Promise<any>;
      /**
       * An alias to the proxied promise's `finally`.
       */
      finally(callback: Function): RSVP.Promise<any>;
    }
    /**
     * `Ember.SortableMixin` provides a standard interface for array proxies to specify a sort order and maintain this sorting when objects are added, removed, or updated without changing the implicit order of their underlying model array:
     */
    export class SortableMixin implements MutableEnumerable {
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      addObject(object: {}): {};
      /**
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      removeObject(object: {}): {};
      /**
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
    }
    /**
     * `Ember.TargetActionSupport` is a mixin that can be included in a class to add a `triggerAction` method with semantics similar to the Handlebars `{{action}}` helper. In normal Ember usage, the `{{action}}` helper is usually the best choice. This mixin is most often useful when you are doing more complex event handling in View objects.
     */
    export class TargetActionSupport extends Mixin {
    }
    /**
     * An ArrayProxy wraps any other object that implements `Ember.Array` and/or `Ember.MutableArray,` forwarding all requests. This makes it very useful for a number of binding use cases or other cases where being able to swap out the underlying array is useful.
     */
    export class ArrayProxy extends Object implements MutableArray {
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      replace(idx: number, amt: number, objects: Ember.Array);
      /**
       * Remove all elements from the array. This is useful if you want to reuse an existing array without having to recreate it.
       */
      clear(): Ember.Array;
      /**
       * This will use the primitive `replace()` method to insert an object at the specified index.
       */
      insertAt(idx: number, object: {}): Ember.Array;
      /**
       * Remove an object at the specified index using the `replace()` primitive method. You can pass either a single index, or a start and a length.
       */
      removeAt(start: number, len: number): Ember.Array;
      /**
       * Push the object onto the end of the array. Works just like `push()` but it is KVO-compliant.
       */
      pushObject(obj: any): void;
      /**
       * Add the objects in the passed numerable to the end of the array. Defers notifying observers of the change until all objects are added.
       */
      pushObjects(objects: Enumerable): Ember.Array;
      /**
       * Pop object from array or nil if none are left. Works just like `pop()` but it is KVO-compliant.
       */
      popObject(): void;
      /**
       * Shift an object from start of array or nil if none are left. Works just like `shift()` but it is KVO-compliant.
       */
      shiftObject(): void;
      /**
       * Unshift an object to start of array. Works just like `unshift()` but it is KVO-compliant.
       */
      unshiftObject(obj: any): void;
      /**
       * Adds the named objects to the beginning of the array. Defers notifying observers until all objects have been added.
       */
      unshiftObjects(objects: Enumerable): Ember.Array;
      /**
       * Reverse objects in the array. Works just like `reverse()` but it is KVO-compliant.
       */
      reverseObjects(): Ember.Array;
      /**
       * Replace all the receiver's content with content of the argument. If argument is an empty array receiver will be cleared.
       */
      setObjects(objects: Ember.Array): Ember.Array;
      /**
       * Remove all occurrences of an object in the array.
       */
      removeObject(obj: any): Ember.Array;
      /**
       * Push the object onto the end of the array if it is not already present in the array.
       */
      addObject(obj: any): Ember.Array;
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      length: number;
      /**
       * Returns the object at the given `index`. If the given `index` is negative or is greater or equal than the array length, returns `undefined`.
       */
      objectAt(idx: number): any;
      /**
       * This returns the objects at the specified indexes, using `objectAt`.
       */
      objectsAt(indexes: Ember.Array): Ember.Array;
      /**
       * This is the handler for the special array content property. If you get this property, it will return this. If you set this property to a new array, it will replace the current content.
       */
      '[]': any;
      /**
       * Returns a new array that is a slice of the receiver. This implementation uses the observable array methods to retrieve the objects for the new slice.
       */
      slice(beginIndex: number, endIndex: number): Ember.Array;
      /**
       * Returns the index of the given object's first occurrence. If no `startAt` argument is given, the starting location to search is 0. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      indexOf(object: {}, startAt: number): number;
      /**
       * Returns the index of the given object's last occurrence. If no `startAt` argument is given, the search starts from the last position. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      lastIndexOf(object: {}, startAt: number): number;
      /**
       * Adds an array observer to the receiving array. The array observer object normally must implement two methods:
       */
      addArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Removes an array observer from the object if the observer is current registered. Calling this method multiple times with the same object will have no effect.
       */
      removeArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Becomes true whenever the array currently has observers watching changes on the array.
       */
      hasArrayObservers: boolean;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just before the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentWillChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just after the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentDidChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * Returns a special object that can be used to observe individual properties on the array. Just get an equivalent property on this object and it will return an enumerable that maps automatically to the named key on the member objects.
       */
      '@each': any;
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
      /**
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
    }
    export class CoreObject {
      /**
       * An overridable method called when objects are instantiated. By default, does nothing unless it is overridden during class definition.
       */
      init();
      /**
       * Defines the properties that will be concatenated from the superclass (instead of overridden).
       */
      concatenatedProperties: Ember.Array;
      /**
       * Destroyed object property flag.
       */
      isDestroyed: any;
      /**
       * Destruction scheduled flag. The `destroy()` method has been called.
       */
      isDestroying: any;
      /**
       * Destroys an object by setting the `isDestroyed` flag and removing its metadata, which effectively destroys observers and bindings.
       */
      destroy(): {};
      /**
       * Override to implement teardown.
       */
      willDestroy();
      /**
       * Returns a string representation which attempts to provide more information than Javascript's `toString` typically does, in a generic way for all Ember objects.
       */
      toString(): string;
      /**
       * Creates a new subclass.
       */
      static extend(mixins: Mixin, args: {});
      /**
       * Creates an instance of a class. Accepts either no arguments, or an object containing values to initialize the newly instantiated object with.
       */
      static create(args: any);
      /**
       * Augments a constructor's prototype with additional properties and functions:
       */
      reopen();
      /**
       * Augments a constructor's own properties and functions:
       */
      reopenClass();
    }
    /**
     * A Namespace is an object usually used to contain other objects or methods such as an application or framework. Create a namespace anytime you want to define one of these new containers.
     */
    export class Namespace extends Object {
    }
    /**
     * The NativeArray mixin contains the properties needed to make the native Array support Ember.MutableArray and all of its dependent APIs. Unless you have `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Array` set to false, this will be applied automatically. Otherwise you can apply the mixin at anytime by calling `Ember.NativeArray.activate`.
     */
    export class NativeArray implements MutableArray, Observable, Copyable {
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      replace(idx: number, amt: number, objects: Ember.Array);
      /**
       * Remove all elements from the array. This is useful if you want to reuse an existing array without having to recreate it.
       */
      clear(): Ember.Array;
      /**
       * This will use the primitive `replace()` method to insert an object at the specified index.
       */
      insertAt(idx: number, object: {}): Ember.Array;
      /**
       * Remove an object at the specified index using the `replace()` primitive method. You can pass either a single index, or a start and a length.
       */
      removeAt(start: number, len: number): Ember.Array;
      /**
       * Push the object onto the end of the array. Works just like `push()` but it is KVO-compliant.
       */
      pushObject(obj: any): void;
      /**
       * Add the objects in the passed numerable to the end of the array. Defers notifying observers of the change until all objects are added.
       */
      pushObjects(objects: Enumerable): Ember.Array;
      /**
       * Pop object from array or nil if none are left. Works just like `pop()` but it is KVO-compliant.
       */
      popObject(): void;
      /**
       * Shift an object from start of array or nil if none are left. Works just like `shift()` but it is KVO-compliant.
       */
      shiftObject(): void;
      /**
       * Unshift an object to start of array. Works just like `unshift()` but it is KVO-compliant.
       */
      unshiftObject(obj: any): void;
      /**
       * Adds the named objects to the beginning of the array. Defers notifying observers until all objects have been added.
       */
      unshiftObjects(objects: Enumerable): Ember.Array;
      /**
       * Reverse objects in the array. Works just like `reverse()` but it is KVO-compliant.
       */
      reverseObjects(): Ember.Array;
      /**
       * Replace all the receiver's content with content of the argument. If argument is an empty array receiver will be cleared.
       */
      setObjects(objects: Ember.Array): Ember.Array;
      /**
       * Remove all occurrences of an object in the array.
       */
      removeObject(obj: any): Ember.Array;
      /**
       * Push the object onto the end of the array if it is not already present in the array.
       */
      addObject(obj: any): Ember.Array;
      /**
       * __Required.__ You must implement this method to apply this mixin.
       */
      length: number;
      /**
       * Returns the object at the given `index`. If the given `index` is negative or is greater or equal than the array length, returns `undefined`.
       */
      objectAt(idx: number): any;
      /**
       * This returns the objects at the specified indexes, using `objectAt`.
       */
      objectsAt(indexes: Ember.Array): Ember.Array;
      /**
       * This is the handler for the special array content property. If you get this property, it will return this. If you set this property to a new array, it will replace the current content.
       */
      '[]': any;
      /**
       * Returns a new array that is a slice of the receiver. This implementation uses the observable array methods to retrieve the objects for the new slice.
       */
      slice(beginIndex: number, endIndex: number): Ember.Array;
      /**
       * Returns the index of the given object's first occurrence. If no `startAt` argument is given, the starting location to search is 0. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      indexOf(object: {}, startAt: number): number;
      /**
       * Returns the index of the given object's last occurrence. If no `startAt` argument is given, the search starts from the last position. If it's negative, will count backward from the end of the array. Returns -1 if no match is found.
       */
      lastIndexOf(object: {}, startAt: number): number;
      /**
       * Adds an array observer to the receiving array. The array observer object normally must implement two methods:
       */
      addArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Removes an array observer from the object if the observer is current registered. Calling this method multiple times with the same object will have no effect.
       */
      removeArrayObserver(target: {}, opts: {}): Ember.Array;
      /**
       * Becomes true whenever the array currently has observers watching changes on the array.
       */
      hasArrayObservers: boolean;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just before the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentWillChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * If you are implementing an object that supports `Ember.Array`, call this method just after the array content changes to notify any observers and invalidate any related properties. Pass the starting index of the change as well as a delta of the amounts to change.
       */
      arrayContentDidChange(startIdx: number, removeAmt: number, addAmt: number): Ember.Array;
      /**
       * Returns a special object that can be used to observe individual properties on the array. Just get an equivalent property on this object and it will return an enumerable that maps automatically to the named key on the member objects.
       */
      '@each': any;
      /**
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
      /**
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
      /**
       * Retrieves the value of a property from the object.
       */
      get(keyName: string): {};
      /**
       * To get the values of multiple properties at once, call `getProperties` with a list of strings or an array:
       */
      getProperties(...list: string[]): {};
      /**
       * Sets the provided key or path to the value.
       */
      set(keyName: string, value: {}): Observable;
      /**
       * Sets a list of properties at once. These properties are set inside a single `beginPropertyChanges` and `endPropertyChanges` batch, so observers will be buffered.
       */
      setProperties(hash: {}): Observable;
      /**
       * Adds an observer on a property.
       */
      addObserver(key: string, target: {}, method: string|Function);
      /**
       * Remove an observer you have previously registered on this object. Pass the same key, target, and method you passed to `addObserver()` and your target will no longer receive notifications.
       */
      removeObserver(key: string, target: {}, method: string|Function);
      /**
       * Retrieves the value of a property, or a default value in the case that the property returns `undefined`.
       */
      getWithDefault(keyName: string, defaultValue: {}): {};
      /**
       * Set the value of a property to the current value plus some amount.
       */
      incrementProperty(keyName: string, increment: number): number;
      /**
       * Set the value of a property to the current value minus some amount.
       */
      decrementProperty(keyName: string, decrement: number): number;
      /**
       * Set the value of a boolean property to the opposite of its current value.
       */
      toggleProperty(keyName: string): boolean;
      /**
       * Returns the cached value of a computed property, if it exists. This allows you to inspect the value of a computed property without accidentally invoking it if it is intended to be generated lazily.
       */
      cacheFor(keyName: string): {};
    }
    /**
     * `Ember.Object` is the main base class for all Ember objects. It is a subclass of `Ember.CoreObject` with the `Ember.Observable` mixin applied. For details, see the documentation for each of these.
     */
    export class Object extends CoreObject implements Observable {
      /**
       * Retrieves the value of a property from the object.
       */
      get(keyName: string): {};
      /**
       * To get the values of multiple properties at once, call `getProperties` with a list of strings or an array:
       */
      getProperties(...list: string[]): {};
      /**
       * Sets the provided key or path to the value.
       */
      set(keyName: string, value: {}): Observable;
      /**
       * Sets a list of properties at once. These properties are set inside a single `beginPropertyChanges` and `endPropertyChanges` batch, so observers will be buffered.
       */
      setProperties(hash: {}): Observable;
      /**
       * Adds an observer on a property.
       */
      addObserver(key: string, target: {}, method: string|Function);
      /**
       * Remove an observer you have previously registered on this object. Pass the same key, target, and method you passed to `addObserver()` and your target will no longer receive notifications.
       */
      removeObserver(key: string, target: {}, method: string|Function);
      /**
       * Retrieves the value of a property, or a default value in the case that the property returns `undefined`.
       */
      getWithDefault(keyName: string, defaultValue: {}): {};
      /**
       * Set the value of a property to the current value plus some amount.
       */
      incrementProperty(keyName: string, increment: number): number;
      /**
       * Set the value of a property to the current value minus some amount.
       */
      decrementProperty(keyName: string, decrement: number): number;
      /**
       * Set the value of a boolean property to the opposite of its current value.
       */
      toggleProperty(keyName: string): boolean;
      /**
       * Returns the cached value of a computed property, if it exists. This allows you to inspect the value of a computed property without accidentally invoking it if it is intended to be generated lazily.
       */
      cacheFor(keyName: string): {};
    }
    /**
     * `Ember.ObjectProxy` forwards all properties not defined by the proxy itself to a proxied `content` object.
     */
    export class ObjectProxy {
    }
    export class Service extends Object {
    }
    /**
     * DEPRECATED:
     * An unordered collection of objects.
     */
    export class Set extends CoreObject implements MutableEnumerable, Copyable, Freezable {
      /**
       * DEPRECATED:
       * __Required.__ You must implement this method to apply this mixin.
       */
      addObject(object: {}): {};
      /**
       * DEPRECATED:
       * Adds each object in the passed enumerable to the receiver.
       */
      addObjects(objects: Enumerable): {};
      /**
       * DEPRECATED:
       * __Required.__ You must implement this method to apply this mixin.
       */
      removeObject(object: {}): {};
      /**
       * DEPRECATED:
       * Removes each object in the passed enumerable from the receiver.
       */
      removeObjects(objects: Enumerable): {};
      /**
       * DEPRECATED:
       * Returns `true` if the passed property resolves to `true` for all items in the enumerable. This method is often simpler/faster than using a callback.
       */
      isEvery(key: string, value: string): boolean;
    }
    /**
     * An `Ember.SubArray` tracks an array in a way similar to, but more specialized than, `Ember.TrackedArray`.  It is useful for keeping track of the indexes of items within a filtered array.
     */
    export class SubArray {
    }
    /**
     * An `Ember.TrackedArray` tracks array operations.  It's useful when you want to lazily compute the indexes of items in an array after they've been shifted by subsequent operations.
     */
    export class TrackedArray {
    }
    export class _Metamorph {
    }
    export class _MetamorphView extends View implements _Metamorph {
    }
    /**
     * DEPRECATED:
     * `Ember.RenderBuffer` gathers information regarding the view and generates the final representation. `Ember.RenderBuffer` will generate HTML which can be pushed to the DOM.
     */
    export class RenderBuffer {
    }
    export class AriaRoleSupport {
      /**
       * The WAI-ARIA role of the control represented by this view. For example, a button may have a role of type 'button', or a pane may have a role of type 'alertdialog'. This property is used by assistive software to help visually challenged users navigate rich web applications.
       */
      ariaRole: string;
    }
    export class ClassNamesSupport {
      /**
       * Standard CSS class names to apply to the view's outer element. This property automatically inherits any class names defined by the view's superclasses as well.
       */
      classNames: Ember.Array;
      /**
       * A list of properties of the view to apply as class names. If the property is a string value, the value of that string will be applied as a class name.
       */
      classNameBindings: Ember.Array;
    }
    export class EmptyViewSupport {
    }
    export class InstrumentationSupport {
      /**
       * Used to identify this view during debugging
       */
      instrumentDisplay: string;
    }
    export class LegacyViewSupport {
    }
    export class TemplateRenderingSupport {
    }
    /**
     * `TextSupport` is a shared mixin used by both `Ember.TextField` and `Ember.TextArea`. `TextSupport` adds a number of methods that allow you to specify a controller action to invoke when a certain event is fired on your text field or textarea. The specifed controller action would get the current value of the field passed in as the only argument unless the value of the field is empty. In that case, the instance of the field itself is passed in as the only argument.
     */
    export class TextSupport extends Mixin implements TargetActionSupport {
    }
    /**
     * `Ember.ViewTargetActionSupport` is a mixin that can be included in a view class to add a `triggerAction` method with semantics similar to the Handlebars `{{action}}` helper. It provides intelligent defaults for the action's target: the view's controller; and the context that is sent with the action: the view's context.
     */
    export class ViewTargetActionSupport extends TargetActionSupport {
    }
    export class VisibilitySupport {
      /**
       * If `false`, the view will appear hidden in DOM.
       */
      isVisible: boolean;
    }
    /**
     * `Ember.EventDispatcher` handles delegating browser events to their corresponding `Ember.Views.` For example, when you click on a view, `Ember.EventDispatcher` ensures that that view's `mouseDown` method gets called.
     */
    export class EventDispatcher extends Object {
    }
    /**
     * The internal class used to create text inputs when the `{{input}}` helper is used with `type` of `checkbox`.
     */
    export class Checkbox extends View {
    }
    /**
     * `Ember.CollectionView` is an `Ember.View` descendent responsible for managing a collection (an array or array-like object) by maintaining a child view object and associated DOM representation for each item in the array and ensuring that child views and their associated rendered HTML are updated when items in the array are added, removed, or replaced.
     */
    export class CollectionView extends ContainerView implements EmptyViewSupport {
    }
    /**
     * An `Ember.Component` is a view that is completely isolated. Properties accessed in its templates go to the view object and actions are targeted at the view object. There is no access to the surrounding context or outer controller; all contextual information must be passed in.
     */
    export class Component extends View {
      /**
       * DEPRECATED:
       * A components template property is set by passing a block during its invocation. It is executed within the parent context.
       */
      template: any;
      /**
       * DEPRECATED:
       * Specifying a components `templateName` is deprecated without also providing the `layout` or `layoutName` properties.
       */
      templateName: any;
      /**
       * Triggers a named action on the controller context where the component is used if this controller has registered for notifications of the action.
       */
      sendAction(action: string, context: any);
      /**
       * Returns true when the component was invoked with a block template.
       */
      hasBlock: any;
      /**
       * Returns true when the component was invoked with a block parameter supplied.
       */
      hasBlockParams: any;
    }
    /**
     * A `ContainerView` is an `Ember.View` subclass that implements `Ember.MutableArray` allowing programmatic management of its child views.
     */
    export class ContainerView extends View {
    }
    /**
     * DEPRECATED: Use `Ember.View` instead.
     * `Ember.CoreView` is an abstract class that exists to give view-like behavior to both Ember's main view class `Ember.View` and other classes that don't need the fully functionaltiy of `Ember.View`.
     */
    export class CoreView extends Object implements Evented, ActionHandler {
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * Override the default event firing from `Ember.Evented` to also call methods with the given name.
       */
      trigger(name: string);
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * Subscribes to a named event with given function.
       */
      on(name: string, target: {}, method: Function): void;
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * Subscribes a function to a named event and then cancels the subscription after the first time the event is triggered. It is good to use ``one`` when you only care about the first time an event has taken place.
       */
      one(name: string, target: {}, method: Function): void;
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * Cancels subscription for given name, target, and method.
       */
      off(name: string, target: {}, method: Function): void;
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * Checks to see if object has any subscriptions for named event.
       */
      has(name: string): boolean;
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * The collection of functions, keyed by name, available on this `ActionHandler` as action targets.
       */
      actions: {};
      /**
       * DEPRECATED: Use `Ember.View` instead.
       * Triggers a named action on the `ActionHandler`. Any parameters supplied after the `actionName` string will be passed as arguments to the action target function.
       */
      send(actionName: string, context: any);
    }
    /**
     * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
     * The `Ember.Select` view class renders a [select](https://developer.mozilla.org/en/HTML/Element/select) HTML element, allowing the user to choose from a list of options.
     */
    export class Select extends View {
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The `multiple` attribute of the select element. Indicates whether multiple options can be selected.
       */
      multiple: boolean;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The `disabled` attribute of the select element. Indicates whether the element is disabled from interactions.
       */
      disabled: boolean;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The `required` attribute of the select element. Indicates whether a selected option is required for form validation.
       */
      required: boolean;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The list of options.
       */
      content: Ember.Array;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * When `multiple` is `false`, the element of `content` that is currently selected, if any.
       */
      selection: {};
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * In single selection mode (when `multiple` is `false`), value can be used to get the current selection's value or set the selection by its value.
       */
      value: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * If given, a top-most dummy option will be rendered to serve as a user prompt.
       */
      prompt: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The path of the option labels. See [content](/api/classes/Ember.Select.html#property_content).
       */
      optionLabelPath: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The path of the option values. See [content](/api/classes/Ember.Select.html#property_content).
       */
      optionValuePath: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The path of the option group. When this property is used, `content` should be sorted by `optionGroupPath`.
       */
      optionGroupPath: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-select
       * The view class for optgroup.
       */
      groupView: View;
    }
    /**
     * The internal class used to create textarea element when the `{{textarea}}` helper is used.
     */
    export class TextArea extends Component implements TextSupport {
    }
    /**
     * The internal class used to create text inputs when the `{{input}}` helper is used with `type` of `text`. See [Handlebars.helpers.input](/api/classes/Ember.Handlebars.helpers.html#method_input)  for usage details. ## Layout and LayoutName properties Because HTML `input` elements are self closing `layout` and `layoutName` properties will not be applied. See [Ember.View](/api/classes/Ember.View.html)'s layout section for more information.
     */
    export class TextField extends Component implements TextSupport {
      /**
       * The `value` attribute of the input element. As the user inputs text, this property is updated live.
       */
      value: string;
      /**
       * The `type` attribute of the input element.
       */
      type: string;
      /**
       * The `size` of the text field in characters.
       */
      size: string;
      /**
       * The `pattern` attribute of input element.
       */
      pattern: string;
      /**
       * The `min` attribute of input element used with `type="number"` or `type="range"`.
       */
      min: string;
      /**
       * The `max` attribute of input element used with `type="number"` or `type="range"`.
       */
      max: string;
    }
    /**
     * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
     * `Ember.View` is the class in Ember responsible for encapsulating templates of HTML content, combining templates with data to render as sections of a page's DOM, and registering and responding to user-initiated events.
     */
    export class View extends CoreView implements TemplateRenderingSupport, ClassNamesSupport, LegacyViewSupport, InstrumentationSupport, VisibilitySupport, AriaRoleSupport {
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Renders the view again. This will work regardless of whether the view is already in the DOM or not. If the view is in the DOM, the rendering process will be deferred to give bindings a chance to synchronize.
       */
      rerender();
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Returns the current DOM element for the view.
       */
      element: DOMElement;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Returns a jQuery object for this view's element. If you pass in a selector string, this method will return a jQuery object, using the current element as its buffer.
       */
      $(selector: string): JQuery;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * The HTML `id` of the view's element in the DOM. You can provide this value yourself but it must be unique (just as in HTML):
       */
      elementId: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Tag name for the view's outer element. The tag name is only used when an element is first created. If you change the `
       */

      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Normally, Ember's component model is "write-only". The component takes a bunch of attributes that it got passed in, and uses them to render its template.
       */
      readDOMAttr(name: string): void;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Standard CSS class names to apply to the view's outer element. This property automatically inherits any class names defined by the view's superclasses as well.
       */
      classNames: Ember.Array;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * A list of properties of the view to apply as class names. If the property is a string value, the value of that string will be applied as a class name.
       */
      classNameBindings: Ember.Array;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * Used to identify this view during debugging
       */
      instrumentDisplay: string;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * If `false`, the view will appear hidden in DOM.
       */
      isVisible: boolean;
      /**
       * DEPRECATED: See http://emberjs.com/deprecations/v1.x/#toc_ember-view
       * The WAI-ARIA role of the control represented by this view. For example, a button may have a role of type 'button', or a pane may have a role of type 'alertdialog'. This property is used by assistive software to help visually challenged users navigate rich web applications.
       */
      ariaRole: string;
    }
  }
  /**
   * A container used to instantiate and cache objects.
   */
  export class Container {
  }
  /**
   * A registry used to store factory and option information keyed by type.
   */
  export class Registry {
  }
  /**
   * Wraps an Handlebars helper with an HTMLBars helper for backwards compatibility.
   */
  export class HandlebarsCompatibleHelper {
  }
  export interface String {
    /**
     * Mark a string as being safe for unescaped output with Handlebars.
     */
    htmlSafe(): Handlebars.SafeString;
  }
  /**
   * Helper class that allows you to register your library with Ember.
   */
  export class Libraries {
  }
  export class Backburner {
  }
  /**
   * Objects of this type can implement an interface to respond to requests to get and set. The default implementation handles simple properties.
   */
  export class Descriptor {
  }
  /**
   * The Routing service is used by LinkComponent, and provides facilities for the component/view layer to interact with the router.
   */
  export class RoutingService {
  }
  export interface Function {
    /**
     * The `property` extension of Javascript's Function prototype is available when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is `true`, which is the default.
     */
    property();
    /**
     * The `observes` extension of Javascript's Function prototype is available when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is true, which is the default.
     */
    observes();
    /**
     * The `on` extension of Javascript's Function prototype is available when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is true, which is the default.
     */
    on();
  }
  /**
   * This is the object instance returned when you get the `@each` property on an array. It uses the unknownProperty handler to automatically create EachArray instances for property names.
   */
  export class EachProxy {
  }
  /**
   * An HTMLBars AST transformation that replaces all instances of {{bind-attr}} helpers with the equivalent HTMLBars-style bound attributes. For example
   */
  export class TransformBindAttrToAttributes {
  }
  /**
   * An HTMLBars AST transformation that replaces all instances of
   */
  export class TransformEachInToBlockParams {
  }
  /**
   * An HTMLBars AST transformation that replaces all instances of
   */
  export class TransformEachInToHash {
  }
  /**
   * An HTMLBars AST transformation that replaces all instances of
   */
  export class TransformInputOnToOnEvent {
  }
  /**
   * An HTMLBars AST transformation that replaces all instances of
   */
  export class TransformWithAsToHash {
  }
  export default Ember
}
